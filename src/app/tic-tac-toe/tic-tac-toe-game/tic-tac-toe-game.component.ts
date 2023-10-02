import { Component, OnInit, HostListener, Renderer2 } from '@angular/core';
import { TicTacToeService } from '../tic-tac-toe.service';
import { TicTacToeParameters } from '../tic-tac-toe-parameters.model';
@Component({
  selector: 'app-tic-tac-toe-game',
  templateUrl: './tic-tac-toe-game.component.html',
  styleUrls: ['./tic-tac-toe-game.component.css']
})
export class TicTacToeGameComponent implements OnInit{
  
  screenWidth: string = '400px';
  screenHeight: string = '400px';
  gameParameters!: TicTacToeParameters;

  playerTurn = 0;
  gameResult = '';
  winningElement = {
    type: '',
    index: 0,
  };

  constructor(private ticTacToeService: TicTacToeService, private renderer: Renderer2) {
    this.getScreenSize();
  }

  ngOnInit(): void {
    this.gameParameters = this.ticTacToeService.gameParameters;
  }

  @HostListener('window:resize', ['$event'])
  getScreenSize(event?: Event): void {
    if(window.innerHeight >= window.innerWidth) {
      this.screenWidth = '90vw';
      this.screenHeight = '90vw';
    } else {
      this.screenWidth = '90vh';
      this.screenHeight = '90vh';
    }

  }

  getSizeCenterPanel() {
    return {
      'width': `${this.screenWidth}`,
      'height': `${this.screenHeight}`
    }
  }
 
  onSelectCurrentField(rowNumber: number, columnNumber: number, boardFieldElement: HTMLDivElement): void {

    let isFieldUsed = this.gameParameters.boardState[rowNumber][columnNumber] !== "";
    if(isFieldUsed) return;

    this.gameParameters.boardState[rowNumber][columnNumber] = this.gameParameters.players[this.playerTurn][1];

    let isDrawCircle = this.gameParameters.players[this.playerTurn][1] === 'O';
    if(isDrawCircle) {

      const circleDiv = this.renderer.createElement('div');
      this.renderer.addClass(circleDiv, 'circle');
      this.renderer.setStyle(circleDiv, 'border', `2px solid ${this.gameParameters.players[this.playerTurn][2]}`);
      this.renderer.appendChild(boardFieldElement, circleDiv);
    } else {
      const crossDiv = this.renderer.createElement('div');
      const lineDiv = this.renderer.createElement('div');
      this.renderer.addClass(crossDiv, 'cross');
      this.renderer.addClass(lineDiv, 'line');
      this.renderer.setStyle(lineDiv, 'background-color', this.gameParameters.players[this.playerTurn][2]);
      this.renderer.appendChild(crossDiv, lineDiv);

      const secondLineDiv = lineDiv.cloneNode(true);
      this.renderer.appendChild(crossDiv, secondLineDiv);
      this.renderer.appendChild(boardFieldElement, crossDiv);
    }

    this.updateWaysToWin(rowNumber, columnNumber);

    this.isWinner(rowNumber, columnNumber);
    this.isDraw();

    this.playerTurn = this.playerTurn + 1 <  this.gameParameters.players.length ? this.playerTurn + 1 : 0; 
  }

  updateWaysToWin(rowNumber: number, columnNumber: number) {
    for(let i = 0; i < this.gameParameters.players.length; i++) {
      if(i === this.playerTurn) continue;
      this.gameParameters.rowsThatEnableWin[rowNumber][i] = false;
      this.gameParameters.columnsThatEnableWin[columnNumber][i] = false;

      if(rowNumber === columnNumber) {
        this.gameParameters.diagonalsThatEnableWin[0][i] = false;
      }
      if(rowNumber + columnNumber ===  this.gameParameters.boardSize - 1) {
        this.gameParameters.diagonalsThatEnableWin[1][i] = false;
      }

    }
  }

  isWinner(rowNumber: number, columnNumber: number) {
    let isChanceOfWinningInThisRow = this.gameParameters.rowsThatEnableWin[rowNumber][this.playerTurn];
    let isChanceOfWinningInThisColumn = this.gameParameters.columnsThatEnableWin[columnNumber][this.playerTurn];
    let isChanceOfWinningInFirstDiagonal = this.gameParameters.diagonalsThatEnableWin[0][this.playerTurn] && rowNumber === columnNumber;
    let isChanceOfWinningInSecondDiagonal = this.gameParameters.diagonalsThatEnableWin[1][this.playerTurn] && (rowNumber + columnNumber) === (this.gameParameters.boardSize - 1);

 

    if(isChanceOfWinningInThisRow) {
      const rowToCheck = this.gameParameters.boardState[rowNumber];
      // check if all elements equal in this row
      const isWinInThisRow = rowToCheck.every((value, index, array) => value === array[0]);

      if(isWinInThisRow) {
        this.setWinnerAndWinnerFields('row', rowNumber);
        return;
      }
    }

    if(isChanceOfWinningInThisColumn) {
      const columntoCheck = this.gameParameters.boardState.map(row => row[columnNumber]);
      // check if all elements equal in this column
      const isWinInThisColumn = columntoCheck.every((value, index, array) => value === array[0]);

      if(isWinInThisColumn) {
        this.setWinnerAndWinnerFields('column', columnNumber);
        return;
      }
    }

    if(isChanceOfWinningInFirstDiagonal) {
      const firstDiagonal = this.gameParameters.boardState.map((row, i) => row[i]);
      // check if all elements equal in first diagonal
      const isWinInFirstDiagonal = firstDiagonal.every((value, index, array) => value === array[0]);

      if(isWinInFirstDiagonal) {
        this.setWinnerAndWinnerFields('firstDiagonal', -1);
        return;
      }
    }

    if(isChanceOfWinningInSecondDiagonal) {
      const secondDiagonal = this.gameParameters.boardState.map((row, i) => row[this.gameParameters.boardState.length - 1 - i])
      // check if all elements equal in second diagonal
      const isWinInSecondDiagonal = secondDiagonal.every((value, index, array) => value === array[0]);

      if(isWinInSecondDiagonal) {
        this.setWinnerAndWinnerFields('secondDiagonal', -1);
        return;
      }
    }

  }

  setWinnerAndWinnerFields(typeOfBoardElement: string, elementIndex: number) {
    this.winningElement = {type: typeOfBoardElement, index: elementIndex};
    this.gameResult = this.gameParameters.players[this.playerTurn][0] + "  won!";
  }

  isWinningField(rowNumber: number, columnNumber: number) {

    switch(this.winningElement.type) {
      case 'row': 
        if(rowNumber == this.winningElement.index) return true; break;
      case 'column': 
        if(columnNumber == this.winningElement.index) return true; break;
      case 'firstDiagonal': 
        if(columnNumber == rowNumber) return true; break;
      case 'secondDiagonal': 
        if(columnNumber + rowNumber === this.gameParameters.boardSize - 1) return true; break;
     
    }
    return false;
  }

  isDraw() {
    let isChanceOfWinningInSomeRows = !this.gameParameters.rowsThatEnableWin.every(row => row.every(element => element === false));
    let isChanceOfWinningInSomeColumns = !this.gameParameters.columnsThatEnableWin.every(row => row.every(element => element === false));
    let isChanceOfWinningInSomeDiagonals = !this.gameParameters.diagonalsThatEnableWin.every(row => row.every(element => element === false));

    if(!isChanceOfWinningInSomeRows && !isChanceOfWinningInSomeColumns && !isChanceOfWinningInSomeDiagonals) {
      this.gameResult = "Draw!";
    }
 
  }

}
