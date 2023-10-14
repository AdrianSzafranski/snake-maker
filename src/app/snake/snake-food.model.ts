import { SnakeCoordinateModel } from "./snake-coordinate.model";

export class SnakeFoodModel {

    _speedModifier: number;
    _elongationNumber: number;
    _value: number;
    _sign: string;
    _color: string;
    
    constructor(private _coordinate: SnakeCoordinateModel, private _type: string){ 
        switch(this.type) {
            case 'normal':
                this._speedModifier = 1;
                this._elongationNumber = 1;
                this._value = 1;
                this._sign = 'N';
                this._color = 'rgb(243, 245, 108)';
                break;
            case 'speed':
                this._speedModifier = 2;
                this._elongationNumber = 0;
                this._value = 1;
                this._sign = 'S';
                this._color = 'rgb(245, 108, 108)';
                break;
            case 'length':
                this._speedModifier = 0;
                this._elongationNumber = 2;
                this._value = 1;
                this._sign = 'L';
                this._color = 'rgb(245, 195, 108)';
                break;
            case 'fortune':
                this._speedModifier = 0;
                this._elongationNumber = 0;
                this._value = 5;
                this._sign = 'F';
                this._color = 'rgb(245, 108, 238)';
                break;
            case 'curse':
                this._speedModifier = 0;
                this._elongationNumber = 0;
                this._value = -5;
                this._sign = 'C';
                this._color = 'rgb(245, 108, 238)';
                break;
            case 'unknown':
                this._speedModifier = 0;
                this._elongationNumber = 0;
                this._value = Math.floor(Math.random() * (21)) - 10;
                this._sign = '?';
                this._color = 'rgb(245, 108, 238)';
                break;
            default: 
                this._speedModifier = 1;
                this._elongationNumber = 1;
                this._value = 1;
                this._sign = 'N';
                this._color = 'rgb(243, 245, 108)';
        }
    }

    get speedModifier() {
        return this._speedModifier;
    }

    get elongationNumber() {
        return this._elongationNumber;
    }

    get value() {
        if(this.type === 'unknown') {
            return Math.floor(Math.random() * (21)) - 10;
        }
        return this._value;
    }

    get sign() {
        return this._sign;
    }

    get color() {
        return this._color;
    }

    get coordinate() {
        return { ...this._coordinate };
    }

    get type() {
        return this._type;
    }

    set speedModifier(speedModifier: number) {
        this._speedModifier = speedModifier;
    }

    set elongationNumber(elongationNumber: number) {
        this._elongationNumber = elongationNumber;
    }

    set value(value: number) {
        this._value = value;
    }

    set sign(sign: string) {
        this._sign = sign;
    }

    set color(color: string) {
        this._color = color;
    }

    set coordinate(coordinate: SnakeCoordinateModel) {
        this._coordinate = {x: coordinate.x, y: coordinate.y};
    }

    set type(type: string) {
        this._type = type;
    }

}