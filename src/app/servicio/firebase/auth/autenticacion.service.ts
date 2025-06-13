import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, UserCredential, updateProfile, sendPasswordResetEmail } from '@angular/fire/auth';
import { Observable, Observer } from 'rxjs';  // Asegúrate de importar Observable y Observer


@Injectable({
  providedIn: 'root'
})
export class AutenticacionService {

  constructor(private auth: Auth) {}

  // Registrar usuario y guardar nombre completo
  registrar(email: string, password: string, nombre: string): Promise<UserCredential> {
    return createUserWithEmailAndPassword(this.auth, email, password)
      .then((cred) => {
        if (cred.user) {
          return updateProfile(cred.user, { displayName: nombre }).then(() => cred);
        }
        return cred;
      });
  }

  // Iniciar sesión
  login(email: string, password: string): Promise<UserCredential> {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  // Cerrar sesión
  logout(): Promise<void> {
    return signOut(this.auth);
  }

  // Restablecer contraseña
  resetPassword(email: string): Promise<void> {
    return sendPasswordResetEmail(this.auth, email);
  }

   // Obtener el estado de autenticación (si el usuario está logueado)
  getAuthState(): Observable<any> {
    return new Observable(observer => {
      this.auth.onAuthStateChanged(user => {
        observer.next(user);  // Devuelve el usuario si está logueado
      });
    });
  }
}
