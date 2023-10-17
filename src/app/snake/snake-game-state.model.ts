import { SnakeBoardModel } from "./snake-board.model";
import { SnakeCanvasDrawer } from "./snake-canvas-drawer";
import { SnakeCoordinateModel } from "./snake-coordinate.model";
import { SnakeFoodModel } from "./snake-food.model";
import { SnakeSnakeModel } from "./snake-snake.model";

export class SnakeGameStateModel {

  private _currentScore = 0; 
  private _bestScore = 0; 
  private _isGameInterrupted = false;
  private _isGameOver = false;
  private _frameInterval = 1000/30;
  private _lastFrameTime = 0;
  private _timeToPassOneElementInSeconds = 0.5;
  private _timeElapsedInSeconds = 0;
  private _currentDirection = {x: 0, y: 1};
  private _specialFood: SnakeFoodModel | null = null;
  private _board!: SnakeBoardModel;
  private _snake!: SnakeSnakeModel;
  private _foods!: SnakeFoodModel[];
  private _obstacles!: SnakeCoordinateModel[];
  private _bgCanvasDrawer: SnakeCanvasDrawer;
  private _gameCanvasDrawer: SnakeCanvasDrawer;
  private _gridCanvasDrawer: SnakeCanvasDrawer;
  private initSnakeCoords: SnakeCoordinateModel[] = [];
  private initFoodCoords: SnakeCoordinateModel[] = [];
  private candrawBoards = true;

  constructor(
    gameCanvas: HTMLCanvasElement, 
    bgCanvas: HTMLCanvasElement, 
    gidCanvas: HTMLCanvasElement) {
      this._bgCanvasDrawer = new SnakeCanvasDrawer(bgCanvas);
      this._gameCanvasDrawer = new SnakeCanvasDrawer(gameCanvas);
      this._gridCanvasDrawer = new SnakeCanvasDrawer(gidCanvas);
      this.initBoardElements();gameCanvas
  }

  initBoardElements() {
    this._board = new SnakeBoardModel(400, 240, 25, 15, 0.2);
    
    this.initSnakeCoords = this._board.setItemInRandElement('snake', undefined, undefined, 2); //delete 'snake'?
    this._snake = new SnakeSnakeModel(this.initSnakeCoords, this._currentDirection);

    
        
    this._foods = [];
        
    let initFoodTypes = ['normal', 'speed', 'length'];
    this.initFoodCoords = [];
    for(let initFoodType of initFoodTypes) {
        let initFoodCoord = this._board.setItemInRandElement('food', this.initSnakeCoords)[0];
        this.initFoodCoords.push({ ...initFoodCoord });
        let food = new SnakeFoodModel(initFoodCoord, initFoodType);
        this._foods.push(food);
    }
    
    this._obstacles = [];
    let newObstacle = this._board.setItemInRandElement(
      'obstacle', 
      [ ...this.initSnakeCoords, ...this.initFoodCoords, ...this._obstacles ], 2, 5);
    this._obstacles.push(...newObstacle);
            
  }

  setInitBoardElements() {
    this._board = new SnakeBoardModel(400, 240, 25, 15, 0.2);
    this._snake = new SnakeSnakeModel(this.initSnakeCoords, this._currentDirection);
    for(let initSnakeCoord of this.initSnakeCoords) {
      this._board.setElement(initSnakeCoord.x, initSnakeCoord.y, 'snake'); //delete 'snake'?
    } 
   
        
    this._foods = [];
    let initFoodTypes = ['normal', 'speed', 'length'];
    for(let i = 0; i < initFoodTypes.length; i++) {
          let food = new SnakeFoodModel(this.initFoodCoords[i], initFoodTypes[i]);
          this._foods.push(food);
          this._board.setElement(this.initFoodCoords[i].x, this.initFoodCoords[i].y, 'food');
    }
    
    for(let obstacle of this._obstacles) {
      this._board.setElement(obstacle.x, obstacle.y, 'obstacle');
    }    
  }

