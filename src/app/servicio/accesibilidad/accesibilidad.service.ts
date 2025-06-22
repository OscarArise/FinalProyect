// services/accesibilidad.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface AccesibilidadState {
  fonteDislexia: boolean;
  tamanoTexto: number;
  modoNoche: boolean;
  leyendoPantalla: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AccesibilidadService {
  private readonly TAMANO_TEXTO_DEFAULT = 16;
  private readonly TAMANO_TEXTO_MIN = 12;
  private readonly TAMANO_TEXTO_MAX = 24;

  private stateSubject = new BehaviorSubject<AccesibilidadState>({
    fonteDislexia: false,
    tamanoTexto: this.TAMANO_TEXTO_DEFAULT,
    modoNoche: false,
    leyendoPantalla: false
  });

  public state$ = this.stateSubject.asObservable();

  constructor() {
    // Cargar estado guardado al inicializar el servicio
    this.cargarEstadoGuardado();
  }

  get currentState(): AccesibilidadState {
    return this.stateSubject.value;
  }

  // Cambiar tipo de fuente para dislexia
  toggleFuenteDislexia(): void {
    const newState = {
      ...this.currentState,
      fonteDislexia: !this.currentState.fonteDislexia
    };
    
    // CORRECCIÓN: Usar la misma clase que en el componente
    if (newState.fonteDislexia) {
      document.body.classList.add('texto-dislexia');
    } else {
      document.body.classList.remove('texto-dislexia');
    }
    
    this.updateState(newState);
  }

  // Aumentar tamaño de texto
  aumentarTexto(): void {
    const nuevoTamano = Math.min(this.currentState.tamanoTexto + 2, this.TAMANO_TEXTO_MAX);
    const newState = { ...this.currentState, tamanoTexto: nuevoTamano };
    
    document.documentElement.style.fontSize = `${nuevoTamano}px`;
    this.updateState(newState);
  }

  // Disminuir tamaño de texto
  disminuirTexto(): void {
    const nuevoTamano = Math.max(this.currentState.tamanoTexto - 2, this.TAMANO_TEXTO_MIN);
    const newState = { ...this.currentState, tamanoTexto: nuevoTamano };
    
    document.documentElement.style.fontSize = `${nuevoTamano}px`;
    this.updateState(newState);
  }

  // Toggle modo noche/contraste
  toggleModoNoche(): void {
    const newState = {
      ...this.currentState,
      modoNoche: !this.currentState.modoNoche
    };
    
    // CORRECCIÓN: Usar la misma lógica que en el componente
    if (newState.modoNoche) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    this.updateState(newState);
  }

  // Lector de pantalla
  toggleLectorPantalla(): void {
    if (this.currentState.leyendoPantalla) {
      this.detenerLectura();
    } else {
      this.iniciarLectura();
    }
  }

  private iniciarLectura(): void {
    if ('speechSynthesis' in window) {
      const texto = this.obtenerTextoLegible();
      const utterance = new SpeechSynthesisUtterance(texto);
      
      utterance.lang = 'es-MX';
      utterance.rate = 0.8;

      utterance.onstart = () => {
        const newState = { ...this.currentState, leyendoPantalla: true };
        this.updateState(newState);
      };

      utterance.onend = () => {
        const newState = { ...this.currentState, leyendoPantalla: false };
        this.updateState(newState);
      };

      utterance.onerror = () => {
        const newState = { ...this.currentState, leyendoPantalla: false };
        this.updateState(newState);
      };

      window.speechSynthesis.speak(utterance);
    } else {
      alert('Tu navegador no soporta el lector de pantalla');
    }
  }

  private detenerLectura(): void {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const newState = { ...this.currentState, leyendoPantalla: false };
      this.updateState(newState);
    }
  }

  private obtenerTextoLegible(): string {
    // Solo elementos que contienen texto real
    const selectores = [
      'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 
      'article', 'section', 'main',
      'div', 'span', 'a', 'li', 'td', 'th', 'label'
    ];
    
    const elementos = document.querySelectorAll(selectores.join(', '));
    let textoCompleto = '';
    
    elementos.forEach(elemento => {
      // Excluir completamente elementos de iconos e imágenes
      if (elemento.classList.contains('material-icons') || 
          elemento.classList.contains('mat-icon') ||
          elemento.closest('.material-icons') ||
          elemento.closest('.mat-icon') ||
          elemento.tagName === 'IMG' ||
          elemento.querySelector('img')) {
        return;
      }

      // Excluir elementos que solo contienen iconos
      if (elemento.querySelector('.material-icons, .mat-icon')) {
        return;
      }

      const texto = elemento.textContent?.trim();
      
      // Solo procesar si el texto existe y tiene contenido real
      if (texto && 
          texto.length > 2 && // Mínimo 3 caracteres
          texto.length < 500 && // Máximo 500 caracteres por elemento
          // Debe contener al menos una letra
          /[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]/.test(texto) &&
          // No debe ser solo números
          !/^\d+$/.test(texto) &&
          // No debe ser solo símbolos
          !/^[^a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]+$/.test(texto) &&
          // No debe ser un nombre de archivo de imagen
          !/\.(jpg|jpeg|png|gif|svg|webp|bmp|ico)$/i.test(texto) &&
          // No debe ser texto técnico/código
          !texto.includes('undefined') &&
          !texto.includes('null') &&
          !texto.includes('NaN')) {
        
        // Limpiar y formatear el texto
        const textoLimpio = texto
          .replace(/[\n\r\t]+/g, ' ') // Saltos de línea a espacios
          .replace(/\s+/g, ' ') // Múltiples espacios a uno
          .replace(/[^\w\sáéíóúüñÁÉÍÓÚÜÑ.,;:!?¿¡()-]/g, '') // Quitar símbolos raros
          .trim();
        
        // Verificar que después de limpiar aún tenga contenido válido
        if (textoLimpio.length > 2 && /[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]/.test(textoLimpio)) {
          textoCompleto += textoLimpio + '. ';
        }
      }
    });
    
    return textoCompleto.trim() || 'No hay contenido para leer en esta página.';
  }

  private updateState(newState: AccesibilidadState): void {
    this.stateSubject.next(newState);
    // AGREGAR: Guardar el estado en localStorage
    this.guardarEstado(newState);
  }

  // AGREGAR: Método para cargar estado guardado
  private cargarEstadoGuardado(): void {
    const estadoGuardado = localStorage.getItem('estadoAccesibilidad');
    if (estadoGuardado) {
      try {
        const estado = JSON.parse(estadoGuardado);
        
        // Aplicar las configuraciones guardadas
        if (estado.fonteDislexia) {
          document.body.classList.add('texto-dislexia');
        }
        
        if (estado.modoNoche) {
          document.documentElement.classList.add('dark');
        }
        
        if (estado.tamanoTexto && estado.tamanoTexto !== this.TAMANO_TEXTO_DEFAULT) {
          document.documentElement.style.fontSize = `${estado.tamanoTexto}px`;
        }
        
        this.stateSubject.next(estado);
      } catch (error) {
        console.error('Error al cargar estado de accesibilidad:', error);
      }
    }
  }

  // AGREGAR: Método para guardar estado
  private guardarEstado(estado: AccesibilidadState): void {
    try {
      localStorage.setItem('estadoAccesibilidad', JSON.stringify(estado));
    } catch (error) {
      console.error('Error al guardar estado de accesibilidad:', error);
    }
  }

  // Restablecer toda la configuración
  restablecerTodo(): void {
    // CORRECCIÓN: Usar las mismas clases que en el componente
    document.body.classList.remove('texto-dislexia');
    document.documentElement.classList.remove('dark');
    document.documentElement.style.fontSize = `${this.TAMANO_TEXTO_DEFAULT}px`;
    
    if (this.currentState.leyendoPantalla) {
      this.detenerLectura();
    }

    const defaultState: AccesibilidadState = {
      fonteDislexia: false,
      tamanoTexto: this.TAMANO_TEXTO_DEFAULT,
      modoNoche: false,
      leyendoPantalla: false
    };

    this.updateState(defaultState);
  }
}