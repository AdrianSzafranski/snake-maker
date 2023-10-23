import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SnakeRulesComponent } from './snake-rules.component';

describe('SnakeRulesComponent', () => {
  let component: SnakeRulesComponent;
  let fixture: ComponentFixture<SnakeRulesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SnakeRulesComponent]
    });
    fixture = TestBed.createComponent(SnakeRulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
