import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AmIconComponent } from './am-icon.component';

describe('AmIconComponent', () => {
  let component: AmIconComponent;
  let fixture: ComponentFixture<AmIconComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AmIconComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AmIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
