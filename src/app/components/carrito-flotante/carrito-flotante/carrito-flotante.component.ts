import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarritoService } from '../../../servicio/carrito/carrito.service';
import { PaypalService } from '../../../servicio/paypal/paypal.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-carrito-flotante',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Botón flotante del carrito -->
    <div class="fixed bottom-6 right-6 z-50">
      <button 
        (click)="toggleCarrito()"
        class="relative bg-[#C9B243] hover:bg-[#a89b5a] text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl">
        
        <!-- Icono del carrito -->
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5.4M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2 2v0a2 2 0 012-2h6m4-9a2 2 0 100 4 2 2 0 000-4z"/>
        </svg>
        
        <!-- Punto rojo de notificación -->
        <div 
          *ngIf="carritoService.tieneItems()"
          class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold animate-pulse">
          {{ carritoService.totalItems() }}
        </div>
      </button>
    </div>

    <!-- Panel del carrito -->
    <div 
      *ngIf="mostrarCarrito()"
      class="fixed inset-0 z-40"
      (click)="cerrarCarrito()">
      
      <!-- Overlay -->
      <div class="fixed inset-0 bg-[#0000003f] transition-opacity duration-300"></div>
      
      <!-- Panel del carrito -->
      <div 
        class="fixed bottom-0 right-0 h-full w-full max-w-md bg-white shadow-xl transform transition-transform duration-300 ease-out"
        (click)="$event.stopPropagation()">
        
        <!-- Header del carrito -->
        <div class="bg-gradient-to-r from-[#C9B243] to-[#a89b5a] text-white p-6 flex justify-between items-center shadow-lg">
          <div>
            <h2 class="text-xl font-bold">Mi Carrito</h2>
            <p class="text-sm opacity-90">{{ carritoService.totalItems() }} artículo(s)</p>
          </div>
          <button 
            (click)="cerrarCarrito()"
            class="text-white hover:text-gray-200 hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-all duration-200">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Contenido del carrito -->
        <div class="flex flex-col h-full">
          
          <!-- Lista de items -->
          <div class="flex-1 overflow-y-auto p-4">
            <!-- Carrito vacío -->
            <div *ngIf="carritoService.totalItems() === 0" class="text-center text-gray-500 mt-16">
              <div class="bg-gray-100 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-700 mb-2">Tu carrito está vacío</h3>
              <p class="text-gray-500">Agrega algunos productos para continuar</p>
            </div>

            <!-- Items del carrito -->
            <div class="space-y-4">
              <div *ngFor="let item of carritoService.itemsCarrito(); let i = index" 
                   class="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                
                <div class="flex justify-between items-start">
                  <div class="flex-1">
                    <h3 class="font-semibold text-gray-800 text-lg mb-2">{{ item.nombre }}</h3>
                    
                    <!-- Badge del tipo -->
                    <div class="mb-3">
                      <span 
                        [class]="item.tipo === 'suscripcion' ? 'bg-[#C9B243] text-white' : 'bg-[#C9B243] text-white'"
                        class="inline-block px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide">
                        {{ item.tipo }}
                      </span>
                    </div>
                    
                    <p *ngIf="item.descripcion" class="text-sm text-gray-600 leading-relaxed">
                      {{ item.descripcion }}
                    </p>
                  </div>
                  
                  <div class="text-right ml-4 flex flex-col items-end">
                    <p class="font-bold text-xl text-[#C9B243] mb-3">\${{ item.precio }}</p>
                    <button 
                      (click)="eliminarItem(item.id)"
                      class="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition-all duration-200">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer con total y botón de pago -->
          <div *ngIf="carritoService.tieneItems()" class="border-t bg-gradient-to-r from-gray-50 to-gray-100 p-6 space-y-4">
            
            <!-- Total -->
            <div class="bg-white rounded-lg p-4 shadow-sm">
              <div class="flex justify-between items-center">
                <span class="text-lg font-semibold text-gray-700">Total:</span>
                <span class="text-2xl font-bold text-[#C9B243]">\${{ carritoService.totalPrecio() }}</span>
              </div>
              <p class="text-sm text-gray-500 mt-1">{{ carritoService.totalItems() }} artículo(s) en total</p>
            </div>

            <!-- Contenedor de PayPal -->
            <div class="space-y-3">
              <div id="paypal-button-container" class="w-full min-h-[40px]"></div>
              
              <!-- Botón para inicializar PayPal -->
              <button 
                *ngIf="!paypalCargado"
                (click)="inicializarPayPal()"
                class="w-full bg-gradient-to-r from-[#C9B243] to-[#C9B243] hover:from-[#C9B243] hover:to-[#8f7f30] text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg">
                <svg class="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
                Proceder al Pago
              </button>
            </div>

            <!-- Botón limpiar carrito -->
            <button 
              (click)="limpiarCarrito()"
              class="w-full bg-gray-400 hover:bg-gray-500 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200">
              <svg class="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
              Limpiar Carrito
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .transform {
      transform: translateX(0);
    }
    
    @keyframes slideIn {
      from {
        transform: translateX(100%);
      }
      to {
        transform: translateX(0);
      }
    }
    
    .animate-slideIn {
      animation: slideIn 0.3s ease-out;
    }
  `]
})
export class CarritoFlotanteComponent implements OnInit, OnDestroy {
  mostrarCarrito = signal(false);
  paypalCargado = false;
  private pagoSubscription?: Subscription;

  constructor(
    public carritoService: CarritoService,
    private paypalService: PaypalService
  ) {}

  ngOnInit() {
    this.cargarPayPalScript();
    
    // Suscribirse a pagos exitosos
    this.pagoSubscription = this.paypalService.pagoExitoso$.subscribe(() => {
      this.pagoExitoso();
    });
  }

  ngOnDestroy() {
    this.pagoSubscription?.unsubscribe();
  }

  toggleCarrito() {
    this.mostrarCarrito.update(valor => !valor);
    if (!this.mostrarCarrito()) {
      this.limpiarPayPal();
    }
  }

  cerrarCarrito() {
    this.mostrarCarrito.set(false);
    this.limpiarPayPal();
  }

  eliminarItem(id: string) {
    this.carritoService.eliminarItem(id);
    this.limpiarPayPal();
  }

  limpiarCarrito() {
    this.carritoService.limpiarCarrito();
    this.limpiarPayPal();
  }

  private limpiarPayPal() {
    this.paypalCargado = false;
    const container = document.getElementById('paypal-button-container');
    if (container) {
      container.innerHTML = '';
    }
  }

  async cargarPayPalScript() {
    try {
      await this.paypalService.loadPayPalScript();
    } catch (error) {
      console.error('Error cargando PayPal SDK:', error);
    }
  }

  async inicializarPayPal() {
    try {
      if (!this.paypalCargado && this.carritoService.tieneItems()) {
        await this.paypalService.loadPayPalScript();
        
        // Limpiar container previo
        const container = document.getElementById('paypal-button-container');
        if (container) {
          container.innerHTML = '';
        }

        this.paypalService.createPayPalButtons(
          'paypal-button-container',
          this.carritoService.totalPrecio(),
          this.carritoService.itemsCarrito()
        );
        
        this.paypalCargado = true;
      }
    } catch (error) {
      console.error('Error inicializando PayPal:', error);
      alert('Error al cargar PayPal. Inténtalo de nuevo.');
    }
  }

  private pagoExitoso() {
    // Limpiar carrito después de pago exitoso
    setTimeout(() => {
      this.limpiarCarrito();
      this.cerrarCarrito();
    }, 2000);
  }
}