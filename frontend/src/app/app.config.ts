import { APP_INITIALIZER, ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { HTTP_INTERCEPTORS, HttpClientModule, provideHttpClient, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import { AuthService } from './core/services/auth/auth.service';
import { LoadingInterceptor } from './core/interceptors/loading-interceptor';
import { MessageInterceptor } from './core/interceptors/message-interceptor';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getStorage, provideStorage } from '@angular/fire/storage';


export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([MessageInterceptor, LoadingInterceptor]),
    ),

    MessageService,
    ConfirmationService,
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    // primeNg
    provideAnimationsAsync(),
        providePrimeNG({
            theme: {
                preset: Aura,
                options: {
                  darkModeSelector: '.my-dark' 
                }
            }
          }),
    {
      provide: APP_INITIALIZER,
      useFactory: (authService: AuthService) => () => authService.loadCurrentUser(),
      deps: [AuthService],
      multi: true,
    }, provideFirebaseApp(() => initializeApp({ projectId: "campuspilot-a06d3", appId: "1:541080188559:web:caedb9de2f5bbbc5f722fa", storageBucket: "campuspilot-a06d3.firebasestorage.app", apiKey: "AIzaSyDGNmFZd_0rPFheZ67ch_aMrSuBp7_AO10", authDomain: "campuspilot-a06d3.firebaseapp.com", messagingSenderId: "541080188559", measurementId: "G-EWBMCRCTR4" })), provideAuth(() => getAuth()), provideStorage(() => getStorage()),
   
  ]
};
