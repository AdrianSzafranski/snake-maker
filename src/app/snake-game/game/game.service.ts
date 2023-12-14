import { Injectable } from "@angular/core";
import { Subject, tap } from "rxjs";

import { GameMap } from "../game-maps/game-map.model";
import { BoardModel } from "./board.model";
import { CanvasDrawer } from "./canvas-drawer";
import { CoordinateModel } from "./coordinate.model";
import { Food, FoodType } from "./food.model";
import { SnakeModel } from "./snake.model";
import { UserScore } from "../user-score.model";
import { GameMapService } from "../game-maps/game-map.service";


@Injectable()
export class GameService {
  currentScoreSubject = new Subject<number>();
  bestScoreSubject = new Subject<number>();
  gameMapWidthInPixelsSubject = new Subject<number>();

  private _gameState = "not started"; // not started/in progress/paused/require restart/ended
  private _gameMetrics!: {
    currentScore: number,
    secondsPerElement: number, // snake speed
    currentDirection: string
  }
  private _animationMetrics = {
    frameInterval: 1000/30,
    lastFrameTime: 0,
    timeElapsedInSeconds: 0
  };
  private _gameObjects!: {
    gameMap: BoardModel,
    snake: SnakeModel,
    normalFoods: Food[],
    specialFood: Food | null;
    obstaclesCoords: CoordinateModel[]; 
  };
  private _canvasDrawers!: {
    static: CanvasDrawer,
    snake: CanvasDrawer,
    food: CanvasDrawer,
    text: CanvasDrawer
  }
  private gameMapConfig!: GameMap;
  private userScore!: UserScore;
  private candrawBoards = true;

  constructor(private gameMapService: GameMapService) {}

  loadGameData(
    gameMapId: string,
    gameMapType: string,
    staticCanvas: HTMLCanvasElement, 
    snakeCanvas: HTMLCanvasElement, 
    foodCanvas: HTMLCanvasElement,
    textCanvas: HTMLCanvasElement
    ) {
    this._canvasDrawers = {
      static: new CanvasDrawer(staticCanvas),
      snake: new CanvasDrawer(snakeCanvas),
      food: new CanvasDrawer(foodCanvas),
      text: new CanvasDrawer(textCanvas),
    }

    return  this.gameMapService.fetchMap(gameMapId, gameMapType)
    .pipe(
      tap(mapData => {
        this.gameMapConfig = mapData.gameMap;
        this.userScore = mapData.userScore;
      
        this.initGame();
        this.changeScreenSize();
      })
    );
  }

  initGame() {
    this._gameMetrics = {
      currentScore: 0,
      secondsPerElement: this.gameMapConfig.initTimeToPassOneElementInSeconds,
      currentDirection: this.gameMapConfig.snakeInitDirection,
    } 
    this.currentScoreSubject.next(this._gameMetrics.currentScore);
    this.bestScoreSubject.next(this.userScore.highestScore);
    const gameMap = new BoardModel(
      400, 240, 
      this.gameMapConfig.boardWidthInElements, this.gameMapConfig.boardHeightInElements, 
      this.gameMapConfig.boardFirstColor, this.gameMapConfig.boardSecondColor,
      0.2);
    
    let initSnakeCoords = JSON.parse(this.gameMapConfig.snakeInitCoords);
    const snake = new SnakeModel(initSnakeCoords, this.gameMapConfig.snakeInitDirection, this.gameMapConfig.snakeColor);
  
    let obstaclesJsonArray: {x: number, y: number, width: number, height: number}[] = JSON.parse(this.gameMapConfig.obstacles);
    const obstaclesCoords: CoordinateModel[] = [];
    obstaclesJsonArray.forEach(obstacle => { 
      for(let i = 0; i < obstacle.width; i++) {
        const newX = obstacle.x + i;
        obstaclesCoords.push({x: newX , y: obstacle.y});
        gameMap.setElement(newX, obstacle.y, 'obstacle');
      }
      for(let i = 0; i < obstacle.height; i++) {
        const newY = obstacle.y + i;
        obstaclesCoords.push({x: obstacle.x, y: newY});
        gameMap.setElement(obstacle.x, newY, 'obstacle');
      }
    });

    const normalFoods = [];
        
    let initFoodTypes = [FoodType.Regular, FoodType.Speed, FoodType.Length];
    for(let initFoodType of initFoodTypes) {
        let initFoodCoord = gameMap.setItemInRandElement('food', initSnakeCoords)[0];
        let food = new Food(initFoodCoord, initFoodType);
        normalFoods.push(food);
    }

    const specialFood = null;

    this._gameObjects = {
      gameMap: gameMap,
      snake: snake,
      normalFoods: normalFoods,
      specialFood: specialFood,
      obstaclesCoords: obstaclesCoords
    }
  }

