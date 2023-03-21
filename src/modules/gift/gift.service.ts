import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Gift } from 'src/core/database/mysql/entity/gift.entity';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class GiftService {
  constructor(
    @InjectRepository(Gift)
    private giftRepository: Repository<Gift>,
  ) {}

  async getAllGift(entityManager?: EntityManager) {
    const giftRepository = entityManager
      ? entityManager.getRepository<Gift>('gift_type')
      : this.giftRepository;
    return await giftRepository.find();
  }

  async getOneGift(gift_id: number, entityManager?: EntityManager) {
    const giftRepository = entityManager
      ? entityManager.getRepository<Gift>('gift_type')
      : this.giftRepository;
    return await giftRepository.findOne({
      where: {
        gift_id: gift_id,
      },
    });
  }
}
