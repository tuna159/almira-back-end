import { IsString } from 'class-validator';

export class VForgotPassword {
  @IsString()
  phone_number: string;
}
