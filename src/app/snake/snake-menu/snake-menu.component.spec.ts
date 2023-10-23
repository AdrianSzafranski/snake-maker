import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SnakeMenuComponent } from './snake-menu.component';

describe('SnakeMenuComponent', () => {
  let component: SnakeMenuComponent;
  let fixture: ComponentFixture<SnakeMenuComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SnakeMenuComponent]
    });
    fixture = TestBed.createComponent(SnakeMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
