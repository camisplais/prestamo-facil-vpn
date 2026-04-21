import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiItem, ApiList, Employee, EmployeeForm } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private http = inject(HttpClient);

  private base(role: string) {
    return `${environment.apiUrl}/admin/${role}`;
  }

  getAll(role: string)                          { return this.http.get<ApiList<Employee>>(this.base(role)); }
  getOne(role: string, id: number)              { return this.http.get<ApiItem<Employee>>(`${this.base(role)}/${id}`); }
  create(role: string, body: EmployeeForm)      { return this.http.post<ApiItem<Employee>>(this.base(role), body); }
  update(role: string, id: number, body: Partial<EmployeeForm>) {
    return this.http.put<ApiItem<Employee>>(`${this.base(role)}/${id}`, body);
  }
  deactivate(role: string, id: number)          { return this.http.delete<{ message: string }>(`${this.base(role)}/${id}`); }
  restore(role: string, id: number)             { return this.http.patch<ApiItem<Employee>>(`${this.base(role)}/${id}/restore`, {}); }
}
