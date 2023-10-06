import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { SnakeFoodModel } from './snake-food.model';
import { SnakeSnakeModel } from './snake-snake.model';
import { SnakeCoordinateModel } from './snake-coordinate.model';
import { SnakeBoardModel } from './snake-board.model';

@Component({
  selector: 'app-snake',
  templateUrl: './snake.component.html',
  styleUrls: ['./snake.component.css']
})
export class SnakeComponent implements OnInit, AfterViewInit  {
  
  @ViewChild('canvas') canvasRef!: ElementRef;

  canvas!: HTMLCanvasElement;
  canvasContext!: CanvasRenderingContext2D | null;
  snake!: SnakeSnakeModel;
  redFood!: SnakeFoodModel;
  yellowFood!: SnakeFoodModel;
  orangeFood!: SnakeFoodModel;
  obstacles!: SnakeCoordinateModel[];
  currentDirection!: string
  score!: number;
  board!: SnakeBoardModel;
  gameIntervalId!: number;
  isGameOver!: boolean;

  constructor() {}

  ngOnInit(): void {

    this.currentDirection = 'ArrowDown';
    this.score = 0;
    this.board = new SnakeBoardModel(400, 20);
    this.isGameOver = false;

    this.setScreenSize();
    this.setInitialItems();
  }

  ngAfterViewInit() {
    this.canvas = this.canvasRef.nativeElement;
    this.canvasContext = this.canvas.getContext('2d');

    this.gameIntervalId = window.setInterval(() => this.game(), 1000/30);
  }

  setInitialItems() {
    let initSnakeCoord = this.board.setItemToRandElement('snake');
    this.snake = new SnakeSnakeModel(initSnakeCoord);

    let initYellowFoodCoord = this.board.setItemToRandElement('yellowFood');
    this.yellowFood = new SnakeFoodModel(initYellowFoodCoord, 'yellow', 1);

    let initOrangeFoodCoord = this.board.setItemToRandElement('orangeFood');
    this.orangeFood = new SnakeFoodModel(initOrangeFoodCoord, 'orange', 2);

    let initRedFoodCoord = this.board.setItemToRandElement('redFood')
    this.redFood = new SnakeFoodModel(initRedFoodCoord, 'red', 3);

    this.obstacles = this.board.setObstaclesToRandElements({ ...initSnakeCoord });
  }

  game() {
    this.update();
    this.draw();
  }

  update() {

    this.snake.setDirection(this.currentDirection);
    const locations = this.snake.move(this.board.getLengthInElements());
    this.checkNewSnakeCoord(locations.newSnakeCoord);
    this.board.editSnakeCoordinate(locations);
  } 

  checkNewSnakeCoord(newCoord: SnakeCoordinateModel) {
    let boardElement = this.board.getElement(newCoord.x, newCoord.y);

    switch(boardElement) {
      case 'yellowFood': 
        this.snake.eat(newCoord);
        let newYellowFoodCoord = this.board.setItemToRandElement('yellowFood');
        this.yellowFood.setCoordinate(newYellowFoodCoord);
        this.score++;
        break;
      case 'orangeFood': 
        this.snake.eat(newCoord);
        let newOrangeFoodCoord = this.board.setItemToRandElement('orangeFood');
        this.orangeFood.setCoordinate(newOrangeFoodCoord);
        this.score += 2;
      
        break;
      case 'redFood': 
        this.snake.eat(newCoord);
        let newRedFoodCoord = this.board.setItemToRandElement('redFood');
        this.redFood.setCoordinate(newRedFoodCoord);
        this.score += 3;
        break;
      case 'snake': 
        this.gameOver();
        break;
      case 'obstacle':
        this.gameOver();
        break;
    }
  }

