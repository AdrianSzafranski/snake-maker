import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';

export class AddPostCommentDto {
  @IsNotEmpty()
  content: string;
  @IsNotEmpty()
  date: string;

}
