import { Component, ElementRef, Input, OnInit, Renderer2, ViewChild } from '@angular/core';

import { GameMap } from 'src/app/snake-game/game-maps/game-map.model';
import { UserScore } from '../../user-score.model';

@Component({
  selector: 'app-game-map',
  templateUrl: './game-map.component.html',
  styleUrls: ['./game-map.component.css']
})
export class GameMapComponent implements OnInit {

  @ViewChild('gameMapContainer', {static: true}) gameMapContainer!: ElementRef;
  @Input() gameMap!: GameMap;
  @Input() userScore: UserScore | null = null;

  gameMapCanvas!: HTMLCanvasElement
  gameMapContext!: CanvasRenderingContext2D;
  boardElementSizeInPixels!: number;

  constructor(private renderer: Renderer2) {}

  ngOnInit(): void {
    this.drawMap();
  }

  drawMap() {

    this.initGameMapCanvas();
    this.drawBoard();
    this.drawObstacles();
    this.changeCanvasToImg();
  }

  initGameMapCanvas() {
    this.gameMapCanvas = this.renderer.createElement('canvas');

    this.renderer.setAttribute(this.gameMapCanvas, 'width', '1000');
    this.boardElementSizeInPixels = this.gameMapCanvas.width / this.gameMap.boardWidthInElements;
    const gameMapHeight = this.boardElementSizeInPixels * this.gameMap.boardHeightInElements;
    this.renderer.setAttribute(this.gameMapCanvas, 'height', gameMapHeight.toString());

    let canvasContext = this.gameMapCanvas.getContext('2d');
    if(!canvasContext) {
      throw new Error('Cannot access canvasContext');
    }
    this.gameMapContext = canvasContext;
  }

  drawBoard() {
    let isfirstColor = true;
    for(let x = 0; x < this.gameMap.boardWidthInElements; x++) {
      if(this.gameMap.boardHeightInElements % 2 === 0) {
        isfirstColor = !isfirstColor;
      }
      for(let y = 0; y < this.gameMap.boardHeightInElements; y++) {
        let color = isfirstColor ? this.gameMap.boardFirstColor : this.gameMap.boardSecondColor;
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
      = JSON.parse(this.gameMap.obstacles);
    obstaclesJsonArray.forEach(obstacle => {
      this.drawRect(this.gameMap.obstacleColor, obstacle.x * this.boardElementSizeInPixels, obstacle.y * this.boardElementSizeInPixels, obstacle.width * this.boardElementSizeInPixels, this.boardElementSizeInPixels);
      this.drawRect(this.gameMap.obstacleColor, obstacle.x * this.boardElementSizeInPixels, obstacle.y * this.boardElementSizeInPixels, this.boardElementSizeInPixels, obstacle.height * this.boardElementSizeInPixels);
    });
  }

  drawRect(color: string, x: number, y: number, width: number, height = width) {
    this.gameMapContext.fillStyle = color;
    this.gameMapContext.fillRect(x, y, width, height);
  }

  changeCanvasToImg() {
    const gameMapURL = this.gameMapCanvas.toDataURL();

    const img = this.renderer.createElement('img');
    this.renderer.setAttribute(img, 'src', gameMapURL);
    this.renderer.setAttribute(img, 'alt', 'game map image');

    const gameMapNativeElement = this.gameMapContainer.nativeElement;
    this.renderer.appendChild(gameMapNativeElement, img);
  }

}
