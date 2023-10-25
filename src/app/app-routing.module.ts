import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GameMenuComponent } from './game-menu/game-menu.component';
import { GameComponent } from './game/game.component';
import { GuideComponent } from './guide/guide.component';

const routes: Routes = [ 
  { path: '', component: GameMenuComponent },
  { path: 'guide', component: GuideComponent },
  { path: 'game/:mapId', component: GameComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
