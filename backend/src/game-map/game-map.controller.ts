import { Controller, Get, Post, Body, Put, Param, Delete, Req, UnauthorizedException, Query } from '@nestjs/common';
import { Logger } from '@nestjs/common';

import { GameMapService } from './game-map.service';

@Controller('game-maps')
export class GameMapController {
    private readonly logger = new Logger(GameMapService.name);
    constructor(private readonly gameMapService: GameMapService){}


    @Get()
    findGameMaps(@Query('isPublic') isPublic: boolean, @Query('isOfficial') isOfficial: boolean, @Req() req: any) {
      
      const userCredentialsId = req.user?.userId;
      
      if (!userCredentialsId) {
        throw new UnauthorizedException('User not authenticated');
      }

      return this.gameMapService.findGameMaps(isPublic, isOfficial, userCredentialsId);
    }

    @Get(':id')
    findGameMap(@Param('id') id: number, @Req() req: any) {
       
      const userCredentialsId = req.user?.userId;
      
      if (!userCredentialsId) {
        throw new UnauthorizedException('User not authenticated');
      }

      return this.gameMapService.findGameMap(id, userCredentialsId);
    }

 
    @Post('add')
    create(@Body() dto: any, @Req() req: any) {

      const userCredentialsId = req.user?.userId;
      
        if (!userCredentialsId) {
          throw new UnauthorizedException('User not authenticated');
        }

        return this.gameMapService.create(dto, userCredentialsId);
    }
   

    @Put('user-score/edit/:id') 
    updateUserScore(@Param('id') id: number, @Body() userScore: any, @Req() req: any) {
      console.log('test')
      const userCredentialsId = req.user?.userId;
      
      if (!userCredentialsId) {
        throw new UnauthorizedException('User not authenticated');
      }



        return this.gameMapService.updateUserScore(id, userCredentialsId, userScore);
    }
    
    @Put('public/:id') 
    publishGameMaps(@Param('id') id: number, @Body() isPublic: any, @Req() req: any) {
      console.log('test')
      const userCredentialsId = req.user?.userId;
      
      if (!userCredentialsId) {
        throw new UnauthorizedException('User not authenticated');
      }



        return this.gameMapService.publishGameMap(id, userCredentialsId);
    }
}
