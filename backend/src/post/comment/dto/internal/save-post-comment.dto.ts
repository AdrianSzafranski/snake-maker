import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';

export class SavePostCommentDto {
  
  @IsNotEmpty()
  content: string;
  @IsNotEmpty()
  date: string;

}