  setInitGameState() {
    this._gameMetrics.currentScore = 0;
    this.currentScoreSubject.next(this._gameMetrics.currentScore);
    this._gameMetrics.secondsPerElement = this.gameMapConfig.initTimeToPassOneElementInSeconds;
    this._gameMetrics.currentDirection = this.gameMapConfig.snakeInitDirection;
    this._gameState = "not started";
    this._animationMetrics.lastFrameTime = 0;
    this._animationMetrics.timeElapsedInSeconds = 0;
    this._gameObjects.specialFood = null;
  }

  determineBestScore() {
    
    if(this._gameMetrics.currentScore > this.userScore.highestScore) {
      this.userScore.highestScore = this._gameMetrics.currentScore;
      this.bestScoreSubject.next(this.userScore.highestScore);
    }

    this.userScore.gamesNumber = this.userScore.gamesNumber + 1;

    if(this.gameMapConfig.id) {
      this.userScore.gamesNumber++;
      this.gameMapService.editUserScore(this.gameMapConfig.id, this.userScore);
    }
  }

  startGame() {
    this._gameState = "in progress";
    this.drawAllElements();
    this._animationMetrics.lastFrameTime = performance.now();
    this._gameObjects.snake.getDestination(this._gameObjects.gameMap.widthInElements, this._gameObjects.gameMap.heightInElements);
    requestAnimationFrame((currentTime) => {
      this.updateGame(currentTime);
    });
  }
  
  pauseGame() {
    if(this._gameState !== 'paused' && this._gameState !== 'in progress') {
      return;
    }

    this._gameState = "in progress" ? 'paused' : "in progress";
    if (this._gameState === 'paused') {
      this.drawTextInBoardCenter('Paused', 3);
      return;
    }
    if (this._gameState === 'in progress') {
      this._canvasDrawers.text.clearCanvas();
      this._animationMetrics.lastFrameTime = performance.now();
      this.drawFoods();
      requestAnimationFrame((currentTime) => {
        this.updateGame(currentTime);
      });
    }
  }

  updateGame(currentTime: DOMHighResTimeStamp) {
    if(this._gameState === 'paused') return;
    if(this._gameState === 'require restart') {
      this._gameState = 'not started';
      this.restartGameHelper();
      return;
    }
       
    const deltaTime = (currentTime - this._animationMetrics.lastFrameTime) / 1000;
      
    this._animationMetrics.timeElapsedInSeconds += deltaTime;
    while(this._animationMetrics.timeElapsedInSeconds >= this._gameMetrics.secondsPerElement) {
          
      this.drawSnakeShift(1);

      this._gameMetrics.currentDirection = this._gameObjects.snake.setDirection(this._gameMetrics.currentDirection);
      let newSnakeSegment = this._gameObjects.snake.move(this._gameMetrics.currentDirection);
      let lastSnakeSegment = this._gameObjects.snake.getBodyPart(0);

      this.isFood(newSnakeSegment, lastSnakeSegment);
      this.isSpecialFood(newSnakeSegment);

      let snakeLength = this._gameObjects.snake.getSnakeLength();
      let penultimateSnakeSegment = snakeLength > 1 ? this._gameObjects.snake.getBodyPart(1) : null;
      this._gameObjects.gameMap.editSnakeCoordinate(lastSnakeSegment, penultimateSnakeSegment, newSnakeSegment);
    
      let snakeDestination = this._gameObjects.snake.getDestination(this._gameObjects.gameMap.widthInElements, this._gameObjects.gameMap.heightInElements);
      const isGameEnd = this._gameObjects.gameMap.isGameOver(snakeDestination);

      if(isGameEnd) {
        this._gameState = 'ended';
        this.determineBestScore();
        this.displayEndGame();
        return;
      }
      this._animationMetrics.timeElapsedInSeconds -= this._gameMetrics.secondsPerElement; 
    }
        
    this.drawSnakeShift(this._animationMetrics.timeElapsedInSeconds / this._gameMetrics.secondsPerElement); 
    this.triggerUpdateMethod(currentTime);   
  } 

