import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class VUpdatePassword {
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(40)
  oldPassword: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(40)
  newPassword: string;
}
