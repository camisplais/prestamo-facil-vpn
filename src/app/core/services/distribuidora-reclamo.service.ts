import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Reclamo, FinalCustomer, PaginatedResponse } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DistribuidoraReclamoService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}`;

  getAll(page = 1): Observable<PaginatedResponse<Reclamo>> {
    return this.http
      .get<{ data: PaginatedResponse<Reclamo> }>(`${this.base}/reclamo`, {
        params: { page }
      })
      .pipe(map(r => r.data)); // <-- desenvuelve el wrapper externo
  }

  getClientes(): Observable<FinalCustomer[]> {
    return this.http
      .get<{ data: FinalCustomer[] }>(`${this.base}/distribuidora/final-customer`)
      .pipe(map(r => r.data ?? []));
  }

  store(payload: FormData): Observable<any> {
    return this.http.post(`${this.base}/distribuidora/reclamo`, payload);
  }

  getDistribuidorasSucursal(): Observable<{ id: number; name: string }[]> {
  return this.http
    .get<{ data: { id: number; name: string }[] }>(`${this.base}/distribuidora/distribuidoras-sucursal`)
    .pipe(map(r => r.data ?? []));
}
}