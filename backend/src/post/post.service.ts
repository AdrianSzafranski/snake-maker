import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './post.entity';
import { CreatePostDto } from './create-post.dto';
import { AddPostCommentDto } from './add-post-comment.dto';
import { UserCredentials } from 'src/auth/user/user-credentials.entity';
import { UserController } from 'src/auth/user/user.controller';
import { PostComment } from './post-comment.entity';

@Injectable()
export class PostService {
    private readonly logger = new Logger(PostService.name);
    constructor(
        @InjectRepository(Post)
        private postRepository: Repository<Post>,
        @InjectRepository(PostComment)
        private commentRepository: Repository<PostComment>,
        @InjectRepository(UserCredentials)
        private userCredentialsRepository: Repository<UserCredentials>

    ){}

    findAll() {
        return this.postRepository.find();
    }

    async findById(id: number): Promise<any> {
        const post =  await this.postRepository.createQueryBuilder('post')
          .leftJoinAndSelect('post.comments', 'comment')
          .leftJoin('comment.userId', 'userCredentials')
          .leftJoinAndSelect('userCredentials.userData', 'userData')
          .select([
            'post.id',
            'post.title',
            'post.content',
            'comment.id',
            'comment.content',
            'comment.date',
            'userCredentials.email',
            'userData.username',
            'userData.avatar'
          ])
          .where('post.id = :id', { id })
          .getOne();


        const newPost: any = post;
          // Mapowanie komentarzy, aby przekształcić strukturę
        if (newPost && newPost.comments) {
            newPost.comments = newPost.comments.map(comment => ({
            id: comment.id,
            content: comment.content,
            date: comment.date,
            authorUsername: comment.userId?.userData?.username,
            authorAvatar: comment.userId?.userData?.avatar,
            }));

        return newPost;
     }
    }
    

    create(createPostDto: CreatePostDto): Promise<Post> {
        const post = this.postRepository.create(createPostDto);
        return this.postRepository.save(post);
    }

    async addComment(postId: number, userCredentialsId: number, addPostCommentDto: AddPostCommentDto): Promise<PostComment> {
        
        const post = await this.postRepository.findOneBy({
            id: postId 
        });
      
        if (!post) {
        throw new NotFoundException('Post not found');
        }

                // Pobierz użytkownika
            const userCredentials = await this.userCredentialsRepository.findOneBy({ userCredentialsId: userCredentialsId });
            if (!userCredentials) {
            throw new NotFoundException('User not found');
            }

        const comment = this.commentRepository.create({
            ...addPostCommentDto,
            userId: userCredentials,// Odniesienie do użytkownika za pomocą ID
            postId: post
           
        });

        return this.commentRepository.save(comment);
    }

    async update(id: number, isCompleted: boolean) {
        const post = await this.postRepository.findOne({where: {id: id}})
        if(post) {
            //post.isCompleted = isCompleted;
            return this.postRepository.save(post);
        }
        return null;
    }

    delete(id: number) {
        return this.postRepository.delete(id).then(() => {})
    }


}
