import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject, exhaustMap, map, mergeMap, of, take, tap, throwError } from 'rxjs';

import { AuthService } from '../auth/auth.service';
import { environment } from '../../environments/environment';
import { PostPreviewResponseDto } from '@shared/dto/post/external/post-preview-response.dto'
import { PostResponseDto } from '@shared/dto/post/external/post-response.dto'
import { CreateOrUpdatePost } from '@shared/dto/post/internal/create-or-update-post'
@Injectable({
  providedIn: 'root'
})
export class PostService {

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService) { }

  fetchPostPreviews() {
    const httpUrl = environment.apiUrl + 'posts/previews';
    return this.http.get<PostPreviewResponseDto[]>(httpUrl);
  }
 
  fetchPost(postId: string) {
    const httpUrl = environment.apiUrl + `posts/${postId}`;
    return this.http.get<PostResponseDto>(httpUrl);
  }

  createPost(post: CreateOrUpdatePost) {

    const httpUrl = environment.apiUrl + "posts";
    return this.http.post(httpUrl, post).pipe(
        mergeMap((resData) => {
            return this.fetchPostPreviews();
        }),
    );
 
  }

  addPostComment(postId: string, newCommentContent: string) {
    const httpUrl = environment.apiUrl + `posts/${postId}/comments`;

    const newComment = {
      content: newCommentContent,
      date: new Date()
    }
    console.log
    return this.http.post(httpUrl, newComment).pipe(
                mergeMap((resData) => {
                    return this.fetchPost(postId);
                   
                }),
        );



   
}
}
