import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EIsDelete } from 'enum';
import { ErrorMessage } from 'enum/error';
import { Following } from 'src/core/database/mysql/entity/following.entity';
import { IUserData } from 'src/core/interface/default.interface';
import { DeepPartial, EntityManager, Repository } from 'typeorm';
import { In } from 'typeorm/find-options/operator/In';
@Injectable()
export class FollowService {
  constructor(
    @InjectRepository(Following)
    private followRepository: Repository<Following>,
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
    await this.deleteUserFollow({ user2_id: user_id });
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

  async recommendFriends(user_id: string, entityManager?: EntityManager) {
    const followingRepository = entityManager
      ? entityManager.getRepository<Following>('following')
      : this.followRepository;

    let data = [];

    const Afollow = await followingRepository.find({
      select: ['user2_id'],
      where: { user1_id: user_id },
    });

    const AfollowIds = Afollow.map((e) => e.user2_id);

    const recommend = await followingRepository.find({
      select: ['user2_id'],
      where: { user1_id: In(AfollowIds) },
    });

    const rcFriends = recommend.map((e) => {
      return e.user2_id;
    });

    const matching = await this.getMatchingUser(user_id);

    const queryBuilder = followingRepository
      .createQueryBuilder('following')
      .select()
      .leftJoinAndSelect('following.user2', 'user2')
      .leftJoinAndSelect('following.user1', 'user1')
      .leftJoinAndSelect('user2.userDetail', 'userDetail')
      .groupBy('following.user2_id');
    if (rcFriends.length > 0) {
      queryBuilder.where('following.user2_id IN (:user2_id)', {
        user2_id: rcFriends,
      });
    }
    if (matching.length > 0) {
      queryBuilder.where('following.user2_id NOT IN (:user2_id)', {
        user2_id: matching,
      });
    }

    const [listUser] = await queryBuilder.getManyAndCount();

    console.log(matching);

    data = listUser.map((following) => {
      return {
        user_id: following.user2.user_id,
        nick_name: following.user2.user_name,
        avatar: following.user2.userDetail.image_url,
      };
    });
    return data;
  }
}
