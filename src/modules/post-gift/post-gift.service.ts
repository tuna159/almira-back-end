import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EIsDelete } from 'enum';
import { PostGift } from 'src/core/database/mysql/entity/postGift.entity';
import { DeepPartial, EntityManager, Repository } from 'typeorm';

@Injectable()
export class PostGiftService {
  constructor(
    @InjectRepository(PostGift)
    private postGiftRepository: Repository<PostGift>,
  ) {}

  async createUserPoints(
    value: DeepPartial<PostGift>,
    entityManager?: EntityManager,
  ) {
    const postGiftRepository = entityManager
      ? entityManager.getRepository<PostGift>('post_gift')
      : this.postGiftRepository;
    return await postGiftRepository.save(value);
  }

  async sumUserPoint(user_id: string, entityManager?: EntityManager) {
    const postGiftRepository = entityManager
      ? entityManager.getRepository<PostGift>('post_gift')
      : this.postGiftRepository;

    const { sum } = await postGiftRepository
      .createQueryBuilder('post_gift')
      .select('SUM(post_gift.points)', 'sum')
      .where('post_gift.receiver_id = :user_id', { user_id: user_id })
      .andWhere('post_gift.is_deleted = :is_deleted', {
        is_deleted: EIsDelete.NOT_DELETE,
      })
      .getRawOne();

    return sum;
  }
}
