import { Module } from '@nestjs/common';
import { VoucherService } from './voucher.service';
import { VoucherController } from './voucher.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Voucher } from 'src/core/database/mysql/entity/voucher.entity';

@Module({
  controllers: [VoucherController],
  providers: [VoucherService],
  imports: [TypeOrmModule.forFeature([Voucher])],
  exports: [TypeOrmModule, VoucherService],
})
export class VoucherModule {}
