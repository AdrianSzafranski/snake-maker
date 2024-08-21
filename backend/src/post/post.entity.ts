import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm"
import { PostComment } from "./post-comment.entity"

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

    @OneToMany(() => PostComment, (comment) => comment.postId)
    comments: PostComment[];

}