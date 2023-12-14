import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { exhaustMap, map, mergeMap, take, tap, throwError } from 'rxjs';

import { GameMap, GameMapType } from './game-map.model';
import { AuthService } from 'src/app/auth/auth.service';
import { UserScore } from '../user-score.model';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class GameMapService {

  constructor(private http: HttpClient, private authService: AuthService) {}

  fetchOfficialGameMaps() {
    const httpUrl = environment.firebaseDbUrl + GameMapType.Official + "GameMaps.json";
    return this.http.get<any>(httpUrl).pipe(
      map(gameMapsObject => {
        return Object.keys(gameMapsObject).map(key => ({ id: key, ...gameMapsObject[key] }));
      })
    );
  }

  fetchUnofficialGameMaps() {
    const httpUrlGameMaps = environment.firebaseDbUrl + GameMapType.Unofficial + "GameMaps.json";
    const httpUrlUsers = environment.firebaseDbUrl + `users/.json`;

    let gameMaps: GameMap[]; 

    return this.http.get<any>(httpUrlGameMaps).pipe(
      map(gameMapsObject => {
        if(!gameMapsObject) {
          return [];
        }
        return Object.keys(gameMapsObject).map(key => ({ id: key, ...gameMapsObject[key] }));
      }),
      tap((localGameMaps: GameMap[]) => {
        gameMaps = localGameMaps;
      }),
      mergeMap((localGameMaps) => {
        return this.http.get<any>(httpUrlUsers);
      }),
      map(users => {
        return gameMaps.map(key => {
          key.authorUsername = users[''+key.authorId].username;
          return key;
        })
      }),
    );
  }

  fetchGameMap(gameMapType: GameMapType, gameMapId: string) {
    let httpUrl = environment.firebaseDbUrl + `${gameMapType}GameMaps/${gameMapId}.json`;
    let userId: string | null = null;

    return this.authService.userAuth.pipe(
      take(1), 
      exhaustMap(userAuth => {
         
          if(!userAuth) {
              return throwError(() => new Error("Error"));
          }
          userId = userAuth.id;
          if(gameMapType === GameMapType.Local) {
            httpUrl = environment.firebaseDbUrl + `${GameMapType.Local}GameMaps/${userAuth.id}/${gameMapId}.json`;
          }
          return this.http.get<any>(httpUrl).pipe(
            map(gameMapObject => {
              return <GameMap>{
                id: gameMapId,
                ...gameMapObject
              };
            })
          );
          
      }),
      exhaustMap(gameMap => {
        if(!userId || !gameMap.id) {
            return throwError(() => new Error("Error"));
        }
        let httpUrl = environment.firebaseDbUrl + `usersScores/${userId}/${gameMap.id}.json`;
        return this.http.get<any>(httpUrl).pipe(
          map(userScore => {
            if(!userScore) {
              userScore = {
                bestScore: 0,
                gamesNumber: 0,
              }
            }
            return {
              gameMap: gameMap,
              userScore: { idMap: gameMapId, ...userScore }
          }})
        );
        
    }));
  }

  addGameMap() {
    const gameMaps = [
      {
        name: 'Open',
        widthInElements: 25,
        heightInElements: 15,
        backgroundFirstColor: "#182719",
        backgroundSecondColor: "#324a33",
        obstacleColor: "#000000",
        obstacles: `[]`,
        snakeInitDirection: 'down',
        snakeInitCoords: `[{"x": 5, "y": 5}, {"x": 5, "y": 6}]`,
        snakeColor: "#83f56c",
        secondsPerElement: 0.3
      },
      {
        name: 'Close',
        widthInElements: 25,
        heightInElements: 15,
        backgroundFirstColor: "#464261",
        backgroundSecondColor: "#181b27",
        obstacleColor: "#000000",
        obstacles: `[
          {"x": 0, "y": 0, "width": 24, "height": 15},
          {"x": 0, "y": 14, "width": 24, "height": 0},
          {"x": 24, "y": 0, "width": 0, "height": 15}
        ]`,
        snakeInitDirection: 'right',
        snakeInitCoords:  `[{"x": 5, "y": 5}, {"x": 6, "y": 5}]`,
        snakeColor: "#83f56c",
        secondsPerElement: 0.5
      },
      {
        name: 'Mines', 
        widthInElements: 25,
        heightInElements: 15,
        backgroundFirstColor: "#614242",
        backgroundSecondColor: "#27181d",
        obstacleColor: "#000000",
        obstacles: `[
          {"x": 0, "y": 0, "width": 1, "height": 0},
          {"x": 13, "y": 0, "width": 1, "height": 0},
          {"x": 24, "y": 1, "width": 1, "height": 0},
          {"x": 4, "y": 2, "width": 1, "height": 0},
          {"x": 8, "y": 2, "width": 1, "height": 0},
          {"x": 13, "y": 2, "width": 1, "height": 0},
          {"x": 3, "y": 4, "width": 1, "height": 0},
          {"x": 25, "y": 4, "width": 1, "height": 0},
          {"x": 8, "y": 5, "width": 1, "height": 0},
          {"x": 7, "y": 6, "width": 1, "height": 0},
          {"x": 20, "y": 6, "width": 1, "height": 0},
          {"x": 1, "y": 8, "width": 1, "height": 0},
          {"x": 5, "y": 8, "width": 1, "height": 0},
          {"x": 11, "y": 8, "width": 1, "height": 0},
          {"x": 21, "y": 8, "width": 1, "height": 0},
          {"x": 3, "y": 9, "width": 1, "height": 0},
          {"x": 2, "y": 12, "width": 1, "height": 0},
          {"x": 4, "y": 12, "width": 1, "height": 0},
          {"x": 13, "y": 12, "width": 1, "height": 0},
          {"x": 17, "y": 12, "width": 1, "height": 0},
          {"x": 23, "y": 12, "width": 1, "height": 0},
          {"x": 6, "y": 14, "width": 1, "height": 0},
          {"x": 12, "y": 14, "width": 1, "height": 0},
          {"x": 18, "y": 14, "width": 1, "height": 0}
        ]`,
        snakeInitDirection: 'right',
        snakeInitCoords:  `[{"x": 5, "y": 7}, {"x": 6, "y": 7}]`,
        snakeColor: "#83f56c",
        secondsPerElement: 0.5
      },
      {
        name: 'Columns',
        widthInElements: 25,
        heightInElements: 15,
        backgroundFirstColor: "#785d2a",
        backgroundSecondColor: "#372a13",
        obstacleColor: "#000000",
        obstacles: `[
          {"x": 0, "y": 0, "width": 24, "height": 6},
          {"x": 0, "y": 9, "width": 0, "height": 6},
          {"x": 0, "y": 14, "width": 24, "height": 0},
          {"x": 24, "y": 0, "width": 0, "height": 6},
          {"x": 24, "y": 9, "width": 0, "height": 6},
          {"x": 4, "y": 3, "width": 3, "height": 0},
          {"x": 4, "y": 4, "width": 3, "height": 0},
          {"x": 4, "y": 5, "width": 3, "height": 0},
          {"x": 4, "y": 9, "width": 3, "height": 0},
          {"x": 4, "y": 10, "width": 3, "height": 0},
          {"x": 4, "y": 11, "width": 3, "height": 0},
          {"x": 11, "y": 3, "width": 3, "height": 0},
          {"x": 11, "y": 4, "width": 3, "height": 0},
          {"x": 11, "y": 5, "width": 3, "height": 0},
          {"x": 11, "y": 9, "width": 3, "height": 0},
          {"x": 11, "y": 10, "width": 3, "height": 0},
          {"x": 11, "y": 11, "width": 3, "height": 0},
          {"x": 19, "y": 3, "width": 3, "height": 0},
          {"x": 19, "y": 4, "width": 3, "height": 0},
          {"x": 19, "y": 5, "width": 3, "height": 0},
          {"x": 19, "y": 9, "width": 3, "height": 0},
          {"x": 19, "y": 10, "width": 3, "height": 0},
          {"x": 19, "y": 11, "width": 3, "height": 0}
        ]`,
        snakeInitDirection: 'right',
        snakeInitCoords:  `[{"x": 19, "y": 8}, {"x": 20, "y": 8}]`,
        snakeColor: "#83f56c",
        secondsPerElement: 0.5
      },
      {
        name: 'Flappy Bird',
        widthInElements: 17,
        heightInElements: 10,
        backgroundFirstColor: "#785d2a",
        backgroundSecondColor: "#372a13",
        obstacleColor: "#000000",
        obstacles: `[
          {"x": 4, "y": 0, "width": 0, "height": 3},
          {"x": 4, "y": 5, "width": 0, "height": 5},
          {"x": 12, "y": 0, "width": 0, "height": 6},
          {"x": 12, "y": 8, "width": 0, "height": 2}
        ]`,
        snakeInitDirection: 'left',
        snakeInitCoords:  `[{"x": 5, "y": 4}, {"x": 4, "y": 4}]`,
        snakeColor: "#83f56c",
        secondsPerElement: 1.0
      },
      {
        name: 'Barrier',
        widthInElements: 17,
        heightInElements: 10,
        backgroundFirstColor: "#182719",
        backgroundSecondColor: "#324a33",
        obstacleColor: "#000000",
        obstacles: `[
          {"x": 8, "y": 0, "width": 0, "height": 10}
        ]`,
        snakeInitDirection: 'up',
        snakeInitCoords: `[{"x": 5, "y": 5}, {"x": 5, "y": 4}]`,
        snakeColor: "#83f56c",
        secondsPerElement: 0.7
      },
      {
        name: 'Street',
        widthInElements: 25,
        heightInElements: 15,
        backgroundFirstColor: "#785d2a",
        backgroundSecondColor: "#372a13",
        obstacleColor: "#000000",
        obstacles: `[
          {"x": 0, "y": 0, "width": 0, "height": 15},
          {"x": 24, "y": 0, "width": 0, "height": 15}
        ]`,
        snakeInitDirection: 'up',
        snakeInitCoords: `[{"x": 5, "y": 5}, {"x": 5, "y": 4}]`,
        snakeColor: "#83f56c",
        secondsPerElement: 0.7
      },
      {
        name: 'Pipe',
        widthInElements: 25,
        heightInElements: 15,
        backgroundFirstColor: "#182719",
        backgroundSecondColor: "#324a33",
        obstacleColor: "#000000",
        obstacles: `[
          {"x": 0, "y": 0, "width": 25, "height": 0},
          {"x": 0, "y": 14, "width": 25, "height": 0}
        ]`,
        snakeInitDirection: 'up',
        snakeInitCoords: `[{"x": 5, "y": 8}, {"x": 5, "y": 7}]`,
        snakeColor: "#83f56c",
        secondsPerElement: 0.7
      },
      {
        name: 'Arena',
        widthInElements: 25,
        heightInElements: 15,
        backgroundFirstColor: "#614242",
        backgroundSecondColor: "#27181d",
        obstacleColor: "#000000",
        obstacles: `[
          {"x": 0, "y": 0, "width": 24, "height": 6},
          {"x": 0, "y": 9, "width": 0, "height": 6},
          {"x": 0, "y": 14, "width": 24, "height": 0},
          {"x": 24, "y": 0, "width": 0, "height": 6},
          {"x": 24, "y": 9, "width": 0, "height": 6}
        ]`,
        snakeInitDirection: 'right',
        snakeInitCoords:  `[{"x": 5, "y": 5}, {"x": 6, "y": 5}]`,
        snakeColor: "#83f56c",
        secondsPerElement: 0.5
      },
      
    ];
    const httpUrl = environment.firebaseDbUrl + "officialGameMaps.json";
    return this.http.post(httpUrl, gameMaps[8]);
 
  }

  fetchUserScores() {
   
    return this.authService.userAuth.pipe(
      take(1), 
      exhaustMap(userAuth => {
         
          if(!userAuth) {
              return throwError(() => new Error("Error"));
          }

          let httpUrl = environment.firebaseDbUrl + `usersScores/${userAuth.id}.json`;
          return this.http.get<any>(httpUrl).pipe(
            map(userScoresObject => {
              if(userScoresObject === null) {
                return [];
              }
              return Object.keys(userScoresObject).map(key => (<UserScore>{ idMap: key, ...userScoresObject[key] }));
            })
          );
          
      }));
  }



  editUserScore(mapId: string, userScore: UserScore) {
    return this.authService.userAuth.pipe(
      take(1), 
      exhaustMap(userAuth => {
         
          if(!userAuth) {
              return throwError(() => new Error("Error"));
          }

          let httpUrl = environment.firebaseDbUrl + `usersScores/${userAuth.id}/${mapId}.json`;
          return this.http.put<any>(httpUrl, userScore);
          
      })).subscribe();
  }

}

