import { Injectable, signal, computed } from '@angular/core';

export interface ItemCarrito {
  id: string;
  tipo: 'suscripcion' | 'clase';
  nombre: string;
  precio: number;
  descripcion?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private items = signal<ItemCarrito[]>([]);
  
  // Señales computadas
  itemsCarrito = this.items.asReadonly();
  totalItems = computed(() => this.items().length);
  totalPrecio = computed(() => 
    this.items().reduce((total, item) => total + item.precio, 0)
  );
  tieneItems = computed(() => this.items().length > 0);
  tieneSuscripcion = computed(() => 
    this.items().some(item => item.tipo === 'suscripcion')
  );

  constructor() { }

  agregarItem(item: ItemCarrito): { success: boolean; message: string } {
    const itemsActuales = this.items();
    
    // Verificar si ya existe el item
    if (itemsActuales.some(i => i.id === item.id)) {
      return { success: false, message: 'Este item ya está en el carrito' };
    }

    // Si es suscripción y ya hay una, no permitir
    if (item.tipo === 'suscripcion' && this.tieneSuscripcion()) {
      return { success: false, message: 'Solo puedes tener una suscripción en el carrito' };
    }

    this.items.update(items => [...items, item]);
    return { success: true, message: 'Item agregado al carrito' };
  }

  eliminarItem(id: string): void {
    this.items.update(items => items.filter(item => item.id !== id));
  }

  limpiarCarrito(): void {
    this.items.set([]);
  }

  estaEnCarrito(id: string): boolean {
    return this.items().some(item => item.id === id);
  }

  // Método para verificar si un botón debe estar bloqueado
  estaBotonBloqueado(id: string, tipo: 'suscripcion' | 'clase'): boolean {
    if (tipo === 'suscripcion' && this.tieneSuscripcion()) {
      return !this.estaEnCarrito(id);
    }
    return this.estaEnCarrito(id);
  }

  // Obtener mensaje de estado para un botón
  getMensajeBoton(id: string, tipo: 'suscripcion' | 'clase'): string {
    if (this.estaEnCarrito(id)) {
      return 'En Carrito';
    }
    
    if (tipo === 'suscripcion' && this.tieneSuscripcion()) {
      return 'Bloqueado';
    }
    
    return 'Suscribirse';
  }
}