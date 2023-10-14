import { SnakeBoardModel } from "./snake-board.model";
import { SnakeCanvasDrawer } from "./snake-canvas-drawer";
import { SnakeCoordinateModel } from "./snake-coordinate.model";
import { SnakeFoodModel } from "./snake-food.model";
import { SnakeSnakeModel } from "./snake-snake.model";
import { SnakeComponent } from "./snake.component";

export class SnakeGameStateModel {
    private _currentScore = 0; 
    private _bestScore = 0; 
    private _isGamePaused = false;
    private _isRestartGame = false;
    private _isChangeMap = false;
    private _isGameOver = false;
    private _frameInterval = 1000/30;
    private _lastFrameTime = 0;
    private _timeToPassOneElementInSeconds = 0.3;
    private _timeElapsedInSeconds = 0;
    private _currentDirection = {x: 0, y: 1};
    private _specialFood: SnakeFoodModel | null = null;
    private _board!: SnakeBoardModel;
    private _snake!: SnakeSnakeModel;
    private _foods!: SnakeFoodModel[];
    private _obstacles!: SnakeCoordinateModel[];
    private _canvasDrawer: SnakeCanvasDrawer;
    private initSnakeCoord: SnakeCoordinateModel = {x: 0, y:0};
    private initFoodCoords: SnakeCoordinateModel[] = [];
    constructor(canvas: HTMLCanvasElement) {
        this._canvasDrawer = new SnakeCanvasDrawer(canvas);
        this.initBoardElements();
    }

    initBoardElements() {
        this._board = new SnakeBoardModel(400, 240, 25, 15);
    
        this.initSnakeCoord = this._board.setItemInRandElement('')[0]; //delete 'snake'?
        this._snake = new SnakeSnakeModel( { ...this.initSnakeCoord }, this._currentDirection);
        
        this._foods = [];
        
        let initFoodTypes = ['normal', 'speed', 'length'];
        this.initFoodCoords = [];
        for(let initFoodType of initFoodTypes) {
            let initFoodCoord = this._board.setItemInRandElement('food', [{ ...this.initSnakeCoord}])[0];
            this.initFoodCoords.push({ ...initFoodCoord });
            let food = new SnakeFoodModel(initFoodCoord, initFoodType);
            this._foods.push(food);
        }
    
        this._obstacles = [];
        let newObstacle = this._board.setItemInRandElement(
          'obstacle', 
          [{ ...this.initSnakeCoord, ...this.initFoodCoords, ...this._obstacles }], 2, 5);
        this._obstacles.push(...newObstacle);
        
        
    }

