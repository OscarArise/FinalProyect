import { TestBed } from '@angular/core/testing';

import { UsuarioEstadoService } from './usuario-estado.service';

describe('UsuarioEstadoService', () => {
  let service: UsuarioEstadoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UsuarioEstadoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
