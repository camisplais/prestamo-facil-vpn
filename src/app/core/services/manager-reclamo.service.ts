import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Reclamo, ReclamoDecisionPayload } from '../models';

const BASE = `${environment.apiUrl}/gerente/reclamos`;

@Injectable({ providedIn: 'root' })
export class ManagerReclamoService {
  private http = inject(HttpClient);

  getAll(type?: string, status?: string, page = 1, perPage = 15) {
    let params = new HttpParams();
    if (type) params = params.set('type', type);
    if (status) params = params.set('status', status);
    params = params.set('page', String(page));
    params = params.set('per_page', String(perPage));

    return this.http.get<any>(BASE, { params }).pipe(
      map(res => {
        const list = res.data ?? {};
        const items = list.data ?? [];
        return {
          data: (items as any[]).map(i => this.normalize(i)).filter((item): item is Reclamo => item !== null),
          pagination: this.normalizePagination(list),
        };
      }),
    );
  }

  getOne(id: number) {
    return this.http.get<any>(`${BASE}/${id}`).pipe(
      map(res => this.normalize(res.data?.data ?? res.data) as Reclamo),
    );
  }

  decide(id: number, payload: ReclamoDecisionPayload) {
    return this.http.patch<any>(`${BASE}/${id}/decide`, payload).pipe(
      map(res => this.normalize(res.data?.data ?? res.data) as Reclamo),
    );
  }

  private normalize(item: any): Reclamo | null {
    if (!item) return null;
    return {
      ...item,
      attachments: item.attachments ?? [],
      distributor: item.distributor
        ? {
            ...item.distributor,
            personData: item.distributor.personData ?? item.distributor.person_data ?? null,
          }
        : null,
      cashier: item.cashier ?? null,
    };
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
