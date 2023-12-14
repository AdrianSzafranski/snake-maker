export enum GameMapType {
    Official = 'official',
    Unofficial = 'unofficial',
    Local = 'local',
}

export interface GameMap {
    id?: string;
    authorId?: string;
    authorUsername?: string;
    name: string;
    widthInElements: number;
    heightInElements: number;
    backgroundFirstColor: string;
    backgroundSecondColor: string;
    obstacleColor: string;
    obstacles: string;
    snakeInitDirection: string;
    snakeInitCoords: string;
    snakeColor: string;
    secondsPerElement: number; //snake speed
}