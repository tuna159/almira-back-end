import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/core/database/mysql/entity/user.entity';
import { AuthModule } from 'src/core/global/auth/auth.module';
import { FollowingModule } from '../follow/follow.module';
import { UserBlockingModule } from '../user-blocking/user-blocking.module';

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => AuthModule),
    FollowingModule,
    UserBlockingModule,
  ],
  exports: [TypeOrmModule, UserService],
})
export class UserModule {}