  setInitGameState() {
    this._currentScore = 0;
    this._isGameInterrupted = false;
    this._isGameOver = false;
    this._lastFrameTime = 0;
    this._timeToPassOneElementInSeconds = 0.3;
    this._timeElapsedInSeconds = 0;
    this._specialFood = null;
    this._currentDirection = {x: 0, y: 1};
  }

  determineBestScore() {
    if(this._currentScore <= this._bestScore) return;
    this._bestScore = this._currentScore;
  }

  startGame() {
    this.drawAllElements();
    this._lastFrameTime = performance.now();
    this._snake.getDestination(this._board.widthInElements, this._board.heightInElements);
    requestAnimationFrame((currentTime) => {
      this.updateGame(currentTime);
    });
  }
  
  pauseGame() {
    this._isGameInterrupted = !this._isGameInterrupted;

    if(this._isGameInterrupted) {
      this.drawTextInBoardCenter('Paused');
    } else {
      this._gridCanvasDrawer.clearCanvas();
      this._lastFrameTime = performance.now();
      requestAnimationFrame((currentTime) => {
        this.updateGame(currentTime);
      });
    }
  }

  updateGame(currentTime: DOMHighResTimeStamp) {
    if(this._isGameInterrupted) return;
       
    const deltaTime = (currentTime - this._lastFrameTime) / 1000;
      
    this._timeElapsedInSeconds += deltaTime;
    while(this._timeElapsedInSeconds >= this._timeToPassOneElementInSeconds) {
          
      this.drawSnakeShift(1);

      this._currentDirection = this._snake.setDirection(this._currentDirection);
      let newSnakeSegment = this._snake.move(this._currentDirection);
      let lastSnakeSegment = this._snake.getBodyPart(0);

      this.isFood(newSnakeSegment, lastSnakeSegment);
      this.isSpecialFood(newSnakeSegment);

      let snakeLength = this._snake.getSnakeLength();
      let penultimateSnakeSegment = snakeLength > 1 ? this._snake.getBodyPart(1) : null;
      this._board.editSnakeCoordinate(lastSnakeSegment, penultimateSnakeSegment, newSnakeSegment);
    
      let snakeDestination = this._snake.getDestination(this._board.widthInElements, this._board.heightInElements);
      this._isGameOver = this._board.isGameOver(snakeDestination);

      if(this._isGameOver) {
        this.determineBestScore();
        this.displayEndGame();
        return;
      }
      this._timeElapsedInSeconds -= this._timeToPassOneElementInSeconds; 
    }
        
    this.drawSnakeShift(this._timeElapsedInSeconds / this._timeToPassOneElementInSeconds); 
    this.triggerUpdateMethod(currentTime);   
  } 

  displayEndGame() {
    this.drawSnake(this._snake.deadSnakeColor);
    this.drawTextInBoardCenter('You lost!');
    this.markEndGameElement();
  }
    
  markEndGameElement() {
    let boardElementSizeInPixels = this._board.elementSizeInPixels;
    let snakeDestination = this._snake.destination;

    const sign = 'X';
    const fontSize = boardElementSizeInPixels * 1.1;
    const fontFamily = 'Arial';
    const fontColor = 'red';
    const centerX = snakeDestination.x * boardElementSizeInPixels + boardElementSizeInPixels/2;
    const centerY = snakeDestination.y * boardElementSizeInPixels + boardElementSizeInPixels/2;

    this._gridCanvasDrawer.drawSign(
      sign, fontSize, fontFamily, fontColor, centerX, centerY);
  }
  
