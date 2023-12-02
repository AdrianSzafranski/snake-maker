import { GameMap } from "../game-maps/game-map.model";
import { BoardModel } from "./board.model";
import { CanvasDrawer } from "./canvas-drawer";
import { CoordinateModel } from "./coordinate.model";
import { FoodModel } from "./food.model";
import { SnakeModel } from "./snake.model";

export class GameStateModel {
  private _currentScore = 0; 
  private _bestScore = 0; 
  private _isGameInterrupted = false;
  private _isGameOver = false;
  private _frameInterval = 1000/30;
  private _lastFrameTime = 0;
  private _timeToPassOneElementInSeconds = 0.5;
  private _timeElapsedInSeconds = 0;
  private _currentDirection = 'down';
  private _specialFood: FoodModel | null = null;
  private _board!: BoardModel;
  private _snake!: SnakeModel;
  private _foods!: FoodModel[];
  private _obstacles: CoordinateModel[] = [];
  private _bgCanvasDrawer: CanvasDrawer;
  private _gameCanvasDrawer: CanvasDrawer;
  private _gridCanvasDrawer: CanvasDrawer;
  private initSnakeCoords: CoordinateModel[] = [];
  private initFoodCoords: CoordinateModel[] = [];
  private candrawBoards = true;
  
  constructor(
    private map: GameMap,
    gameCanvas: HTMLCanvasElement, 
    bgCanvas: HTMLCanvasElement, 
    gidCanvas: HTMLCanvasElement) {
      this._bgCanvasDrawer = new CanvasDrawer(bgCanvas);
      this._gameCanvasDrawer = new CanvasDrawer(gameCanvas);
      this._gridCanvasDrawer = new CanvasDrawer(gidCanvas);

      if(this.map.obstacles) {
        this.initBoardElementsUsingFixedPositions();
      } else {
        this.initBoardElementsUsingRandPositions();
      }
  }

  initBoardElementsUsingFixedPositions() {
    this._timeElapsedInSeconds = this.map.initTimeToPassOneElementInSeconds;

    this._board = new BoardModel(
      400, 240, 
      this.map.boardWidthInElements, this.map.boardHeightInElements, 
      this.map.boardFirstColor, this.map.boardSecondColor,
      0.2);
    
    this.currentDirection = this.map.snakeInitDirection;
    let initSnakeCoords: CoordinateModel[] = JSON.parse(this.map.snakeInitCoords);
    this._snake = new SnakeModel(initSnakeCoords, this.map.snakeInitDirection);
  
    this._foods = [];
        
    let initFoodTypes = ['normal', 'speed', 'length'];
    this.initFoodCoords = [];
    for(let initFoodType of initFoodTypes) {
        let initFoodCoord = this._board.setItemInRandElement('food', this.initSnakeCoords)[0];
        this.initFoodCoords.push({ ...initFoodCoord });
        let food = new FoodModel(initFoodCoord, initFoodType);
        this._foods.push(food);
    }

    let obstaclesJsonArray: {x: number, y: number, width: number, height: number}[] = JSON.parse(this.map.obstacles);
    obstaclesJsonArray.forEach(obstacle => { 
      for(let i = 0; i < obstacle.width; i++) {
        const newX = obstacle.x + i;
        this._obstacles.push({x: newX , y: obstacle.y});
        this._board.setElement(newX, obstacle.y, 'obstacle');
      }
      for(let i = 0; i < obstacle.height; i++) {
        const newY = obstacle.y + i;
        this._obstacles.push({x: obstacle.x, y: newY});
        this._board.setElement(obstacle.x, newY, 'obstacle');
      }
    });
  }

  initBoardElementsUsingRandPositions() {
    this._timeElapsedInSeconds = this.map.initTimeToPassOneElementInSeconds;

    this._board = new BoardModel(
      400, 240, 
      this.map.boardWidthInElements, this.map.boardHeightInElements, 
      this.map.boardFirstColor, this.map.boardSecondColor,
      0.2);
    
    this.initSnakeCoords = this._board.setItemInRandElement('', undefined, undefined, 2);
    this._snake = new SnakeModel(this.initSnakeCoords, this._currentDirection);
  
    this._foods = [];
        
    let initFoodTypes = ['normal', 'speed', 'length'];
    this.initFoodCoords = [];
    for(let initFoodType of initFoodTypes) {
        let initFoodCoord = this._board.setItemInRandElement('food', this.initSnakeCoords)[0];
        this.initFoodCoords.push({ ...initFoodCoord });
        let food = new FoodModel(initFoodCoord, initFoodType);
        this._foods.push(food);
    }

 
    let newObstacle = this._board.setItemInRandElement('obstacle', 
      [ ...this.initSnakeCoords, ...this.initFoodCoords, ...this._obstacles ], 2, 5
    );
    this._obstacles.push(...newObstacle);    
    
  }

