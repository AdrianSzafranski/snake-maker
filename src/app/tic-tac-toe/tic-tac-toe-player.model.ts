import { TicTacToeColor } from "./tic-tac-toe-color.model";

export interface TicTacToePlayer { 
    id: number;
    name: string;
    symbol: string;
    color: TicTacToeColor;
}