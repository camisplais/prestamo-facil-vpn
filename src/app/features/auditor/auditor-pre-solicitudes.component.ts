import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuditorService } from '../../core/services/auditor.service';

@Component({
  selector: 'app-auditor-pre-solicitudes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="space-y-5">
      <div>
        <h1 class="font-[Montserrat] text-[22px] font-extrabold text-[#1A1A2E]">Pre-solicitudes</h1>
        <p class="text-[13px] text-[#6B7280] mt-1">Historial completo de todas las pre-solicitudes registradas</p>
      </div>

      <!-- Filtros -->
      <div class="flex flex-wrap gap-3 items-center">
        <select [(ngModel)]="filters.estado" (change)="buscar()"
          class="px-3 py-[9px] border-[1.5px] border-[#E0E0E0] rounded-lg text-[13px] font-[Inter] bg-white outline-none focus:border-[#003399]">
          <option value="">Todos los estados</option>
          <option value="pending">Pendiente</option>
          <option value="verified">Verificada</option>
          <option value="approved">Aprobada</option>
          <option value="rejected">Rechazada</option>
        </select>

        <input type="date" [(ngModel)]="filters.desde" (change)="buscar()"
          placeholder="Desde"
          class="px-3 py-[9px] border-[1.5px] border-[#E0E0E0] rounded-lg text-[13px] font-[Inter] bg-white outline-none focus:border-[#003399]">

        <input type="date" [(ngModel)]="filters.hasta" (change)="buscar()"
          placeholder="Hasta"
          class="px-3 py-[9px] border-[1.5px] border-[#E0E0E0] rounded-lg text-[13px] font-[Inter] bg-white outline-none focus:border-[#003399]">

        <button (click)="limpiar()"
          class="px-4 py-[9px] rounded-lg text-[13px] font-semibold bg-white border-[1.5px] border-[#E0E0E0] text-[#003399] hover:border-[#003399] transition-colors">
          Limpiar
        </button>
      </div>

      <!-- Tabla -->
      <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
        <div class="overflow-x-auto">
          <table class="w-full text-[13px] border-collapse">
            <thead>
              <tr>
                @for (col of cols; track col) {
                  <th class="bg-[#F8FAFD] font-[Montserrat] font-bold text-[11px] text-[#6B7280] uppercase tracking-[0.5px] px-[14px] py-[11px] text-left border-b-2 border-[#E0E0E0] whitespace-nowrap">
                    {{ col }}
                  </th>
                }
              </tr>
            </thead>
            <tbody>
              @if (loading()) {
                <tr><td [attr.colspan]="cols.length" class="text-center py-10 text-[#6B7280]">Cargando...</td></tr>
              }
              @for (s of solicitudes(); track s.id) {
                <tr class="border-b border-[#F0F0F0] hover:bg-[#FAFBFF]">
                  <td class="px-[14px] py-[12px]">
                    <span class="font-mono text-[12px] bg-[#F0F4FF] text-[#003399] px-2 py-0.5 rounded">
                      #{{ s.id }}
                    </span>
                  </td>
                  <td class="px-[14px] py-[12px] font-semibold text-[#1A1A2E]">
                    {{ s.person_data?.name }} {{ s.person_data?.first_last_name }}
                  </td>
                  <td class="px-[14px] py-[12px] text-[#6B7280]">{{ s.person_data?.curp ?? '—' }}</td>
                  <td class="px-[14px] py-[12px] text-[#6B7280]">{{ s.coordinator?.name ?? '—' }}</td>
                  <td class="px-[14px] py-[12px] text-[#6B7280]">{{ s.verifier?.name ?? '—' }}</td>
                  <td class="px-[14px] py-[12px]">
                    <span [class]="estadoClass(s.status)"
                      class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-current before:opacity-60">
                      {{ estadoLabel(s.status) }}
                    </span>
                  </td>
                  <td class="px-[14px] py-[12px] text-[#6B7280] whitespace-nowrap">
                    {{ s.created_at | date:'dd/MM/yyyy' }}
                  </td>
                  <td class="px-[14px] py-[12px]">
                    <a [routerLink]="['/auditor/pre-solicitudes', s.id]"
                      class="text-[12px] font-semibold text-[#003399] hover:underline">
                      Ver detalle →
                    </a>
                  </td>
                </tr>
              }
              @if (!loading() && solicitudes().length === 0) {
                <tr><td [attr.colspan]="cols.length" class="text-center py-10 text-[#6B7280]">Sin resultados</td></tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Paginación -->
        @if (meta()) {
          <div class="px-5 py-3 border-t border-[#E0E0E0] flex items-center justify-between text-[13px] text-[#6B7280]">
            <span>{{ meta()!.from }}–{{ meta()!.to }} de {{ meta()!.total }}</span>
            <div class="flex gap-2">
              <button [disabled]="meta()!.current_page === 1" (click)="paginar(meta()!.current_page - 1)"
                class="px-3 py-1.5 rounded-lg border border-[#E0E0E0] bg-white hover:border-[#003399] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                ‹ Anterior
              </button>
              <button [disabled]="meta()!.current_page === meta()!.last_page" (click)="paginar(meta()!.current_page + 1)"
                class="px-3 py-1.5 rounded-lg border border-[#E0E0E0] bg-white hover:border-[#003399] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                Siguiente ›
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class AuditorPreSolicitudesComponent implements OnInit {
  private svc = inject(AuditorService);

  solicitudes = signal<any[]>([]);
  meta        = signal<any>(null);
  loading     = signal(true);

  filters = { estado: '', desde: '', hasta: '' };

  cols = ['#', 'Candidata', 'CURP', 'Coordinador', 'Verificador', 'Estado', 'Fecha', 'Acción'];

  ngOnInit() { this.buscar(); }

  buscar(page = 1) {
    this.loading.set(true);
    this.svc.preSolicitudes({ ...this.filters, page }).subscribe({
      next: r => { this.solicitudes.set(r.data); this.meta.set(r.meta); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  paginar(page: number) { this.buscar(page); }

  limpiar() {
    this.filters = { estado: '', desde: '', hasta: '' };
    this.buscar();
  }

  estadoLabel(s: string) {
    const m: Record<string, string> = { pending: 'Pendiente', verified: 'Verificada', approved: 'Aprobada', rejected: 'Rechazada' };
    return m[s] ?? s;
  }

  estadoClass(s: string) {
    const m: Record<string, string> = {
      pending:  'bg-[#F59E0B]/12 text-[#B45309]',
      verified: 'bg-[#0288D1]/10 text-[#0288D1]',
      approved: 'bg-[#00A86B]/10 text-[#00A86B]',
      rejected: 'bg-[#E53935]/10 text-[#E53935]',
    };
    return m[s] ?? 'bg-[#6B7280]/10 text-[#6B7280]';
  }
}
