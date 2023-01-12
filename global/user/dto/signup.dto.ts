import { IsOptional, IsString, IsEmail } from 'class-validator';

export class VSignUp {
  @IsEmail()
  @IsString()
  email_address: string;

  @IsString()
  phone_number: string | null;

  @IsString()
  username: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  access_token: string | null;
}
