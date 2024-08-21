import { IsString, IsNotEmpty, IsEmail, MaxLength, MinLength, Matches } from 'class-validator';

export class SignInUserDto {

  @IsNotEmpty({message: "email.required"})
  @IsString({message: "email.string"})
  @IsEmail({}, { message: 'email.pattern'})
  @MaxLength(254, { message: 'email.maxlength' })
  email: string;

  @IsNotEmpty({message: "password.required"})
  @IsString({message: "password.string"})
  @MinLength(8, { message: 'password.minlength' })
  @MaxLength(20, { message: 'password.maxlength' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#@$!%*?&])[A-Za-z\d#@$!%*?&]*$/, { message: 'password.pattern' })
  password: string;
}


