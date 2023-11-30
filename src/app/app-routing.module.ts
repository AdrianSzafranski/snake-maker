import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GuideComponent } from './guide/guide.component';
import { HomeComponent } from './home/home.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { SignInComponent } from './auth/sign-in/sign-in.component';
import { SignUpComponent } from './auth/sign-up/sign-up.component';
import { PostComponent } from './home/posts/post/post.component';
import { PostsComponent } from './home/posts/posts.component';
import { AuthGuard } from './auth/auth-guard';
import { GameComponent } from './snake-game/game/game.component';
import { SnakeGameComponent } from './snake-game/snake-game.component';
import { GameMapsComponent } from './snake-game/game-menu/game-maps/game-maps.component';

const routes: Routes = [ 
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { 
    path: 'home', 
    component: HomeComponent, 
    children: [
      { path: '', component: PostsComponent },
      { path: 'post/:postId', component: PostComponent },
    ] 
  },
  { path: 'signin', component: SignInComponent },
  { path: 'signup', component: SignUpComponent },
  { 
    path: 'guide', 
    component: GuideComponent,
    canActivate: [AuthGuard],
  },
  { path: 'profile', component: UserProfileComponent },
  { 
    path: 'snake-game', 
    component: SnakeGameComponent, 
    //canActivate: [AuthGuard],
    children: [
      { path: '', component: GameMapsComponent },
      { path: 'game/:mapId', component: GameComponent },
    ] 
},

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
