import { Component, EventEmitter, Output } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UsuarioEstadoService } from '../../servicio/estado/usuario-estado.service';


@Component({
  selector: 'app-header',
  imports: [MatToolbarModule, MatIconModule, MatButtonModule, MatMenuModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  @Output() actionSelected = new EventEmitter<string>();

  usuario: string = ''; // Aquí deberías obtener el usuario del servicio

  constructor(private router: Router,private usuarioEstadoService : UsuarioEstadoService) {}

ngOnInit() {
    this.usuarioEstadoService.usuario$.subscribe(usuario => {
      this.usuario = usuario;
    });
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  onActionSelected(action: string) {
    this.actionSelected.emit(action);
  }
}





