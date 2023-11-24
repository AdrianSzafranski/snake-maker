import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GameComponent } from './game/game.component';
import { GameMenuComponent } from './game-menu/game-menu.component';
import { GuideComponent } from './guide/guide.component';
import { MapsComponent } from './game-menu/maps/maps.component';
import { MapComponent } from './game-menu/maps/map/map.component';
import { LoadingSpinnerComponent } from './shared/loading-spinner/loading-spinner.component';
import { HomeComponent } from './home/home.component';
import { HeaderComponent } from './header/header.component';
import { GlobalChatComponent } from './home/global-chat/global-chat.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { SignInComponent } from './auth/sign-in/sign-in.component';
import { SignUpComponent } from './auth/sign-up/sign-up.component';


@NgModule({
  declarations: [
    AppComponent,
    GameComponent,
    GameMenuComponent,
    MapsComponent,
    GuideComponent,
    MapComponent,
    LoadingSpinnerComponent,
    HomeComponent,
    HeaderComponent,
    GlobalChatComponent,
    UserProfileComponent,
    SignInComponent,
    SignUpComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
