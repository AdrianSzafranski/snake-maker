import { SnakeCoordinateModel } from "./snake-coordinate.model";

export class SnakeFoodModel {


    constructor(private coordinate: SnakeCoordinateModel, private color: string, private value: number){ }

    setCoordinate(coordinate: SnakeCoordinateModel) {
        this.coordinate = {x: coordinate.x, y: coordinate.y};
    }

    getCoordinate() {
        return {x: this.coordinate.x, y: this.coordinate.y};
    }

    getColor() {
        return this.color;
    }
}