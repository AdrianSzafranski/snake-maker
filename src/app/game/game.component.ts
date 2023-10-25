import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { GameStateModel } from './game-state.model';
import { ActivatedRoute } from '@angular/router';
import { SnakeService } from '../snake.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit, AfterViewInit {
  @ViewChild('gameCanvas', {static: true}) gameCanvasRef!: ElementRef;
  @ViewChild('bgCanvas', {static: true}) bgCanvasRef!: ElementRef;
  @ViewChild('gridCanvas', {static: true}) gridCanvasRef!: ElementRef;

  gameState!: GameStateModel;
  isFixedMap = false;
  
  constructor(private snakeService: SnakeService, private route: ActivatedRoute) {}

  ngOnInit(): void {

    const mapId = +this.route.snapshot.params['mapId'];
    const map = this.snakeService.getMap(mapId);

    if(map.obstacle) {
      this.isFixedMap = true;
    }

    this.gameState = new GameStateModel(
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