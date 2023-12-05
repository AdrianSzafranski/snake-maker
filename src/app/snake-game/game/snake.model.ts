import { CoordinateModel } from "./coordinate.model";

export class SnakeModel {

    private _segments: CoordinateModel[] = [];
    private _directionHistory: string[] = [];
    private direction: string;
    private _liveSnakeColor = "rgb(131, 245, 108)";
    private _deadSnakeColor = "rgb(112, 112, 112)";
    destination: CoordinateModel = {x: 0, y:0};

    constructor(coords: CoordinateModel[], direction: string, color: string) {
        for(let coord of coords) {
            this._segments.push({x: coord.x, y: coord.y});
        }
       
        this.direction = direction;
        this._directionHistory.push(direction);
        this._directionHistory.push(direction);

        this._liveSnakeColor = color;
    }
  
    move(direction: string) {
       
        this._segments.shift();
        this._segments.push({ ...this.destination });
       
        this._directionHistory.push(direction);
        

        return { ...this.destination };
        
    }

    getDestination(boardHorizontalLenInElements: number, boardVerticalLenInElements: number) {
       
            let newCoord = {
                x: this._segments[this._segments.length - 1].x, 
                y: this._segments[this._segments.length - 1].y
            };

            switch(this.direction) {
                case 'up': 
                    newCoord.y = (newCoord.y - 1 >= 0)
                     ? newCoord.y - 1
                     : boardVerticalLenInElements - 1;
                    break;
                case 'right': 
                    newCoord.x = (newCoord.x + 1 < boardHorizontalLenInElements)
                     ? newCoord.x + 1
                     : 0;
                    break;
                case 'down':
                    newCoord.y = (newCoord.y + 1 < boardVerticalLenInElements)
                     ? newCoord.y + 1
                     : 0;
                    break;
                case 'left':
                    newCoord.x = (newCoord.x - 1 >= 0)
                     ? newCoord.x - 1
                     : boardHorizontalLenInElements - 1;
                    break;
            }
           
            this.destination = { ...newCoord };
               
       return { ...this.destination };
      
    }

    eat(foodCoordinate: CoordinateModel, elongationNumber: number) {
        for(let i = 0; i < elongationNumber; i++) {
            this._segments.splice(0, 0, { x: foodCoordinate.x, y: foodCoordinate.y });
        }
    }

    setDirection(currentDirection: string) {
    
        if(this.direction == 'up' && currentDirection == 'down') return this.direction;
        if(this.direction == 'down' && currentDirection == 'up') return this.direction;
        if(this.direction == 'left' && currentDirection == 'right') return this.direction;
        if(this.direction == 'right' && currentDirection == 'left') return this.direction;

        this.direction = currentDirection;
    
        return this.direction;
    }

    getDirection() {
        return this.direction;
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

    addDirectionHistory(direction: string) {
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