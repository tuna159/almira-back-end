import { Module } from '@nestjs/common';
import { MeService } from './me.service';
import { MeController } from './me.controller';
import { User } from 'src/core/database/mysql/entity/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { UserBlockingModule } from '../user-blocking/user-blocking.module';
import { UserVoucherModule } from '../user-voucher/user-voucher.module';
import { UserDetailModule } from '../user-detail/user-detail.module';
import { AuthModule } from 'src/core/global/auth/auth.module';
import { FollowingModule } from '../follow/follow.module';

@Module({
  controllers: [MeController],
  providers: [MeService],
  imports: [
    TypeOrmModule.forFeature([User]),
    UserModule,
    UserBlockingModule,
    UserVoucherModule,
    UserDetailModule,
    AuthModule,
    FollowingModule,
  ],
})
export class MeModule {}
