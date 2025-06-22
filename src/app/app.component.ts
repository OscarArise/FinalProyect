import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { InicioComponent } from './components/inicio/inicio/inicio.component';
import { FooterComponent } from "./components/footer/footer.component";
import { HeaderComponent } from "./components/header/header.component";
import { SuscripcionComponent } from './components/suscripcion/suscripcion.component';
import { LoaderComponent } from "./shared/loader/loader.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, RouterModule, InicioComponent, HeaderComponent, FooterComponent, SuscripcionComponent, LoaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Gym';
  leyendo=false;
   DEFAULT_FONT_SIZE = 15;
  fontSize = this.DEFAULT_FONT_SIZE;

increase() {
  console.log('Aumentando fuente');
  this.fontSize = this.fontSize * 1.2;
  document.body.style.fontSize = `${this.fontSize}px`;
}

  decrease() {
      console.log('disminuye');

    this.fontSize = this.fontSize * 0.8;
    document.body.style.fontSize = `${this.fontSize}px`;
  }

  reset() {
      console.log('resetea');
    this.fontSize = this.DEFAULT_FONT_SIZE;
    document.body.style.fontSize = `${this.fontSize}px`;
  }
  contraste(){
    console.log('contraste');
      document.body.classList.toggle('contraste-activo');

  }


  leerTexto(texto: string) {
 
  if ('speechSynthesis' in window) {
    if (!this.leyendo) {
      // Comenzar a leer
      const texto = document.body.innerText;
      const msg = new SpeechSynthesisUtterance(texto);
      msg.lang = 'es-MX';
      window.speechSynthesis.speak(msg);

      this.leyendo = true;

      // Cuando termina de leer, vuelve a poner leyendo en false
      msg.onend = () => {
        this.leyendo = false;
      };
      msg.onerror = () => {
        this.leyendo = false;
      };
    } else {
      // Detener la lectura
      window.speechSynthesis.cancel();
      this.leyendo = false;
    }
  } else {
    alert('Tu navegador no soporta lectura de pantalla');
  }

}
}


