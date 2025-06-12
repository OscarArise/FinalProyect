import { Component, Input, SimpleChanges } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-formulario2',
  imports: [ CommonModule],
  templateUrl: './formulario2.component.html',
  styleUrl: './formulario2.component.css',
  standalone: true
})
export class Formulario2Component {
  planes = [
    { nombre: 'Plan Básico', descripcion: 'Acceso a todas las máquinas', precio: '$30/mes' },
    { nombre: 'Plan Premium', descripcion: 'Acceso a máquinas y clases especiales', precio: '$50/mes' },
    { nombre: 'Plan VIP', descripcion: 'Acceso total más asesoría personalizada', precio: '$80/mes' }
  ];
  
  clases: any[] = [];
  entrenadores: any[] = [];

  constructor(private http: HttpClient) {
    this.obtenerClases();
    this.obtenerEntrenadores();
  }

  obtenerClases() {
    this.http.get<any[]>('clases.json').subscribe(data => {
      this.clases = data;
    });
  }

  obtenerEntrenadores() {
    this.http.get<any[]>('entrenadores.json').subscribe(data => {
      this.entrenadores = data;
    });
  }

  @Input() datosSuscripcion: any;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['datosSuscripcion'] && this.datosSuscripcion) {
      this.guardarEnLocalStorage(this.datosSuscripcion);
    }
  }

  guardarEnLocalStorage(nuevaSuscripcion: any) {
    const guardadas = localStorage.getItem('suscripciones');
    let array = guardadas ? JSON.parse(guardadas) : [];
    array.push(nuevaSuscripcion);
    localStorage.setItem('suscripciones', JSON.stringify(array));
  }
}
