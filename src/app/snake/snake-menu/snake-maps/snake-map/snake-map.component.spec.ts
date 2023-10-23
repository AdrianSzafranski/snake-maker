import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SnakeMapComponent } from './snake-map.component';

describe('SnakeMapComponent', () => {
  let component: SnakeMapComponent;
  let fixture: ComponentFixture<SnakeMapComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SnakeMapComponent]
    });
    fixture = TestBed.createComponent(SnakeMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
