import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class VSendMessage {
  @IsString()
  @MinLength(1)
  user_id: string;

  @IsOptional()
  @MaxLength(4096)
  @IsString()
  content: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  image_url: string;
}
