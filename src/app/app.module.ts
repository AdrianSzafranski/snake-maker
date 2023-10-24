import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TicTacToeComponent } from './tic-tac-toe/tic-tac-toe.component';
import { TicTacToeSetupComponent } from './tic-tac-toe/tic-tac-toe-setup/tic-tac-toe-setup.component';
import { TicTacToeGameComponent } from './tic-tac-toe/tic-tac-toe-game/tic-tac-toe-game.component';
import { FormsModule } from '@angular/forms';
import { SnakeComponent } from './snake/snake.component';
import { SnakeGameComponent } from './snake/snake-game/snake-game.component';
import { SnakeMenuComponent } from './snake/snake-menu/snake-menu.component';
import { SnakeMapsComponent } from './snake/snake-menu/snake-maps/snake-maps.component';
import { SnakeRulesComponent } from './snake/snake-menu/snake-rules/snake-rules.component';
import { SnakeMapComponent } from './snake/snake-menu/snake-maps/snake-map/snake-map.component';
import { SnakeMenuNavComponent } from './snake/snake-menu/snake-menu-nav/snake-menu-nav.component';

@NgModule({
  declarations: [
    AppComponent,
    TicTacToeComponent,
    TicTacToeSetupComponent,
    TicTacToeGameComponent,
    SnakeComponent,
    SnakeGameComponent,
    SnakeMenuComponent,
    SnakeMapsComponent,
    SnakeRulesComponent,
    SnakeMapComponent,
    SnakeMenuNavComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
