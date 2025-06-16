import { Component, OnInit, ViewChild } from '@angular/core';
import { Usuario } from '../../servicio/usuario';
import { CuentasService } from '../../servicio/cuentas.service';
import { UsuarioEstadoService } from '../../servicio/estado/usuario-estado.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ContactoService, Contacto } from '../../servicio/firebase/contacto.service';
import { SolicitudesService, Solicitud } from '../../servicio/firebase/solicitudes.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { AutenticacionService } from '../../servicio/firebase/auth/autenticacion.service';
import { HttpClient } from '@angular/common/http';
import { RecaptchaModule, RecaptchaComponent } from 'ng-recaptcha';

@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [FormsModule, CommonModule, RecaptchaModule],
  templateUrl: './usuario.component.html',
  styleUrls: ['./usuario.component.css']
})
export class UsuarioComponent implements OnInit {

  @ViewChild('recaptchaRef', { static: false }) recaptchaRef!: RecaptchaComponent;

  mostrarRegistro: boolean = false;

  usuario: Usuario = {
    username: '',
    password: '',
    nombre: '',
  };

  loginUsuario: boolean = false;
  usuarioActual: string = '';
  uidActual: string = '';

  mensajesContacto: Contacto[] = [];
  suscripciones: Solicitud[] = [];
  editandoContacto: number | null = null;
  editandoSuscripcion: number | null = null;
  contactoEditado: Contacto = {} as Contacto;
  suscripcionEditada: Solicitud = {} as Solicitud;

  nuevoUsuario = {
    nombre: '',
    email: '',
    password: '',
    confirmarPassword: ''
  };

  intentosFallidos = 0;
  bloqueado = false;
  resetForm = { email: '' };

  siteKey: string = '6LdmEF8rAAAAAJ9l5E5LY8-SWxtk7Js4LoTHd_zV';
  captchaToken: string = '';

  mostrarAlertCaptcha: boolean = false;

  constructor(
    private cuentasService: CuentasService,
    private usuarioEstadoService: UsuarioEstadoService,
    private contactoService: ContactoService,
    private solicitudesService: SolicitudesService,
    private router: Router,
    private autenticationService: AutenticacionService,
    private http: HttpClient
  ) {
    this.usuarioEstadoService.usuario$.subscribe(usuario => {
      this.usuarioActual = usuario;
    });
    this.usuarioEstadoService.uid$.subscribe(uid => {
      this.uidActual = uid;
    });
  }

  ngOnInit(): void {
    this.usuarioEstadoService.usuario$.subscribe(usuario => {
      this.usuarioActual = usuario;
      if (this.usuarioActual) {
        const usuarioObj = this.cuentasService.getUsuario(this.usuarioActual);
        if (usuarioObj) {
          this.usuario.username = usuarioObj.username;
          this.usuario.nombre = usuarioObj.nombre;
          this.loginUsuario = true;
        }
        this.cargarDatos();
      }
    });
    this.usuarioEstadoService.uid$.subscribe(uid => {
      this.uidActual = uid;
    });
  }

  cargarDatos() {
    if (!this.usuarioActual) return;
    this.contactoService.obtenerContactosPorUsuario(this.uidActual).subscribe({
      next: (contactos) => this.mensajesContacto = contactos,
      error: () => this.mensajesContacto = []
    });
    this.solicitudesService.obtenerSolicitudesPorUsuario(this.uidActual).subscribe({
      next: (solicitudes) => this.suscripciones = solicitudes,
      error: () => this.suscripciones = []
    });
    console.log('DATOS CARGADOS de la funcion cargarDatos');
    console.log('Datos cargados:', this.mensajesContacto);
    console.log('Suscripciones cargadas:', this.suscripciones);
  }

  resolvedCaptcha(captchaResponse: string | null): void {
    console.log("Respuesta del reCAPTCHA:", captchaResponse);
    
    if (captchaResponse && captchaResponse.trim() !== '') {
      this.captchaToken = captchaResponse;
      this.mostrarAlertCaptcha = false;
      console.log("Token guardado:", this.captchaToken);
    } else {
      this.captchaToken = '';
      console.log("reCAPTCHA no fue resuelto o fue limpiado.");
    }
  }

