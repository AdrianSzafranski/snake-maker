import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserCredentials } from 'src/auth/user/user-credentials.entity';
import { DeleteResult, Repository } from 'typeorm';
import { Post } from '../post.entity';
import { PostComment } from './post-comment.entity';
import { SavePostCommentDto } from './dto/internal/save-post-comment.dto';

@Injectable()
export class PostCommentService {
    private readonly logger = new Logger(PostCommentService.name);
    constructor(
        @InjectRepository(Post)
        private postRepository: Repository<Post>,
        @InjectRepository(PostComment)
        private postCommentRepository: Repository<PostComment>,
        @InjectRepository(UserCredentials)
        private userCredentialsRepository: Repository<UserCredentials>

    ){}

    async create(postId: number, userCredentialsId: number, savePostCommentDto: SavePostCommentDto): Promise<PostComment> {
        
        const post = await this.postRepository.findOneBy({ id: postId });
        if (!post) {
            throw new NotFoundException(`postComment.notExists`);
        }

        const userCredentials = await this.userCredentialsRepository.findOneBy({ userCredentialsId: userCredentialsId });
        if (!userCredentials) {
            throw new NotFoundException(`user.notExists`);
        }

        const comment = this.postCommentRepository.create({
            ...savePostCommentDto,
            userId: userCredentials,
            postId: post
        });

        return this.postCommentRepository.save(comment);
    }

    async update(postId: number, commentId: number, userCredentialsId: number, savePostCommentDto: SavePostCommentDto): Promise<PostComment> {

        const comment = await this.postCommentRepository.findOne({ where: 
            { 
                id: commentId, 
                postId: { id: postId }, 
                userId: { userCredentialsId: userCredentialsId } 
            }});

        if (!comment) {
            throw new NotFoundException(`postComment.notExists`);
        }

        Object.assign(comment, savePostCommentDto);
    
        return await this.postCommentRepository.save(comment);
    }

    
    async delete(postId: number, commentId: number, userCredentialsId: number): Promise<DeleteResult> {
        
        const comment = await this.postCommentRepository.findOne({ where: 
            { 
                id: commentId, 
                postId: { id: postId }, 
                userId: { userCredentialsId: userCredentialsId } 
            }});

        if (!comment) {
            throw new NotFoundException(`postComment.notExists`);
        }

        return await this.postCommentRepository.delete(commentId);
    }

}
