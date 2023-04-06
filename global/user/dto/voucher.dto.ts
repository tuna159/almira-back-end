import {
  IsString,
  IsOptional,
  MaxLength,
  IsNumber,
  IsDateString,
} from 'class-validator';

export class VCreateVoucher {
  @IsOptional()
  @MaxLength(800)
  @IsString()
  voucher_name: string;

  @IsDateString()
  start_time: Date;

  @IsDateString()
  expired_time: Date;

  @IsNumber()
  point: number;
}
