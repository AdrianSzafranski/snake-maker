import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject, exhaustMap, map, mergeMap, of, take, tap, throwError } from 'rxjs';

import { PostComment, PostData } from './posts/post.model';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PostService {

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService) { }


  fetchPostsData() {
    const httpUrl = environment.apiUrl + 'posts';
    return this.http.get<any>(httpUrl).pipe(
      map(postsDataObject => {
        return Object.keys(postsDataObject).map(key => ({ id: key, ...postsDataObject[key] }));
      }),
      map(postsData => {
        return postsData.reverse();
      }),
     
    );
  }
 
  fetchPostData(postId: string) {
    const httpUrl = environment.apiUrl + `posts/${postId}`;
    return this.http.get<any>(httpUrl);
  }

  addPostData(postData: PostData) {

    const httpUrl = environment.apiUrl + "posts";
    return this.http.post(httpUrl, postData).pipe(
        mergeMap((resData) => {
            return this.fetchPostsData();
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
                    return this.fetchPostData(postId);
                   
                }),
        );



   
}
}
