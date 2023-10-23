export interface snakeMapModel {
    id: number;
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
