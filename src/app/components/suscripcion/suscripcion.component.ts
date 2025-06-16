import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { Formulario2Component } from '../formulario2/formulario2.component';
import Swal from 'sweetalert2';
import { EjerciciosService } from '../../servicio/ejercicio/ejercicios.service';
import { Router, RouterModule } from '@angular/router';
import { UsuarioEstadoService } from '../../servicio/estado/usuario-estado.service';

@Component({
  selector: 'app-suscripcion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Formulario2Component, FormsModule, RouterModule],
  templateUrl: './suscripcion.component.html'
})
export class SuscripcionComponent {
  clases: string[] = ['Yoga', 'Kickboxing', 'CrossFit', 'Pilates'];
  minFecha: string = new Date().toISOString().split('T')[0];
  suscripcionForm;
  datosParaFormulario2: any = null;
  uid: string = '';
  login: boolean = false;

  constructor(private fb: FormBuilder, private ejerciciosService: EjerciciosService, private router:Router,private usuarioEstadoService: UsuarioEstadoService) {
    this.suscripcionForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]{7,15}$')]],
      clase: ['', Validators.required],
      fecha: ['', Validators.required],
      publicidad: [false]
    });
  }

  enviar() {
    if (this.suscripcionForm.valid) {
      this.datosParaFormulario2 = this.suscripcionForm.value;
      console.log('Formulario enviado:', this.datosParaFormulario2);
      // Opcional: resetear el formulario
      this.suscripcionForm.reset({ publicidad: false });
      Swal.fire({
              position: "top-end",
              icon: "success",
              title: "Formulario enviado con éxito!",
              showConfirmButton: false,
              timer: 1500
            });
    }else {
      Swal.fire({
        position: "center",
        icon: "error",
        title: "Formulario incompleto o inválido",
        text: "Por favor, completa todos los campos requeridos.",
        showConfirmButton: true,
      });
    }
  }

  

  buscador: string = '';
  ejercicios: any[] = [];
  successRequest(data: any): void {
    console.log(data);
    this.ejercicios = data;
    console.log(this.ejercicios);
   }

  ngOnInit(): void {
    this.ejerciciosService.getEjercicios().subscribe({

      next: (data) => this.successRequest(data),
      error: (error) => { console.error('Error al obtener los ejercicios:', error);}

    });
    this.usuarioEstadoService.uid$.subscribe(uid => {
      this.uid = uid;
    });
    if (this.uid) {
      this.suscripcionForm.enable();
      this.login = true;
    }else {
      this.suscripcionForm.disable();
      this.login = false;
    }
  }

  buscarAdetalle( nombre: string): void {
    this.router.navigate(['/ejercicio', nombre]);
  }

  get ejerciciosFiltrados() {
    if (!this.buscador || !this.buscador.trim()) {
      return this.ejercicios;
    }
    const palabras = this.buscador.toLowerCase().split(' ').filter(Boolean);
    return this.ejercicios.filter((ej: any) => {
      const nombre = ej.name.toLowerCase();
      return palabras.every(palabra => nombre.includes(palabra));
    });
  }


}