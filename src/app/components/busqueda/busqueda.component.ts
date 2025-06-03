import { Component } from '@angular/core';
import { BusquedaService } from '../../servicio/busqueda/busqueda.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-busqueda',
  imports: [],
  templateUrl: './busqueda.component.html',
  styleUrl: './busqueda.component.css'
})
export class BusquedaComponent {

  nombreEjercicio: string = '';
  indiceEjercicio: number = 0;
  miEjercicio: any = null;

  redirectTo() {
    this.router.navigate(['/suscripcion']);
  }

  constructor(private busquedaService: BusquedaService, private activatedRoute: ActivatedRoute, private router: Router) { 
  this.activatedRoute.params.subscribe(params => {
    this.nombreEjercicio = params['nombreEjercicio'];
    // Espera a que los ejercicios estén cargados
    const checkData = () => {
      if (this.busquedaService.ejercicios.length > 0) {
        this.indiceEjercicio = this.busquedaService.buscarIndex(this.nombreEjercicio);
        this.miEjercicio = this.busquedaService.getUnEjercicio(this.nombreEjercicio);
      } else {
        setTimeout(checkData, 100); 
      }
    };
    checkData();
  });
}
}
