import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EActivityType, EIsDelete, EIsIncognito } from 'enum';
import { Activity } from 'src/core/database/mysql/entity/activity.entity';
import { Post } from 'src/core/database/mysql/entity/post.entity';
import { PostComment } from 'src/core/database/mysql/entity/postComment.entity';
import { PostLike } from 'src/core/database/mysql/entity/postLike.entity';
import { User } from 'src/core/database/mysql/entity/user.entity';
import { UserDetail } from 'src/core/database/mysql/entity/userDetail.entity';
import {
  EReadActivity,
  IPaginationQuery,
} from 'src/core/interface/default.interface';
import { returnPagingData } from 'src/helper/utils';
import { DeepPartial, EntityManager, Repository } from 'typeorm';
import { PostLikeService } from '../post-like/post-like.service';

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(Activity)
    private activityRepository: Repository<Activity>,
    private postLikeService: PostLikeService,
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

  async createActivityHalder(
    value: DeepPartial<Activity>,
    entityManager?: EntityManager,
  ) {
    const activityRepository = entityManager
      ? entityManager.getRepository<Activity>('activity')
      : this.activityRepository;

    await activityRepository.save(value);
    return null;
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

  async handleDeleteActivityLike(
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
      const postLike = await this.postLikeService.getPostLikeByPostId(
        post.post_id,
        entityManager,
      );

      if (!postLike?.length) {
        const activityParams = new Activity();
        activityParams.activity_id = activityLike.activity_id;
        const activityValue = new Activity();
        activityValue.is_deleted = EIsDelete.DELETED;
        return await this.updateActivity(
          activityParams,
          activityValue,
          entityManager,
        );
      }
    }
  }

  async getActivityUnread(userId: string, entityManager?: EntityManager) {
    const activityRepository = entityManager
      ? entityManager.getRepository<Activity>('activity')
      : this.activityRepository;

    return await activityRepository.findOne({
      user_id: userId,
      is_read: EReadActivity.UN_READ,
      is_deleted: EIsDelete.NOT_DELETE,
    });
  }

  async getActivity(
    user_id: string,
    query: IPaginationQuery,
    entityManager?: EntityManager,
  ) {
    const activityRepository = entityManager
      ? entityManager.getRepository<Activity>('activity')
      : this.activityRepository;

    const sqlGetActivity = activityRepository
      .createQueryBuilder('activity')
      .select()
      .where('( activity.user_id = :user_id)', { user_id })
      .andWhere('activity.is_deleted = :is_deleted', {
        is_deleted: EIsDelete.NOT_DELETE,
      })
      .orderBy('activity_date_time', 'DESC')
      .skip(query.skip)
      .take(query.take);

    sqlGetActivity
      .addSelect(
        '(CASE WHEN activity.type = 1 THEN (SELECT post_like.created_at FROM post_like where post_like.post_id = activity.post_id order by post_like.created_at desc limit 1) ELSE activity.created_at END)',
        'activity_date_time',
      )
      .leftJoinAndMapMany(
        'activity.post_like',
        PostLike,
        'post_like',
        'activity.post_id = post_like.post_id AND activity.type = 1',
      );

    sqlGetActivity
      .addSelect(['post.content', 'post.user_id'])
      .addSelect(['fromUser.user_id', 'fromUser.user_name'])
      .addSelect(['userDetail.image_url'])
      .addSelect(['postImage.image_url'])
      .leftJoin('activity.post', 'post')
      .leftJoin('activity.fromUser', 'fromUser')
      .leftJoin('fromUser.userDetail', 'userDetail')
      .leftJoin('post.postImage', 'postImage')
      .leftJoinAndMapOne(
        'post_like.user',
        User,
        'userLiked',
        'post_like.user_id = userLiked.user_id AND userLiked.is_deleted = :is_deleted',
        {
          is_deleted: EIsDelete.NOT_DELETE,
        },
      )
      .leftJoinAndMapOne(
        'userLiked.userDetail',
        UserDetail,
        'userLikeDetail',
        'userLiked.user_id = userLikeDetail.user_id',
      );

    const [activity, totalItems]: any = await sqlGetActivity.getManyAndCount();

    const data = [];
    for (let i = 0; i < activity.length; i++) {
      const e = activity[i];
      const image = {
        image_url: null,
      };
      let text = '';
      if (e.type == EActivityType.COMMENT) {
        image.image_url = e?.fromUser?.userDetail?.image_url;

        const user_name = e?.fromUser?.user_name;

        text =
          user_id == e?.post?.user_id
            ? `${user_name} commented on your post: ${e?.post?.content}`
            : `${user_name} commented on a post that you commented on: ${e?.post?.content}`;
      } else if (e.type == EActivityType.LIKE) {
        const postLikes = e?.post_like
          ?.filter((e) => e?.user != null)
          .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));

        const like_count = postLikes.length;

        if (!like_count) continue;

        image.image_url = postLikes[0]?.user?.userDetail?.image_url;

        const user1 = postLikes[0]?.user?.user_name;
        if (like_count === 1) {
          text = `${user1} likes your post: ${e?.post?.content}`;
        } else {
          text = `${user1} and other ${
            like_count - 1
          } person(s) like your post: ${e?.post?.content}`;
        }
      }
      if (e.type == EActivityType.LIKE && !e?.post_like?.length) {
        continue;
      }
      data.push({
        activity_id: e?.activity_id,
        post_id: e?.post_id,
        community_id: e?.community_id,
        image: image,
        post_image: e?.post?.postImage.map((e2) => {
          return { image_url: e2.image_url };
        }),
        type: e?.type,
        summary: text,
        is_incognito: !!e.is_incognito,
        created_at: e?.date_time,
      });
    }

    return returnPagingData(data, totalItems, query);
  }

  async handleGetActivity(user_id: string, query: IPaginationQuery) {
    const [has_new_activity, posactivity] = await Promise.all([
      this.getActivityUnread(user_id),
      this.getActivity(user_id, query),
    ]);
    return {
      activity_data: posactivity.data,
      is_last_page: !!posactivity.is_last_page,
      has_new_activity: !!has_new_activity,
    };
  }

  async addActivityLikeComment(
    post: DeepPartial<Post>,
    comment: DeepPartial<PostComment>,
    user_id: string,
    entityManager?: EntityManager,
  ) {
    const activityRepository = entityManager
      ? entityManager.getRepository<Activity>('activity')
      : this.activityRepository;

    const activityLike = await activityRepository.findOne({
      user_id: comment?.user_id,
      post_id: post?.post_id,
      post_comment_id: comment?.post_comment_id,
      type: EActivityType.LIKE_COMMENT,
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
      activityParams.post_comment_id = comment.post_comment_id;
      activityParams.user_id = comment.user_id;
      activityParams.type = EActivityType.LIKE_COMMENT;

      activityParams.is_read = EReadActivity.UN_READ;
      activityParams.date_time = new Date();

      return await this.createActivityHalder(activityParams, entityManager);
    }
  }
}
