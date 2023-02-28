import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from 'src/core/database/mysql/entity/post.entity';
import { PostImageModule } from '../post-image/post-image.module';

@Module({
  controllers: [PostController],
  providers: [PostService],
  imports: [TypeOrmModule.forFeature([Post]), PostImageModule],
})
export class PostModule {}
