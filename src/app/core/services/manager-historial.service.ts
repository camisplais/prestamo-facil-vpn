import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

const BASE = `${environment.apiUrl}/gerente/historial-pagos`;

export interface DistribuidoraResumen {
  id: number;
  reference_number: string | null;
  nombre: string;
  categoria: string | null;
  total_pagos: number;
  total_pagado: number;
  deuda_actual: number;
  saldo_favor: number;
  ultimo_status: string | null;
  ultimo_pago: string | null;
}

export interface PagoHistorial {
  id: number;
  period_start: string;
  period_end: string;
  payment_date: string;
  total_biweekly: number;
  previous_debt: number;
  previous_over_payment: number;
  total_expected: number;
  amount_paid: number;
  difference: number;
  over_payment: number;
  debt: number;
  penalty: number;
  status: string;
  registrado_por: string | null;
  creado_en: string;
}

export interface DistribuidoraDetalle {
  id: number;
  reference_number: string | null;
  nombre: string;
  categoria: string | null;
  total_pagos: number;
  total_pagado: number;
  deuda_actual: number;
  saldo_favor: number;
}

@Injectable({ providedIn: 'root' })
export class ManagerHistorialService {
  private http = inject(HttpClient);

  getAll(q?: string, page = 1, perPage = 15) {
    let params = new HttpParams();
    if (q) params = params.set('q', q);
    params = params.set('page', String(page));
    params = params.set('per_page', String(perPage));

    return this.http.get<any>(BASE, { params }).pipe(
      map(res => ({
        data: (res.data?.data ?? res.data ?? []) as DistribuidoraResumen[],
        pagination: this.normalizePagination(res),
      }))
    );
  }

  getOne(distributorId: number, fechaInicio?: string, fechaFin?: string, page = 1, perPage = 15) {
    let params = new HttpParams();
    if (fechaInicio) params = params.set('fecha_inicio', fechaInicio);
    if (fechaFin)    params = params.set('fecha_fin',    fechaFin);
    params = params.set('page', String(page));
    params = params.set('per_page', String(perPage));

    return this.http.get<any>(`${BASE}/${distributorId}`, { params }).pipe(
      map(res => ({
        distribuidor: res.distribuidor as DistribuidoraDetalle,
        historial: {
          data: (res.historial?.data ?? res.historial ?? []) as PagoHistorial[],
          pagination: this.normalizePagination(res.historial),
        },
      }))
    );
  }

  private normalizePagination(source: any) {
    return {
      current_page: Number(source?.current_page ?? 1),
      last_page: Number(source?.last_page ?? 1),
      per_page: Number(source?.per_page ?? 15),
      total: Number(source?.total ?? 0),
      from: Number(source?.from ?? 0),
      to: Number(source?.to ?? 0),
    };
  }
}
