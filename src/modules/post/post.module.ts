import { forwardRef, Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from 'src/core/database/mysql/entity/post.entity';
import { PostImageModule } from '../post-image/post-image.module';
import { PostCommentModule } from '../post-comment/post-comment.module';
import { ActivityModule } from '../activity/activity.module';
import { PostLikeModule } from '../post-like/post-like.module';
import { PostCommentLikeModule } from '../post-comment-like/post-comment-like.module';
import { PostGiftModule } from '../post-gift/post-gift.module';
import { GiftModule } from '../gift/gift.module';
import { UserModule } from '../user/user.module';
import { PostReportingModule } from '../post-reporting/post-reporting.module';

@Module({
  controllers: [PostController],
  providers: [PostService],
  imports: [
    TypeOrmModule.forFeature([Post]),
    PostImageModule,
    PostCommentModule,
    forwardRef(() => ActivityModule),
    PostLikeModule,
    forwardRef(() => PostCommentLikeModule),
    PostGiftModule,
    GiftModule,
    UserModule,
    PostReportingModule,
  ],
})
export class PostModule {}
