import { Controller, Post, Body, Param, Req, UnauthorizedException, Put, Delete } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { PostCommentService } from './post-comment.service';
import { SavePostCommentDto } from './dto/internal/save-post-comment.dto';

@Controller('posts/:postId/comments')
export class PostCommentController {
    private readonly logger = new Logger(PostCommentService.name);
    constructor(private readonly postService: PostCommentService){}

    @Post()
    create(@Param('postId') postId: number, @Body() savePostCommentDto: SavePostCommentDto, @Req() req: any) {

        const userCredentialsId = req.user?.userId;
      
        if (!userCredentialsId) {
          throw new UnauthorizedException('User not authenticated');
        }

        return this.postService.create(postId, userCredentialsId, savePostCommentDto);
    }

    @Put(':commentId') 
    update(
        @Param('postId') postId: number,
        @Param('commentId') commentId: number,  
        @Req() req: any,
        @Body() savePostCommentDto: SavePostCommentDto) {

        const userCredentialsId = req.user?.userId;
      
        if (!userCredentialsId) {
            throw new UnauthorizedException('User not authenticated');
        }
    
        return this.postService.update(postId, commentId, userCredentialsId, savePostCommentDto);
    }

    @Delete(':commentId')
    delete(@Param('postId') postId: number, @Param('commentId') commentId: number, @Req() req: any) {

        const userCredentialsId = req.user?.userId;
      
        if (!userCredentialsId) {
            throw new UnauthorizedException('User not authenticated');
        }

        return this.postService.delete(postId, commentId, userCredentialsId);
    }

}
