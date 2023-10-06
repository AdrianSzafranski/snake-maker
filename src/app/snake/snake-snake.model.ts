import { SnakeCoordinateModel } from "./snake-coordinate.model";

export class SnakeSnakeModel {

    private body: SnakeCoordinateModel[];
    private direction: SnakeCoordinateModel = {x: 0, y: 1};
    private color = {r: 127, g: 204, b: 190};

    constructor(private coordinate: SnakeCoordinateModel) {
        this.body = [{x: this.coordinate.x, y: this.coordinate.y}];
    }

    move(boardLenInElements: number) {
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

        let oldCoord = {
            x: this.body[0].x,
            y: this.body[0].y
        }
        
        this.body.shift();
        this.body.push({x: newCoord.x, y: newCoord.y});

        return {
            oldSnakeCoord: oldCoord,
            newSnakeCoord: newCoord
        };
    }

    eat(foodCoordinate: SnakeCoordinateModel) {
        this.body.push({x: foodCoordinate.x, y: foodCoordinate.y});  
    }

    setDirection(currentDirection: string) {
    
        switch(currentDirection) {
          case 'ArrowDown':
            if(this.direction.y == -1) return;
            this.direction = {x: 0, y: 1};
            break;
          case 'ArrowLeft':
            if(this.direction.x == 1) return;
            this.direction = {x: -1, y: 0};
            break;
          case 'ArrowUp':
            if(this.direction.y == 1) return;
            this.direction = {x: 0, y: -1};
            break;
          case 'ArrowRight':
            if(this.direction.x == -1) return;
            this.direction = {x: 1, y: 0};
            break;
        }
      }

    getDirection() {
        return {x: this.direction.x, y: this.direction.y};
    }

    getBody() {
        const bodyCopy = JSON.parse(JSON.stringify(this.body));
        return bodyCopy;
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
}