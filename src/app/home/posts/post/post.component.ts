import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { PostComment, PostData } from '../post.model';
import { PostService } from '../../post.service';
import { ActivatedRoute } from '@angular/router';
import { map, mergeMap, switchMap, take, tap } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit {

  postData!: PostData;
  postComments!: PostComment[];
  postId!: string;
  userId: string | null = null;
  isLoading = false;
  currentComment = "";

  constructor(
    private postsService: PostService,
    private authService: AuthService,
    private route: ActivatedRoute
    ) {}

 ngOnInit(): void {
    this.authService.userAuth.pipe(take(1)).subscribe((user) => {
      if(user) {
        this.userId = user.id;
      }
    });

    this.isLoading = true;
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
      this.isLoading = false;
    }
    );

 }

 onAddNewComment() {
    this.postsService.addPostComment(this.postId, this.currentComment)
      .subscribe(postComments => {
        this.postComments = postComments;
        this.currentComment = "";
      }
    );
 }
}
