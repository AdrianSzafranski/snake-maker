import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';

import { GameMap } from 'src/app/snake-game/game-maps/game-map.model';
import { UserProfileService } from '../user-profile.service';
import { GameMapService } from 'src/app/snake-game/game-maps/game-map.service';
import { UserScore } from 'src/app/snake-game/user-score.model';

@Component({
  selector: 'app-user-game-maps',
  templateUrl: './user-game-maps.component.html',
  styleUrls: ['./user-game-maps.component.css']
})
export class UserGameMapsComponent implements OnInit {
  @Output() editMapId = new EventEmitter<GameMap>();
  userGameMaps: GameMap[] = [];
  displayedGameMapsStartIndex = 0;
  selectedUserGameMapArrayId: number | null = null;
  pagesNumber: number = 1;
  userScores: UserScore[] = [];

  constructor(
    private userProfileService: UserProfileService,
    private router: Router,
    private gameMapService: GameMapService
    ) {}

  ngOnInit(): void {

    this.userProfileService.fetchUserMaps().subscribe(userMaps => {
      this.userGameMaps = userMaps;
      this.pagesNumber =  Math.ceil(this.userGameMaps.length / 6);
    })

    this.gameMapService.fetchUserScores().subscribe(userScores => {
      this.userScores = userScores;
    });
  }

  getUserScore(currentMapId: string | undefined) {
    return this.userScores.find(userScore => userScore.idMap === currentMapId) ?? null;
  }

  onGetPreviousPage() {
    if(this.displayedGameMapsStartIndex - 6 < 0) return;
    this.displayedGameMapsStartIndex -= 6;
  }

  onGetNextPage() {
    if(this.displayedGameMapsStartIndex + 6 >=  this.userGameMaps.length) return;
    this.displayedGameMapsStartIndex += 6;
  }

  getDisplayedUserGameMaps() {
    return this.userGameMaps.slice(this.displayedGameMapsStartIndex, this.displayedGameMapsStartIndex + 6);
  }

  onSelectMap(mapArrayId: number) {

    if(this.selectedUserGameMapArrayId === mapArrayId) {
      this.selectedUserGameMapArrayId = null;
      return;
    }

 
    this.selectedUserGameMapArrayId = mapArrayId;
   
  }
  
  onStartGame() {
    if(this.selectedUserGameMapArrayId === null) {
      return;
    }
    
    const userMapId = this.userGameMaps[this.selectedUserGameMapArrayId].id;
    if(!userMapId) {
      return;
    }
    this.router.navigate(['/snake-game', "game", 'usersMaps', userMapId]);
  }

  onEditMap() {
    if(this.selectedUserGameMapArrayId === null) {
      return;
    }
   
    this.editMapId.next(this.userGameMaps[this.selectedUserGameMapArrayId]);
  }

  onPublishMap() {
    if(this.selectedUserGameMapArrayId === null) {
      return;
    }
    this.userProfileService.publishUserMap(this.userGameMaps[this.selectedUserGameMapArrayId]).subscribe(() => {
      if(this.selectedUserGameMapArrayId !== null) {
        this.userGameMaps.splice(this.selectedUserGameMapArrayId, 1);
      }
    }

    );
  }

  onDeleteMap() {
    if(this.selectedUserGameMapArrayId === null) {
      return;
    }
    this.userProfileService.deleteUserMap(this.userGameMaps[this.selectedUserGameMapArrayId]).subscribe(() => {
      if(this.selectedUserGameMapArrayId !== null) {
        this.userGameMaps.splice(this.selectedUserGameMapArrayId, 1);
      }
    });
  }
}
