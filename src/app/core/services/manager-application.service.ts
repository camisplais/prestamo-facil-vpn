import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { GerenteDecisionPayload } from '../models';

const BASE = `${environment.apiUrl}/gerente/solicitudes`;

@Injectable({ providedIn: 'root' })
export class ManagerApplicationService {
  private http = inject(HttpClient);

  getAll(estado?: string, q?: string, page = 1, perPage = 15) {
    let params = new HttpParams();

    if (estado) {
      params = params.set('estado', estado);
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

  updateBuro(id: number, enBuro: boolean) {
    return this.http.patch<any>(`${BASE}/${id}/buro`, { en_buro: enBuro }).pipe(
      map(res => this.normalizeDetailResponse(res)),
    );
  }

  decide(id: number, payload: GerenteDecisionPayload) {
    return this.http.patch<any>(`${BASE}/${id}/decision`, payload).pipe(
      map(res => this.normalizeDetailResponse(res)),
    );
  }

  private normalizeListResponse(res: any) {
    const list = res.data ?? {};
    const items = list.data ?? [];
    return {
      ...res,
      data: {
        data: (items as any[]).map(item => this.normalizeApplication(item)),
      },
      pagination: this.normalizePagination(list),
    };
  }

  private normalizeDetailResponse(res: any) {
    const data = res.data?.data ?? res.data;
    return {
      ...res,
      data: {
        data: this.normalizeApplication(data),
      },
    };
  }

  private normalizeApplication(item: any) {
    if (!item) return item;

    const familyMembers = item.family_members ?? item.familyMembers ?? [];

    return {
      ...item,
      personData: item.personData ?? item.person_data ?? null,
      proof_of_address: item.proof_of_address ?? item.proofOfAddress ?? null,
      credit_bureau: item.credit_bureau ?? item.creditBureau ?? null,
      house_picture: item.house_picture ?? item.housePicture ?? [],
      familyMembers: (familyMembers as any[]).map(member => ({
        ...member,
        personalData: member.personalData ?? member.personal_data ?? null,
      })),
      affiliations: (item.affiliations ?? []).map((a: any) => ({
        ...a,
        externalSubsidiary: a.external_subsidiary ?? a.externalSubsidiary ?? null,
      })),
      distributor: item.distributor ? {
        ...item.distributor,
        creditBureauHit: item.distributor.creditBureauHit ?? item.distributor.credit_bureau_hit ?? null,
      } : item.distributor ?? null,
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