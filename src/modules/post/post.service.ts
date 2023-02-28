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
        console.log(user_id, 2);

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
}
