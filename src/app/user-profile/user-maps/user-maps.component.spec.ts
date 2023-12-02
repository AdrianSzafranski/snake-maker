import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserMapsComponent } from './user-maps.component';

describe('UserMapsComponent', () => {
  let component: UserMapsComponent;
  let fixture: ComponentFixture<UserMapsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UserMapsComponent]
    });
    fixture = TestBed.createComponent(UserMapsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
