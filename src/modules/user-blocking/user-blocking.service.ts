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
}
