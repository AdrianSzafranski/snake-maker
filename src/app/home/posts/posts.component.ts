import { Component } from '@angular/core';
import { take } from 'rxjs';

import { AuthService } from 'src/app/auth/auth.service';
import { PostData } from './post.model';
import { PostService } from '../post.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-posts',
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.css']
})
export class PostsComponent {
  postsData: PostData[] = [];
  userId: string | null = null;
  adminId = environment.firebaseAdminId;
  isLoading = false;

  constructor(
    private postService: PostService,
    private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.userAuth.pipe(take(1)).subscribe((userAuth) => {
      if(userAuth) {
        this.userId = userAuth.id;
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
