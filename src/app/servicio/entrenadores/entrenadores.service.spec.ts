import { TestBed } from '@angular/core/testing';

import { EntrenadoresService } from './entrenadores.service';

describe('EntrenadoresService', () => {
  let service: EntrenadoresService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EntrenadoresService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
