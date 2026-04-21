import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Reconciliation, ManualReconciliationPayload } from '../models';

const BASE = `${environment.apiUrl}/cajera/reconciliations`;

@Injectable({ providedIn: 'root' })
export class ReconciliationService {
  private http = inject(HttpClient);

  getAll(page: number = 1) {
        return this.http.get<any>(`${BASE}?page=${page}`).pipe(
            map(res => {
            const pagination = res.data;
            const items = pagination.data ?? [];
            return {
                items: items.map((i: any) => this.normalize(i)) as Reconciliation[],
                lastPage: pagination.last_page ?? 1,
                total: pagination.total ?? 0,
                counts: res.counts ?? { total: 0, early: 0, on_time: 0, late: 0 },
            };
            })
        );
    }

  getOne(id: number) {
    return this.http.get<any>(`${BASE}/${id}`).pipe(
      map(res => this.normalize(res.data?.data ?? res.data) as Reconciliation)
    );
  }

  upload(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(`${BASE}/upload`, formData).pipe(
      map(res => {
        const items = res.data ?? [];
        return (items as any[]).map(i => this.normalize(i)) as Reconciliation[];
      })
    );
  }

  manualReconciliation(claimId: number, payload: ManualReconciliationPayload) {
    return this.http.post<any>(`${BASE}/manual/${claimId}`, payload).pipe(
      map(res => this.normalize(res.data?.data ?? res.data) as Reconciliation)
    );
  }

    private normalize(item: any): Reconciliation | null {
        if (!item) return null;
        return {
            ...item,
            distributor: item.distributor ? {
            ...item.distributor,
            personData: item.distributor.person_data ?? item.distributor.personData ?? null,
            } : null,
            uploadedBy: item.uploaded_by ?? null,
        };
    }
}