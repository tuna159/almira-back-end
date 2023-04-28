import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EActivityType, EIsDelete } from 'enum';
import { Activity } from 'src/core/database/mysql/entity/activity.entity';
import { Post } from 'src/core/database/mysql/entity/post.entity';
import { PostComment } from 'src/core/database/mysql/entity/postComment.entity';
import { PostCommentLike } from 'src/core/database/mysql/entity/postCommentLike.entity';
import { PostLike } from 'src/core/database/mysql/entity/postLike.entity';
import { User } from 'src/core/database/mysql/entity/user.entity';
import { UserDetail } from 'src/core/database/mysql/entity/userDetail.entity';
import {
  EReadActivity,
  IPaginationQuery,
} from 'src/core/interface/default.interface';
import { returnPagingData } from 'src/helper/utils';
import { DeepPartial, EntityManager, Repository } from 'typeorm';
import { PostCommentLikeService } from '../post-comment-like/post-comment-like.service';
import { PostLikeService } from '../post-like/post-like.service';
import { PostService } from '../post/post.service';
import { UserBlockingService } from '../user-blocking/user-blocking.service';

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(Activity)
    private activityRepository: Repository<Activity>,
    private userBlockingService: UserBlockingService,
    private postCommentLikeService: PostCommentLikeService,
    private postLikeService: PostLikeService,
    @Inject(forwardRef(() => PostService))
    private postService: PostService,
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

    const blockList = await this.userBlockingService.getBlockListUserIdByUserId(
      user_id,
      entityManager,
    );

    const sqlGetActivity = activityRepository
      .createQueryBuilder('activity')
      .select()
      .where('( activity.user_id = :user_id)', { user_id })
      .andWhere('activity.is_deleted = :is_deleted', {
        is_deleted: EIsDelete.NOT_DELETE,
      })
      .orderBy('activity_date_time', 'DESC')
      .skip(query.skip)
      .take(query.limit);

    if (blockList.length) {
      let blockListStr = '';
      for (let i = 0; i < blockList.length; i++) {
        const e = blockList[i];
        blockListStr += '"' + e + '"';
        if (i < blockList.length - 1) {
          blockListStr += ',';
        }
      }

      const postBlock = await this.postService.getPostByUserID(blockList);

      sqlGetActivity
        .addSelect(
          `(CASE 
            WHEN activity.type = 1 THEN 
              ( SELECT post_like.created_at FROM post_like 
                WHERE post_like.post_id = activity.post_id AND post_like.user_id NOT IN (${blockListStr}) 
                ORDER BY post_like.created_at desc limit 1)
            WHEN activity.type = 2 THEN 
              ( SELECT post_comment_like.created_at FROM post_comment_like 
                WHERE post_comment_like.post_comment_id = activity.post_comment_id AND post_comment_like.user_id NOT IN (${blockListStr}) 
                ORDER BY post_comment_like.created_at desc limit 1)
            ELSE activity.created_at END)`,
          'activity_date_time',
        )

        .andWhere(
          '(activity.from_user_id NOT IN (:blockList) OR from_user_id IS NULL)',
          {
            blockList,
          },
        )
        .andWhere(
          '(activity.post_id NOT IN (:postBlock) OR activity.post_id IS NULL)',
          {
            postBlock: postBlock.map((post) => post.post_id).push(0),
          },
        )
        .leftJoinAndMapMany(
          'activity.post_like',
          PostLike,
          'post_like',
          'activity.post_id = post_like.post_id AND post_like.user_id NOT IN (:blockList) AND activity.type = 1',
          { blockList },
        )
        .leftJoinAndMapMany(
          'activity.post_comment_like',
          PostCommentLike,
          'post_comment_like',
          'activity.post_comment_id = post_comment_like.post_comment_id AND post_comment_like.user_id NOT IN (:blockList) AND activity.type = 2',
          { blockList },
        );
    } else {
      sqlGetActivity
        .addSelect(
          `(CASE 
            WHEN activity.type = 1 THEN 
              ( SELECT post_like.created_at FROM post_like 
                WHERE post_like.post_id = activity.post_id 
                ORDER BY post_like.created_at desc limit 1) 
            WHEN activity.type = 2 THEN 
              ( SELECT post_comment_like.created_at FROM post_comment_like 
                WHERE post_comment_like.post_comment_id = activity.post_comment_id 
                ORDER BY post_comment_like.created_at desc limit 1) 
            ELSE activity.created_at END)`,
          'activity_date_time',
        )
        .leftJoinAndMapMany(
          'activity.post_like',
          PostLike,
          'post_like',
          'activity.post_id = post_like.post_id AND activity.type = 1',
        )
        .leftJoinAndMapMany(
          'activity.post_comment_like',
          PostCommentLike,
          'post_comment_like',
          'activity.post_comment_id = post_comment_like.post_comment_id AND activity.type = 2',
        );
    }

    sqlGetActivity
      .addSelect(['post.content', 'post.user_id'])
      .addSelect([
        'fromUser.user_id',
        'fromUser.is_deleted',
        'fromUser.user_name',
      ])
      .addSelect(['userDetail.image_url'])
      .addSelect(['postImage.image_url'])
      .leftJoin('activity.post', 'post')
      .leftJoin('activity.fromUser', 'fromUser')
      .leftJoin('fromUser.userDetail', 'userDetail')
      .leftJoin('post.postImage', 'postImage')
      .leftJoinAndMapOne(
        'post_like.user',
        User,
        'userLikedPost',
        'post_like.user_id = userLikedPost.user_id ',
      )
      .leftJoinAndMapOne(
        'post_comment_like.user',
        User,
        'userLikedComment',
        'post_comment_like.user_id = userLikedComment.user_id',
      )
      .leftJoinAndMapOne(
        'userLikedComment.userDetail',
        UserDetail,
        'userLikeDetail1',
        'userLikedComment.user_id = userLikeDetail1.user_id',
      )
      .leftJoinAndMapOne(
        'userLikedPost.userDetail',
        UserDetail,
        'userLikeDetail',
        'userLikedPost.user_id = userLikeDetail.user_id',
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
            ? `${user_name} commented on your post ${e?.post?.content}`
            : `${user_name} commented on a post that you commented on ${e?.post?.content}`;
      } else if (e.type == EActivityType.LIKE) {
        const postLikes = e?.post_like
          ?.filter((e) => e?.user != null)
          .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));

        const like_count = postLikes.length;

        if (!like_count) continue;

        image.image_url = postLikes[0]?.user?.userDetail?.image_url;

        const user1 = postLikes[0]?.user?.user_name;
        if (like_count === 1) {
          text = `${user1} likes your post ${e?.post?.content}`;
        } else {
          text = `${user1} and other ${
            like_count - 1
          } person(s) like your post ${e?.post?.content}`;
        }
      } else if (e.type == EActivityType.LIKE_COMMENT) {
        const postLikeComments = e?.post_comment_like
          ?.filter((e) => e?.user != null)
          .sort((a, b) => (a.created < b.created ? 1 : -1));

        image.image_url = postLikeComments[0]?.user?.userDetail?.image_url;

        let user1 = postLikeComments[0]?.user?.user_name;
        const like_comment_count = postLikeComments.length;

        if (postLikeComments[0]?.user.is_deleted == EIsDelete.DELETED) {
          text = `Deleted account like your comment ${e?.post?.content}`;
        } else {
          if (postLikeComments[0]?.user.is_deleted == EIsDelete.DELETED) {
            user1 = 'Deleted account';
          }
          if (like_comment_count === 1) {
            text = `${user1} likes your comment ${e?.post?.content}`;
          } else {
            text = `${user1} and other ${
              like_comment_count - 1
            } person(s) like your comment  ${e?.post?.content}`;
          }
        }
      }
      // if (e.type == EActivityType.LIKE && !e?.post_like?.length) {
      //   continue;
      // }
      // if (
      //   e.type == EActivityType.LIKE_COMMENT &&
      //   !e?.t_post_comment_like?.length
      // ) {
      //   continue;
      // }
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

  async handleDeleteActivityLikeComment(
    post: DeepPartial<Post>,
    comment: DeepPartial<PostComment>,
    user_id: string,
    entityManager?: EntityManager,
  ) {
    const activityRepository = entityManager
      ? entityManager.getRepository<Activity>('activity')
      : this.activityRepository;

    const activityLikeComment = await activityRepository.findOne({
      user_id: comment?.user_id,
      post_id: post?.post_id,
      post_comment_id: comment?.post_comment_id,
      type: EActivityType.LIKE_COMMENT,
      is_deleted: EIsDelete.NOT_DELETE,
    });

    if (activityLikeComment) {
      const postCommentLike =
        await this.postCommentLikeService.getPostLikeCommentByCommentId(
          comment?.post_comment_id,
          entityManager,
        );

      if (!postCommentLike?.length) {
        const activityParams = new Activity();
        activityParams.activity_id = activityLikeComment.activity_id;
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
}
