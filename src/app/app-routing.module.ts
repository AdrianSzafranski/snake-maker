import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GameMenuComponent } from './game-menu/game-menu.component';
import { GameComponent } from './game/game.component';
import { GuideComponent } from './guide/guide.component';
import { AuthComponent } from './auth/auth.component';

const routes: Routes = [ 
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: AuthComponent},
  { path: 'auth', component: AuthComponent},
  { path: 'guide', component: GuideComponent },
  { path: 'game', component: GameMenuComponent },
  { path: 'game/:mapId', component: GameComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
