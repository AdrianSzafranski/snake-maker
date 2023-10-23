import { Injectable } from '@angular/core';
import { snakeMapModel } from './snake-map.model';

@Injectable({
  providedIn: 'root'
})
export class SnakeService {

  constructor() {}

  maps = [
    {
      id: 1,
      boardWidthInElements: 25,
      boardHeightInElements: 15,
      boardFirstColor: "#212c6d",
      boardSecondColor: "#111738",
      obstacleColor: "#000000",
      obstacles: `[]`,
      snakeInitDirection: 'down',
      snakeInitCoords: `[{"x": 5, "y": 5}, {"x": 5, "y": 6}]`,
      initTimeToPassOneElementInSeconds: 0.3
    },
    {
      id: 2,
      boardWidthInElements: 25,
      boardHeightInElements: 15,
      boardFirstColor: "#7c561b",
      boardSecondColor: "#7e341b",
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
      id: 3,
      boardWidthInElements: 17,
      boardHeightInElements: 10,
      boardFirstColor: "#7c561b",
      boardSecondColor: "#7e341b",
      obstacleColor: "#000000",
      obstacles: `[
        {"x": 4, "y": 0, "width": 0, "height": 3},
        {"x": 4, "y": 5, "width": 0, "height": 5},
        {"x": 12, "y": 0, "width": 0, "height": 6},
        {"x": 12, "y": 8, "width": 0, "height": 2}
      ]`,
      snakeInitDirection: 'left',
      snakeInitCoords:  `[{"x": 5, "y": 5}, {"x": 4, "y": 5}]`,
      initTimeToPassOneElementInSeconds: 1.0
    },
    {
      id: 4,
      boardWidthInElements: 17,
      boardHeightInElements: 10,
      boardFirstColor: "#7c561b",
      boardSecondColor: "#7e341b",
      obstacleColor: "#000000",
      obstacles: `[
        {"x": 8, "y": 0, "width": 0, "height": 10}
      ]`,
      snakeInitDirection: 'up',
      snakeInitCoords: `[{"x": 5, "y": 5}, {"x": 5, "y": 4}]`,
      initTimeToPassOneElementInSeconds: 0.7
    },
  ];

  getMaps() {
    const mapsCopy = JSON.parse(JSON.stringify(this.maps));
    return mapsCopy;
  }

  getMap(id: number) {
    let map = this.maps.find(map => map.id === id);
    console.log(map);
    if(!map) {
      map = this.maps[0];
    }
   
    const mapCopy =  JSON.parse(JSON.stringify(map));
    return mapCopy;

  }

}
