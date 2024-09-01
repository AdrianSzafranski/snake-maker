import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from "typeorm"
import { UserCredentials } from "./user-credentials.entity";

@Entity()
export class UserData {
    @PrimaryGeneratedColumn()
    userDataId: number

    @Column()
    username: string

    @Column('simple-array', { default: '[]' })
    avatar: string[]

    @Column()
    birthdate: string

    @Column('simple-array', { default: '[]' })
    favGames: string[]

    @Column()
    gender: string

    @Column('simple-array', { default: '' })
    joinReasons: string[]

    @OneToOne(() => UserCredentials, userCredentials => userCredentials.userData)
    userCredentials: UserCredentials;
    
}

