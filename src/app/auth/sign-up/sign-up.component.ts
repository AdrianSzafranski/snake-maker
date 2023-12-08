import { Component } from '@angular/core';
import { UserData } from 'src/app/user-profile/user-data.model';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent {
 userData: UserData = {
  email: '',
  username: '',
  avatar: '',
  birthdate: '',
  gender: '',
  roles: [],
  favGames: [],
 }
}
