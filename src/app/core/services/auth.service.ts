import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { AuthResponse, AuthUser, LoginPayload } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http   = inject(HttpClient);
  private router = inject(Router);

  private _user  = signal<AuthUser | null>(null);
  private _token = signal<string | null>(localStorage.getItem('token'));

  readonly user     = this._user.asReadonly();
  readonly token    = this._token.asReadonly();
  // Ahora isLogged requiere AMBOS: token Y usuario cargado.
  // Esto evita estados intermedios donde el token existe pero el user
  // aún no está hidratado (lo que provocaba llamadas rotas).
  readonly isLogged = computed(() => !!this._token() && !!this._user());

  login(payload: LoginPayload) {
    return this.http.post<any>(`${environment.apiUrl}/login`, payload).pipe(
      tap(res => {
        if (res.access_token) {
          this._token.set(res.access_token);
          localStorage.setItem('token', res.access_token);
        }
      }),
    );
  }

  loadMe() {
    return this.http.get<AuthUser>(`${environment.apiUrl}/me`).pipe(
      tap(user => this._user.set(user)),
    );
  }

  logout() {
    this.http.post(`${environment.apiUrl}/logout`, {}).subscribe({
      complete: () => {
        this.clearSession();
        this.router.navigate(['/login']);
      },
      error: () => {
        this.clearSession();
        this.router.navigate(['/login']);
      },
    });
  }

  /**
   * Limpia el estado de sesión. NO navega — la navegación la decide
   * quien llama (interceptor, guard, logout). Así evitamos redirecciones
   * duplicadas y loops.
   */
  clearSession() {
    this._token.set(null);
    this._user.set(null);
    localStorage.removeItem('token');
  }

  setup2fa(email: string) {
    return this.http.post<any>(`${environment.apiUrl}/setup-2fa`, { email });
  }

  confirm2fa(email: string, code: string, secret?: string) {
    return this.http.post<any>(`${environment.apiUrl}/confirm-2fa`, { email, code, secret }).pipe(
      tap(res => {
        if (res.access_token) {
          this._token.set(res.access_token);
          localStorage.setItem('token', res.access_token);
        }
      }),
    );
  }

  verify2fa(email: string, code: string, secret?: string) {
    return this.http.post<any>(`${environment.apiUrl}/verify-2fa`, { email, code, secret }).pipe(
      tap(res => {
        if (res.access_token) {
          this._token.set(res.access_token);
          localStorage.setItem('token', res.access_token);
        }
      }),
    );
  }
}