  draw() {

    if(!this.canvasContext) return;
    this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawRect(0,0, this.canvas.width, this.canvas.height, "#424242");
    let snakeBody = this.snake.getBody();
    let snakeColor = this.snake.getColor();
    let boardElementLenInPixels = this.board.getElementLengthInPixels();
    let rChangeValue = 5;
    snakeBody.forEach((bodyPart: SnakeCoordinateModel, index: number) => {
      
      this.drawRect(
        bodyPart.x * boardElementLenInPixels + 2.5,
        bodyPart.y * boardElementLenInPixels + 2.5,
        boardElementLenInPixels - 5,
        boardElementLenInPixels - 5,
        `rgb(${snakeColor.r}, ${snakeColor.g}, ${snakeColor.b})`);

      snakeColor.r += rChangeValue;

      if(snakeColor.r > 255) {
        rChangeValue = -5;
        snakeColor.r = 255;
      } else if(snakeColor.r < 0) {
        rChangeValue = +5;
        snakeColor.r = 0;
      }

    });

    let foods = [this.yellowFood, this.orangeFood, this.redFood];

    for(let food of foods) {
      let foodCoordinate = food.getCoordinate();
      let centerX = foodCoordinate.x * boardElementLenInPixels + boardElementLenInPixels / 2;
      let centerY = foodCoordinate.y * boardElementLenInPixels + boardElementLenInPixels / 2;
      let radius =  boardElementLenInPixels / 2 - 2.5;
      this.drawCircle(centerX, centerY, radius, food.getColor());
    }

    for(let obstacle of this.obstacles) {
      
      this.drawRect(
        obstacle.x * boardElementLenInPixels,
        obstacle.y * boardElementLenInPixels,
        boardElementLenInPixels,
        boardElementLenInPixels,
        'black');

    };

    this.canvasContext.font = `${boardElementLenInPixels}px Arial`;
    this.canvasContext.fillStyle = "#7fccbe";
    this.canvasContext.fillText(
      "Score: " + this.score, 
      0, 
      boardElementLenInPixels);
   
    if(this.isGameOver) {
      this.drawGameOverInfo();
    }
  }

  drawRect(x: number, y: number, width: number, height: number, color: string) {
      if(!this.canvasContext) return;
      this.canvasContext.fillStyle = color;
      this.canvasContext.fillRect(x, y, width, height);
  }

  drawCircle(centerX: number, centerY: number, radius: number, color: string) {

    if(!this.canvasContext) return;
    this.canvasContext.fillStyle = color;
    this.canvasContext.beginPath();
    this.canvasContext.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    this.canvasContext.fill();
  }

  gameOver() {
    // Zatrzymywanie setInterval w innej metodzie
    if (this.gameIntervalId) {
      clearInterval(this.gameIntervalId);
    }
    this.isGameOver = true;
  }

  drawGameOverInfo() {
    if(!this.canvasContext) return;
   
    console.log('ff');
    let boardElementLenInPixels = this.board.getElementLengthInPixels();

    this.canvasContext.font = `${boardElementLenInPixels*3}px Arial`;
    this.canvasContext.fillStyle = "#e6a69ebe";
    this.canvasContext.fillText(
      "You lost!", 
      this.canvas.width / 5, 
      this.canvas.height / 2);
  }

  @HostListener('window:resize', ['$event'])
  setScreenSize(event?: Event): void {
    let newBoardLengthInPixels = (window.innerHeight >= window.innerWidth)
      ? Math.floor(window.innerWidth * 0.9)
      : Math.floor(window.innerHeight * 0.9);

    // give the largest number less than "newLengthInPixels" divisible by "this.getLengthInElements"
    newBoardLengthInPixels = newBoardLengthInPixels - newBoardLengthInPixels % this.board.getLengthInElements();

    this.board.setLengthInPixels(newBoardLengthInPixels);
    
    if(this.isGameOver) {
      this.draw();
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
  
      let possibleDirection = ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'];
      if(possibleDirection.includes(event.key)) {
        this.currentDirection = event.key;
      }
  }
}
