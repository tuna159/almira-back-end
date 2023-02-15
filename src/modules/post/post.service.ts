import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EIsDelete } from 'enum';
import { Post } from 'src/core/database/mysql/entity/post.entity';
import { returnPostsData } from 'src/helper/utils';
import { IUserData } from 'src/core/interface/default.interface';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
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
}
