import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

const BASE = `${environment.apiUrl}/admin/history`;

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface ProductoActivo {
  id: number;
  distribuidora: string;
  sucursal: string;
  producto: string;
  monto: number;
  fecha_inicio: string;
  status: 'created' | 'authorized' | 'on_hold' | 'active';
}

export interface ProductoCerrado {
  id: number;
  distribuidora: string;
  sucursal: string;
  producto: string;
  monto: number;
  fecha_cierre: string;
  resultado: 'paid_off' | 'canceled';
}

export interface RelacionSucursal {
  id: number;
  sucursal: string;
  total_relaciones: number;
  monto_total: number;
  activas: number;
  periodo: string;
}

export interface RelacionDistribuidora {
  id: number;
  distribuidora: string;
  sucursal: string;
  no_referencia: string;
  credito_actual: number;
  credito_disponible: number;
  estado: 'activo' | 'inactivo';
  fecha: string;
}

export interface CatalogoItem {
  id: number;
  nombre?: string;
  name?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

// ── Filtros ───────────────────────────────────────────────────────────────────

export interface FiltrosProductos {
  sucursal_id?: number;
  distribuidora_id?: number;
  desde?: string;
  hasta?: string;
  page?: number;
}

export interface FiltrosRelacionesSucursal {
  sucursal_id?: number;
  desde?: string;
  page?: number;
}

export interface FiltrosRelacionesDistribuidora {
  distribuidora_id?: number;
  estado?: string;
  desde?: string;
  hasta?: string;
  page?: number;
}

// ── Service ───────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class HistoryService {
  private http = inject(HttpClient);

  productosActivos(filters: FiltrosProductos = {}) {
    return this.http.get<PaginatedResponse<ProductoActivo>>(
      `${BASE}/productos-activos`,
      { params: this.toParams(filters) }
    );
  }

  productosCerrados(filters: FiltrosProductos = {}) {
    return this.http.get<PaginatedResponse<ProductoCerrado>>(
      `${BASE}/productos-cerrados`,
      { params: this.toParams(filters) }
    );
  }

  relacionesPorSucursal(filters: FiltrosRelacionesSucursal = {}) {
    return this.http.get<PaginatedResponse<RelacionSucursal>>(
      `${BASE}/relaciones-sucursal`,
      { params: this.toParams(filters) }
    );
  }

  relacionesPorDistribuidora(filters: FiltrosRelacionesDistribuidora = {}) {
    return this.http.get<PaginatedResponse<RelacionDistribuidora>>(
      `${BASE}/relaciones-distribuidora`,
      { params: this.toParams(filters) }
    );
  }

  catalogoSucursales() {
    return this.http.get<{ data: CatalogoItem[] }>(`${BASE}/catalogo/sucursales`);
  }

  catalogoDistribuidoras() {
    return this.http.get<{ data: CatalogoItem[] }>(`${BASE}/catalogo/distribuidoras`);
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
