import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { PostComment, PostData } from '../post.model';
import { PostService } from '../../post.service';
import { ActivatedRoute } from '@angular/router';
import { map, mergeMap, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit {

  postData!: PostData;
  postComments!: PostComment[];
  postId!: string;

  constructor(
    private postsService: PostService,
    private route: ActivatedRoute
    ) {}

 ngOnInit(): void {
  this.route.params.pipe(
    map((params) => {
      const postId = params['postId'];
      return postId;
    }),
    tap((postId: string) => {
      this.postId = postId;
    }),
    switchMap(postId => {
      return this.postsService.fetchPostData(postId);
    }),
    tap((postData: PostData) => {
      this.postData = postData
    }),
    switchMap(postData => {
      return this.postsService.fetchPostComments(this.postId);
    }),
    tap((postComments: PostComment[]) => {
      this.postComments = postComments
    }),
  ).subscribe((postComments) => {
    
  }
  );

 }

 onAddNewComment(newCommentContent: string) {
    this.postsService.addPostComment(this.postId, newCommentContent)
      .subscribe(postComments => {
        this.postComments = postComments;
      }
    );
 }
}