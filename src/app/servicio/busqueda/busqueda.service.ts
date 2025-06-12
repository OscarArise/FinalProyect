import { Injectable } from '@angular/core';
import { EjerciciosService } from '../ejercicio/ejercicios.service';

@Injectable({
  providedIn: 'root'
})
export class BusquedaService {

  buscador: string = '';
  ejercicios: any[] = [];

  constructor(private ejerciciosService: EjerciciosService) {
    this.ejerciciosService.getEjercicios().subscribe({
      next: (data) => this.successRequest(data),
      error: (error) => { console.error('Error al obtener los ejercicios:', error);}
    });
  }

  successRequest(data: any): void {
    this.ejercicios = data;
  }

  getUnEjercicio(nombre: string): any {
    return this.ejercicios.find(ejercicio => ejercicio.name === nombre);
  }

  buscarIndex(nombre: string): number {
    return this.ejercicios.findIndex(ejercicio => ejercicio.name === nombre);
  }
}
