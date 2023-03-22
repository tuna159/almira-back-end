import { IsString, IsOptional, MaxLength, IsBoolean } from 'class-validator';

export class VUpdatePost {
  @IsOptional()
  @IsString()
  @MaxLength(800)
  content: string | null;

  @IsBoolean()
  is_incognito: boolean | null;
}
