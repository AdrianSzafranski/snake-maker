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
  unofficialMaps: GameMap[] = [];
  displayedMapsStartIndex = 0;
  selectedMap?: string;
  pagesNumber!: number;
  unOfficialMapsPagesNumber!: number;
  isLoading = false;
  isOfficialMaps = true;
  
  constructor(private gameMapsService: GameMapService, private router: Router){
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.gameMapsService.fetchMaps().subscribe(gameMaps => {
      this.gameMaps = gameMaps;
      this.pagesNumber =  Math.ceil(this.gameMaps.length / 6);
      this.isLoading = false;
    });

    this.gameMapsService.fetchUnofficialMaps().subscribe(unofficialMaps => {
      this.unofficialMaps = unofficialMaps;
      this.unOfficialMapsPagesNumber =  Math.ceil(this.unofficialMaps.length / 6);
    });
  }

  onStartGame(mapId?: string) {
    if(!mapId) {
      return;
    }
    
    this.selectedMap = mapId;
    let mapType = 'gameMaps';
    if(!this.isOfficialMaps) {
      mapType= 'unofficialMaps';
    }
    this.router.navigate(['/snake-game', "game", mapType, this.selectedMap]);
  }

  onGetPreviousMaps() {
    if(this.displayedMapsStartIndex - 6 < 0) return;
    this.displayedMapsStartIndex -= 6;
  }

  onGetNextMaps() {
    let mapsNumber = 0;
    if(this.isOfficialMaps) {
      mapsNumber = this.gameMaps.length;
    } else {
      mapsNumber = this.unofficialMaps.length;
    }

    if(this.displayedMapsStartIndex + 6 >=  mapsNumber) return;
    this.displayedMapsStartIndex += 6;
  }

  getDisplayedMaps() {
    if(this.isOfficialMaps) {
      return this.gameMaps.slice(this.displayedMapsStartIndex, this.displayedMapsStartIndex + 6);
    } else {
      return this.unofficialMaps.slice(this.displayedMapsStartIndex, this.displayedMapsStartIndex + 6);
    }
  
  }

  onShowOfficialMaps() {
    this.isOfficialMaps = true;
    this.displayedMapsStartIndex = 0;
  }

  onShowUsersMaps() {
    this.isOfficialMaps = false;
    this.displayedMapsStartIndex = 0;
  }


}
