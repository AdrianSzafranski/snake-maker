import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SnakeMapsComponent } from './snake-maps.component';

describe('SnakeMapsComponent', () => {
  let component: SnakeMapsComponent;
  let fixture: ComponentFixture<SnakeMapsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SnakeMapsComponent]
    });
    fixture = TestBed.createComponent(SnakeMapsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
