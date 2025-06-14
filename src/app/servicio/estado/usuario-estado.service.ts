import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AutenticacionService } from '../firebase/auth/autenticacion.service';

@Injectable({
  providedIn: 'root'
})
export class UsuarioEstadoService {

  private usuarioSubject = new BehaviorSubject <string>('');
  usuario$ = this.usuarioSubject.asObservable();
  
  private setUsuario(usuario: string) {
    this.usuarioSubject.next(usuario);
  }

  private uidSubject = new BehaviorSubject<string>('');
  uid$ = this.uidSubject.asObservable();

  private setUid(uid: string) {
    this.uidSubject.next(uid);
  }
  
  loginUsuario(usuario: string) {
    this.setUsuario(usuario);
  }
  agregarUID(uid: string) {
    this.setUid(uid);
  }
  logoutUsuario() {
    this.authService.logout()
    this.setUsuario('');
    this.setUid('');
  }

  // Ejemplo en tu componente
constructor(
  private authService: AutenticacionService,
) {}

login(email: string, password: string) {
  return this.authService.login(email, password)
    .then(cred => {
      const nombreUsuario = cred.user.displayName || cred.user.email || '';
      this.loginUsuario(nombreUsuario);
      this.setUid(cred.user.uid);
      console.log('DATOS DEL SERVICIO USUARIO ESTADO');
      console.log('Usuario logueado:', nombreUsuario);
      console.log('UID del usuario:', cred.user.uid);
    });
}

}
