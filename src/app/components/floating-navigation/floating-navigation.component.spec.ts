import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FloatingNavigationComponent } from './floating-navigation.component';

describe('FloatingNavigationComponent', () => {
  let component: FloatingNavigationComponent;
  let fixture: ComponentFixture<FloatingNavigationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FloatingNavigationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FloatingNavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
