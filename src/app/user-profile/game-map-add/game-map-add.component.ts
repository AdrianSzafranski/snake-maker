import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UserProfileService } from '../user-profile.service';
import { Coordinate } from 'src/app/shared/coordinate-model';
import { GameMap } from 'src/app/snake-game/game-maps/game-map.model';

@Component({
  selector: 'app-game-map-add',
  templateUrl: './game-map-add.component.html',
  styleUrls: ['./game-map-add.component.css']
})
export class GameMapAddComponent implements OnInit {
  @Output() isShowUserMaps = new EventEmitter<boolean>();
  @Input() editMap!: GameMap | null;

  currentMapCreationStage = 1;
  mapCreationStageStrings = [
    'I - Map parameters',
    'II - Map colors',
    'III - Obstacle parameters',
    'IV - Snake parameters'
  ];
  mapCreationStageNumber = 4;

  mapArray: string[][] = [];
  mapName = '';
  mapWidthInElements = 25;
  mapHeightInElements = 15;
  mapSizeInString = 'large';
  mapBackgroundColors = {
    firstColor: "#182719",
    secondColor: "#324a33",
  }
  templatesBackgroundColors = [
    {
      firstColor: "#182719",
      secondColor: "#324a33",
    },
    {
      firstColor: "#464261",
      secondColor: "#181b27",
    },
    {
      firstColor: "#614242",
      secondColor: "#27181d",
    },
    {
      firstColor: "#785d2a",
      secondColor: "#372a13",
    },

  ];

  obstaclesArray: boolean[][] = [];
  obstacleColor = "#000000";

  snakeCoord: {
    rowIndexWithHead: number,
    colIndexWithHead: number,
    rowIndexWithTail: number,
    colIndexWithTail: number
  } | null = null;
  snakeColor = "#83f56c";
  snakeDirection = 'right';
  snakeSpeed = 1;

  error: string | null = null;

  constructor(private userProfileService: UserProfileService) { }

  ngOnInit(): void {
    this.createMapArray();
    this.createObstacleArray();
    this.setInitMapData();
  }

  createMapArray() {
    this.mapArray = Array.from({ length: this.mapHeightInElements }, (_, rowIndex) =>
      Array.from({ length: this.mapWidthInElements }, (_, colIndex) =>
        this.getMapElementBackgroundColor(rowIndex, colIndex)));
  }

  createObstacleArray() {
    this.obstaclesArray = Array.from({ length: this.mapHeightInElements }, (_, rowIndex) =>
      Array.from({ length: this.mapWidthInElements }, (_, colIndex) => false));
  }

  setInitMapData() {
    if(!this.editMap) {
      return;
    }
    this.mapName = this.editMap.name;
    this.mapWidthInElements = this.editMap.boardWidthInElements;
    this.mapHeightInElements = this.editMap.boardHeightInElements;
    this.mapBackgroundColors.firstColor = this.editMap.boardFirstColor;
    this.mapBackgroundColors.secondColor = this.editMap.boardSecondColor;
    this.snakeColor = this.editMap.snakeColor,
    this.obstacleColor = this.editMap.obstacleColor,
    this.snakeDirection = this.editMap.snakeInitDirection
    this.snakeSpeed = this.editMap.initTimeToPassOneElementInSeconds / 0.3;

    this.createMapArray();
    this.createObstacleArray();

    const obstaclesString = this.editMap.obstacles;

    let obstaclesJsonArray: {x: number, y: number, width: number, height: number}[] = JSON.parse(obstaclesString);
    obstaclesJsonArray.forEach(obstacle => { 
      for(let i = 0; i < obstacle.width; i++) {
        const newX = obstacle.x + i;
        this.obstaclesArray[obstacle.y][newX] = true;
        this.mapArray[obstacle.y][newX] = this.obstacleColor;
      }
      for(let i = 0; i < obstacle.height; i++) {
        const newY = obstacle.y + i;
        this.obstaclesArray[newY][obstacle.x] = true;
        this.mapArray[newY][obstacle.x] = this.obstacleColor;

      }
    });

    const snakeCoordString = this.editMap.snakeInitCoords;
    let snakeCoords: {x: number, y: number}[] = JSON.parse(snakeCoordString);
    this.snakeCoord = {
      rowIndexWithHead: snakeCoords[1].y,
      colIndexWithHead: snakeCoords[1].x,
      rowIndexWithTail: snakeCoords[0].y,
      colIndexWithTail: snakeCoords[0].x
    }
    this.mapArray[snakeCoords[0].y][snakeCoords[0].x] = this.snakeColor;
    this.mapArray[snakeCoords[1].y][snakeCoords[1].x] = this.snakeColor;
  }

