import { Component, signal, OnInit, OnDestroy, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarritoService } from '../../../servicio/carrito/carrito.service';
import { PaypalService } from '../../../servicio/paypal/paypal.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-carrito-flotante',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carrito-flotante.component.html',
  styles: [`
    .transform {
      transform: translateX(0);
    }
    
    @keyframes slideIn {
      from { transform: translateX(100%); }
      to { transform: translateX(0); }
    }
    
    .animate-slideIn {
      animation: slideIn 0.3s ease-out;
    }
  `]
})
export class CarritoFlotanteComponent implements OnInit, OnDestroy {
  // Inyección de dependencias moderna
  private readonly carritoService = inject(CarritoService);
  private readonly paypalService = inject(PaypalService);

  // Signals y computed properties
  mostrarCarrito = signal(false);
  paypalCargado = false;

  // Computed properties para optimizar el template
  tieneItems = computed(() => this.carritoService.tieneItems());
  totalItems = computed(() => this.carritoService.totalItems());
  itemsCarrito = computed(() => this.carritoService.itemsCarrito());
  totalPrecio = computed(() => this.carritoService.totalPrecio());

  private pagoSubscription?: Subscription;

  ngOnInit() {
    this.cargarPayPalScript();
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
      this.resetPayPal();
    }
  }

  cerrarCarrito() {
    this.mostrarCarrito.set(false);
    this.resetPayPal();
  }

  eliminarItem(id: string) {
    this.carritoService.eliminarItem(id);
    this.resetPayPal();
  }

  limpiarCarrito() {
    this.carritoService.limpiarCarrito();
    this.resetPayPal();
  }

  private resetPayPal() {
    this.paypalCargado = false;
    const container = document.getElementById('paypal-button-container');
    if (container) container.innerHTML = '';
  }

  private async cargarPayPalScript() {
    try {
      await this.paypalService.loadPayPalScript();
    } catch (error) {
      console.error('Error cargando PayPal SDK:', error);
    }
  }

  async inicializarPayPal() {
    if (this.paypalCargado || !this.tieneItems()) return;

    try {
      await this.paypalService.loadPayPalScript();
      
      const container = document.getElementById('paypal-button-container');
      if (container) container.innerHTML = '';

      this.paypalService.createPayPalButtons(
        'paypal-button-container',
        this.totalPrecio(),
        this.itemsCarrito()
      );
      
      this.paypalCargado = true;
    } catch (error) {
      console.error('Error inicializando PayPal:', error);
      alert('Error al cargar PayPal. Inténtalo de nuevo.');
    }
  }

  private pagoExitoso() {
    setTimeout(() => {
      this.limpiarCarrito();
      this.cerrarCarrito();
    }, 2000);
  }
}