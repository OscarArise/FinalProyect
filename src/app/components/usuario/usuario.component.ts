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

  // ViewChild para acceder al componente reCAPTCHA
  @ViewChild('recaptchaRef', { static: false }) recaptchaRef!: RecaptchaComponent;

  // Propiedad para manejar la visibilidad del formulario de registro
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

  // Variable para almacenar el token de reCAPTCHA
  siteKey: string = '6LdmEF8rAAAAAJ9l5E5LY8-SWxtk7Js4LoTHd_zV';
  captchaToken: string = '';

  constructor(
    private cuentasService: CuentasService,
    private usuarioEstadoService: UsuarioEstadoService,
    private contactoService: ContactoService,
    private solicitudesService: SolicitudesService,
    private router: Router,
    private autenticationService: AutenticacionService,
    private http: HttpClient
  ) {}

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
  }

  // Método que se llama cuando el reCAPTCHA v2 es resuelto
  resolvedCaptcha(captchaResponse: string | null): void {
    console.log("Respuesta del reCAPTCHA:", captchaResponse); // Debug
    if (captchaResponse) {
      this.captchaToken = captchaResponse;
      console.log("Token guardado:", this.captchaToken); // Debug
    } else {
      this.captchaToken = '';
      console.log("reCAPTCHA no fue resuelto o fue limpiado.");
    }
  }

  // Método para limpiar el reCAPTCHA
  private resetCaptcha(): void {
    this.captchaToken = '';
    if (this.recaptchaRef) {
      this.recaptchaRef.reset();
    }
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

  // Login con verificación de reCAPTCHA v2
  login(): void {
    if (this.bloqueado) return;

    // Debug: verificar el estado del token
    console.log("Token al momento del login:", this.captchaToken);
    console.log("Token vacío?", !this.captchaToken);

    // Verificación más estricta del token
    if (!this.captchaToken || this.captchaToken.trim() === '') {
      Swal.fire({
        icon: 'error',
        title: 'reCAPTCHA requerido',
        text: 'Por favor completa el reCAPTCHA para continuar',
        confirmButtonText: 'OK'
      });
      return;
    }

    const formData = {
      username: this.usuario.username,
      password: this.usuario.password,
      recaptchaToken: this.captchaToken,
    };

    this.http.post('http://localhost:3000/api/login', formData).subscribe({
      next: (response) => {
        console.log("Login exitoso:", response);
        this.loginUsuario = true;
        this.intentosFallidos = 0;
        this.resetCaptcha(); // Limpiar reCAPTCHA después del login exitoso
        this.cargarDatos();
        Swal.fire('¡Bienvenido!', 'Has iniciado sesión correctamente.', 'success');
      },
      error: (error) => {
        console.error("Error en login:", error);
        this.resetCaptcha(); // Limpiar reCAPTCHA después del error
        this.intentosFallidos++;
        if (this.intentosFallidos >= 3) {
          this.bloqueado = true;
          Swal.fire('Bloqueado', 'Demasiados intentos fallidos. Debes restablecer tu contraseña.', 'warning');
        } else {
          Swal.fire('Error', 'Usuario o contraseña incorrectos', 'error');
        }
      }
    });
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

    // Verificación más estricta del token para registro
    if (!this.captchaToken || this.captchaToken.trim() === '') {
      Swal.fire({
        icon: 'error',
        title: 'reCAPTCHA requerido',
        text: 'Por favor completa el reCAPTCHA para continuar con el registro',
        confirmButtonText: 'OK'
      });
      return;
    }

    const formData = {
      nombre: this.nuevoUsuario.nombre,
      email: this.nuevoUsuario.email,
      password: this.nuevoUsuario.password,
      recaptchaToken: this.captchaToken,
    };

    this.http.post('http://localhost:3000/api/register', formData).subscribe({
      next: (response) => {
        console.log("Registro exitoso:", response);
        Swal.fire('¡Registrado!', 'Usuario creado correctamente. Ahora puedes iniciar sesión.', 'success');
        this.nuevoUsuario = { nombre: '', email: '', password: '', confirmarPassword: '' };
        this.resetCaptcha(); // Limpiar reCAPTCHA después del registro exitoso
        this.mostrarRegistro = false; // Ocultar formulario de registro
      },
      error: (error) => {
        console.error("Error en registro:", error);
        this.resetCaptcha(); // Limpiar reCAPTCHA después del error
        Swal.fire('Error', error.error?.message || 'Error al registrar usuario', 'error');
      }
    });
  }

  // Restablecer contraseña
  cambiarPassword(): void {
    if (!this.resetForm.email) {
      Swal.fire('Error', 'El correo es obligatorio.', 'error');
      return;
    }
    this.autenticationService.resetPassword(this.resetForm.email)
      .then(() => {
        Swal.fire('Éxito', 'Se envió un correo para restablecer tu contraseña. Sigue las instrucciones y luego inicia sesión.', 'success');
        this.bloqueado = false;
        this.intentosFallidos = 0;
        this.resetForm = { email: '' };
      })
      .catch(err => {
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
    this.resetCaptcha(); // Limpiar reCAPTCHA al hacer logout
    this.router.navigate(['/usuario']);
  }

  // Método para alternar la visibilidad del formulario de registro
  toggleRegistro(): void {
    this.mostrarRegistro = !this.mostrarRegistro;
    if (this.mostrarRegistro) {
      this.resetCaptcha(); // Limpiar reCAPTCHA al cambiar de formulario
    }
  }
}