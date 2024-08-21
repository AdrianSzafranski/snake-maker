import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  @IsString()
  content?: string;

  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}
