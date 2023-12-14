import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { GameService } from './game.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
  providers: [GameService],
})
export class GameComponent implements OnInit, OnDestroy {
  @ViewChild('staticCanvas', {static: true}) staticCanvasRef!: ElementRef;
  @ViewChild('snakeCanvas', {static: true}) snakeCanvasRef!: ElementRef;
  @ViewChild('foodCanvas', {static: true}) foodCanvasRef!: ElementRef;
  @ViewChild('textCanvas', {static: true}) textCanvasRef!: ElementRef;

  isLoading = true;
  currentScore = 0;
  bestScore = 0;
  gameMapWidthInPixels = 400;
  currentScoreSubscription!: Subscription; 
  bestScoreSubscription!: Subscription; 
  gameMapWidthInPixelsSubscription!: Subscription;

  constructor(private gameService: GameService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    const gameMapType = this.route.snapshot.params['mapType'];
    const gameMapId = this.route.snapshot.params['mapId'];
    this.gameService.loadGameData(
      gameMapType, 
      gameMapId,
      this.staticCanvasRef.nativeElement,
      this.snakeCanvasRef.nativeElement,
      this.foodCanvasRef.nativeElement,
      this.textCanvasRef.nativeElement).subscribe(mapData => {
      this.isLoading = false;
    }); 
    this.currentScoreSubscription = this.gameService.currentScoreSubject.subscribe(currentScore => this.currentScore = currentScore);
    this.bestScoreSubscription = this.gameService.bestScoreSubject.subscribe(bestScore => this.bestScore = bestScore);
    this.gameMapWidthInPixelsSubscription = this.gameService.gameMapWidthInPixelsSubject
      .subscribe(gameMapWidthInPixels => this.gameMapWidthInPixels = gameMapWidthInPixels);
  }

  ngOnDestroy(): void {
    this.gameService.endGame();
    this.currentScoreSubscription.unsubscribe();
    this.bestScoreSubscription.unsubscribe();
    this.gameMapWidthInPixelsSubscription.unsubscribe();
  }

  @HostListener('window:resize', ['$event'])
  changeScreenSize(event?: Event): void {
      this.gameService.changeScreenSize();
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
      let possibleDirection = ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'];
      if(possibleDirection.includes(event.key)) {
        let direction = event.key.replace("Arrow", "").toLowerCase();
        this.gameService.currentDirection = direction;
      }

      if(event.key.toUpperCase() === 'S') {
        this.gameService.startGame();
      }

      if(event.key.toUpperCase() === 'P') {
        this.gameService.pauseGame();
      }

      if(event.key.toUpperCase() === 'R') {
        this.gameService.restartGame();
      }

  }
}