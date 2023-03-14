import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EIsDelete } from 'enum';
import { ErrorMessage } from 'enum/error';
import { Following } from 'src/core/database/mysql/entity/following.entity';
import { IUserData } from 'src/core/interface/default.interface';
import { DeepPartial, EntityManager, Repository } from 'typeorm';

@Injectable()
export class FollowingService {
  constructor(
    @InjectRepository(Following)
    private followingRepository: Repository<Following>,
  ) {}

  async followUser(
    userData: IUserData,
    user_id: string,
    entityManager?: EntityManager,
  ) {
    const isExist = await this.checkAccess(user_id);

    if (isExist) {
      throw new HttpException(
        ErrorMessage.FOLLOW_USER_EXIST,
        HttpStatus.CONFLICT,
      );
    }

    const followingRepository = entityManager
      ? entityManager.getRepository<Following>('following')
      : this.followingRepository;

    const followingParam = new Following();
    followingParam.user1_id = userData.user_id;
    followingParam.user2_id = user_id;
    followingParam.is_deleted = EIsDelete.NOT_DELETE;
    followingParam.following_datetime = new Date();

    return followingRepository.save(followingParam);
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
      : this.followingRepository;
    return followingRepository.delete(conditions);
  }

  async checkAccess(user_id: string, entityManager?: EntityManager) {
    const followingRepository = entityManager
      ? entityManager.getRepository<Following>('following')
      : this.followingRepository;
    const following = await followingRepository.findOne({
      user2_id: user_id,
    });

    if (following) {
      return true;
    } else {
      return false;
    }
  }
}
