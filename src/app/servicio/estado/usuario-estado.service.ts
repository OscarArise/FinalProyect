import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuarioEstadoService {

  private usuarioSubject = new BehaviorSubject <string>('');
  usuario$ = this.usuarioSubject.asObservable();

  private setUsuario(usuario: string) {
    this.usuarioSubject.next(usuario);
  }

  
  loginUsuario(usuario: string) {
    this.setUsuario(usuario);
  }
  logoutUsuario() {
    this.setUsuario('');
  }

}
