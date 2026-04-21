import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminViewService } from '../../../core/services/admin-view.service';

@Component({
  selector: 'app-admin-reclamo-detalle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-5">
      <button (click)="volver()" class="inline-flex items-center gap-1.5 text-[13px] text-[#003399] font-semibold hover:underline bg-transparent border-0 cursor-pointer p-0">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
        Volver a reclamos
      </button>

      @if (loading()) { <div class="flex items-center justify-center h-40 text-[#6B7280]">Cargando...</div> }

      @if (item()) {
        <!-- Header -->
        <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] p-6 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div class="flex items-center gap-3 mb-2">
              <span class="font-mono text-[13px] bg-[#F0F4FF] text-[#003399] px-3 py-1 rounded-full font-semibold">#{{ item().id }}</span>
              <span class="inline-flex items-center px-3 py-1 rounded-full text-[12px] font-semibold bg-[#003399]/10 text-[#003399]">{{ tipoLabel(item().type) }}</span>
            </div>
            <h1 class="font-[Montserrat] text-[20px] font-extrabold text-[#1A1A2E]">
              {{ item().distributor?.person_data?.name }} {{ item().distributor?.person_data?.first_last_name }}
            </h1>
            <div class="mt-2">
              <span [class]="estadoClass(item().status)" class="px-3 py-1 rounded-full text-[12px] font-semibold">{{ estadoLabel(item().status) }}</span>
            </div>
          </div>
          <div class="text-[13px] text-[#6B7280]">Fecha: <strong class="text-[#1A1A2E]">{{ item().created_at | date:'dd/MM/yyyy' }}</strong></div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">

          <!-- Distribuidora -->
          <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
            <div class="px-5 py-4 border-b border-[#E0E0E0]"><span class="font-[Montserrat] font-bold text-[14px] text-[#1A1A2E]">Distribuidora</span></div>
            <div class="p-5 grid grid-cols-2 gap-3 text-[13px]">
              <div><span class="text-[#6B7280] text-[11px] uppercase tracking-wider">Nombre</span><p class="font-semibold text-[#1A1A2E] mt-0.5">{{ item().distributor?.person_data?.name }} {{ item().distributor?.person_data?.first_last_name }}</p></div>
              <div><span class="text-[#6B7280] text-[11px] uppercase tracking-wider">Categoría</span><p class="text-[#1A1A2E] mt-0.5">{{ item().distributor?.category?.name ?? '—' }}</p></div>
              <div><span class="text-[#6B7280] text-[11px] uppercase tracking-wider">Crédito actual</span><p class="font-semibold text-[#1A1A2E] mt-0.5">{{ item().distributor?.current_credit | currency:'MXN':'symbol':'1.2-2' }}</p></div>
              <div><span class="text-[#6B7280] text-[11px] uppercase tracking-wider">Disponible</span><p class="font-semibold text-[#00A86B] mt-0.5">{{ item().distributor?.available_credit | currency:'MXN':'symbol':'1.2-2' }}</p></div>
            </div>
          </div>

          <!-- Detalles del reclamo -->
          <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
            <div class="px-5 py-4 border-b border-[#E0E0E0]"><span class="font-[Montserrat] font-bold text-[14px] text-[#1A1A2E]">Detalles</span></div>
            <div class="p-5 grid grid-cols-2 gap-3 text-[13px]">
              <div><span class="text-[#6B7280] text-[11px] uppercase tracking-wider">Gerente</span><p class="font-semibold text-[#1A1A2E] mt-0.5">{{ item().manager?.name ?? '—' }}</p></div>
              <div><span class="text-[#6B7280] text-[11px] uppercase tracking-wider">Cajera</span><p class="text-[#1A1A2E] mt-0.5">{{ item().cashier?.name ?? '—' }}</p></div>
              <div><span class="text-[#6B7280] text-[11px] uppercase tracking-wider">No. referencia</span><p class="font-mono text-[#1A1A2E] mt-0.5">{{ item().reference_number ?? '—' }}</p></div>
              @if (item().amount_approved) {
                <div><span class="text-[#6B7280] text-[11px] uppercase tracking-wider">Monto aprobado</span><p class="font-semibold text-[#00A86B] mt-0.5">{{ item().amount_approved | currency:'MXN':'symbol':'1.2-2' }}</p></div>
              }
              @if (item().decided_at) {
                <div><span class="text-[#6B7280] text-[11px] uppercase tracking-wider">Fecha decisión</span><p class="text-[#1A1A2E] mt-0.5">{{ item().decided_at | date:'dd/MM/yyyy' }}</p></div>
              }
            </div>
          </div>

          <!-- Comentarios -->
          @if (item().comments || item().decision_notes) {
            <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] lg:col-span-2">
              <div class="px-5 py-4 border-b border-[#E0E0E0]"><span class="font-[Montserrat] font-bold text-[14px] text-[#1A1A2E]">Notas</span></div>
              <div class="p-5 space-y-3 text-[13px]">
                @if (item().comments) {
                  <div><p class="text-[11px] text-[#6B7280] uppercase tracking-wider mb-1">Comentarios</p><p class="text-[#1A1A2E] bg-[#F8FAFD] rounded-lg p-3">{{ item().comments }}</p></div>
                }
                @if (item().decision_notes) {
                  <div><p class="text-[11px] text-[#6B7280] uppercase tracking-wider mb-1">Notas de decisión</p><p class="text-[#1A1A2E] bg-[#F8FAFD] rounded-lg p-3">{{ item().decision_notes }}</p></div>
                }
              </div>
            </div>
          }

        </div>
      }
    </div>
  `,
})
export class AdminReclamoDetalleComponent implements OnInit {
  private svc    = inject(AdminViewService);
  private route  = inject(ActivatedRoute);
  private router = inject(Router);

  item    = signal<any>(null);
  loading = signal(true);

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.svc.reclamoDetalle(id).subscribe({
      next: r => { this.item.set(r.data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  volver() { this.router.navigate(['/admin/reclamos']); }

  tipoLabel(t: string) {
    return ({ money_claim: 'Cobro de dinero', credit_increase: 'Aumento de crédito', redeem_points: 'Canje de puntos', change_clients: 'Cambio de cliente', overdue_customer: 'Cliente moroso' } as any)[t] ?? t;
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
