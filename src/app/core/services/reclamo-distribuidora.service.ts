// src/app/core/services/reclamo-distribuidora.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CoordinadorReclamo as Reclamo, CoordinadorReclamoStorePayload as ReclamoStorePayload } from '../models';

const BASE = `${environment.apiUrl}/distribuidora/reclamos-coordinador`;

@Injectable({ providedIn: 'root' })
export class ReclamoDistribuidoraService {
  private http = inject(HttpClient);

  getAll(status?: string) {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<{ data: { data: Reclamo[] } }>(BASE, { params });
  }

  create(payload: ReclamoStorePayload) {
    return this.http.post<{ message: string; data: Reclamo }>(BASE, payload);
  }

  applyOverdue(id: number) {
    return this.http.patch<{ message: string; data: Reclamo }>(
      `${BASE}/${id}/apply-overdue`,
      {}
    );
  }
}
