import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-pwa-install',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  template: `
    @if (showInstallButton && isAndroid) {
      <div class="fixed bottom-20 right-5 z-50">
        <button 
          (click)="installPwa()"
          class="bg-[#C9B243] hover:bg-yellow-400 text-black p-4 rounded-full shadow-lg transition-all duration-300 flex items-center gap-2">
          <mat-icon>get_app</mat-icon>
          <span class="hidden sm:inline">Instalar App</span>
        </button>
      </div>
    }
    
    @if (showInstallPrompt && isAndroid) {
      <div class="fixed top-0 left-0 w-full bg-[#C9B243] text-black p-3 z-50 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <mat-icon>info</mat-icon>
          <span class="text-sm">¡Instala Imperio Gym en tu Android!</span>
        </div>
        <div class="flex gap-2">
          <button (click)="installPwa()" class="bg-black text-[#C9B243] px-3 py-1 rounded text-sm">
            Instalar
          </button>
          <button (click)="dismissPrompt()" class="border border-black px-3 py-1 rounded text-sm">
            Cerrar
          </button>
        </div>
      </div>
    }
  `
})
export class PwaInstallComponent implements OnInit {
  showInstallButton = false;
  showInstallPrompt = false;
  isAndroid = false;
  private deferredPrompt: any;

  constructor(private snackBar: MatSnackBar) {}

  ngOnInit() {
    // Detectar si es Android
    this.isAndroid = /Android/i.test(navigator.userAgent);
    
    // Solo mostrar en Android
    if (!this.isAndroid) return;

    // Escuchar el evento beforeinstallprompt (solo en Android Chrome)
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallButton = true;
      
      // Mostrar prompt después de 5 segundos si no se ha instalado
      setTimeout(() => {
        if (this.deferredPrompt) {
          this.showInstallPrompt = true;
        }
      }, 5000);
    });

    // Escuchar cuando la app se instala
    window.addEventListener('appinstalled', () => {
      this.showInstallButton = false;
      this.showInstallPrompt = false;
      this.snackBar.open('¡Imperio Gym instalado correctamente!', 'Cerrar', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    });

    // Verificar si ya está instalada
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.showInstallButton = false;
      this.showInstallPrompt = false;
    }
  }

  async installPwa() {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('Usuario instaló la PWA en Android');
      } else {
        console.log('Usuario canceló la instalación');
      }
      
      this.deferredPrompt = null;
      this.showInstallButton = false;
      this.showInstallPrompt = false;
    } else {
      // Fallback para Android sin soporte nativo
      this.snackBar.open(
        'Para instalar: Menú del navegador > "Añadir a pantalla de inicio"', 
        'Entendido', 
        { duration: 5000 }
      );
    }
  }

  dismissPrompt() {
    this.showInstallPrompt = false;
  }
}