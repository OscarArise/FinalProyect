import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, UserCredential, updateProfile, sendPasswordResetEmail, setPersistence, browserLocalPersistence, GithubAuthProvider, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';
import { NgZone } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AutenticacionService {

  private recaptchaVerifier?: RecaptchaVerifier;
  private confirmationResult?: ConfirmationResult;

  constructor(private auth: Auth, private ngZone: NgZone) {}

  // Establecer persistencia de la sesión
  setPersistence(): Promise<void> {
    return setPersistence(this.auth, browserLocalPersistence)
      .then(() => {
        console.log("Persistencia de sesión configurada como 'local'.");
      })
      .catch((error) => {
        console.error("Error al configurar persistencia", error);
      });
  }


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
    // Limpiar reCAPTCHA al cerrar sesión
    this.limpiarRecaptcha();
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

  loginConGoogle(): Promise<UserCredential> {
    const provider = new GoogleAuthProvider();
    return this.ngZone.runOutsideAngular(() =>
      signInWithPopup(this.auth, provider)
        .then(user => this.ngZone.run(() => user))
    );
  }

   // Iniciar sesión con GitHub
  loginConGitHub(): Promise<UserCredential> {
    const provider = new GithubAuthProvider();
    return this.ngZone.runOutsideAngular(() =>
      signInWithPopup(this.auth, provider)
        .then((userCredential) => this.ngZone.run(() => userCredential))
    );
  }
  
  // Inicializar reCAPTCHA para autenticación telefónica
  initRecaptcha(): void {
    // Limpiar cualquier instancia anterior
    this.limpiarRecaptcha();
    
    // Crear nueva instancia
    this.recaptchaVerifier = new RecaptchaVerifier(this.auth, 'recaptcha-container', {
      size: 'invisible',
      callback: () => {
        console.log('reCAPTCHA resuelto para teléfono');
      },
      'expired-callback': () => {
        console.log('reCAPTCHA expirado');
        // Limpiar cuando expire
        this.limpiarRecaptcha();
      }
    });
  }

  // Enviar código SMS al número de teléfono
  enviarCodigoTelefono(numeroTelefono: string): Promise<void> {
    // Asegurarse de que el reCAPTCHA esté inicializado correctamente
    this.initRecaptcha();
    
    if (!this.recaptchaVerifier) {
      throw new Error('reCAPTCHA no inicializado');
    }

    return signInWithPhoneNumber(this.auth, numeroTelefono, this.recaptchaVerifier)
      .then((confirmationResult) => {
        this.confirmationResult = confirmationResult;
        console.log('Código SMS enviado');
      })
      .catch((error) => {
        console.error('Error al enviar código SMS:', error);
        // Limpiar en caso de error
        this.limpiarRecaptcha();
        throw error;
      });
  }

  // Verificar el código SMS ingresado por el usuario
  verificarCodigo(codigo: string): Promise<UserCredential> {
    if (!this.confirmationResult) {
      throw new Error('No hay confirmación pendiente');
    }

    return this.confirmationResult.confirm(codigo)
      .then((userCredential) => {
        console.log('Usuario autenticado con teléfono:', userCredential);
        // Limpiar después de verificación exitosa
        this.limpiarRecaptcha();
        return userCredential;
      })
      .catch((error) => {
        console.error('Error al verificar código:', error);
        // Limpiar en caso de error
        this.limpiarRecaptcha();
        throw error;
      });
  }

  // Limpiar reCAPTCHA
  limpiarRecaptcha(): void {
    if (this.recaptchaVerifier) {
      try {
        this.recaptchaVerifier.clear();
      } catch (error) {
        console.warn('Error al limpiar reCAPTCHA:', error);
      }
      this.recaptchaVerifier = undefined;
    }
    this.confirmationResult = undefined;
  }

}
