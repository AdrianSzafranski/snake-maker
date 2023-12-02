import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { User } from '../auth/user.model';
import { take, tap } from 'rxjs';
import { UserProfileService } from './user-profile.service';
import { UserDetails } from './user-details.model';
import { UserData } from './user-data.model';
import { GameMap } from '../snake-game/game-maps/game-map.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {

  isEditMode = false;
  editMap: GameMap | null = null;
  isShowUserMaps = true;
  userData: UserData = {
    username: 'Adrian',
    email: 'adrian@gmail.com',
    id: '3',
    avatar: '[["#ff4040","#ff4040","#ff4040","#ff4040","#ff4040","#ff4040","#ff4040","#ff4040","#ff4040","#ff4040"],["#ff4040","#ff4040","#ff4040","#ff4040","#ff4040","#ff4040","#ff4040","#ff4040","#ff4040","#ff4040"],["#ff4040","#ff4040","#000","#000","#ff4040","#ff4040","#000","#000","#ff4040","#ff4040"],["#ff4040","#ff4040","#000","#000","#ff4040","#ff4040","#000","#000","#ff4040","#ff4040"],["#ff4040","#ff4040","#ff4040","#ff4040","#000","#000","#ff4040","#ff4040","#ff4040","#ff4040"],["#ff4040","#ff4040","#ff4040","#000","#000","#000","#000","#ff4040","#ff4040","#ff4040"],["#ff4040","#ff4040","#ff4040","#000","#000","#000","#000","#ff4040","#ff4040","#ff4040"],["#ff4040","#ff4040","#ff4040","#000","#ff4040","#ff4040","#000","#ff4040","#ff4040","#ff4040"],["#ff4040","#ff4040","#ff4040","#ff4040","#ff4040","#ff4040","#ff4040","#ff4040","#ff4040","#ff4040"],["#ff4040","#ff4040","#ff4040","#ff4040","#ff4040","#ff4040","#ff4040","#ff4040","#ff4040","#ff4040"]]',
    birthdate: '1996-01-01',
    favGames: ["Snake"],
    roles: ["friend"],
    gender: 'male'

  };

  constructor (private userProfileService: UserProfileService, private router: Router) {}

  ngOnInit(): void {
    this.userProfileService.fetchUserData().subscribe(userData => {
      this.userData = userData;
    }
    );

  }

  onSwitchMode() {
    this.isEditMode = !this.isEditMode;
  }

  setNewUserData(userData: UserData) {
    this.userData = userData;
    this.isEditMode = false;
  }

  onShowUserMaps() {
    this.isShowUserMaps = true;
    this.editMap = null;
  }

  onShowAddMapsForm() {
    this.isShowUserMaps = false;
    this.editMap = null;
  }

  setEditMap(editMap: GameMap) {

    this.editMap = editMap;
    this.isShowUserMaps = false;

  }

  showUserMaps(isShowUserMaps: boolean) {
    if(isShowUserMaps) {
      this.isShowUserMaps = true;
      this.editMap = null;
    }
  }
}
