import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TicTacToeComponent } from './tic-tac-toe/tic-tac-toe.component';
import { TicTacToeSetupComponent } from './tic-tac-toe/tic-tac-toe-setup/tic-tac-toe-setup.component';
import { TicTacToeGameComponent } from './tic-tac-toe/tic-tac-toe-game/tic-tac-toe-game.component';
import { SnakeComponent } from './snake/snake.component';
import { SnakeMenuComponent } from './snake/snake-menu/snake-menu.component';
import { SnakeGameComponent } from './snake/snake-game/snake-game.component';
import { SnakeMapsComponent } from './snake/snake-menu/snake-maps/snake-maps.component';
import { SnakeRulesComponent } from './snake/snake-menu/snake-rules/snake-rules.component';
import { SnakeMenuNavComponent } from './snake/snake-menu/snake-menu-nav/snake-menu-nav.component';

const routes: Routes = [ 
{ path: 'tic-tac-toe', component: TicTacToeComponent, children: [
  { path: '', component: TicTacToeSetupComponent },
  { path: 'game', component: TicTacToeGameComponent }
]},
{ path: 'snake', component: SnakeComponent, children: [
  { path: '', redirectTo: 'menu', pathMatch: 'full' },
  { path: 'menu', component: SnakeMenuComponent, children: [
    { path: '', component: SnakeMenuNavComponent},
    { path: 'maps', component: SnakeMapsComponent},
    { path: 'rules', component: SnakeRulesComponent}
  ]},
  { path: 'game/:mapId', component: SnakeGameComponent}
]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
