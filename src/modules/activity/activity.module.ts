import { forwardRef, Module } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { ActivityController } from './activity.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Activity } from 'src/core/database/mysql/entity/activity.entity';
import { PostModule } from '../post/post.module';
import { PostLikeModule } from '../post-like/post-like.module';
import { PostCommentLikeModule } from '../post-comment-like/post-comment-like.module';
import { UserBlockingModule } from '../user-blocking/user-blocking.module';

@Module({
  controllers: [ActivityController],
  providers: [ActivityService],
  imports: [
    TypeOrmModule.forFeature([Activity]),
    UserBlockingModule,
    PostCommentLikeModule,
    PostLikeModule,
    forwardRef(() => PostModule),
  ],
  exports: [TypeOrmModule, ActivityService],
})
export class ActivityModule {}
