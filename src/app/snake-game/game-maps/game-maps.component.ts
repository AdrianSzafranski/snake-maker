import { Component, OnInit } from '@angular/core';
import { ViewportScroller } from '@angular/common';
import { Router } from '@angular/router';
import { GameMap } from './game-map.model';
import { GameMapService } from './game-map.service';
import { UserScore } from '../user-score.model';


@Component({
  selector: 'app-game-maps',
  templateUrl: './game-maps.component.html',
  styleUrls: ['./game-maps.component.css']
})
export class GameMapsComponent implements OnInit {

  gameMaps: GameMap[] = [];
  unofficialGameMaps: GameMap[] = [];
  displayedGameMapsStartIndex = 0;
  selectedGameMap?: string;
  pagesNumber!: number;
  unOfficialGameMapsPagesNumber!: number;
  isLoading = false;
  isOfficialGameMaps = true;
  userScores: UserScore[] = [];

  constructor(
    private gameMapsService: GameMapService, 
    private router: Router,
    private viewportScroller: ViewportScroller) {
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.gameMapsService.fetchMaps().subscribe(gameMaps => {
      this.gameMaps = gameMaps;
      this.pagesNumber = Math.ceil(this.gameMaps.length / 6);
      this.isLoading = false;
    });

    this.gameMapsService.fetchUnofficialMaps().subscribe(unofficialMaps => {
      this.unofficialGameMaps = unofficialMaps;
      this.unOfficialGameMapsPagesNumber = Math.ceil(this.unofficialGameMaps.length / 6);
    });

    this.gameMapsService.fetchUserScores().subscribe(userScores => {
      this.userScores = userScores;
    });
  }

  getUserScore(currentGameMapId: string | undefined) {
    return this.userScores.find(userScore => userScore.idMap === currentGameMapId) ?? null;
  }

  onStartGame(gameMapId?: string) {
    if (!gameMapId) {
      return;
    }

    this.selectedGameMap = gameMapId;
    let gameMapType = 'gameMaps';
    if (!this.isOfficialGameMaps) {
      gameMapType = 'unofficialMaps';
    }
    this.router.navigate(['/snake-game', "game", gameMapType, this.selectedGameMap]);
  }

  onGetPreviousPage() {
    if (this.displayedGameMapsStartIndex - 6 < 0) return;
    this.displayedGameMapsStartIndex -= 6;
    this.scrollToTop();
  }

  onGetNextPage() {
    let gameMapsNumber = 0;
    if (this.isOfficialGameMaps) {
      gameMapsNumber = this.gameMaps.length;
    } else {
      gameMapsNumber = this.unofficialGameMaps.length;
    }

    if (this.displayedGameMapsStartIndex + 6 >= gameMapsNumber) return;
    this.displayedGameMapsStartIndex += 6;
    this.scrollToTop();
  }

  getDisplayedGameMaps() {
    if (this.isOfficialGameMaps) {
      return this.gameMaps.slice(this.displayedGameMapsStartIndex, this.displayedGameMapsStartIndex + 6);
    } else {
      return this.unofficialGameMaps.slice(this.displayedGameMapsStartIndex, this.displayedGameMapsStartIndex + 6);
    }
  }

  onShowOfficialGameMaps() {
    this.isOfficialGameMaps = true;
    this.displayedGameMapsStartIndex = 0;
  }

  onShowUsersGameMaps() {
    this.isOfficialGameMaps = false;
    this.displayedGameMapsStartIndex = 0;
  }

  scrollToTop() {
    this.viewportScroller.scrollToPosition([0, 0]);
  }
}
