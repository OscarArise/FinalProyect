import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { InicioComponent } from './components/inicio/inicio/inicio.component';
import { FooterComponent } from "./components/footer/footer.component";
import { HeaderComponent } from "./components/header/header.component";
import { SuscripcionComponent } from './components/suscripcion/suscripcion.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, RouterModule, InicioComponent, HeaderComponent, FooterComponent, SuscripcionComponent],
  template: `<router-outlet />`,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Gym';
}
