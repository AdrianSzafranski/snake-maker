import { SnakeCoordinateModel } from "./snake-coordinate.model";

export class SnakeSnakeModel {

    private body: SnakeCoordinateModel[] = [];
    private historyOfDirections: SnakeCoordinateModel[] = [];
    private direction: SnakeCoordinateModel;
    private _liveSnakeColor = "rgb(131, 245, 108)";
    private _deadSnakeColor = "rgb(112, 112, 112)";
    destination: SnakeCoordinateModel = {x: 0, y:0};

    constructor(private coordinate: SnakeCoordinateModel, direction: SnakeCoordinateModel) {
        this.body = [{x: this.coordinate.x, y: this.coordinate.y}];
        this.direction = direction;
        this.historyOfDirections.push( { ...direction });
       
    }
  
    move(direction: SnakeCoordinateModel) {
       
        this.body.shift();
        this.body.push({ ...this.destination });
       
        this.historyOfDirections.push({ ...direction });

        return { ...this.destination };
        
    }

    getDestination(boardHorizontalLenInElements: number, boardVerticalLenInElements: number) {
       
            let newCoord = {
                x: this.body[this.body.length - 1].x, 
                y: this.body[this.body.length - 1].y
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
            this.body.splice(0, 0, { x: foodCoordinate.x, y: foodCoordinate.y });
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

    addDirectionToHistory(direction: SnakeCoordinateModel) {
        this.historyOfDirections.push(direction);
    }

    getHistoryOfDirections() {
        return this.historyOfDirections.slice();
    }

    get liveSnakeColor() {
        return this._liveSnakeColor;
    }

    get deadSnakeColor() {
        return this._deadSnakeColor;
    }
}