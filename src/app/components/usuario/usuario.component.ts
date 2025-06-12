import { Component, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './usuario.component.html',
  styleUrl: './usuario.component.css'
})
export class UsuarioComponent implements OnInit {

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

  constructor(
    private cuentasService: CuentasService,
    private usuarioEstadoService: UsuarioEstadoService,
    private contactoService: ContactoService,
    private solicitudesService: SolicitudesService,
    private router: Router,
    private autenticationService: AutenticacionService
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
    console.log('Usuario actual:', this.usuarioActual);
    console.log('UID actual:', this.uidActual);
  }

  cargarDatos() {
    if (!this.usuarioActual) return;
    // Cargar mensajes de contacto del usuario autenticado
    this.contactoService.obtenerContactosPorUsuario(this.uidActual).subscribe({
      next: (contactos) => this.mensajesContacto = contactos,
      error: () => this.mensajesContacto = []
    });
    // Cargar solicitudes del usuario autenticado
    this.solicitudesService.obtenerSolicitudesPorUsuario(this.uidActual).subscribe({
      next: (solicitudes) => this.suscripciones = solicitudes,
      error: () => this.suscripciones = []
    });
    console.log('Datos cargados:', this.mensajesContacto);
    console.log('Suscripciones cargadas:', this.suscripciones);
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
    if (this.bloqueado) return;
    this.usuarioEstadoService.login(this.usuario.username, this.usuario.password)
      .then(() => {
        this.loginUsuario = true;
        this.intentosFallidos = 0;
        this.cargarDatos();
      })
      .catch(() => {
        this.intentosFallidos++;
        if (this.intentosFallidos >= 3) {
          this.bloqueado = true;
          Swal.fire('Bloqueado', 'Demasiados intentos fallidos. Debes restablecer tu contraseña.', 'warning');
        } else {
          Swal.fire('Error', 'Usuario o contraseña incorrectos', 'error');
        }
      });
  }


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
    this.router.navigate(['/usuario']);
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
}
