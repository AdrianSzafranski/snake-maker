import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { CanvasDrawer } from '../snake-game/game/canvas-drawer';
import { Coordinate } from '../snake-game/game/coordinate.model';

@Component({
  selector: 'app-guide',
  templateUrl: './guide.component.html',
  styleUrls: ['./guide.component.css']
})
export class GuideComponent implements OnInit{

  @ViewChild('sampleGameMapContainer', {static: true}) sampleGameMapContainer!: ElementRef;
  @ViewChild('regularFoodCanvas', {static: true}) regularFoodCanvasRef!: ElementRef;
  @ViewChild('speedFoodCanvas', {static: true}) speedFoodCanvasRef!: ElementRef;
  @ViewChild('lengthFoodCanvas', {static: true}) lengthFoodCanvasRef!: ElementRef;
  @ViewChild('fortuneFoodCanvas', {static: true}) fortuneFoodCanvasRef!: ElementRef;
  @ViewChild('curseFoodCanvas', {static: true}) curseFoodCanvasRef!: ElementRef;
  @ViewChild('unknownFoodCanvas', {static: true}) unknownFoodCanvasRef!: ElementRef;
  gameMapDrawer!: CanvasDrawer;

  mapWidthInElements = 9;
  mapHeightInElements = 6;
  mapElementSizeInPixels !: number;
  backgroundFirstColor = "#212c6d";
  backgroundSecondColor = "#111738";
  obstacleColor = "#000000";
  snakeInitCoord = {x: 5, y: 1};
  obstacles = [
      {"x": 3, "y": 0, "width": 0, "height": 2},
      {"x": 3, "y": 4, "width": 0, "height": 2},
      {"x": 7, "y": 0, "width": 0, "height": 3},
      {"x": 7, "y": 5, "width": 0, "height": 1}
  ];
  foods = [
      {"coordinate": {"x": 1, "y": 3 }, "type": "regular", "sign": "N", "color": "rgb(243, 245, 108)"},
      {"coordinate": {"x": 5, "y": 5 }, "type": "speed", "sign": "S", "color": "rgb(245, 108, 108)"},
      {"coordinate": {"x": 8, "y": 1 }, "type": "unknown", "sign": "?", "color": "rgb(245, 108, 238)"}
  ]; 

  constructor(private renderer: Renderer2) {}
  
  ngOnInit(): void {
      this.initSampleGameMapCanvas();
      this.drawSampleGameMap();
      this.changeCanvasToImg();

      let regularFoodCanvasDrawer = new CanvasDrawer(this.regularFoodCanvasRef.nativeElement);
      this.drawSampleFood(40, "rgb(243, 245, 108)", "R", regularFoodCanvasDrawer);
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
    this.mapElementSizeInPixels = sampleGameMapCanvas.width / this.mapWidthInElements;
    const gameMapHeight = this.mapElementSizeInPixels * this.mapHeightInElements;
    this.renderer.setAttribute(sampleGameMapCanvas, 'height', gameMapHeight.toString());

    this.gameMapDrawer = new CanvasDrawer(sampleGameMapCanvas);
  }

  drawSampleGameMap() {
    this.drawmap();
    this.drawObstacles();
    this.drawSnake();
    this.drawFoods();
  }

  drawmap() {
    let isfirstColor = true;
    for(let rowNumber = 0; rowNumber < this.mapWidthInElements; rowNumber++) {
      if(this.mapHeightInElements % 2 === 0) {
        isfirstColor = !isfirstColor;
      }
      for(let columnNumber = 0; columnNumber < this.mapHeightInElements; columnNumber++) {
        let color = isfirstColor ? this.backgroundFirstColor : this.backgroundSecondColor;
              
        this.gameMapDrawer.drawRect(
          color,
          rowNumber * this.mapElementSizeInPixels,
          columnNumber * this.mapElementSizeInPixels,
          this.mapElementSizeInPixels);

        this.gameMapDrawer.drawRectBorder(
          this.obstacleColor,
          rowNumber * this.mapElementSizeInPixels,
          columnNumber * this.mapElementSizeInPixels, 
          this.mapElementSizeInPixels);
          isfirstColor = !isfirstColor;
      }
    }
  }

  drawObstacles() {
    this.obstacles.forEach(obstacle => {
      this.gameMapDrawer.drawRect(this.obstacleColor, obstacle.x * this.mapElementSizeInPixels, obstacle.y * this.mapElementSizeInPixels, obstacle.width * this.mapElementSizeInPixels, this.mapElementSizeInPixels);
      this.gameMapDrawer.drawRect(this.obstacleColor, obstacle.x * this.mapElementSizeInPixels, obstacle.y * this.mapElementSizeInPixels, this.mapElementSizeInPixels, obstacle.height * this.mapElementSizeInPixels);
    });
  }

  drawSnake() {
    let snakeNarrowing = this.mapElementSizeInPixels * 0.15;

    this.gameMapDrawer.drawRect(
      'rgb(131, 245, 108)', 
      this.snakeInitCoord.x * this.mapElementSizeInPixels + snakeNarrowing, 
      this.snakeInitCoord.y * this.mapElementSizeInPixels + snakeNarrowing, 
      this.mapElementSizeInPixels - 2*snakeNarrowing,
      2 * this.mapElementSizeInPixels - 2*snakeNarrowing);
  }

  drawFoods() {
    
    for(let food of this.foods) {
      this.drawFood({ ...food.coordinate}, food.color, food.sign);
    }
      
  }

  drawFood(foodCoord: Coordinate, color: string, sign: string) {
    let mapElementSizeInPixels = this.mapElementSizeInPixels;
    
    let centerX = foodCoord.x * mapElementSizeInPixels + mapElementSizeInPixels / 2;
    let centerY = foodCoord.y * mapElementSizeInPixels + mapElementSizeInPixels / 2;
    let radius =  mapElementSizeInPixels / 2 - 2.5;
       
    this.gameMapDrawer.drawCircle(centerX, centerY, radius, color);

    const fontSize = mapElementSizeInPixels * 0.6;
    const fontFamily = "Kristen ITC";
    const fontColor = (foodCoord.x + foodCoord.y) % 2 == 0 ? this.backgroundFirstColor :  this.backgroundSecondColor;
        
    this.gameMapDrawer.drawSign(
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
    const sampleGameMapURL = this.gameMapDrawer.canvas.toDataURL();

    const img = this.renderer.createElement('img');
    this.renderer.setAttribute(img, 'src', sampleGameMapURL);
    this.renderer.setAttribute(img, 'alt', 'Sample game map');

    const sampleGameMapNativeElement = this.sampleGameMapContainer.nativeElement;
    this.renderer.appendChild(sampleGameMapNativeElement, img);
  }

}

