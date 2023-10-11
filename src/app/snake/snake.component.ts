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

  @ViewChild('hamburgerMenu') hamburgerMenu?: ElementRef;
  @ViewChild('canvas') canvasRef!: ElementRef;

  isHamburgerMenuOpen = false;
  canvas!: HTMLCanvasElement;
  canvasContext!: CanvasRenderingContext2D | null;
  snake!: SnakeSnakeModel;
  foods!: SnakeFoodModel[];
  specialFood!: SnakeFoodModel | null;
  orangeFood!: SnakeFoodModel;
  obstacles!: SnakeCoordinateModel[];
  currentDirection!: SnakeCoordinateModel;
  score!: number;
  bestScore = 0;
  board!: SnakeBoardModel;
  gameIntervalId!: number;
  isGameOver!: boolean;
  time = 1000/30;
  l!: number;
  timeToPassOneElementInSeconds!: number;
  timeElapsedInSeconds!: number;
  backgroundColor = "#111738";
  initSnakeCoord!: SnakeCoordinateModel;
  deadSegmentCount!: number;
  isGamePaused!: boolean;

  constructor() {}

  onCloseHamburgerMenu() {
    this.isHamburgerMenuOpen = false;
  }

  ngOnInit(): void {

    this.setInitialItems();
    this.setScreenSize();
  }

  ngAfterViewInit() {
    this.canvas = this.canvasRef.nativeElement;
    this.canvasContext = this.canvas.getContext('2d');
    this.startGame();
  }

  startGame() {
    this.drawBoard();
    this.l = performance.now();
    this.snake.getDestination(this.board.getWidthInElements(), this.board.getHeightInElements());
    requestAnimationFrame((currentTime) => {
      this.update(currentTime);
    });
  }

  setInitialItems(keepMap = false) {
    this.specialFood = null;
    this.isGamePaused = false;
    this.deadSegmentCount = 0;
    this.isGameOver = false;
    this.score = 0;
    this.board = new SnakeBoardModel(400, 240, 25, 15);
    this.timeElapsedInSeconds = 0;
    this.timeToPassOneElementInSeconds = 0.3;
    this.l = 0;
    this.currentDirection = {x: 0, y: 1};
    if(!keepMap) {
      this.initSnakeCoord = this.board.setItemToRandElement('snake');
    }
    this.snake = new SnakeSnakeModel( {...this.initSnakeCoord}, this.currentDirection);
    this.board.setElement(this.initSnakeCoord.x, this.initSnakeCoord.y, '');
    
    this.foods = [];
    let initFoodTypes = ['normal', 'speed', 'length'];
    for(let initFoodType of initFoodTypes) {
      let initFoodCoord = this.board.setItemToRandElement('food');
      let food = new SnakeFoodModel(initFoodCoord, initFoodType);
      this.foods.push(food);
    }
   
    if(!keepMap) {
      this.obstacles = this.board.setObstaclesToRandElements({ ...this.initSnakeCoord });
    }
  }

  static isEqualCoordinates(firstCoordinate: SnakeCoordinateModel, secondCoordinate: SnakeCoordinateModel) {
    if(firstCoordinate.x === secondCoordinate.x && firstCoordinate.y === secondCoordinate.y) {
        return true;
    }
    return false;
}
  
  updateSpeed(speedModifier: number) {
    this.timeToPassOneElementInSeconds -= speedModifier * 0.005;
  }

  update(currentTime: DOMHighResTimeStamp) {
  
    if(this.isGamePaused) {
      this.drawBoard();
      this.drawSnakeShift(this.timeElapsedInSeconds / this.timeToPassOneElementInSeconds);
      this.drawTextInBoardCenter('Paused');
      this.triggerUpdateFunction(currentTime);
      return;
    } 

    const deltaTime = (currentTime - this.l) / 1000;
  
    
    this.timeElapsedInSeconds += deltaTime;
    while(this.timeElapsedInSeconds >= this.timeToPassOneElementInSeconds) {
      
      this.drawBoard();
      this.drawSnakeShift(1);
      
      this.currentDirection = this.snake.setDirection(this.currentDirection);
      let newPartOfSnakeBody = this.snake.move(this.currentDirection);
      let lastPartOfSnakeBody = this.snake.getBodyPart(0);
      this.isFood(newPartOfSnakeBody, lastPartOfSnakeBody);
      this.isSpecialFood(newPartOfSnakeBody);
      let snakeLength = this.snake.getSnakeLength();
      let newSnakeBodyPart = this.snake.getBodyPart(snakeLength-1);
      let penultimatePartOfSnakeBody = snakeLength > 1 ? this.snake.getBodyPart(1) : null;

      this.board.editSnakeCoordinate(lastPartOfSnakeBody, penultimatePartOfSnakeBody, newSnakeBodyPart);

      let snakeDestination = this.snake.getDestination(this.board.getWidthInElements(), this.board.getHeightInElements());
      this.isGameOver = this.board.isGameOver(snakeDestination);
      if(this.isGameOver) {
        if(this.bestScore < this.score) {
          this.bestScore = this.score;
          
        } 
        this.displayEndGame();
        return;
      }
      this.timeElapsedInSeconds -= this.timeToPassOneElementInSeconds;
    
    }
    
   
    this.drawSnakeShift(this.timeElapsedInSeconds / this.timeToPassOneElementInSeconds);
    

    this.triggerUpdateFunction(currentTime);
  
    
  } 

  triggerUpdateFunction(currentTime: number) {
    this.l = currentTime;
    setTimeout(() => {
      requestAnimationFrame((currentTime) => {
        this.update(currentTime);
        
      });;
    }, this.time);
  }

  displayEndGame() {
    this.drawBoard();
    let deadSnakeColor = 'rgb(112, 112, 112)';
    this.drawSnake(deadSnakeColor);
    this.markEndGameElement();
    setTimeout(() => {
      this.displayEndGame();
    }, this.time);
  }

  markEndGameElement() {
    if(!this.canvasContext) return;
    let boardElementSizeInPixels = this.board.getElementSizeInPixels();
    let snakeDestination = this.snake.destination;

    this.canvasContext.font = `${boardElementSizeInPixels * 1.1}px Arial`;
    this.canvasContext.fillStyle = 'red';
    const x = this.canvasContext.measureText("X").width;
    
    console.log(snakeDestination);
    this.canvasContext.fillText(
      'X', 
      snakeDestination.x * boardElementSizeInPixels + boardElementSizeInPixels/2 - x / 2, 
      snakeDestination.y * boardElementSizeInPixels + boardElementSizeInPixels/2 + boardElementSizeInPixels * 1.1 / 3);
  }

  isFood(newSnakeSegment: SnakeCoordinateModel, lastSnakeSegment: SnakeCoordinateModel) {
    let boardElement = this.board.getElement(newSnakeSegment.y, newSnakeSegment.x);
    
    if(boardElement !== 'food') return;
    
    const eatenFood = this.foods.find(food => {
      let foodCoordinate = food.getCoordinate();
      return foodCoordinate.x === newSnakeSegment.x && foodCoordinate.y === newSnakeSegment.y;
    });
    
    if(eatenFood === undefined) return;

    this.snake.eat(lastSnakeSegment, eatenFood.getElongationNumber());
    let newfoodCoord = this.board.setItemToRandElement('food');
    eatenFood.setCoordinate(newfoodCoord);
    this.drawFood(newfoodCoord, eatenFood.getColor(), eatenFood.getSign());
    this.score += eatenFood.getValue();
    this.updateSpeed(eatenFood.getSpeedModifier());

    this.manageSpecialFood();
  }

  isSpecialFood(newSnakeSegment: SnakeCoordinateModel) {
    let boardElement = this.board.getElement(newSnakeSegment.y, newSnakeSegment.x);
    
    if(boardElement !== 'specialFood' || this.specialFood === null) return;
    
    let specialFoodCoord = this.specialFood.getCoordinate();
    if(!SnakeComponent.isEqualCoordinates(specialFoodCoord, newSnakeSegment)) return;

    this.score = this.specialFood.getValue();
    this.specialFood = null;
  }

  manageSpecialFood() {
   
    const randomNumber = Math.random();
    const isManageSpecialFood = randomNumber < 0.15;
    if(!isManageSpecialFood) return;

    if(this.specialFood !== null) {
      let specialFoodCoord = this.specialFood.getCoordinate();
      this.board.setElement(specialFoodCoord.x, specialFoodCoord.y, '');
      this.specialFood = null;
      return;
    }

    let specialFoodType;
    if(randomNumber < 0.05) {
      specialFoodType = 'fortune';
    } else if(randomNumber < 0.10) {
      specialFoodType = 'curse';
    } else {
      specialFoodType = 'unknown';
    }
  
    let specialFoodCoord = this.board.setItemToRandElement('specialFood');
    this.specialFood = new SnakeFoodModel(specialFoodCoord, specialFoodType);
    this.drawFood( { ...specialFoodCoord}, this.specialFood.getColor(), this.specialFood.getSign());
    
  }

  drawSnakeShift(shiftFactor: number = 1) {
    
    let snakeHistory = this.snake.getHistoryOfDirections();
  
    let snakeLength = this.snake.getSnakeLength();
    let lastPartOfSnakeBody = this.snake.getBody()[0];
    let penultimatePartOfSnakeBody = snakeLength > 1 ? this.snake.getBodyPart(1) : null;
    let directionLastPartOfSnakeBody = snakeHistory[snakeHistory.length - snakeLength];

    


    let snakeBody = this.snake.getBody();
   
    let boardElementLenInPixels = this.board.getElementSizeInPixels();
    
    for(let i= 0; i< snakeLength; i++) {
      
      this.drawRect(
        snakeBody[i].x * boardElementLenInPixels,
        snakeBody[i].y * boardElementLenInPixels,
        boardElementLenInPixels,
        boardElementLenInPixels,
        this.snake.getColor(i));
    }
   
    
     let cc = (lastPartOfSnakeBody.x+lastPartOfSnakeBody.y) % 2 == 0 ? '#212c6d' :  this.backgroundColor


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
    

    for(let i = 0; i <  this.board.getHeightInElements(); i +=1) {
     for(let j = 0; j <  this.board.getWidthInElements(); j += 1) {
      this.drawRectBorder2(j*boardElementLenInPixels, i*boardElementLenInPixels, 1*boardElementLenInPixels, 1*boardElementLenInPixels);
     }
   }
   }

  drawSnakeShiftHelper(drawCoord: SnakeCoordinateModel, direction: SnakeCoordinateModel, shiftFactor: number, color: string) {
    
    if(!this.canvasContext) return;
    let boardElementLenInPixels = this.board.getElementSizeInPixels();
    let startX, startY, endX, endY;
    if(direction.x === 0 && direction.y === -1) {
      startX = drawCoord.x * boardElementLenInPixels;
      startY = drawCoord.y * boardElementLenInPixels + boardElementLenInPixels - shiftFactor * boardElementLenInPixels;
      endX = boardElementLenInPixels
      endY = boardElementLenInPixels * shiftFactor;
      this.drawRect(startX, startY, endX, endY, color);
    } else if(direction.x === 1 && direction.y === 0) { 
      startX = drawCoord.x * boardElementLenInPixels;
      startY = drawCoord.y * boardElementLenInPixels;
      endX = boardElementLenInPixels * shiftFactor;
      endY = boardElementLenInPixels;
      this.drawRect(startX, startY, endX, endY, color);
    } else if(direction.x === 0 && direction.y === 1) { 
      startX = drawCoord.x * boardElementLenInPixels;
      startY = drawCoord.y * boardElementLenInPixels;
      endX = boardElementLenInPixels;
      endY = boardElementLenInPixels * shiftFactor;
      this.drawRect(startX, startY, endX, endY, color);
    } else if(direction.x === -1 && direction.y === 0) {
      startX = drawCoord.x * boardElementLenInPixels + boardElementLenInPixels - shiftFactor * boardElementLenInPixels;
      startY = drawCoord.y * boardElementLenInPixels;
      endX = boardElementLenInPixels * shiftFactor;
      endY = boardElementLenInPixels;
      this.drawRect(startX, startY, endX, endY, color);
    }

    
  }

  drawBoard() {
    if(!this.canvasContext) return;
    this.canvasContext.clearRect(0,0, this.canvas.width, this.canvas.height); 


    let boardElementLenInPixels = this.board.getElementSizeInPixels();
    let isRed = true;
    for(let i = 0; i < this.board.getHeightInElements(); i +=1) {
     
      for(let j = 0; j < this.board.getWidthInElements(); j += 1) {
        let color = !isRed ? this.backgroundColor : '#212c6d';
        
        this.drawRect(j*boardElementLenInPixels, i*boardElementLenInPixels, 1*boardElementLenInPixels, 1*boardElementLenInPixels, color);
        this.drawRectBorder2(j*boardElementLenInPixels, i*boardElementLenInPixels, 1*boardElementLenInPixels, 1*boardElementLenInPixels);
        isRed = !isRed;
      }
    }
    //this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);

    //this.drawRect(0,0, this.canvas.width, this.canvas.height, this.backgroundColor); 
    this.drawFoods();
    this.drawObstacles();

   
    if(this.isGameOver) {
     
      this.score = 0;
      this.drawTextInBoardCenter('You lost!');
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

drawRectBorder2(x: number, y: number, width: number, height: number) {
  if(!this.canvasContext) return;
  this.canvasContext.strokeStyle = "black";
  this.canvasContext.lineWidth = 1;
  this.canvasContext.strokeRect(x, y, width-1, height-1);
}


  drawSnake(snakeColor: string) {
    let snakeBody = this.snake.getBody();
    let boardElementLenInPixels = this.board.getElementSizeInPixels();
    snakeBody.forEach((bodyPart: SnakeCoordinateModel, index: number) => {
      
      this.drawRect(
        bodyPart.x * boardElementLenInPixels + 2.5,
        bodyPart.y * boardElementLenInPixels + 2.5,
        boardElementLenInPixels - 5,
        boardElementLenInPixels - 5,
        snakeColor);

      

    });
  }

  drawObstacles() {

    let boardElementLenInPixels = this.board.getElementSizeInPixels();

    for(let obstacle of this.obstacles) {
      
      this.drawRect(
        obstacle.x * boardElementLenInPixels,
        obstacle.y * boardElementLenInPixels,
        boardElementLenInPixels,
        boardElementLenInPixels,
        "black");

      /*this.drawRectBorder(
        obstacle.x * boardElementLenInPixels,
        obstacle.y * boardElementLenInPixels,
        boardElementLenInPixels,
        boardElementLenInPixels);*/
        
    };
  }

  drawFoods() {

    //let foods = [this.yellowFood, this.orangeFood, this.redFood];

    for(let food of this.foods) {
      let foodCoord = food.getCoordinate();
      let foodColor = food.getColor();
      let foodSign = food.getSign();
      this.drawFood( { ...foodCoord}, foodColor, foodSign);
    }

    if(this.specialFood !== null) {
      let specialFoodCoord = this.specialFood.getCoordinate();
      let specialFoodColor = this.specialFood.getColor();
      let specialFoodSign = this.specialFood.getSign();
      this.drawFood( { ...specialFoodCoord}, specialFoodColor, specialFoodSign);
    }

  }

  drawFood(foodCoordinate: SnakeCoordinateModel, color: string, sign: string) {

    let boardElementLenInPixels = this.board.getElementSizeInPixels();

    let centerX = foodCoordinate.x * boardElementLenInPixels + boardElementLenInPixels / 2;
    let centerY = foodCoordinate.y * boardElementLenInPixels + boardElementLenInPixels / 2;
    let radius =  boardElementLenInPixels / 2 - 2.5;
   
    if(!this.canvasContext) return;
    
    this.canvasContext.fillStyle = color;
    this.canvasContext.beginPath();
    this.canvasContext.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    this.canvasContext.fill();

    this.canvasContext.font = `${boardElementLenInPixels * 0.6}px Kristen ITC`;
    this.canvasContext.fillStyle = (foodCoordinate.x+foodCoordinate.y) % 2 == 0 ? '#212c6d' :  this.backgroundColor;
    const x = this.canvasContext.measureText(sign).width;
    let centeringcorrection = 4;
    if(sign === 'N' || sign === 'F' || sign === 'C' || sign === '?') {
      centeringcorrection = 3;
    } else if(sign === 'S' || sign === 'L') {
      centeringcorrection = 4;
    }
    this.canvasContext.fillText(
      sign, 
      centerX - x / 2, 
      centerY + boardElementLenInPixels * 0.6 / centeringcorrection);
  }

  drawTextInBoardCenter(text: string) {
    if(!this.canvasContext) return;
   
    let boardElementLenInPixels = this.board.getElementSizeInPixels();

    this.canvasContext.font = `${boardElementLenInPixels*3}px Arial`;
    this.canvasContext.fillStyle = "rgb(188, 192, 213)";
    const x = this.canvasContext.measureText(text).width;
    this.canvasContext.fillText(
      text, 
      this.canvas.width / 2 - x / 2, 
      this.canvas.height / 2 + boardElementLenInPixels*3 / 8);
  }

  generateMap() {
    this.setInitialItems();
    this.setScreenSize();
    this.startGame();
  }

  restartMap() {
    this.setInitialItems(true);
    this.setScreenSize();
    this.startGame();
   
  }

  @HostListener('window:resize', ['$event'])
  setScreenSize(event?: Event): void {
      let boardWidthInElements = this.board.getWidthInElements();
      let boardHeightInElements = this.board.getHeightInElements();
   
      const boardAspectRatio = boardWidthInElements / boardHeightInElements;

      const multiplier = (window.innerHeight < 650) ? 0.75 : 0.80;
      let awailableWidthInPixels = (window.innerWidth < 450) ? 450 * multiplier : window.innerWidth * multiplier;
      let awailableHeightInPixels =(window.innerHeight < 450) ? 450 * multiplier : window.innerHeight * multiplier;

      let boardWidthInPixels;
      let boardHeightInPixels;
  
      if (awailableWidthInPixels / boardAspectRatio > awailableHeightInPixels) {
        boardWidthInPixels = awailableHeightInPixels * boardAspectRatio;
        boardHeightInPixels = awailableHeightInPixels;
      } else {
        boardWidthInPixels = awailableWidthInPixels;
        boardHeightInPixels = boardWidthInPixels / boardAspectRatio;
      }
  
    this.board.setWidthInPixels(boardWidthInPixels);
    this.board.setHeightPixels(boardHeightInPixels);
    this.board.setElementSizeInPixels(boardWidthInPixels / boardWidthInElements);
  }

  convertDirectionValue(directionString: String) {
    switch(directionString) {
      case 'ArrowDown': return {x: 0, y: 1};
      case 'ArrowLeft': return {x: -1, y: 0};
      case 'ArrowUp': return {x: 0, y: -1};
      case 'ArrowRight': return {x: 1, y: 0};
      default: return {x: 0, y: 0};
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
  
      let possibleDirection = ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'];
      if(possibleDirection.includes(event.key) && !this.isGamePaused) {
        this.currentDirection = this.convertDirectionValue(event.key);
      }

      if(event.key.toUpperCase() === 'P') {
        this.isGamePaused = !this.isGamePaused;
      }
  }

  @HostListener('document:click', ['$event']) navOpen(event: Event) {
    let isHamburgerMenuDefined = this.hamburgerMenu;
    let isClickedOutsideHamburgerMenu = isHamburgerMenuDefined && !this.hamburgerMenu!.nativeElement.contains(event.target);
    if (isClickedOutsideHamburgerMenu) {
      this.isHamburgerMenuOpen = false;
    } 
  }
}
