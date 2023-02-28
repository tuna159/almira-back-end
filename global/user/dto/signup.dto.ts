import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EGender } from 'enum/default.enum';

class VImage {
  @IsString()
  image_url: string;

  @IsString()
  thumbnail_url: string;
}

export class VSignUp {
  @IsString()
  username: string;

  @IsString()
  password: string;

  @IsEmail()
  email: string;

  @IsString()
  phone_number: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => VImage)
  image: VImage;

  @IsEnum(EGender)
  gender: EGender;

  @IsDateString()
  birthdate: Date;
}
