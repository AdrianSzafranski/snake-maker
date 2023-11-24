import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GameMenuComponent } from './game-menu/game-menu.component';
import { GameComponent } from './game/game.component';
import { GuideComponent } from './guide/guide.component';
import { HomeComponent } from './home/home.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { SignInComponent } from './auth/sign-in/sign-in.component';
import { SignUpComponent } from './auth/sign-up/sign-up.component';

const routes: Routes = [ 
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent},
  { path: 'signin', component: SignInComponent },
  { path: 'signup', component: SignUpComponent },
  { path: 'guide', component: GuideComponent },
  { path: 'profile', component: UserProfileComponent },
  { 
    path: 'game', 
    component: GameMenuComponent, 
    children: [
      { path: 'game/:mapId', component: GameComponent },
    ] 
},

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
