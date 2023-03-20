import { forwardRef, Module } from '@nestjs/common';
import { PostCommentLikeService } from './post-comment-like.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostModule } from '../post/post.module';
import { PostCommentLike } from 'src/core/database/mysql/entity/postCommentLike.entity';
@Module({
  providers: [PostCommentLikeService],
  imports: [
    TypeOrmModule.forFeature([PostCommentLike]),
    forwardRef(() => PostModule),
  ],
  exports: [TypeOrmModule, PostCommentLikeService],
})
export class PostCommentLikeModule {}
