import { SnakeCoordinateModel } from "./snake-coordinate.model";

export class SnakeSnakeModel {

    private body: SnakeCoordinateModel[] = [];
    private historyOfDirections: string[] = [];
    private direction: SnakeCoordinateModel = {x: 0, y: 1};
    private color = {r: 127, g: 204, b: 190};
     
    constructor(private coordinate: SnakeCoordinateModel, direction: string) {
        this.body = [{x: this.coordinate.x, y: this.coordinate.y}];
       
        this.historyOfDirections.push(direction);
       
    }
    destination: SnakeCoordinateModel = {x: 0, y:0};

    move(direction: string) {
       
        this.body.shift();
        this.body.push({ ...this.destination });
       
        this.historyOfDirections.push(direction);

        return { ...this.destination };
        
    }

    getDestination(boardLenInElements: number) {
       
    
           
          
            let newCoord = {
                x: this.body[this.body.length - 1].x, 
                y: this.body[this.body.length - 1].y
            };
           
            if(this.direction.x == 1) {
                newCoord.x = 
                    (newCoord.x + 1 < boardLenInElements)
                    ? newCoord.x + 1
                    : 0;
            } else if(this.direction.x == -1) {
                newCoord.x = 
                    (newCoord.x - 1 >= 0)
                ? newCoord.x - 1
                : boardLenInElements - 1;
            } else if(this.direction.y == 1) {
                newCoord.y = 
                    (newCoord.y + 1 < boardLenInElements)
                    ? newCoord.y + 1
                    : 0;newCoord
            } else if(this.direction.y == -1) {
                newCoord.y = 
                    (newCoord.y - 1 >= 0)
                    ? newCoord.y - 1
                    : boardLenInElements - 1;
            }

            this.destination = { ...newCoord };
           
        
           
       return { ...this.destination };
        
        
    }

    eat(foodCoordinate: SnakeCoordinateModel) {
        this.body.splice(1, 0, { x: foodCoordinate.x, y: foodCoordinate.y });
    }

    setDirection(currentDirection: string) {
    
        switch(currentDirection) {
          case 'ArrowDown':
            if(this.direction.y == -1) return 'ArrowUp';
            this.direction = {x: 0, y: 1};
            break;
          case 'ArrowLeft':
            if(this.direction.x == 1) return 'ArrowRight';
            this.direction = {x: -1, y: 0};
            break;
          case 'ArrowUp':
            if(this.direction.y == 1) return 'ArrowDown';
            this.direction = {x: 0, y: -1};
            break;
          case 'ArrowRight':
            if(this.direction.x == -1) return 'ArrowLeft';
            this.direction = {x: 1, y: 0};
            break;
        }

        return currentDirection;
       
      }

    getDirection() {
        return {x: this.direction.x, y: this.direction.y};
    }

    getBody() {
        const bodyCopy = JSON.parse(JSON.stringify(this.body));
        return bodyCopy;
    }

    getSnakeLength() {
        return this.body.length;
    }

    getBodyPart(index: number) {
        return { ...this.body[index] };
    }

    setCoordinateOfSnakeHead(x: number, y: number) {
        this.body[this.body.length - 1] = {x: x, y: y};
    }

    getCoordinateOfSnakeHead() {
        return {x: this.body[this.body.length - 1].x, y: this.body[this.body.length - 1].y};
    }

    getColor() {
        const colorCopy = JSON.parse(JSON.stringify(this.color));
        return colorCopy;
    }

    addDirectionToHistory(direction: string) {
        this.historyOfDirections.push(direction);
    }

    getHistoryOfDirections() {
        return this.historyOfDirections.slice();
    }
}