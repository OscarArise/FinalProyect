import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

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
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {
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
      alert('Por favor completa todos los campos');
      return;
    }

    if (mensaje.length < 10) {
      alert('El mensaje debe tener al menos 10 caracteres');
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
          alert('¡Correo enviado con éxito! Te responderemos pronto.');
          
          // Limpiar el formulario
          form.reset();
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
          
          alert(mensajeError);
          this.enviandoCorreo = false;
        }
      });
  }
}