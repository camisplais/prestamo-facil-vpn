import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminViewService } from '../../../core/services/admin-view.service';

@Component({
  selector: 'app-admin-reclamos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-5">
      <div>
        <h1 class="font-[Montserrat] text-[22px] font-extrabold text-[#1A1A2E]">Reclamos</h1>
        <p class="text-[13px] text-[#6B7280] mt-1">Todos los reclamos registrados en el sistema</p>
      </div>

      <div class="flex flex-wrap gap-3 items-center">
        <select [(ngModel)]="filters.type" (change)="buscar()"
          class="px-3 py-[9px] border-[1.5px] border-[#E0E0E0] rounded-lg text-[13px] bg-white outline-none focus:border-[#003399]">
          <option value="">Todos los tipos</option>
          <option value="money_claim">Cobro de dinero</option>
          <option value="credit_increase">Aumento de crédito</option>
          <option value="redeem_points">Canje de puntos</option>
          <option value="change_clients">Cambio de cliente</option>
          <option value="overdue_customer">Cliente moroso</option>
        </select>
        <select [(ngModel)]="filters.status" (change)="buscar()"
          class="px-3 py-[9px] border-[1.5px] border-[#E0E0E0] rounded-lg text-[13px] bg-white outline-none focus:border-[#003399]">
          <option value="">Todos los estados</option>
          <option value="pending">Pendiente</option>
          <option value="approved">Aprobado</option>
          <option value="rejected">Rechazado</option>
          <option value="closed">Cerrado</option>
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
              @for (r of items(); track r.id) {
                <tr class="border-b border-[#F0F0F0] hover:bg-[#FAFBFF] cursor-pointer" (click)="verDetalle(r.id)">
                  <td class="px-[14px] py-[12px]"><span class="font-mono text-[12px] bg-[#F0F4FF] text-[#003399] px-2 py-0.5 rounded">#{{ r.id }}</span></td>
                  <td class="px-[14px] py-[12px]">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#003399]/10 text-[#003399]">{{ tipoLabel(r.type) }}</span>
                  </td>
                  <td class="px-[14px] py-[12px] text-[#6B7280]">{{ r.distributor?.person_data?.name }} {{ r.distributor?.person_data?.first_last_name }}</td>
                  <td class="px-[14px] py-[12px] text-[#6B7280]">{{ r.manager?.name ?? '—' }}</td>
                  <td class="px-[14px] py-[12px]">
                    <span [class]="estadoClass(r.status)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold">{{ estadoLabel(r.status) }}</span>
                  </td>
                  <td class="px-[14px] py-[12px] text-[#6B7280] whitespace-nowrap">{{ r.created_at | date:'dd/MM/yyyy' }}</td>
                  <td class="px-[14px] py-[12px]">
                    <button (click)="$event.stopPropagation(); verDetalle(r.id)" class="text-[12px] font-semibold text-[#003399] hover:underline bg-transparent border-0 cursor-pointer p-0">Ver →</button>
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
export class AdminReclamosComponent implements OnInit {
  private svc    = inject(AdminViewService);
  private router = inject(Router);

  items   = signal<any[]>([]);
  meta    = signal<any>(null);
  loading = signal(true);
  filters = { type: '', status: '', desde: '', hasta: '' };
  cols    = ['#', 'Tipo', 'Distribuidora', 'Gerente', 'Estado', 'Fecha', ''];

  ngOnInit() { this.buscar(); }
  buscar(page = 1) {
    this.loading.set(true);
    this.svc.reclamos({ ...this.filters, page }).subscribe({
      next: r => { this.items.set(r.data); this.meta.set(r.meta); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
  paginar(p: number) { this.buscar(p); }
  limpiar() { this.filters = { type: '', status: '', desde: '', hasta: '' }; this.buscar(); }
  verDetalle(id: number) { this.router.navigate(['/admin/reclamos', id]); }

  tipoLabel(t: string) {
    return ({ money_claim: 'Cobro dinero', credit_increase: 'Aumento crédito', redeem_points: 'Canje puntos', change_clients: 'Cambio cliente', overdue_customer: 'Cliente moroso' } as any)[t] ?? t;
  }
  estadoLabel(s: string) {
    return ({ pending: 'Pendiente', approved: 'Aprobado', rejected: 'Rechazado', closed: 'Cerrado' } as any)[s] ?? s;
  }
  estadoClass(s: string) {
    return ({
      pending: 'bg-[#F59E0B]/12 text-[#B45309]', approved: 'bg-[#00A86B]/10 text-[#00A86B]',
      rejected: 'bg-[#E53935]/10 text-[#E53935]', closed: 'bg-[#6B7280]/10 text-[#6B7280]',
    } as any)[s] ?? 'bg-[#6B7280]/10 text-[#6B7280]';
  }
}
