import { SnakeCoordinateModel } from "./snake-coordinate.model";
import { SnakeComponent } from "./snake.component";

export class SnakeBoardModel {

    private elementSizeInPixels;
    private elements;
    
    constructor(
        private widthInPixels: number,
        private heightInPixels: number,
        private widthInElements: number,
        private heightInElements: number) {
            this.elementSizeInPixels = this.widthInPixels / this.widthInElements;
            this.elements = Array.from({ length: this.heightInElements }, () => Array(this.widthInElements).fill(''));
    }

    getWidthInPixels() {
        return this.widthInPixels;
    }

    getHeightInPixels() {
        return this.heightInPixels;
    }

    getWidthInElements() {
        return this.widthInElements;
    }

    getHeightInElements() {
        return this.heightInElements;
    }

    getElementSizeInPixels() {
        return this.elementSizeInPixels;
    }

    getElements() {
        return this.elements.slice();
    }

    setWidthInPixels(newWidthInPixels: number) {
        this.widthInPixels = newWidthInPixels;
    }

    setHeightPixels(newHeightInPixels: number) {
        this.heightInPixels = newHeightInPixels;
    }
    
    setElementSizeInPixels(newElementSizeInPixels: number) {
        this.elementSizeInPixels = newElementSizeInPixels;
    }

    getElement(x: number, y:number) {
        return this.elements[x][y];
    }

    setElement(x: number, y:number, value: string) {
        this.elements[y][x] = value;
    }

    setItemToRandElement(item: string) {
    
        let randCoord = this.getRandCoord();

        while(this.elements[randCoord.y][randCoord.x] !== '') {
            randCoord = this.getRandCoord();
        }
        this.elements[randCoord.y][randCoord.x] = item;
    
        return { ...randCoord };
    }

    setObstaclesToRandElements(snakeCoord: SnakeCoordinateModel) {
        
        let obstacleCoords: SnakeCoordinateModel[] = [];

        let numberOfObstacles = Math.floor(this.widthInElements / 5);

        for(let i = 0; i < numberOfObstacles; i++) {

            let randCoord = this.getRandCoord();
            while (!this.isSuitableElementForObstacle({ ...randCoord }, { ...snakeCoord })) {
                randCoord = this.getRandCoord();
            } 
            
            this.elements[randCoord.y][randCoord.x] = 'obstacle';
            obstacleCoords.push({ ...randCoord });
        }


        let maxLengthOfHorizontalObstacle = Math.floor(this.widthInElements / 3);
        for(let i = 1; i < maxLengthOfHorizontalObstacle; i++) {
            
            let newX = obstacleCoords[0].x + i;
            if(newX >= this.widthInElements) {
                newX -= this.widthInElements;
            }
        
            let newCoord = {x: newX, y: obstacleCoords[0].y}

            if(!this.isSuitableElementForObstacle({ ...newCoord }, { ...snakeCoord })) {
               break;
            }

            this.elements[newCoord.y][newCoord.x] = 'obstacle';
            obstacleCoords.push({ ...newCoord });
            
        }

        let maxLengthOfVerticalObstacle = Math.floor(this.widthInElements / 2);
        for(let i = 1; i < maxLengthOfVerticalObstacle; i++) {
            
            let newY = obstacleCoords[0].y + i;
            if(newY >= this.heightInElements) {
                newY -= this.heightInElements;
            }
        
            let newCoord = { x: obstacleCoords[0].x, y: newY}
            
            if(!this.isSuitableElementForObstacle({ ...newCoord }, { ...snakeCoord })) {
               break;
            }

            this.elements[newCoord.y][newCoord.x] = 'obstacle';
            obstacleCoords.push({ ...newCoord });
            
        }
        

        return obstacleCoords;
    }

    isSuitableElementForObstacle(testCoord: SnakeCoordinateModel, snakeCoord: SnakeCoordinateModel) {
       
        let isSnakeRow = snakeCoord.x == testCoord.x;
        let isSnakeColumn = snakeCoord.y == testCoord.y;
        let isEmptyElement = this.elements[testCoord.y][testCoord.x] === '';

        if(isSnakeRow || isSnakeColumn || !isEmptyElement) {
            return false;
        }
        return true;
    }

    getRandCoord() {
        let x = Math.floor(Math.random() * this.widthInElements);
        let y = Math.floor(Math.random() * this.heightInElements);

        return {x: x, y: y};
    }

    editSnakeCoordinate(lastPartOfSnakeBody: SnakeCoordinateModel, penultimatePartOfSnakeBody: SnakeCoordinateModel | null, newSnakeCoord: SnakeCoordinateModel) {
   
        this.elements[newSnakeCoord.y][newSnakeCoord.x] = 'snake';
        
        // The last two parts of the snake are the same when it has eaten the food.
        // Then the snake should grow so that it doesn't lose the last part.
        if(penultimatePartOfSnakeBody !==null && SnakeComponent.isEqualCoordinates(lastPartOfSnakeBody, penultimatePartOfSnakeBody)) {
            return;
        }

        this.elements[lastPartOfSnakeBody.y][lastPartOfSnakeBody.x] = '';
    }

 

    
  isGameOver(snakeDestination: SnakeCoordinateModel) {
    let destinationElement = this.elements[snakeDestination.y][snakeDestination.x];
    console.log(destinationElement);
    if(destinationElement === 'snake' || destinationElement === 'obstacle') {
        return true;
    }
    return false;
  }

   

}

