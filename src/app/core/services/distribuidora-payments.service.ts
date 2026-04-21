import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MyPaymentsResponse } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DistribuidoraPaymentsService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

    getMyPayments(page: number = 1): Observable<MyPaymentsResponse> {
        return this.http.get<MyPaymentsResponse>(`${this.base}/distribuidora/mis-pagos`, {
            params: { page: page.toString() }
        });
    }

}