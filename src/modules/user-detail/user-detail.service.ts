import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserDetail } from 'src/core/database/mysql/entity/userDetail.entity';
import { DeepPartial, EntityManager, Repository } from 'typeorm';

@Injectable()
export class UserDetailService {
  constructor(
    @InjectRepository(UserDetail)
    private userDetailRepository: Repository<UserDetail>,
  ) {}

  async createUserDetail(
    body: DeepPartial<UserDetail>,
    entityManager?: EntityManager,
  ) {
    const userDetailRepository = entityManager
      ? entityManager.getRepository<UserDetail>('user_detail')
      : this.userDetailRepository;

    return await userDetailRepository.save(body);
  }

  async updateUserDetail(
    conditions: DeepPartial<UserDetail>,
    value: DeepPartial<UserDetail>,
    entityManager?: EntityManager,
  ) {
    const userDetailRepository = entityManager
      ? entityManager.getRepository<UserDetail>('user_detail')
      : this.userDetailRepository;

    await userDetailRepository.update(conditions, value);
  }
}
