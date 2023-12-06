import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { exhaustMap, map, mergeMap, take, throwError } from 'rxjs';

import { AuthService } from '../auth/auth.service';
import { UserDetails } from './user-details.model';
import { User } from '../auth/user.model';
import { UserData } from './user-data.model';
import { GameMap } from '../snake-game/game-maps/game-map.model';
import { environment } from 'src/environments/environment';

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
            const httpUrl = environment.firebaseDbUrl + `usersDetails/${userAuth.id}.json`;
            return this.http.get<UserDetails>(httpUrl);
            
        }),
        exhaustMap(UserDetails => {
           
          if(!userId) {
              return throwError(() => new Error("Error"));
          }

          const httpUrl = environment.firebaseDbUrl + `users/${userId}.json`;
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

  fetchUserMaps() {
    return this.authService.userAuth.pipe(
        take(1), 
        exhaustMap(userAuth => {
           
            if(!userAuth) {
                return throwError(() => new Error("Error"));
            }

            const httpUrl = environment.firebaseDbUrl + `usersMaps/${userAuth.id}.json`;
            return this.http.get<any>(httpUrl).pipe(
              map(gameMapObject => {
                if(!gameMapObject) {
                  return [];
                }
                return Object.keys(gameMapObject).map(key => (<GameMap>{ id: key, ...gameMapObject[key] }));
              }));
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
        environment.firebaseDbUrl + `usersDetails/${userId}.json`,
        userDetails
      )}),
      mergeMap((resData) => {

        if(!userId) {
          return throwError(() => new Error("Error"));
        }

        return this.http.put(
          environment.firebaseDbUrl + `users/${userId}.json`,
        user
      )})
    );

      
      
  }

  addUserMap(newMap: GameMap) {

    return this.authService.userAuth.pipe(
      take(1), 
      mergeMap((userAuth) => {
        if(!userAuth) {
          return throwError(() => new Error("Error"));
        }
        return this.http.post(
          environment.firebaseDbUrl + "usersMaps/" + userAuth.id + ".json",
          newMap
      )})
    );

  }

  publishUserMap(map: GameMap) {
    if(!map.id) {
      return throwError(() => new Error("Error"));
    }
    const mapId = map.id;
    map.id = undefined;

    return this.authService.userAuth.pipe(
      take(1), 
      mergeMap((userAuth) => {
        if(!userAuth) {
          return throwError(() => new Error("Error"));
        }
        map.authorId = userAuth.id;
        return this.http.delete(environment.firebaseDbUrl + "usersMaps/" + userAuth.id + "/" + mapId + ".json"
      )}),
      mergeMap((resData) => {
        return this.http.put(
          environment.firebaseDbUrl + "unofficialMaps/" + mapId + ".json",
          map
      )})
    );

  }

  deleteUserMap(map: GameMap) {
    if(!map.id) {
      return throwError(() => new Error("Error"));
    }

    return this.authService.userAuth.pipe(
      take(1), 
      mergeMap((userAuth) => {
        if(!userAuth) {
          return throwError(() => new Error("Error"));
        }
        return this.http.delete(environment.firebaseDbUrl + "usersMaps/" + userAuth.id + "/" + map.id + ".json"
      )})
    );

  }

  editUserMap(map: GameMap, mapId: string) {

    return this.authService.userAuth.pipe(
      take(1), 
      mergeMap((userAuth) => {
        if(!userAuth) {
          return throwError(() => new Error("Error"));
        }
        return this.http.put(
          environment.firebaseDbUrl + "usersMaps/" + userAuth.id + "/" + mapId + ".json",
          map
      )})
    );

  }

}

