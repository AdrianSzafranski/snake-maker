import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TicTacToeComponent } from './tic-tac-toe/tic-tac-toe.component';
import { TicTacToeSetupComponent } from './tic-tac-toe/tic-tac-toe-setup/tic-tac-toe-setup.component';
import { TicTacToeGameComponent } from './tic-tac-toe/tic-tac-toe-game/tic-tac-toe-game.component';

const routes: Routes = [ 
{ path: 'tic-tac-toe', component: TicTacToeComponent, children: [
  { path: '', component: TicTacToeSetupComponent },
  { path: 'game', component: TicTacToeGameComponent }
]},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
