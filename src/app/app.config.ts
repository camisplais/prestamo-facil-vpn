import {
  ApplicationConfig,
  provideExperimentalZonelessChangeDetection,
  LOCALE_ID,
  APP_INITIALIZER,
  inject,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localeEsMX from '@angular/common/locales/es-MX';
import { firstValueFrom } from 'rxjs';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { AuthService } from './core/services/auth.service';

registerLocaleData(localeEsMX);

/**
 * Si al arrancar hay un token en localStorage, carga /me ANTES de que
 * la app empiece a renderizar rutas. Así evitamos que los guards y los
 * componentes hagan peticiones con auth.user() === null.
 *
 * Si /me falla (token vencido/inválido), limpiamos la sesión aquí
 * mismo — una sola vez, en el lugar correcto.
 */
function bootstrapAuthFactory() {
  return async () => {
    const auth = inject(AuthService);
    if (!auth.token()) return;
    try {
      await firstValueFrom(auth.loadMe());
    } catch {
      auth.clearSession();
    }
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideExperimentalZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    { provide: LOCALE_ID, useValue: 'es-MX' },
    {
      provide: APP_INITIALIZER,
      useFactory: bootstrapAuthFactory,
      multi: true,
    },
  ],
};