import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, mergeMap, of, tap, throwError } from 'rxjs';

import { User } from './user.model';
import firebaseConfig from '../config';
import { UserDetails } from '../user-profile/userDetails.model';

export interface AuthResponseData {
  kind: string;
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user = new BehaviorSubject<User | null>(null);
  private tokenExpirationTimer: any;

  constructor(
    private http: HttpClient,
    private router: Router) {}




  signIn(email: string, password: string) {
    const httpUrl = firebaseConfig.signInUrl + firebaseConfig.apiKey;
   
    return this.http.post<AuthResponseData>(
      httpUrl,
      {
        email: email,
        password: password,
        returnSecureToken: true
      }
    ).pipe(
      catchError(this.handleError), 
      mergeMap((userAuthData) => {
        const userId = userAuthData.localId;
          return this.http.get<User>(
          `https://ng-snake-game-default-rtdb.europe-west1.firebasedatabase.app/users/${userId}.json`, {
            params: new HttpParams().set('auth', userAuthData.idToken)
          }).pipe(
          catchError(this.handleError),
          tap(userBasicData => {
            this.handleAuthentication(  userAuthData.email, 
              userAuthData.localId, 
              userBasicData.username,
              userBasicData.avatar,
              userAuthData.idToken, 
              +userAuthData.expiresIn);
          })
          );
         
      }),
    );
  }

  signUp(email: string, password: string, username: string, avatar: string, userDetails: UserDetails) {
    const httpUrl = firebaseConfig.signUpUrl + firebaseConfig.apiKey;
   
    let userId: string;

    return this.http.post<AuthResponseData>(
      httpUrl,
      {
        email: email,
        password: password,
        returnSecureToken: true
      }
    ).pipe(
      catchError(this.handleError), 
      tap(resData => {
        userId = resData.localId;
        this.handleAuthentication(
          resData.email, 
          resData.localId, 
          username,
          avatar,
          resData.idToken, 
          +resData.expiresIn);
      }),
      mergeMap((resData) => {
          return this.http.put(
          `https://ng-snake-game-default-rtdb.europe-west1.firebasedatabase.app/usersDetails/${userId}.json`,
          userDetails
        ).pipe(
          catchError(this.handleError),
          );
        
         
      }),
      mergeMap((resData) => {
          return this.http.put(
          `https://ng-snake-game-default-rtdb.europe-west1.firebasedatabase.app/users/${userId}.json`,
          {username: username, avatar: avatar}
        ).pipe(
          catchError(this.handleError),
          );
         
      }),
      
      
    )
  }
  
  autoLogin() {

    const userDataString = localStorage.getItem('userData');

    if(!userDataString) {
      return;
    }

    const user: {
      email: string;
      id: string;
      username: string;
      avatar: string;
      _token: string;
      _tokenExpirationDate: string;
    } = JSON.parse(userDataString);

    if(!user) {
      return;
    }

    const loadedUser = new User(
      user.email,
      user.id,
      user.username,
      user.avatar,
      user._token,
      new Date(user._tokenExpirationDate)
    );

    if (loadedUser.token) {
      this.user.next(loadedUser);
      const expirationDuration = 
       new Date(user._tokenExpirationDate).getTime() -
       new Date().getTime();
      this.autoLogout(expirationDuration);

    }
  }

  logout() {
    this.user.next(null);
    this.router.navigate(['/signin']);
    localStorage.removeItem('userData');
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    this.tokenExpirationTimer = null;
  }

  autoLogout(expirationDuration: number) {
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
    }, expirationDuration);
  }

  private handleAuthentication(
    email: string, 
    userId: string, 
    username: string,
    avatar: string,
    token: string, 
    expiresIn: number) {
    const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
    const user = new User(email, userId, username, avatar, token, expirationDate);
    this.user.next(user);
    this.autoLogout(expiresIn * 1000);

    localStorage.setItem('userData', JSON.stringify(user));
  }

  private handleError(errorRes: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if(!errorRes.error || !errorRes.error.error) {
      return throwError(() => new Error(errorMessage));
    }
    console.log(errorRes);
    switch (errorRes.error.error.message) {
      case 'EMAIL_EXISTS':
        errorMessage = 'This email exists already';
        break;
      case 'EMAIL_NOT_FOUND':
        errorMessage = 'This email does not exist';
        break;
      case 'INVALID_PASSWORD':
        errorMessage = 'This password is not correct';
        break;
      case 'INVALID_LOGIN_CREDENTIALS':
        errorMessage = 'This email or password is not correct.';
        break;
    }
    return throwError(() => new Error(errorMessage));
  }


}
