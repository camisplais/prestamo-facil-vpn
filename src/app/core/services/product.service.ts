import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiItem, ApiList, Product, ProductForm } from '../models';
import { environment } from '../../../environments/environment';

const BASE = `${environment.apiUrl}/admin/products`;

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);

  getAll()                        { return this.http.get<ApiList<Product>>(BASE); }
  getOne(id: number)              { return this.http.get<ApiItem<Product>>(`${BASE}/${id}`); }
  create(body: ProductForm)       { return this.http.post<ApiItem<Product>>(BASE, body); }
  update(id: number, body: Partial<ProductForm>) {
    return this.http.put<ApiItem<Product>>(`${BASE}/${id}`, body);
  }
  deactivate(id: number)          { return this.http.delete<{ message: string }>(`${BASE}/${id}`); }
  restore(id: number)             { return this.http.patch<ApiItem<Product>>(`${BASE}/${id}/restore`, {}); }
}
