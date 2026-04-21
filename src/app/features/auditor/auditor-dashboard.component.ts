import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuditorService, AuditDashboard } from '../../core/services/auditor.service';

@Component({
  selector: 'app-auditor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-6">

      <!-- Header -->
      <div>
        <h1 class="font-[Montserrat] text-[22px] font-extrabold text-[#1A1A2E]">Dashboard de Auditoría</h1>
        <p class="text-[13px] text-[#6B7280] mt-1">Resumen de actividad y movimientos del sistema</p>
      </div>

      <!-- Stats -->
      @if (data()) {
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] p-5 flex gap-4 items-start">
            <div class="w-11 h-11 rounded-[10px] bg-[#003399]/10 flex items-center justify-center text-[#003399] flex-shrink-0">
              <svg class="w-[22px] h-[22px]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            </div>
            <div>
              <div class="font-[Montserrat] text-[22px] font-extrabold">{{ data()!.stats.total_logs | number }}</div>
              <div class="text-[12px] text-[#6B7280] mt-0.5">Registros totales</div>
            </div>
          </div>

          <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] p-5 flex gap-4 items-start">
            <div class="w-11 h-11 rounded-[10px] bg-[#FF8800]/12 flex items-center justify-center text-[#FF8800] flex-shrink-0">
              <svg class="w-[22px] h-[22px]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
              </svg>
            </div>
            <div>
              <div class="font-[Montserrat] text-[22px] font-extrabold">{{ data()!.stats.logs_hoy }}</div>
              <div class="text-[12px] text-[#6B7280] mt-0.5">Eventos hoy</div>
            </div>
          </div>

          <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] p-5 flex gap-4 items-start">
            <div class="w-11 h-11 rounded-[10px] bg-[#00A86B]/10 flex items-center justify-center text-[#00A86B] flex-shrink-0">
              <svg class="w-[22px] h-[22px]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <div>
              <div class="font-[Montserrat] text-[22px] font-extrabold">{{ data()!.stats.pre_solicitudes }}</div>
              <div class="text-[12px] text-[#6B7280] mt-0.5">Pre-solicitudes</div>
            </div>
          </div>

          <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] p-5 flex gap-4 items-start">
            <div class="w-11 h-11 rounded-[10px] bg-[#0288D1]/10 flex items-center justify-center text-[#0288D1] flex-shrink-0">
              <svg class="w-[22px] h-[22px]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
            <div>
              <div class="font-[Montserrat] text-[22px] font-extrabold">{{ data()!.stats.usuarios }}</div>
              <div class="text-[12px] text-[#6B7280] mt-0.5">Usuarios en sistema</div>
            </div>
          </div>
        </div>

        <!-- Actividad reciente -->
        <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
          <div class="px-5 py-4 border-b border-[#E0E0E0] flex items-center justify-between">
            <span class="font-[Montserrat] font-bold text-[14px] text-[#1A1A2E]">Actividad reciente</span>
            <a routerLink="/auditor/logs" class="text-[12px] text-[#003399] font-semibold hover:underline">Ver todo →</a>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-[13px] border-collapse">
              <thead>
                <tr>
                  <th class="bg-[#F8FAFD] font-[Montserrat] font-bold text-[11px] text-[#6B7280] uppercase tracking-[0.5px] px-[14px] py-[11px] text-left border-b-2 border-[#E0E0E0]">Método</th>
                  <th class="bg-[#F8FAFD] font-[Montserrat] font-bold text-[11px] text-[#6B7280] uppercase tracking-[0.5px] px-[14px] py-[11px] text-left border-b-2 border-[#E0E0E0]">Tabla</th>
                  <th class="bg-[#F8FAFD] font-[Montserrat] font-bold text-[11px] text-[#6B7280] uppercase tracking-[0.5px] px-[14px] py-[11px] text-left border-b-2 border-[#E0E0E0]">Usuario</th>
                  <th class="bg-[#F8FAFD] font-[Montserrat] font-bold text-[11px] text-[#6B7280] uppercase tracking-[0.5px] px-[14px] py-[11px] text-left border-b-2 border-[#E0E0E0]">Fecha</th>
                </tr>
              </thead>
              <tbody>
                @for (log of data()!.recientes; track log.id) {
                  <tr class="border-b border-[#F0F0F0] hover:bg-[#FAFBFF]">
                    <td class="px-[14px] py-[12px]">
                      <span [class]="methodClass(log.method)"
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
                        {{ log.method }}
                      </span>
                    </td>
                    <td class="px-[14px] py-[12px] font-mono text-[12px] bg-[#F0F4FF] rounded text-[#003399] px-2">
                      {{ log.table_name }}
                    </td>
                    <td class="px-[14px] py-[12px] text-[#6B7280]">
                      {{ log.users?.[0]?.name ?? '—' }}
                    </td>
                    <td class="px-[14px] py-[12px] text-[#6B7280]">
                      {{ log.occurred_at | date:'dd/MM/yyyy HH:mm' }}
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      } @else if (loading()) {
        <div class="flex items-center justify-center h-40 text-[#6B7280] text-[14px]">Cargando...</div>
      }
    </div>
  `,
})
export class AuditorDashboardComponent implements OnInit {
  private svc = inject(AuditorService);

  data    = signal<AuditDashboard | null>(null);
  loading = signal(true);

  ngOnInit() {
    this.svc.dashboard().subscribe({
      next: d => { this.data.set(d); this.loading.set(false); },
      error: ()  => this.loading.set(false),
    });
  }

  methodClass(method: string) {
    const map: Record<string, string> = {
      POST:  'bg-[#003399]/10 text-[#003399]',
      PUT:   'bg-[#FF8800]/12 text-[#FF8800]',
      PATCH: 'bg-[#F59E0B]/12 text-[#B45309]',
      GET:   'bg-[#6B7280]/10 text-[#6B7280]',
    };
    return map[method] ?? 'bg-[#6B7280]/10 text-[#6B7280]';
  }
}
