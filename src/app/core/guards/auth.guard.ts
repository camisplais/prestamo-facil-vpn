import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
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

/**
 * Como APP_INITIALIZER ya hidrató al usuario antes de que cualquier ruta
 * se active, en los guards podemos confiar en que `auth.user()` está
 * listo si hay sesión válida. Si no hay user, no hay sesión → login.
 */

export const authGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (auth.isLogged()) return true;

  router.navigate(['/login']);
  return false;
};

function roleGuard(allowed: string[]): CanActivateFn {
  return () => {
    const auth   = inject(AuthService);
    const router = inject(Router);

    if (!auth.isLogged()) {
      router.navigate(['/login']);
      return false;
    }

    const roles = auth.user()?.roles ?? [];
    if (roles.some(r => allowed.includes(r))) return true;

    router.navigate([homeForRoles(roles)]);
    return false;
  };
}

export const adminGuard        = roleGuard(['admin', 'super_admin']);
export const coordinadorGuard  = roleGuard(['coordinador']);
export const verificadorGuard  = roleGuard(['verificador']);
export const gerenteGuard      = roleGuard(['gerente', 'admin', 'super_admin']);
export const cajeraGuard       = roleGuard(['cajera', 'admin', 'super_admin']);
export const auditorGuard      = roleGuard(['auditor', 'admin', 'super_admin']);
export const distribuidoraGuard = roleGuard(['distribuidora', 'admin', 'super_admin']);