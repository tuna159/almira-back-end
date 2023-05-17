import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EIsDelete } from 'enum';
import { ErrorMessage } from 'enum/error';
import { Following } from 'src/core/database/mysql/entity/following.entity';
import { User } from 'src/core/database/mysql/entity/user.entity';
import { IUserData } from 'src/core/interface/default.interface';
import { DeepPartial, EntityManager, Not, Repository } from 'typeorm';
import { In } from 'typeorm/find-options/operator/In';
@Injectable()
export class FollowService {
  constructor(
    @InjectRepository(Following)
    private followRepository: Repository<Following>,

    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async followUser(
    userData: IUserData,
    user_id: string,
    entityManager?: EntityManager,
  ) {
    const isExist = await this.checkAccess(user_id, userData.user_id);

    if (isExist) {
      throw new HttpException(
        ErrorMessage.FOLLOW_USER_EXIST,
        HttpStatus.CONFLICT,
      );
    }

    const followingRepository = entityManager
      ? entityManager.getRepository<Following>('following')
      : this.followRepository;

    const followingParam = new Following();
    followingParam.user1_id = userData.user_id;
    followingParam.user2_id = user_id;
    followingParam.is_deleted = EIsDelete.NOT_DELETE;
    followingParam.following_datetime = new Date();

    return followingRepository.save(followingParam);
  }

  async unFollowerUser(userData: IUserData, user_id: string) {
    await this.deleteUserFollow({
      user1_id: user_id,
      user2_id: userData.user_id,
    });
    return;
  }

  async unFollowUser(userData: IUserData, user_id: string) {
    await this.deleteUserFollow({
      user1_id: userData.user_idl,
      user2_id: user_id,
    });
    return;
  }

  async deleteUserFollow(
    conditions: DeepPartial<Following>,
    entityManager?: EntityManager,
  ) {
    const followingRepository = entityManager
      ? entityManager.getRepository<Following>('following')
      : this.followRepository;
    return followingRepository.delete(conditions);
  }

  async checkAccess(
    user_id: string,
    user1_id: string,
    entityManager?: EntityManager,
  ) {
    const followingRepository = entityManager
      ? entityManager.getRepository<Following>('following')
      : this.followRepository;
    const following = await followingRepository.findOne({
      user2_id: user_id,
      user1_id: user1_id,
    });

    if (following) {
      return true;
    } else {
      return false;
    }
  }

  async getFollowing(
    userData: IUserData,
    user_id: string,
    entityManager?: EntityManager,
  ) {
    const followingRepository = entityManager
      ? entityManager.getRepository<Following>('following')
      : this.followRepository;

    let data = [];

    const queryBuilder = followingRepository
      .createQueryBuilder('following')
      .select()
      .leftJoinAndSelect('following.user2', 'user2')
      .leftJoinAndSelect('following.user1', 'user1')
      .leftJoinAndSelect('user2.userDetail', 'userDetail')
      .where('following.user1_id = :user1_id', { user1_id: user_id });

    const [listUser] = await queryBuilder.getManyAndCount();

    data = listUser.map((following) => {
      console.log(following.user1.user_id);
      console.log(userData.user_id);

      return {
        user_id: following.user2.user_id,
        nick_name: following.user2.user_name,
        avatar: following.user2.userDetail.image_url,

        is_following: following.user1_id == userData.user_id ? true : false,
      };
    });

    return data;
  }

  async getFollower(
    userData: IUserData,
    user_id: string,
    entityManager?: EntityManager,
  ) {
    const followingRepository = entityManager
      ? entityManager.getRepository<Following>('following')
      : this.followRepository;

    let data = [];

    const queryBuilder = followingRepository
      .createQueryBuilder('following')
      .select()
      .leftJoinAndSelect('following.user1', 'user1')
      .leftJoinAndSelect('user1.userDetail', 'userDetail')
      .where('following.user2 = :user2', { user2: user_id });

    const [listUser] = await queryBuilder.getManyAndCount();

    data = listUser.map((following) => {
      return {
        user_id: following.user1.user_id,
        nick_name: following.user1.user_name,
        avatar: following.user1.userDetail.image_url,
        is_following: following.user2_id == userData.user_id ? true : false,
      };
    });
    return data;
  }

  async getMatchingUser(user_id: string, entityManager?: EntityManager) {
    const followingRepository = entityManager
      ? entityManager.getRepository<Following>('following')
      : this.followRepository;

    const data = await followingRepository.find({
      where: {
        user1_id: user_id,
      },
    });

    return data.map((e) => {
      return e.user2_id;
    });
  }

  async getMatchedUser(
    user_id: string,
    uid: string,
    entityManager?: EntityManager,
  ) {
    const followingRepository = entityManager
      ? entityManager.getRepository<Following>('following')
      : this.followRepository;

    const data = await followingRepository.find({
      where: {
        user1_id: user_id,
        user2_id: uid,
      },
    });

    return data;
  }

  async recommendFriends(user_id: string, entityManager?: EntityManager) {
    const followingRepository = entityManager
      ? entityManager.getRepository<Following>('following')
      : this.followRepository;

    // let data = [];

    const Allfollowing = await followingRepository.find({
      select: ['user2_id'],
      where: { user1_id: user_id },
    });

    const AllfollowingIds = Allfollowing.map((e) => e.user2_id).filter(
      (uid) => uid !== user_id,
    );

    console.log(AllfollowingIds, 'AllfollowingIds');

    const recommend = await followingRepository.find({
      select: ['user2_id'],
      where: { user1_id: In(AllfollowingIds), user2_id: Not(user_id) },
    });

    const rcFriends = recommend.map((e) => {
      return e.user2_id;
    });

    console.log(rcFriends, 'rcFriends');

    const matching = await this.getMatchingUser(user_id);

    console.log(matching, 'matching');

    const as = rcFriends.filter((re) => !matching.includes(re));

    const u = await this.userRepository.find({
      where: {
        user_id: In(as),
      },
      relations: ['userDetail'],
    });

    const notMatching = await this.userRepository.find({
      where: {
        user_id: Not(user_id),
      },
      relations: ['userDetail'],
    });

    const notm = notMatching.map((e) => {
      return {
        user_id: e.user_id,
        nick_name: e.user_name,
        avatar: e.userDetail.image_url,
      };
    });

    const ud = u.map((e) => {
      return {
        user_id: e.user_id,
        nick_name: e.user_name,
        avatar: e.userDetail.image_url,
      };
    });

    return ud;
    // console.log(rcFriends, 3333333333);

    // const queryBuilder = followingRepository
    //   .createQueryBuilder('following')
    //   .select()
    //   .leftJoinAndSelect('following.user2', 'user2')
    //   .leftJoinAndSelect('following.user1', 'user1')
    //   .leftJoinAndSelect('user2.userDetail', 'userDetail')
    //   .groupBy('following.user1_id');
    // if (rcFriends.length > 0) {
    //   queryBuilder
    //     .where('following.user1_id IN (:user2_id)', {
    //       user2_id: rcFriends,
    //     })
    //     .where('following.user2_id NOT IN (:user_id)', {
    //       user_id: user_id,
    //     });
    // }
    // if (matching.length > 0) {
    //   queryBuilder.where('following.user2_id NOT IN (:user2_id)', {
    //     user2_id: matching,
    //   });
    // }

    // const listUser = await queryBuilder.getMany();

    // // console.log(matching);

    // // const matched = [];

    // // const recommend = [];

    // const dataa = rcFriends.filter((re) => !matching.includes(user_id));

    // console.log(dataa);

    // data = listUser.map((following) => {
    //   return {
    //     user_id: following.user2.user_id,
    //     nick_name: following.user2.user_name,
    //     avatar: following.user2.userDetail.image_url,
    //   };
    // });
    // return data;
  }
}
