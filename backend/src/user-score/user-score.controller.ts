import { Controller, Get, Post, Body, Put, Param, Delete, Req, UnauthorizedException } from '@nestjs/common';
import { Logger } from '@nestjs/common';


import { UserScoreService } from './user-score.service';

@Controller('user-score')
export class UserScoreController {
    private readonly logger = new Logger(UserScoreService.name);
    constructor(private readonly userScoreService: UserScoreService){}
}
