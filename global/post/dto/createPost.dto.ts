import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsBoolean,
  MaxLength,
  IsArray,
  ArrayMaxSize,
  ValidateNested,
} from 'class-validator';
import { VImage } from './image.dto';

export class VCreatePost {
  @IsOptional()
  @MaxLength(800)
  @IsString()
  content: string | null;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => VImage)
  images: VImage[] | null;

  @IsOptional()
  @IsBoolean()
  is_incognito: boolean | null;
}
