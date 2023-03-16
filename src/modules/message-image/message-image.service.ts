import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageImage } from 'src/core/database/mysql/entity/messageImage.entity';
import { DeepPartial, EntityManager, Repository } from 'typeorm';

@Injectable()
export class MessageImageService {
  constructor(
    @InjectRepository(MessageImage)
    private messageImageRepository: Repository<MessageImage>,
  ) {}

  async bulkcreateMessageImage(
    body: Array<DeepPartial<MessageImage>>,
    entityManager?: EntityManager,
  ) {
    const messageImageRepository = entityManager
      ? entityManager.getRepository<MessageImage>('message_image')
      : this.messageImageRepository;

    await messageImageRepository
      .createQueryBuilder()
      .insert()
      .into(MessageImage)
      .values(body)
      .execute();
    return null;
  }
}
