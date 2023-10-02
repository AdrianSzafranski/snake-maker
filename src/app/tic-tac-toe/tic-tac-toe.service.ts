import { Injectable } from '@angular/core';
import { TicTacToeParameters } from './tic-tac-toe-parameters.model';
@Injectable({
  providedIn: 'root'
})
export class TicTacToeService {

  gameParameters!: TicTacToeParameters;
  
  constructor() {
    this.addGameParameters(3, 2);
  }

  addGameParameters(boardSize: number, numberPlayers: number) {

    // The range from which a player's symbol colour will be drawn. There are only two symbols, and there may be more players, so the colours should not repeat.
    let range = 256 / numberPlayers;

    this.gameParameters = {
      boardSize: boardSize,
      numberPlayers: numberPlayers,
      generateBoard: Array.from({ length: boardSize }, (_, index) => index),
      boardState: Array.from({ length: boardSize }, () => Array(boardSize).fill("")),
      rowsThatEnableWin: Array.from({ length: boardSize }, () => Array(numberPlayers).fill(true)),
      columnsThatEnableWin: Array.from({ length: boardSize }, () => Array(numberPlayers).fill(true)),
      diagonalsThatEnableWin: Array.from({ length: 2 }, () => Array(numberPlayers).fill(true)),
      players: Array.from({ length: numberPlayers }, (_, index) => 
      ["Player" + (index + 1),
       this.getRandomSymbol(index), 
       this.generateRandomColor(range, index)]),
    }
  }

  generateRandomColor(range: number, index: number) {
    let rColor = Math.floor(Math.random() * range) + range * index;
    let gColor = Math.floor(Math.random() * range) + range * index;
    let bColor = Math.floor(Math.random() * range) + range * index;

    return `rgb(${rColor}, ${gColor}, ${bColor})`;
  }

  getRandomSymbol(index: number) {
    if(index % 2 === 0) return "O";
    return "X";
  }
}
