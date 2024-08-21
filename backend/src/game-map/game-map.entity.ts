import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from "typeorm"
import { UserCredentials } from "src/auth/user/user-credentials.entity"
import { UserScore } from "../user-score/user-score.entity"

@Entity()
export class GameMap {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    backgroundFirstColor: string

    @Column()
    heightInElements: number

    @Column()
    backgroundSecondColor: string

    @Column()
    widthInElements: number

    @Column('real')
    secondsPerElement: number

    @Column()
    name: string

    @Column()
    obstacleColor: string

    @Column()
    obstacles: string

    @Column()
    snakeColor: string

    @Column()
    snakeInitCoords: string

    @Column()
    snakeInitDirection: string
    
    @Column({ default: false }) 
    isPublic: boolean

    @Column({ default: false }) 
    isOfficial: boolean

    @ManyToOne(() => UserCredentials, (user) => user.gameMaps)
    userId: UserCredentials;

    @OneToMany(() => UserScore, (userScore) => userScore.gameMapId)
    userScores: UserScore[];
  
}