  drawSnake(color: string) {
    // dir - direction
    let dirHistory = this._snake.directionHistory;
    let snakeSegments = this._snake.segments;
    let snakeLength = this._snake.segments.length;
    let lastSegmentDirIndex = dirHistory.length - snakeLength;
    let narrowing = this._board.getSnakeNarrowing();

    for(let i = 1; i < snakeSegments.length; i++) { 
      let currentSegmentDir = dirHistory[lastSegmentDirIndex + i];
      let previousSegmentDir = dirHistory[lastSegmentDirIndex + i - 1];
      let isEqualDirs = this.isEqualCoords(currentSegmentDir, previousSegmentDir);
      let choosenDir = isEqualDirs ? currentSegmentDir : previousSegmentDir;
      this.drawSnakeNewSegment({ ...snakeSegments[i] }, choosenDir, 1, color, narrowing);  
    }
    
    // draw snake last segment
    let boardElementLenInPixels = this._board.elementSizeInPixels;
    let snakeLastSegment = snakeSegments[0];
    this._gameCanvasDrawer.drawRect(color, 
      snakeLastSegment.x * boardElementLenInPixels + narrowing,
      snakeLastSegment.y * boardElementLenInPixels + narrowing,
      boardElementLenInPixels - 2 * narrowing );
  }

  isEqualCoords(firstCoord: SnakeCoordinateModel, secondCoord: SnakeCoordinateModel) {
    return (firstCoord.x === secondCoord.x && firstCoord.y === secondCoord.y)
     ? true 
     : false;
  }

  restartGame(isChangeMap: boolean) {
    this._isGameInterrupted = true;
    this.setInitGameState();
    if(isChangeMap) {
      this.initBoardElements();
    } else {
      this.setInitBoardElements();
    }
       
    this.changeScreenSize();
    this.startGame();
  }
  
  updateSpeed(speedModifier: number) {
    this._timeToPassOneElementInSeconds -= speedModifier * 0.005;
  }

  triggerUpdateMethod(currentTime: number) {
    this._lastFrameTime = currentTime;
    setTimeout(() => {
      requestAnimationFrame((currentTime) => {
        this.updateGame(currentTime);
      });
    }, this._frameInterval);
  }

  drawSnakeShift(shiftFactor: number = 1) {
    let snakeHistory = this._snake.directionHistory;
    let snakeLength = this._snake.getSnakeLength();
    let lastSnakeSegment = this._snake.segments[0];
    let penultimateSnakeSegment = snakeLength > 1 ? this._snake.getBodyPart(1) : null;
    let directionLastSnakeSegment = snakeHistory[snakeHistory.length - snakeLength];
    let snakeDestination = this._snake.destination;
    let directionSnakeDestination = snakeHistory[snakeHistory.length - 1];
    let snakeColor = this._snake.liveSnakeColor;

    let boardElementLenInPixels = this._board.elementSizeInPixels;
    let snakeNarrowing = Math.floor(boardElementLenInPixels * 0.2);

    // The last two parts of the snake are the same when it has eaten the food.
    // Then the snake should grow so that it doesn't lose the last part.
    if(penultimateSnakeSegment == null || !this.isEqualCoordinates(lastSnakeSegment, penultimateSnakeSegment)) {
      this.clearSnakeOldSegment({ ...lastSnakeSegment }, directionLastSnakeSegment, shiftFactor, snakeNarrowing)
    } 
       
    // add part of the snake's body
    this.drawSnakeNewSegment({ ...snakeDestination }, directionSnakeDestination, shiftFactor, snakeColor, snakeNarrowing);       
  }
    
