import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsArray, ArrayNotEmpty, IsEmail, MinLength, MaxLength, Matches, IsISO8601, ArrayMinSize, ArrayMaxSize, IsIn, ValidateNested } from 'class-validator';
import { ALLOWED_ROLES } from 'src/constants';
import { IsCorrectBirthDate } from 'src/validators/birthdate.validator';

export class SignUpUserDto {

  @IsNotEmpty({message: "email.required"})
  @IsString({message: "email.string"})
  @IsEmail({}, { message: 'email.email'})
  @MaxLength(254, { message: 'email.maxlength' })
  email: string;

  @IsNotEmpty({message: "password.required"})
  @IsString({message: "password.string"})
  @MinLength(8, { message: 'password.minlength' })
  @MaxLength(20, { message: 'password.maxlength' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#@$!%*?&])[A-Za-z\d#@$!%*?&]*$/, { message: 'password.pattern' })
  password: string;

  @IsNotEmpty({message: "username.required"})
  @IsString({message: "username.string"})
  @MinLength(2, { message: 'username.min_length' })
  @MaxLength(20, { message: 'username.max_length' })
  username: string;

  @IsArray({message: "avatar.array"})
  @ArrayNotEmpty({message: "avatar.required"})
  @ArrayMinSize(100, {message: "avatar.minsize"})
  @ArrayMaxSize(100, {message: "avatar.maxsize"})
  @IsString({ each: true, message: "avatar.string" })
  @Matches(/^#[0-9A-Fa-f]{6}$/, { each: true, message: 'avatar.pattern' })
  avatar: string[];

  @IsNotEmpty({message: "birthdate.required"})
  @IsISO8601({}, { message: 'birthdate.pattern' })
  @IsCorrectBirthDate()
  birthdate: string;

  @IsArray({message: "favGames.array"})
  @ArrayNotEmpty({message: "favGames.required"})
  @ArrayMinSize(1, {message: "favGames.minsize"})
  @ArrayMaxSize(10, {message: "favGames.maxsize"})
  @IsString({ each: true, message: "favGames.string" })
  @MinLength(3, { each: true, message: "favGames.minlength" })
  @MaxLength(20, { each: true, message: "favGames.maxlength" })
  favGames: string[];

  @IsNotEmpty({message: "gender.required"})
  @IsString({message: "gender.string"})
  gender: string;

  @IsArray({message: "joinReasons.array"})
  @ArrayNotEmpty({message: "joinReasons.required"})
  @ArrayMinSize(1, {message: "joinReasons.minsize"})
  @ArrayMaxSize(ALLOWED_ROLES.length, {message: "joinReasons.maxsize"})
  @IsString({ each: true, message: "joinReasons.string" })
  @IsIn(ALLOWED_ROLES, { each: true, message: "joinReasons.pattern" }) 
  joinReasons: string[];
}
