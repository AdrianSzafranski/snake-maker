import { CoordinateModel } from "./coordinate.model";

export class BoardModel {

    private _elementSizeInPixels;
    private _elements;
    
    constructor(
        private _widthInPixels: number,
        private _heightInPixels: number,
        private _widthInElements: number,
        private _heightInElements: number,
        private _firstBgColor: string,
        private _secondBgColor: string,
        private _snakeNarrowingFactor: number) {
            this._elementSizeInPixels = this._widthInPixels / this._widthInElements;
            this._elements = Array.from({ length: this._heightInElements }, () => Array(this._widthInElements).fill(''));
    }

    setItemInRandElement(
        item: string,
        occupiedCoords: CoordinateModel[] = [],
        maxWidth: number = 1,
        maxHeight: number = 1) {
    
        let itemCoord = this.findAvailableElement(occupiedCoords);
        this._elements[itemCoord.y][itemCoord.x] = item; 
        if(maxWidth === 1 && maxHeight === 1) {
            return [{ ...itemCoord }];
        }

        let itemCoords: CoordinateModel[] = [{ ...itemCoord }];

        for(let i = 1; i < maxWidth; i++) {

            let newItemCoords = this.getConnectedElementCoord(itemCoords[itemCoords.length-1], true);
            let isAvailable = this.isAvailableElement(newItemCoords, occupiedCoords);
            if(!isAvailable) break;
            this._elements[newItemCoords.y][newItemCoords.x] = item; 
            itemCoords.push(newItemCoords); 
        }

        for(let i = 1; i < maxHeight; i++) {

            let newItemCoords = this.getConnectedElementCoord(itemCoords[itemCoords.length-1], false);
            let isAvailable = this.isAvailableElement(newItemCoords, occupiedCoords);
            if(!isAvailable) break;
            this._elements[newItemCoords.y][newItemCoords.x] = item; 
            itemCoords.push(newItemCoords); 
        }
     
        return JSON.parse(JSON.stringify(itemCoords));
    }

    getConnectedElementCoord(elementCoord: CoordinateModel, isHorizontal: boolean) {

        let newElementCoord = {x: elementCoord.x, y: elementCoord.y};

        if (isHorizontal) {
            newElementCoord.x = (newElementCoord.x + 1) % this._widthInElements;
        } else {
            newElementCoord.y = (newElementCoord.y + 1) % this._heightInElements;
        }

        return { ...newElementCoord};
    }

    isAvailableElement(elementCoords: CoordinateModel, occupiedCoords: CoordinateModel[] = []) {
      
        let occupiedRows: number[] = []
        let occupiedColumns: number[] = [];

        for(let occupiedCoord of occupiedCoords) {
            occupiedRows.push(occupiedCoord.y);
            occupiedColumns.push(occupiedCoord.x);
        }

        let isFreeElement = this._elements[elementCoords.y][elementCoords.x] == '';
        let isOccupiedRow = occupiedRows.includes(elementCoords.y);
        let isOccupiedColumn = occupiedColumns.includes(elementCoords.x);

        if(isFreeElement && !isOccupiedColumn && !isOccupiedRow) {
            return true;
        }

        return false;
    
    }

    findAvailableElement(occupiedCoords: CoordinateModel[] = []) {
        let occupiedRows: number[] = []
        let occupiedColumns: number[] = [];

        for(let occupiedCoord of occupiedCoords) {
            occupiedRows.push(occupiedCoord.y);
            occupiedColumns.push(occupiedCoord.x);
        }

        let randCoord, isFreeElement, isOccupiedColumn, isOccupiedRow;

        do {
            randCoord = this.getRandElementCoord();
            isFreeElement = this._elements[randCoord.y][randCoord.x] == '';
            isOccupiedRow = occupiedRows.includes(randCoord.y);
            isOccupiedColumn = occupiedColumns.includes(randCoord.x);
        }
        while(!isFreeElement || isOccupiedRow || isOccupiedColumn);

        return { ...randCoord };
    }

    isSuitableElementForObstacle(testCoord: CoordinateModel, snakeCoord: CoordinateModel) {
       
        let isSnakeRow = snakeCoord.x == testCoord.x;
        let isSnakeColumn = snakeCoord.y == testCoord.y;
        let isEmptyElement = this._elements[testCoord.y][testCoord.x] === '';

        if(isSnakeRow || isSnakeColumn || !isEmptyElement) {
            return false;
        }
        return true;
    }

    getRandElementCoord() {
        let x = Math.floor(Math.random() * this._widthInElements);
        let y = Math.floor(Math.random() * this._heightInElements);

        return {x: x, y: y};
    }

    editSnakeCoordinate(lastPartOfSnakeBody: CoordinateModel, penultimatePartOfSnakeBody: CoordinateModel | null, newSnakeCoord: CoordinateModel) {
   
        this._elements[newSnakeCoord.y][newSnakeCoord.x] = 'snake';
        
        // The last two parts of the snake are the same when it has eaten the food.
        // Then the snake should grow so that it doesn't lose the last part.
        if(penultimatePartOfSnakeBody !==null && this.isEqualCoordinates(lastPartOfSnakeBody, penultimatePartOfSnakeBody)) {
            return;
        }

        this._elements[lastPartOfSnakeBody.y][lastPartOfSnakeBody.x] = '';
    }

    isEqualCoordinates(firstCoordinate: CoordinateModel, secondCoordinate: CoordinateModel) {
        if(firstCoordinate.x === secondCoordinate.x && firstCoordinate.y === secondCoordinate.y) {
            return true;
        }
        return false;
    }

    isGameOver(snakeDestination: CoordinateModel) {
        let destinationElement = this._elements[snakeDestination.y][snakeDestination.x];
        if(destinationElement === 'snake' || destinationElement === 'obstacle') {
            return true;
        }
        return false;
    }

    get elementSizeInPixels() {
        return this._elementSizeInPixels;
    }

    get elements() {
        return this._elements;
    }

    get firstBgColor() {
        return this._firstBgColor;
    }

    get secondBgColor() {
        return this._secondBgColor;
    }

    get widthInPixels() {
        return this._widthInPixels;
    }

    get heightInPixels() {
        return this._heightInPixels;
    }

    get widthInElements() {
        return this._widthInElements;
    }

    get heightInElements() {
        return this._heightInElements;
    }

    set elementSizeInPixels(elementSizeInPixels: number) {
        this._elementSizeInPixels = elementSizeInPixels;
    }

    set elements(elements: string[][]) {
        this._elements = elements;
    }

    set firstBgColor(firstBgColor: string) {
        this._firstBgColor = firstBgColor;
    }

    set secondBgColor(secondBgColor: string) {
        this._secondBgColor = secondBgColor;
    }

    set widthInPixels(widthInPixels: number) {
        this._widthInPixels = widthInPixels;
    }

    set heightInPixels(heightInPixels: number) {
        this._heightInPixels = heightInPixels;
    }

    set widthInElements(widthInElements: number) {
        this._widthInElements = widthInElements;
    }

    set heightInElements(heightInElements: number) {
        this._heightInElements = heightInElements;
    }

    getElement(x: number, y:number) {
        return this.elements[x][y];
    }

    setElement(x: number, y:number, value: string) {
        this.elements[y][x] = value;
    }

    getSnakeNarrowing() {
        return Math.floor(this._elementSizeInPixels * this._snakeNarrowingFactor);
    }

}

