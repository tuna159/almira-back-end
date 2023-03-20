import { Module } from '@nestjs/common';
import { UserBlockingService } from './user-blocking.service';
import { UserBlockingController } from './user-blocking.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserBlocking } from 'src/core/database/mysql/entity/userBlocking.entity';

@Module({
  controllers: [UserBlockingController],
  providers: [UserBlockingService],
  imports: [TypeOrmModule.forFeature([UserBlocking])],
  exports: [TypeOrmModule, UserBlockingService],
})
export class UserBlockingModule {}
