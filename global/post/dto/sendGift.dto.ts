import { IsNumber, IsString, MinLength } from 'class-validator';
import { ErrorMessage } from 'enum/error';

export class VSendGift {
  @IsString()
  @MinLength(1, { message: ErrorMessage.MIN_LENGTH_1 })
  user_id: string;

  @IsNumber()
  gift_id: number;
}
