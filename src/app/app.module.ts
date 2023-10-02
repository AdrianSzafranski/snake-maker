import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TicTacToeComponent } from './tic-tac-toe/tic-tac-toe.component';
import { TicTacToeSetupComponent } from './tic-tac-toe/tic-tac-toe-setup/tic-tac-toe-setup.component';
import { TicTacToeGameComponent } from './tic-tac-toe/tic-tac-toe-game/tic-tac-toe-game.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    TicTacToeComponent,
    TicTacToeSetupComponent,
    TicTacToeGameComponent
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
