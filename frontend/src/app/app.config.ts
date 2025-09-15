import { APP_INITIALIZER, ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { HTTP_INTERCEPTORS, HttpClientModule, provideHttpClient, withInterceptors } from '@angular/common/http';
import { AuthService } from './core/services/auth/auth.service';
import { LoadingInterceptor } from './core/interceptors/loading-interceptor';
import { MessageInterceptor } from './core/interceptors/message-interceptor';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';


export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([MessageInterceptor])
    ),
    MessageService,
    ConfirmationService,
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    // primeNg
    provideAnimationsAsync(),
        providePrimeNG({
            theme: {
                preset: Aura
            }
          }),
    {
      provide: APP_INITIALIZER,
      useFactory: (authService: AuthService) => () => authService.loadCurrentUser(),
      deps: [AuthService],
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoadingInterceptor,
      multi: true,
    }    
  ]
};
