import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EActivityType, EIsDelete, EIsIncognito } from 'enum';
import { Post } from 'src/core/database/mysql/entity/post.entity';
import { returnPostsData } from 'src/helper/utils';
import { IUserData } from 'src/core/interface/default.interface';
import { EntityManager, Repository } from 'typeorm';
import { VCreatePost } from 'global/post/dto/createPost.dto';
import { DeepPartial } from 'typeorm/common/DeepPartial';
import { Connection } from 'typeorm/connection/Connection';
import { PostImage } from 'src/core/database/mysql/entity/postImage.entity';
import { PostImageService } from '../post-image/post-image.service';
import { VAddComment } from 'global/post/dto/addComment.dto';
import { ErrorMessage } from 'enum/error';
import { PostComment } from 'src/core/database/mysql/entity/postComment.entity';
import { PostCommentService } from '../post-comment/post-comment.service';
import { Activity } from 'src/core/database/mysql/entity/activity.entity';
import { ActivityService } from '../activity/activity.service';
import { PostLikeService } from '../post-like/post-like.service';
import { VUpdatePost } from 'global/post/dto/updatePost.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    private postImageService: PostImageService,
    private connection: Connection,
    private postCommentService: PostCommentService,
    @Inject(forwardRef(() => ActivityService))
    private activityService: ActivityService,
    private postLikeService: PostLikeService,
  ) {}

  async getPosts(userData: IUserData, entityManager?: EntityManager) {
    let data = [];
    const postRepository = entityManager
      ? entityManager.getRepository<Post>('post')
      : this.postRepository;

    const queryBuilder = postRepository
      .createQueryBuilder('post')
      .select()
      .innerJoinAndSelect('post.user', 'user')
      .leftJoinAndSelect('user.userDetail', 'userDetail')
      .leftJoinAndSelect('post.postImage', 'postImage')
      .leftJoinAndSelect(
        'post.postComments',
        'postComments',
        'postComments.is_deleted = :is_deleted',
        { is_deleted: EIsDelete.NOT_DELETE },
      )
      .leftJoinAndSelect('post.postLikes', 'postLikes')
      .leftJoinAndSelect(
        'postLikes.user',
        'userLiked',
        'userLiked.is_deleted = :is_deleted',
        { is_deleted: EIsDelete.NOT_DELETE },
      )
      .where('post.is_deleted = :is_deleted', {
        is_deleted: EIsDelete.NOT_DELETE,
      });

    const [listPosts] = await queryBuilder.getManyAndCount();

    data = listPosts.map((post) => returnPostsData(userData.user_id, post));

    return data;
  }

  async createPost(userData: IUserData, body: VCreatePost) {
    let data: DeepPartial<Post>;
    try {
      data = await this.connection.transaction(async (manager) => {
        const postParams = new Post();
        postParams.user_id = userData.user_id;
        postParams.content = body.content;
        postParams.is_incognito =
          body.is_incognito === false
            ? EIsIncognito.NOT_INCOGNITO
            : EIsIncognito.INCOGNITO;

        const post = await this.addPost(postParams, manager);

        const postImageParams = [];
        if (body?.images && body?.images.length) {
          body.images.forEach((image) => {
            const postImageParam = new PostImage();
            postImageParam.post_id = post.post_id;
            postImageParam.image_url = image.image_url;
            postImageParams.push(postImageParam);
          });
          this.postImageService.createPostImage(postImageParams, manager);
        }

        return post;
      });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
    return {
      post_id: data.post_id,
      images: body.images,
      created_at: data.created_at,
    };
  }

  async addPost(value: DeepPartial<Post>, entityManager?: EntityManager) {
    const postRepository = entityManager
      ? entityManager.getRepository<Post>('post')
      : this.postRepository;
    return await postRepository.save(value);
  }

  async createComment(userData: IUserData, post_id: number, body: VAddComment) {
    if (!body.content) {
      throw new HttpException(
        ErrorMessage.INVALID_PARAM,
        HttpStatus.BAD_REQUEST,
      );
    }
    if (body.content === '' || body.content === null) {
      throw new HttpException(
        ErrorMessage.INVALID_PARAM,
        HttpStatus.BAD_REQUEST,
      );
    }
    const isExist = await this.checkPost({
      post_id,
      is_deleted: EIsDelete.NOT_DELETE,
    });

    if (!isExist) {
      throw new HttpException(
        ErrorMessage.POST_NOT_EXIST,
        HttpStatus.BAD_REQUEST,
      );
    }
    const postComment = await this.connection.transaction(async (manager) => {
      const postCommentParams = new PostComment();
      postCommentParams.post_id = post_id;
      postCommentParams.user_id = userData.user_id;
      postCommentParams.content = body.content;
      postCommentParams.is_incognito =
        body.is_incognito === false
          ? EIsIncognito.NOT_INCOGNITO
          : EIsIncognito.INCOGNITO;

      const postComment = await this.postCommentService.addPostComment(
        postCommentParams,
        manager,
      );

      const repliedList = await this.postCommentService.getRepliedUserList(
        postComment.post_id,
      );

      repliedList.push(isExist.user_id);

      const list = [
        ...new Set(
          repliedList.filter((user_id) => user_id != userData.user_id),
        ),
      ];
      const activityParamsAR = [];
      list.forEach((user_id) => {
        const activityParams = new Activity();
        activityParams.post_id = post_id;
        activityParams.user_id = user_id;
        activityParams.from_user_id = userData.user_id;
        activityParams.post_comment_id = postComment.post_comment_id;
        activityParams.comment = postComment.content;
        activityParams.is_incognito = postComment.is_incognito;
        activityParams.type = EActivityType.COMMENT;
        activityParams.date_time = new Date();
        activityParamsAR.push(activityParams);
      });

      this.activityService.createActivity(activityParamsAR, manager);
    });
    return postComment;
  }

  async checkPost(fieldList: DeepPartial<Post>, entityManager?: EntityManager) {
    const postRepository = entityManager
      ? entityManager.getRepository<Post>('post')
      : this.postRepository;

    const post = await postRepository.findOne(fieldList);

    if (post) {
      return post;
    } else {
      return false;
    }
  }

  async createPostLike(userData: IUserData, post_id: number) {
    const post = await this.getUserPostedByPostId(post_id);

    if (!post) {
      throw new HttpException(
        ErrorMessage.POST_NOT_EXIST,
        HttpStatus.BAD_REQUEST,
      );
    }

    const postLike = await this.connection.transaction(async (manager) => {
      const data = await Promise.all([
        this.postLikeService.addLikePost(post_id, userData.user_id, manager),
        this.activityService.handleAddActivityLike(
          post,
          userData.user_id,
          manager,
        ),
      ]);

      return data[0];
    });

    return { post_like_id: postLike.post_like_id };
  }

  async getUserPostedByPostId(post_id: number) {
    const data = await this.postRepository
      .createQueryBuilder('post')
      .select()
      .innerJoin('post.user', 'user')
      .where('post.post_id = :post_id AND post.is_deleted = :is_deleted', {
        post_id,
        is_deleted: EIsDelete.NOT_DELETE,
      })
      .getOne();
    if (!data) {
      throw new HttpException(
        ErrorMessage.POST_NOT_EXIST,
        HttpStatus.BAD_REQUEST,
      );
    }
    return {
      post_id: data.post_id,
      title: data.content,
      user_id: data.user_id,
      is_incognito: data.is_incognito,
    };
  }
  async updatePostByUserCreated(
    condition: object,
    body: DeepPartial<Post>,
    entityManager?: EntityManager,
  ) {
    const postRepository = entityManager
      ? entityManager.getRepository<Post>('post')
      : this.postRepository;
    return await postRepository.update(condition, body);
  }

  async handleDeletePost(
    post_id: number,
    user_id: string,
    body: DeepPartial<Post>,
  ) {
    const isAccess = await this.checkPost({
      user_id,
      post_id,
      is_deleted: EIsDelete.NOT_DELETE,
    });

    if (!isAccess) {
      throw new HttpException(
        ErrorMessage.DELETE_POST_PERMISSION_DENIED,
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.connection.transaction(async (manager) => {
      await Promise.all([
        this.updatePostByUserCreated({ post_id, user_id }, body, manager),
        this.activityService.updateActivity(
          { post_id, user_id, is_deleted: EIsDelete.NOT_DELETE },
          { is_deleted: EIsDelete.DELETED },
          manager,
        ),
      ]);
    });
    return null;
  }

  async deleteLikePost(userData: IUserData, post_id: number) {
    const post = await this.getUserPostedByPostId(post_id);

    await this.connection.transaction(async (manager) => {
      const [unlikePost, deleteActivityLike] = [
        await this.postLikeService.deleteLikePost(userData, post_id, manager),
        await Promise.all([
          this.activityService.handleDeleteActivityLike(
            post,
            userData.user_id,
            manager,
          ),
        ]),
      ];
      await Promise.all([unlikePost, deleteActivityLike]);
    });
  }

  async getPostComment(post_id: number, user_id?: string) {
    const [isExist] = await Promise.all([
      this.checkPost({ post_id, is_deleted: EIsDelete.NOT_DELETE }),
    ]);

    if (!isExist) {
      throw new HttpException(
        ErrorMessage.POST_NOT_EXIST,
        HttpStatus.BAD_REQUEST,
      );
    }

    const post = await this.getPostDetailByPostId(post_id);

    const commentCount = post?.postComments?.length;
    const isCommented = post?.postComments
      .map((e) => e?.user_id)
      .includes(user_id);
    const post_comment = post.postComments.map((e) => {
      return {
        post_comment_id: e.post_comment_id,
        user_data: {
          user_id: e.user_id,
          nickname:
            (e.is_incognito && e.user_id != user_id) ||
            e.user.is_deleted == EIsDelete.DELETED
              ? null
              : e.user.user_name,
          image: {
            image_url:
              (e.is_incognito && e.user_id != user_id) ||
              e.user.is_deleted == EIsDelete.DELETED
                ? null
                : e.user.userDetail.image_url,
            thumbnail_url:
              (e.is_incognito && e.user_id != user_id) ||
              e.user.is_deleted == EIsDelete.DELETED
                ? null
                : e.user.userDetail.thumbnail_url,
          },
          is_deleted: !!e.user.is_deleted,
        },
        is_incognito: !!e.is_incognito,
        created_at: e.created_at,
      };
    });

    return {
      post_id: post.post_id,
      content: post.content,
      user_data: {
        user_id: post.user_id,
        nickname: post.user.user_name,
        image: {
          image_url: post.user.userDetail.image_url,
          thumbnail_url: post.user.userDetail.thumbnail_url,
        },
        is_deleted: !!post.user.is_deleted,
      },
      is_incognito: !!post.is_incognito,
      comment_count: commentCount,
      is_commented: isCommented,
      created_at: post.created_at,
      updated_at: post.updated_at,
      post_comment: post_comment,
    };
  }

  async getPostDetailByPostId(post_id: number) {
    const sql = this.postRepository
      .createQueryBuilder('post')
      .select()
      .addSelect(['user.user_id', 'user.is_deleted', 'user.user_name'])
      .addSelect(['userDetail.image_url', 'userDetail.thumbnail_url'])
      .addSelect(['userComment.user_id', 'userComment.is_deleted'])
      .addSelect([
        'userCommentDetail.image_url',
        'userCommentDetail.thumbnail_url',
      ])
      .addSelect(['postLikes.user_id'])
      .leftJoin('post.user', 'user')
      .leftJoin('post.postLikes', 'postLikes')
      .leftJoinAndSelect(
        'post.postComments',
        'postComments',
        'postComments.is_deleted = :is_deleted',
        { is_deleted: EIsDelete.NOT_DELETE },
      )
      .leftJoin('user.userDetail', 'userDetail')
      .leftJoin('postComments.user', 'userComment')
      .leftJoin('userComment.userDetail', 'userCommentDetail')

      .where('post.post_id = :post_id', { post_id })
      .andWhere('post.is_deleted = :is_deleted', {
        is_deleted: EIsDelete.NOT_DELETE,
      });

    return await sql.getOne();
  }

  async handleUpdatePost(post_id: number, user_id: string, body: VUpdatePost) {
    const isAccess = await this.checkPost({
      post_id,
      is_deleted: EIsDelete.NOT_DELETE,
    });

    if (!isAccess) {
      throw new HttpException(
        ErrorMessage.POST_NOT_EXIST,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (isAccess.user_id != user_id) {
      throw new HttpException(
        ErrorMessage.UPDATE_POST_PERMISSION_DENIED,
        HttpStatus.BAD_REQUEST,
      );
    }

    const post = await this.connection.transaction(async (manager) => {
      const postParams = new Post();
      postParams.content = body.content;
      postParams.updated_at = new Date();

      await Promise.all([
        this.updatePostByUserCreated({ post_id, user_id }, postParams, manager),
      ]);
      return postParams;
    });

    return {
      updated_at: post.updated_at,
    };
  }
}
