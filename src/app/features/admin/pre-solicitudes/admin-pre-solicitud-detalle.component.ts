import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminViewService } from '../../../core/services/admin-view.service';

@Component({
  selector: 'app-admin-pre-solicitud-detalle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-5">
      <button (click)="volver()" class="inline-flex items-center gap-1.5 text-[13px] text-[#003399] font-semibold hover:underline bg-transparent border-0 cursor-pointer p-0">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
        Volver a pre-solicitudes
      </button>

      @if (loading()) { <div class="flex items-center justify-center h-40 text-[#6B7280]">Cargando...</div> }

      @if (item()) {
        <!-- Header -->
        <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] p-6 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 class="font-[Montserrat] text-[20px] font-extrabold text-[#1A1A2E]">
              {{ item().person_data?.name }} {{ item().person_data?.first_last_name }} {{ item().person_data?.second_last_name }}
            </h1>
            <p class="text-[13px] text-[#6B7280] mt-0.5">CURP: <strong>{{ item().person_data?.curp ?? '—' }}</strong></p>
            <div class="flex flex-wrap gap-2 mt-3">
              <span [class]="estadoClass(item().status)" class="px-3 py-1 rounded-full text-[12px] font-semibold">{{ estadoLabel(item().status) }}</span>
              <span class="font-mono text-[12px] bg-[#F0F4FF] text-[#003399] px-2.5 py-1 rounded-full">#{{ item().id }}</span>
            </div>
          </div>
          <div class="text-[13px] text-[#6B7280]">Alta: <strong class="text-[#1A1A2E]">{{ item().created_at | date:'dd/MM/yyyy' }}</strong></div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">

          <!-- Datos personales -->
          <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
            <div class="px-5 py-4 border-b border-[#E0E0E0]"><span class="font-[Montserrat] font-bold text-[14px] text-[#1A1A2E]">Datos personales</span></div>
            <div class="p-5 grid grid-cols-2 gap-3 text-[13px]">
              <div><span class="text-[#6B7280] text-[11px] uppercase tracking-wider">Nombre</span><p class="font-semibold text-[#1A1A2E] mt-0.5">{{ item().person_data?.name }} {{ item().person_data?.first_last_name }}</p></div>
              <div><span class="text-[#6B7280] text-[11px] uppercase tracking-wider">CURP</span><p class="font-mono text-[#1A1A2E] mt-0.5">{{ item().person_data?.curp ?? '—' }}</p></div>
              <div><span class="text-[#6B7280] text-[11px] uppercase tracking-wider">RFC</span><p class="font-mono text-[#1A1A2E] mt-0.5">{{ item().person_data?.rfc ?? '—' }}</p></div>
              <div><span class="text-[#6B7280] text-[11px] uppercase tracking-wider">Teléfono</span><p class="text-[#1A1A2E] mt-0.5">{{ item().person_data?.personal_phone_number ?? '—' }}</p></div>
              <div><span class="text-[#6B7280] text-[11px] uppercase tracking-wider">Fecha nacimiento</span><p class="text-[#1A1A2E] mt-0.5">{{ item().person_data?.birth_date | date:'dd/MM/yyyy' }}</p></div>
              <div><span class="text-[#6B7280] text-[11px] uppercase tracking-wider">Género</span><p class="text-[#1A1A2E] mt-0.5">{{ item().person_data?.gender ?? '—' }}</p></div>
            </div>
          </div>

          <!-- Equipo asignado -->
          <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
            <div class="px-5 py-4 border-b border-[#E0E0E0]"><span class="font-[Montserrat] font-bold text-[14px] text-[#1A1A2E]">Equipo asignado</span></div>
            <div class="p-5 grid grid-cols-1 gap-3 text-[13px]">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-[#003399] text-white flex items-center justify-center text-[12px] font-bold flex-shrink-0">{{ item().coordinator?.name?.charAt(0) ?? '?' }}</div>
                <div><p class="text-[11px] text-[#6B7280] uppercase tracking-wider">Coordinador</p><p class="font-semibold text-[#1A1A2E]">{{ item().coordinator?.name ?? '—' }}</p></div>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-[#0288D1] text-white flex items-center justify-center text-[12px] font-bold flex-shrink-0">{{ item().verifier?.name?.charAt(0) ?? '?' }}</div>
                <div><p class="text-[11px] text-[#6B7280] uppercase tracking-wider">Verificador</p><p class="font-semibold text-[#1A1A2E]">{{ item().verifier?.name ?? '—' }}</p></div>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-[#FF8800] text-white flex items-center justify-center text-[12px] font-bold flex-shrink-0">{{ item().manager?.name?.charAt(0) ?? '?' }}</div>
                <div><p class="text-[11px] text-[#6B7280] uppercase tracking-wider">Gerente</p><p class="font-semibold text-[#1A1A2E]">{{ item().manager?.name ?? '—' }}</p></div>
              </div>
            </div>
          </div>

          <!-- Vehículos -->
          @if (item().vehicles?.length) {
            <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
              <div class="px-5 py-4 border-b border-[#E0E0E0]"><span class="font-[Montserrat] font-bold text-[14px] text-[#1A1A2E]">Vehículos ({{ item().vehicles.length }})</span></div>
              <div class="p-5 space-y-3">
                @for (v of item().vehicles; track v.id) {
                  <div class="bg-[#F8FAFD] rounded-lg p-3 text-[13px]">
                    <p class="font-semibold text-[#1A1A2E]">{{ v.brand }} {{ v.model }}</p>
                    <p class="text-[#6B7280]">Placa: {{ v.plate ?? '—' }} · Serie: {{ v.serial_number ?? '—' }}</p>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Familiares -->
          @if (item().family_members?.length) {
            <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
              <div class="px-5 py-4 border-b border-[#E0E0E0]"><span class="font-[Montserrat] font-bold text-[14px] text-[#1A1A2E]">Familiares ({{ item().family_members.length }})</span></div>
              <div class="p-5 space-y-3">
                @for (f of item().family_members; track f.id) {
                  <div class="bg-[#F8FAFD] rounded-lg p-3 text-[13px]">
                    <p class="font-semibold text-[#1A1A2E]">{{ f.personal_data?.name }} {{ f.personal_data?.first_last_name }}</p>
                    <p class="text-[#6B7280]">{{ f.relationship }}</p>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Distribuidor asignado -->
          @if (item().distributor) {
            <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
              <div class="px-5 py-4 border-b border-[#E0E0E0]"><span class="font-[Montserrat] font-bold text-[14px] text-[#1A1A2E]">Distribuidora asignada</span></div>
              <div class="p-5 text-[13px] grid grid-cols-2 gap-3">
                <div><span class="text-[#6B7280] text-[11px] uppercase tracking-wider">Nombre</span><p class="font-semibold text-[#1A1A2E] mt-0.5">{{ item().distributor?.person_data?.name }} {{ item().distributor?.person_data?.first_last_name }}</p></div>
                <div><span class="text-[#6B7280] text-[11px] uppercase tracking-wider">Categoría</span><p class="text-[#1A1A2E] mt-0.5">{{ item().distributor?.category?.name ?? '—' }}</p></div>
                <div><span class="text-[#6B7280] text-[11px] uppercase tracking-wider">Crédito actual</span><p class="font-semibold text-[#1A1A2E] mt-0.5">{{ item().distributor?.current_credit | currency:'MXN':'symbol':'1.2-2' }}</p></div>
                <div><span class="text-[#6B7280] text-[11px] uppercase tracking-wider">Crédito disponible</span><p class="font-semibold text-[#00A86B] mt-0.5">{{ item().distributor?.available_credit | currency:'MXN':'symbol':'1.2-2' }}</p></div>
              </div>
            </div>
          }

        </div>
      }
    </div>
  `,
})
export class AdminPreSolicitudDetalleComponent implements OnInit {
  private svc   = inject(AdminViewService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  item    = signal<any>(null);
  loading = signal(true);

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.svc.preSolicitudDetalle(id).subscribe({
      next: r => { this.item.set(r.data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  volver() { this.router.navigate(['/admin/pre-solicitudes']); }

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
