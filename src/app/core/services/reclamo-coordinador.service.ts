// src/app/core/services/reclamo-coordinador.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
  CoordinadorReclamo as Reclamo,
  CoordinadorReclamoResolvePayload as ReclamoResolvePayload,
  CoordinadorReclamoStats as ReclamoStats,
  CoordinadorDistribuidora,
} from '../models';

const BASE = `${environment.apiUrl}/coordinador/reclamos`;

@Injectable({ providedIn: 'root' })
export class ReclamoCoordinadorService {
  private http = inject(HttpClient);

  getAll(status?: string, type?: string) {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    if (type)   params = params.set('type', type);
    return this.http.get<{ data: { data: Reclamo[]; total: number } }>(BASE, { params });
  }

  getOne(id: number) {
    return this.http.get<{ data: Reclamo }>(`${BASE}/${id}`);
  }

  getStats() {
    return this.http.get<{ data: ReclamoStats }>(`${BASE}/stats`);
  }

  /** Distribuidoras activas de la sucursal, excluyendo la actual del cliente (para el select en change_clients) */
  getDistribuidoras(reclamoId: number) {
    return this.http.get<{ data: CoordinadorDistribuidora[] }>(`${BASE}/${reclamoId}/distribuidoras`);
  }

  resolve(id: number, payload: ReclamoResolvePayload) {
    return this.http.patch<{ message: string; data: Reclamo }>(`${BASE}/${id}/resolver`, payload);
  }
}