import { IsEmail, IsNumber, IsOptional, IsString } from 'class-validator';

export class VSignUp {
  @IsString()
  username: string;

  @IsString()
  password: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  image_url: string;

  @IsString()
  introduction: string;

  @IsString()
  phone_number: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;
}
