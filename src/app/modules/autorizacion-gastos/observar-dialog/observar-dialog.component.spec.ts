import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObservarDialogComponent } from './observar-dialog.component';

describe('ObservarDialogComponent', () => {
  let component: ObservarDialogComponent;
  let fixture: ComponentFixture<ObservarDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ObservarDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ObservarDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
