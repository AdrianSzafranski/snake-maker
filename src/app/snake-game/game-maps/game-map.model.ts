export interface GameMap {
    id?: string;
    authorId?: string;
    authorUsername?: string;
    name: string;
    boardWidthInElements: number;
    boardHeightInElements: number;
    boardFirstColor: string;
    boardSecondColor: string;
    obstacleColor: string;
    obstacles: string;
    snakeInitDirection: string;
    snakeInitCoords: string;
    snakeColor: string;
    initTimeToPassOneElementInSeconds: number;
}
