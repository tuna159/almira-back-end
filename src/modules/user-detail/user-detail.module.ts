import { Module } from '@nestjs/common';
import { UserDetailService } from './user-detail.service';
import { UserDetailController } from './user-detail.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserDetail } from 'src/core/database/mysql/entity/userDetail.entity';

@Module({
  providers: [UserDetailService],
  controllers: [UserDetailController],
  imports: [TypeOrmModule.forFeature([UserDetail])],
  exports: [TypeOrmModule, UserDetailService],
})
export class UserDetailModule {}
