import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { IncentivePointDivisor } from '../models';

const BASE = `${environment.apiUrl}/gerente/incentivos/divisor`;

@Injectable({ providedIn: 'root' })
export class ManagerIncentiveDivisorService {
  private http = inject(HttpClient);

  getDivisor() {
    return this.http.get<any>(BASE).pipe(
      map(res => ({
        ...res,
        data: this.normalize(res.data?.data ?? res.data ?? null),
      })),
    );
  }

  createDivisor(value: number) {
    return this.http.post<any>(BASE, { value }).pipe(
      map(res => ({
        ...res,
        data: this.normalize(res.data?.data ?? res.data ?? null),
      })),
    );
  }

  updateDivisor(id: number, value: number) {
    return this.http.put<any>(`${BASE}/${id}`, { value }).pipe(
      map(res => ({
        ...res,
        data: this.normalize(res.data?.data ?? res.data ?? null),
      })),
    );
  }

  private normalize(item: any): IncentivePointDivisor | null {
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
