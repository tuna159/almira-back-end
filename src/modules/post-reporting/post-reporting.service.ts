import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { VReportPostDto } from 'global/post/dto/report-post.dto';
import { PostReporting } from 'src/core/database/mysql/entity/postReporting.entity';
import { IUserData } from 'src/core/interface/default.interface';
import { EntityManager } from 'typeorm/entity-manager/EntityManager';
import { Repository } from 'typeorm/repository/Repository';

@Injectable()
export class PostReportingService {
  constructor(
    @InjectRepository(PostReporting)
    private postReportingRepository: Repository<PostReporting>,
  ) {}

  async handleReportPost(
    userData: IUserData,
    post_id: number,
    body: VReportPostDto,
    entityManager?: EntityManager,
  ) {
    const postReportingRepository = entityManager
      ? entityManager.getRepository<PostReporting>('post_reporting')
      : this.postReportingRepository;
    const postReporting = new PostReporting();
    postReporting.post_id = post_id;
    postReporting.user_id = userData.user_id;
    postReporting.reason_message = body.message;
    await postReportingRepository.save(postReporting);
    return null;
  }
}
