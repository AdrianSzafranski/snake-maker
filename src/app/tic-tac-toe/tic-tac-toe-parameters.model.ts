export interface TicTacToeParameters { 
    boardSize: number;
    numberPlayers: number;
    generateBoard: number[];
    boardState: string[][];
    rowsThatEnableWin: boolean[][];
    columnsThatEnableWin: boolean[][];
    diagonalsThatEnableWin: boolean[][];
    players: string[][];
}