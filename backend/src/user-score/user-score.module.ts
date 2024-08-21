import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserScoreService } from './user-score.service';
import { UserScoreController } from './user-score.controller';
import { UserScore } from './user-score.entity';
@Module({
  imports: [TypeOrmModule.forFeature([UserScore])],
  controllers: [UserScoreController],
  providers: [UserScoreService]
})
export class UserScoreModule {}
