import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EIsDelete } from 'enum';
import { ErrorMessage } from 'enum/error';
import { User } from 'src/core/database/mysql/entity/user.entity';
import { IUserData } from 'src/core/interface/default.interface';
import { returnPostsImage } from 'src/helper/utils';
import { EntityManager } from 'typeorm/entity-manager/EntityManager';
import { Repository } from 'typeorm/repository/Repository';
import { UserBlockingService } from '../user-blocking/user-blocking.service';
import { UserVoucherService } from '../user-voucher/user-voucher.service';
import { UserService } from '../user/user.service';

@Injectable()
export class MeService {
  constructor(
    @InjectRepository(User)
    private meRepository: Repository<User>,
    private userService: UserService,
    private userBlockingService: UserBlockingService,
    private userVoucherService: UserVoucherService,
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
}
