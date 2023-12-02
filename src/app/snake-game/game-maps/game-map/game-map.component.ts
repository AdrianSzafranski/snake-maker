import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { GameMap } from 'src/app/snake-game/game-maps/game-map.model';
import { UserScore } from '../../user-score.model';


@Component({
  selector: 'app-game-map',
  templateUrl: './game-map.component.html',
  styleUrls: ['./game-map.component.css']
})
export class GameMapComponent implements OnInit {

  @ViewChild('mapCanvas', {static: true}) mapCanvasRef!: ElementRef;
  @Input() map!: GameMap;
  @Input() userScore: UserScore | null = null;

  mapCanvas!: HTMLCanvasElement
  mapCanvasContext!: CanvasRenderingContext2D;
  boardElementSizeInPixels!: number;

  ngOnInit(): void {
    this.mapCanvas = this.mapCanvasRef.nativeElement;
    const canvasContext = this.mapCanvas.getContext('2d');
    if(!canvasContext) {
        throw new Error('Cannot access canvasContext');
    }
    this.mapCanvasContext = canvasContext;

    this.boardElementSizeInPixels = this.mapCanvas.width / this.map.boardWidthInElements;
    this.mapCanvas.height = this.boardElementSizeInPixels * this.map.boardHeightInElements;

    this.drawBoard();
    this.drawObstacles();
  }

  drawBoard() {
    let isfirstColor = true;
    for(let x = 0; x < this.map.boardWidthInElements; x++) {
      if(this.map.boardHeightInElements % 2 === 0) {
        isfirstColor = !isfirstColor;
      }
      for(let y = 0; y < this.map.boardHeightInElements; y++) {
        let color = isfirstColor ? this.map.boardFirstColor : this.map.boardSecondColor;
        isfirstColor = !isfirstColor;
        this.drawRect(
          color,
          x * this.boardElementSizeInPixels,
          y *this.boardElementSizeInPixels,
          this.boardElementSizeInPixels);
      }
    }
  }

  drawObstacles() {
    let obstaclesJsonArray:{x: number, y: number, width: number, height: number}[] 
      = JSON.parse(this.map.obstacles);
    obstaclesJsonArray.forEach(obstacle => {
      this.drawRect(this.map.obstacleColor, obstacle.x * this.boardElementSizeInPixels, obstacle.y * this.boardElementSizeInPixels, obstacle.width * this.boardElementSizeInPixels, this.boardElementSizeInPixels);
      this.drawRect(this.map.obstacleColor, obstacle.x * this.boardElementSizeInPixels, obstacle.y * this.boardElementSizeInPixels, this.boardElementSizeInPixels, obstacle.height * this.boardElementSizeInPixels);
    });
  }

  drawRect(color: string, x: number, y: number, width: number, height = width) {
    this.mapCanvasContext.fillStyle = color;
    this.mapCanvasContext.fillRect(x, y, width, height);
  }

}
