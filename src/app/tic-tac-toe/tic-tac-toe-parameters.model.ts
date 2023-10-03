import { TicTacToePlayer } from "./tic-tac-toe-player.model";

export interface TicTacToeParameters { 
    boardSize: number;
    numberPlayers: number;
    generateBoard: number[];
    boardState: string[][];
    rowsThatEnableWin: boolean[][];
    columnsThatEnableWin: boolean[][];
    diagonalsThatEnableWin: boolean[][];
    players: TicTacToePlayer[];
}