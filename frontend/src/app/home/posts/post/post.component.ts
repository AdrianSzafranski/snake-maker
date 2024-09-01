import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { PostService } from '../../post.service';
import { ActivatedRoute } from '@angular/router';
import { map, mergeMap, switchMap, take, tap } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { PostResponseDto } from '@shared/dto/post/external/post-response.dto';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit {

  post!: PostResponseDto;
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
        return this.postsService.fetchPost(postId);
      }),
      tap((post: any) => {
        this.post = post;     
      }),
    ).subscribe((postComments) => {
      this.isLoading = false;
    }
    );

 }

 onAddNewComment() {

    this.postsService.addPostComment(this.postId, this.currentComment)
      .subscribe(post => {
        this.post = post;   
        this.currentComment = "";
      }
    );
 }
}
