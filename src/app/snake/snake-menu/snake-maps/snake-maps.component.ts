import { Component, OnInit } from '@angular/core';
import { SnakeService } from '../../snake.service';
import { snakeMapModel } from '../../snake-map.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-snake-maps',
  templateUrl: './snake-maps.component.html',
  styleUrls: ['./snake-maps.component.css']
})
export class SnakeMapsComponent implements OnInit {

  maps!: snakeMapModel[];
  displayedMaps!: snakeMapModel[];
  displayedMapsStartIndex!: number;
  selectedMap?: number;
  pagesNumber!: number;
  constructor(private snakeService: SnakeService, private router: Router){
  }

  ngOnInit(): void {
    this.maps = this.snakeService.getMaps();
    this.displayedMaps = this.maps.slice(0, 4);
    this.displayedMapsStartIndex = 0;
    this.pagesNumber =  Math.ceil(this.maps.length / 4);
  }

  onStartGame(mapId: number) {
    this.selectedMap = mapId;

    this.router.navigate(['/snake/game', this.selectedMap]);
  }

  onGetPreviousMaps() {
    if(this.displayedMapsStartIndex - 4 < 0) return;
    this.displayedMapsStartIndex -= 4;
    this.displayedMaps = this.maps.slice(this.displayedMapsStartIndex, this.displayedMapsStartIndex + 4);
  }

  onGetNextMaps() {
    if(this.displayedMapsStartIndex + 4 >=  this.maps.length) return;
    this.displayedMapsStartIndex += 4;
    this.displayedMaps = this.maps.slice(this.displayedMapsStartIndex, this.displayedMapsStartIndex + 4);
  }

}
