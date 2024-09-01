import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { Post } from './post.entity';
import { PostResponseDto } from '@shared/dto/post/external/post-response.dto';
import { PostPreviewResponseDto } from '@shared/dto/post/external/post-preview-response.dto';
import { CreateOrUpdatePostDto } from './dto/internal/create-or-update-post.dto';

@Injectable()
export class PostService {

    private readonly logger = new Logger(PostService.name);
    constructor(
        @InjectRepository(Post)
        private postRepository: Repository<Post>
    ){}

    async findPostPreviews(): Promise<PostPreviewResponseDto[]> {

        const postPreviews =  await this.postRepository
            .createQueryBuilder('post')
            .leftJoin('post.userId', 'userCredentials')
            .leftJoinAndSelect('userCredentials.userData', 'userData')
            .leftJoin('post.comments', 'postComment')
            .select([
                'post.id AS id', 
                'post.title AS title', 
                'post.imageUrl AS imageUrl', 
                'post.imageAlt AS imageAlt', 
                'post.hashtags AS hashtags', 
                'post.likesCount AS likesCount', 
                'post.date AS date', 
                'substr(post.content, 1, 100) AS contentPreview',
                'userCredentials.userCredentialsId AS authorId',
                'userData.username AS authorUsername',
                'COUNT(postComment.id) AS commentsCount'])
            .addGroupBy('post.title')
            .addGroupBy('post.imageUrl')
            .addGroupBy('post.imageAlt')
            .addGroupBy('post.hashtags')
            .addGroupBy('post.likesCount')
            .addGroupBy('post.date')
            .addGroupBy('substr(post.content, 1, 100)')
            .addGroupBy('userCredentials.userCredentialsId')
            .addGroupBy('userData.username')
            .getRawMany();

        postPreviews.forEach(post => {
            post.hashtags = post.hashtags ? post.hashtags.split(',') : [];
        });

        if (!postPreviews) {
            throw new NotFoundException(`postPreview.notExists`);
        }
        console.log(postPreviews);
        return postPreviews;
    }

    async findPostWithComments(postId: number): Promise<PostResponseDto> {

        const post =  await this.postRepository.createQueryBuilder('post')
          .leftJoinAndSelect('post.comments', 'comment')
          .leftJoin('comment.userId', 'userCredentials')
          .leftJoinAndSelect('userCredentials.userData', 'userData')
          .select([
            'post',
            'post.title',
            'post.imageUrl',
            'post.content',
            'comment.id',
            'comment.content',
            'comment.date',
            'userCredentials.userCredentialsId',
            'userData.username',
            'userData.avatar'
          ])
          .where('post.id = :id', { id: postId })
          .getOne();
          
        if (!post) {
            throw new NotFoundException(`post.notExists`);
        }

        const postResponse: PostResponseDto = {
            id: post.id,
            title: post.title,
            content: post.content,
            imageUrl: post.imageUrl,
            date: new Date(post.date),
            comments: (post?.comments ?? []).map(comment => ({
              id: comment.id,
              content: comment.content,
              date: new Date(comment.date),
              authorUsername: comment.userId?.userData?.username || '',
              authorAvatar: comment.userId?.userData?.avatar || [],
            })),
          };
        
        return postResponse;
     }
    
    create(createOrUpdatePostDto: CreateOrUpdatePostDto): Promise<Post> {

        const post = this.postRepository.create(
            {
                ...createOrUpdatePostDto,
                likesCount: 0,
                date: (new Date()).toISOString()
            }
        );
        return this.postRepository.save(post);
    }

    async update(id: number, createOrUpdatePostDto: CreateOrUpdatePostDto): Promise<Post | null> {

        const post = await this.postRepository.findOne({where: {id: id}})

        if (!post) {
            throw new NotFoundException(`post.notExists`);
        }

        post.title = createOrUpdatePostDto.title;
        post.content = createOrUpdatePostDto.content;
        post.imageUrl = createOrUpdatePostDto.imageUrl;
        return this.postRepository.save(post);
    }

    async delete(id: number): Promise<DeleteResult> {
        return await this.postRepository.delete(id);
    }

}
