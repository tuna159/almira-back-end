import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { VImage } from 'global/post/dto/image.dto';

export class VSendMessage {
  @IsString()
  @MinLength(1)
  user_id: string;

  @IsOptional()
  @MaxLength(4096)
  @IsString()
  content: string | null;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => VImage)
  images: VImage[] | null;
}
