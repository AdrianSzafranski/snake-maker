import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, mergeMap, of, tap, throwError } from 'rxjs';

import { UserDetails } from '../user-profile/user-details.model';
import { UserAuth } from './userAuth.model';
import { User } from './user.model';
import { environment } from 'src/environments/environment';

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
  userAuth = new BehaviorSubject<UserAuth | null>(null);
  private tokenExpirationTimer: any;

  constructor(
    private http: HttpClient,
    private router: Router) {}

  signIn(email: string, password: string) {
    const httpUrl = environment.firebaseSignInUrl + environment.firebaseApiKey;
   
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
            environment.firebaseDbUrl + `users/${userId}.json`, {
            params: new HttpParams().set('auth', userAuthData.idToken)
          }).pipe(
          catchError(this.handleError),
          tap(userBasicData => {
            this.handleAuthentication(  userAuthData.email, 
              userAuthData.localId, 
              userAuthData.idToken, 
              +userAuthData.expiresIn);
          })
          );
         
      }),
    );
  }

  signUp(email: string, password: string, user: User, userDetails: UserDetails) {

    const httpSignUpUrl = environment.firebaseSignUpUrl + environment.firebaseApiKey;
    let userId: string;

    return this.http.post<AuthResponseData>(
      httpSignUpUrl,
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
          resData.idToken, 
          +resData.expiresIn);
      }),
      mergeMap((resData) => {
          return this.http.put(
            environment.firebaseDbUrl + `usersDetails/${userId}.json`,
          userDetails
        ).pipe(
          catchError(this.handleError),
          );
      }),
      mergeMap((resData) => {
          return this.http.put(
            environment.firebaseDbUrl + `users/${userId}.json`,
          user
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

    const userAuth: {
      email: string;
      id: string;
      _token: string;
      _tokenExpirationDate: string;
    } = JSON.parse(userDataString);

    if(!userAuth) {
      return;
    }

    const loadedUser = new UserAuth(
      userAuth.email,
      userAuth.id,
      userAuth._token,
      new Date(userAuth._tokenExpirationDate)
    );


    if (loadedUser.token) {
      this.userAuth.next(loadedUser);
      const expirationDuration = 
       new Date(userAuth._tokenExpirationDate).getTime() -
       new Date().getTime();
      this.autoLogout(expirationDuration);

    }
  }

  logout() {
    this.userAuth.next(null);
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
    token: string, 
    expiresIn: number) {
    const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
    const userAuth = new UserAuth(email, userId, token, expirationDate);
    this.userAuth.next(userAuth);
    this.autoLogout(expiresIn * 1000);

    localStorage.setItem('userData', JSON.stringify(userAuth));
  }

  private handleError(errorRes: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if(!errorRes.error || !errorRes.error.error) {
      return throwError(() => new Error(errorMessage));
    }

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
      case 'INVALID_EMAIL':
        errorMessage = 'This email is badly formatted.';
        break;
    }
    return throwError(() => new Error(errorMessage));
  }


}
