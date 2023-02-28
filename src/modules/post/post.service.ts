import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EIsDelete, EIsIncognito } from 'enum';
import { Post } from 'src/core/database/mysql/entity/post.entity';
import { returnPostsData } from 'src/helper/utils';
import { IUserData } from 'src/core/interface/default.interface';
import { EntityManager, Repository } from 'typeorm';
import { VCreatePost } from 'global/post/dto/createPost.dto';
import { DeepPartial } from 'typeorm/common/DeepPartial';
import { Connection } from 'typeorm/connection/Connection';
import { PostImage } from 'src/core/database/mysql/entity/postImage.entity';
import { PostImageService } from '../post-image/post-image.service';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    private postImageService: PostImageService,
    private connection: Connection,
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
}
