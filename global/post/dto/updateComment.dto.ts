import { IsString, MaxLength, MinLength } from 'class-validator';
import { ErrorMessage } from 'enum/error';

export class VUpdateComment {
  @IsString()
  @MinLength(1, { message: ErrorMessage.MIN_LENGTH_1 })
  @MaxLength(4096)
  content: string;
}
