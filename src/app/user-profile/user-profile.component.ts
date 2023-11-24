import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { User } from '../auth/user.model';
import { take } from 'rxjs';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  avatarLength = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  avatarArray: string[][] = Array.from({ length: 10 }, () => Array(10).fill('#FFFFFF'));
  user: User | null = null;
  
  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.user.pipe(take(1)).subscribe(user => {
      this.user = user;
      if(user) {
        this.avatarArray = JSON.parse(user.avatar);
      }
    }
    );
  }

  onChangeColor() {
    
  }
}
