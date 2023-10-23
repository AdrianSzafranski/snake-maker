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
  selectedMap?: number;

  constructor(private snakeService: SnakeService, private router: Router){
  }

  ngOnInit(): void {
    this.maps = this.snakeService.getMaps();
  }

  onStartGame(mapId: number) {
    this.selectedMap = mapId;

    this.router.navigate(['/snake/game', this.selectedMap]);
  }

}
