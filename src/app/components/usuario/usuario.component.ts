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
import { ChartSolicitudesComponent } from '../chart-solicitudes/chart-solicitudes.component';

@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [FormsModule, CommonModule, RecaptchaModule, ChartSolicitudesComponent],
  templateUrl: './usuario.component.html',
  styleUrls: ['./usuario.component.css']
})
export class UsuarioComponent implements OnInit {

  @ViewChild('recaptchaLoginRef', { static: false }) recaptchaLoginRef?: RecaptchaComponent;
  @ViewChild('recaptchaRegistroRef', { static: false }) recaptchaRegistroRef?: RecaptchaComponent;

  mostrarRegistro: boolean = false;
  esAdmin: boolean = false;

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

  username: string = '';
  telefono: string = '';
  codigoSMS: string = '';
  mostrarCodigo: boolean = false;

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
    if (this.usuarioActual) {
      this.loginUsuario = true;
    }
    // Solo es admin si el username es exactamente 'admin'
    this.esAdmin = (this.usuario.username === 'admin');
  }

  ngOnInit(): void {
    this.usuarioEstadoService.usuario$.subscribe(usuario => {
      this.usuarioActual = usuario;
      if (this.usuarioActual) {
        const usuarioObj = this.cuentasService.getUsuario(this.usuarioActual);
        if (usuarioObj) {
          this.usuario.username = usuarioObj.username;
          this.usuario.nombre = usuarioObj.nombre;
        } else {
          this.usuario.username = this.usuarioActual;
        }
        this.loginUsuario = true;
        this.actualizarAdminYCargarDatos(); // SOLO AQUÍ
      }
    });
    this.usuarioEstadoService.uid$.subscribe(uid => {
      this.uidActual = uid;
    });
  }

  cargarDatos() {
    console.log('es admin en cargarDatos:', this.esAdmin);
    if (!this.usuarioActual) return;
    if (this.esAdmin === true) {
      this.contactoService.obtenerContactos().subscribe({
        next: (contactos) => {
          this.mensajesContacto = contactos;
          console.log('ADMIN - TODOS LOS CONTACTOS:', contactos);
        },
        error: () => this.mensajesContacto = []
      });
      this.solicitudesService.obtenerSolicitudes().subscribe({
        next: (solicitudes) => {
          this.suscripciones = solicitudes;
          console.log('ADMIN - TODAS LAS SOLICITUDES:', solicitudes);
        },
        error: () => this.suscripciones = []
      });
    } else {
      this.contactoService.obtenerContactosPorUsuario(this.uidActual).subscribe({
        next: (contactos) => {
          this.mensajesContacto = contactos;
          console.log('USUARIO - SOLO SUS CONTACTOS:', contactos);
          console.log('USUARIO uidActual:', this.uidActual);
        },
        error: () => this.mensajesContacto = []
      });
      this.solicitudesService.obtenerSolicitudesPorUsuario(this.uidActual).subscribe({
        next: (solicitudes) => {
          this.suscripciones = solicitudes;
          console.log('USUARIO - SOLO SUS SOLICITUDES:', solicitudes);
          console.log('USUARIO uidActual:', this.uidActual);
        },
        error: () => this.suscripciones = []
      });
    }
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
    console.log("funcion resetCaptcha llamada, token limpiado");

    // Reinicia el captcha correspondiente según el formulario activo
    if (!this.mostrarRegistro && this.recaptchaLoginRef) {
      this.recaptchaLoginRef.reset();
      console.log("reCAPTCHA de login reiniciado");
    }
    if (this.mostrarRegistro && this.recaptchaRegistroRef) {
      this.recaptchaRegistroRef.reset();
      console.log("reCAPTCHA de registro reiniciado");
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

    this.http.post('https://nodedeploy-x272.onrender.com/api/login', formData).subscribe({
      next: (response) => {
        this.usuarioEstadoService.login(this.usuario.username, this.usuario.password)
        .then(() => {
          this.loginUsuario = true;
          this.actualizarAdminYCargarDatos();
          Swal.fire({
            icon: 'success',
            title: '¡Bienvenido!',
            text: 'Has iniciado sesión correctamente.',
            confirmButtonText: 'OK'
          });
        })
        .catch(() => {
          Swal.fire('Error', 'Usuario o contraseña incorrectos', 'error');
          Swal.close();
          this.resetCaptcha();
          this.intentosFallidos++;
          console.log("Intentos fallidos:", this.intentosFallidos);
        
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
        });
        console.log("Login exitoso:", response);
        Swal.close();
        this.resetCaptcha();

        console.log("SON LSO DATOS DE USUARIO EN EL HTTP POST DENTRO DEL LOGIN");
        console.log("Usuario logueado:", this.usuario.username);
        console.log("UID actual:", this.uidActual);
        console.log("Datos de usuario:", this.usuario.nombre);
      },
      error: (error) => {
        console.error("Error en login:", error);
        Swal.close();
        this.resetCaptcha();
        
      }
      
    });

    console.log('ESTOS SON LOS DATOS DEL USUARIO AL INICIAR SESION, AL FINAL DE LA FUNCION LOGIN');

    console.log('Usuario actual:', this.usuarioActual);
    console.log('UID actual:', this.uidActual);
  }

registrar(): void {
    if (!this.nuevoUsuario.nombre || !this.nuevoUsuario.email || !this.nuevoUsuario.password || !this.nuevoUsuario.confirmarPassword) {
      Swal.fire('Error', 'Todos los campos son obligatorios.', 'error');
      return;
    }
    if (this.nuevoUsuario.password !== this.nuevoUsuario.confirmarPassword) {
      Swal.fire('Error', 'Las contraseñas no coinciden.', 'error');
      return;
    }
    this.autenticationService.registrar(
      this.nuevoUsuario.email,
      this.nuevoUsuario.password,
      this.nuevoUsuario.nombre
    )
      .then(() => {
        Swal.fire('¡Registrado!', 'Usuario creado correctamente. Ahora puedes iniciar sesión.', 'success');
        this.nuevoUsuario = { nombre: '', email: '', password: '', confirmarPassword: '' };
      })
      .catch(err => {
        Swal.fire('Error', err.message, 'error');
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
    this.usuarioActual = '';
    this.uidActual = '';
    this.esAdmin = false;
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

  private actualizarAdminYCargarDatos() {
    console.log('Actualizando admin y cargando datos...');
    console.log('es admin:', this.esAdmin);
    this.esAdmin = (this.usuario.username === 'admin');
    console.log('es admin actualizado:', this.esAdmin);
    this.cargarDatos();
  }

 loginConGoogle(): void {
  this.usuarioEstadoService.loginConGoogle()
    .then(cred => {
      this.loginUsuario = true;
      Swal.fire('¡Bienvenido!', `Sesión iniciada como ${cred.user?.displayName || cred.user?.email}`, 'success');
    })
    .catch(err => {
      console.error('Error en login con Google:', err);
      Swal.fire('Error', 'No se pudo iniciar sesión con Google', 'error');
    });
}
loginConGitHub(): void {
  this.usuarioEstadoService.loginConGitHub()
    .then(cred => {
      this.loginUsuario = true;
      Swal.fire('¡Bienvenido!', `Sesión iniciada como ${cred.user?.displayName || cred.user?.email}`, 'success');
    })
    .catch(err => {
      console.error('Error en login con GitHub:', err);
      Swal.fire('Error', 'No se pudo iniciar sesión con GitHub', 'error');
    });
}

  enviarCodigoTelefono() {
    this.autenticationService.initRecaptcha();
    this.autenticationService.enviarCodigoTelefono(this.telefono)
      .then(() => {
        this.mostrarCodigo = true;
        Swal.fire('Código enviado', 'Revisa tu SMS e ingresa el código.', 'info');
      })
      .catch(err => {
        Swal.fire('Error', err.message, 'error');
      });
  }

  verificarCodigoTelefono() {
    this.autenticationService.verificarCodigo(this.codigoSMS)
      .then(cred => {
        this.loginUsuario = true;
        this.usuario.username = cred.user?.phoneNumber ?? '';
        this.usuarioActual = this.usuario.username;
        this.uidActual = cred.user?.uid ?? '';
        this.usuarioEstadoService.loginUsuario(this.usuarioActual);
        this.usuarioEstadoService.agregarUID(this.uidActual);
        Swal.fire('¡Bienvenido!', `Sesión iniciada como ${this.usuarioActual}`, 'success');
        this.mostrarCodigo = false;
      })
      .catch(err => {
        Swal.fire('Error', err.message, 'error');
      });
  }



}
