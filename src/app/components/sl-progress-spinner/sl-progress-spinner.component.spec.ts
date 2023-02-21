import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SlProgressSpinnerComponent } from './sl-progress-spinner.component';

describe('SlProgressSpinnerComponent', () => {
  let component: SlProgressSpinnerComponent;
  let fixture: ComponentFixture<SlProgressSpinnerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SlProgressSpinnerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SlProgressSpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
