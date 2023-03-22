import { Module } from '@nestjs/common';
import { UserVoucherService } from './user-voucher.service';
import { UserVoucherController } from './user-voucher.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserVoucher } from 'src/core/database/mysql/entity/userVoucher.entity';
import { VoucherModule } from '../voucher/voucher.module';
import { UserModule } from '../user/user.module';

@Module({
  controllers: [UserVoucherController],
  providers: [UserVoucherService],
  imports: [TypeOrmModule.forFeature([UserVoucher]), VoucherModule, UserModule],
  exports: [TypeOrmModule, UserVoucherService],
})
export class UserVoucherModule {}
