import { CoordinateModel } from "./coordinate.model";

export enum FoodType {
    Regular = 'regular',
    Speed = 'speed',
    Length = 'length',
    Fortune = 'fortune',
    Curse = 'curse',
    Unknown = 'unknown',
}

function drawFoodValue() {
    return Math.floor(Math.random() * (21)) - 10;
}

export class Food {

    readonly speedModifier!: number;
    readonly elongationNumber!: number;
    readonly value!: number;
    readonly sign!: string;
    readonly color!: string;

    private static readonly Configurations = {
        [FoodType.Regular]: { speedModifier: 1, elongationNumber: 1, value: 1, sign: 'R', color: 'rgb(243, 245, 108)' },
        [FoodType.Speed]: { speedModifier: 2, elongationNumber: 0, value: 1, sign: 'S', color: 'rgb(245, 108, 108)' },
        [FoodType.Length]: { speedModifier: 0, elongationNumber: 2, value: 1, sign: 'L', color: 'rgb(245, 195, 108)' },
        [FoodType.Fortune]: { speedModifier: 0, elongationNumber: 0, value: 5, sign: 'F', color: 'rgb(245, 108, 238)' },
        [FoodType.Curse]: { speedModifier: 0, elongationNumber: 0, value: -5, sign: 'C', color: 'rgb(245, 108, 238)' },
        [FoodType.Unknown]: { speedModifier: 0, elongationNumber: 0, value: drawFoodValue(), sign: '?', color: 'rgb(245, 108, 238)' },
    };

    constructor(private _coordinate: CoordinateModel, readonly type: FoodType) {
        const config = Food.Configurations[this.type] || Food.Configurations[FoodType.Regular];
        Object.assign(this, config);
    }

    get coordinate() {
        return { ...this._coordinate };
    }

    set coordinate(newCoordinate: CoordinateModel) {
        this._coordinate = { ...newCoordinate };
    }

}