import { IsString, MinLength } from 'class-validator';
import { ErrorMessage } from 'enum/error';

export class VBlockUser {
  @IsString()
  @MinLength(1, { message: ErrorMessage.MIN_LENGTH_1 })
  user_id: string;
}
