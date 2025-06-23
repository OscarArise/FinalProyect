import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../servicio/notificacion/notification.service';

@Component({
  selector: 'app-conocenos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './conocenos.component.html',
  styleUrls: ['./conocenos.component.css'],
})
export class ConocenosComponent {
  indiceActual: number = 0;
  totalImagenes: number = 3;
  
  entrenadores: any[] = [];
  mostrarFormulario: boolean = false;
  enviandoCorreo: boolean = false;

  // URL base de tu API (ajusta según tu configuración)
  private apiUrl = 'https://nodedeploy-x272.onrender.com/api';

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService
  ) {
    this.obtenerEntrenadores();
  }

  anterior() {
    this.indiceActual = this.indiceActual > 0 ? this.indiceActual - 1 : this.totalImagenes - 1;
    this.moverCarrusel();
  }

  siguiente() {
    this.indiceActual = this.indiceActual < this.totalImagenes - 1 ? this.indiceActual + 1 : 0;
    this.moverCarrusel();
  }

  moverCarrusel() {
    const carrusel = document.getElementById('carrusel');
    if (carrusel) {
      const carruselWidth = carrusel.offsetWidth;
      const desplazamiento = this.indiceActual * carruselWidth;
      carrusel.style.transform = `translateX(-${desplazamiento}px)`;
    }
  }

  obtenerEntrenadores() {
    this.http.get<any[]>('entrenadores.json').subscribe((data) => {
      this.entrenadores = data;
    });
  }

  toggleFormulario() {
    this.mostrarFormulario = !this.mostrarFormulario;
  }

  enviarCorreo(event: Event) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const correo = (form.querySelector('input[type="email"]') as HTMLInputElement).value;
    const mensaje = (form.querySelector('textarea') as HTMLTextAreaElement).value;

    // Validación básica
    if (!correo || !mensaje) {
      this.notificationService.showError({
        title: 'Campos requeridos',
        text: 'Por favor completa todos los campos'
      });
      return;
    }

    if (mensaje.length < 10) {
      this.notificationService.showError({
        title: 'Mensaje muy corto',
        text: 'El mensaje debe tener al menos 10 caracteres'
      });
      return;
    }

    this.enviandoCorreo = true;

    // Preparar los datos para enviar
    const datosCorreo = {
      correo: correo,
      mensaje: mensaje
    };

    // Enviar el correo al servidor
    this.http.post(`${this.apiUrl}/mailer/enviar-contacto`, datosCorreo)
      .subscribe({
        next: (response: any) => {
          console.log('Respuesta del servidor:', response);
          
          this.notificationService.showSuccessWithCallback({
            title: '¡Éxito!',
            text: 'Correo enviado con éxito. Te responderemos pronto.',
            timer: 3000,
            timerProgressBar: true
          }).then(() => {
            // Limpiar el formulario después de que se cierre la notificación
            form.reset();
            this.mostrarFormulario = false; // Opcional: cerrar el formulario
          });
          
          this.enviandoCorreo = false;
        },
        error: (error) => {
          console.error('Error al enviar correo:', error);
          
          let mensajeError = 'Error al enviar el correo. ';
          if (error.error && error.error.errores) {
            mensajeError += error.error.errores.map((e: any) => e.msg).join(', ');
          } else if (error.error && error.error.error) {
            mensajeError += error.error.error;
          } else {
            mensajeError += 'Por favor intenta de nuevo más tarde.';
          }
          
          this.notificationService.showError({
            title: 'Error de envío',
            text: mensajeError
          });
          
          this.enviandoCorreo = false;
        }
      });
  }
}