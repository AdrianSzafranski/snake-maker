import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject, exhaustMap, map, mergeMap, of, take, tap, throwError } from 'rxjs';

import { AuthService } from '../auth/auth.service';
import firebaseConfig from '../config';
import { UserDetails } from './user-details.model';
import { User } from '../auth/user.model';
import { UserData } from './user-data.model';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService) { }


  fetchUserData() {
    let userId: string | null = null;
    let userEmail: string;
    return this.authService.userAuth.pipe(
        take(1), 
        exhaustMap(userAuth => {
           
            if(!userAuth) {
                return throwError(() => new Error("Error"));
            }
            userId = userAuth.id;
            userEmail = userAuth.email;
            const httpUrl = firebaseConfig.dbUrl + `usersDetails/${userAuth.id}.json`;
            return this.http.get<UserDetails>(httpUrl);
            
        }),
        exhaustMap(UserDetails => {
           
          if(!userId) {
              return throwError(() => new Error("Error"));
          }

          const httpUrl = firebaseConfig.dbUrl + `users/${userId}.json`;
          return this.http.get<User>(httpUrl).pipe(map(
            (user) => {
              return <UserData>{
                ...UserDetails, 
                username: user.username, 
                avatar: user.avatar,
                email: userEmail
              }; 
            }
          ));
          
      }),
    );
  }

  editUserData(user: User, userDetails: UserDetails) {
    let userId: string | null = null;

    return this.authService.userAuth.pipe(
      take(1), 
      mergeMap((userAuth) => {
      

        if(!userAuth) {
          return throwError(() => new Error("Error"));
        }

        userId = userAuth.id;

        return this.http.put(
        `https://ng-snake-game-default-rtdb.europe-west1.firebasedatabase.app/usersDetails/${userId}.json`,
        userDetails
      )}),
      mergeMap((resData) => {

        if(!userId) {
          return throwError(() => new Error("Error"));
        }

        return this.http.put(
        `https://ng-snake-game-default-rtdb.europe-west1.firebasedatabase.app/users/${userId}.json`,
        user
      )})
    );

      
      
  }
}

