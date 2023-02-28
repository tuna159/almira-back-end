import { IsString } from 'class-validator';

export class VSignUp {
  @IsString()
  username: string;

  @IsString()
  password: string;
}
