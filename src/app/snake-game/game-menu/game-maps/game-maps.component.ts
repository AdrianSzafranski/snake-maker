import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameMap } from './game-map.model';
import { GameMapService } from './game-map.service';


@Component({
  selector: 'app-game-maps',
  templateUrl: './game-maps.component.html',
  styleUrls: ['./game-maps.component.css']
})
export class GameMapsComponent implements OnInit {

  gameMaps: GameMap[] = [];
  displayedMapsStartIndex = 0;
  selectedMap?: number;
  pagesNumber!: number;
  isLoading = false;

  constructor(private gameMapsService: GameMapService, private router: Router){
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.gameMapsService.fetchMaps().subscribe(gameMaps => {
      this.gameMaps = gameMaps;
      this.pagesNumber =  Math.ceil(this.gameMaps.length / 6);
      this.isLoading = false;
    });
  }

  onStartGame(mapId?: number) {
    if(!mapId) {
      return;
    }
    
    this.selectedMap = mapId;
    this.router.navigate(['/snake-game', "game", this.selectedMap]);
  }

  onGetPreviousMaps() {
    if(this.displayedMapsStartIndex - 6 < 0) return;
    this.displayedMapsStartIndex -= 6;
  }

  onGetNextMaps() {
    if(this.displayedMapsStartIndex + 6 >=  this.gameMaps.length) return;
    this.displayedMapsStartIndex += 6;
  }

  getDisplayedMaps() {
    return this.gameMaps.slice(this.displayedMapsStartIndex, this.displayedMapsStartIndex + 6);
  }

}
