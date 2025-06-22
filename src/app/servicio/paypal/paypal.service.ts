import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

declare global {
  interface Window {
    paypal: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class PaypalService {
  private clientId = 'AcuGipsCD1yhKvik5a7AP7BgUbSCP6dhdE0rF-T_OdOIx0atZinXDwEdHZXP3CkBlRH6DntEpKIhfeSW';
  
  // Subject para notificar cuando el pago es exitoso
  private pagoExitosoSubject = new Subject<any>();
  public pagoExitoso$ = this.pagoExitosoSubject.asObservable();

  constructor() { }

  loadPayPalScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.paypal) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${this.clientId}&currency=USD`;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('PayPal SDK no se pudo cargar'));
      document.head.appendChild(script);
    });
  }

  createPayPalButtons(containerId: string, amount: number, items: any[]): void {
    if (!window.paypal) {
      console.error('PayPal SDK no está cargado');
      return;
    }

    // Preparar items para PayPal
    const paypalItems = items.map(item => ({
      name: item.nombre,
      description: item.descripcion || `${item.tipo} - ${item.nombre}`,
      unit_amount: {
        currency_code: 'USD',
        value: item.precio.toFixed(2)
      },
      quantity: '1',
      category: item.tipo === 'suscripcion' ? 'DIGITAL_GOODS' : 'PHYSICAL_GOODS'
    }));

    // Calcular el total de los items
    const itemTotal = items.reduce((total, item) => total + item.precio, 0);

    window.paypal.Buttons({
      style: {
        layout: 'vertical',
        color: 'blue',
        shape: 'rect',
        label: 'paypal',
        height: 40
      },
      createOrder: (data: any, actions: any) => {
        return actions.order.create({
          intent: 'CAPTURE',
          purchase_units: [{
            reference_id: 'default',
            description: `Compra en Gym App - ${items.length} item(s)`,
            amount: {
              currency_code: 'USD',
              value: amount.toFixed(2),
              breakdown: {
                item_total: {
                  currency_code: 'USD',
                  value: itemTotal.toFixed(2)
                }
              }
            },
            items: paypalItems
          }]
        });
      },
      onApprove: (data: any, actions: any) => {
        return actions.order.capture().then((details: any) => {
          console.log('Pago completado:', details);
          
          // Emitir evento de pago exitoso
          this.pagoExitosoSubject.next({
            transactionId: details.id,
            items: items,
            amount: amount,
            details: details
          });
          
          alert(`¡Pago completado exitosamente!\nID de transacción: ${details.id}\n\n¡Gracias por tu compra!`);
        });
      },
      onError: (err: any) => {
        console.error('Error en el pago:', err);
        alert('Error al procesar el pago. Por favor, inténtalo de nuevo.');
      },
      onCancel: (data: any) => {
        console.log('Pago cancelado:', data);
        alert('Pago cancelado por el usuario.');
      }
    }).render(`#${containerId}`);
  }
}