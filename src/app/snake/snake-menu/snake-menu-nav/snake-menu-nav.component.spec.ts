import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SnakeMenuNavComponent } from './snake-menu-nav.component';

describe('SnakeMenuNavComponent', () => {
  let component: SnakeMenuNavComponent;
  let fixture: ComponentFixture<SnakeMenuNavComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SnakeMenuNavComponent]
    });
    fixture = TestBed.createComponent(SnakeMenuNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
