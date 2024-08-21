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
  userCredentialId: number | null = null;
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
        this.userCredentialId = user.id;
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
      tap((postData: any) => {
       
        const { comments, ...postWithoutComments } = postData;
        
        this.postData = postWithoutComments
        this.postComments = comments;

     
      }),
    ).subscribe((postComments) => {
      this.isLoading = false;
    }
    );

 }

 onAddNewComment() {

    this.postsService.addPostComment(this.postId, this.currentComment)
      .subscribe(postData => {
        const { comments, ...postWithoutComments } = postData;
        this.postData = postWithoutComments
        this.postComments = comments;
        this.currentComment = "";
      }
    );
 }
}
