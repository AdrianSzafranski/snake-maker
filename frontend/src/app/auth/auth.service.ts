import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, mergeMap, of, tap, throwError } from 'rxjs';

import { UserDetails } from '../user-profile/user-details.model';
import { UserAuth } from './userAuth.model';
import { User } from './user.model';
import { environment } from 'src/environments/environment';
import { AUTH_ERROR_MESSAGES } from './auth-error-messages';
import { SignUpUser } from './sign-up-user.model';

export interface AuthResponseData {
  message: string;
  userId: number;
  email: string;
  accountRoles: string[];
  accessToken: string;
  expiresIn: number;
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
    const httpUrl = environment.apiUrl + "auth/signin";
    
    return this.http.post<AuthResponseData>(
      httpUrl,
      {
        email: email,
        password: password,
      }
    ).pipe(
      catchError(this.handleError), 
      tap(authResponseData => {
        this.handleAuthentication(authResponseData);
      })
    );
  }

  signUp(signUpUser: SignUpUser) {
  
    return this.http.post<AuthResponseData>(
      environment.apiUrl + "auth/signup",
      
        signUpUser
      
    ).pipe(
      catchError(this.handleError), 
      tap(authResponseData => {
        this.handleAuthentication(authResponseData);
      }) 
    )
  }
    
  autoLogin() {

    const userDataString = localStorage.getItem('userData');

    if(!userDataString) {
      return;
    }

    const userAuth: {
      email: string;
      id: number;
      accountRoles: string[];
      _token: string;
      _tokenExpirationDate: string;
    } = JSON.parse(userDataString);
    
    if(!userAuth) {
      return;
    }

    const loadedUser = new UserAuth(
      userAuth.email,
      userAuth.id,
      userAuth.accountRoles,
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

  private handleAuthentication(authResponseData: AuthResponseData) {

    const expirationDate = new Date(new Date().getTime() + authResponseData.expiresIn * 1000);

    const userAuth = new UserAuth(authResponseData.email, authResponseData.userId, authResponseData.accountRoles, authResponseData.accessToken, expirationDate);
    this.userAuth.next(userAuth);

    this.autoLogout(authResponseData.expiresIn * 1000);

    localStorage.setItem('userData', JSON.stringify(userAuth));
  }


  private handleError(errorRes: any) {
    const mapErrorMessages = (errors: any): any => {
      const mappedErrors: { [key: string]: string } = {};
  
      for (const key in errors) {
        if (errors.hasOwnProperty(key)) {
          const errorValue = errors[key];
          // Sprawdź, czy istnieje zdefiniowany komunikat dla wartości błędu
          if (AUTH_ERROR_MESSAGES[errorValue]) {
            mappedErrors[key] = AUTH_ERROR_MESSAGES[errorValue];
          } else {
            mappedErrors[key] = `Unknown error: ${errorValue}`;
            
          }
        }
      }
  
      return mappedErrors;
    };
  
    let errorMessage = JSON.stringify(AUTH_ERROR_MESSAGES['error']);
    let mappedErrorMessages = {};
  
    if (errorRes.error && typeof errorRes.error.message === 'object') {
      mappedErrorMessages = mapErrorMessages(errorRes.error.message);
      errorMessage = JSON.stringify(mappedErrorMessages);
    }
  
    return throwError(() => new Error(errorMessage));
  }
}
