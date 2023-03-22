import { Controller } from '@nestjs/common';
import { UserVoucherService } from './user-voucher.service';

@Controller('user-voucher')
export class UserVoucherController {
  constructor(private readonly userVoucherService: UserVoucherService) {}
}
