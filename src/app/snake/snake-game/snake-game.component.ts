import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { SnakeGameStateModel } from './snake-game-state.model';
import { ActivatedRoute } from '@angular/router';
import { SnakeService } from '../snake.service';

@Component({
  selector: 'app-snake-game',
  templateUrl: './snake-game.component.html',
  styleUrls: ['./snake-game.component.css']
})
export class SnakeGameComponent implements OnInit, AfterViewInit {
  @ViewChild('gameCanvas', {static: true}) gameCanvasRef!: ElementRef;
  @ViewChild('bgCanvas', {static: true}) bgCanvasRef!: ElementRef;
  @ViewChild('gridCanvas', {static: true}) gridCanvasRef!: ElementRef;

  gameState!: SnakeGameStateModel;
  isFixedMap = false;
  
  constructor(private snakeService: SnakeService, private route: ActivatedRoute) {}

  ngOnInit(): void {

    const mapId = +this.route.snapshot.params['mapId'];
    const map = this.snakeService.getMap(mapId);

    if(map.obstacle) {
      this.isFixedMap = true;
    }

    this.gameState = new SnakeGameStateModel(
      map,
      this.gameCanvasRef.nativeElement,
      this.bgCanvasRef.nativeElement,
      this.gridCanvasRef.nativeElement
    );
    this.changeScreenSize();
  }

  ngAfterViewInit(): void {
    this.gameState.startGame();
  }

  onRestart(isChangeMap: boolean) {
    this.gameState.restartGame(isChangeMap);
  }



  @HostListener('window:resize', ['$event'])
  changeScreenSize(event?: Event): void {
      this.gameState.changeScreenSize();
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
      let possibleDirection = ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'];
      if(possibleDirection.includes(event.key) && !this.gameState.isGamePaused) {
        let direction = event.key.replace("Arrow", "").toLowerCase();
        this.gameState.currentDirection = direction;
      }

      if(event.key.toUpperCase() === 'P') {
        this.gameState.pauseGame();
      }
  }
}