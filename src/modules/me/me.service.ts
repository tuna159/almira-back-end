import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EIsDelete } from 'enum';
import { ErrorMessage } from 'enum/error';
import { VUpdateProfile } from 'global/user/dto/update-profile.dto';
import { User } from 'src/core/database/mysql/entity/user.entity';
import { UserDetail } from 'src/core/database/mysql/entity/userDetail.entity';
import { IUserData } from 'src/core/interface/default.interface';
import {
  handleBCRYPTCompare,
  handleBCRYPTHash,
  returnPostsImage,
} from 'src/helper/utils';
import { Connection } from 'typeorm';
import { EntityManager } from 'typeorm/entity-manager/EntityManager';
import { Repository } from 'typeorm/repository/Repository';
import { UserBlockingService } from '../user-blocking/user-blocking.service';
import { UserDetailService } from '../user-detail/user-detail.service';
import { UserVoucherService } from '../user-voucher/user-voucher.service';
import { UserService } from '../user/user.service';
import { AuthService } from 'src/core/global/auth/auth.service';
import { VUpdatePassword } from 'global/user/dto/updatePassword.dto';
import { FollowService } from '../follow/follow.service';

@Injectable()
export class MeService {
  constructor(
    @InjectRepository(User)
    private meRepository: Repository<User>,
    private userService: UserService,
    private userBlockingService: UserBlockingService,
    private userVoucherService: UserVoucherService,
    private connection: Connection,
    private userDetailService: UserDetailService,
    private authService: AuthService,
    private followingService: FollowService,
  ) {}

  async getMe(userData: IUserData, entityManager?: EntityManager) {
    const meRepository = entityManager
      ? entityManager.getRepository<User>('user')
      : this.meRepository;

    const queryBuilder = meRepository
      .createQueryBuilder('user')
      .select()
      .innerJoinAndSelect('user.posts', 'post')
      .leftJoinAndSelect('user.userDetail', 'userDetail')
      .leftJoinAndSelect('post.postImage', 'postImage')
      .where('post.is_deleted = :is_deleted', {
        is_deleted: EIsDelete.NOT_DELETE,
      })
      .where('user.user_id = :user_id', {
        user_id: userData.user_id,
      })
      .orderBy('post.created_at', 'DESC');

    const user = await queryBuilder.getOne();

    const image = user.posts.map((post) => returnPostsImage(post));

    const myUserData = {
      user_id: user.user_id,
      user_name: user.user_name,
      image_url: user.userDetail.image_url,
      introduction: user.userDetail.introduction,
      post_count: user.posts.length,
      image: image,
    };
    return myUserData;
  }

  async blockUser(blocked_on_id: string, userData: IUserData) {
    if (blocked_on_id === userData.user_id) {
      throw new HttpException(ErrorMessage.NOT_BLOCKED, HttpStatus.BAD_REQUEST);
    }
    const isExist = await this.userService.getUserByUserId(blocked_on_id);

    if (!isExist) {
      throw new HttpException(
        ErrorMessage.USER_DOES_NOT_EXIST,
        HttpStatus.BAD_REQUEST,
      );
    }

    const isExistBlocks = await this.userBlockingService.checkBlocking(
      blocked_on_id,
      userData.user_id,
    );

    if (isExistBlocks) {
      throw new HttpException(
        ErrorMessage.USER_HAS_BEEN_BLOCKED,
        HttpStatus.CONFLICT,
      );
    }
    await this.userBlockingService.blockUser(blocked_on_id, userData.user_id);
    await this.followingService.deleteUserFollow({
      user1_id: userData.user_id,
      user2_id: blocked_on_id,
    });
    return null;
  }

  async redeemVoucher(userData: IUserData, voucher_id: number) {
    const isExist = await this.userService.getUserByUserId(userData.user_id);

    if (!isExist) {
      throw new HttpException(
        ErrorMessage.USER_DOES_NOT_EXIST,
        HttpStatus.BAD_REQUEST,
      );
    }

    return await this.userVoucherService.redeemVoucher(
      userData.user_id,
      voucher_id,
    );
  }

  async updateProfile(userData: IUserData, body: VUpdateProfile) {
    await this.connection.transaction(async (manager) => {
      // user table
      const userParams = new User();
      userParams.user_name = body.user_name;

      // userDetails table
      const userDetailParams = new UserDetail();
      userDetailParams.introduction = body?.introduction;

      userDetailParams.image_url = body?.image_url;

      Object.keys(userDetailParams).forEach(
        (key) =>
          userDetailParams[key] === undefined && delete userDetailParams[key],
      );

      await Promise.all([
        Object.keys(userDetailParams).length
          ? this.userDetailService.updateUserDetail(
              { user_id: userData.user_id },
              userDetailParams,
              manager,
            )
          : null,

        this.userService.updateUser(userData.user_id, userParams, manager),
      ]);
    });
    return null;
  }

  async handleLogout(token: string, userId: string) {
    await this.authService.logout(token, userId);
    return null;
  }

  async updateProfilePassword(user_id: string, body: VUpdatePassword) {
    await this.connection.transaction(async (entityManager) => {
      const user = await this.userService.getUserPasswordById(
        user_id,
        entityManager,
      );

      const isPasswordHash = await handleBCRYPTCompare(
        body.oldPassword,
        user.password,
      );

      if (!isPasswordHash)
        throw new HttpException(
          ErrorMessage.PASSWORD_INCORRECT,
          HttpStatus.BAD_REQUEST,
        );

      await this.userService.updateUser(
        user_id,
        {
          password: await handleBCRYPTHash(body.newPassword),
        },
        entityManager,
      );
    });

    return true;
  }

  async recommendFriends(user_id: string) {
    return this.followingService.recommendFriends(user_id);
  }

  async unBlockUser(blocked_on_id: string, userData: IUserData) {
    const user = await this.userService.findUserByUserId(blocked_on_id);

    if (!user) {
      throw new HttpException(
        ErrorMessage.USER_DOES_NOT_EXIST,
        HttpStatus.BAD_REQUEST,
      );
    }

    const blocking = await this.userBlockingService.checkBlocking(
      blocked_on_id,
      userData.user_id,
    );

    if (!blocking) {
      throw new HttpException(ErrorMessage.NOT_BLOCKED, HttpStatus.BAD_REQUEST);
    }

    await this.userBlockingService.unBlockUser(blocked_on_id, userData.user_id);
    return null;
  }
}
