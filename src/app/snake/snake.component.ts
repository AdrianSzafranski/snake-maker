import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { SnakeGameStateModel } from './snake-game-state.model';

@Component({
  selector: 'app-snake',
  templateUrl: './snake.component.html',
  styleUrls: ['./snake.component.css']
})
export class SnakeComponent implements OnInit  {

  @ViewChild('hamburgerMenu') hamburgerMenu?: ElementRef;
  @ViewChild('canvas', {static: true}) canvasRef!: ElementRef;

  gameState!: SnakeGameStateModel;
 
  constructor() {}

  ngOnInit(): void {
    this.gameState = new SnakeGameStateModel(this.canvasRef.nativeElement);
    this.changeScreenSize();
    this.gameState.startGame();
  }

  onRestart(isChangeMap: boolean) {
    this.gameState.isChangeMap = isChangeMap;
    this.gameState.isRestartGame = true;
  }

  convertDirectionValue(directionString: String) {
    switch(directionString) {
      case 'ArrowDown': return {x: 0, y: 1};
      case 'ArrowLeft': return {x: -1, y: 0};
      case 'ArrowUp': return {x: 0, y: -1};
      case 'ArrowRight': return {x: 1, y: 0};
      default: return {x: 0, y: 0};
    }
  }

  @HostListener('window:resize', ['$event'])
  changeScreenSize(event?: Event): void {
      this.gameState.changeScreenSize();
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
  
      let possibleDirection = ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'];
      if(possibleDirection.includes(event.key) && !this.gameState.isGamePaused) {
        this.gameState.currentDirection = this.convertDirectionValue(event.key);
      }

      if(event.key.toUpperCase() === 'P') {
        this.gameState.isGamePaused = !this.gameState.isGamePaused;
      }
  }
}
