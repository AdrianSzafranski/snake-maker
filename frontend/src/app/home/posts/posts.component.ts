import { Component } from '@angular/core';
import { take } from 'rxjs';

import { AuthService } from 'src/app/auth/auth.service';
import { PostService } from '../post.service';
import { environment } from '../../../environments/environment';
import { PostPreviewResponseDto } from '@shared/dto/post/external/post-preview-response.dto';

@Component({
  selector: 'app-posts',
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.css']
})
export class PostsComponent {
  postsData: PostPreviewResponseDto[] = [];
  userCredentialId: number | null = null;
  accountRoles: string[] = [];
  adminId = environment.firebaseAdminId;
  isLoading = false;

  constructor(
    private postService: PostService,
    private authService: AuthService) {}

  ngOnInit(): void {
    this.accountRoles = ['user']
    this.authService.userAuth.pipe(take(1)).subscribe((userAuth) => {
      if(userAuth) {
        this.userCredentialId = userAuth.id;
        this.accountRoles = userAuth.accountRoles;
      }
    } 
    
    );

    this.isLoading = true;
    this.postService.fetchPostPreviews().subscribe(postPreviews => {
      this.postsData = postPreviews;
      
      this.isLoading = false;
    });
  }

  receiveActualPostsData(postsData: PostPreviewResponseDto[]) {
    this.postsData = postsData;
  }
}
