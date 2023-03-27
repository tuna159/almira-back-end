import { IsString, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class VResetPassword {
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(255)
  password: string;

  @IsString()
  @IsNotEmpty()
  token: string;
}
