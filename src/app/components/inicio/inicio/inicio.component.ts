import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Formulario1Component } from '../../formulario1/formulario1.component';
import Swal from 'sweetalert2';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCardModule } from '@angular/material/card';
import { DomSanitizerPipe } from '../../../dom-sanitizer.pipe';
import { MatIconModule } from '@angular/material/icon';
import { ContactoService } from '../../../servicio/firebase/contacto.service';
import { Contacto } from '../../../servicio/firebase/contacto.service';

interface Slide {
  src: string;
  alt: string;
}

interface Plan {
  nombre: string;
  descripcion: string;
  precio: number;
  duracion: string;
}

@Component({
  selector: 'app-inicio',
  standalone: true,
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css'],
  imports: [FormsModule, Formulario1Component, MatSlideToggleModule, MatCardModule, DomSanitizerPipe,MatIconModule]
})
export class InicioComponent implements OnInit, OnDestroy {


  indiceActual: number = 0;
  slides: Slide[] = [
    { src: 'car1.jpg', alt: 'Gimnasio Eter Gym' },
    { src: 'mapa.jpg', alt: 'Equipos de Entrenamiento' },
    { src: 'eter.jpg', alt: 'Clases Personalizadas' }
  ];
  video:string = 'tUykoP30Gb0?si=uNxmgT-d8vfMca5d';

  planes: Plan[] = [];
  mostrarPlanes: boolean = false;
  mostrarFormulario: boolean = true;
  intervaloCarrusel: any = null;

  constructor(
    private http: HttpClient,
    private contactoService: ContactoService
  ) {}

  ngOnInit() {
    this.obtenerPlanes();
    this.iniciarCarruselAutomatico();
  }

  ngOnDestroy() {
    this.detenerCarruselAutomatico();
  }

  iniciarCarruselAutomatico() {
    this.intervaloCarrusel = setInterval(() => {
      this.siguiente();
    }, 3000); // Cambia cada 3 segundos
  }

  detenerCarruselAutomatico() {
    if (this.intervaloCarrusel) {
      clearInterval(this.intervaloCarrusel);
      this.intervaloCarrusel = null;
    }
  }

  reiniciarCarruselAutomatico() {
    this.detenerCarruselAutomatico();
    this.iniciarCarruselAutomatico();
  }

  anterior() {
    if (this.slides.length > 0) {
      this.indiceActual = (this.indiceActual - 1 + this.slides.length) % this.slides.length;
      this.reiniciarCarruselAutomatico(); // Reinicia el timer cuando se navega manualmente
    }
  }

  siguiente() {
    if (this.slides.length > 0) {
      this.indiceActual = (this.indiceActual + 1) % this.slides.length;
    }
  }

  obtenerPlanes() {
    this.http.get<Plan[]>('planes.json').subscribe({
      next: (data) => {
        this.planes = data;
        this.mostrarPlanes = true;
      },
      error: (error) => {
        console.error('Error al cargar planes:', error);
        // Cargar datos de respaldo en caso de error
        const planesRespaldo: Plan[] = [
          {
            "nombre": "Plan Básico",
            "descripcion": "Acceso a todas las áreas del gimnasio.",
            "precio": 500,
            "duracion": "1 Mes"
          },
          {
            "nombre": "Plan Premium",
            "descripcion": "Acceso a clases personalizadas y áreas exclusivas.",
            "precio": 900,
            "duracion": "1 Mes"
          },
          {
            "nombre": "Plan Anual",
            "descripcion": "Acceso completo todo el año, con beneficios adicionales.",
            "precio": 9000,
            "duracion": "12 Meses"
          }
        ];
        this.planes = planesRespaldo;
        this.mostrarPlanes = true;
      }
    });
  }

  guardarEnLocalStorage(indice: number) {
    if (this.planes && this.planes[indice - 1]) {
      const plan = this.planes[indice - 1];
      const planSeleccionado = {
        nombre: plan.nombre,
        descripcion: plan.descripcion,
        precio: plan.precio.toString(),
        duracion: plan.duracion
      };
      localStorage.setItem('planSeleccionado', JSON.stringify(planSeleccionado));

      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Plan seleccionado!",
        showConfirmButton: false,
        timer: 1500
      });
    }
  }

  agregarMensaje(datos: any) {
    const contacto: Contacto = {
      nombre: datos.nombre,
      email: datos.email,
      asunto: datos.asunto,
      mensaje: datos.mensaje,
      usuarioId: datos.uid
    };
    this.contactoService.crearContacto(contacto).subscribe();

    Swal.fire({
      position: "center",
      icon: "success",
      title: "Formulario enviado con éxito!",
      showConfirmButton: false,
      timer: 1000
    });
  }
}