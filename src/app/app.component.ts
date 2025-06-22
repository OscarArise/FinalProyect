import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { InicioComponent } from './components/inicio/inicio/inicio.component';
import { FooterComponent } from "./components/footer/footer.component";
import { HeaderComponent } from "./components/header/header.component";
import { SuscripcionComponent } from './components/suscripcion/suscripcion.component';
import { CarritoFlotanteComponent } from '../app/components/carrito-flotante/carrito-flotante/carrito-flotante.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet, 
    NavbarComponent, 
    RouterModule, 
    InicioComponent, 
    HeaderComponent, 
    FooterComponent, 
    SuscripcionComponent,
    CarritoFlotanteComponent
  ],
  template: `<router-outlet />
             <app-carrito-flotante></app-carrito-flotante>`,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Gym';
}
