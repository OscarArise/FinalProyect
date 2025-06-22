import { Component, signal, OnInit, OnDestroy, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

import { CarritoService } from '../../../servicio/carrito/carrito.service';
import { PaypalService } from '../../../servicio/paypal/paypal.service';
import { NotificationService } from '../../../servicio/notificacion/notification.service';

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
  private readonly notificationService = inject(NotificationService);

  // Signals y computed properties
  readonly mostrarCarrito = signal(false);
  paypalCargado = false;

  // Computed properties para optimizar el template
  readonly tieneItems = computed(() => this.carritoService.tieneItems());
  readonly totalItems = computed(() => this.carritoService.totalItems());
  readonly itemsCarrito = computed(() => this.carritoService.itemsCarrito());
  readonly totalPrecio = computed(() => this.carritoService.totalPrecio());

  private pagoSubscription?: Subscription;

  ngOnInit(): void {
    this.initializeComponent();
  }

  ngOnDestroy(): void {
    this.pagoSubscription?.unsubscribe();
  }

  toggleCarrito(): void {
    this.mostrarCarrito.update(valor => !valor);
    if (!this.mostrarCarrito()) {
      this.resetPayPal();
    }
  }

  cerrarCarrito(): void {
    this.mostrarCarrito.set(false);
    this.resetPayPal();
  }

  async eliminarItem(id: string): Promise<void> {
    const confirmed = await this.notificationService.showConfirmDialog({
      title: '¿Estás seguro?',
      text: 'Este item será eliminado del carrito',
      confirmText: 'Sí, eliminar'
    });

    if (confirmed) {
      this.carritoService.eliminarItem(id);
      this.resetPayPal();
      this.notificationService.showSuccess({
        title: 'Eliminado',
        text: 'El item ha sido eliminado del carrito'
      });
    }
  }

  async limpiarCarrito(): Promise<void> {
    const confirmed = await this.notificationService.showConfirmDialog({
      title: '¿Vaciar carrito?',
      text: 'Se eliminarán todos los items del carrito',
      confirmText: 'Sí, vaciar'
    });

    if (confirmed) {
      this.carritoService.limpiarCarrito();
      this.resetPayPal();
      this.notificationService.showSuccess({
        title: 'Carrito vaciado',
        text: 'Todos los items han sido eliminados'
      });
    }
  }

  async inicializarPayPal(): Promise<void> {
    if (this.paypalCargado || !this.tieneItems()) return;

    try {
      await this.paypalService.loadPayPalScript();
      this.setupPayPalButtons();
      this.paypalCargado = true;
    } catch (error) {
      console.error('Error inicializando PayPal:', error);
      this.notificationService.showError({
        title: 'Error de PayPal',
        text: 'Error al cargar PayPal. Inténtalo de nuevo.'
      });
    }
  }

  private async initializeComponent(): Promise<void> {
    await this.cargarPayPalScript();
    this.pagoSubscription = this.paypalService.pagoExitoso$.subscribe(() => {
      this.handlePaymentSuccess();
    });
  }

  private async cargarPayPalScript(): Promise<void> {
    try {
      await this.paypalService.loadPayPalScript();
    } catch (error) {
      console.error('Error cargando PayPal SDK:', error);
      this.notificationService.showError({
        title: 'Error',
        text: 'No se pudo cargar el sistema de pagos'
      });
    }
  }

  private setupPayPalButtons(): void {
    const container = document.getElementById('paypal-button-container');
    if (container) {
      container.innerHTML = '';
      this.paypalService.createPayPalButtons(
        'paypal-button-container',
        this.totalPrecio(),
        this.itemsCarrito()
      );
    }
  }

  private resetPayPal(): void {
    this.paypalCargado = false;
    const container = document.getElementById('paypal-button-container');
    if (container) container.innerHTML = '';
  }

  private async handlePaymentSuccess(): Promise<void> {
    this.notificationService.close();
    
    await this.notificationService.showSuccessWithCallback({
      title: '¡Pago Exitoso!',
      text: 'Tu pago se ha procesado correctamente. El carrito se vaciará automáticamente.',
      timer: 2000,
      timerProgressBar: true,
      allowOutsideClick: false,
      allowEscapeKey: false
    });

    this.limpiarCarritoSinConfirmacion();
    this.cerrarCarrito();
  }

  private limpiarCarritoSinConfirmacion(): void {
    this.carritoService.limpiarCarrito();
    this.resetPayPal();
  }
}