import { Component, ElementRef, Input, Renderer2, ViewChild } from '@angular/core';

@Component({
  selector: 'app-user-avatar',
  templateUrl: './user-avatar.component.html',
  styleUrls: ['./user-avatar.component.css']
})
export class UserAvatarComponent {
  @Input() userAvatar!: string;
  @ViewChild('userAvatarContainer', {static: true}) userAvatarContainer!: ElementRef;
  constructor(private renderer: Renderer2) {}

  ngOnInit(): void {
    if(!this.userAvatar) {
      return;
    }
    this.drawAvatar();
  }

  drawAvatar() {
    const avatarCanvas = this.renderer.createElement('canvas');
    this.renderer.setAttribute(avatarCanvas, 'width', '500');
    this.renderer.setAttribute(avatarCanvas, 'height', '500');

    const avatarContext = avatarCanvas.getContext('2d');

    const avatarArray = JSON.parse(this.userAvatar);
    for(let row = 0; row < 10; row++) {
      for(let column = 0; column < 10; column++) {
        avatarContext.fillStyle = avatarArray[row][column];
        avatarContext.fillRect(column * 50, row * 50, 50, 50); 
      }
    }

    const avatarURL = avatarCanvas.toDataURL();

    const img = this.renderer.createElement('img');
    this.renderer.setAttribute(img, 'src', avatarURL);
    this.renderer.setAttribute(img, 'alt', "user avatar");

    const userAvatarElement = this.userAvatarContainer.nativeElement;
    this.renderer.appendChild(userAvatarElement, img);
  }

}
