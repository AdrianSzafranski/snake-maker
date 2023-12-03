import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { CanvasDrawer } from '../snake-game/game/canvas-drawer';
import { CoordinateModel } from '../snake-game/game/coordinate.model';
import { defaultData } from '../shared/default-data';

@Component({
  selector: 'app-guide',
  templateUrl: './guide.component.html',
  styleUrls: ['./guide.component.css']
})
export class GuideComponent implements OnInit{

  @ViewChild('sampleGameMapContainer', {static: true}) sampleGameMapContainer!: ElementRef;
  @ViewChild('normalFoodCanvas', {static: true}) normalFoodCanvasRef!: ElementRef;
  @ViewChild('speedFoodCanvas', {static: true}) speedFoodCanvasRef!: ElementRef;
  @ViewChild('lengthFoodCanvas', {static: true}) lengthFoodCanvasRef!: ElementRef;
  @ViewChild('fortuneFoodCanvas', {static: true}) fortuneFoodCanvasRef!: ElementRef;
  @ViewChild('curseFoodCanvas', {static: true}) curseFoodCanvasRef!: ElementRef;
  @ViewChild('unknownFoodCanvas', {static: true}) unknownFoodCanvasRef!: ElementRef;
  mapCanvasDrawer!: CanvasDrawer;

  boardWidthInElements = 9;
  boardHeightInElements = 6;
  boardElementSizeInPixels !: number;
  boardFirstColor = "#212c6d";
  boardSecondColor = "#111738";
  obstacleColor = "#000000";
  snakeInitCoord = {x: 5, y: 1};
  obstacles = [
      {"x": 3, "y": 0, "width": 0, "height": 2},
      {"x": 3, "y": 4, "width": 0, "height": 2},
      {"x": 7, "y": 0, "width": 0, "height": 3},
      {"x": 7, "y": 5, "width": 0, "height": 1}
  ];
  foods = [
      {"coordinate": {"x": 1, "y": 3 }, "type": "normal", "sign": "N", "color": "rgb(243, 245, 108)"},
      {"coordinate": {"x": 5, "y": 5 }, "type": "speed", "sign": "S", "color": "rgb(245, 108, 108)"},
      {"coordinate": {"x": 8, "y": 1 }, "type": "unknown", "sign": "?", "color": "rgb(245, 108, 238)"}
  ]; 

  constructor(private renderer: Renderer2) {}
  
  ngOnInit(): void {
     
      this.initSampleGameMapCanvas();
      this.drawSampleGameMap();
      this.changeCanvasToImg();

      let normalFoodCanvasDrawer = new CanvasDrawer(this.normalFoodCanvasRef.nativeElement);
      this.drawSampleFood(40, "rgb(243, 245, 108)", "N", normalFoodCanvasDrawer);
      let speedFoodCanvasDrawer = new CanvasDrawer(this.speedFoodCanvasRef.nativeElement);
      this.drawSampleFood(40, "rgb(245, 108, 108)", "S", speedFoodCanvasDrawer);
      let lengthFoodCanvasDrawer = new CanvasDrawer(this.lengthFoodCanvasRef.nativeElement);
      this.drawSampleFood(40, "rgb(245, 195, 108)", "L", lengthFoodCanvasDrawer);
      let fortuneFoodCanvasDrawer = new CanvasDrawer(this.fortuneFoodCanvasRef.nativeElement);
      this.drawSampleFood(40, "rgb(245, 108, 238)", "F", fortuneFoodCanvasDrawer);
      let curseFoodCanvasDrawer = new CanvasDrawer(this.curseFoodCanvasRef.nativeElement);
      this.drawSampleFood(40, "rgb(245, 108, 238)", "C", curseFoodCanvasDrawer);
      let unknownFoodCanvasDrawer = new CanvasDrawer(this.unknownFoodCanvasRef.nativeElement);
      this.drawSampleFood(40, "rgb(245, 108, 238)", "?", unknownFoodCanvasDrawer);
  }

  initSampleGameMapCanvas() {
    const sampleGameMapCanvas = this.renderer.createElement('canvas');

    this.renderer.setAttribute(sampleGameMapCanvas, 'width', '1000');
    this.boardElementSizeInPixels = sampleGameMapCanvas.width / this.boardWidthInElements;
    const gameMapHeight = this.boardElementSizeInPixels * this.boardHeightInElements;
    this.renderer.setAttribute(sampleGameMapCanvas, 'height', gameMapHeight.toString());

    this.mapCanvasDrawer = new CanvasDrawer(sampleGameMapCanvas);
  }

