
import { Module } from '@nestjs/common';
import { UserCredentials } from './user-credentials.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserData } from './user-data.entity';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserCredentials, UserData])],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
