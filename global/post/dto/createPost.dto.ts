import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsBoolean,
  MaxLength,
  IsArray,
  ArrayMaxSize,
  ValidateNested,
  IsNumber,
  IsEnum,
} from 'class-validator';
import { VImage } from './image.dto';
import { EPostType } from 'enum';

export class VCreatePost {
  @IsOptional()
  @MaxLength(800)
  @IsString()
  content: string | null;

  @IsArray()
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => VImage)
  images: VImage[];

  @IsBoolean()
  is_incognito: boolean | null;

  @IsNumber()
  @IsEnum(EPostType)
  post_type: EPostType;
}
