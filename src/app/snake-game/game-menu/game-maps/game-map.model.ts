export interface GameMap {
    id?: number;
    name: string;
    boardWidthInElements: number;
    boardHeightInElements: number;
    boardFirstColor: string;
    boardSecondColor: string;
    obstacleColor: string;
    obstacles: string;
    snakeInitDirection: string;
    snakeInitCoords: string;
    initTimeToPassOneElementInSeconds: number;
}
