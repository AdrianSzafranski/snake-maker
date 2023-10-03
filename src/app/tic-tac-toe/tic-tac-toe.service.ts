import { Injectable } from '@angular/core';
import { TicTacToeParameters } from './tic-tac-toe-parameters.model';
import { TicTacToePlayer } from './tic-tac-toe-player.model';
@Injectable({
  providedIn: 'root'
})
export class TicTacToeService {

  gameParameters!: TicTacToeParameters;

  colorList = [
    {name: 'pink', hexValue: "#FFC0CB"},
    {name: 'crimson', hexValue: "#DC143C"},
    {name: 'salmon', hexValue: "#FA8072"},
    {name: 'coral', hexValue: "#FF7F50"},
    {name: 'gold', hexValue: "#FFD700"},
    {name: 'moccasin', hexValue: "#FFE4B5"},
    {name: 'sienna', hexValue: "#A0522D"},
    {name: 'peru', hexValue: "#CD853F"},
    {name: 'tan', hexValue: "#D2B48C"},
    {name: 'teal', hexValue: "#008080"},
    {name: 'aqua', hexValue: "#00FFFF"},
    {name: 'navy', hexValue: "#000080"},
    {name: 'plum', hexValue: "#DDA0DD"},
    {name: 'magenta', hexValue: "#FF00FF"},
    {name: 'purple', hexValue: "#800080"},
    {name: 'green', hexValue: "#008000"},
    {name: 'olive', hexValue: "#808000"},
    {name: 'lime', hexValue: "#00FF00"},
    {name: 'azure', hexValue: "#F0FFFF"},
    {name: 'beige', hexValue: "#F5F5DC"},

  ];
  constructor() {
    this.addGameParameters(3, 2);
  }

  addGameParameters(boardSize: number, numberPlayers: number, players: TicTacToePlayer[] | undefined = undefined) {
    
    this.gameParameters = {
      boardSize: boardSize,
      numberPlayers: numberPlayers,
      generateBoard: Array.from({ length: boardSize }, (_, index) => index),
      boardState: this.createTwoDimensionalArray(boardSize, boardSize, ""),
      rowsThatEnableWin: this.createTwoDimensionalArray(boardSize, numberPlayers, true),
      columnsThatEnableWin: this.createTwoDimensionalArray(boardSize, numberPlayers, true),
      diagonalsThatEnableWin: this.createTwoDimensionalArray(2, numberPlayers, true),
      players: 
        players === undefined 
        ? Array.from({ length: numberPlayers }, (_, index) => {
            return {
              id: index,
              name: "Player " + (index + 1),
              symbol: this.chooseSymbol(index),
              color: this.getColor(index)
            }
          }) 
        : players,
    }
  }

 

  createTwoDimensionalArray(rowSize: number, columnSize: number, content: any) {
    return Array.from({ length: rowSize }, () => Array(columnSize).fill(content));
  }

  chooseSymbol(index: number) {
    if(index % 2 === 0) return "O";
    return "X";
  }

  getBoardSize() {
    return this.gameParameters.boardSize;
  }

  getNumberPlayers() {
    return this.gameParameters.numberPlayers;
  }

  getPlayers() {
    const playersCopy = JSON.parse(JSON.stringify(this.gameParameters.players));
    return playersCopy;
  }

  getColorList() {
    const colorListCopy = JSON.parse(JSON.stringify(this.colorList));
    return colorListCopy;
  }

  getColor(index: number) {
    const colorCopy = JSON.parse(JSON.stringify(this.colorList[index]));
    return colorCopy;
  }

  getGameParameters() {
    const gameParametersCopy = JSON.parse(JSON.stringify(this.gameParameters));
    return gameParametersCopy;
  }

}
