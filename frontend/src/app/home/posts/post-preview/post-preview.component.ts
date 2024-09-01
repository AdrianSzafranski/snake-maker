import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PostPreviewResponseDto } from '@shared/dto/post/external/post-preview-response.dto';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';

@Component({
  selector: 'app-post-preview',
  templateUrl: './post-preview.component.html',
  styleUrls: ['./post-preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PostPreviewComponent {
  @Input() postData!: PostPreviewResponseDto;

  constructor(private router: Router, private route: ActivatedRoute) {}

  onShowContentPreview() {
    if(this.postData.contentPreview.length <= 50) {
      return this.postData.contentPreview;
    }
    return this.postData.contentPreview.substring(0, 50) + "...";
  }

  onRedirectToPostDetails() {
    console.log(this.postData);
    if(!this.postData.id) {
      return;
    }
    this.router.navigate(['post', this.postData.id], {relativeTo: this.route});
  }
}
