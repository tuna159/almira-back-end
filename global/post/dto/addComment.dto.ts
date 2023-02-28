import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';

export class VAddComment {
  @IsOptional()
  @MaxLength(4096)
  @IsString()
  content: string | null;

  @IsOptional()
  @IsBoolean()
  is_incognito: boolean | null;
}
