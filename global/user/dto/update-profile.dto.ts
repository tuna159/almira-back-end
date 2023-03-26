import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  ValidateNested,
  IsObject,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ErrorMessage } from 'enum/error';

class VImage {
  @IsString()
  @MaxLength(512)
  image_url: string;
}

export class VUpdateProfile {
  @IsOptional()
  @IsString()
  image_url: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  @MinLength(5, { message: ErrorMessage.MIN_LENGTH_5 })
  user_name: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  introduction: string | null;
}
