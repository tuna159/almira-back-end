import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EIsDelete, EPostType } from 'enum';
import { ErrorMessage } from 'enum/error';
import { VForgotPassword } from 'global/user/dto/forgotPassword.dto';
import { VLogin } from 'global/user/dto/login.dto';
import { VResetPassword } from 'global/user/dto/resetPassword.dto';
import { VSignUp } from 'global/user/dto/signup.dto';
import { User } from 'src/core/database/mysql/entity/user.entity';
import { AuthService } from 'src/core/global/auth/auth.service';
import {
  IPaginationQuery,
  IUserData,
} from 'src/core/interface/default.interface';
import { returnPostsImage } from 'src/helper/utils';
import { DeepPartial, EntityManager, Repository } from 'typeorm';
import { FollowService } from '../follow/follow.service';
import { VVerify } from 'global/user/dto/verifyPassword.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private authService: AuthService,
    private followService: FollowService,
  ) {}

  async signup(body: VSignUp) {
    return await this.authService.signup(body);
  }

  async login(body: VLogin) {
    return await this.authService.login(body);
  }

  async forgotPassword(body: VForgotPassword) {
    return await this.authService.forgotPassword(body);
  }

  async resetPassword(body: VResetPassword) {
    return await this.authService.resetPassword(body);
  }

  async verifyPassword(body: VVerify) {
    return await this.authService.verifyPassword(body);
  }

  async getUserByUserName(user_name: string, entityManager?: EntityManager) {
    const userRepository = entityManager
      ? entityManager.getRepository<User>('user')
      : this.userRepository;
    return await userRepository.findOne({
      where: {
        user_name,
        is_deleted: EIsDelete.NOT_DELETE,
      },
    });
  }

  async getUserByEmail(email: string, entityManager?: EntityManager) {
    const userRepository = entityManager
      ? entityManager.getRepository<User>('user')
      : this.userRepository;
    return await userRepository.findOne({
      where: {
        email,
        is_deleted: EIsDelete.NOT_DELETE,
      },
    });
  }

  async getUserByOtp(otp: number, entityManager?: EntityManager) {
    const userRepository = entityManager
      ? entityManager.getRepository<User>('user')
      : this.userRepository;
    return await userRepository.findOne({
      where: {
        OTP: otp,
        is_deleted: EIsDelete.NOT_DELETE,
      },
    });
  }

  async getUserByPhoneNumber(
    phone_number: string,
    entityManager?: EntityManager,
  ) {
    const userRepository = entityManager
      ? entityManager.getRepository<User>('user')
      : this.userRepository;

    return await userRepository.findOne({
      where: {
        phone_number: phone_number,
        is_deleted: EIsDelete.NOT_DELETE,
      },
    });
  }

  async getUser(entityManager?: EntityManager) {
    const userRepository = entityManager
      ? entityManager.getRepository<User>('user')
      : this.userRepository;
    return await userRepository.find();
  }

  async getUserByUserID(condition: object, entityManager?: EntityManager) {
    const userRepository = entityManager
      ? entityManager.getRepository<User>('user')
      : this.userRepository;
    return await userRepository.findOne(condition);
  }

  async getUserByUserId(userId: string, entityManager?: EntityManager) {
    const userRepository = entityManager
      ? entityManager.getRepository<User>('user')
      : this.userRepository;
    return await userRepository.findOne({
      where: {
        user_id: userId,
        is_deleted: EIsDelete.NOT_DELETE,
      },
    });
  }

  async createUser(body: DeepPartial<User>, entityManager?: EntityManager) {
    const userRepository = entityManager
      ? entityManager.getRepository<User>('user')
      : this.userRepository;

    return await userRepository.save(body);
  }

  async updateUser(
    user_id: string,
    body: DeepPartial<User>,
    entityManager?: EntityManager,
  ) {
    const userRepository = entityManager
      ? entityManager.getRepository<User>('user')
      : this.userRepository;
    return await userRepository.update({ user_id }, body);
  }

  async updateUserByPhoneNumber(
    phone_number: string,
    body: DeepPartial<User>,
    entityManager?: EntityManager,
  ) {
    const userRepository = entityManager
      ? entityManager.getRepository<User>('user')
      : this.userRepository;
    return await userRepository.update({ phone_number }, body);
  }

  async updateOTP(
    OTP: number,
    body: DeepPartial<User>,
    entityManager?: EntityManager,
  ) {
    const userRepository = entityManager
      ? entityManager.getRepository<User>('user')
      : this.userRepository;
    return await userRepository.update({ OTP }, body);
  }

  async findUserByUserId(userId: string, entityManager?: EntityManager) {
    const userRepository = entityManager
      ? entityManager.getRepository<User>('user')
      : this.userRepository;
    return await userRepository.findOne({
      where: {
        user_id: userId,
        is_deleted: EIsDelete.NOT_DELETE,
      },
      relations: ['userDetail', 'posts', 'user1s', 'user2s', 'posts.postImage'],
    });
  }

  async getUserDetailByID(
    user_id,
    userId: string,
    entityManager?: EntityManager,
  ) {
    const userRepository = entityManager
      ? entityManager.getRepository<User>('user')
      : this.userRepository;

    const matching = await this.followService.getMatchingUser(user_id);

    const post_type = [EPostType.PUBLIC];

    if (matching) post_type.push(EPostType.FRIEND);

    if (userId === user_id) post_type.push(EPostType.PRIVATE);

    const queryBuilder = userRepository
      .createQueryBuilder('user')
      .select()
      .leftJoinAndSelect('user.userDetail', 'userDetail')
      .leftJoinAndSelect('user.user1s', 'user1s')
      .leftJoinAndSelect('user.user2s', 'user2s')
      .leftJoinAndSelect(
        'user.posts',
        'posts',
        'posts.post_type IN (:post_type) AND posts.is_deleted = :is_deleted',
        {
          post_type: post_type,
          is_deleted: EIsDelete.NOT_DELETE,
        },
      )
      .leftJoinAndSelect('posts.postImage', 'postImage')
      .where('user.user_id = :userId', {
        userId: userId,
      })
      .andWhere('user.is_deleted = :is_deleted', {
        is_deleted: EIsDelete.NOT_DELETE,
      });

    // if (matching.length > 0) {
    //   queryBuilder.orWhere(
    //     'posts.user_id IN (:matching) AND posts.post_type = :postType',
    //     {
    //       matching,
    //       postType: EPostType.FRIEND,
    //     },
    //   );
    // }

    const user = queryBuilder.getOne();

    return user;
  }

  async getUserName(
    userData: IUserData,
    query: IPaginationQuery,
    entityManager?: EntityManager,
  ) {
    const userRepository = entityManager
      ? entityManager.getRepository<User>('user')
      : this.userRepository;
    let data = [];

    const queryBuilder = userRepository
      .createQueryBuilder('user')
      .select()
      .leftJoinAndSelect('user.userDetail', 'userDetail')
      .where('user.is_deleted = :is_deleted', {
        is_deleted: EIsDelete.NOT_DELETE,
      });

    if (query.search_key && query.search_key != '') {
      const searchKey = query.search_key.trim().toLowerCase();
      queryBuilder.andWhere('((LOWER(user.user_name) LIKE :searchKey))', {
        searchKey: `%${searchKey}%`,
      });
    }
    const [listUser] = await queryBuilder.getManyAndCount();
    data = listUser.map((user) => {
      return {
        user_id: user.user_id,
        user_name: user.user_name,
        image_url: user.userDetail.image_url,
      };
    });

    return data;
  }

  async getUserDetail(userData: IUserData, targetUserId: string) {
    const usercheck = await this.findUserByUserId(targetUserId);

    if (!usercheck) {
      throw new HttpException(
        ErrorMessage.USER_DOES_NOT_EXIST,
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = await this.getUserDetailByID(userData.user_id, targetUserId);

    const post = user.posts.map((post) => returnPostsImage(post));

    const data = {
      user_id: user?.user_id,
      user_name: user?.user_name,
      avatar: user?.userDetail?.image_url,
      introduction: user?.userDetail?.introduction,
      post_count: user.posts.length,
      post: post,
      followers: user.user2s.length,
      following: user.user1s.length,
      is_following: user.user2s
        ?.map((user2s) => user2s.user1_id)
        .includes(userData.user_id),
      total_points: user.total_points,
    };
    return data;
  }

  // async getToken(userData: IUserData) {
  //   return await this.authService.getToken(userData);
  // }

  async followUser(userData: IUserData, user_id: string) {
    const user = await this.findUserByUserId(user_id);

    if (!user) {
      throw new HttpException(
        ErrorMessage.USER_DOES_NOT_EXIST,
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.followService.followUser(userData, user_id);
  }

  async unFollowUser(userData: IUserData, user_id: string) {
    const user = await this.findUserByUserId(user_id);

    if (!user) {
      throw new HttpException(
        ErrorMessage.USER_DOES_NOT_EXIST,
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.followService.unFollowUser(userData, user_id);
  }

  async unFollowerUser(userData: IUserData, user_id: string) {
    const user = await this.findUserByUserId(user_id);

    if (!user) {
      throw new HttpException(
        ErrorMessage.USER_DOES_NOT_EXIST,
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.followService.unFollowerUser(userData, user_id);
  }

  async getUserPoint(userData: IUserData, entityManager?: EntityManager) {
    const userRepository = entityManager
      ? entityManager.getRepository<User>('m_user')
      : this.userRepository;

    const query = userRepository
      .createQueryBuilder('user')
      .select('user.total_points')
      .orderBy('user.total_points', 'DESC');

    const total_points = await query.getMany();

    return {
      total_points: userData.total_points,
      total_users: total_points.length,
    };
  }

  async getUserPasswordById(user_id: string, entityManager?: EntityManager) {
    const userRepository = entityManager
      ? entityManager.getRepository<User>('user')
      : this.userRepository;
    return await userRepository.findOne({
      select: ['user_id', 'password'],
      where: {
        user_id,
        is_deleted: EIsDelete.NOT_DELETE,
      },
    });
  }
}
