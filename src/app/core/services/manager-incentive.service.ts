import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { IncentivePointValue } from '../models';

const BASE = `${environment.apiUrl}/gerente/incentivos/puntos`;

@Injectable({ providedIn: 'root' })
export class ManagerIncentiveService {
  private http = inject(HttpClient);

  getPointValue() {
    return this.http.get<any>(BASE).pipe(
      map(res => ({
        ...res,
        data: this.normalizePointValue(res.data?.data ?? res.data ?? null),
      })),
    );
  }

  createPointValue(value: number) {
    return this.http.post<any>(BASE, { value }).pipe(
      map(res => ({
        ...res,
        data: this.normalizePointValue(res.data?.data ?? res.data ?? null),
      })),
    );
  }

  updatePointValue(id: number, value: number) {
    return this.http.put<any>(`${BASE}/${id}`, { value }).pipe(
      map(res => ({
        ...res,
        data: this.normalizePointValue(res.data?.data ?? res.data ?? null),
      })),
    );
  }

  private normalizePointValue(item: any): IncentivePointValue | null {
    if (!item) {
      return null;
    }

    return {
      id: Number(item.id),
      subsidiary_id: Number(item.subsidiary_id),
      value: Number(item.value ?? 0),
      created_at: item.created_at ?? undefined,
      updated_at: item.updated_at ?? undefined,
    };
  }
}
