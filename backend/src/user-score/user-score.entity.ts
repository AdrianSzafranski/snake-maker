import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from "typeorm"
import { UserCredentials } from "src/auth/user/user-credentials.entity"
import { GameMap } from "../game-map/game-map.entity"

@Entity()
export class UserScore {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    gamesNumber: number
    
    @Column()
    bestScore: number;

    @ManyToOne(() => UserCredentials, (user) => user.userScores)
    userId: UserCredentials;

    @ManyToOne(() => GameMap, (gameMap) => gameMap.userScores)
    gameMapId: GameMap;
  
}