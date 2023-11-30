import { Component, Input } from '@angular/core';
import { UserData } from '../user-data.model';

@Component({
  selector: 'app-user-data',
  templateUrl: './user-data.component.html',
  styleUrls: ['./user-data.component.css']
})
export class UserDataComponent {
  @Input() userData!: UserData;

  avatarLength = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  avatarArray: string[][] = Array.from({ length: 10 }, () => Array(10).fill('#FFFFFF'));
}
