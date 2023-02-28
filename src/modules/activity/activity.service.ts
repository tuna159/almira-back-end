import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Activity } from 'src/core/database/mysql/entity/activity.entity';
import { DeepPartial, EntityManager, Repository } from 'typeorm';

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(Activity)
    private activityRepository: Repository<Activity>,
  ) {}

  async createActivity(
    body: Array<DeepPartial<Activity>>,
    entityManager?: EntityManager,
  ) {
    const activityRepository = entityManager
      ? entityManager.getRepository<Activity>('activity')
      : this.activityRepository;

    return await activityRepository
      .createQueryBuilder()
      .insert()
      .into(Activity)
      .values(body)
      .execute();
  }
}
