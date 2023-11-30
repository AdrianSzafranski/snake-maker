import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { PostComment } from '../../post.model';
import { formatDate } from '@angular/common';
@Component({
  selector: 'app-post-comment',
  templateUrl: './post-comment.component.html',
  styleUrls: ['./post-comment.component.css']
})
export class PostCommentComponent {

  @Input() postComment!: PostComment;
  
  getCommentDate() {
    return formatDate(this.postComment.date, 'MM/dd/yyyy HH:mm', 'en-US');
  }
}

