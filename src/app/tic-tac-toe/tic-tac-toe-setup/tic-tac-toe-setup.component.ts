import { Component } from '@angular/core';
import { TicTacToeService } from '../tic-tac-toe.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-tic-tac-toe-setup',
  templateUrl: './tic-tac-toe-setup.component.html',
  styleUrls: ['./tic-tac-toe-setup.component.css']
})
export class TicTacToeSetupComponent {

  boardSize?: number;
  numberPlayers?: number;
  errorsOfForm = "";

  constructor(private ticTacToeService: TicTacToeService, private router: Router) {}

  onStartGame() {
    console.log(this.boardSize);
    if(!this.boardSize || !this.numberPlayers) {
      this.errorsOfForm = "Please enter all values!";
      return;
    }
    if(this.boardSize < 1 || this.boardSize > 20) {
      this.errorsOfForm = "Board size must be in the range 1 to 20!";
      return;
    }
    if(this.numberPlayers < 1 || this.numberPlayers > 20) {
      this.errorsOfForm = "Number players must be in the range 1 to 20!";
      return;
    }
    if(this.numberPlayers < 1 || this.numberPlayers > 20) {
      this.errorsOfForm = "Number players must be in the range 1 to 20!";
      return;
    }

    this.ticTacToeService.addGameParameters(this.boardSize, this.numberPlayers);
    this.router.navigate(['/tic-tac-toe/game']);
  }
}
