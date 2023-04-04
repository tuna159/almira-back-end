import { IsNumber } from 'class-validator';

export class VVerify {
  @IsNumber()
  OTP: number;
}