  private resetCaptcha(): void {
    this.captchaToken = '';
    this.mostrarAlertCaptcha = false;
    if (this.recaptchaRef) {
      try {
        this.recaptchaRef.reset();
        console.log("reCAPTCHA reiniciado");
      } catch (error) {
        console.log("Error al reiniciar reCAPTCHA:", error);
      }
    }
  }

  private mostrarAlertCaptchaBootstrap(): void {
    this.mostrarAlertCaptcha = true;
    setTimeout(() => {
      this.mostrarAlertCaptcha = false;
    }, 5000);
  }

  cerrarAlertCaptcha(): void {
    this.mostrarAlertCaptcha = false;
  }

  eliminarContacto(idx: number) {
    const contacto = this.mensajesContacto[idx];
    if (contacto && contacto.id) {
      this.contactoService.eliminarContacto(contacto.id).subscribe({
        next: () => {
          this.mensajesContacto.splice(idx, 1);
          Swal.fire('Eliminado', 'El mensaje de contacto fue eliminado.', 'success');
        },
        error: () => Swal.fire('Error', 'No se pudo eliminar el mensaje.', 'error')
      });
    }
  }

  eliminarSuscripcion(idx: number) {
    const suscripcion = this.suscripciones[idx];
    if (suscripcion && suscripcion.id) {
      this.solicitudesService.eliminarSolicitud(suscripcion.id).subscribe({
        next: () => {
          this.suscripciones.splice(idx, 1);
          Swal.fire('Eliminado', 'La suscripción fue eliminada.', 'success');
        },
        error: () => Swal.fire('Error', 'No se pudo eliminar la suscripción.', 'error')
      });
    }
  }

  editarContacto(idx: number) {
    this.editandoContacto = idx;
    this.contactoEditado = { ...this.mensajesContacto[idx] };
  }

  guardarContacto(idx: number) {
    const contacto = this.mensajesContacto[idx];
    if (contacto && contacto.id) {
      this.contactoService.editarContacto(contacto.id, this.contactoEditado).subscribe({
        next: () => {
          this.mensajesContacto[idx] = { ...this.contactoEditado };
          this.editandoContacto = null;
          Swal.fire('Actualizado', 'El mensaje de contacto fue actualizado.', 'success');
        },
        error: () => Swal.fire('Error', 'No se pudo actualizar el mensaje.', 'error')
      });
    }
  }

  cancelarEdicionContacto() {
    this.editandoContacto = null;
  }

  editarSuscripcion(idx: number) {
    this.editandoSuscripcion = idx;
    this.suscripcionEditada = { ...this.suscripciones[idx] };
  }

  guardarSuscripcion(idx: number) {
    const suscripcion = this.suscripciones[idx];
    if (suscripcion && suscripcion.id) {
      this.solicitudesService.editarSolicitud(suscripcion.id, this.suscripcionEditada).subscribe({
        next: () => {
          this.suscripciones[idx] = { ...this.suscripcionEditada };
          this.editandoSuscripcion = null;
          Swal.fire('Actualizado', 'La suscripción fue actualizada.', 'success');
        },
        error: () => Swal.fire('Error', 'No se pudo actualizar la suscripción.', 'error')
      });
    }
  }

  cancelarEdicionSuscripcion() {
    this.editandoSuscripcion = null;
  }

