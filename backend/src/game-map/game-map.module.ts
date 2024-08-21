import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserCredentials } from 'src/auth/user/user-credentials.entity';
import { GameMap } from './game-map.entity';
import { GameMapService } from './game-map.service';
import { GameMapController } from './game-map.controller';
import { UserScore } from 'src/user-score/user-score.entity';
@Module({
  imports: [TypeOrmModule.forFeature([GameMap, UserCredentials, UserScore])],
  controllers: [GameMapController],
  providers: [GameMapService]
})
export class GameMapModule {}
