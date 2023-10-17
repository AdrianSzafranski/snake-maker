import { SnakeCoordinateModel } from "./snake-coordinate.model";

export class SnakeSnakeModel {

    private _segments: SnakeCoordinateModel[] = [];
    private _directionHistory: SnakeCoordinateModel[] = [];
    private direction: SnakeCoordinateModel;
    private _liveSnakeColor = "rgb(131, 245, 108)";
    private _deadSnakeColor = "rgb(112, 112, 112)";
    destination: SnakeCoordinateModel = {x: 0, y:0};

    constructor(coords: SnakeCoordinateModel[], direction: SnakeCoordinateModel) {
        for(let coord of coords) {
            this._segments.push({x: coord.x, y: coord.y});
        }
       
        this.direction = direction;
        this._directionHistory.push( { ...direction });
        this._directionHistory.push( { ...direction });
    }
  
    move(direction: SnakeCoordinateModel) {
       
        this._segments.shift();
        this._segments.push({ ...this.destination });
       
        this._directionHistory.push({ ...direction });
        

        return { ...this.destination };
        
    }

    getDestination(boardHorizontalLenInElements: number, boardVerticalLenInElements: number) {
       
            let newCoord = {
                x: this._segments[this._segments.length - 1].x, 
                y: this._segments[this._segments.length - 1].y
            };
           
            if(this.direction.x == 1) {
                newCoord.x = 
                    (newCoord.x + 1 < boardHorizontalLenInElements)
                    ? newCoord.x + 1
                    : 0;
            } else if(this.direction.x == -1) {
                newCoord.x = 
                    (newCoord.x - 1 >= 0)
                ? newCoord.x - 1
                : boardHorizontalLenInElements - 1;
            } else if(this.direction.y == 1) {
                newCoord.y = 
                    (newCoord.y + 1 < boardVerticalLenInElements)
                    ? newCoord.y + 1
                    : 0;newCoord
            } else if(this.direction.y == -1) {
                newCoord.y = 
                    (newCoord.y - 1 >= 0)
                    ? newCoord.y - 1
                    : boardVerticalLenInElements - 1;
            }

            this.destination = { ...newCoord };
               
       return { ...this.destination };
      
    }

    eat(foodCoordinate: SnakeCoordinateModel, elongationNumber: number) {
        for(let i = 0; i < elongationNumber; i++) {
            this._segments.splice(0, 0, { x: foodCoordinate.x, y: foodCoordinate.y });
        }
    }

    setDirection(currentDirection: SnakeCoordinateModel) {
    
        if(this.direction.x != 0 && currentDirection.x != 0) return this.direction;
        if(this.direction.y != 0 && currentDirection.y != 0) return this.direction;

        this.direction.x = currentDirection.x;
        this.direction.y = currentDirection.y;
    
        return this.direction;
    }

    getDirection() {
        return {x: this.direction.x, y: this.direction.y};
    }

    get segments() {
        const segmentsCopy = JSON.parse(JSON.stringify(this._segments));
        return segmentsCopy;
    }

    getSnakeLength() {
        return this._segments.length;
    }

    getBodyPart(index: number) {
        return { ...this._segments[index] };
    }

    setCoordinateOfSnakeHead(x: number, y: number) {
        this._segments[this._segments.length - 1] = {x: x, y: y};
    }

    getCoordinateOfSnakeHead() {
        return {x: this._segments[this._segments.length - 1].x, y: this._segments[this._segments.length - 1].y};
    }

    addDirectionHistory(direction: SnakeCoordinateModel) {
        this._directionHistory.push(direction);
    }
    
    get directionHistory() {
        const directionHistory = JSON.parse(JSON.stringify(this._directionHistory));
        return directionHistory;
    }

    get liveSnakeColor() {
        return this._liveSnakeColor;
    }

    get deadSnakeColor() {
        return this._deadSnakeColor;
    }
}