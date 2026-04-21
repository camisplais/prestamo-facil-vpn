import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

const BASE = `${environment.apiUrl}/verificador/pre-solicitudes`;

@Injectable({ providedIn: 'root' })
export class VerifierService {
  private http = inject(HttpClient);

  /** Lista pre-solicitudes, filtradas por estado si se indica */
  getAll(estado?: string) {
    const params = estado ? `?estado=${estado}` : '';
    return this.http.get<any>(`${BASE}${params}`);
  }

  /** Detalle de una pre-solicitud */
  getOne(id: number) {
    return this.http.get<any>(`${BASE}/${id}`);
  }

  /**
   * Sube fotos de evidencia (multipart/form-data).
   * Las imágenes se guardan en el servidor de archivos;
   * la BD solo registra el nombre/ruta del archivo.
   */
  uploadEvidencia(id: number, formData: FormData) {
    return this.http.post<any>(`${BASE}/${id}/evidencia`, formData);
  }

  /**
   * Cambia el estado de la pre-solicitud a 'verified' o 'rejected'
   * y registra el comentario del verificador.
   */
  updateEstado(id: number, estado: 'verified' | 'rejected', comentario: string) {
    return this.http.patch<any>(`${BASE}/${id}/estado`, { estado, comentario });
  }
}
