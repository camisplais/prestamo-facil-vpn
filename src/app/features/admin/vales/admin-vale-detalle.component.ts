import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminViewService } from '../../../core/services/admin-view.service';

@Component({
  selector: 'app-admin-vale-detalle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-5">
      <button (click)="volver()" class="inline-flex items-center gap-1.5 text-[13px] text-[#003399] font-semibold hover:underline bg-transparent border-0 cursor-pointer p-0">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
        Volver a vales
      </button>

      @if (loading()) { <div class="flex items-center justify-center h-40 text-[#6B7280]">Cargando...</div> }

      @if (item()) {
        <!-- Header -->
        <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] p-6 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div class="flex items-center gap-3 mb-2">
              <span class="font-mono text-[13px] bg-[#F0F4FF] text-[#003399] px-3 py-1 rounded-full font-semibold">Vale #{{ item().id }}</span>
              <span [class]="estadoClass(item().status)" class="px-3 py-1 rounded-full text-[12px] font-semibold">{{ estadoLabel(item().status) }}</span>
            </div>
            <h1 class="font-[Montserrat] text-[20px] font-extrabold text-[#1A1A2E]">
              {{ item().final_customer?.person_data?.name }} {{ item().final_customer?.person_data?.first_last_name }}
            </h1>
            <p class="text-[13px] text-[#6B7280] mt-0.5">Producto: <strong class="text-[#1A1A2E]">{{ item().product?.name }}</strong></p>
          </div>
          <div class="text-right">
            <p class="text-[11px] text-[#6B7280] uppercase tracking-wider">Monto total</p>
            <p class="font-[Montserrat] text-[24px] font-extrabold text-[#1A1A2E]">{{ item().total_value | currency:'MXN':'symbol':'1.2-2' }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">

          <!-- Financiero -->
          <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
            <div class="px-5 py-4 border-b border-[#E0E0E0]"><span class="font-[Montserrat] font-bold text-[14px] text-[#1A1A2E]">Desglose financiero</span></div>
            <div class="p-5 grid grid-cols-2 gap-3 text-[13px]">
              <div><span class="text-[#6B7280] text-[11px] uppercase tracking-wider">Producto</span><p class="font-semibold text-[#1A1A2E] mt-0.5">{{ item().product?.quantity | currency:'MXN':'symbol':'1.2-2' }}</p></div>
              <div><span class="text-[#6B7280] text-[11px] uppercase tracking-wider">Comisión</span><p class="text-[#1A1A2E] mt-0.5">{{ item().commission | currency:'MXN':'symbol':'1.2-2' }}</p></div>
              <div><span class="text-[#6B7280] text-[11px] uppercase tracking-wider">Seguro</span><p class="text-[#1A1A2E] mt-0.5">{{ item().insurance | currency:'MXN':'symbol':'1.2-2' }}</p></div>
              <div><span class="text-[#6B7280] text-[11px] uppercase tracking-wider">Interés</span><p class="text-[#1A1A2E] mt-0.5">{{ item().interest | currency:'MXN':'symbol':'1.2-2' }}</p></div>
              <div><span class="text-[#6B7280] text-[11px] uppercase tracking-wider">Quincenas</span><p class="font-semibold text-[#1A1A2E] mt-0.5">{{ item().product?.fortnights }}</p></div>
              <div><span class="text-[#6B7280] text-[11px] uppercase tracking-wider">Pago quincenal</span><p class="font-semibold text-[#003399] mt-0.5">{{ item().debt_biweekly | currency:'MXN':'symbol':'1.2-2' }}</p></div>
            </div>
          </div>

          <!-- Cliente / distribuidora -->
          <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
            <div class="px-5 py-4 border-b border-[#E0E0E0]"><span class="font-[Montserrat] font-bold text-[14px] text-[#1A1A2E]">Cliente y distribuidora</span></div>
            <div class="p-5 grid grid-cols-1 gap-3 text-[13px]">
              <div><span class="text-[#6B7280] text-[11px] uppercase tracking-wider">Cliente final</span><p class="font-semibold text-[#1A1A2E] mt-0.5">{{ item().final_customer?.person_data?.name }} {{ item().final_customer?.person_data?.first_last_name }}</p></div>
              <div><span class="text-[#6B7280] text-[11px] uppercase tracking-wider">Distribuidora</span><p class="font-semibold text-[#1A1A2E] mt-0.5">{{ item().final_customer?.distributor?.person_data?.name ?? '—' }} {{ item().final_customer?.distributor?.person_data?.first_last_name ?? '' }}</p></div>
              <div><span class="text-[#6B7280] text-[11px] uppercase tracking-wider">Fecha de corte</span><p class="text-[#1A1A2E] mt-0.5">Día {{ item().expiration_date?.cutoff_day_1 }} y Día {{ item().expiration_date?.cutoff_day_2 }}</p></div>
              <div><span class="text-[#6B7280] text-[11px] uppercase tracking-wider">Creado</span><p class="text-[#1A1A2E] mt-0.5">{{ item().created_at | date:'dd/MM/yyyy HH:mm' }}</p></div>
            </div>
          </div>

          <!-- Tabla de quincenas -->
          @if (item().details?.length) {
            <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] lg:col-span-2">
              <div class="px-5 py-4 border-b border-[#E0E0E0] flex items-center justify-between">
                <span class="font-[Montserrat] font-bold text-[14px] text-[#1A1A2E]">Quincenas ({{ item().details.length }})</span>
                <span class="text-[12px] text-[#6B7280]">{{ pagadas() }} pagadas · {{ pendientes() }} pendientes</span>
              </div>
              <div class="overflow-x-auto">
                <table class="w-full text-[13px] border-collapse">
                  <thead>
                    <tr>
                      <th class="bg-[#F8FAFD] font-[Montserrat] font-bold text-[11px] text-[#6B7280] uppercase tracking-[0.5px] px-[14px] py-[10px] text-left border-b border-[#E0E0E0]">#</th>
                      <th class="bg-[#F8FAFD] font-[Montserrat] font-bold text-[11px] text-[#6B7280] uppercase tracking-[0.5px] px-[14px] py-[10px] text-left border-b border-[#E0E0E0]">Fecha</th>
                      <th class="bg-[#F8FAFD] font-[Montserrat] font-bold text-[11px] text-[#6B7280] uppercase tracking-[0.5px] px-[14px] py-[10px] text-left border-b border-[#E0E0E0]">Deuda</th>
                      <th class="bg-[#F8FAFD] font-[Montserrat] font-bold text-[11px] text-[#6B7280] uppercase tracking-[0.5px] px-[14px] py-[10px] text-left border-b border-[#E0E0E0]">Pagado</th>
                      <th class="bg-[#F8FAFD] font-[Montserrat] font-bold text-[11px] text-[#6B7280] uppercase tracking-[0.5px] px-[14px] py-[10px] text-left border-b border-[#E0E0E0]">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (d of item().details; track d.id) {
                      <tr class="border-b border-[#F0F0F0]">
                        <td class="px-[14px] py-[10px] text-[#9CA3AF]">{{ d.installment }}</td>
                        <td class="px-[14px] py-[10px] text-[#6B7280]">{{ d.date | date:'dd/MM/yyyy' }}</td>
                        <td class="px-[14px] py-[10px] font-semibold">{{ d.debt | currency:'MXN':'symbol':'1.2-2' }}</td>
                        <td class="px-[14px] py-[10px]">{{ d.amount_paid ? (d.amount_paid | currency:'MXN':'symbol':'1.2-2') : '—' }}</td>
                        <td class="px-[14px] py-[10px]">
                          <span [class]="detailClass(d.status)" class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold">{{ detailLabel(d.status) }}</span>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          }

        </div>
      }
    </div>
  `,
})
export class AdminValeDetalleComponent implements OnInit {
  private svc    = inject(AdminViewService);
  private route  = inject(ActivatedRoute);
  private router = inject(Router);

  item    = signal<any>(null);
  loading = signal(true);

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.svc.valeDetalle(id).subscribe({
      next: r => { this.item.set(r.data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  volver() { this.router.navigate(['/admin/vales']); }

  pagadas()    { return this.item()?.details?.filter((d: any) => d.status === 'paid').length ?? 0; }
  pendientes() { return this.item()?.details?.filter((d: any) => d.status === 'pending').length ?? 0; }

  estadoLabel(s: string) {
    return ({ on_hold: 'Pre-vale', created: 'Creado', cashed: 'Cobrado', active: 'Activo', paid_off: 'Liquidado', canceled: 'Cancelado' } as any)[s] ?? s;
  }
  estadoClass(s: string) {
    return ({
      on_hold: 'bg-[#F59E0B]/12 text-[#B45309]', created: 'bg-[#0288D1]/10 text-[#0288D1]',
      cashed: 'bg-[#003399]/10 text-[#003399]', active: 'bg-[#00A86B]/10 text-[#00A86B]',
      paid_off: 'bg-[#6B7280]/10 text-[#6B7280]', canceled: 'bg-[#E53935]/10 text-[#E53935]',
    } as any)[s] ?? 'bg-[#6B7280]/10 text-[#6B7280]';
  }
  detailLabel(s: string) {
    return ({ pending: 'Pendiente', paid: 'Pagado', overdue: 'Vencido' } as any)[s] ?? s;
  }
  detailClass(s: string) {
    return ({
      pending: 'bg-[#F59E0B]/12 text-[#B45309]', paid: 'bg-[#00A86B]/10 text-[#00A86B]', overdue: 'bg-[#E53935]/10 text-[#E53935]',
    } as any)[s] ?? 'bg-[#6B7280]/10 text-[#6B7280]';
  }
}
