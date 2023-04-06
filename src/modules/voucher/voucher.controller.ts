import { Body, Controller, Get, Post } from '@nestjs/common';
import { VoucherService } from './voucher.service';
import { IUserData } from 'src/core/interface/default.interface';
import { UserData } from 'src/core/decorator/user.decorator';
import { VCreateVoucher } from 'global/user/dto/voucher.dto';

@Controller('voucher')
export class VoucherController {
  constructor(private readonly voucherService: VoucherService) {}

  @Get('')
  async getVoucher() {
    return this.voucherService.getVoucher();
  }

  @Post()
  async createVoucher(
    @UserData() userData: IUserData,
    @Body() body: VCreateVoucher,
  ) {
    return this.voucherService.createVoucher(userData, body);
  }
}