  displayEndGame() {
    this.drawSnake(this._gameObjects.snake.deadSnakeColor);
    this.drawTextInBoardCenter('You lost!', 3);
    this.markEndGameElement();
  }
    
  markEndGameElement() {
    let boardElementSizeInPixels = this._gameObjects.gameMap.elementSizeInPixels;
    let snakeDestination = this._gameObjects.snake.destination;

    const sign = 'X';
    const fontSize = boardElementSizeInPixels * 1.1;
    const fontFamily = 'Arial';
    const fontColor = 'red';
    const centerX = snakeDestination.x * boardElementSizeInPixels + boardElementSizeInPixels/2;
    const centerY = snakeDestination.y * boardElementSizeInPixels + boardElementSizeInPixels/2;

    this._canvasDrawers.snake.drawSign(
      sign, fontSize, fontFamily, fontColor, centerX, centerY);
  }
  
  drawSnake(color: string) {
    // dir - direction
    let dirHistory = this._gameObjects.snake.directionHistory;
    let snakeSegments = this._gameObjects.snake.segments;
    let snakeLength = this._gameObjects.snake.segments.length;
    let lastSegmentDirIndex = dirHistory.length - snakeLength;

    for(let i = 1; i < snakeSegments.length; i++) { 
      let currentSegmentDir = dirHistory[lastSegmentDirIndex + i];
      let previousSegmentDir = dirHistory[lastSegmentDirIndex + i - 1];
      let isEqualDirs = currentSegmentDir === previousSegmentDir;
      let choosenDir = isEqualDirs ? currentSegmentDir : previousSegmentDir;
      this.determineSnakeNewSegment({ ...snakeSegments[i] }, choosenDir, 1, color);  
    }
    
    // draw snake last segment
    let boardElementLenInPixels = this._gameObjects.gameMap.elementSizeInPixels;
    let snakeNarrowing = this._gameObjects.gameMap.getSnakeNarrowing();
    let snakeLastSegment = snakeSegments[0];
    this._canvasDrawers.snake.drawRect(color, 
      snakeLastSegment.x * boardElementLenInPixels + snakeNarrowing,
      snakeLastSegment.y * boardElementLenInPixels + snakeNarrowing,
      boardElementLenInPixels - 2 * snakeNarrowing );
  }

  isEqualCoords(firstCoord: CoordinateModel, secondCoord: CoordinateModel) {
    return (firstCoord.x === secondCoord.x && firstCoord.y === secondCoord.y)
     ? true 
     : false;
  }

  restartGame() {
    if(this._gameState === 'paused' ||  this._gameState === 'ended') {
      this.restartGameHelper();
      return;
    }
    this._gameState = 'require restart';
  }

  restartGameHelper() {
      this.setInitGameState();
      this.initGame();
      this.changeScreenSize();
      this.startGame();
  }
  
  updateSpeed(speedModifier: number) {
    this._gameMetrics.secondsPerElement -= speedModifier * 0.005;
  }

