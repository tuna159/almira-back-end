import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EActivityType, EIsDelete, EIsIncognito } from 'enum';
import { Activity } from 'src/core/database/mysql/entity/activity.entity';
import { Post } from 'src/core/database/mysql/entity/post.entity';
import { EReadActivity } from 'src/core/interface/default.interface';
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

  async handleAddActivityLike(
    post: DeepPartial<Post>,
    user_id: string,
    entityManager?: EntityManager,
  ) {
    const activityRepository = entityManager
      ? entityManager.getRepository<Activity>('activity')
      : this.activityRepository;

    const activityLike = await activityRepository.findOne({
      user_id: post?.user_id,
      post_id: post?.post_id,
      type: EActivityType.LIKE,
      is_deleted: EIsDelete.NOT_DELETE,
    });

    if (activityLike) {
      return await this.updateActivity(
        { activity_id: activityLike.activity_id },
        { is_read: EReadActivity.UN_READ },
        entityManager,
      );
    } else {
      const activityParams = new Activity();
      activityParams.post_id = post.post_id;
      activityParams.user_id = post.user_id;
      activityParams.type = EActivityType.LIKE;
      activityParams.is_incognito = post.is_incognito
        ? EIsIncognito.INCOGNITO
        : EIsIncognito.NOT_INCOGNITO;
      activityParams.is_read = EReadActivity.UN_READ;
      activityParams.date_time = new Date();
      return await this.createActivityLike(activityParams, entityManager);
    }
  }

  async updateActivity(
    condition: DeepPartial<Activity>,
    value: DeepPartial<Activity>,
    entityManager?: EntityManager,
  ) {
    const activityRepository = entityManager
      ? entityManager.getRepository<Activity>('activity')
      : this.activityRepository;

    return await activityRepository.update(condition, value);
  }

  async createActivityLike(
    value: DeepPartial<Activity>,
    entityManager?: EntityManager,
  ) {
    const activityRepository = entityManager
      ? entityManager.getRepository<Activity>('activity')
      : this.activityRepository;

    return await activityRepository.save(value);
  }
}
