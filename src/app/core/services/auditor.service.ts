import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

const BASE = `${environment.apiUrl}/auditor`;

export interface AuditLog {
  id: number;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH';
  table_name: string;
  old_data: Record<string, any> | null;
  new_data: Record<string, any> | null;
  occurred_at: string;
  users?: { id: number; name: string; email: string }[];
}

export interface AuditDashboard {
  stats: {
    total_logs: number;
    logs_hoy: number;
    pre_solicitudes: number;
    usuarios: number;
  };
  recientes: AuditLog[];
}

export interface LogFilters {
  tabla?: string;
  metodo?: string;
  desde?: string;
  hasta?: string;
  usuario_id?: number;
  page?: number;
}

export interface PreSolicitudFilters {
  estado?: string;
  coordinator_id?: number;
  desde?: string;
  hasta?: string;
  page?: number;
}

@Injectable({ providedIn: 'root' })
export class AuditorService {
  private http = inject(HttpClient);

  dashboard() {
    return this.http.get<AuditDashboard>(`${BASE}/dashboard`);
  }

  logs(filters: LogFilters = {}) {
    const params = this.toParams(filters);
    return this.http.get<any>(`${BASE}/logs`, { params });
  }

  tablas() {
    return this.http.get<{ data: string[] }>(`${BASE}/logs/tablas`);
  }

  preSolicitudes(filters: PreSolicitudFilters = {}) {
    const params = this.toParams(filters);
    return this.http.get<any>(`${BASE}/pre-solicitudes`, { params });
  }

  preSolicitudDetalle(id: number) {
    return this.http.get<any>(`${BASE}/pre-solicitudes/${id}`);
  }

  usuarios(filters: { rol?: string; estado?: string; buscar?: string; page?: number } = {}) {
    const params = this.toParams(filters);
    return this.http.get<any>(`${BASE}/usuarios`, { params });
  }

  logsPorUsuario(userId: number, page = 1) {
    return this.http.get<any>(`${BASE}/usuarios/${userId}/logs`, { params: { page } });
  }

  distribuidoras(filters: { desde?: string; hasta?: string; page?: number } = {}) {
    const params = this.toParams(filters);
    return this.http.get<any>(`${BASE}/distribuidoras`, { params });
  }

  pagos(filters: { metodo?: string; desde?: string; hasta?: string; page?: number } = {}) {
    const params = this.toParams(filters);
    return this.http.get<any>(`${BASE}/pagos`, { params });
  }

  productos(filters: { metodo?: string; page?: number } = {}) {
    const params = this.toParams(filters);
    return this.http.get<any>(`${BASE}/productos`, { params });
  }

  private toParams(obj: Record<string, any>): HttpParams {
    let params = new HttpParams();
    for (const [key, val] of Object.entries(obj)) {
      if (val !== undefined && val !== null && val !== '') {
        params = params.set(key, String(val));
      }
    }
    return params;
  }
}
