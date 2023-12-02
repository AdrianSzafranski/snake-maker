import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, exhaustMap, map, mergeMap, of, take, tap, throwError } from 'rxjs';

import firebaseConfig from '../../config';
import { GameMap } from './game-map.model';
import { AuthService } from 'src/app/auth/auth.service';
import { UserScore } from '../user-score.model';


@Injectable({
  providedIn: 'root'
})
export class GameMapService {

  constructor(private http: HttpClient, private authService: AuthService) {}

  fetchMaps() {
    const httpUrl = firebaseConfig.dbUrl + "gameMaps.json";
    return this.http.get<any>(httpUrl).pipe(
      map(gameMapsObject => {
        return Object.keys(gameMapsObject).map(key => ({ id: key, ...gameMapsObject[key] }));
      })
    );
  }

  fetchUnofficialMaps() {
    const httpUrl = firebaseConfig.dbUrl + "unofficialMaps.json";
    return this.http.get<any>(httpUrl).pipe(
      map(unofficialMapsObject => {
        return Object.keys(unofficialMapsObject).map(key => ({ id: key, ...unofficialMapsObject[key] }));
      })
    );
  }

  fetchMap(mapType: string, mapId: string) {
    let httpUrl = firebaseConfig.dbUrl + `${mapType}/${mapId}.json`;
    let userId: string | null = null;

    return this.authService.userAuth.pipe(
      take(1), 
      exhaustMap(userAuth => {
         
          if(!userAuth) {
              return throwError(() => new Error("Error"));
          }
          userId = userAuth.id;
          if(mapType === 'usersMaps') {
            httpUrl = firebaseConfig.dbUrl + `usersMaps/${userAuth.id}/${mapId}.json`;
          }
          return this.http.get<any>(httpUrl).pipe(
            map(gameMapObject => {
              return <GameMap>{
                id: mapId,
                ...gameMapObject
              };
            })
          );
          
      }),
      exhaustMap(gameMap => {
        if(!userId || !gameMap.id) {
            return throwError(() => new Error("Error"));
        }
        let httpUrl = firebaseConfig.dbUrl + `usersScores/${userId}/${gameMap.id}.json`;
        return this.http.get<any>(httpUrl).pipe(
          map(userScore => {
            if(!userScore) {
              userScore = {
                highestScore: 0,
                gamesNumber: 0,
              }
            }
            return {
              gameMap: gameMap,
              userScore: { idMap: mapId, ...userScore }
          }})
        );
        
    }));
  }

 

