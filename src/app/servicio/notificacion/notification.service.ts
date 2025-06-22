import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

export interface NotificationConfig {
  background?: string;
  color?: string;
  confirmButtonColor?: string;
  cancelButtonColor?: string;
}

export interface ConfirmDialogOptions {
  title: string;
  text: string;
  confirmText?: string;
  cancelText?: string;
  icon?: 'warning' | 'question' | 'info';
}

export interface MessageOptions {
  title: string;
  text: string;
  timer?: number;
  showConfirmButton?: boolean;
  timerProgressBar?: boolean;
  allowOutsideClick?: boolean;
  allowEscapeKey?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  
  private readonly defaultConfig: NotificationConfig = {
    background: '#1a1a1a',
    color: '#ffffff',
    confirmButtonColor: '#C9B243',
    cancelButtonColor: '#d33'
  };

  constructor() {}

  /**
   * Muestra un diálogo de confirmación
   */
  async showConfirmDialog(options: ConfirmDialogOptions): Promise<boolean> {
    const result = await Swal.fire({
      title: options.title,
      text: options.text,
      icon: options.icon || 'warning',
      showCancelButton: true,
      confirmButtonText: options.confirmText || 'Sí, confirmar',
      cancelButtonText: options.cancelText || 'Cancelar',
      ...this.defaultConfig
    });

    return result.isConfirmed;
  }

  /**
   * Muestra un mensaje de éxito
   */
  showSuccess(options: MessageOptions): void {
    Swal.fire({
      title: options.title,
      text: options.text,
      icon: 'success',
      timer: options.timer || 1500,
      showConfirmButton: options.showConfirmButton ?? false,
      timerProgressBar: options.timerProgressBar ?? false,
      allowOutsideClick: options.allowOutsideClick ?? true,
      allowEscapeKey: options.allowEscapeKey ?? true,
      ...this.defaultConfig
    });
  }

  /**
   * Muestra un mensaje de éxito con callback
   */
  showSuccessWithCallback(options: MessageOptions): Promise<any> {
    return Swal.fire({
      title: options.title,
      text: options.text,
      icon: 'success',
      timer: options.timer || 2000,
      timerProgressBar: options.timerProgressBar ?? true,
      showConfirmButton: options.showConfirmButton ?? false,
      allowOutsideClick: options.allowOutsideClick ?? false,
      allowEscapeKey: options.allowEscapeKey ?? false,
      ...this.defaultConfig
    });
  }

  /**
   * Muestra un mensaje de error
   */
  showError(options: MessageOptions): void {
    Swal.fire({
      title: options.title,
      text: options.text,
      icon: 'error',
      confirmButtonText: 'Entendido',
      showConfirmButton: options.showConfirmButton ?? true,
      ...this.defaultConfig
    });
  }

  /**
   * Muestra un mensaje de información
   */
  showInfo(options: MessageOptions): void {
    Swal.fire({
      title: options.title,
      text: options.text,
      icon: 'info',
      confirmButtonText: 'Entendido',
      showConfirmButton: options.showConfirmButton ?? true,
      ...this.defaultConfig
    });
  }

  /**
   * Muestra un mensaje de advertencia
   */
  showWarning(options: MessageOptions): void {
    Swal.fire({
      title: options.title,
      text: options.text,
      icon: 'warning',
      confirmButtonText: 'Entendido',
      showConfirmButton: options.showConfirmButton ?? true,
      ...this.defaultConfig
    });
  }

  /**
   * Muestra un loading/spinner
   */
  showLoading(title: string = 'Procesando...', text: string = 'Por favor espera'): void {
    Swal.fire({
      title: title,
      text: text,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
      ...this.defaultConfig
    });
  }

  /**
   * Muestra un toast notification
   */
  showToast(message: string, icon: 'success' | 'error' | 'warning' | 'info' = 'success'): void {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      },
      ...this.defaultConfig
    });

    Toast.fire({
      icon: icon,
      title: message
    });
  }

  /**
   * Cierra cualquier notificación activa
   */
  close(): void {
    Swal.close();
  }

  /**
   * Actualiza la configuración por defecto
   */
  updateConfig(config: Partial<NotificationConfig>): void {
    Object.assign(this.defaultConfig, config);
  }
}