import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { exhaustMap, map, mergeMap, take, throwError } from 'rxjs';

import { AuthService } from '../auth/auth.service';
import { UserDetails } from './user-details.model';
import { User } from '../auth/user.model';
import { UserData } from './user-data.model';
import { GameMap, GameMapType } from '../snake-game/game-maps/game-map.model';
import { environment } from 'src/environments/environment';
import { UserProfile } from './user-profile';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService) { }


  fetchUserData() {
    const httpUrl = environment.apiUrl + 'user';

    return this.http.get<UserProfile>(httpUrl);
  }

  fetchUserMaps() {
    const httpUrl = environment.apiUrl + 'game-maps';

    let params = new HttpParams()
      .set('isPublic', false)
      .set('isOfficial', false);

    return this.http.get<any>(httpUrl, { params });
  }

  editUserData(userProfile: UserProfile) {

    const httpUrl = environment.apiUrl + 'user/edit';

    return this.http.put(
      httpUrl,
      userProfile
    )
  }

  addUserMap(newMap: GameMap) {
    const httpUrl = environment.apiUrl + 'game-maps/add';
    return this.http.post(
        httpUrl,
          newMap
      )}

  

  publishUserMap(map: GameMap) {
    
    const httpUrl = environment.apiUrl + `game-maps/public/${map.id}`;

        return this.http.put(httpUrl, 'f');

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
        return this.http.delete(environment.firebaseDbUrl + `${GameMapType.Local}GameMaps/` + userAuth.id + "/" + map.id + ".json"
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
          environment.firebaseDbUrl + `${GameMapType.Local}GameMaps/` + userAuth.id + "/" + mapId + ".json",
          map
      )})
    );

  }

}

