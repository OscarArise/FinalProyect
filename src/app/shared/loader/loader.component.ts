
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderService } from './loader.service';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="overlay" *ngIf="isLoading">
      <div class="spinner"></div>
    </div>
  `,
  styles: [`
    .overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.3);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .spinner {
      border: 12px solid #eee;
      border-top: 12px solid #1976d2;
      border-radius: 50%;
      width: 64px;
      height: 64px;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})

export class LoaderComponent {
  constructor(private loaderService: LoaderService) {}

  get isLoading() {
    return this.loaderService.isLoading();
  }
}

