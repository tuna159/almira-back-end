import { IsNumber } from 'class-validator';

export class VRedeemVoucher {
  @IsNumber()
  voucher_id: number;
}
