import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EIsDelete } from 'enum';
import { PostComment } from 'src/core/database/mysql/entity/postComment.entity';
import { EntityManager, Repository, DeepPartial } from 'typeorm';

@Injectable()
export class PostCommentService {
  constructor(
    @InjectRepository(PostComment)
    private postCommentRepository: Repository<PostComment>,
  ) {}

  async getRepliedUserList(post_id: number, entityManager?: EntityManager) {
    const postCommentRepository = entityManager
      ? entityManager.getRepository<PostComment>('post_comment')
      : this.postCommentRepository;

    const repliedUserList = await postCommentRepository.find({
      post_id,
      is_deleted: EIsDelete.NOT_DELETE,
    });

    return repliedUserList.map((e) => e.user_id);
  }

  async addPostComment(
    value: DeepPartial<PostComment>,
    entityManager?: EntityManager,
  ) {
    const postCommentRepository = entityManager
      ? entityManager.getRepository<PostComment>('post_comment')
      : this.postCommentRepository;
    return await postCommentRepository.save(value);
  }

  async checkPostComment(
    condition: DeepPartial<PostComment>,
    entityManager?: EntityManager,
  ) {
    const postCommentRepository = entityManager
      ? entityManager.getRepository<PostComment>('post_comment')
      : this.postCommentRepository;

    return await postCommentRepository.findOne(condition);
  }
}
