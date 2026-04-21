import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

const BASE = `${environment.apiUrl}/admin/vista`;

@Injectable({ providedIn: 'root' })
export class AdminViewService {
  private http = inject(HttpClient);

  preSolicitudes(f: { status?: string; desde?: string; hasta?: string; buscar?: string; page?: number } = {}) {
    return this.http.get<any>(`${BASE}/pre-solicitudes`, { params: this.p(f) });
  }
  preSolicitudDetalle(id: number) {
    return this.http.get<any>(`${BASE}/pre-solicitudes/${id}`);
  }

  reclamos(f: { type?: string; status?: string; desde?: string; hasta?: string; page?: number } = {}) {
    return this.http.get<any>(`${BASE}/reclamos`, { params: this.p(f) });
  }
  reclamoDetalle(id: number) {
    return this.http.get<any>(`${BASE}/reclamos/${id}`);
  }

  vales(f: { status?: string; desde?: string; hasta?: string; buscar?: string; page?: number } = {}) {
    return this.http.get<any>(`${BASE}/vales`, { params: this.p(f) });
  }
  valeDetalle(id: number) {
    return this.http.get<any>(`${BASE}/vales/${id}`);
  }

  private p(obj: Record<string, any>): HttpParams {
    let params = new HttpParams();
    for (const [k, v] of Object.entries(obj))
      if (v !== undefined && v !== null && v !== '') params = params.set(k, String(v));
    return params;
  }
}