  triggerUpdateMethod(currentTime: number) {
    this._animationMetrics.lastFrameTime = currentTime;
    setTimeout(() => {
      requestAnimationFrame((currentTime) => {
        this.updateGame(currentTime);
      });
    }, this._animationMetrics.frameInterval);
  }

  drawSnakeShift(shiftFactor: number = 1) {
    let snakeHistory = this._gameObjects.snake.directionHistory;
    let snakeLength = this._gameObjects.snake.getSnakeLength();
    let lastSnakeSegment = this._gameObjects.snake.segments[0];
    let penultimateSnakeSegment = snakeLength > 1 ? this._gameObjects.snake.getBodyPart(1) : null;
    let directionLastSnakeSegment = snakeHistory[snakeHistory.length - snakeLength];
    let snakeDestination = this._gameObjects.snake.destination;
    let directionSnakeDestination = snakeHistory[snakeHistory.length - 1];
    let snakeColor = this._gameObjects.snake.liveSnakeColor;

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
        
    let boardElementLenInPixels = this._gameObjects.gameMap.elementSizeInPixels;
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
    let snakeNarrowing = this._gameObjects.gameMap.getSnakeNarrowing();

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
    let boardElementLenInPixels = this._gameObjects.gameMap.elementSizeInPixels;
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
    let boardElementLenInPixels = this._gameObjects.gameMap.elementSizeInPixels;
    let snakeNarrowing = this._gameObjects.gameMap.getSnakeNarrowing();

    // In the narrowSnakeSegment function, the position of the snake is visually moved backwards.
    // The resulting gap in front of the snake is filled by the next element. 
    // When the snake passes through the wall, the gap is not filled because there is no next element.
    // The snake in the first element after passing through the wall also moves backwards,
    // so it draws a fragment outside the array. 
    // The code below moves this piece of the snake outside the board to the place where the gap occurs.

    let isFirstColumn = boardElCoord.x === 0;
    let isFirstRow = boardElCoord.y === 0;
    let isLastColumn = boardElCoord.x === (this._gameObjects.gameMap.widthInElements - 1);
    let isLastRow = boardElCoord.y === (this._gameObjects.gameMap.heightInElements - 1);
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
      segmentParams.y = this._gameObjects.gameMap.heightInElements * boardElementLenInPixels - snakeNarrowing;
    }
    else if(isOnlyDrawInvisiblePartBehindRightWall) {
      segmentParams.x = snakeNarrowing - segmentParams.width
    }
    else if(isOnlyDrawInvisiblePartBehindBottomWall) {
      segmentParams.y = snakeNarrowing -  segmentParams.height;
    }
    else if(isOnlyDrawInvisiblePartBehindLeftWall) {
      segmentParams.x = this._gameObjects.gameMap.widthInElements * boardElementLenInPixels - snakeNarrowing;
    }