    setInitBoardElements() {
      this._board = new SnakeBoardModel(400, 240, 25, 15);
      this._snake = new SnakeSnakeModel( { ...this.initSnakeCoord }, this._currentDirection);
      this._board.setElement(this.initSnakeCoord.x, this.initSnakeCoord.y, ''); //delete 'snake'?
        
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
        this._isGamePaused = false;
        this._isRestartGame = false;
        this._isGameOver = false;
        this._lastFrameTime = 0;
        this._timeToPassOneElementInSeconds = 0.3;
        this._timeElapsedInSeconds = 0;
        this._specialFood = null;
        this._currentDirection = {x: 0, y: 1};
       // this._isChangeMap = false;
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

    updateGame(currentTime: DOMHighResTimeStamp) {
  
        if(this._isRestartGame) {
          this.restartGame();
          return;
        }
    
        if(this._isGamePaused) {
          this.drawAllElements();
          this.drawSnakeShift(this._timeElapsedInSeconds / this._timeToPassOneElementInSeconds);
          this.drawTextInBoardCenter('Paused');
          this.triggerUpdateFunction(currentTime);
          return;
        } 
    
        const deltaTime = (currentTime - this._lastFrameTime) / 1000;
      
        
        this._timeElapsedInSeconds += deltaTime;
        while(this._timeElapsedInSeconds >= this._timeToPassOneElementInSeconds) {
          
          this.drawAllElements();
          this.drawSnakeShift(1);
          
          this._currentDirection = this._snake.setDirection(this._currentDirection);
          let newPartOfSnakeBody = this._snake.move(this._currentDirection);
          let lastPartOfSnakeBody = this._snake.getBodyPart(0);
          this.isFood(newPartOfSnakeBody, lastPartOfSnakeBody);
          this.isSpecialFood(newPartOfSnakeBody);
          let snakeLength = this._snake.getSnakeLength();
          let newSnakeBodyPart = this._snake.getBodyPart(snakeLength-1);
          let penultimatePartOfSnakeBody = snakeLength > 1 ? this._snake.getBodyPart(1) : null;
    
          this._board.editSnakeCoordinate(lastPartOfSnakeBody, penultimatePartOfSnakeBody, newSnakeBodyPart);
    
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
        
    
        this.triggerUpdateFunction(currentTime);
      
        
      } 


      displayEndGame() {
        if(this._isRestartGame) {
          this.restartGame();
          return;
        }
    
        this.drawAllElements();
        this.drawSnake(this._snake.deadSnakeColor);
        this.markEndGameElement();
        setTimeout(() => {
          this.displayEndGame();
        }, this._frameInterval);
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

        this._canvasDrawer.drawSign(
            sign, fontSize, fontFamily, fontColor, centerX, centerY);
      }

      
    drawSnake(snakeColor: string) {
        let snakeBody = this._snake.getBody();
        let boardElementLenInPixels = this._board.elementSizeInPixels;
        snakeBody.forEach((bodyPart: SnakeCoordinateModel, index: number) => {
        
        this._canvasDrawer.drawRect(
            snakeColor,
            bodyPart.x * boardElementLenInPixels + 2.5,
            bodyPart.y * boardElementLenInPixels + 2.5,
            boardElementLenInPixels - 5);

        

        });
    }

    restartGame() {
      this.setInitGameState();
      if(this._isChangeMap) {
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


  triggerUpdateFunction(currentTime: number) {
    this._lastFrameTime = currentTime;
    setTimeout(() => {
      requestAnimationFrame((currentTime) => {
        this.updateGame(currentTime);
        
      });;
    }, this._frameInterval);
  }

      drawSnakeShift(shiftFactor: number = 1) {
    
        let snakeHistory = this._snake.getHistoryOfDirections();
      
        let snakeLength = this._snake.getSnakeLength();
        let lastPartOfSnakeBody = this._snake.getBody()[0];
        let penultimatePartOfSnakeBody = snakeLength > 1 ? this._snake.getBodyPart(1) : null;
        let directionLastPartOfSnakeBody = snakeHistory[snakeHistory.length - snakeLength];
    
        
    
    
        let snakeBody = this._snake.getBody();
       
        let boardElementSizeInPixels = this._board.elementSizeInPixels;
        
        for(let i= 0; i< snakeLength; i++) {
          
          this._canvasDrawer.drawRect(
            this._snake.liveSnakeColor,
            snakeBody[i].x * boardElementSizeInPixels,
            snakeBody[i].y * boardElementSizeInPixels,
            boardElementSizeInPixels);
        }
       
        
         let cc = (lastPartOfSnakeBody.x+lastPartOfSnakeBody.y) % 2 == 0 ?  this._board.firstBgColor :  this._board.secondBgColor;
    
    
        // remove part of the snake's body
        // The last two parts of the snake are the same when it has eaten the food.
        // Then the snake should grow so that it doesn't lose the last part.
        if(penultimatePartOfSnakeBody == null || !this.isEqualCoordinates(lastPartOfSnakeBody, penultimatePartOfSnakeBody)) {
          this.drawSnakeShiftHelper({ ...lastPartOfSnakeBody }, directionLastPartOfSnakeBody, shiftFactor,  cc);
        } 
       
      
      
      
        let snakeDestination = this._snake.destination;
        let directionSnakeDestination = snakeHistory[snakeHistory.length - 1];
        // add part of the snake's body
        this.drawSnakeShiftHelper({ ...snakeDestination }, directionSnakeDestination, shiftFactor, this._snake.liveSnakeColor);
        
    
        for(let i = 0; i <  this._board.heightInElements; i +=1) {
         for(let j = 0; j <  this._board.widthInElements; j += 1) {
          this._canvasDrawer.drawRectBorder(
            "black",
            j*boardElementSizeInPixels, 
            i*boardElementSizeInPixels,
             1*boardElementSizeInPixels);
         }
       }
       }
    
      drawSnakeShiftHelper(drawCoord: SnakeCoordinateModel, direction: SnakeCoordinateModel, shiftFactor: number, color: string) {
        
        
        let boardElementLenInPixels = this._board.elementSizeInPixels;
        let startX, startY, endX, endY;
        if(direction.x === 0 && direction.y === -1) {
          startX = drawCoord.x * boardElementLenInPixels;
          startY = drawCoord.y * boardElementLenInPixels + boardElementLenInPixels - shiftFactor * boardElementLenInPixels;
          endX = boardElementLenInPixels
          endY = boardElementLenInPixels * shiftFactor;
          this._canvasDrawer.drawRect(color, startX, startY, endX, endY);
        } else if(direction.x === 1 && direction.y === 0) { 
          startX = drawCoord.x * boardElementLenInPixels;
          startY = drawCoord.y * boardElementLenInPixels;
          endX = boardElementLenInPixels * shiftFactor;
          endY = boardElementLenInPixels;
          this._canvasDrawer.drawRect(color, startX, startY, endX, endY);
        } else if(direction.x === 0 && direction.y === 1) { 
          startX = drawCoord.x * boardElementLenInPixels;
          startY = drawCoord.y * boardElementLenInPixels;
          endX = boardElementLenInPixels;
          endY = boardElementLenInPixels * shiftFactor;
          this._canvasDrawer.drawRect(color, startX, startY, endX, endY);
        } else if(direction.x === -1 && direction.y === 0) {
          startX = drawCoord.x * boardElementLenInPixels + boardElementLenInPixels - shiftFactor * boardElementLenInPixels;
          startY = drawCoord.y * boardElementLenInPixels;
          endX = boardElementLenInPixels * shiftFactor;
          endY = boardElementLenInPixels;
          this._canvasDrawer.drawRect(color, startX, startY, endX, endY);
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
        this.drawFood(newfoodCoord, eatenFood.color, eatenFood.sign);
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
        this.drawFood( { ...specialFoodCoord}, this._specialFood.color, this._specialFood.sign);
        
      }
    

    drawAllElements() {

        this._canvasDrawer.clearCanvas();
        this.drawBoard();
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
              
                this._canvasDrawer.drawRect(
                    color,
                    rowNumber * boardElementLenInPixels,
                    columnNumber * boardElementLenInPixels,
                    boardElementLenInPixels);

                this._canvasDrawer.drawRectBorder(
                    "black",
                    rowNumber * boardElementLenInPixels,
                    columnNumber * boardElementLenInPixels, 
                    boardElementLenInPixels);
                isfirstColor = !isfirstColor;
            }
          }
    }

    drawFoods() {

        for(let food of this._foods) {
          this.drawFood({ ...food.coordinate},
            food.color, food.sign);
        }
    
        if(this._specialFood !== null) {
          this.drawFood( { ...this._specialFood.coordinate}, 
            this._specialFood.color, this._specialFood.sign);
        }
    }
    
    drawFood(foodCoord: SnakeCoordinateModel, color: string, sign: string) {
    
        let boardElementSizeInPixels = this._board.elementSizeInPixels;
    
        let centerX = foodCoord.x * boardElementSizeInPixels + boardElementSizeInPixels / 2;
        let centerY = foodCoord.y * boardElementSizeInPixels + boardElementSizeInPixels / 2;
        let radius =  boardElementSizeInPixels / 2 - 2.5;
       
        this._canvasDrawer.drawCircle(centerX, centerY, radius, color);

        const fontSize = boardElementSizeInPixels * 0.6;
        const fontFamily = "Kristen ITC";
        const fontColor = (foodCoord.x + foodCoord.y) % 2 == 0 ? this._board.firstBgColor :  this._board.secondBgColor;
        
        this._canvasDrawer.drawSign(
            sign, fontSize, fontFamily,
            fontColor, centerX, centerY,
        );
    }

    drawObstacles() {

        let boardElementSizeinPixels = this._board.elementSizeInPixels;
    
        for(let obstacle of this._obstacles) {
            this._canvasDrawer.drawRect(
                "black",
                obstacle.x * boardElementSizeinPixels,
                obstacle.y * boardElementSizeinPixels,
                boardElementSizeinPixels);
        };
      }

      drawTextInBoardCenter(text: string) {
       
        let boardElementLenInPixels = this._board.elementSizeInPixels;
    
        this._canvasDrawer.drawTextInBoardCenter(
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
  
        this._board.widthInPixels = boardWidthInPixels;
        this._board.heightInPixels = boardHeightInPixels;
        this._board.elementSizeInPixels = (boardWidthInPixels / boardWidthInElements);
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

    get isGamePaused() {
        return this._isGamePaused;
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
        this._isGamePaused = isGamePaused;
    }

    set isRestartGame(isRestartGame: boolean) {
        this._isRestartGame = isRestartGame;
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

    set isChangeMap(isChangeMap: boolean) {
        this._isChangeMap = isChangeMap;
    }

    getBoardWidthInPixels () {
        return this._board.widthInPixels;
    }

    getBoardHeightInPixels () {
        return this._board.heightInPixels;
    }
}