import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostImage } from 'src/core/database/mysql/entity/postImage.entity';
import { Repository, DeepPartial, EntityManager } from 'typeorm';

@Injectable()
export class PostImageService {
  constructor(
    @InjectRepository(PostImage)
    private postImageRepository: Repository<PostImage>, // private configService: ConfigService, // private connection: Connection,
  ) {}

  async createPostImage(
    body: Array<DeepPartial<PostImage>>,
    entityManager?: EntityManager,
  ) {
    const postImageRepository = entityManager
      ? entityManager.getRepository<PostImage>('post_image')
      : this.postImageRepository;

    return await postImageRepository
      .createQueryBuilder()
      .insert()
      .into(PostImage)
      .values(body)
      .execute();
  }
}
