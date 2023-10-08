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
  time = 1000/30;
  l: DOMHighResTimeStamp = 0.0;
  timeToPassOneElementInSeconds = 0.13; //0.07
  timeElapsedInSeconds = 0;
  backgroundColor = "#111738";
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
    this.drawBoard();
    this.l = performance.now();
    this.snake.getDestination(this.board.getLengthInElements());
    requestAnimationFrame((currentTime) => {
      
      this.update(currentTime);
     
    });
  }

  setInitialItems() {
    let initSnakeCoord = this.board.setItemToRandElement('snake');
    this.board.setElement(initSnakeCoord.x, initSnakeCoord.y, '');
    this.snake = new SnakeSnakeModel(initSnakeCoord, this.currentDirection);
    

    let initYellowFoodCoord = this.board.setItemToRandElement('yellowFood');
    this.yellowFood = new SnakeFoodModel(initYellowFoodCoord, 'rgb(243, 245, 108)', 1);

    let initOrangeFoodCoord = this.board.setItemToRandElement('orangeFood');
    this.orangeFood = new SnakeFoodModel(initOrangeFoodCoord, 'rgb(245, 195, 108)', 2);

    let initRedFoodCoord = this.board.setItemToRandElement('redFood')
    this.redFood = new SnakeFoodModel(initRedFoodCoord, 'rgb(245, 108, 108)', 3);

    this.obstacles = this.board.setObstaclesToRandElements({ ...initSnakeCoord });
  }

  static isEqualCoordinates(firstCoordinate: SnakeCoordinateModel, secondCoordinate: SnakeCoordinateModel) {
    if(firstCoordinate.x === secondCoordinate.x && firstCoordinate.y === secondCoordinate.y) {
        return true;
    }
    return false;
}
  
  

  update(currentTime: DOMHighResTimeStamp) {
  
    const deltaTime = (currentTime - this.l) / 1000;
  
    
    this.timeElapsedInSeconds += deltaTime;
    while(this.timeElapsedInSeconds >= this.timeToPassOneElementInSeconds) {

      this.drawBoard();
      this.drawSnakeShift(1);
      
      this.currentDirection = this.snake.setDirection(this.currentDirection);
      let newPartOfSnakeBody = this.snake.move(this.currentDirection);
      let lastPartOfSnakeBody = this.snake.getBodyPart(0);
      this.isFood(newPartOfSnakeBody, lastPartOfSnakeBody);
    
      let snakeLength = this.snake.getSnakeLength();
      let newSnakeBodyPart = this.snake.getBodyPart(snakeLength-1);
      let penultimatePartOfSnakeBody = snakeLength > 1 ? this.snake.getBodyPart(1) : null;

      this.board.editSnakeCoordinate(lastPartOfSnakeBody, penultimatePartOfSnakeBody, newSnakeBodyPart);

      let snakeDestination = this.snake.getDestination(this.board.getLengthInElements());
      this.isGameOver = this.board.isGameOver(snakeDestination);
      if(this.isGameOver) return;

      this.timeElapsedInSeconds -= this.timeToPassOneElementInSeconds;
      this.drawScoreText();
    }
    
   
    this.drawSnakeShift(this.timeElapsedInSeconds / this.timeToPassOneElementInSeconds);
   
    this.l = currentTime;
    setTimeout(() => {
      requestAnimationFrame((currentTime) => {
      
        this.update(currentTime);
       
      });;
    }, this.time);
  
    
  } 

  isFood(newPartOfSnakeBody: SnakeCoordinateModel, lastPartOfSnakeBody: SnakeCoordinateModel) {
    let boardElement = this.board.getElement(newPartOfSnakeBody.x, newPartOfSnakeBody.y);
  
    switch(boardElement) {
      case 'yellowFood': 
        this.snake.eat(lastPartOfSnakeBody);
        let newYellowFoodCoord = this.board.setItemToRandElement('yellowFood');
        this.yellowFood.setCoordinate(newYellowFoodCoord);
        this.drawFood(newYellowFoodCoord, this.yellowFood.getColor());
        this.score++;
        break;
      case 'orangeFood': 
        this.snake.eat(lastPartOfSnakeBody);
        let newOrangeFoodCoord = this.board.setItemToRandElement('orangeFood');
        this.orangeFood.setCoordinate(newOrangeFoodCoord);
        this.drawFood(newOrangeFoodCoord, this.orangeFood.getColor());
        this.score += 2;
      
        break;
      case 'redFood': 
        this.snake.eat(lastPartOfSnakeBody);
        let newRedFoodCoord = this.board.setItemToRandElement('redFood');
        this.redFood.setCoordinate(newRedFoodCoord);
        this.drawFood(newRedFoodCoord, this.redFood.getColor());
        this.score += 3;
        break;
    }


    
  }



  drawSnakeShift(shiftFactor: number = 1) {
    
    let snakeHistory = this.snake.getHistoryOfDirections();
  
    let snakeLength = this.snake.getSnakeLength();
    let lastPartOfSnakeBody = this.snake.getBody()[0];
    let penultimatePartOfSnakeBody = snakeLength > 1 ? this.snake.getBodyPart(1) : null;
    let directionLastPartOfSnakeBody = snakeHistory[snakeHistory.length - snakeLength];

    


    let snakeBody = this.snake.getBody();
   
    let boardElementLenInPixels = this.board.getElementLengthInPixels();
    
    for(let i= 0; i< snakeLength; i++) {
      
      this.drawRect(
        snakeBody[i].x * boardElementLenInPixels,
        snakeBody[i].y * boardElementLenInPixels,
        boardElementLenInPixels,
        boardElementLenInPixels,
        this.snake.getColor(i));

      

    }
   
    
     let cc = (Math.floor(lastPartOfSnakeBody.x/2)+Math.floor(lastPartOfSnakeBody.y/2)) % 2 == 0 ? '#212c6d' :  this.backgroundColor


    // remove part of the snake's body
    // The last two parts of the snake are the same when it has eaten the food.
    // Then the snake should grow so that it doesn't lose the last part.
    if(penultimatePartOfSnakeBody == null || !SnakeComponent.isEqualCoordinates(lastPartOfSnakeBody, penultimatePartOfSnakeBody)) {
      this.drawSnakeShiftHelper({ ...lastPartOfSnakeBody }, directionLastPartOfSnakeBody, shiftFactor,  cc);
    } 
   
  
  
  
    let snakeDestination = this.snake.destination;
    let directionSnakeDestination = snakeHistory[snakeHistory.length - 1];
    // add part of the snake's body
    this.drawSnakeShiftHelper({ ...snakeDestination }, directionSnakeDestination, shiftFactor, this.snake.getColor(snakeLength));
   
   }

  drawSnakeShiftHelper(drawCoord: SnakeCoordinateModel, direction: string, shiftFactor: number, color: string) {

    if(!this.canvasContext) return;
    let boardElementLenInPixels = this.board.getElementLengthInPixels();
    let startX, startY, endX, endY;
    switch(direction) {
      case 'ArrowUp':
        startX = drawCoord.x * boardElementLenInPixels;
        startY = drawCoord.y * boardElementLenInPixels + boardElementLenInPixels - shiftFactor * boardElementLenInPixels;
        endX = boardElementLenInPixels
        endY = boardElementLenInPixels * shiftFactor;
        this.drawRect(startX, startY, endX, endY, color);
        break;
      case 'ArrowRight':
        startX = drawCoord.x * boardElementLenInPixels;
        startY = drawCoord.y * boardElementLenInPixels;
        endX = boardElementLenInPixels * shiftFactor;
        endY = boardElementLenInPixels;
        this.drawRect(startX, startY, endX, endY, color);
        break;
      case 'ArrowDown':
        startX = drawCoord.x * boardElementLenInPixels;
        startY = drawCoord.y * boardElementLenInPixels;
        endX = boardElementLenInPixels;
        endY = boardElementLenInPixels * shiftFactor;
        this.drawRect(startX, startY, endX, endY, color);
        break;
      case 'ArrowLeft':
        startX = drawCoord.x * boardElementLenInPixels + boardElementLenInPixels - shiftFactor * boardElementLenInPixels;
        startY = drawCoord.y * boardElementLenInPixels;
        endX = boardElementLenInPixels * shiftFactor;
        endY = boardElementLenInPixels;
        this.drawRect(startX, startY, endX, endY, color);
        break;
    }
  }

  drawBoard() {
    if(!this.canvasContext) return;
    this.canvasContext.clearRect(0,0, this.canvas.width, this.canvas.height); 

    let boardLenInElements = this.board.getLengthInElements();
    let boardElementLenInPixels = this.board.getElementLengthInPixels();
    let isRed = true;
    for(let i = 0; i < boardLenInElements; i +=2) {
       isRed = !isRed;
      for(let j = 0; j < boardLenInElements; j += 2) {
        let color = isRed ? this.backgroundColor : '#212c6d';
        console.log(color);
        this.drawRect(j*boardElementLenInPixels, i*boardElementLenInPixels, 2*boardElementLenInPixels, 2*boardElementLenInPixels, color);
        isRed = !isRed;
      }
    }
    //this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);

    //this.drawRect(0,0, this.canvas.width, this.canvas.height, this.backgroundColor); 
    this.drawFoods();
    this.drawObstacles();
    this.drawScoreText();
   
    if(this.isGameOver) {
      this.drawGameOverText();
    }
  }

 


  drawRect(x: number, y: number, width: number, height: number, color: string) {
      if(!this.canvasContext) return;
      this.canvasContext.fillStyle = color;
      this.canvasContext.fillRect(x, y, width, height);
  }
  drawRectBorder(x: number, y: number, width: number, height: number) {
    if(!this.canvasContext) return;
    this.canvasContext.strokeStyle = "#616161";
    this.canvasContext.lineWidth = 2;
    this.canvasContext.strokeRect(x+1, y+1, width-2, height-2);
}


  drawSnake() {
    let snakeBody = this.snake.getBody();
    let snakeColor = this.snake.getColor(0);
    let boardElementLenInPixels = this.board.getElementLengthInPixels();
    snakeBody.forEach((bodyPart: SnakeCoordinateModel, index: number) => {
      
      this.drawRect(
        bodyPart.x * boardElementLenInPixels + 2.5,
        bodyPart.y * boardElementLenInPixels + 2.5,
        boardElementLenInPixels - 5,
        boardElementLenInPixels - 5,
        snakeColor);

      

    });
  }

  drawScoreText() {
    let boardElementLenInPixels = this.board.getElementLengthInPixels();

    if(!this.canvasContext) return;
    this.canvasContext.font = `${boardElementLenInPixels}px Arial`;
    this.canvasContext.fillStyle = "#7fccbe";
    this.canvasContext.fillText(
      "Score: " + this.score, 
      0, 
      boardElementLenInPixels);
   
  }

  drawObstacles() {

    let boardElementLenInPixels = this.board.getElementLengthInPixels();

    for(let obstacle of this.obstacles) {
      
      this.drawRect(
        obstacle.x * boardElementLenInPixels,
        obstacle.y * boardElementLenInPixels,
        boardElementLenInPixels,
        boardElementLenInPixels,
        "#c4c3c2");

      this.drawRectBorder(
        obstacle.x * boardElementLenInPixels,
        obstacle.y * boardElementLenInPixels,
        boardElementLenInPixels,
        boardElementLenInPixels);
        
    };
  }

  drawFoods() {

    let foods = [this.yellowFood, this.orangeFood, this.redFood];

    for(let food of foods) {
      let foodCoordinate = food.getCoordinate();
      let foodColor = food.getColor();
      this.drawFood( { ...foodCoordinate}, foodColor);
    }
  }

  drawFood(foodCoordinate: SnakeCoordinateModel, color: string) {

    let boardElementLenInPixels = this.board.getElementLengthInPixels();

    let centerX = foodCoordinate.x * boardElementLenInPixels + boardElementLenInPixels / 2;
    let centerY = foodCoordinate.y * boardElementLenInPixels + boardElementLenInPixels / 2;
    let radius =  boardElementLenInPixels / 2 - 2.5;
   
    if(!this.canvasContext) return;
    this.canvasContext.fillStyle = color;
    this.canvasContext.beginPath();
    this.canvasContext.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    this.canvasContext.fill();
  }

  drawGameOverText() {
    if(!this.canvasContext) return;
   
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
      this.drawBoard();
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