  getMapElementBackgroundColor(rowIndex: number, colIndex: number) {
    return ((rowIndex + colIndex) % 2 === 0) ? this.mapBackgroundColors.firstColor : this.mapBackgroundColors.secondColor;
  }

  onSetMapSizeInElements(mapSizeInString: string) {
    this.mapSizeInString = mapSizeInString;

    if (mapSizeInString === "small") {
      this.mapWidthInElements = 15;
      this.mapHeightInElements = 9;
    } else if (mapSizeInString === "medium") {
      this.mapWidthInElements = 20;
      this.mapHeightInElements = 12;
    } else if (mapSizeInString === "large") {
      this.mapWidthInElements = 25;
      this.mapHeightInElements = 15;
    }

    this.createMapArray();
    this.createObstacleArray();
  }

  setMapElementStyle(rowIndex: number, colIndex: number) {

    let mapElementSizeInPixels = '25px';
    if (this.mapWidthInElements === 20) {
      mapElementSizeInPixels = '31px';
    } else if (this.mapWidthInElements === 15) {
      mapElementSizeInPixels = '42px';
    }
    const mapElementStyle = {
      'background-color': this.mapArray[rowIndex][colIndex],
      'width': mapElementSizeInPixels,
      'height': mapElementSizeInPixels
    };

    return mapElementStyle;
  }

  onShowNextStage() {

    if (this.currentMapCreationStage === this.mapCreationStageNumber) {
      return;
    }

    const isFirstMapCreationStage = this.currentMapCreationStage === 1;
    if (isFirstMapCreationStage) {
      const isValidMapName = this.mapName.trim() !== '';
      const canGoToSecondMapCreationStage = isFirstMapCreationStage && isValidMapName;
      if (!canGoToSecondMapCreationStage) {
        this.error = 'Enter the name of the map!';
        setTimeout(() => { this.error = null }, 5000);
        return;
      }
    }

    this.error = null;
    this.currentMapCreationStage++;
  }

  onShowPreviousStage() {
    if (this.currentMapCreationStage === 1) {
      return;
    }

    const isFourthMapCreationStage = this.currentMapCreationStage === 4;
    if (isFourthMapCreationStage) {
      this.removeSnakeFromMap();
      this.snakeCoord = null;
    }
    this.currentMapCreationStage--;
  }

  changeMapBackgroundColor(color: string, isFirstColor: boolean) {

    const rest = isFirstColor ? 0 : 1;

    this.mapArray.forEach((row, rowIndex) => {
      row.forEach((element, colIndex) => {
        if(this.obstaclesArray[rowIndex][colIndex]) {
          return;
        }
        if(this.snakeCoord && this.snakeCoord.rowIndexWithHead === rowIndex && this.snakeCoord.colIndexWithHead === colIndex) {
          return;
        }
        if(this.snakeCoord && this.snakeCoord.rowIndexWithTail === rowIndex && this.snakeCoord.colIndexWithTail === colIndex) {
          return;
        }

        if ((rowIndex + colIndex) % 2 === rest) {
          this.mapArray[rowIndex][colIndex] = color;
        }
        console.log(element);
      });
    });
  }

  changeMapBackgroundColors() {
    this.mapArray.forEach((row, rowIndex) => {
      row.forEach((element, colIndex) => {
        if (!(this.obstaclesArray[rowIndex][colIndex] === false)) {
          return;
        }
        if(this.snakeCoord && this.snakeCoord.rowIndexWithHead === rowIndex && this.snakeCoord.colIndexWithHead === colIndex) {
          return;
        }
        if(this.snakeCoord && this.snakeCoord.rowIndexWithTail === rowIndex && this.snakeCoord.colIndexWithTail === colIndex) {
          return;
        }
        this.mapArray[rowIndex][colIndex] = this.getMapElementBackgroundColor(rowIndex, colIndex);
      });
    });
  }

  onManageMapElement(rowIndex: number, colIndex: number) {

    this.onManageObstacles(rowIndex, colIndex);
    this.onManageSnake(rowIndex, colIndex);
  }

