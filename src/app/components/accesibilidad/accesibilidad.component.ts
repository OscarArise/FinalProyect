import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AccesibilidadService, AccesibilidadState } from '../../servicio/accesibilidad/accesibilidad.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-accesibilidad',
  standalone: true,
  imports: [CommonModule, NgClass, MatIconModule],
  templateUrl: './accesibilidad.component.html',
  styleUrls: ['./accesibilidad.component.css']
})
export class AccesibilidadComponent implements OnInit, OnDestroy {
  menuAbierto = false;
  estado: AccesibilidadState = {
    fonteDislexia: false,
    tamanoTexto: 16,
    modoNoche: 'normal', // Fixed: Now matches the service interface
    leyendoPantalla: false
  };
  mostrarIndicador = false;
  private subscription?: Subscription;

  constructor(private accesibilidadService: AccesibilidadService) {}

  ngOnInit(): void {
    // Suscribirse a los cambios del estado
    this.subscription = this.accesibilidadService.state$.subscribe(
      (estado: AccesibilidadState) => {
        this.estado = estado;
      }
    );
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  toggleFuenteDislexia() {
    this.accesibilidadService.toggleFuenteDislexia();
  }

  toggleModoNoche() {
    this.accesibilidadService.toggleModoNoche();
  }

  toggleLectorPantalla() {
    this.accesibilidadService.toggleLectorPantalla();
  }

  aumentarTexto() {
    this.accesibilidadService.aumentarTexto();
    this.mostrarIndicadorTexto();
  }

  disminuirTexto() {
    this.accesibilidadService.disminuirTexto();
    this.mostrarIndicadorTexto();
  }

  restablecerTodo() {
    this.accesibilidadService.restablecerTodo();
  }

  private mostrarIndicadorTexto() {
    this.mostrarIndicador = true;
    setTimeout(() => this.mostrarIndicador = false, 2000);
  }

  // Métodos helper para el template
  getModoNocheIcon(): string {
    switch (this.estado.modoNoche) {
      case 'dark':
        return 'light_mode';
      case 'light':
        return 'contrast';
      default:
        return 'dark_mode';
    }
  }

  getModoNocheTooltip(): string {
    switch (this.estado.modoNoche) {
      case 'dark':
        return 'Modo Contraste';
      case 'light':
        return 'Modo Normal';
      default:
        return 'Modo Noche';
    }
  }

  getModoNocheClass(): string {
    switch (this.estado.modoNoche) {
      case 'dark':
        return 'bg-blue-600 border-blue-600 text-white';
      case 'light':
        return 'bg-yellow-500 border-yellow-500 text-black';
      default:
        return 'bg-[#2a2a2a] text-white border-[#C9B243] hover:bg-[#C9B243] hover:text-white';
    }
  }
}