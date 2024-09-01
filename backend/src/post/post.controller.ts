import { Controller, Get, Post, Body, Put, Param, Delete, Req, UnauthorizedException } from '@nestjs/common';
import { PostService } from './post.service';
import { Logger } from '@nestjs/common';
import { Public } from 'src/auth/decorators/public.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { CreateOrUpdatePostDto } from './dto/internal/create-or-update-post.dto';

@Controller('posts')
export class PostController {
    private readonly logger = new Logger(PostService.name);
    constructor(private readonly postService: PostService){}

    @Public()
    @Get('previews')
    findPostPreviews() {
        return this.postService.findPostPreviews();
    }

    @Public()
    @Get(':postId')
    findPostWithComments(@Param('postId') postId: number) {
        return this.postService.findPostWithComments(postId);
    }

    @Post()
    @Roles(Role.Admin)
    create(@Body() createOrUpdatePostDto: CreateOrUpdatePostDto) {
        return this.postService.create(createOrUpdatePostDto);
    }

    @Put(':postId') 
    @Roles(Role.Admin)
    update(@Param('postId') id: number, @Body() createOrUpdatePostDto: CreateOrUpdatePostDto) {
        return this.postService.update(id, createOrUpdatePostDto)
    }

    @Delete(':postId')
    @Roles(Role.Admin)
    delete(@Param('postId') id: number) {
        return this.postService.delete(id);
    }
}
