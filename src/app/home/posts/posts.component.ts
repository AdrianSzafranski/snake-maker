import { Component } from '@angular/core';
import { PostData } from './post.model';
import { Subscription } from 'rxjs';
import { PostService } from '../post.service';

@Component({
  selector: 'app-posts',
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.css']
})
export class PostsComponent {
  postsData: PostData[] = [];
  
  constructor(private postService: PostService) {}

  ngOnInit(): void {
    this.postService.fetchPostsData().subscribe(postsData => {
      this.postsData = postsData;
    });
  }

  receiveActualPostsData(postsData: PostData[]) {
    this.postsData = postsData;
  }
}
