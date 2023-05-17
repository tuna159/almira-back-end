import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserBlocking } from 'src/core/database/mysql/entity/userBlocking.entity';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class UserBlockingService {
  constructor(
    @InjectRepository(UserBlocking)
    private userBlockingRepository: Repository<UserBlocking>,
  ) {}

  async checkBlocking(
    blocked_on_id: string,
    blocked_by_id: string,
    entityManager?: EntityManager,
  ) {
    const userBlockingRepository = entityManager
      ? entityManager.getRepository<UserBlocking>('user_blocking')
      : this.userBlockingRepository;
    return userBlockingRepository.findOne({ blocked_on_id, blocked_by_id });
  }

  async blockUser(
    blocked_on_id: string,
    blocked_by_id: string,
    entityManager?: EntityManager,
  ) {
    const userBlockingRepository = entityManager
      ? entityManager.getRepository<UserBlocking>('user_blocking')
      : this.userBlockingRepository;
    return await userBlockingRepository.save({ blocked_on_id, blocked_by_id });
  }

  async getBlockListUserIdByUserId(
    user_id: string,
    entityManager?: EntityManager,
  ) {
    const userBlockingRepository = entityManager
      ? entityManager.getRepository<UserBlocking>('user_blocking')
      : this.userBlockingRepository;

    const blocked = await userBlockingRepository
      .createQueryBuilder('user_blocking')
      .select('user_blocking.blocked_on_id')
      .where('user_blocking.blocked_by_id = :user_id', { user_id })
      .getMany();

    return blocked.map((userblock) => userblock.blocked_on_id);
  }

  async getBlockedAndBlockedByByUserId(
    user_id: string,
    entityManager?: EntityManager,
  ) {
    const userBlockingRepository = entityManager
      ? entityManager.getRepository<UserBlocking>('user_blocking')
      : this.userBlockingRepository;

    const block = await userBlockingRepository
      .createQueryBuilder('user_blocking')
      .select(['user_blocking.blocked_by_id', 'user_blocking.blocked_on_id'])
      .where(
        'user_blocking.blocked_on_id = :user_id OR user_blocking.blocked_by_id = :user_id',
        { user_id },
      )
      .getMany();

    return block.map((e) => {
      const blocking =
        e.blocked_by_id === user_id ? e.blocked_on_id : e.blocked_by_id;
      return blocking;
    });
  }

  async unBlockUser(
    blocked_on_id: string,
    blocked_by_id: string,
    entityManager?: EntityManager,
  ) {
    const userBlockingRepository = entityManager
      ? entityManager.getRepository<UserBlocking>('t_user_blocking')
      : this.userBlockingRepository;

    return await userBlockingRepository.delete({
      blocked_on_id,
      blocked_by_id,
    });
  }
}
