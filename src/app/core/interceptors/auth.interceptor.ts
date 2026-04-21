import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

function homeForRoles(roles: string[]): string {
  if (roles.includes('admin') || roles.includes('super_admin')) return '/admin/productos';
  if (roles.includes('gerente'))       return '/gerente/solicitudes';
  if (roles.includes('coordinador'))   return '/coordinador/pre-solicitudes';
  if (roles.includes('verificador'))   return '/verificador/pre-solicitudes';
  if (roles.includes('auditor'))       return '/auditor/dashboard';
  if (roles.includes('distribuidora')) return '/distribuidora';
  return '/login';
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  const token  = auth.token();

  const authed = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authed).pipe(
    catchError(err => {
      // 401 = token inválido o vencido → cerrar sesión.
      // Excepción: el propio endpoint de /login devuelve 401 para
      // credenciales incorrectas; ahí NO debemos limpiar nada.
      if (err.status === 401 && !req.url.includes('/login')) {
        auth.clearSession();
        router.navigate(['/login']);
      } else if (err.status === 403) {
        // 403 = autenticado pero sin permiso para ese recurso.
        // Redirigir al home del rol, sin cerrar sesión.
        const roles = auth.user()?.roles ?? [];
        router.navigate([homeForRoles(roles)]);
      }
      return throwError(() => err);
    }),
  );
};