    this._canvasDrawers.snake.drawRect(color, segmentParams.x, segmentParams.y, segmentParams.width,  segmentParams.height); 

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
      segmentParams.x = this._gameObjects.gameMap.widthInElements * boardElementLenInPixels - snakeNarrowing;
      segmentParams.width = snakeNarrowing;
    } else if(isAlsoDrawInvisiblePartBehindTopWall) { 
      segmentParams.y = this._gameObjects.gameMap.heightInElements * boardElementLenInPixels - snakeNarrowing;
      segmentParams.height = snakeNarrowing;
    } else if(isAlsoDrawInvisiblePartBehindRightWall) { 
      segmentParams.x = 0;
      segmentParams.width = snakeNarrowing;
    } else if(isAlsoDrawInvisiblePartBehindBottomWall) {
      segmentParams.y = 0;
      segmentParams.height = snakeNarrowing;
    }

    this._canvasDrawers.snake.drawRect(color, segmentParams.x, segmentParams.y, segmentParams.width,  segmentParams.height); 
  }
  
  clearSnakeOldSegment(
    boardElCoord: CoordinateModel, 
    direction: string, 
    shiftFactor: number) { 
    let boardElementSizeInPixels = this._gameObjects.gameMap.elementSizeInPixels;
    let snakeNarrowing = this._gameObjects.gameMap.getSnakeNarrowing();

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

    this._canvasDrawers.snake.clearRect(segmentParams.x, segmentParams.y, segmentParams.width, segmentParams.height);
    
    let isFirstColumn = boardElCoord.x === 0;
    let isFirstRow = boardElCoord.y === 0;
    let isLastColumn = boardElCoord.x === (this._gameObjects.gameMap.widthInElements - 1);
    let isLastRow = boardElCoord.y === (this._gameObjects.gameMap.heightInElements - 1);
    let uncleanWidth =  boardElementSizeInPixels - segmentParams.width;
    let isUncleanWithLessThanNarrowing = uncleanWidth <= snakeNarrowing;
    let uncleanHeight =  boardElementSizeInPixels - segmentParams.height;
    let isUncleanHeightLessThanNarrowing = uncleanHeight <= snakeNarrowing;

    // Additional cleaning when the snake passes through the wall
    if(direction === 'right' && isLastColumn && isUncleanWithLessThanNarrowing) {
      segmentParams.x = - snakeNarrowing * 2;
      segmentParams.width = snakeNarrowing - uncleanWidth;
    } else if( direction === 'left'  && isFirstColumn && isUncleanWithLessThanNarrowing) {
      segmentParams.x = boardElementSizeInPixels * this._gameObjects.gameMap.widthInElements - (snakeNarrowing - uncleanWidth);
      segmentParams.width = snakeNarrowing - uncleanWidth;
    } else if(direction === 'down' && isLastRow && isUncleanHeightLessThanNarrowing) {
      segmentParams.y = -snakeNarrowing*2;
      segmentParams.height = snakeNarrowing - uncleanHeight;
    } else if(direction === 'up' && isFirstRow && isUncleanHeightLessThanNarrowing) {
      segmentParams.y = boardElementSizeInPixels * this._gameObjects.gameMap.heightInElements - (snakeNarrowing - uncleanHeight);
      segmentParams.height = snakeNarrowing - uncleanHeight;
    }

    this._canvasDrawers.snake.clearRect(segmentParams.x, segmentParams.y, segmentParams.width, segmentParams.height);
  }

  isFood(newSnakeSegment: CoordinateModel, lastSnakeSegment: CoordinateModel) {
    let boardElement = this._gameObjects.gameMap.getElement(newSnakeSegment.y, newSnakeSegment.x);
        
    if(boardElement !== 'food') return;
        
    const eatenFood = this._gameObjects.normalFoods.find(food => {
      let foodCoordinate = food.coordinate;
      return foodCoordinate.x === newSnakeSegment.x && foodCoordinate.y === newSnakeSegment.y;
    });
        
    if(eatenFood === undefined) return;
    
    this._gameObjects.snake.eat(lastSnakeSegment, eatenFood.elongationNumber);
    let newfoodCoord = this._gameObjects.gameMap.setItemInRandElement('food')[0];
    eatenFood.coordinate = newfoodCoord;
    this.drawFoods();
    this._gameMetrics.currentScore += eatenFood.value;
    this.currentScoreSubject.next(this._gameMetrics.currentScore);
    this.updateSpeed(eatenFood.speedModifier);
    
    this.manageSpecialFood();
  }
    
  isSpecialFood(newSnakeSegment: CoordinateModel) {
    let boardElement = this._gameObjects.gameMap.getElement(newSnakeSegment.y, newSnakeSegment.x);
        
    if(boardElement !== 'specialFood' || this._gameObjects.specialFood === null) return;
        
    let specialFoodCoord = this._gameObjects.specialFood.coordinate;
    if(!this.isEqualCoordinates(specialFoodCoord, newSnakeSegment)) return;
    
    this._gameMetrics.currentScore += this._gameObjects.specialFood.value;
    this.currentScoreSubject.next(this._gameMetrics.currentScore);
    this._gameObjects.specialFood = null;
    this.drawFoods();
  }
    
  manageSpecialFood() {
    const randomNumber = Math.random();
    const isManageSpecialFood = randomNumber < 0.15;
    if(!isManageSpecialFood) return;
    
    if(this._gameObjects.specialFood !== null) {
      let specialFoodCoord = this._gameObjects.specialFood.coordinate;
      this._gameObjects.gameMap.setElement(specialFoodCoord.x, specialFoodCoord.y, '');
      this._gameObjects.specialFood = null;
      return;
    }
    
    let specialFoodType;
    if(randomNumber < 0.05) {
      specialFoodType = FoodType.Fortune;
    } else if(randomNumber < 0.10) {
      specialFoodType = FoodType.Curse;
    } else {
      specialFoodType = FoodType.Unknown;
    }
      
    let specialFoodCoord = this._gameObjects.gameMap.setItemInRandElement('specialFood')[0];
    this._gameObjects.specialFood = new Food(specialFoodCoord, specialFoodType);
    
    this.drawFoods();
  }

  drawAllElements() {
    this._canvasDrawers.static.clearCanvas();
    this._canvasDrawers.snake.clearCanvas();
    this._canvasDrawers.food.clearCanvas();
    this._canvasDrawers.text.clearCanvas();
    this.drawBoard();
    this.drawSnake(this._gameObjects.snake.liveSnakeColor);
    this.drawFoods();
    this.drawObstacles();

    if(this._gameState === 'not started') {
      this.drawTextInBoardCenter('Press \'s\' to start the game!', 1.2);
    }
     
    if(this._gameState === 'ended') {
      this.drawTextInBoardCenter('You lost!', 3);
    }
  }

  drawBoard() {
    let boardElementLenInPixels = this._gameObjects.gameMap.elementSizeInPixels;
    let isfirstColor = true;
    for(let rowNumber = 0; rowNumber < this._gameObjects.gameMap.widthInElements; rowNumber++) {
      if(this._gameObjects.gameMap.heightInElements % 2 === 0) {
        isfirstColor = !isfirstColor;
      }
      for(let columnNumber = 0; columnNumber < this._gameObjects.gameMap.heightInElements; columnNumber++) {
        let color = isfirstColor ? this._gameObjects.gameMap.firstBgColor : this._gameObjects.gameMap.secondBgColor;
              
        this._canvasDrawers.static.drawRect(
          color,
          rowNumber * boardElementLenInPixels,
          columnNumber * boardElementLenInPixels,
          boardElementLenInPixels);

        this._canvasDrawers.static.drawRectBorder(
          "black",
          rowNumber * boardElementLenInPixels,
          columnNumber * boardElementLenInPixels, 
          boardElementLenInPixels);
          isfirstColor = !isfirstColor;
      }
    }
  }

  drawFoods() {
    console.log(this._gameObjects.normalFoods);
    this._canvasDrawers.food.clearCanvas();
    for(let food of this._gameObjects.normalFoods) {
      this.drawFood({ ...food.coordinate}, food.color, food.sign);
    }
    
    if(this._gameObjects.specialFood !== null) {
      this.drawFood(
        { ...this._gameObjects.specialFood.coordinate}, 
        this._gameObjects.specialFood.color, 
        this._gameObjects.specialFood.sign);
    }
  }
    
  drawFood(foodCoord: CoordinateModel, color: string, sign: string) {
    console.log('f');
    let boardElementSizeInPixels = this._gameObjects.gameMap.elementSizeInPixels;
    
    let centerX = foodCoord.x * boardElementSizeInPixels + boardElementSizeInPixels / 2;
    let centerY = foodCoord.y * boardElementSizeInPixels + boardElementSizeInPixels / 2;
    let radius =  boardElementSizeInPixels / 2 - 2.5;
       
    this._canvasDrawers.food.drawCircle(centerX, centerY, radius, color);

    const fontSize = boardElementSizeInPixels * 0.6;
    const fontFamily = "Kristen ITC";
    const fontColor = (foodCoord.x + foodCoord.y) % 2 == 0 ? this._gameObjects.gameMap.firstBgColor :  this._gameObjects.gameMap.secondBgColor;
        
    this._canvasDrawers.food.drawSign(
      sign, fontSize, fontFamily,
      fontColor, centerX, centerY,
    );
  }

  drawObstacles() {
    let boardElementSizeinPixels = this._gameObjects.gameMap.elementSizeInPixels;
    for(let obstacle of this._gameObjects.obstaclesCoords) {
      this._canvasDrawers.static.drawRect(
        "black",
        obstacle.x * boardElementSizeinPixels,
        obstacle.y * boardElementSizeinPixels,
        boardElementSizeinPixels);
    }
  }

  drawTextInBoardCenter(text: string, fontSize: number) {
    let boardElementLenInPixels = this._gameObjects.gameMap.elementSizeInPixels;
    
    this._canvasDrawers.text.drawTextInBoardCenter(
      text, 
      boardElementLenInPixels * fontSize,
      "Arial",
      "rgb(188, 192, 213)");
  }

  changeScreenSize() {
    let boardWidthInElements = this._gameObjects.gameMap.widthInElements;
    let boardHeightInElements = this._gameObjects.gameMap.heightInElements;
   
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
      this._gameObjects.gameMap.elementSizeInPixels = (boardHeightInPixels / boardHeightInElements);
      boardWidthInPixels = this._gameObjects.gameMap.elementSizeInPixels * boardWidthInElements;
    } else {
      boardWidthInPixels = awailableWidthInPixels;
      this._gameObjects.gameMap.elementSizeInPixels = (boardWidthInPixels / boardWidthInElements);
      boardHeightInPixels =  this._gameObjects.gameMap.elementSizeInPixels * boardHeightInElements;
    }
  
    this._gameObjects.gameMap.widthInPixels = boardWidthInPixels;
    this.gameMapWidthInPixelsSubject.next(this._gameObjects.gameMap.widthInPixels);
    this._gameObjects.gameMap.heightInPixels = boardHeightInPixels;
    //this._gameObjects.gameMap.elementSizeInPixels = (boardWidthInPixels / boardWidthInElements);

    this.changeCanvasSize();

    if(!this.candrawBoards) return;
    this.candrawBoards = false;
    setTimeout(() => {
      this.drawAllElements();
      this.candrawBoards = true;
    }, this._animationMetrics.frameInterval);
  }

  changeCanvasSize() {
    this._canvasDrawers.static.changeCanvasSize(this._gameObjects.gameMap.widthInPixels, this._gameObjects.gameMap.heightInPixels);
    this._canvasDrawers.snake.changeCanvasSize(this._gameObjects.gameMap.widthInPixels, this._gameObjects.gameMap.heightInPixels);
    this._canvasDrawers.food.changeCanvasSize(this._gameObjects.gameMap.widthInPixels, this._gameObjects.gameMap.heightInPixels);
    this._canvasDrawers.text.changeCanvasSize(this._gameObjects.gameMap.widthInPixels, this._gameObjects.gameMap.heightInPixels);
  }

  isEqualCoordinates(firstCoordinate: CoordinateModel, secondCoordinate: CoordinateModel) {
    if(firstCoordinate.x === secondCoordinate.x && firstCoordinate.y === secondCoordinate.y) {
      return true;
    }
    return false;
  }

  endGame() {
    this._gameState = "paused";
  }
    
  set currentDirection(currentDirection: string) {
    if (this._gameState !== 'in progress') {
      return;
    }
    
    this._gameMetrics.currentDirection = currentDirection;
  }

}