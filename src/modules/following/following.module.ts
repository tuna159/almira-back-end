import { Module } from '@nestjs/common';
import { FollowingService } from './following.service';
import { FollowingController } from './following.controller';
import { Following } from 'src/core/database/mysql/entity/following.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [FollowingController],
  providers: [FollowingService],
  imports: [TypeOrmModule.forFeature([Following])],
  exports: [TypeOrmModule, FollowingService],
})
export class FollowingModule {}
