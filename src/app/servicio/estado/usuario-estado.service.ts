import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AutenticacionService } from '../firebase/auth/autenticacion.service';
import { UserCredential } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class UsuarioEstadoService {

  private usuarioSubject = new BehaviorSubject<string>('');
  usuario$ = this.usuarioSubject.asObservable();

  private setUsuario(usuario: string) {
    this.usuarioSubject.next(usuario);
  }

  private uidSubject = new BehaviorSubject<string>('');
  uid$ = this.uidSubject.asObservable();

  private setUid(uid: string) {
    this.uidSubject.next(uid);
  }

  constructor(private authService: AutenticacionService) {}

  // Método genérico para procesar cualquier UserCredential
  private procesarUsuarioAutenticado(cred: UserCredential): void {
    const nombreUsuario = cred.user.displayName || cred.user.email || 'Usuario';
    this.setUsuario(nombreUsuario);
    this.setUid(cred.user.uid);
    
    console.log('DATOS DEL SERVICIO USUARIO ESTADO');
    console.log('Usuario logueado:', nombreUsuario);
    console.log('UID del usuario:', cred.user.uid);
    console.log('Proveedor:', cred.providerId || 'Email/Password');
  }

  // Login con email y contraseña
  login(email: string, password: string): Promise<UserCredential> {
    return this.authService.login(email, password)
      .then(cred => {
        this.procesarUsuarioAutenticado(cred);
        return cred;
      });
  }

  // Login con Google
  loginConGoogle(): Promise<UserCredential> {
    return this.authService.loginConGoogle()
      .then(cred => {
        this.procesarUsuarioAutenticado(cred);
        return cred;
      });
  }

  // Login con GitHub
  loginConGitHub(): Promise<UserCredential> {
    return this.authService.loginConGitHub()
      .then(cred => {
        this.procesarUsuarioAutenticado(cred);
        return cred;
      });
  }

  // Registro de usuario
  registrar(email: string, password: string, nombre: string): Promise<UserCredential> {
    return this.authService.registrar(email, password, nombre)
      .then(cred => {
        this.procesarUsuarioAutenticado(cred);
        return cred;
      });
  }

  // Métodos heredados (mantener compatibilidad)
  loginUsuario(usuario: string) {
    this.setUsuario(usuario);
  }

  agregarUID(uid: string) {
    this.setUid(uid);
  }

  logoutUsuario(): Promise<void> {
    return this.authService.logout().then(() => {
      this.setUsuario('');
      this.setUid('');
    });
  }

  // Método para verificar y sincronizar estado actual
  verificarEstadoAutenticacion(): void {
    this.authService.getAuthState().subscribe(user => {
      if (user) {
        const nombreUsuario = user.displayName || user.email || 'Usuario';
        this.setUsuario(nombreUsuario);
        this.setUid(user.uid);
      } else {
        this.setUsuario('');
        this.setUid('');
      }
    });
  }
}