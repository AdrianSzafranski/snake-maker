import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicTacToeSetupComponent } from './tic-tac-toe-setup.component';

describe('TicTacToeSetupComponent', () => {
  let component: TicTacToeSetupComponent;
  let fixture: ComponentFixture<TicTacToeSetupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TicTacToeSetupComponent]
    });
    fixture = TestBed.createComponent(TicTacToeSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
