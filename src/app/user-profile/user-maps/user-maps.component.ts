import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';

import { GameMap } from 'src/app/snake-game/game-maps/game-map.model';
import { UserProfileService } from '../user-profile.service';
import { GameMapService } from 'src/app/snake-game/game-maps/game-map.service';
import { UserScore } from 'src/app/snake-game/user-score.model';

@Component({
  selector: 'app-user-maps',
  templateUrl: './user-maps.component.html',
  styleUrls: ['./user-maps.component.css']
})
export class UserMapsComponent implements OnInit {
  @Output() editMapId = new EventEmitter<GameMap>();
  userMaps: GameMap[] = [];
  displayedMapsStartIndex = 0;
  selectedUserMapArrayId: number | null = null;
  pagesNumber: number = 1;
  userScores: UserScore[] = [];

  constructor(
    private userProfileService: UserProfileService,
    private router: Router,
    private gameMapService: GameMapService
    ) {}

  ngOnInit(): void {

    this.userProfileService.fetchUserMaps().subscribe(userMaps => {
      this.userMaps = userMaps;
      this.pagesNumber =  Math.ceil(this.userMaps.length / 6);
    })

    this.gameMapService.fetchUserScores().subscribe(userScores => {
      this.userScores = userScores;
    });
  }

  getUserScore(currentMapId: string | undefined) {
    return this.userScores.find(userScore => userScore.idMap === currentMapId) ?? null;
  }

  onGetPreviousUserMaps() {
    if(this.displayedMapsStartIndex - 6 < 0) return;
    this.displayedMapsStartIndex -= 6;
  }

  onGetNextUserMaps() {
    if(this.displayedMapsStartIndex + 6 >=  this.userMaps.length) return;
    this.displayedMapsStartIndex += 6;
  }

  getDisplayedUserMaps() {
    return this.userMaps.slice(this.displayedMapsStartIndex, this.displayedMapsStartIndex + 6);
  }

  onSelectMap(mapArrayId: number) {

    if(this.selectedUserMapArrayId === mapArrayId) {
      this.selectedUserMapArrayId = null;
      return;
    }

 
    this.selectedUserMapArrayId = mapArrayId;
   
  }
  
  onStartGame() {
    if(this.selectedUserMapArrayId === null) {
      return;
    }
    
    const userMapId = this.userMaps[this.selectedUserMapArrayId].id;
    if(!userMapId) {
      return;
    }
    this.router.navigate(['/snake-game', "game", 'usersMaps', userMapId]);
  }

  onEditMap() {
    if(this.selectedUserMapArrayId === null) {
      return;
    }
   
    this.editMapId.next(this.userMaps[this.selectedUserMapArrayId]);
  }

  onPublishMap() {
    if(this.selectedUserMapArrayId === null) {
      return;
    }
    this.userProfileService.publishUserMap(this.userMaps[this.selectedUserMapArrayId]).subscribe(() => {
      if(this.selectedUserMapArrayId !== null) {
        this.userMaps.splice(this.selectedUserMapArrayId, 1);
      }
    }

    );
  }

  onDeleteMap() {
    if(this.selectedUserMapArrayId === null) {
      return;
    }
    this.userProfileService.deleteUserMap(this.userMaps[this.selectedUserMapArrayId]).subscribe(() => {
      if(this.selectedUserMapArrayId !== null) {
        this.userMaps.splice(this.selectedUserMapArrayId, 1);
      }
    });
  }
}
