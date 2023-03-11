import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EIsDelete } from 'enum';
import { User } from 'src/core/database/mysql/entity/user.entity';
import { IUserData } from 'src/core/interface/default.interface';
import { returnPostsImage } from 'src/helper/utils';
import { EntityManager } from 'typeorm/entity-manager/EntityManager';
import { Repository } from 'typeorm/repository/Repository';

@Injectable()
export class MeService {
  constructor(
    @InjectRepository(User)
    private meRepository: Repository<User>,
  ) {}

  async getMe(userData: IUserData, entityManager?: EntityManager) {
    const meRepository = entityManager
      ? entityManager.getRepository<User>('user')
      : this.meRepository;

    const queryBuilder = meRepository
      .createQueryBuilder('user')
      .select()
      .innerJoinAndSelect('user.posts', 'post')
      .leftJoinAndSelect('user.userDetail', 'userDetail')
      .leftJoinAndSelect('post.postImage', 'postImage')
      .where('post.is_deleted = :is_deleted', {
        is_deleted: EIsDelete.NOT_DELETE,
      })
      .where('user.user_id = :user_id', {
        user_id: userData.user_id,
      })
      .orderBy('post.created_at', 'DESC');

    const user = await queryBuilder.getOne();

    const image = user.posts.map((post) => returnPostsImage(post));

    const myUserData = {
      user_id: user.user_id,
      user_name: user.user_name,
      image_url: user.userDetail.image_url,
      introduction: user.userDetail.introduction,
      post_count: user.posts.length,
      image: image,
    };
    return myUserData;
  }
}
