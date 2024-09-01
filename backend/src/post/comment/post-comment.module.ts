import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostCommentService } from './post-comment.service';
import { PostCommentController } from './post-comment.controller';
import { PostComment } from './post-comment.entity';
import { UserCredentials } from 'src/auth/user/user-credentials.entity';
import { Post } from '../post.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Post, PostComment, UserCredentials])],
  controllers: [PostCommentController],
  providers: [PostCommentService]
})
export class PostCommentModule {}
