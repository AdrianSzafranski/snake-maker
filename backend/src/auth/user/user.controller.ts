import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Put,
    Request,
    UnauthorizedException,
    UseGuards,
    UsePipes,
    ValidationPipe
  } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDataDto } from './user-dto/update-user-data.dto';


@Controller('user')
export class UserController {
    constructor(private userService: UserService) {}


    @Get()
    async getProfile(@Request() req): Promise<any> {
      const userId = req.user?.userId; // Zakłada, że ID użytkownika jest w req.user
      if (!userId) {
        throw new UnauthorizedException('User not authenticated');
      }
      return this.userService.findOneById(userId);
    }

    @Put('edit')
    async updateProfile(
      @Request() req: any,
      @Body() updateUserDataDto: UpdateUserDataDto
    ) {
      const userCredentialsId = req.user?.userId;
      
      if (!userCredentialsId) {
        throw new UnauthorizedException('User not authenticated');
      }
      return this.userService.updateUserData(userCredentialsId, updateUserDataDto);
      
    }
}



  
