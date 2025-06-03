import { Component, Input} from '@angular/core';
import { UsuarioEstadoService } from '../../servicio/estado/usuario-estado.service';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-navbar',
  imports: [ RouterModule,MatIconModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

  usuario: string = '';

  constructor(private usuarioEstadoService : UsuarioEstadoService) { }

  ngOnInit() {
    this.usuarioEstadoService.usuario$.subscribe(usuario => {
      this.usuario = usuario;
    });
  }

}
