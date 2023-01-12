import { IsOptional, IsString } from 'class-validator';

export class VLogin {
  @IsString()
  username: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  access_token: string | null;
}
