import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

const BASE = `${environment.apiUrl}/coordinador/pre-solicitudes`;

@Injectable({ providedIn: 'root' })
export class PreApplicationService {
  private http = inject(HttpClient);

  getAll(estado?: string) {
    const params = estado ? `?estado=${estado}` : '';
    return this.http.get<any>(`${BASE}${params}`);
  }

  getOne(id: number) {
    return this.http.get<any>(`${BASE}/${id}`);
  }

  create(formData: FormData) {
    return this.http.post<any>(BASE, formData);
  }

  getAfiliales() {
    return this.http.get<any>(`${environment.apiUrl}/coordinador/afiliales`);
  }
}
