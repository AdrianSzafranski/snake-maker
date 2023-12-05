import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject, exhaustMap, map, mergeMap, of, take, tap, throwError } from 'rxjs';

import { PostComment, PostData } from './posts/post.model';
import { AuthService } from '../auth/auth.service';
import firebaseConfig from '../config';

@Injectable({
  providedIn: 'root'
})
export class PostService {

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService) { }


  fetchPostsData() {
    const httpUrl = firebaseConfig.dbUrl + 'posts/data.json';
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
    const httpUrl = firebaseConfig.dbUrl + `posts/data/${postId}.json`;
    return this.http.get<any>(httpUrl).pipe(
      map(postDataObject => {
        return { id: postId, ...postDataObject };
      }))
  }

  fetchPostComments(postId: string) {
    const httpUrl = firebaseConfig.dbUrl + `posts/comments/${postId}.json`;
    const httpUrlUsers = firebaseConfig.dbUrl + `users/.json`;
    let postComments: PostComment[]; 

    return this.http.get<any>(httpUrl).pipe(
      map(postCommentsObject => {
        if(!postCommentsObject) {
          return [];
        }
        return Object.keys(postCommentsObject).map(key => ({ postId: key, ...postCommentsObject[key] }));
      }),
      tap((localPostComments: PostComment[]) => {
        postComments = localPostComments;
      }),
      mergeMap((postComments) => {
        return this.http.get<any>(httpUrlUsers);
      }),
      map(users => {
        return postComments.map(key => {
          key.authorUsername = users[''+key.authorId].username;
          key.authorAvatar = users[''+key.authorId].avatar;
          return key;
        }
        )}),
    )
  }

  addPostData(postData: PostData) {

    const httpUrl = firebaseConfig.dbUrl + "posts/data.json";
    return this.http.post(httpUrl, postData).pipe(
        mergeMap((resData) => {
            return this.fetchPostsData();
        }),
    );
 
  }

  addPostComment(postId: string, newCommentContent: string) {
    const httpUrl = firebaseConfig.dbUrl + `posts/comments/${postId}.json`;

    return this.authService.userAuth.pipe(
        take(1), 
        exhaustMap(userAuth => {
           
            if(!userAuth) {
                return throwError(() => new Error("Error"));
            }

            const newComment = {
                authorId: userAuth.id,
                content: newCommentContent,
                date: new Date()
            }

            return this.http.post(httpUrl, newComment).pipe(
                mergeMap((resData) => {
                    return this.fetchPostComments(postId);
                   
                }),
        );
        })
    );

   
}
}
