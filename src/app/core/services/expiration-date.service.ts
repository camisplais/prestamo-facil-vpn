import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiItem, ApiList, ExpirationDate, ExpirationDateForm } from '../models';
import { environment } from '../../../environments/environment';

const BASE = `${environment.apiUrl}/admin/expiration-dates`;

@Injectable({ providedIn: 'root' })
export class ExpirationDateService {
  private http = inject(HttpClient);

  getAll()                              { return this.http.get<ApiList<ExpirationDate>>(BASE); }
  getActive()                           { return this.http.get<ApiItem<ExpirationDate>>(`${BASE}/active`); }
  getOne(id: number)                    { return this.http.get<ApiItem<ExpirationDate>>(`${BASE}/${id}`); }
  create(body: ExpirationDateForm)      { return this.http.post<ApiItem<ExpirationDate>>(BASE, body); }
  update(id: number, body: Partial<ExpirationDateForm>) {
    return this.http.put<ApiItem<ExpirationDate>>(`${BASE}/${id}`, body);
  }
  activate(id: number)                  { return this.http.patch<ApiItem<ExpirationDate>>(`${BASE}/${id}/activate`, {}); }
  remove(id: number)                    { return this.http.delete<{ message: string }>(`${BASE}/${id}`); }
}
