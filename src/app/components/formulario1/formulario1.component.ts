import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-formulario1',
  imports: [FormsModule,MatButtonModule],
  templateUrl: './formulario1.component.html',
  styleUrl: './formulario1.component.css'
})
export class Formulario1Component {
  nombre: string = '';
  email: string = '';
  asunto: string = '';
  mensaje: string = '';
  //contacto: string [] = [];
  @Output() enviarFormulario = new EventEmitter<{nombre: string, email: string, asunto: string, mensaje: string}>();

  nombreTocado = false;
  emailTocado = false;
  asuntoTocado = false;
  mensajeTocado = false;

  enviar() {
    // Marcar todos los campos como tocados para validar al enviar
    this.nombreTocado = true;
    this.emailTocado = true;
    this.asuntoTocado = true;
    this.mensajeTocado = true;
    
    if (this.formularioInvalido()) {
      return; // No hace nada si el formulario no es válido
    }
    //this.contacto.push(this.nombre, this.email, this.asunto, this.mensaje);
    this.enviarFormulario.emit({
      nombre: this.nombre,
      email: this.email,
      asunto: this.asunto,
      mensaje: this.mensaje
    });
    this.nombre = '';
    this.email = '';
    this.asunto = '';
    this.mensaje = '';
    
    // Resetear estados de campos tocados
    this.nombreTocado = false;
    this.emailTocado = false;
    this.asuntoTocado = false;
    this.mensajeTocado = false;
  }
  
  formularioInvalido(): boolean {
    return (
      !this.nombre || this.nombre.trim().length < 5 ||
      !this.email || !this.email.includes('@') ||
      !this.asunto || this.asunto.trim().length < 10 ||
      !this.mensaje || this.mensaje.trim().length < 20
    );
  }
}