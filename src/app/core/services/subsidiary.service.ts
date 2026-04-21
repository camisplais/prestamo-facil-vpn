import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiItem, ApiList, Subsidiary, SubsidiaryForm } from '../models';
import { environment } from '../../../environments/environment';

const BASE = `${environment.apiUrl}/admin/subsidiaries`;

@Injectable({ providedIn: 'root' })
export class SubsidiaryService {
  private http = inject(HttpClient);

  getAll()                               { return this.http.get<ApiList<Subsidiary>>(BASE); }
  getOne(id: number)                     { return this.http.get<ApiItem<Subsidiary>>(`${BASE}/${id}`); }
  create(body: SubsidiaryForm)           { return this.http.post<ApiItem<Subsidiary>>(BASE, body); }
  update(id: number, body: Partial<SubsidiaryForm>) {
    return this.http.put<ApiItem<Subsidiary>>(`${BASE}/${id}`, body);
  }
  delete(id: number)                     { return this.http.delete<{ message: string }>(`${BASE}/${id}`); }
}
