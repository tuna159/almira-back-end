import { IsString, IsOptional, MaxLength } from 'class-validator';

export class VUpdatePost {
  @IsOptional()
  @IsString()
  @MaxLength(800)
  content: string | null;
}
