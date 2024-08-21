import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { Post } from './post.entity';
import { PostComment } from './post-comment.entity';
import { UserCredentials } from 'src/auth/user/user-credentials.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Post, PostComment, UserCredentials])],
  controllers: [PostController],
  providers: [PostService]
})
export class PostModule {}