  addMap() {
    const gameMaps = [
      {
        name: 'Open',
        boardWidthInElements: 25,
        boardHeightInElements: 15,
        boardFirstColor: "#182719",
        boardSecondColor: "#324a33",
        obstacleColor: "#000000",
        obstacles: `[]`,
        snakeInitDirection: 'down',
        snakeInitCoords: `[{"x": 5, "y": 5}, {"x": 5, "y": 6}]`,
        initTimeToPassOneElementInSeconds: 0.3
      },
      {
        name: 'Close',
        boardWidthInElements: 25,
        boardHeightInElements: 15,
        boardFirstColor: "#464261",
        boardSecondColor: "#181b27",
        obstacleColor: "#000000",
        obstacles: `[
          {"x": 0, "y": 0, "width": 24, "height": 15},
          {"x": 0, "y": 14, "width": 24, "height": 0},
          {"x": 24, "y": 0, "width": 0, "height": 15}
        ]`,
        snakeInitDirection: 'right',
        snakeInitCoords:  `[{"x": 5, "y": 5}, {"x": 6, "y": 5}]`,
        initTimeToPassOneElementInSeconds: 0.5
      },
      {
        name: 'Mines', 
        boardWidthInElements: 25,
        boardHeightInElements: 15,
        boardFirstColor: "#614242",
        boardSecondColor: "#27181d",
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
        initTimeToPassOneElementInSeconds: 0.5
      },
      {
        name: 'Columns',
        boardWidthInElements: 25,
        boardHeightInElements: 15,
        boardFirstColor: "#785d2a",
        boardSecondColor: "#372a13",
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
        snakeInitCoords:  `[{"x": 19, "y": 8}, {"x": 19, "y": 8}]`,
        initTimeToPassOneElementInSeconds: 0.5
      },
      {
        name: 'Flappy Bird',
        boardWidthInElements: 17,
        boardHeightInElements: 10,
        boardFirstColor: "#785d2a",
        boardSecondColor: "#372a13",
        obstacleColor: "#000000",
        obstacles: `[
          {"x": 4, "y": 0, "width": 0, "height": 3},
          {"x": 4, "y": 5, "width": 0, "height": 5},
          {"x": 12, "y": 0, "width": 0, "height": 6},
          {"x": 12, "y": 8, "width": 0, "height": 2}
        ]`,
        snakeInitDirection: 'left',
        snakeInitCoords:  `[{"x": 5, "y": 4}, {"x": 4, "y": 4}]`,
        initTimeToPassOneElementInSeconds: 1.0
      },
      {
        name: 'Barrier',
        boardWidthInElements: 17,
        boardHeightInElements: 10,
        boardFirstColor: "#182719",
        boardSecondColor: "#324a33",
        obstacleColor: "#000000",
        obstacles: `[
          {"x": 8, "y": 0, "width": 0, "height": 10}
        ]`,
        snakeInitDirection: 'up',
        snakeInitCoords: `[{"x": 5, "y": 5}, {"x": 5, "y": 4}]`,
        initTimeToPassOneElementInSeconds: 0.7
      },
      {
        name: 'Street',
        boardWidthInElements: 25,
        boardHeightInElements: 15,
        boardFirstColor: "#785d2a",
        boardSecondColor: "#372a13",
        obstacleColor: "#000000",
        obstacles: `[
          {"x": 0, "y": 0, "width": 0, "height": 15},
          {"x": 24, "y": 0, "width": 0, "height": 15}
        ]`,
        snakeInitDirection: 'up',
        snakeInitCoords: `[{"x": 5, "y": 5}, {"x": 5, "y": 4}]`,
        initTimeToPassOneElementInSeconds: 0.7
      },
      {
        name: 'Pipe',
        boardWidthInElements: 25,
        boardHeightInElements: 15,
        boardFirstColor: "#182719",
        boardSecondColor: "#324a33",
        obstacleColor: "#000000",
        obstacles: `[
          {"x": 0, "y": 0, "width": 25, "height": 0},
          {"x": 0, "y": 14, "width": 25, "height": 0}
        ]`,
        snakeInitDirection: 'up',
        snakeInitCoords: `[{"x": 5, "y": 8}, {"x": 5, "y": 7}]`,
        initTimeToPassOneElementInSeconds: 0.7
      },
      {
        name: 'Arena',
        boardWidthInElements: 25,
        boardHeightInElements: 15,
        boardFirstColor: "#614242",
        boardSecondColor: "#27181d",
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
        initTimeToPassOneElementInSeconds: 0.5
      },
      
    ];
    const httpUrl = firebaseConfig.dbUrl + "gameMaps.json";
    return this.http.post(httpUrl, gameMaps[8]);
 
  }

  fetchUserScores() {
   
    return this.authService.userAuth.pipe(
      take(1), 
      exhaustMap(userAuth => {
         
          if(!userAuth) {
              return throwError(() => new Error("Error"));
          }

          let httpUrl = firebaseConfig.dbUrl + `usersScores/${userAuth.id}.json`;
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

          let httpUrl = firebaseConfig.dbUrl + `usersScores/${userAuth.id}/${mapId}.json`;
          return this.http.put<any>(httpUrl, userScore);
          
      })).subscribe();
  }

}