  drawSnakeNewSegment(
    drawCoord: SnakeCoordinateModel, 
    direction: SnakeCoordinateModel, 
    shiftFactor: number, 
    color: string,
    snakeNarrowing: number) {
        
    let boardElementLenInPixels = this._board.elementSizeInPixels;
    
    //element with drawCoord
    let elementX = drawCoord.x * boardElementLenInPixels;
    let elementY = drawCoord.y * boardElementLenInPixels;
    let elementWidth = boardElementLenInPixels;
    let elementHeight = boardElementLenInPixels;

    let elementPart = boardElementLenInPixels - shiftFactor * boardElementLenInPixels;

    if(direction.x === 0 && direction.y === -1) {
      elementY += snakeNarrowing;
      elementX += snakeNarrowing;
      elementWidth -= 2* snakeNarrowing;
      elementY += elementPart;
      elementHeight *= shiftFactor;
    } else if(direction.x === 1 && direction.y === 0) { 
      elementY += snakeNarrowing;
      elementX -= snakeNarrowing;
      elementHeight -= snakeNarrowing * 2;
      elementWidth *= shiftFactor;
    } else if(direction.x === 0 && direction.y === 1) { 
      elementY -= snakeNarrowing;
      elementX += snakeNarrowing;
      elementWidth -= snakeNarrowing * 2;
      elementHeight *= shiftFactor;
    } else if(direction.x === -1 && direction.y === 0) { 
      elementY += snakeNarrowing;
      elementX += snakeNarrowing;
      elementHeight -= snakeNarrowing * 2;
      elementX += elementPart;
      elementWidth *= shiftFactor;
    }

    if(elementX < 0 && elementWidth <= snakeNarrowing && direction.x === 1) {
      this._gameCanvasDrawer.drawRect(color, (this._board.widthInElements)*boardElementLenInPixels - snakeNarrowing, elementY, elementWidth, elementHeight);
    } else if(drawCoord.x ==(this._board.widthInElements-1) && elementWidth <= snakeNarrowing && direction.x === -1  ) {
      this._gameCanvasDrawer.drawRect(color, snakeNarrowing - elementWidth, elementY, elementWidth, elementHeight); 
    } else if(elementY < 0 && elementHeight <= snakeNarrowing  && direction.y === 1 ) {
      this._gameCanvasDrawer.drawRect(color, elementX, (this._board.heightInElements)*boardElementLenInPixels - snakeNarrowing, elementWidth, elementHeight);
    } else if(drawCoord.y ==(this._board.heightInElements-1) && elementHeight <= snakeNarrowing  && direction.y === -1 ) {
      this._gameCanvasDrawer.drawRect(color, elementX, snakeNarrowing - elementHeight, elementWidth, elementHeight); 
    } else {
      this._gameCanvasDrawer.drawRect(color, elementX, elementY, elementWidth, elementHeight); 
    }
   
    if(elementX < 0 && elementWidth >= snakeNarrowing && direction.x === 1) {
      this._gameCanvasDrawer.drawRect(color, (this._board.widthInElements)*boardElementLenInPixels - snakeNarrowing, elementY, snakeNarrowing, elementHeight);
    } else if(elementY < 0 && elementHeight >= snakeNarrowing && direction.y === 1) { 
      this._gameCanvasDrawer.drawRect(color, elementX, (this._board.heightInElements)*boardElementLenInPixels - snakeNarrowing, elementWidth, snakeNarrowing);
    } else if(drawCoord.x == this._board.widthInElements - 1  && elementWidth >= snakeNarrowing && direction.x === -1) { 
      this._gameCanvasDrawer.drawRect(color, 0, elementY, snakeNarrowing, elementHeight);
    } else if(drawCoord.y == this._board.heightInElements - 1  && elementHeight >= snakeNarrowing && direction.y === -1) {
      this._gameCanvasDrawer.drawRect(color,elementX, 0, elementWidth, snakeNarrowing);
    }

  }

