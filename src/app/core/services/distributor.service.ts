import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Distributor, DistributorAccountForm, DistributorCategory, DistributorForm } from '../models';

const BASE = `${environment.apiUrl}/gerente/distribuidoras`;

@Injectable({ providedIn: 'root' })
export class DistributorService {
  private http = inject(HttpClient);

  getAll(status?: boolean, categoryId?: number, q?: string, page = 1, perPage = 15) {
    let params = new HttpParams();

    if (status !== undefined) {
      params = params.set('status', String(status));
    }

    if (categoryId) {
      params = params.set('category_id', String(categoryId));
    }

    if (q) {
      params = params.set('q', q);
    }

    params = params.set('page', String(page));
    params = params.set('per_page', String(perPage));

    return this.http.get<any>(BASE, { params }).pipe(
      map(res => this.normalizeListResponse(res)),
    );
  }

  getOne(id: number) {
    return this.http.get<any>(`${BASE}/${id}`).pipe(
      map(res => this.normalizeDetailResponse(res)),
    );
  }

  getCategories() {
    const url = `${environment.apiUrl}/gerente/categorias`;
    return this.http.get<any>(url).pipe(
      map(res => {
        const items = res.data?.data ?? res.data ?? [];
        return {
          ...res,
          data: (items as any[]).map((item): DistributorCategory => ({
            id: Number(item.id),
            name: String(item.name ?? ''),
            percentage: item.percentage,
          })),
        };
      }),
    );
  }

  create(body: DistributorForm) {
    return this.http.post<any>(BASE, body).pipe(
      map(res => this.normalizeDetailResponse(res)),
    );
  }

  update(id: number, body: Partial<DistributorForm>) {
    return this.http.put<any>(`${BASE}/${id}`, body).pipe(
      map(res => this.normalizeDetailResponse(res)),
    );
  }

  createAccount(id: number, body: DistributorAccountForm) {
    return this.http.post<any>(`${BASE}/${id}/user`, body).pipe(
      map(res => this.normalizeDetailResponse(res)),
    );
  }

  remove(id: number) {
    return this.http.delete<{ message: string }>(`${BASE}/${id}`);
  }

  restore(id: number) {
    return this.http.patch<any>(`${BASE}/${id}/restore`, {}).pipe(
      map(res => this.normalizeDetailResponse(res)),
    );
  }

  private normalizeListResponse(res: any) {
    const list = res.data ?? {};
    const items = list.data ?? [];
    return {
      ...res,
      data: {
        data: (items as any[]).map(item => this.normalizeDistributor(item)),
      },
      pagination: this.normalizePagination(list),
    };
  }

  private normalizeDetailResponse(res: any) {
    const data = res.data?.data ?? res.data;
    return {
      ...res,
      data: {
        data: this.normalizeDistributor(data),
      },
    };
  }

  private normalizeDistributor(item: any): Distributor {
    if (!item) {
      return item;
    }

    return {
      ...item,
      status: Boolean(item.status),
      creditBureauHit: item.creditBureauHit ?? item.credit_bureau_hit ?? null,
      personData: item.personData ?? item.person_data ?? null,
      referenceNumber: item.referenceNumber ?? item.reference_number ?? null,
      preApplicationId: item.preApplicationId ?? item.pre_application_id ?? null,
      credit: item.credit ?? null,
      category: item.category ?? null,
      user: item.user ?? null,
    } as Distributor;
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