  login(): void {
    /*this.usuarioEstadoService.usuario$.subscribe(usuario => {
      this.usuarioActual = usuario;
    });
    this.usuarioEstadoService.uid$.subscribe(uid => {
      this.uidActual = uid;
    });*/
    if (this.bloqueado) {
      Swal.fire({
        icon: 'warning',
        title: 'Cuenta bloqueada',
        text: 'Tu cuenta está bloqueada. Debes restablecer tu contraseña.',
        confirmButtonText: 'OK'
      });
      return;
    }

    const camposLlenos = this.usuario.username.trim() !== '' && this.usuario.password.trim() !== '';
    const captchaLleno = this.captchaToken && this.captchaToken.trim() !== '';

    if (!camposLlenos && !captchaLleno) {
      Swal.fire({
        icon: 'warning',
        title: 'Faltan datos',
        text: 'Por favor llena los campos requeridos y resuelve el reCAPTCHA.',
        confirmButtonText: 'OK'
      });
      return;
    }

    if (!camposLlenos && captchaLleno) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor completa todos los campos antes de continuar.',
        confirmButtonText: 'OK'
      });
      return;
    }

    if (camposLlenos && !captchaLleno) {
      this.mostrarAlertCaptchaBootstrap();
      return;
    }

    const formData = {
      username: this.usuario.username.trim(),
      password: this.usuario.password,
      recaptchaToken: this.captchaToken,
    };

    Swal.fire({
      title: 'Iniciando sesión...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.http.post('http://localhost:3000/api/login', formData).subscribe({
      next: (response) => {
        console.log("Login exitoso:", response);
        Swal.close();
        
        this.loginUsuario = true;
        this.intentosFallidos = 0;
        this.usuarioEstadoService.login(this.usuario.username, this.usuario.password)
        .then(() => {
          this.loginUsuario = true;
          this.cargarDatos();
        })
        this.resetCaptcha();

        console.log("SON LSO DATOS DE USUARIO EN EL HTTP POST DENTRO DEL LOGIN");
        console.log("Usuario logueado:", this.usuario.username);
        console.log("UID actual:", this.uidActual);
        console.log("Datos de usuario:", this.usuario.nombre);
        
        Swal.fire({
          icon: 'success',
          title: '¡Bienvenido!',
          text: 'Has iniciado sesión correctamente.',
          confirmButtonText: 'OK'
        });
      },
      error: (error) => {
        console.error("Error en login:", error);
        Swal.close();
        this.resetCaptcha();
        this.intentosFallidos++;
        
        if (this.intentosFallidos >= 3) {
          this.bloqueado = true;
          Swal.fire({
            icon: 'warning',
            title: 'Cuenta bloqueada',
            text: 'Demasiados intentos fallidos. Debes restablecer tu contraseña.',
            confirmButtonText: 'OK'
          });
        } else {
          const intentosRestantes = 3 - this.intentosFallidos;
          Swal.fire({
            icon: 'error',
            title: 'Error de autenticación',
            text: `Usuario o contraseña incorrectos. Te quedan ${intentosRestantes} intento(s).`,
            confirmButtonText: 'OK'
          });
        }
      }
      
    });

    console.log('ESTOS SON LOS DATOS DEL USUARIO AL INICIAR SESION, AL FINAL DE LA FUNCION LOGIN');

    console.log('Usuario actual:', this.usuarioActual);
    console.log('UID actual:', this.uidActual);
  }

  registrar(): void {
    if (!this.nuevoUsuario.nombre || this.nuevoUsuario.nombre.trim() === '') {
      Swal.fire('Error', 'El nombre completo es obligatorio.', 'error');
      return;
    }

    if (!this.nuevoUsuario.email || this.nuevoUsuario.email.trim() === '') {
      Swal.fire('Error', 'El correo electrónico es obligatorio.', 'error');
      return;
    }

    if (!this.nuevoUsuario.password || this.nuevoUsuario.password.trim() === '') {
      Swal.fire('Error', 'La contraseña es obligatoria.', 'error');
      return;
    }

    if (!this.nuevoUsuario.confirmarPassword || this.nuevoUsuario.confirmarPassword.trim() === '') {
      Swal.fire('Error', 'Debes confirmar tu contraseña.', 'error');
      return;
    }

    if (this.nuevoUsuario.password !== this.nuevoUsuario.confirmarPassword) {
      Swal.fire('Error', 'Las contraseñas no coinciden.', 'error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.nuevoUsuario.email)) {
      Swal.fire('Error', 'Por favor ingresa un correo electrónico válido.', 'error');
      return;
    }

    if (!this.captchaToken || this.captchaToken.trim() === '') {
      this.mostrarAlertCaptchaBootstrap();
      return;
    }

    const formData = {
      nombre: this.nuevoUsuario.nombre,
      email: this.nuevoUsuario.email,
      password: this.nuevoUsuario.password,
      recaptchaToken: this.captchaToken,
    };

    Swal.fire({
      title: 'Registrando usuario...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.http.post('http://localhost:3000/api/register', formData).subscribe({
      next: (response) => {
        console.log("Registro exitoso:", response);
        Swal.close();
        
        Swal.fire('¡Registrado!', 'Usuario creado correctamente. Ahora puedes iniciar sesión.', 'success');
        this.nuevoUsuario = { nombre: '', email: '', password: '', confirmarPassword: '' };
        this.resetCaptcha();
        this.mostrarRegistro = false;
      },
      error: (error) => {
        console.error("Error en registro:", error);
        Swal.close();
        this.resetCaptcha();
        Swal.fire('Error', error.error?.message || 'Error al registrar usuario', 'error');
      }
    });
  }

  cambiarPassword(): void {
    if (!this.resetForm.email) {
      Swal.fire('Error', 'El correo es obligatorio.', 'error');
      return;
    }
    
    Swal.fire({
      title: 'Enviando correo...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.autenticationService.resetPassword(this.resetForm.email)
      .then(() => {
        Swal.close();
        Swal.fire('Éxito', 'Se envió un correo para restablecer tu contraseña. Sigue las instrucciones y luego inicia sesión.', 'success');
        this.bloqueado = false;
        this.intentosFallidos = 0;
        this.resetForm = { email: '' };
      })
      .catch(err => {
        Swal.close();
        Swal.fire('Error', err.message, 'error');
      });
  }

  logout(): void {
    this.usuarioEstadoService.logoutUsuario();
    this.loginUsuario = false;
    this.usuario.username = '';
    this.usuario.password = '';
    this.usuario.nombre = '';
    this.mensajesContacto = [];
    this.suscripciones = [];
    this.resetCaptcha();
    this.router.navigate(['/usuario']);
  }

  toggleRegistro(): void {
    this.mostrarRegistro = !this.mostrarRegistro;
    this.resetCaptcha();
  }

 loginConGoogle(): void {
  this.autenticationService.loginConGoogle()
    .then(cred => {
      this.loginUsuario = true;
      this.usuarioActual = cred.user?.email ?? '';
      this.usuario.username = this.usuarioActual;
      this.uidActual = cred.user?.uid ?? '';
      this.usuarioEstadoService.loginUsuario(this.usuarioActual);
      this.usuarioEstadoService.agregarUID(this.uidActual);
      Swal.fire('¡Bienvenido!', `Sesión iniciada como ${this.usuarioActual}`, 'success');
    })
    .catch(err => {
      console.error('Error en login con Google:', err);
      Swal.fire('Error', 'No se pudo iniciar sesión con Google', 'error');
    });
  }

  loginConGitHub(): void {
  this.autenticationService.loginConGitHub()
    .then(cred => {
      // Establece la sesión del usuario en el estado global
      this.loginUsuario = true;
      this.usuarioActual = cred.user?.email ?? '';
      this.usuario.username = this.usuarioActual;
      this.uidActual = cred.user?.uid ?? '';
      
      // Actualiza el estado global del usuario (por ejemplo, con un servicio como usuarioEstadoService)
      this.usuarioEstadoService.loginUsuario(this.usuarioActual);  // Actualiza el nombre del usuario
      this.usuarioEstadoService.agregarUID(this.uidActual);  // Guarda el UID en el estado

      // Muestra un mensaje de bienvenida al usuario
      Swal.fire('¡Bienvenido!', `Sesión iniciada como ${this.usuarioActual}`, 'success');

      // Carga los datos del usuario después de iniciar sesión
      this.cargarDatos();
    })
    .catch(err => {
      console.error('Error en login con GitHub:', err);
      Swal.fire('Error', 'No se pudo iniciar sesión con GitHub', 'error');
    });
}



}
