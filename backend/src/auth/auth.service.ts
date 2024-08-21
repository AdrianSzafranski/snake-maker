
import { Injectable, Dependencies, UnauthorizedException, ConflictException, HttpException, HttpStatus } from '@nestjs/common';
import { UserService } from './user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SignUpUserDto } from './user/user-dto/sign-up-user.dto';
import { SignInUserDto } from './user/user-dto/sign-in-user.dto';
import { UserCredentials } from './user/user-credentials.entity';

@Injectable()
@Dependencies(UserService, JwtService)
export class AuthService {

  constructor(private userService: UserService, private jwtService: JwtService) {}

  async signIn(signInDto: SignInUserDto) {

    const user = await this.userService.findByEmail(signInDto.email);

    if (!user || !(await bcrypt.compare(signInDto.password, user.password))) {
      
      throw new HttpException(
        {
          statusCode: HttpStatus.UNAUTHORIZED,
          error: 'Unauthorized',
          message: {"account": "account.unauthorized"},
        },
        HttpStatus.UNAUTHORIZED
      );
    }

    const payload = { userId: user.userCredentialsId, sub: user.userCredentialsId, roles: user.roles };

    return {
      message: 'User logged successfully',
      userId: user.userCredentialsId,
      email: user.email,
      accountRoles: user.roles,
      accessToken: await this.jwtService.signAsync(payload),
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN
    };
  }

  async signUp(signUpUserDto: SignUpUserDto) {

    const existingUser = await this.userService.findByEmail(signUpUserDto.email);

    if (existingUser) {
      throw new ConflictException('email.exist');
    }

    // Hash password
    signUpUserDto.password = await bcrypt.hash(signUpUserDto.password, 10);

    // Create new user
    const userCredentials: UserCredentials = await this.userService.signUp(signUpUserDto);

    const payload = { userId: userCredentials.userCredentialsId, sub: userCredentials.userCredentialsId, roles: userCredentials.roles  };

    return {
      message: 'User registered successfully',
      userId: userCredentials.userCredentialsId,
      email: userCredentials.email,
      accountRoles: userCredentials.roles,
      accessToken: await this.jwtService.signAsync(payload),
      expiresIn:  process.env.ACCESS_TOKEN_EXPIRES_IN
    };
  }
}