  onManageObstacles(rowIndex: number, colIndex: number) {

    if (this.currentMapCreationStage !== 3) {
      return;
    }

    this.removeSnakeFromMap();
    this.snakeCoord = null;

    if (this.obstaclesArray[rowIndex][colIndex] === false) {
      this.mapArray[rowIndex][colIndex] = this.obstacleColor;
      this.obstaclesArray[rowIndex][colIndex] = true;
    } else {
      this.mapArray[rowIndex][colIndex] = this.getMapElementBackgroundColor(rowIndex, colIndex);
      this.obstaclesArray[rowIndex][colIndex] = false;
    }
  }

  onManageSnake(rowIndex: number, colIndex: number) {
    if (this.currentMapCreationStage !== 4) {
      return;
    }
    
    //check if the next 3 snake target elements are empty of obstacles
    let checkDestinationRow = rowIndex;
    let checkDestinationColumn = colIndex;
    for (let i = 0; i < 3; i++) {
      switch (this.snakeDirection) {
        case 'up':
          checkDestinationRow--;
          if (checkDestinationRow < 0) {
            checkDestinationRow = this.mapHeightInElements - 1;
          }
          break;
        case 'right':
          checkDestinationColumn++;
          if (checkDestinationColumn >= this.mapWidthInElements) {
            checkDestinationColumn = 0;
          }
          break;
        case 'bottom':
          checkDestinationRow++;
          if (checkDestinationRow >= this.mapHeightInElements) {
            checkDestinationRow = 0;
          }
          break;
        case 'left':
          checkDestinationColumn--;
          if (checkDestinationColumn < 0) {
            checkDestinationColumn = this.mapWidthInElements - 1;
          }
          break;
      }
    
      if (this.mapArray[checkDestinationRow][checkDestinationColumn] === this.obstacleColor) {
        return;
      }
    }

    const isExistSnake = this.snakeCoord;
    // If the snake exists and the user clicked on it, it means that the user wants to remove it
    if (isExistSnake) {
      const isClickedSnake = (this.snakeCoord!.rowIndexWithHead === rowIndex && this.snakeCoord!.colIndexWithHead === colIndex);
      if(isClickedSnake) {
        this.removeSnakeFromMap();
        this.snakeCoord = null;
        return;
      }
    }
   
    // check that the selected coordinate (for the snake's head) and the coordinate preceding 
    // it (for the snake's tail) do not contain any obstacles
    if (this.obstaclesArray[rowIndex][colIndex]) {
      return;
    }

    let tailRowIndex = rowIndex;
    let tailColIndex = colIndex;
    switch (this.snakeDirection) {
      case 'up':
        tailRowIndex++;
        if (tailRowIndex >= this.mapHeightInElements) {
          tailRowIndex = 0;
        }
        break;
      case 'right':
        tailColIndex--;
        if (tailColIndex < 0) {
          tailColIndex = this.mapWidthInElements - 1;
        }
        break;
      case 'bottom':
        tailRowIndex--;
        if (tailRowIndex < 0) {
          tailRowIndex = this.mapHeightInElements - 1;
        }
        break;
      case 'left':
        tailColIndex++;
        if (tailColIndex >= this.mapWidthInElements) {
          tailColIndex = 0;
        }
        break;
    }

    if (this.obstaclesArray[tailRowIndex][tailColIndex]) {
      return;
    }

    if(isExistSnake) {
      this.removeSnakeFromMap();
    }
   
    this.mapArray[rowIndex][colIndex] = this.snakeColor;
    this.mapArray[tailRowIndex][tailColIndex] = this.snakeColor;
    this.snakeCoord = {
      rowIndexWithHead: rowIndex,
      colIndexWithHead: colIndex,
      rowIndexWithTail: tailRowIndex,
      colIndexWithTail: tailColIndex
    };
  }

  removeSnakeFromMap() {
    if(this.snakeCoord === null) {
      return;
    }
    this.mapArray[this.snakeCoord!.rowIndexWithHead][this.snakeCoord!.colIndexWithHead] =
      this.getMapElementBackgroundColor(this.snakeCoord!.rowIndexWithHead, this.snakeCoord!.colIndexWithHead);
    this.mapArray[this.snakeCoord!.rowIndexWithTail][this.snakeCoord!.colIndexWithTail] =
      this.getMapElementBackgroundColor(this.snakeCoord!.rowIndexWithTail, this.snakeCoord!.colIndexWithTail);
  }

