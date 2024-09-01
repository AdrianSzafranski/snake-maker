import { UserCredentials } from "src/auth/user/user-credentials.entity";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm"
import { Post } from "../post.entity";

@Entity()
export class PostComment {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    content: string

    @Column()
    date: string

    @ManyToOne(() => UserCredentials, (user) => user.comments)
    userId: UserCredentials;
  
    @ManyToOne(() => Post, (post) => post.comments)
    postId: Post;

}


