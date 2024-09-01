import { Component, EventEmitter, Output } from '@angular/core';
import { PostService } from '../../post.service';
import { NgForm } from '@angular/forms';
import { PostPreviewResponseDto } from '@shared/dto/post/external/post-preview-response.dto';
import { CreateOrUpdatePost } from '@shared/dto/post/internal/create-or-update-post';

@Component({
  selector: 'app-post-form',
  templateUrl: './post-form.component.html',
  styleUrls: ['./post-form.component.css']
})
export class PostFormComponent {
  @Output() postsData = new EventEmitter<PostPreviewResponseDto[]>();

  isLoading = false;
  error: string | null = null;
  isShowForm = true;

  constructor(private postService: PostService) {}

    onAddPost(form: NgForm) {
    if(!form.valid) {
      return;
    }

    const title = form.value.title;
    const imageUrl = form.value.imageUrl;
    const content = form.value.content;
    const post: CreateOrUpdatePost = {
      title: title,
      imageUrl: imageUrl,
      content: content,
      imageAlt: 'It is imageAlt',
      hashtags: ['nothing', 'nothing', 'nothing']
      
    };

    this.isLoading = true;
    this.postService.createPost(post)
      .subscribe({
        next: post => {
          this.postsData.emit(post);
          this.isLoading = false;
          form.reset();
        },
        error: errorMessage => {
          this.error = errorMessage.message;
          this.isLoading = false;
        }
      });

  }

  onShowForm() {
    this.isShowForm = !this.isShowForm;
  }
}
