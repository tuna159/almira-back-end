import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ErrorMessage } from 'enum/error';
import { PostCommentLike } from 'src/core/database/mysql/entity/postCommentLike.entity';
import { IUserData } from 'src/core/interface/default.interface';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class PostCommentLikeService {
  constructor(
    @InjectRepository(PostCommentLike)
    private postCommentLikeRepository: Repository<PostCommentLike>,
  ) {}

  async handlePostCommentLikes(
    userData: IUserData,
    post_comment_id: number,
    entityManager?: EntityManager,
  ) {
    const postCommentLikeRepository = entityManager
      ? entityManager.getRepository<PostCommentLike>('post_comment_like')
      : this.postCommentLikeRepository;

    const isExist = await postCommentLikeRepository.findOne({
      user_id: userData.user_id,
      post_comment_id: post_comment_id,
    });

    if (isExist) {
      throw new HttpException(
        ErrorMessage.POST_COMMENT_LIKE_ALREADY_EXIST,
        HttpStatus.CONFLICT,
      );
    }

    const postCommentLike = new PostCommentLike();
    postCommentLike.post_comment_id = post_comment_id;
    postCommentLike.user_id = userData.user_id;
    return await postCommentLikeRepository.save(postCommentLike);
  }

  async deletePostCommentLikes(
    userData: IUserData,
    post_comment_id: number,
    entityManager?: EntityManager,
  ) {
    const postCommentLikeRepository = entityManager
      ? entityManager.getRepository<PostCommentLike>('post_comment_like')
      : this.postCommentLikeRepository;

    const count = await postCommentLikeRepository.count({
      post_comment_id: post_comment_id,
      user_id: userData.user_id,
    });

    if (count && count > 0) {
      await postCommentLikeRepository.delete({
        user_id: userData.user_id,
        post_comment_id: post_comment_id,
      });
      return null;
    }
    throw new HttpException(
      ErrorMessage.LIKE_COMMENT_DOES_NOT_EXIST,
      HttpStatus.BAD_REQUEST,
    );
  }

  async getPostLikeCommentByCommentId(
    post_comment_id: number,
    entityManager?: EntityManager,
  ) {
    const postCommentLikeRepository = entityManager
      ? entityManager.getRepository<PostCommentLike>('post_comment_like')
      : this.postCommentLikeRepository;

    return await postCommentLikeRepository.find({ post_comment_id });
  }
}
