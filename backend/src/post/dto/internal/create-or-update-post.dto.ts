import { IsString, IsNotEmpty, MinLength, MaxLength, Matches, IsArray, ArrayNotEmpty, ArrayMinSize, ArrayMaxSize } from 'class-validator';
import { CreateOrUpdatePost } from '@shared/dto/post/internal/create-or-update-post' 

export class CreateOrUpdatePostDto implements CreateOrUpdatePost {

  @IsNotEmpty({message: "title.required"})
  @IsString({message: "title.string"})
  @MinLength(5, { message: 'title.min_length' })
  @MaxLength(60, { message: 'title.max_length' })
  title: string;

  @IsNotEmpty({message: "content.required"})
  @IsString({message: "content.string"})
  @MinLength(20, { message: 'content.min_length' })
  @MaxLength(1000, { message: 'content.max_length' })
  content: string;

  @IsNotEmpty({message: "imageUrl.required"})
  @IsString({message: "imageUrl.string"})
  @MaxLength(255, { message: 'imageUrl.max_length' })
  @Matches(/^https:\/\/.*\.(jpg|jpeg|png|gif)$/i, { message: 'imageUrl.pattern' })
  imageUrl: string

  @IsNotEmpty({message: "imageAlt.required"})
  @IsString({message: "imageAlt.string"})
  @MinLength(5, { message: 'imageAlt.min_length' })
  @MaxLength(60, { message: 'imageAlt.max_length' })
  imageAlt: string

  @IsArray({message: "hashtags.array"})
  @ArrayNotEmpty({message: "hashtags.required"})
  @ArrayMinSize(1, {message: "hashtags.minsize"})
  @ArrayMaxSize(7, {message: "hashtags.maxsize"})
  @IsString({ each: true, message: "hashtags.string" })
  @MinLength(3, { each: true, message: "hashtags.minlength" })
  @MaxLength(20, { each: true, message: "hashtags.maxlength" })
  hashtags: string[];
}

