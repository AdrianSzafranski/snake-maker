import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from "typeorm"
import { PostComment } from "./comment/post-comment.entity"
import { UserCredentials } from "src/auth/user/user-credentials.entity"

@Entity()
export class Post {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    title: string

    @Column()
    content: string

    @Column()
    date: string

    @Column()
    imageUrl: string

    @Column()
    imageAlt: string

    @Column('simple-array', { default: '[]' })
    hashtags: string[]

    @Column()
    likesCount: number

    @OneToMany(() => PostComment, (comment) => comment.postId)
    comments: PostComment[];

    @ManyToOne(() => UserCredentials, (user) => user.comments)
    userId: UserCredentials;

}