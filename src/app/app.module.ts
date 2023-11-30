import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GuideComponent } from './guide/guide.component';
import { LoadingSpinnerComponent } from './shared/loading-spinner/loading-spinner.component';
import { HomeComponent } from './home/home.component';
import { HeaderComponent } from './header/header.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { SignInComponent } from './auth/sign-in/sign-in.component';
import { SignUpComponent } from './auth/sign-up/sign-up.component';
import { PostsComponent } from './home/posts/posts.component';
import { PostFormComponent } from './home/posts/post-form/post-form.component';
import { PostPreviewComponent } from './home/posts/post-preview/post-preview.component';
import { PostComponent } from './home/posts/post/post.component';
import { PostCommentComponent } from './home/posts/post/post-comment/post-comment.component';
import { AuthInterceptorService } from './auth/auth-interceptor.service';
import { SnakeGameComponent } from './snake-game/snake-game.component';
import { GameComponent } from './snake-game/game/game.component';
import { GameMapsComponent } from './snake-game/game-menu/game-maps/game-maps.component';
import { GameMapComponent } from './snake-game/game-menu/game-maps/game-map/game-map.component';
import { UserAvatarComponent } from './shared/user-avatar/user-avatar.component';
import { UserDataEditComponent } from './user-profile/user-data-edit/user-data-edit.component';
import { UserDataComponent } from './user-profile/user-data/user-data.component';


@NgModule({
  declarations: [
    AppComponent,
    GameComponent,
    GameMapsComponent,
    GameMapComponent,
    GuideComponent,
    LoadingSpinnerComponent,
    HomeComponent,
    HeaderComponent,
    UserProfileComponent,
    SignInComponent,
    SignUpComponent,
    PostsComponent,
    PostFormComponent,
    PostPreviewComponent,
    PostComponent,
    PostCommentComponent,
    SnakeGameComponent,
    UserDataEditComponent,
    UserDataComponent,
    UserAvatarComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS, 
      useClass: AuthInterceptorService, 
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
