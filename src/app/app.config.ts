import { ApplicationConfig, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http'; // <--- Cambiado aquí

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';

import { routes } from './app.routes';
import { environment } from '../environments/environment.development';

import { LoaderInterceptor } from './shared/loader/loader.interceptor';
import { provideServiceWorker } from '@angular/service-worker'; // <--- Importa aquí

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([LoaderInterceptor])), // <--- Cambiado aquí
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
    }),


    // 👇 Firebase providers
    //provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()), provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000'
          }), provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000'
          })
  ]
};