  onChangeBackgroundFirstColor(event: any) {
    const newFirstcolor = event.target.value;
    this.mapBackgroundColors.firstColor = newFirstcolor;
    this.changeMapBackgroundColor(newFirstcolor, true);
  }

  onChangeBackgroundSecondColor(event: any) {
    const newSecondColor = event.target.value;
    this.mapBackgroundColors.secondColor = newSecondColor;
    this.changeMapBackgroundColor(newSecondColor, false);
  }

  onSetTemplateBackgroundColors(index: number) {
    this.mapBackgroundColors.firstColor = this.templatesBackgroundColors[index].firstColor;
    this.mapBackgroundColors.secondColor = this.templatesBackgroundColors[index].secondColor;
    this.changeMapBackgroundColors();
  }

  onChangeObstaclesColor(event: any) {
    const newColor = event.target.value
    this.obstacleColor = newColor;
    this.obstaclesArray.forEach((row, rowIndex) => {
      row.forEach((element, colIndex) => {
          if(element) {
            this.mapArray[rowIndex][colIndex] = newColor;
          }
      });
    });
  }

  onChangeSnakeColor(event: any) {
    const newColor = event.target.value;
    this.snakeColor = newColor;
    if (!this.snakeCoord) {
      return;
    }
    this.mapArray[this.snakeCoord.rowIndexWithHead][this.snakeCoord.colIndexWithHead] = newColor;
    this.mapArray[this.snakeCoord.rowIndexWithTail][this.snakeCoord.colIndexWithTail] = newColor;
  }

  onChangeSnakeDirection() {
    if (!this.snakeCoord) {
      return;
    }

    this.mapArray[this.snakeCoord.rowIndexWithHead][this.snakeCoord.colIndexWithHead] =
      ((this.snakeCoord.rowIndexWithHead + this.snakeCoord.colIndexWithHead) % 2 === 0) ? this.mapBackgroundColors.firstColor : this.mapBackgroundColors.secondColor;;
    this.mapArray[this.snakeCoord.rowIndexWithTail][this.snakeCoord.colIndexWithTail] =
      ((this.snakeCoord.rowIndexWithTail + this.snakeCoord.colIndexWithTail) % 2 === 0) ? this.mapBackgroundColors.firstColor : this.mapBackgroundColors.secondColor;;
    this.snakeCoord = null;
  }

onSubmit() {
  this.error = null;

  if (this.snakeCoord === null) {
    this.error = "Choose snake position!";
  } else if (!this.snakeSpeed || this.snakeSpeed < 1 || this.snakeSpeed > 3) {
    this.error = "Enter the snake speed from 1 to 3!";
  }

  if (this.error) {
    setTimeout(() => { this.error = null }, 5000);
    return;
  }

  let obstaclesString = '[';

  this.obstaclesArray.forEach((row, rowIndex) => {
    row.forEach((element, colIndex) => {
        if(element) {
          obstaclesString += `{"x": ${colIndex}, "y": ${rowIndex}, "width": 1, "height": 0},`;
        }
    });
  });

  obstaclesString = obstaclesString.slice(0, -1);
  obstaclesString += "]";

  let snakeCoordsString = `[{"x": ${this.snakeCoord!.colIndexWithTail}, "y": ${this.snakeCoord!.rowIndexWithTail}}, {"x": ${this.snakeCoord!.colIndexWithHead}, "y": ${this.snakeCoord!.rowIndexWithHead}}]`;

  const map = {
    name: this.mapName,
    boardWidthInElements: this.mapWidthInElements,
    boardHeightInElements: this.mapHeightInElements,
    boardFirstColor: this.mapBackgroundColors.firstColor,
    boardSecondColor: this.mapBackgroundColors.secondColor,
    obstacleColor: this.obstacleColor,
    obstacles: obstaclesString,
    snakeInitDirection: this.snakeDirection,
    snakeInitCoords: snakeCoordsString,
    snakeColor: this.snakeColor,
    initTimeToPassOneElementInSeconds: this.snakeSpeed * 0.3
  }

  if(this.editMap) {
    if(!this.editMap.id) {
      return;
    }
    this.userProfileService.editUserMap(map, this.editMap.id).subscribe(() => {
      this.isShowUserMaps.next(true);
    });
  } else {
    this.userProfileService.addUserMap(map).subscribe(() => {
      this.isShowUserMaps.next(true);
    });
  }

  
}
}