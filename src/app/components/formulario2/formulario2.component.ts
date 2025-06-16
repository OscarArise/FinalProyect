import { Component, Input, SimpleChanges } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { SolicitudesService } from '../../servicio/firebase/solicitudes.service';
import { Solicitud } from '../../servicio/firebase/solicitudes.service';
import { UsuarioEstadoService } from '../../servicio/estado/usuario-estado.service';

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
  uid: string = '';

  constructor(private http: HttpClient, private solicitudService: SolicitudesService, private usuarioEstadoService: UsuarioEstadoService) {
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

  ngOnInit() {
    this.usuarioEstadoService.uid$.subscribe(uid => {
      this.uid = uid;
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['datosSuscripcion'] && this.datosSuscripcion) {
      this.guardarEnLocalStorage(this.datosSuscripcion);
    }
  }

  guardarEnLocalStorage(nuevaSuscripcion: any) {
    const solicitud: Solicitud = {
      nombre: nuevaSuscripcion.nombre,
      telefono: nuevaSuscripcion.telefono,
      claseSeleccionada: nuevaSuscripcion.clase,
      fecha: nuevaSuscripcion.fecha,
      publicidad: nuevaSuscripcion.publicidad,
      usuarioId: this.uid
    };
    this.solicitudService.crearSolicitud(solicitud).subscribe({
    next: (resp) => console.log('Solicitud creada:', resp),
    error: (err) => console.error('Error al crear solicitud:', err)
  });
  }
}
