import { Component, Input, SimpleChanges } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { SolicitudesService } from '../../servicio/firebase/solicitudes.service';
import { Solicitud } from '../../servicio/firebase/solicitudes.service';
import { UsuarioEstadoService } from '../../servicio/estado/usuario-estado.service';
import { CarritoService, ItemCarrito } from '../../servicio/carrito/carrito.service';

@Component({
  selector: 'app-formulario2',
  imports: [CommonModule],
  templateUrl: './formulario2.component.html',
  styleUrl: './formulario2.component.css',
  standalone: true
})
export class Formulario2Component {
  planes = [
    { 
      id: 'plan-basico',
      nombre: 'Plan Básico', 
      descripcion: 'Acceso a todas las máquinas', 
      precio: 30,
      precioTexto: '$30/mes' 
    },
    { 
      id: 'plan-premium',
      nombre: 'Plan Premium', 
      descripcion: 'Acceso a máquinas y clases especiales', 
      precio: 50,
      precioTexto: '$50/mes' 
    },
    { 
      id: 'plan-vip',
      nombre: 'Plan VIP', 
      descripcion: 'Acceso total más asesoría personalizada', 
      precio: 80,
      precioTexto: '$80/mes' 
    }
  ];
  
  clases: any[] = [];
  entrenadores: any[] = [];
  uid: string = '';
  estaLogueado: boolean = false;

  constructor(
    private http: HttpClient, 
    private solicitudService: SolicitudesService, 
    private usuarioEstadoService: UsuarioEstadoService,
    public carritoService: CarritoService
  ) {
    this.obtenerClases();
    this.obtenerEntrenadores();
  }

  obtenerClases() {
    this.http.get<any[]>('clases.json').subscribe(data => {
      this.clases = data.map((clase, index) => ({
        ...clase,
        id: `clase-${index}`,
        precio: 15, // Precio por clase individual
        tipo: 'clase'
      }));
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
      this.estaLogueado = uid !== '';
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

  agregarPlanAlCarrito(plan: any) {
    if (!this.estaLogueado) {
      alert('Debes iniciar sesión para agregar items al carrito');
      return;
    }

    const itemCarrito: ItemCarrito = {
      id: plan.id,
      tipo: 'suscripcion',
      nombre: plan.nombre,
      precio: plan.precio,
      descripcion: plan.descripcion
    };

    const agregado = this.carritoService.agregarItem(itemCarrito);
    if (!agregado) {
      if (this.carritoService.tieneSuscripcion()) {
        alert('Ya tienes una suscripción en el carrito. Elimínala primero para agregar otra.');
      } else {
        alert('Este item ya está en tu carrito.');
      }
    }
  }

  agregarClaseAlCarrito(clase: any) {
    if (!this.estaLogueado) {
      alert('Debes iniciar sesión para agregar items al carrito');
      return;
    }

    const itemCarrito: ItemCarrito = {
      id: clase.id,
      tipo: 'clase',
      nombre: clase.nombre,
      precio: clase.precio,
      descripcion: `${clase.horario} - ${clase.entrenadores.join(', ')}`
    };

    const agregado = this.carritoService.agregarItem(itemCarrito);
    if (!agregado) {
      alert('Esta clase ya está en tu carrito.');
    }
  }

  estaEnCarrito(id: string): boolean {
    return this.carritoService.estaEnCarrito(id);
  }

  puedeAgregarPlan(): boolean {
    return this.estaLogueado && !this.carritoService.tieneSuscripcion();
  }
}