import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { PostComment } from '../../post.model';
import { formatDate } from '@angular/common';
@Component({
  selector: 'app-post-comment',
  templateUrl: './post-comment.component.html',
  styleUrls: ['./post-comment.component.css']
})
export class PostCommentComponent implements OnInit {
  @ViewChild('avatarCanvas', {static: true}) avatarCanvasRef!: ElementRef;
  @Input() postComment!: PostComment;
  avatarCanvas !: HTMLCanvasElement;
  avatarCanvasContext !: CanvasRenderingContext2D

  ngOnInit(): void {
    const canvasContext = this.avatarCanvasRef.nativeElement.getContext('2d');
    if(!canvasContext) {
        throw new Error('Cannot access canvasContext');
    }
    this.avatarCanvasContext = canvasContext;

    this.drawAvatar();
  }

  drawAvatar() {
    if(!this.postComment.authorAvatar) {
      return;
    }

    const avatarArray = JSON.parse(this.postComment.authorAvatar);
    for(let row = 0; row < 10; row++) {
      for(let column = 0; column < 10; column++) {
        this.avatarCanvasContext.fillStyle = avatarArray[row][column];
        this.avatarCanvasContext.fillRect(column * 5, row * 5, 5, 5); 
      }
    }
    
  }

  getCommentDate() {
    return formatDate(this.postComment.date, 'MM/dd/yyyy HH:mm', 'en-US');
  }
}

