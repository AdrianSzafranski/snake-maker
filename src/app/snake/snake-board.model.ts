import { SnakeCoordinateModel } from "./snake-coordinate.model";
import { SnakeComponent } from "./snake.component";

export class SnakeBoardModel {

    private elementLengthInPixels;
    private elements;

    constructor(
        private lengthInPixels: number,
        private lengthInElements: number) {
            this.elementLengthInPixels = this.lengthInPixels / this.lengthInElements;
            this.elements = Array.from({ length: this.lengthInElements }, () => Array(this.lengthInElements).fill(''));
    }

    getLengthInPixels() {
        return this.lengthInPixels;
    }

    getLengthInElements() {
        return this.lengthInElements;
    }

    getElementLengthInPixels() {
        return this.elementLengthInPixels;
    }

    getElements() {
        return this.elements.slice();
    }

    setLengthInPixels(newLengthInPixels: number) {
        this.lengthInPixels = newLengthInPixels;
        this.elementLengthInPixels = this.lengthInPixels / this.lengthInElements;
    }

    getElement(x: number, y:number) {
        return this.elements[x][y];
    }

    setElement(x: number, y:number, value: string) {
        this.elements[x][y] = value;
    }

    setItemToRandElement(item: string) {
    
        let randCoord = this.getRandCoord();

        while(this.elements[randCoord.x][randCoord.y] !== '') {
            randCoord = this.getRandCoord();
        }
        this.elements[randCoord.x][randCoord.y] = item;
    
        return { ...randCoord };
    }

    setObstaclesToRandElements(snakeCoord: SnakeCoordinateModel) {
        
        let obstacleCoords: SnakeCoordinateModel[] = [];

        let numberOfObstacles = Math.floor(this.lengthInElements / 5);

        for(let i = 0; i < numberOfObstacles; i++) {

            let randCoord = this.getRandCoord();
            while (!this.isSuitableElementForObstacle({ ...randCoord }, { ...snakeCoord })) {
                randCoord = this.getRandCoord();
            } 
            
            this.elements[randCoord.x][randCoord.y] = 'obstacle';
            obstacleCoords.push({ ...randCoord });
        }


        let maxLengthOfHorizontalObstacle = Math.floor(this.lengthInElements / 3);
        for(let i = 1; i < maxLengthOfHorizontalObstacle; i++) {
            
            let newX = obstacleCoords[0].x + i;
            if(newX >= this.lengthInElements) {
                newX -= this.lengthInElements;
            }
        
            let newCoord = {x: newX, y: obstacleCoords[0].y}

            if(!this.isSuitableElementForObstacle({ ...newCoord }, { ...snakeCoord })) {
               break;
            }

            this.elements[newCoord.x][newCoord.y] = 'obstacle';
            obstacleCoords.push({ ...newCoord });
            
        }

        let maxLengthOfVerticalObstacle = Math.floor(this.lengthInElements / 2);
        for(let i = 1; i < maxLengthOfVerticalObstacle; i++) {
            
            let newY = obstacleCoords[0].y + i;
            if(newY >= this.lengthInElements) {
                newY -= this.lengthInElements;
            }
        
            let newCoord = { x: obstacleCoords[0].x, y: newY}
            
            if(!this.isSuitableElementForObstacle({ ...newCoord }, { ...snakeCoord })) {
               break;
            }

            this.elements[newCoord.x][newCoord.y] = 'obstacle';
            obstacleCoords.push({ ...newCoord });
            
        }
        

        return obstacleCoords;
    }

    isSuitableElementForObstacle(testCoord: SnakeCoordinateModel, snakeCoord: SnakeCoordinateModel) {
       
        let isSnakeRow = snakeCoord.x == testCoord.x;
        let isSnakeColumn = snakeCoord.y == testCoord.y;
        let isEmptyElement = this.elements[testCoord.x][testCoord.y] === '';

        if(isSnakeRow || isSnakeColumn || !isEmptyElement) {
            return false;
        }
        return true;
    }

    getRandCoord() {
        let x = Math.floor(Math.random() * this.lengthInElements);
        let y = Math.floor(Math.random() * this.lengthInElements);

        return {x: x, y: y};
    }

    editSnakeCoordinate(lastPartOfSnakeBody: SnakeCoordinateModel, penultimatePartOfSnakeBody: SnakeCoordinateModel | null, newSnakeCoord: SnakeCoordinateModel) {
   
        this.elements[newSnakeCoord.x][newSnakeCoord.y] = 'snake';
        
        // The last two parts of the snake are the same when it has eaten the food.
        // Then the snake should grow so that it doesn't lose the last part.
        if(penultimatePartOfSnakeBody !==null && SnakeComponent.isEqualCoordinates(lastPartOfSnakeBody, penultimatePartOfSnakeBody)) {
            return;
        }

        this.elements[lastPartOfSnakeBody.x][lastPartOfSnakeBody.y] = '';
    }

 

    
  isGameOver(snakeDestination: SnakeCoordinateModel) {
    let destinationElement = this.elements[snakeDestination.x][snakeDestination.y];
    console.log(destinationElement);
    if(destinationElement === 'snake' || destinationElement === 'obstacle') {
        return true;
    }
    return false;
  }

   

}

