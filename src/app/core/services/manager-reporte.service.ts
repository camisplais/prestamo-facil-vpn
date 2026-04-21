import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

const BASE = `${environment.apiUrl}/gerente/reportes`;

export interface FiltroPeriodo {
  fechaInicio?: string;
  fechaFin?: string;
}

export interface DistribuidoraMorosa {
  id: number;
  reference_number: string | null;
  status: boolean;
  nombre: string;
  curp: string | null;
  rfc: string | null;
  categoria: string | null;
  credito: { current_credit: number; available_credit: number; credit_limit: number };
  puntos: number;
  buro_revisado_en: string | null;
  creado_en: string;
}

export interface PreSolicitudReporte {
  id: number;
  status: string;
  nombre: string;
  curp: string | null;
  rfc: string | null;
  coordinador: string | null;
  verificador: string | null;
  en_buro: boolean | null;
  buro_revisado_en: string | null;
  creado_en: string;
  verificado_en: string | null;
}

export interface SaldoCorte {
  period_start: string;
  period_end: string;
  distribuidoras: number;
  total_biweekly: number;
  total_expected: number;
  total_pagado: number;
  total_deuda: number;
  total_saldo_favor: number;
  total_penalizacion: number;
  count_early: number;
  count_on_time: number;
  count_late: number;
}

export interface SaldoPunto {
  id: number;
  reference_number: string | null;
  nombre: string;
  categoria: string | null;
  puntos: number;
  current_credit: number;
  available_credit: number;
  status: boolean;
}

export interface CorteActivo {
  id: number;
  cutoff_day_1: number;
  cutoff_day_2: number;
}

@Injectable({ providedIn: 'root' })
export class ManagerReporteService {
  private http = inject(HttpClient);

  getDistribuidorasMorosas(filtro: FiltroPeriodo = {}, page = 1, perPage = 15) {
    let params = new HttpParams();
    if (filtro.fechaInicio) params = params.set('fecha_inicio', filtro.fechaInicio);
    if (filtro.fechaFin)    params = params.set('fecha_fin',    filtro.fechaFin);
    params = params.set('page', String(page));
    params = params.set('per_page', String(perPage));

    return this.http.get<any>(`${BASE}/distribuidoras-morosas`, { params }).pipe(
      map(res => ({
        total: res.total as number,
        filtros: res.filtros,
        data: (res.data ?? []) as DistribuidoraMorosa[],
        pagination: this.normalizePagination(res),
      }))
    );
  }

  getPreSolicitudes(filtro: FiltroPeriodo & { estado?: string } = {}, page = 1, perPage = 15) {
    let params = new HttpParams();
    if (filtro.fechaInicio) params = params.set('fecha_inicio', filtro.fechaInicio);
    if (filtro.fechaFin)    params = params.set('fecha_fin',    filtro.fechaFin);
    if (filtro.estado)      params = params.set('estado',       filtro.estado);
    params = params.set('page', String(page));
    params = params.set('per_page', String(perPage));

    return this.http.get<any>(`${BASE}/pre-solicitudes`, { params }).pipe(
      map(res => ({
        total:   res.total as number,
        totales: res.totales as Record<string, number>,
        filtros: res.filtros,
        data:    (res.data ?? []) as PreSolicitudReporte[],
        pagination: this.normalizePagination(res),
      }))
    );
  }

  getSaldoCortes(filtro: FiltroPeriodo = {}, page = 1, perPage = 15) {
    let params = new HttpParams();
    if (filtro.fechaInicio) params = params.set('fecha_inicio', filtro.fechaInicio);
    if (filtro.fechaFin)    params = params.set('fecha_fin',    filtro.fechaFin);
    params = params.set('page', String(page));
    params = params.set('per_page', String(perPage));

    return this.http.get<any>(`${BASE}/saldo-cortes`, { params }).pipe(
      map(res => ({
        corteActivo: res.corte_activo as CorteActivo | null,
        total: res.total as number,
        data:  (res.data ?? []) as SaldoCorte[],
        pagination: this.normalizePagination(res),
      }))
    );
  }

  getSaldoPuntos(page = 1, perPage = 15) {
    let params = new HttpParams();
    params = params.set('page', String(page));
    params = params.set('per_page', String(perPage));

    return this.http.get<any>(`${BASE}/saldo-puntos`, { params }).pipe(
      map(res => ({
        corteActivo:  res.corte_activo as CorteActivo | null,
        total:        res.total as number,
        totalPuntos:  res.total_puntos as number,
        data:         (res.data ?? []) as SaldoPunto[],
        pagination: this.normalizePagination(res),
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
