import { SnakeCoordinateModel } from "./snake-coordinate.model";

export class SnakeFoodModel {

    speedModifier: number;
    elongationNumber: number;
    value: number;
    sign: string;
    color: string;
    constructor(private coordinate: SnakeCoordinateModel, private type: string){ 
        switch(this.type) {
            case 'normal':
                this.speedModifier = 1;
                this.elongationNumber = 1;
                this.value = 1;
                this.sign = 'N';
                this.color = 'rgb(243, 245, 108)';
                break;
            case 'speed':
                this.speedModifier = 2;
                this.elongationNumber = 0;
                this.value = 1;
                this.sign = 'S';
                this.color = 'rgb(245, 108, 108)';
                break;
            case 'length':
                this.speedModifier = 0;
                this.elongationNumber = 2;
                this.value = 1;
                this.sign = 'L';
                this.color = 'rgb(245, 195, 108)';
                break;
            case 'fortune':
                this.speedModifier = 0;
                this.elongationNumber = 0;
                this.value = 5;
                this.sign = 'F';
                this.color = 'rgb(245, 108, 238)';
                break;
            case 'curse':
                this.speedModifier = 0;
                this.elongationNumber = 0;
                this.value = -5;
                this.sign = 'C';
                this.color = 'rgb(245, 108, 238)';
                break;
            case 'unknown':
                this.speedModifier = 0;
                this.elongationNumber = 0;
                this.value = Math.floor(Math.random() * (21)) - 10;
                this.sign = '?';
                this.color = 'rgb(245, 108, 238)';
                break;
            default: 
                this.speedModifier = 1;
                this.elongationNumber = 1;
                this.value = 1;
                this.sign = 'N';
                this.color = 'rgb(243, 245, 108)';
        }
    }

    setCoordinate(coordinate: SnakeCoordinateModel) {
        this.coordinate = {x: coordinate.x, y: coordinate.y};
    }

    getCoordinate() {
        return {x: this.coordinate.x, y: this.coordinate.y};
    }

    getColor() {
        return this.color;
    }

    getElongationNumber() {
        return this.elongationNumber;
    }

    getSpeedModifier() {
        return this.speedModifier;
    }

    getValue() {
        if(this.type === 'unknown') {
            return Math.floor(Math.random() * (21)) - 10;
        }

        return this.value;
    }

    getSign() {
        return this.sign;
    }

    getType() {
        return this.type;
    }
}