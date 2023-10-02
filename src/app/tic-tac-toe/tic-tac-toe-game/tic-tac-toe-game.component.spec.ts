import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicTacToeGameComponent } from './tic-tac-toe-game.component';

describe('TicTacToeGameComponent', () => {
  let component: TicTacToeGameComponent;
  let fixture: ComponentFixture<TicTacToeGameComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TicTacToeGameComponent]
    });
    fixture = TestBed.createComponent(TicTacToeGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
