import { Component, EventEmitter, Output } from '@angular/core';
import { PostService } from '../../post.service';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { PostData } from '../post.model';

@Component({
  selector: 'app-post-form',
  templateUrl: './post-form.component.html',
  styleUrls: ['./post-form.component.css']
})
export class PostFormComponent {
  @Output() postsData = new EventEmitter<PostData[]>();

  isLoading = false;
  error: string | null = null;
  isShowForm = true;

  constructor(
    private postService: PostService,
    private router: Router
    ) {}

    onAddPost(form: NgForm) {
    if(!form.valid) {
      return;
    }

    const title = form.value.title;
    const imageUrl = form.value.imageUrl;
    const content = form.value.content;
    const postData = {
      title: title,
      imageUrl: imageUrl,
      content: content,
      date: new Date()
    };

    this.isLoading = true;
    this.postService.addPostData(postData)
      .subscribe({
        next: postsData => {
          this.postsData.emit(postsData);
          this.isLoading = false;
        },
        error: errorMessage => {
          this.error = errorMessage.message;
          this.isLoading = false;
        }
      });

    form.reset();
  }

  onShowForm() {
    this.isShowForm = !this.isShowForm;
  }
}