  drawSampleGameMap() {
    this.drawBoard();
    this.drawObstacles();
    this.drawSnake();
    this.drawFoods();
  }

  drawBoard() {
    let isfirstColor = true;
    for(let rowNumber = 0; rowNumber < this.boardWidthInElements; rowNumber++) {
      if(this.boardHeightInElements % 2 === 0) {
        isfirstColor = !isfirstColor;
      }
      for(let columnNumber = 0; columnNumber < this.boardHeightInElements; columnNumber++) {
        let color = isfirstColor ? this.boardFirstColor : this.boardSecondColor;
              
        this.mapCanvasDrawer.drawRect(
          color,
          rowNumber * this.boardElementSizeInPixels,
          columnNumber * this.boardElementSizeInPixels,
          this.boardElementSizeInPixels);

        this.mapCanvasDrawer.drawRectBorder(
          this.obstacleColor,
          rowNumber * this.boardElementSizeInPixels,
          columnNumber * this.boardElementSizeInPixels, 
          this.boardElementSizeInPixels);
          isfirstColor = !isfirstColor;
      }
    }
  }

  drawObstacles() {
    this.obstacles.forEach(obstacle => {
      this.mapCanvasDrawer.drawRect(this.obstacleColor, obstacle.x * this.boardElementSizeInPixels, obstacle.y * this.boardElementSizeInPixels, obstacle.width * this.boardElementSizeInPixels, this.boardElementSizeInPixels);
      this.mapCanvasDrawer.drawRect(this.obstacleColor, obstacle.x * this.boardElementSizeInPixels, obstacle.y * this.boardElementSizeInPixels, this.boardElementSizeInPixels, obstacle.height * this.boardElementSizeInPixels);
    });
  }

  drawSnake() {
    let snakeNarrowing = this.boardElementSizeInPixels * 0.15;

    this.mapCanvasDrawer.drawRect(
      'rgb(131, 245, 108)', 
      this.snakeInitCoord.x * this.boardElementSizeInPixels + snakeNarrowing, 
      this.snakeInitCoord.y * this.boardElementSizeInPixels + snakeNarrowing, 
      this.boardElementSizeInPixels - 2*snakeNarrowing,
      2 * this.boardElementSizeInPixels - 2*snakeNarrowing);
  }

  drawFoods() {
    
    for(let food of this.foods) {
      this.drawFood({ ...food.coordinate}, food.color, food.sign);
    }
      
  }

  drawFood(foodCoord: CoordinateModel, color: string, sign: string) {
    let boardElementSizeInPixels = this.boardElementSizeInPixels;
    
    let centerX = foodCoord.x * boardElementSizeInPixels + boardElementSizeInPixels / 2;
    let centerY = foodCoord.y * boardElementSizeInPixels + boardElementSizeInPixels / 2;
    let radius =  boardElementSizeInPixels / 2 - 2.5;
       
    this.mapCanvasDrawer.drawCircle(centerX, centerY, radius, color);

    const fontSize = boardElementSizeInPixels * 0.6;
    const fontFamily = "Kristen ITC";
    const fontColor = (foodCoord.x + foodCoord.y) % 2 == 0 ? this.boardFirstColor :  this.boardSecondColor;
        
    this.mapCanvasDrawer.drawSign(
      sign, fontSize, fontFamily,
      fontColor, centerX, centerY,
    );
  }


  drawSampleFood(size: number, color: string, sign: string, drawer: CanvasDrawer) {
    let centerX = size / 2; 
    let centerY = size / 2; 
    let radius = size / 2; 
    drawer.drawCircle(centerX, centerY, radius, color);

    const fontSize = size * 0.6;
    const fontFamily = "Kristen ITC";
    const fontColor = 'rgb(36, 37, 38)';
        
    drawer.drawSign(
      sign, fontSize, fontFamily,
      fontColor, centerX, centerY,
    );
  }

  changeCanvasToImg() {
    const sampleGameMapURL = this.mapCanvasDrawer.canvas.toDataURL();

    const img = this.renderer.createElement('img');
    this.renderer.setAttribute(img, 'src', sampleGameMapURL);
    this.renderer.setAttribute(img, 'alt', defaultData.defaultGameMapAlt);

    const sampleGameMapNativeElement = this.sampleGameMapContainer.nativeElement;
    this.renderer.appendChild(sampleGameMapNativeElement, img);
  }

}

