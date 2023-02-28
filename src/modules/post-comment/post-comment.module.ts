import { Module } from '@nestjs/common';
import { PostCommentService } from './post-comment.service';
import { PostCommentController } from './post-comment.controller';
import { PostComment } from 'src/core/database/mysql/entity/postComment.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [PostCommentController],
  providers: [PostCommentService],
  imports: [TypeOrmModule.forFeature([PostComment])],
  exports: [TypeOrmModule, PostCommentService],
})
export class PostCommentModule {}