  setInitBoardElements() {
    this._board = new BoardModel(
      400, 240, 
      this.map.boardWidthInElements, this.map.boardHeightInElements, 
      this.map.boardFirstColor, this.map.boardSecondColor,
      0.2);

    this._snake = new SnakeModel(this.initSnakeCoords, this._currentDirection);
    for(let initSnakeCoord of this.initSnakeCoords) {
      this._board.setElement(initSnakeCoord.x, initSnakeCoord.y, '');
    } 
      
    this._foods = [];
    let initFoodTypes = ['normal', 'speed', 'length'];
    for(let i = 0; i < initFoodTypes.length; i++) {
          let food = new FoodModel(this.initFoodCoords[i], initFoodTypes[i]);
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
    this._currentDirection = 'down';
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

    for(let i = 1; i < snakeSegments.length; i++) { 
      let currentSegmentDir = dirHistory[lastSegmentDirIndex + i];
      let previousSegmentDir = dirHistory[lastSegmentDirIndex + i - 1];
      let isEqualDirs = currentSegmentDir === previousSegmentDir;
      let choosenDir = isEqualDirs ? currentSegmentDir : previousSegmentDir;
      this.determineSnakeNewSegment({ ...snakeSegments[i] }, choosenDir, 1, color);  
    }
    
    // draw snake last segment
    let boardElementLenInPixels = this._board.elementSizeInPixels;
    let snakeNarrowing = this._board.getSnakeNarrowing();
    let snakeLastSegment = snakeSegments[0];
    this._gameCanvasDrawer.drawRect(color, 
      snakeLastSegment.x * boardElementLenInPixels + snakeNarrowing,
      snakeLastSegment.y * boardElementLenInPixels + snakeNarrowing,
      boardElementLenInPixels - 2 * snakeNarrowing );
  }

  isEqualCoords(firstCoord: CoordinateModel, secondCoord: CoordinateModel) {
    return (firstCoord.x === secondCoord.x && firstCoord.y === secondCoord.y)
     ? true 
     : false;
  }

  restartGame(isChangeMap: boolean) {
    this._isGameInterrupted = true;
    this.setInitGameState();
    if(isChangeMap) {
      this.initBoardElementsUsingRandPositions();
    } else {
      if(this.map.obstacles) {
        this.initBoardElementsUsingFixedPositions();
      } else {
        this.setInitBoardElements();
      }
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

    // The last two parts of the snake are the same when it has eaten the food.
    // Then the snake should grow so that it doesn't lose the last part.
    if(penultimateSnakeSegment == null || !this.isEqualCoordinates(lastSnakeSegment, penultimateSnakeSegment)) {
      this.clearSnakeOldSegment({ ...lastSnakeSegment }, directionLastSnakeSegment, shiftFactor)
    } 
       
    // add part of the snake's body
    this.determineSnakeNewSegment({ ...snakeDestination }, directionSnakeDestination, shiftFactor, snakeColor);       
  }
    
  determineSnakeNewSegment(
    boardElCoord: CoordinateModel, 
    direction: string, 
    shiftFactor: number, 
    color: string) {
        
    let boardElementLenInPixels = this._board.elementSizeInPixels;
    let segmentParams = {
      x: boardElCoord.x * boardElementLenInPixels,
      y: boardElCoord.y * boardElementLenInPixels,
      width: boardElementLenInPixels,
      height: boardElementLenInPixels
    }

    segmentParams = this.narrowSnakeSegment({ ...segmentParams }, direction);
    segmentParams = this.trimSnakeSegment({ ...segmentParams }, direction, shiftFactor);
    this.drawSnakeNewSegment({ ...segmentParams }, boardElCoord, direction, color);
  }

  // Narrows the sides of the snake
  // The snake is visually set back by the narrow value so that it is correctly displayed when changing direction
  narrowSnakeSegment(segmentParams: {
    x: number,
    y: number,
    width: number,
    height: number
  }, direction: string) {
    let snakeNarrowing = this._board.getSnakeNarrowing();

    switch(direction) {
      case 'up':
        segmentParams.x += snakeNarrowing;
        segmentParams.y += snakeNarrowing;
        segmentParams.width -= 2* snakeNarrowing;
        break;
      case 'right':
        segmentParams.x -= snakeNarrowing;
        segmentParams.y += snakeNarrowing;
        segmentParams.height -= snakeNarrowing * 2;
        break;
      case 'down':
        segmentParams.x += snakeNarrowing;
        segmentParams.y -= snakeNarrowing;
        segmentParams.width -= snakeNarrowing * 2;
        break;
      case 'left':
        segmentParams.x += snakeNarrowing;
        segmentParams.y += snakeNarrowing;
        segmentParams.height -= snakeNarrowing * 2;
        break;
    }

    return { ...segmentParams };
  }

  // Determine the part of the snake segment to draw
  trimSnakeSegment(segmentParams: {
    x: number,
    y: number,
    width: number,
    height: number
  }, direction: string, shiftFactor: number) {
    let boardElementLenInPixels = this._board.elementSizeInPixels;
    let segmentPart = boardElementLenInPixels - shiftFactor * boardElementLenInPixels;
    switch(direction) {
      case 'up':
        segmentParams.y += segmentPart;
        segmentParams.height *= shiftFactor;
        break;
      case 'right':
        segmentParams.width *= shiftFactor;
        break;
      case 'down':
        segmentParams.height *= shiftFactor;
        break;
      case 'left':
        segmentParams.x += segmentPart;
        segmentParams.width *= shiftFactor;
        break;
    }

    return { ...segmentParams };
  }

  drawSnakeNewSegment(segmentParams: {
    x: number,
    y: number,
    width: number,
    height: number
  }, boardElCoord: CoordinateModel, direction: string, color: string) {
    let boardElementLenInPixels = this._board.elementSizeInPixels;
    let snakeNarrowing = this._board.getSnakeNarrowing();

    // In the narrowSnakeSegment function, the position of the snake is visually moved backwards.
    // The resulting gap in front of the snake is filled by the next element. 
    // When the snake passes through the wall, the gap is not filled because there is no next element.
    // The snake in the first element after passing through the wall also moves backwards,
    // so it draws a fragment outside the array. 
    // The code below moves this piece of the snake outside the board to the place where the gap occurs.

    let isFirstColumn = boardElCoord.x === 0;
    let isFirstRow = boardElCoord.y === 0;
    let isLastColumn = boardElCoord.x === (this._board.widthInElements - 1);
    let isLastRow = boardElCoord.y === (this._board.heightInElements - 1);
    let withLessThanNarrowing = segmentParams.width <= snakeNarrowing;
    let heigthLessThanNarrowing = segmentParams.height <= snakeNarrowing;

    // Invisible part is the part of the snake drawn outside the board
    let isOnlyDrawInvisiblePartBehindTopWall = 
    (direction === 'down' && isFirstRow && heigthLessThanNarrowing);
    let isOnlyDrawInvisiblePartBehindRightWall = 
    (direction === 'left' && isLastColumn && withLessThanNarrowing);
    let isOnlyDrawInvisiblePartBehindBottomWall = 
      (direction === 'up' && isLastRow && heigthLessThanNarrowing);
    let isOnlyDrawInvisiblePartBehindLeftWall = 
      (direction === 'right' && isFirstColumn && withLessThanNarrowing);
   
    // Changes the drawing position to a gap in front of the wall when drawing an invisible part outside the board.
    if(isOnlyDrawInvisiblePartBehindTopWall) {
      segmentParams.y = this._board.heightInElements * boardElementLenInPixels - snakeNarrowing;
    }
    else if(isOnlyDrawInvisiblePartBehindRightWall) {
      segmentParams.x = snakeNarrowing - segmentParams.width
    }
    else if(isOnlyDrawInvisiblePartBehindBottomWall) {
      segmentParams.y = snakeNarrowing -  segmentParams.height;
    }
    else if(isOnlyDrawInvisiblePartBehindLeftWall) {
      segmentParams.x = this._board.widthInElements * boardElementLenInPixels - snakeNarrowing;
    }

    this._gameCanvasDrawer.drawRect(color, segmentParams.x, segmentParams.y, segmentParams.width,  segmentParams.height); 

    // The entire gap will be filled as the snake passes through the wall
    // if the visible part of the first element after the wall is also drawn.
    // If the snake moves fast enough so that the size of the drawn element is always greater than the narrowing 
    // (size of the gap in front of the wall), the gap will be filled.
    let isAlsoDrawInvisiblePartBehindTopWall = 
    (direction === 'down' && isFirstRow && !heigthLessThanNarrowing);
    let isAlsoDrawInvisiblePartBehindRightWall = 
    (direction === 'left' && isLastColumn && !withLessThanNarrowing);
    let isAlsoDrawInvisiblePartBehindBottomWall = 
      (direction === 'up' && isLastRow && !heigthLessThanNarrowing);
    let isAlsoDrawInvisiblePartBehindLeftWall = 
      (direction === 'right' && isFirstColumn && !withLessThanNarrowing);

    if(isAlsoDrawInvisiblePartBehindLeftWall) {
      segmentParams.x = this._board.widthInElements * boardElementLenInPixels - snakeNarrowing;
      segmentParams.width = snakeNarrowing;
    } else if(isAlsoDrawInvisiblePartBehindTopWall) { 
      segmentParams.y = this._board.heightInElements * boardElementLenInPixels - snakeNarrowing;
      segmentParams.height = snakeNarrowing;
    } else if(isAlsoDrawInvisiblePartBehindRightWall) { 
      segmentParams.x = 0;
      segmentParams.width = snakeNarrowing;
    } else if(isAlsoDrawInvisiblePartBehindBottomWall) {
      segmentParams.y = 0;
      segmentParams.height = snakeNarrowing;
    }

    this._gameCanvasDrawer.drawRect(color, segmentParams.x, segmentParams.y, segmentParams.width,  segmentParams.height); 
  }
  
  clearSnakeOldSegment(
    boardElCoord: CoordinateModel, 
    direction: string, 
    shiftFactor: number) { 
    let boardElementSizeInPixels = this._board.elementSizeInPixels;
    let snakeNarrowing = this._board.getSnakeNarrowing();

    //element with drawCoord
    let segmentParams = {
      x: boardElCoord.x * boardElementSizeInPixels,
      y: boardElCoord.y * boardElementSizeInPixels,
      width: boardElementSizeInPixels,
      height: boardElementSizeInPixels
    }

    let segmentPart = boardElementSizeInPixels - shiftFactor * boardElementSizeInPixels;

    // positioning and calculation of parts of the cleared segment
    if(direction === 'up') {
      segmentParams.y -= snakeNarrowing;
      segmentParams.y += segmentPart;
      segmentParams.height *= shiftFactor;
    } else if(direction === 'right') { 
      segmentParams.x -= snakeNarrowing;
      segmentParams.width *= shiftFactor;
      segmentParams.width += snakeNarrowing * 2;
    } else if(direction === 'down') { 
      segmentParams.y -= snakeNarrowing;
      segmentParams.height *= shiftFactor;
      segmentParams.height += snakeNarrowing * 2;
    } else if(direction === 'left') { 
      segmentParams.x -= snakeNarrowing;
      segmentParams.x += segmentPart;
      segmentParams.width *= shiftFactor;
    }

    this._gameCanvasDrawer.clearRect(segmentParams.x, segmentParams.y, segmentParams.width, segmentParams.height);
    
    let isFirstColumn = boardElCoord.x === 0;
    let isFirstRow = boardElCoord.y === 0;
    let isLastColumn = boardElCoord.x === (this._board.widthInElements - 1);
    let isLastRow = boardElCoord.y === (this._board.heightInElements - 1);
    let uncleanWidth =  boardElementSizeInPixels - segmentParams.width;
    let isUncleanWithLessThanNarrowing = uncleanWidth <= snakeNarrowing;
    let uncleanHeight =  boardElementSizeInPixels - segmentParams.height;
    let isUncleanHeightLessThanNarrowing = uncleanHeight <= snakeNarrowing;

    // Additional cleaning when the snake passes through the wall
    if(direction === 'right' && isLastColumn && isUncleanWithLessThanNarrowing) {
      segmentParams.x = - snakeNarrowing * 2;
      segmentParams.width = snakeNarrowing - uncleanWidth;
    } else if( direction === 'left'  && isFirstColumn && isUncleanWithLessThanNarrowing) {
      segmentParams.x = boardElementSizeInPixels * this._board.widthInElements - (snakeNarrowing - uncleanWidth);
      segmentParams.width = snakeNarrowing - uncleanWidth;
    } else if(direction === 'down' && isLastRow && isUncleanHeightLessThanNarrowing) {
      segmentParams.y = -snakeNarrowing*2;
      segmentParams.height = snakeNarrowing - uncleanHeight;
    } else if(direction === 'up' && isFirstRow && isUncleanHeightLessThanNarrowing) {
      segmentParams.y = boardElementSizeInPixels * this._board.heightInElements - (snakeNarrowing - uncleanHeight);
      segmentParams.height = snakeNarrowing - uncleanHeight;
    }

    this._gameCanvasDrawer.clearRect(segmentParams.x, segmentParams.y, segmentParams.width, segmentParams.height);
  }

  isFood(newSnakeSegment: CoordinateModel, lastSnakeSegment: CoordinateModel) {
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
    
  isSpecialFood(newSnakeSegment: CoordinateModel) {
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
    this._specialFood = new FoodModel(specialFoodCoord, specialFoodType);
    
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
      if(this._board.heightInElements % 2 === 0) {
        isfirstColor = !isfirstColor;
      }
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
    
  drawFood(foodCoord: CoordinateModel, color: string, sign: string) {
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

  isEqualCoordinates(firstCoordinate: CoordinateModel, secondCoordinate: CoordinateModel) {
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

  set currentDirection(currentDirection: string) {
    this._currentDirection = currentDirection;
  }

  getBoardWidthInPixels () {
    return this._board.widthInPixels;
  }

  getBoardHeightInPixels () {
    return this._board.heightInPixels;
  }
}