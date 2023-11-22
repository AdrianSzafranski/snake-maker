import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { GameComponent } from './game/game.component';
import { GameMenuComponent } from './game-menu/game-menu.component';
import { GuideComponent } from './guide/guide.component';
import { MapsComponent } from './game-menu/maps/maps.component';
import { MapComponent } from './game-menu/maps/map/map.component';
import { AuthComponent } from './auth/auth.component';
import { LoadingSpinnerComponent } from './shared/loading-spinner/loading-spinner.component';
import { HomeComponent } from './home/home.component';


@NgModule({
  declarations: [
    AppComponent,
    GameComponent,
    GameMenuComponent,
    MapsComponent,
    GuideComponent,
    MapComponent,
    AuthComponent,
    LoadingSpinnerComponent,
    HomeComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
