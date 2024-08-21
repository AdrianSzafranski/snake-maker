import { Component } from '@angular/core';
import { UserData } from 'src/app/user-profile/user-data.model';
import { UserProfile } from 'src/app/user-profile/user-profile';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent {
 userData: UserProfile = {
  username: '',
  avatar: [],
  birthdate: '',
  gender: '',
  joinReasons: [],
  favGames: [],
 }
}
