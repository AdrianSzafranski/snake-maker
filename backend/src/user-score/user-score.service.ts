import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserCredentials } from 'src/auth/user/user-credentials.entity';

import { UserScore } from './user-score.entity';

@Injectable()
export class UserScoreService {
    private readonly logger = new Logger(UserScoreService.name);
    constructor(
        @InjectRepository(UserScore)
        private userScoreRepository: Repository<UserScore>

    ){}

   
}
