import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { formatDate } from '@angular/common';
import { CommentResponseDto } from '@shared/dto/post/external/post-response.dto';
@Component({
  selector: 'app-post-comment',
  templateUrl: './post-comment.component.html',
  styleUrls: ['./post-comment.component.css']
})
export class PostCommentComponent {

  @Input() postComment!: CommentResponseDto;
  
  getCommentDate() {
    console.log(this.postComment);
    return formatDate(this.postComment.date, 'MM/dd/yyyy HH:mm', 'en-US');
  }

  getAuthorAvatar() {
    return this.postComment.authorAvatar as string[];
  }
}

