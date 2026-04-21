import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Reclamo, ManualReconciliationPayload, Reconciliation } from '../models';
import { environment } from '../../../environments/environment';

export interface ManualReconciliationResponse {
  message: string;
  data: Reconciliation;
}

@Injectable({ providedIn: 'root' })
export class CashierReclamoService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}`;

  getAll(): Observable<Reclamo[]> {
  const params = new HttpParams().set('type', 'money_claim');
  return this.http
    .get<{ data: Reclamo[] }>(`${this.base}/reclamo`, { params })
    .pipe(map(r => r.data ?? []));
}

  manualReconciliation(claimId: number, payload: ManualReconciliationPayload): Observable<ManualReconciliationResponse> {
    return this.http.post<ManualReconciliationResponse>(
      `${this.base}/cajera/reconciliations/manual/${claimId}`,
      payload
    );
  }
}