  clearSnakeOldSegment(
    drawCoord: SnakeCoordinateModel, 
    direction: SnakeCoordinateModel, 
    shiftFactor: number,
    snakeNarrowing: number) { 
    let boardElementLenInPixels = this._board.elementSizeInPixels;
  
    //element with drawCoord
    let elementX = drawCoord.x * boardElementLenInPixels;
    let elementY = drawCoord.y * boardElementLenInPixels;
    let elementWidth = boardElementLenInPixels;
    let elementHeight = boardElementLenInPixels;

    let elementPart = boardElementLenInPixels - shiftFactor * boardElementLenInPixels;

    if(direction.x === 0 && direction.y === -1) {
      elementY -= snakeNarrowing;
      elementY += elementPart;
    
      elementHeight *= shiftFactor;
      //elementHeight += snakeNarrowing * 2;
    } else if(direction.x === 1 && direction.y === 0) { 
      elementX -= snakeNarrowing;
      elementWidth *= shiftFactor;
      elementWidth += snakeNarrowing * 2;
    } else if(direction.x === 0 && direction.y === 1) { 
      elementY -= snakeNarrowing;
    
      elementHeight *= shiftFactor;
      elementHeight += snakeNarrowing * 2;
    } else if(direction.x === -1 && direction.y === 0) { 
      elementX -= snakeNarrowing;
      elementX += elementPart;
      elementWidth *= shiftFactor;
    
    }

      this._gameCanvasDrawer.clearRect(elementX, elementY, elementWidth, elementHeight);
    
      if(drawCoord.x == (this._board.widthInElements-1) && boardElementLenInPixels - elementWidth <= snakeNarrowing && direction.x === 1  ) {
        this._gameCanvasDrawer.clearRect( -snakeNarrowing*2, elementY, snakeNarrowing- (boardElementLenInPixels - elementWidth), elementHeight);
      } else if(drawCoord.x == 0 && boardElementLenInPixels - elementWidth <= snakeNarrowing && direction.x === -1  ) {
        this._gameCanvasDrawer.clearRect( boardElementLenInPixels*(this._board.widthInElements) - (snakeNarrowing - (boardElementLenInPixels - elementWidth)), elementY, snakeNarrowing- (boardElementLenInPixels - elementWidth), elementHeight);
      } else if(drawCoord.y == (this._board.heightInElements-1) && boardElementLenInPixels - elementHeight <= snakeNarrowing && direction.y === 1  ) {
        console.log("test")
        this._gameCanvasDrawer.clearRect( elementX, -snakeNarrowing*2, elementWidth, snakeNarrowing- (boardElementLenInPixels - elementHeight));
      } else if(drawCoord.y == 0 && boardElementLenInPixels - elementHeight <= snakeNarrowing && direction.y === -1  ) {
        this._gameCanvasDrawer.clearRect( elementX, boardElementLenInPixels*(this._board.heightInElements) - (snakeNarrowing - (boardElementLenInPixels - elementHeight)), elementWidth, snakeNarrowing- (boardElementLenInPixels - elementHeight));
      }
  }

  isFood(newSnakeSegment: SnakeCoordinateModel, lastSnakeSegment: SnakeCoordinateModel) {
    let boardElement = this._board.getElement(newSnakeSegment.y, newSnakeSegment.x);
        
    if(boardElement !== 'food') return;
        
    const eatenFood = this._foods.find(food => {
      let foodCoordinate = food.coordinate;
      return foodCoordinate.x === newSnakeSegment.x && foodCoordinate.y === newSnakeSegment.y;
    });
        
    if(eatenFood === undefined) return;
    
    this._snake.eat(lastSnakeSegment, eatenFood.elongationNumber);
    let newfoodCoord = this._board.setItemInRandElement('food')[0];
    eatenFood.coordinate = newfoodCoord;
    this.drawFoods();
    this._currentScore += eatenFood.value;
    this.updateSpeed(eatenFood.speedModifier);
    
    this.manageSpecialFood();
  }
    
  isSpecialFood(newSnakeSegment: SnakeCoordinateModel) {
    let boardElement = this._board.getElement(newSnakeSegment.y, newSnakeSegment.x);
        
    if(boardElement !== 'specialFood' || this._specialFood === null) return;
        
    let specialFoodCoord = this._specialFood.coordinate;
    if(!this.isEqualCoordinates(specialFoodCoord, newSnakeSegment)) return;
    
    this._currentScore += this._specialFood.value;
    this._specialFood = null;
    this.drawFoods();
  }
    
