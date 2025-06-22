import { Injectable, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { NotificationService } from '../notificacion/notification.service';

declare global {
  interface Window {
    paypal: any;
  }
}

interface PayPalItem {
  nombre: string;
  descripcion?: string;
  tipo: string;
  precio: number;
}

interface PaymentResult {
  transactionId: string;
  items: PayPalItem[];
  amount: number;
  details: any;
}

@Injectable({
  providedIn: 'root'
})
export class PaypalService {
  
  private readonly notificationService = inject(NotificationService);
  
  private readonly clientId = 'AcuGipsCD1yhKvik5a7AP7BgUbSCP6dhdE0rF-T_OdOIx0atZinXDwEdHZXP3CkBlRH6DntEpKIhfeSW';
  private readonly currency = 'USD';
  
  // Subject para notificar pagos exitosos
  private readonly pagoExitosoSubject = new Subject<PaymentResult>();
  public readonly pagoExitoso$ = this.pagoExitosoSubject.asObservable();

  async loadPayPalScript(): Promise<void> {
    if (window.paypal) return;

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${this.clientId}&currency=${this.currency}`;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('PayPal SDK no se pudo cargar'));
      document.head.appendChild(script);
    });
  }

  createPayPalButtons(containerId: string, amount: number, items: PayPalItem[]): void {
    if (!window.paypal) {
      console.error('PayPal SDK no está cargado');
      return;
    }

    const paypalItems = this.preparePayPalItems(items);
    const itemTotal = this.calculateItemTotal(items);

    window.paypal.Buttons({
      style: {
        layout: 'vertical',
        color: 'blue',
        shape: 'rect',
        label: 'paypal',
        height: 40
      },
      createOrder: (data: any, actions: any) => this.createOrder(actions, amount, itemTotal, items, paypalItems),
      onApprove: (data: any, actions: any) => this.handleApproval(actions, items, amount),
      onError: (err: any) => this.handleError(err),
      onCancel: (data: any) => this.handleCancel(data)
    }).render(`#${containerId}`);
  }

  private preparePayPalItems(items: PayPalItem[]) {
    return items.map(item => ({
      name: item.nombre,
      description: item.descripcion || `${item.tipo} - ${item.nombre}`,
      unit_amount: {
        currency_code: this.currency,
        value: item.precio.toFixed(2)
      },
      quantity: '1',
      category: item.tipo === 'suscripcion' ? 'DIGITAL_GOODS' : 'PHYSICAL_GOODS'
    }));
  }

  private calculateItemTotal(items: PayPalItem[]): number {
    return items.reduce((total, item) => total + item.precio, 0);
  }

  private createOrder(actions: any, amount: number, itemTotal: number, items: PayPalItem[], paypalItems: any[]) {
    return actions.order.create({
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: 'default',
        description: `Compra en Gym App - ${items.length} item(s)`,
        amount: {
          currency_code: this.currency,
          value: amount.toFixed(2),
          breakdown: {
            item_total: {
              currency_code: this.currency,
              value: itemTotal.toFixed(2)
            }
          }
        },
        items: paypalItems
      }]
    });
  }

  private handleApproval(actions: any, items: PayPalItem[], amount: number) {
    return actions.order.capture().then((details: any) => {
      console.log('Pago completado:', details);
      
      this.pagoExitosoSubject.next({
        transactionId: details.id,
        items,
        amount,
        details
      });
    });
  }

  private handleError(err: any): void {
    console.error('Error en el pago:', err);
    
    this.notificationService.showError({
      title: 'Error en el pago',
      text: 'Error al procesar el pago. Por favor, inténtalo de nuevo.'
    });
  }

  private handleCancel(data: any): void {
    console.log('Pago cancelado:', data);
    
    this.notificationService.showInfo({
      title: 'Pago cancelado',
      text: 'El pago fue cancelado por el usuario.'
    });
  }
}