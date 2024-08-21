import { Role } from "src/auth/enums/role.enum";
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany } from "typeorm"
import { UserData } from "./user-data.entity";
import { PostComment } from "src/post/post-comment.entity";
import { GameMap } from "src/game-map/game-map.entity";
import { UserScore } from "src/user-score/user-score.entity";


@Entity()
export class UserCredentials {
    @PrimaryGeneratedColumn()
    userCredentialsId: number

    @Column()
    email: string

    @Column()
    password: string

    @Column('simple-array', { default: '[Role.User]' })
    roles: Role[];

    @OneToOne(() => UserData, userData => userData.userCredentials)
    @JoinColumn()
    userData: UserData;

    @OneToMany(() => PostComment, (comment) => comment.userId)
    comments: PostComment[];

    @OneToMany(() => GameMap, (gamemap) => gamemap.userId)
    gameMaps: GameMap[];

    @OneToMany(() => UserScore, (userScore) => userScore.userId)
    userScores: UserScore[];
}