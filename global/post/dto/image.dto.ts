import { IsString, MaxLength, MinLength } from 'class-validator';
import { ErrorMessage } from 'enum/error';

export class VImage {
  @IsString()
  @MinLength(1, { message: ErrorMessage.MIN_LENGTH_1 })
  @MaxLength(512)
  image_url: string;
}