  manageSpecialFood() {
    const randomNumber = Math.random();
    const isManageSpecialFood = randomNumber < 0.15;
    if(!isManageSpecialFood) return;
    
    if(this._specialFood !== null) {
      let specialFoodCoord = this._specialFood.coordinate;
      this._board.setElement(specialFoodCoord.x, specialFoodCoord.y, '');
      this._specialFood = null;
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
      
    let specialFoodCoord = this._board.setItemInRandElement('specialFood')[0];
    this._specialFood = new SnakeFoodModel(specialFoodCoord, specialFoodType);
    
    this.drawFoods();
  }

  drawAllElements() {
    this._bgCanvasDrawer.clearCanvas();
    this._gameCanvasDrawer.clearCanvas();
    this._gridCanvasDrawer.clearCanvas();
    this.drawBoard();
    this.drawSnake(this._snake.liveSnakeColor);
    this.drawFoods();
    this.drawObstacles();
     
    if(!this._isGameOver) return; 
    this.drawTextInBoardCenter('You lost!');
  }

  drawBoard() {
    let boardElementLenInPixels = this._board.elementSizeInPixels;
    let isfirstColor = true;
    for(let rowNumber = 0; rowNumber < this._board.widthInElements; rowNumber++) {
      for(let columnNumber = 0; columnNumber < this._board.heightInElements; columnNumber++) {
        let color = isfirstColor ? this._board.firstBgColor : this._board.secondBgColor;
              
        this._bgCanvasDrawer.drawRect(
          color,
          rowNumber * boardElementLenInPixels,
          columnNumber * boardElementLenInPixels,
          boardElementLenInPixels);

        this._bgCanvasDrawer.drawRectBorder(
          "black",
          rowNumber * boardElementLenInPixels,
          columnNumber * boardElementLenInPixels, 
          boardElementLenInPixels);
          isfirstColor = !isfirstColor;
      }
    }
  }

  drawFoods() {
    this._gridCanvasDrawer.clearCanvas();
    for(let food of this._foods) {
      this.drawFood({ ...food.coordinate}, food.color, food.sign);
    }
    
    if(this._specialFood !== null) {
      this.drawFood(
        { ...this._specialFood.coordinate}, 
        this._specialFood.color, 
        this._specialFood.sign);
    }
  }
    
  drawFood(foodCoord: SnakeCoordinateModel, color: string, sign: string) {
    let boardElementSizeInPixels = this._board.elementSizeInPixels;
    
    let centerX = foodCoord.x * boardElementSizeInPixels + boardElementSizeInPixels / 2;
    let centerY = foodCoord.y * boardElementSizeInPixels + boardElementSizeInPixels / 2;
    let radius =  boardElementSizeInPixels / 2 - 2.5;
       
    this._gridCanvasDrawer.drawCircle(centerX, centerY, radius, color);

    const fontSize = boardElementSizeInPixels * 0.6;
    const fontFamily = "Kristen ITC";
    const fontColor = (foodCoord.x + foodCoord.y) % 2 == 0 ? this._board.firstBgColor :  this._board.secondBgColor;
        
    this._gridCanvasDrawer.drawSign(
      sign, fontSize, fontFamily,
      fontColor, centerX, centerY,
    );
  }

  drawObstacles() {
    let boardElementSizeinPixels = this._board.elementSizeInPixels;
    for(let obstacle of this._obstacles) {
      this._bgCanvasDrawer.drawRect(
        "black",
        obstacle.x * boardElementSizeinPixels,
        obstacle.y * boardElementSizeinPixels,
        boardElementSizeinPixels);
    }
  }

  drawTextInBoardCenter(text: string) {
    let boardElementLenInPixels = this._board.elementSizeInPixels;
    
    this._gridCanvasDrawer.drawTextInBoardCenter(
      text, 
      boardElementLenInPixels*3,
      "Arial",
      "rgb(188, 192, 213)");
  }

  changeScreenSize() {
    let boardWidthInElements = this._board.widthInElements;
    let boardHeightInElements = this._board.heightInElements;
   
    const boardAspectRatio = boardWidthInElements / boardHeightInElements;

    const multiplier = (window.innerHeight < 650) ? 0.75 : 0.80;
    let awailableWidthInPixels = Math.floor((window.innerWidth < 450) ? 450 * multiplier : window.innerWidth * multiplier);
    let awailableHeightInPixels = Math.floor((window.innerHeight < 450) ? 450 * multiplier : window.innerHeight * multiplier);
    let boardWidthInPixels;
    let boardHeightInPixels;

    while(awailableWidthInPixels % boardWidthInElements !== 0) {
      awailableWidthInPixels--;
    }
    while(awailableHeightInPixels % boardHeightInElements !== 0) {
      awailableHeightInPixels--;
    }
  
    if (awailableWidthInPixels / boardAspectRatio > awailableHeightInPixels) {
      
      boardHeightInPixels = awailableHeightInPixels;
      this._board.elementSizeInPixels = (boardHeightInPixels / boardHeightInElements);
      boardWidthInPixels = this._board.elementSizeInPixels * boardWidthInElements;
    } else {
      boardWidthInPixels = awailableWidthInPixels;
      this._board.elementSizeInPixels = (boardWidthInPixels / boardWidthInElements);
      boardHeightInPixels =  this._board.elementSizeInPixels * boardHeightInElements;
    }
  
    this._board.widthInPixels = boardWidthInPixels;
    this._board.heightInPixels = boardHeightInPixels;
    //this._board.elementSizeInPixels = (boardWidthInPixels / boardWidthInElements);

    this.changeCanvasSize();

    if(!this.candrawBoards) return;
    this.candrawBoards = false;
    setTimeout(() => {
      this.drawAllElements();
      this.candrawBoards = true;
    }, this._frameInterval);
  }

  changeCanvasSize() {
    this._bgCanvasDrawer.changeCanvasSize(this._board.widthInPixels, this._board.heightInPixels);
    this._gameCanvasDrawer.changeCanvasSize(this._board.widthInPixels, this._board.heightInPixels);
    this._gridCanvasDrawer.changeCanvasSize(this._board.widthInPixels, this._board.heightInPixels);
  }

  isEqualCoordinates(firstCoordinate: SnakeCoordinateModel, secondCoordinate: SnakeCoordinateModel) {
    if(firstCoordinate.x === secondCoordinate.x && firstCoordinate.y === secondCoordinate.y) {
      return true;
    }
    return false;
  }
    
  get currentScore() {
    return this._currentScore;
  }

  get bestScore() {
    return this._bestScore;
  }

  get isGameInterrupted() {
    return this._isGameInterrupted;
  }

  get isGameOver() {
    return this._isGameOver;
  }

  get frameInterval() {
    return this._frameInterval;
  }

  get lastFrameTime() {
    return this._lastFrameTime;
  }

  get timeToPassOneElementInSeconds() {
    return this._timeToPassOneElementInSeconds;
  }

  get timeElapsedInSeconds() {
    return this._timeElapsedInSeconds;
  }

  set currentScore(currentScore: number) {
    this._currentScore = currentScore;
  }

  set isGamePaused(isGamePaused: boolean) {
    this._isGameInterrupted = isGamePaused;
  }

  set isGameOver(isGameOver: boolean) {
    this._isGameOver = isGameOver;
  }

  set frameInterval(frameInterval: number) {
    this._frameInterval = frameInterval;
  }

  set lastFrameTime(lastFrameTime: number) {
    this._lastFrameTime = lastFrameTime;
  }

  set timeToPassOneElementInSeconds(timeToPassOneElementInSeconds: number) {
    this._timeToPassOneElementInSeconds = timeToPassOneElementInSeconds;
  }

  set timeElapsedInSeconds(timeElapsedInSeconds: number) {
    this._timeElapsedInSeconds = timeElapsedInSeconds;
  }

  set currentDirection(currentDirection: SnakeCoordinateModel) {
    this._currentDirection = {x: currentDirection.x, y: currentDirection.y};
  }

  getBoardWidthInPixels () {
    return this._board.widthInPixels;
  }

  getBoardHeightInPixels () {
    return this._board.heightInPixels;
  }
}