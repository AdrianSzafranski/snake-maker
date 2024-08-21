import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { UserCredentials } from 'src/auth/user/user-credentials.entity';
import { GameMap } from './game-map.entity';
import { UserScore } from 'src/user-score/user-score.entity';

@Injectable()
export class GameMapService {
    private readonly logger = new Logger(GameMapService.name);
    constructor(
        @InjectRepository(GameMap)
        private gameMapRepository: Repository<GameMap>,
        @InjectRepository(UserCredentials)
        private userCredentialsRepository: Repository<UserCredentials>,
        @InjectRepository(UserScore)
        private userScoreRepository: Repository<UserScore>

    ){}


    async findGameMap(gameMapId: number, userCredentialsId: number) {
      //return this.gameMapRepository.find();

      const gameMap =  await this.gameMapRepository.createQueryBuilder('gameMap')
      .leftJoinAndSelect('gameMap.userScores', 'userScore')
      .leftJoinAndSelect('gameMap.userId', 'userCredentials')
      .select([
        'gameMap',
        'userScore',
        'userCredentials'
      ])
      .where('gameMap.id = :id', { id: gameMapId })
      .andWhere(
        new Brackets((qb) => {
            qb.where('gameMap.isPublic = :isPublic', { isPublic: true })
              .orWhere(
                new Brackets((qb) => {
                    qb.where('gameMap.isPublic = :isPublic2', { isPublic2: false })
                      .andWhere('userCredentials.userCredentialsId = :userCredentialsId', { userCredentialsId: userCredentialsId });
                })
              )
        })
      )
      .getOne();
      
      const newGameMap: any = gameMap;
      
    if (newGameMap) {
          const bestScore = newGameMap?.userScores[0]?.bestScore ? newGameMap.userScores[0].bestScore: 0;
          const gamesNumber = newGameMap?.userScores[0]?.gamesNumber ? newGameMap.userScores[0].gamesNumber : 0;
          delete newGameMap.userScores;
      
      return {
        bestScore: bestScore,
        gamesNumber: gamesNumber,
        ...newGameMap
         
    }

  }
 
  return newGameMap;
  }



    async findGameMaps(isPublic: boolean, isOfficial: boolean, userCredentialsId: number) {
     
      const query  =  this.gameMapRepository.createQueryBuilder('gameMap')
      .leftJoinAndSelect('gameMap.userScores', 'userScore')
      .leftJoinAndSelect('gameMap.userId', 'userCredentials')
      .leftJoinAndSelect('userCredentials.userData', 'userData')
      .select([
        'gameMap',
        'userScore',
        'userCredentials.userCredentialsId',
        'userData.username',
        'userData.avatar'
      ])
      .where('gameMap.isOfficial = :isOfficial', { isOfficial })
      .andWhere('userScore.userId = :id', { id: userCredentialsId })
      .andWhere('gameMap.isPublic = :isPublic', { id: userCredentialsId,  isPublic: isPublic })

      if(!isPublic) {
        query .andWhere('userCredentials.userCredentialsId = :userCredentialsId', { userCredentialsId: userCredentialsId })
      }
     
      const gameMaps = await query.getMany();
      console.log(gameMaps)
      let newGameMaps: any = gameMaps;
      
        // Mapowanie komentarzy, aby przekształcić strukturę
      if (newGameMaps) {
        newGameMaps =  newGameMaps.map(newGameMap => {
            const { userScores, newGameMapWithoutUserScore } = newGameMap;
            const bestScore = userScores[0]?.bestScore ? userScores[0].bestScore : 0;
            const gamesNumber = userScores[0]?.gamesNumber ? userScores[0].gamesNumber : 0;
            delete newGameMap.userScores;
        return {
          bestScore: bestScore,
          gamesNumber: gamesNumber,
          ...newGameMap
           
      }});
 
    
    
    } 

    return newGameMaps;
  }


  async updateUserScore(idMap: number, userCredentialsId: number, userScore: any) {
    const userScoreRecord = await this.userScoreRepository.findOne({ where: { gameMapId: { id: idMap }, userId: { userCredentialsId: userCredentialsId } },  relations: ['gameMapId', 'userId'] });
    console.log('fa');
    console.log(userScoreRecord);
    console.log(userScore);
    console.log('fa');
    if(userScoreRecord) {
      const result = await this.userScoreRepository.createQueryBuilder()
      .update(UserScore)
      .set({ bestScore: userScore.bestScore, gamesNumber: userScore.gamesNumber })
      .where('gameMapId = :mapId', { mapId: idMap })
      .andWhere('userId = :userId', { userId: userCredentialsId })
      .andWhere('gamesNumber = :gamesNumber', { gamesNumber: userScore.gamesNumber - 1 })
      .execute();
  
      return result.affected > 0;
    } else  {
        // Pobierz użytkownika
        const userCredentials = await this.userCredentialsRepository.findOneBy({ userCredentialsId: userCredentialsId });
        if (!userCredentials) {
        throw new NotFoundException('User not found');
        }
        
           // Pobierz mape
           const gameMap = await this.gameMapRepository.findOneBy({ id: idMap });
           if (!userCredentials) {
           throw new NotFoundException('Game map not found');
           }

      const newUserScore = this.userScoreRepository.create(
        {
        ...userScore,
        userId: userCredentials,
        gameMapId: gameMap
        }
      );


      const savedNewUserScore = await this.userScoreRepository.save(newUserScore);

      return savedNewUserScore
    }


  }

    async publishGameMap(id: number, userCredentialsId: number) {
      const result = await this.gameMapRepository.createQueryBuilder()
      .update(GameMap)
      .set({ isPublic: true })
      .where('id = :mapId', { mapId: id })
      .andWhere('userId = :userId', { userId: userCredentialsId })
      .execute();

      return result.affected > 0;
    }

    async create(data: any, userCredentialsId): Promise<any> {

            // Pobierz użytkownika
            const userCredentials = await this.userCredentialsRepository.findOneBy({ userCredentialsId: userCredentialsId });
            if (!userCredentials) {
            throw new NotFoundException('User not found');
            }
      

      const gameMap = this.gameMapRepository.create(
        {
        ...data,
        userId: userCredentials
        }
      );


      const savedUserCredentials = await this.gameMapRepository.save(gameMap);
  
   

      return gameMap;
  }
}
