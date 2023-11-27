import { Component } from '@angular/core';
import { Subscription, take } from 'rxjs';

import { AuthService } from 'src/app/auth/auth.service';
import { PostData } from './post.model';
import { PostService } from '../post.service';
import firebaseConfig from '../../config';
@Component({
  selector: 'app-posts',
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.css']
})
export class PostsComponent {
  postsData: PostData[] = [];
  userId: string | null = null;
  adminId = firebaseConfig.adminId;
  isLoading = false;

  constructor(
    private postService: PostService,
    private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.user.pipe(take(1)).subscribe((user) => {
      if(user) {
        this.userId = user.id;
      }
    } 
    );

    this.isLoading = true;
    this.postService.fetchPostsData().subscribe(postsData => {
      this.postsData = postsData;
      this.isLoading = false;
    });
  }

  receiveActualPostsData(postsData: PostData[]) {
    this.postsData = postsData;
  }
}
