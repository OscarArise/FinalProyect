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

    console.log('Correo:', correo);
    console.log('Mensaje:', mensaje);

    this.toggleFormulario();
    alert('Correo enviado con éxito');
  }
}