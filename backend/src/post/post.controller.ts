import { Controller, Get, Post, Body, Put, Param, Delete, Req, UnauthorizedException } from '@nestjs/common';
import { PostService } from './post.service';
import { Post as PostEntity} from './post.entity';
import { Logger } from '@nestjs/common';
import { CreatePostDto } from './create-post.dto';
import { Public } from 'src/auth/decorators/public.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { AddPostCommentDto } from './add-post-comment.dto';

@Controller('posts')
export class PostController {
    private readonly logger = new Logger(PostService.name);
    constructor(private readonly postService: PostService){}

    @Public()
    @Get()
    findAll() {
        return this.postService.findAll();
    }

    @Public()
    @Get(':id')
    findOne(@Param('id') id: number) {
        return this.postService.findById(id);
    }

    @Post()
    @Roles(Role.Admin)
    create(@Body() dto: CreatePostDto) {
        return this.postService.create(dto);
    }

    @Post(':id/comments')
    addComment(@Param('id') postId: number, @Body() comment: AddPostCommentDto, @Req() req: any) {
        console.log(comment)
        const userCredentialsId = req.user?.userId;
      
        if (!userCredentialsId) {
          throw new UnauthorizedException('User not authenticated');
        }

        return this.postService.addComment(postId, userCredentialsId, comment);
    }


    @Put(':id') 
    @Roles(Role.Admin)
    update(@Param('id') id: number, @Body('isCompleted') isCompleted: boolean) {
        return this.postService.update(id, isCompleted)
    }

    @Delete(':id')
    @Roles(Role.Admin)
    delete(@Param('id') id: number) {
        return this.postService.delete(id);
    }


}
