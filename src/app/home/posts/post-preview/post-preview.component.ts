import { Component, Input } from '@angular/core';
import { PostData } from '../post.model';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-post-preview',
  templateUrl: './post-preview.component.html',
  styleUrls: ['./post-preview.component.css']
})
export class PostPreviewComponent {
  @Input() postData!: PostData;

  constructor(private router: Router, private route: ActivatedRoute) {}

  onShowContentPreview() {
    if(this.postData.content.length <= 50) {
      return this.postData.content;
    }
    return this.postData.content.substring(0, 50) + "...";
  }

  onRedirectToPostDetails() {
    if(!this.postData.id) {
      return;
    }
    this.router.navigate(['post', this.postData.id], {relativeTo: this.route});
  }
}
