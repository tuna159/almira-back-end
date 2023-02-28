import { Module } from '@nestjs/common';
import { PostImageService } from './post-image.service';
import { PostImageController } from './post-image.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostImage } from 'src/core/database/mysql/entity/postImage.entity';

@Module({
  controllers: [PostImageController],
  providers: [PostImageService],
  imports: [TypeOrmModule.forFeature([PostImage])],
  exports: [TypeOrmModule, PostImageService],
})
export class PostImageModule {}
