import { IsString, MaxLength, MinLength } from 'class-validator';

export class VReportPostDto {
  @IsString()
  @MaxLength(1000)
  @MinLength(1)
  message: string;
}
