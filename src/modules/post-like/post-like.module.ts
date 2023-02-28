import { Module } from '@nestjs/common';
import { PostLikeService } from './post-like.service';
import { PostLikeController } from './post-like.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostLike } from 'src/core/database/mysql/entity/postLike.entity';

@Module({
  controllers: [PostLikeController],
  providers: [PostLikeService],
  imports: [TypeOrmModule.forFeature([PostLike])],
  exports: [TypeOrmModule, PostLikeService],
})
export class PostLikeModule {}
