import { Component, OnInit } from '@angular/core';
import { TicTacToeService } from '../tic-tac-toe.service';
import { Router } from '@angular/router';
import { TicTacToePlayer } from '../tic-tac-toe-player.model';
import { TicTacToeColor } from '../tic-tac-toe-color.model';
@Component({
  selector: 'app-tic-tac-toe-setup',
  templateUrl: './tic-tac-toe-setup.component.html',
  styleUrls: ['./tic-tac-toe-setup.component.css']
})
export class TicTacToeSetupComponent implements OnInit {

  boardSize!: number;
  numberPlayers!: number;
  players!: TicTacToePlayer[];
  selectedPlayerId = 0;
  colorList: TicTacToeColor[] = [];

  errorsOfForm = "";

  constructor(private ticTacToeService: TicTacToeService, private router: Router) {}

  ngOnInit(): void {
    this.boardSize = this.ticTacToeService.getBoardSize();
    this.numberPlayers = this.ticTacToeService.getNumberPlayers();
    this.players = this.ticTacToeService.getPlayers();

    this.colorList = this.ticTacToeService.getColorList();
    for(let i = 0; i < this.numberPlayers; i++) this.colorList[i].owner = i;
  }
  

  changePlayersArray(numberPlayers: number) {
    this.errorsOfForm = '';
    if(numberPlayers < 1 || numberPlayers > 10) {
      this.errorsOfForm = 'Number players must be in the range 1 to 10!';
      this.numberPlayers = 10;
    }
    
    this.selectedPlayerId = 0;

    if(this.players.length > this.numberPlayers) {
      const numberOfElementsToRemove = this.players.length - this.numberPlayers;
      this.players = this.players.slice(0, this.players.length - numberOfElementsToRemove);
      this.colorList.forEach((color, index) => {
        if (color.owner && color.owner >= this.players.length) {
          color.owner = undefined;
        }

      });
      for(let i = this.colorList.length - 1; i >= this.colorList.length - numberOfElementsToRemove; i--) {
        this.colorList[i].owner = undefined;
       
      }
    
    } else {
      for(let i = 0; this.numberPlayers - this.players.length; i++) {
        this.players.push(
          this.createPlayer(this.players.length)
        );
      }
    }

  }

  createPlayer(id: number) {
    return {
      id: id,
      name: "Player " + (id + 1),
      symbol: this.ticTacToeService.chooseSymbol(id),
      color: this.getColorWithoutOwner(id),
    }
  }

  getColorWithoutOwner(id: number) {
    for(let color of this.colorList) {
      if (color.owner === undefined) {
        color.owner = id;
        return color;
      }
    }

    return { name: 'red', hexValue:'#FF0000' };
  }

  onSelectPreviousPlayer() {
    this.selectedPlayerId = (this.selectedPlayerId - 1) < 0 ? (this.numberPlayers - 1) : (this.selectedPlayerId - 1);
  }

  onSelectNextPlayer() {
    this.selectedPlayerId = (this.selectedPlayerId + 1) >= this.numberPlayers ? 0 : (this.selectedPlayerId + 1);
  }

  

  onStartGame() {
    if(!this.boardSize || !this.numberPlayers) {
      this.errorsOfForm = "Please enter all values!";
      return;
    }
    if(this.boardSize < 1 || this.boardSize > 20) {
      this.errorsOfForm = "Board size must be in the range 1 to 20!";
      return;
    }
    if(this.numberPlayers < 1 || this.numberPlayers > 10) {
      this.errorsOfForm = "Number players must be in the range 1 to 10!";
      return;
    }

    this.ticTacToeService.addGameParameters(this.boardSize, this.numberPlayers, this.players);
    this.router.navigate(['/tic-tac-toe/game']);
  }

  changeColorOwner(newColorName: String) {

    this.colorList.forEach((color, index) => {
      if (color.owner === this.selectedPlayerId) {
        color.owner = undefined;
      }
      if (color.name === newColorName) {
        color.owner = this.selectedPlayerId;
        this.players[this.selectedPlayerId].color = this.ticTacToeService.getColor(index);
      }
    });

  }
}
