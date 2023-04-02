import { Module } from '@nestjs/common';
import { Following } from 'src/core/database/mysql/entity/following.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FollowService } from './follow.service';
import { FollowController } from './follow.controller';

@Module({
  controllers: [FollowController],
  providers: [FollowService],
  imports: [TypeOrmModule.forFeature([Following])],
  exports: [TypeOrmModule, FollowService],
})
export class FollowingModule {}
