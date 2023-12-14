import { Injectable } from "@angular/core";
import { Subject, tap } from "rxjs";

import { GameMap, GameMapType } from "../game-maps/game-map.model";
import { GameMapState } from "./game-map-state.model";
import { CanvasDrawer } from "./canvas-drawer";
import { Coordinate } from "./coordinate.model";
import { Food, FoodType } from "./food.model";
import { SnakeModel } from "./snake.model";
import { UserScore } from "../user-score.model";
import { GameMapService } from "../game-maps/game-map.service";

export enum GameState {
  NotStarted = 'not started',
  InProgress = 'in progress',
  Paused = 'paused',
  Ended = 'ended',
}

@Injectable()
export class GameService {
  currentScoreSubject = new Subject<number>();
  bestScoreSubject = new Subject<number>();
  gameMapWidthInPixelsSubject = new Subject<number>();

  private _gameState = GameState.NotStarted;
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
    gameMapState: GameMapState,
    snake: SnakeModel,
    normalFoods: Food[],
    specialFood: Food | null;
    obstaclesCoords: Coordinate[]; 
  };
  private _canvasDrawers!: {
    static: CanvasDrawer,
    snake: CanvasDrawer,
    food: CanvasDrawer,
    text: CanvasDrawer
  }
  private gameMap!: GameMap;
  private userScore!: UserScore;
  private candrawGameMap = true;

  constructor(private gameMapService: GameMapService) {}

  loadGameData(
    gameMapType: GameMapType,
    gameMapId: string,
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

    return  this.gameMapService.fetchGameMap(gameMapType, gameMapId)
    .pipe(
      tap(mapData => {
        this.gameMap = mapData.gameMap;
        this.userScore = mapData.userScore;
      
        this.initGame();
        this.changeScreenSize();
      })
    );
  }

  initGame() {
    this._gameMetrics = {
      currentScore: 0,
      secondsPerElement: this.gameMap.secondsPerElement,
      currentDirection: this.gameMap.snakeInitDirection,
    } 
    this.currentScoreSubject.next(this._gameMetrics.currentScore);
    this.bestScoreSubject.next(this.userScore.bestScore);
    const gameMapState = new GameMapState(
      400, 
      240, 
      this.gameMap.widthInElements, 
      this.gameMap.heightInElements);
    
    let initSnakeCoords = JSON.parse(this.gameMap.snakeInitCoords);
    const snake = new SnakeModel(initSnakeCoords, this.gameMap.snakeInitDirection, this.gameMap.snakeColor);
  
    let obstaclesJsonArray: {x: number, y: number, width: number, height: number}[] = JSON.parse(this.gameMap.obstacles);
    const obstaclesCoords: Coordinate[] = [];
    obstaclesJsonArray.forEach(obstacle => { 
      for(let i = 0; i < obstacle.width; i++) {
        const newX = obstacle.x + i;
        obstaclesCoords.push({x: newX , y: obstacle.y});
        gameMapState.setElement(newX, obstacle.y, 'obstacle');
      }
      for(let i = 0; i < obstacle.height; i++) {
        const newY = obstacle.y + i;
        obstaclesCoords.push({x: obstacle.x, y: newY});
        gameMapState.setElement(obstacle.x, newY, 'obstacle');
      }
    });

    const normalFoods = [];
        
    let initFoodTypes = [FoodType.Regular, FoodType.Speed, FoodType.Length];
    for(let initFoodType of initFoodTypes) {
        let initFoodCoord = gameMapState.setItemInRandElement('food', initSnakeCoords)[0];
        let food = new Food(initFoodCoord, initFoodType);
        normalFoods.push(food);
    }

    const specialFood = null;

    this._gameObjects = {
      gameMapState: gameMapState,
      snake: snake,
      normalFoods: normalFoods,
      specialFood: specialFood,
      obstaclesCoords: obstaclesCoords
    }
  }

  setInitGameState() {
    this._gameMetrics.currentScore = 0;
    this.currentScoreSubject.next(this._gameMetrics.currentScore);
    this._gameMetrics.secondsPerElement = this.gameMap.secondsPerElement;
    this._gameMetrics.currentDirection = this.gameMap.snakeInitDirection;
    this._gameState = GameState.NotStarted;
    this._animationMetrics.lastFrameTime = 0;
    this._animationMetrics.timeElapsedInSeconds = 0;
    this._gameObjects.specialFood = null;
  }

  determineBestScore() {
    
    if(this._gameMetrics.currentScore > this.userScore.bestScore) {
      this.userScore.bestScore = this._gameMetrics.currentScore;
      this.bestScoreSubject.next(this.userScore.bestScore);
    }

    this.userScore.gamesNumber = this.userScore.gamesNumber + 1;

    if(this.gameMap.id) {
      this.userScore.gamesNumber++;
      this.gameMapService.editUserScore(this.gameMap.id, this.userScore);
    }
  }

  startGame() {
    if(this._gameState !== GameState.NotStarted) {
      return;
    }

    this._gameState = GameState.InProgress;
    this.drawAllElements();
    this._animationMetrics.lastFrameTime = performance.now();
    this._gameObjects.snake.getDestination(this._gameObjects.gameMapState.widthInElements, this._gameObjects.gameMapState.heightInElements);
    requestAnimationFrame((currentTime) => {
      this.updateGame(currentTime);
    });
  }
  
  pauseGame() {
    if(this._gameState !== GameState.InProgress && this._gameState !== GameState.Paused) {
      return;
    }

    this._gameState = (this._gameState === GameState.InProgress) ? GameState.Paused : GameState.InProgress;
    if (this._gameState === GameState.Paused) {
      this.drawTextInGameMapCenter('Paused', 3);
      return;
    }
    if (this._gameState === GameState.InProgress) {
      this._canvasDrawers.text.clearCanvas();
      this._animationMetrics.lastFrameTime = performance.now();
      this.drawFoods();
      requestAnimationFrame((currentTime) => {
        this.updateGame(currentTime);
      });
    }
  }

  updateGame(currentTime: DOMHighResTimeStamp) {
    if(this._gameState === GameState.Paused) return;
    if(this._gameState === GameState.NotStarted) {
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
      this._gameObjects.gameMapState.editSnakeCoordinate(lastSnakeSegment, penultimateSnakeSegment, newSnakeSegment);
    
      let snakeDestination = this._gameObjects.snake.getDestination(this._gameObjects.gameMapState.widthInElements, this._gameObjects.gameMapState.heightInElements);
      const isGameEnd = this._gameObjects.gameMapState.isGameOver(snakeDestination);

      if(isGameEnd) {
        this._gameState = GameState.Ended;
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
    this.drawTextInGameMapCenter('You lost!', 3);
    this.markEndGameElement();
  }
    
  markEndGameElement() {
    let gameMapElementSizeInPixels = this._gameObjects.gameMapState.elementSizeInPixels;
    let snakeDestination = this._gameObjects.snake.destination;

    const sign = 'X';
    const fontSize = gameMapElementSizeInPixels * 1.1;
    const fontFamily = 'Arial';
    const fontColor = 'red';
    const centerX = snakeDestination.x * gameMapElementSizeInPixels + gameMapElementSizeInPixels/2;
    const centerY = snakeDestination.y * gameMapElementSizeInPixels + gameMapElementSizeInPixels/2;

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
    let gameMapElementLenInPixels = this._gameObjects.gameMapState.elementSizeInPixels;
    let snakeNarrowing = this._gameObjects.gameMapState.getSnakeNarrowing();
    let snakeLastSegment = snakeSegments[0];
    this._canvasDrawers.snake.drawRect(color, 
      snakeLastSegment.x * gameMapElementLenInPixels + snakeNarrowing,
      snakeLastSegment.y * gameMapElementLenInPixels + snakeNarrowing,
      gameMapElementLenInPixels - 2 * snakeNarrowing );
  }

  isEqualCoords(firstCoord: Coordinate, secondCoord: Coordinate) {
    return (firstCoord.x === secondCoord.x && firstCoord.y === secondCoord.y)
     ? true 
     : false;
  }

  restartGame() {
    if(this._gameState === GameState.Paused ||  this._gameState === GameState.Ended) {
      this.restartGameHelper();
      return;
    }
    this._gameState = GameState.NotStarted;
  }

  restartGameHelper() {
      this.setInitGameState();
      this.initGame();
      this.changeScreenSize();
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
    gameMapElCoord: Coordinate, 
    direction: string, 
    shiftFactor: number, 
    color: string) {
        
    let gameMapElementLenInPixels = this._gameObjects.gameMapState.elementSizeInPixels;
    let segmentParams = {
      x: gameMapElCoord.x * gameMapElementLenInPixels,
      y: gameMapElCoord.y * gameMapElementLenInPixels,
      width: gameMapElementLenInPixels,
      height: gameMapElementLenInPixels
    }

    segmentParams = this.narrowSnakeSegment({ ...segmentParams }, direction);
    segmentParams = this.trimSnakeSegment({ ...segmentParams }, direction, shiftFactor);
    this.drawSnakeNewSegment({ ...segmentParams }, gameMapElCoord, direction, color);
  }

  // Narrows the sides of the snake
  // The snake is visually set back by the narrow value so that it is correctly displayed when changing direction
  narrowSnakeSegment(segmentParams: {
    x: number,
    y: number,
    width: number,
    height: number
  }, direction: string) {
    let snakeNarrowing = this._gameObjects.gameMapState.getSnakeNarrowing();

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
    let gameMapElementLenInPixels = this._gameObjects.gameMapState.elementSizeInPixels;
    let segmentPart = gameMapElementLenInPixels - shiftFactor * gameMapElementLenInPixels;
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
  }, gameMapElCoord: Coordinate, direction: string, color: string) {
    let gameMapElementLenInPixels = this._gameObjects.gameMapState.elementSizeInPixels;
    let snakeNarrowing = this._gameObjects.gameMapState.getSnakeNarrowing();

    // In the narrowSnakeSegment function, the position of the snake is visually moved backwards.
    // The resulting gap in front of the snake is filled by the next element. 
    // When the snake passes through the wall, the gap is not filled because there is no next element.
    // The snake in the first element after passing through the wall also moves backwards,
    // so it draws a fragment outside the array. 
    // The code below moves this piece of the snake outside the game map to the place where the gap occurs.

    let isFirstColumn = gameMapElCoord.x === 0;
    let isFirstRow = gameMapElCoord.y === 0;
    let isLastColumn = gameMapElCoord.x === (this._gameObjects.gameMapState.widthInElements - 1);
    let isLastRow = gameMapElCoord.y === (this._gameObjects.gameMapState.heightInElements - 1);
    let withLessThanNarrowing = segmentParams.width <= snakeNarrowing;
    let heigthLessThanNarrowing = segmentParams.height <= snakeNarrowing;

    // Invisible part is the part of the snake drawn outside the game map
    let isOnlyDrawInvisiblePartBehindTopWall = 
    (direction === 'down' && isFirstRow && heigthLessThanNarrowing);
    let isOnlyDrawInvisiblePartBehindRightWall = 
    (direction === 'left' && isLastColumn && withLessThanNarrowing);
    let isOnlyDrawInvisiblePartBehindBottomWall = 
      (direction === 'up' && isLastRow && heigthLessThanNarrowing);
    let isOnlyDrawInvisiblePartBehindLeftWall = 
      (direction === 'right' && isFirstColumn && withLessThanNarrowing);
   
    // Changes the drawing position to a gap in front of the wall when drawing an invisible part outside the game map.
    if(isOnlyDrawInvisiblePartBehindTopWall) {
      segmentParams.y = this._gameObjects.gameMapState.heightInElements * gameMapElementLenInPixels - snakeNarrowing;
    }
    else if(isOnlyDrawInvisiblePartBehindRightWall) {
      segmentParams.x = snakeNarrowing - segmentParams.width
    }
    else if(isOnlyDrawInvisiblePartBehindBottomWall) {
      segmentParams.y = snakeNarrowing -  segmentParams.height;
    }
    else if(isOnlyDrawInvisiblePartBehindLeftWall) {
      segmentParams.x = this._gameObjects.gameMapState.widthInElements * gameMapElementLenInPixels - snakeNarrowing;
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
      segmentParams.x = this._gameObjects.gameMapState.widthInElements * gameMapElementLenInPixels - snakeNarrowing;
      segmentParams.width = snakeNarrowing;
    } else if(isAlsoDrawInvisiblePartBehindTopWall) { 
      segmentParams.y = this._gameObjects.gameMapState.heightInElements * gameMapElementLenInPixels - snakeNarrowing;
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
    gameMapElCoord: Coordinate, 
    direction: string, 
    shiftFactor: number) { 
    let gameMapElementSizeInPixels = this._gameObjects.gameMapState.elementSizeInPixels;
    let snakeNarrowing = this._gameObjects.gameMapState.getSnakeNarrowing();

    //element with drawCoord
    let segmentParams = {
      x: gameMapElCoord.x * gameMapElementSizeInPixels,
      y: gameMapElCoord.y * gameMapElementSizeInPixels,
      width: gameMapElementSizeInPixels,
      height: gameMapElementSizeInPixels
    }

    let segmentPart = gameMapElementSizeInPixels - shiftFactor * gameMapElementSizeInPixels;

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
    
    let isFirstColumn = gameMapElCoord.x === 0;
    let isFirstRow = gameMapElCoord.y === 0;
    let isLastColumn = gameMapElCoord.x === (this._gameObjects.gameMapState.widthInElements - 1);
    let isLastRow = gameMapElCoord.y === (this._gameObjects.gameMapState.heightInElements - 1);
    let uncleanWidth =  gameMapElementSizeInPixels - segmentParams.width;
    let isUncleanWithLessThanNarrowing = uncleanWidth <= snakeNarrowing;
    let uncleanHeight =  gameMapElementSizeInPixels - segmentParams.height;
    let isUncleanHeightLessThanNarrowing = uncleanHeight <= snakeNarrowing;

    // Additional cleaning when the snake passes through the wall
    if(direction === 'right' && isLastColumn && isUncleanWithLessThanNarrowing) {
      segmentParams.x = - snakeNarrowing * 2;
      segmentParams.width = snakeNarrowing - uncleanWidth;
    } else if( direction === 'left'  && isFirstColumn && isUncleanWithLessThanNarrowing) {
      segmentParams.x = gameMapElementSizeInPixels * this._gameObjects.gameMapState.widthInElements - (snakeNarrowing - uncleanWidth);
      segmentParams.width = snakeNarrowing - uncleanWidth;
    } else if(direction === 'down' && isLastRow && isUncleanHeightLessThanNarrowing) {
      segmentParams.y = -snakeNarrowing*2;
      segmentParams.height = snakeNarrowing - uncleanHeight;
    } else if(direction === 'up' && isFirstRow && isUncleanHeightLessThanNarrowing) {
      segmentParams.y = gameMapElementSizeInPixels * this._gameObjects.gameMapState.heightInElements - (snakeNarrowing - uncleanHeight);
      segmentParams.height = snakeNarrowing - uncleanHeight;
    }

    this._canvasDrawers.snake.clearRect(segmentParams.x, segmentParams.y, segmentParams.width, segmentParams.height);
  }

  isFood(newSnakeSegment: Coordinate, lastSnakeSegment: Coordinate) {
    let gameMapElement = this._gameObjects.gameMapState.getElement(newSnakeSegment.y, newSnakeSegment.x);
        
    if(gameMapElement !== 'food') return;
        
    const eatenFood = this._gameObjects.normalFoods.find(food => {
      let foodCoordinate = food.coordinate;
      return foodCoordinate.x === newSnakeSegment.x && foodCoordinate.y === newSnakeSegment.y;
    });
        
    if(eatenFood === undefined) return;
    
    this._gameObjects.snake.eat(lastSnakeSegment, eatenFood.elongationNumber);
    let newfoodCoord = this._gameObjects.gameMapState.setItemInRandElement('food')[0];
    eatenFood.coordinate = newfoodCoord;
    this.drawFoods();
    this._gameMetrics.currentScore += eatenFood.value;
    this.currentScoreSubject.next(this._gameMetrics.currentScore);
    this.updateSpeed(eatenFood.speedModifier);
    
    this.manageSpecialFood();
  }
    
  isSpecialFood(newSnakeSegment: Coordinate) {
    let gameMapElement = this._gameObjects.gameMapState.getElement(newSnakeSegment.y, newSnakeSegment.x);
        
    if(gameMapElement !== 'specialFood' || this._gameObjects.specialFood === null) return;
        
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
      this._gameObjects.gameMapState.setElement(specialFoodCoord.x, specialFoodCoord.y, '');
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
      
    let specialFoodCoord = this._gameObjects.gameMapState.setItemInRandElement('specialFood')[0];
    this._gameObjects.specialFood = new Food(specialFoodCoord, specialFoodType);
    
    this.drawFoods();
  }

  drawAllElements() {
    this._canvasDrawers.static.clearCanvas();
    this._canvasDrawers.snake.clearCanvas();
    this._canvasDrawers.food.clearCanvas();
    this._canvasDrawers.text.clearCanvas();
    this.drawGameMap();
    this.drawSnake(this._gameObjects.snake.liveSnakeColor);
    this.drawFoods();
    this.drawObstacles();

    if(this._gameState === GameState.NotStarted) {
      this.drawTextInGameMapCenter('Press \'s\' to start the game!', 1.2);
    }
     
    if(this._gameState === GameState.Ended) {
      this.drawTextInGameMapCenter('You lost!', 3);
    }
  }

  drawGameMap() {
    let gameMapElementLenInPixels = this._gameObjects.gameMapState.elementSizeInPixels;
    let isfirstColor = true;
    for(let rowNumber = 0; rowNumber < this._gameObjects.gameMapState.widthInElements; rowNumber++) {
      if(this._gameObjects.gameMapState.heightInElements % 2 === 0) {
        isfirstColor = !isfirstColor;
      }
      for(let columnNumber = 0; columnNumber < this._gameObjects.gameMapState.heightInElements; columnNumber++) {
        let color = isfirstColor ? this.gameMap.backgroundFirstColor : this.gameMap.backgroundSecondColor;
              
        this._canvasDrawers.static.drawRect(
          color,
          rowNumber * gameMapElementLenInPixels,
          columnNumber * gameMapElementLenInPixels,
          gameMapElementLenInPixels);

        this._canvasDrawers.static.drawRectBorder(
          "black",
          rowNumber * gameMapElementLenInPixels,
          columnNumber * gameMapElementLenInPixels, 
          gameMapElementLenInPixels);
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
    
  drawFood(foodCoord: Coordinate, color: string, sign: string) {
    console.log('f');
    let mapElementSizeInPixels = this._gameObjects.gameMapState.elementSizeInPixels;
    
    let centerX = foodCoord.x * mapElementSizeInPixels + mapElementSizeInPixels / 2;
    let centerY = foodCoord.y * mapElementSizeInPixels + mapElementSizeInPixels / 2;
    let radius =  mapElementSizeInPixels / 2 - 2.5;
       
    this._canvasDrawers.food.drawCircle(centerX, centerY, radius, color);

    const fontSize = mapElementSizeInPixels * 0.6;
    const fontFamily = "Kristen ITC";
    const fontColor = (foodCoord.x + foodCoord.y) % 2 == 0 ? this.gameMap.backgroundFirstColor : this.gameMap.backgroundSecondColor;
        
    this._canvasDrawers.food.drawSign(
      sign, fontSize, fontFamily,
      fontColor, centerX, centerY,
    );
  }

  drawObstacles() {
    let mapElementSizeinPixels = this._gameObjects.gameMapState.elementSizeInPixels;
    for(let obstacle of this._gameObjects.obstaclesCoords) {
      this._canvasDrawers.static.drawRect(
        this.gameMap.obstacleColor,
        obstacle.x * mapElementSizeinPixels,
        obstacle.y * mapElementSizeinPixels,
        mapElementSizeinPixels);
    }
  }

  drawTextInGameMapCenter(text: string, fontSize: number) {
    let mapElementLenInPixels = this._gameObjects.gameMapState.elementSizeInPixels;
    
    this._canvasDrawers.text.drawTextInGameMapCenter(
      text, 
      mapElementLenInPixels * fontSize,
      "Arial",
      "rgb(188, 192, 213)");
  }

  changeScreenSize() {
    let mapWidthInElements = this._gameObjects.gameMapState.widthInElements;
    let mapHeightInElements = this._gameObjects.gameMapState.heightInElements;
   
    const gameMapAspectRatio = mapWidthInElements / mapHeightInElements;

    const multiplier = (window.innerHeight < 650) ? 0.75 : 0.80;
    let awailableWidthInPixels = Math.floor((window.innerWidth < 450) ? 450 * multiplier : window.innerWidth * multiplier);
    let awailableHeightInPixels = Math.floor((window.innerHeight < 450) ? 450 * multiplier : window.innerHeight * multiplier);
    let gameMapWidthInPixels;
    let gameMapHeightInPixels;

    while(awailableWidthInPixels % mapWidthInElements !== 0) {
      awailableWidthInPixels--;
    }
    while(awailableHeightInPixels % mapHeightInElements !== 0) {
      awailableHeightInPixels--;
    }
  
    if (awailableWidthInPixels / gameMapAspectRatio > awailableHeightInPixels) {
      
      gameMapHeightInPixels = awailableHeightInPixels;
      this._gameObjects.gameMapState.elementSizeInPixels = (gameMapHeightInPixels / mapHeightInElements);
      gameMapWidthInPixels = this._gameObjects.gameMapState.elementSizeInPixels * mapWidthInElements;
    } else {
      gameMapWidthInPixels = awailableWidthInPixels;
      this._gameObjects.gameMapState.elementSizeInPixels = (gameMapWidthInPixels / mapWidthInElements);
      gameMapHeightInPixels =  this._gameObjects.gameMapState.elementSizeInPixels * mapHeightInElements;
    }
  
    this._gameObjects.gameMapState.widthInPixels = gameMapWidthInPixels;
    this.gameMapWidthInPixelsSubject.next(this._gameObjects.gameMapState.widthInPixels);
    this._gameObjects.gameMapState.heightInPixels = gameMapHeightInPixels;
    //this._gameObjects.gameMapState.elementSizeInPixels = (gameMapWidthInPixels / gameMapWidthInElements);

    this.changeCanvasSize();

    if(!this.candrawGameMap) return;
    this.candrawGameMap = false;
    setTimeout(() => {
      this.drawAllElements();
      this.candrawGameMap = true;
    }, this._animationMetrics.frameInterval);
  }

  changeCanvasSize() {
    this._canvasDrawers.static.changeCanvasSize(this._gameObjects.gameMapState.widthInPixels, this._gameObjects.gameMapState.heightInPixels);
    this._canvasDrawers.snake.changeCanvasSize(this._gameObjects.gameMapState.widthInPixels, this._gameObjects.gameMapState.heightInPixels);
    this._canvasDrawers.food.changeCanvasSize(this._gameObjects.gameMapState.widthInPixels, this._gameObjects.gameMapState.heightInPixels);
    this._canvasDrawers.text.changeCanvasSize(this._gameObjects.gameMapState.widthInPixels, this._gameObjects.gameMapState.heightInPixels);
  }

  isEqualCoordinates(firstCoordinate: Coordinate, secondCoordinate: Coordinate) {
    if(firstCoordinate.x === secondCoordinate.x && firstCoordinate.y === secondCoordinate.y) {
      return true;
    }
    return false;
  }

  endGame() {
    this._gameState = GameState.Paused;
  }
    
  set currentDirection(currentDirection: string) {
    if (this._gameState !== GameState.InProgress) {
      return;
    }
    
    this._gameMetrics.currentDirection = currentDirection;
  }

}