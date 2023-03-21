import { Module } from '@nestjs/common';
import { PostGiftService } from './post-gift.service';
import { PostGiftController } from './post-gift.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostGift } from 'src/core/database/mysql/entity/postGift.entity';

@Module({
  controllers: [PostGiftController],
  providers: [PostGiftService],
  imports: [TypeOrmModule.forFeature([PostGift])],
  exports: [TypeOrmModule, PostGiftService],
})
export class PostGiftModule {}
