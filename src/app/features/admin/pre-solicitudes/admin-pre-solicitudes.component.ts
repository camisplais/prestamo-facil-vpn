import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminViewService } from '../../../core/services/admin-view.service';

@Component({
  selector: 'app-admin-pre-solicitudes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-5">
      <div>
        <h1 class="font-[Montserrat] text-[22px] font-extrabold text-[#1A1A2E]">Pre-solicitudes</h1>
        <p class="text-[13px] text-[#6B7280] mt-1">Todas las pre-solicitudes registradas en el sistema</p>
      </div>

      <div class="flex flex-wrap gap-3 items-center">
        <div class="relative flex-1 min-w-[200px]">
          <svg class="absolute left-2.5 top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-[#6B7280]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input [(ngModel)]="filters.buscar" (input)="buscar()" placeholder="Nombre o CURP..."
            class="pl-9 pr-3 py-[9px] border-[1.5px] border-[#E0E0E0] rounded-lg text-[13px] bg-white w-full outline-none focus:border-[#003399]">
        </div>
        <select [(ngModel)]="filters.status" (change)="buscar()"
          class="px-3 py-[9px] border-[1.5px] border-[#E0E0E0] rounded-lg text-[13px] bg-white outline-none focus:border-[#003399]">
          <option value="">Todos los estados</option>
          <option value="pending">Pendiente</option>
          <option value="verified">Verificada</option>
          <option value="approved">Aprobada</option>
          <option value="rejected">Rechazada</option>
        </select>
        <input type="date" [(ngModel)]="filters.desde" (change)="buscar()"
          class="px-3 py-[9px] border-[1.5px] border-[#E0E0E0] rounded-lg text-[13px] bg-white outline-none focus:border-[#003399]">
        <input type="date" [(ngModel)]="filters.hasta" (change)="buscar()"
          class="px-3 py-[9px] border-[1.5px] border-[#E0E0E0] rounded-lg text-[13px] bg-white outline-none focus:border-[#003399]">
        <button (click)="limpiar()" class="px-4 py-[9px] rounded-lg text-[13px] font-semibold bg-white border-[1.5px] border-[#E0E0E0] text-[#003399] hover:border-[#003399] transition-colors">Limpiar</button>
      </div>

      <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
        <div class="overflow-x-auto">
          <table class="w-full text-[13px] border-collapse">
            <thead>
              <tr>
                @for (col of cols; track col) {
                  <th class="bg-[#F8FAFD] font-[Montserrat] font-bold text-[11px] text-[#6B7280] uppercase tracking-[0.5px] px-[14px] py-[11px] text-left border-b-2 border-[#E0E0E0] whitespace-nowrap">{{ col }}</th>
                }
              </tr>
            </thead>
            <tbody>
              @if (loading()) {
                <tr><td [attr.colspan]="cols.length" class="text-center py-10 text-[#6B7280]">Cargando...</td></tr>
              }
              @for (s of items(); track s.id) {
                <tr class="border-b border-[#F0F0F0] hover:bg-[#FAFBFF] cursor-pointer" (click)="verDetalle(s.id)">
                  <td class="px-[14px] py-[12px]"><span class="font-mono text-[12px] bg-[#F0F4FF] text-[#003399] px-2 py-0.5 rounded">#{{ s.id }}</span></td>
                  <td class="px-[14px] py-[12px] font-semibold text-[#1A1A2E]">{{ s.person_data?.name }} {{ s.person_data?.first_last_name }}</td>
                  <td class="px-[14px] py-[12px] text-[#6B7280]">{{ s.person_data?.curp ?? '—' }}</td>
                  <td class="px-[14px] py-[12px] text-[#6B7280]">{{ s.coordinator?.name ?? '—' }}</td>
                  <td class="px-[14px] py-[12px] text-[#6B7280]">{{ s.verifier?.name ?? '—' }}</td>
                  <td class="px-[14px] py-[12px]">
                    <span [class]="estadoClass(s.status)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold">{{ estadoLabel(s.status) }}</span>
                  </td>
                  <td class="px-[14px] py-[12px] text-[#6B7280] whitespace-nowrap">{{ s.created_at | date:'dd/MM/yyyy' }}</td>
                  <td class="px-[14px] py-[12px]">
                    <button (click)="$event.stopPropagation(); verDetalle(s.id)" class="text-[12px] font-semibold text-[#003399] hover:underline bg-transparent border-0 cursor-pointer p-0">Ver →</button>
                  </td>
                </tr>
              }
              @if (!loading() && items().length === 0) {
                <tr><td [attr.colspan]="cols.length" class="text-center py-10 text-[#6B7280]">Sin resultados</td></tr>
              }
            </tbody>
          </table>
        </div>
        @if (meta()) {
          <div class="px-5 py-3 border-t border-[#E0E0E0] flex items-center justify-between text-[13px] text-[#6B7280]">
            <span>{{ meta()!.from }}–{{ meta()!.to }} de {{ meta()!.total }}</span>
            <div class="flex gap-2">
              <button [disabled]="meta()!.current_page === 1" (click)="paginar(meta()!.current_page - 1)"
                class="px-3 py-1.5 rounded-lg border border-[#E0E0E0] bg-white hover:border-[#003399] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">‹ Anterior</button>
              <button [disabled]="meta()!.current_page === meta()!.last_page" (click)="paginar(meta()!.current_page + 1)"
                class="px-3 py-1.5 rounded-lg border border-[#E0E0E0] bg-white hover:border-[#003399] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Siguiente ›</button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class AdminPreSolicitudesComponent implements OnInit {
  private svc    = inject(AdminViewService);
  private router = inject(Router);

  items   = signal<any[]>([]);
  meta    = signal<any>(null);
  loading = signal(true);
  filters = { buscar: '', status: '', desde: '', hasta: '' };
  cols    = ['#', 'Candidata', 'CURP', 'Coordinador', 'Verificador', 'Estado', 'Fecha', ''];

  ngOnInit() { this.buscar(); }
  buscar(page = 1) {
    this.loading.set(true);
    this.svc.preSolicitudes({ ...this.filters, page }).subscribe({
      next: r => { this.items.set(r.data); this.meta.set(r.meta); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
  paginar(p: number) { this.buscar(p); }
  limpiar() { this.filters = { buscar: '', status: '', desde: '', hasta: '' }; this.buscar(); }
  verDetalle(id: number) { this.router.navigate(['/admin/pre-solicitudes', id]); }

  estadoLabel(s: string) {
    return ({ pending: 'Pendiente', verified: 'Verificada', approved: 'Aprobada', rejected: 'Rechazada' } as any)[s] ?? s;
  }
  estadoClass(s: string) {
    return ({
      pending: 'bg-[#F59E0B]/12 text-[#B45309]', verified: 'bg-[#0288D1]/10 text-[#0288D1]',
      approved: 'bg-[#00A86B]/10 text-[#00A86B]', rejected: 'bg-[#E53935]/10 text-[#E53935]',
    } as any)[s] ?? 'bg-[#6B7280]/10 text-[#6B7280]';
  }
}
