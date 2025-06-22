import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartSolicitudesComponent } from './chart-solicitudes.component';

describe('ChartSolicitudesComponent', () => {
  let component: ChartSolicitudesComponent;
  let fixture: ComponentFixture<ChartSolicitudesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChartSolicitudesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChartSolicitudesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
