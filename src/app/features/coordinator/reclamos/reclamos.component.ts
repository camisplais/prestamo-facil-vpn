// src/app/features/coordinator/reclamos/reclamos.component.ts
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReclamoCoordinadorService } from '../../../core/services/reclamo-coordinador.service';
import { CoordinadorReclamo as Reclamo, CoordinadorReclamoStats as ReclamoStats, CoordinadorReclamoType as ReclamoType } from '../../../core/models';

@Component({
  selector: 'app-coordinator-reclamos',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div>
      <!-- Header -->
      <div class="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 class="font-[Montserrat] text-[22px] font-extrabold text-[#1A1A2E]">Reclamos</h1>
          <p class="text-[13px] text-[#6B7280] mt-0.5">Solicitudes de distribuidoras asignadas a ti</p>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white rounded-[10px] p-5 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] flex gap-4">
          <div class="w-11 h-11 rounded-[10px] bg-[#003399]/10 text-[#003399] flex items-center justify-center flex-shrink-0">
            <svg class="w-[22px] h-[22px]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
          </div>
          <div>
            <div class="font-[Montserrat] text-[22px] font-extrabold text-[#1A1A2E]">{{ stats()?.total ?? '—' }}</div>
            <div class="text-[12px] text-[#6B7280] mt-0.5">Total</div>
          </div>
        </div>

        <div class="bg-white rounded-[10px] p-5 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] flex gap-4">
          <div class="w-11 h-11 rounded-[10px] bg-[#FF8800]/10 text-[#FF8800] flex items-center justify-center flex-shrink-0">
            <svg class="w-[22px] h-[22px]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div>
            <div class="font-[Montserrat] text-[22px] font-extrabold text-[#1A1A2E]">{{ stats()?.pending ?? '—' }}</div>
            <div class="text-[12px] text-[#6B7280] mt-0.5">Pendientes</div>
          </div>
        </div>

        <div class="bg-white rounded-[10px] p-5 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] flex gap-4">
          <div class="w-11 h-11 rounded-[10px] bg-[#22C55E]/10 text-[#22C55E] flex items-center justify-center flex-shrink-0">
            <svg class="w-[22px] h-[22px]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div>
            <div class="font-[Montserrat] text-[22px] font-extrabold text-[#1A1A2E]">{{ stats()?.closed ?? '—' }}</div>
            <div class="text-[12px] text-[#6B7280] mt-0.5">Resueltos</div>
          </div>
        </div>

        <div class="bg-white rounded-[10px] p-5 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] flex gap-4">
          <div class="w-11 h-11 rounded-[10px] bg-[#E53935]/10 text-[#E53935] flex items-center justify-center flex-shrink-0">
            <svg class="w-[22px] h-[22px]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            </svg>
          </div>
          <div>
            <div class="font-[Montserrat] text-[22px] font-extrabold text-[#1A1A2E]">{{ stats()?.overdue_customer ?? '—' }}</div>
            <div class="text-[12px] text-[#6B7280] mt-0.5">Morosos</div>
          </div>
        </div>
      </div>

      <!-- Tabla -->
      <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
        <!-- Toolbar -->
        <div class="px-5 py-4 border-b border-[#E0E0E0] flex items-center justify-between gap-3 flex-wrap">
          <span class="font-[Montserrat] font-bold text-[14px] text-[#1A1A2E]">Lista de reclamos</span>
          <div class="flex gap-2 flex-wrap">
            @for (f of statusFilters; track f.value) {
              <button
                (click)="setStatusFilter(f.value)"
                [class]="activeStatus() === f.value
                  ? 'bg-[#003399] text-white border-transparent'
                  : 'bg-white text-[#6B7280] border-[#E0E0E0] hover:border-[#003399]'"
                class="px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors cursor-pointer border"
              >{{ f.label }}</button>
            }
            @for (f of typeFilters; track f.value) {
              <button
                (click)="setTypeFilter(f.value)"
                [class]="activeType() === f.value
                  ? 'bg-[#1A1A2E] text-white border-transparent'
                  : 'bg-white text-[#6B7280] border-[#E0E0E0] hover:border-[#1A1A2E]'"
                class="px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors cursor-pointer border"
              >{{ f.label }}</button>
            }
          </div>
        </div>

        @if (loading()) {
          <div class="flex items-center justify-center py-16 text-[#6B7280] text-[13px]">
            <svg class="w-5 h-5 animate-spin mr-2 text-[#003399]" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            Cargando reclamos…
          </div>
        } @else if (error()) {
          <div class="flex flex-col items-center justify-center py-16 text-[#E53935] text-[13px] gap-2">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z"/>
            </svg>
            <span>{{ error() }}</span>
            <button (click)="load()" class="mt-1 text-[#003399] underline text-[12px] cursor-pointer bg-transparent border-0 p-0">Reintentar</button>
          </div>
        } @else if (items().length === 0) {
          <div class="flex flex-col items-center justify-center py-16 text-[#6B7280] text-[13px] gap-2">
            <svg class="w-10 h-10 text-[#D1D5DB]" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2"/>
            </svg>
            No hay reclamos con los filtros seleccionados.
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-[13px] border-collapse">
              <thead>
                <tr>
                  @for (h of headers; track h) {
                    <th class="bg-[#F8FAFD] font-[Montserrat] font-bold text-[11px] uppercase tracking-[0.5px] text-[#6B7280] px-5 py-3 text-left border-b border-[#E0E0E0] whitespace-nowrap">{{ h }}</th>
                  }
                </tr>
              </thead>
              <tbody>
                @for (r of items(); track r.id) {
                  <tr class="border-b border-[#F0F0F0] hover:bg-[#F8FAFD] transition-colors">
                    <td class="px-5 py-3 font-semibold text-[#1A1A2E] whitespace-nowrap">{{ clientName(r) }}</td>
                    <td class="px-5 py-3 text-[#6B7280]">{{ distribuidoraName(r) }}</td>
                    <td class="px-5 py-3">
                      <span [class]="typeBadge(r.type)">{{ typeLabel(r.type) }}</span>
                    </td>
                    <td class="px-5 py-3">
                      <span [class]="statusBadge(r.status)">{{ statusLabel(r.status) }}</span>
                    </td>
                    <td class="px-5 py-3 text-[#6B7280] max-w-[200px] truncate" [title]="r.comments ?? ''">{{ r.comments }}</td>
                    <td class="px-5 py-3 text-[#6B7280] whitespace-nowrap">{{ formatDate(r.created_at) }}</td>
                    <td class="px-5 py-3">
                      <a
                        [routerLink]="['/coordinador/reclamos', r.id]"
                        class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-[#003399]/10 text-[#003399] hover:bg-[#003399]/20 transition-colors no-underline"
                      >
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.641 0-8.573-3.007-9.964-7.178z"/>
                          <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                        Ver
                      </a>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>
  `,
})
export class CoordinadorReclamosComponent implements OnInit {
  private svc = inject(ReclamoCoordinadorService);

  items   = signal<Reclamo[]>([]);
  stats   = signal<ReclamoStats | null>(null);
  loading = signal(true);
  error   = signal<string | null>(null);

  activeStatus = signal<string>('');
  activeType   = signal<string>('');

  headers = ['Cliente', 'Distribuidora', 'Tipo', 'Estado', 'Motivo', 'Fecha', 'Acción'];

  statusFilters = [
    { label: 'Todos',      value: '' },
    { label: 'Pendientes', value: 'pending' },
    { label: 'Aprobados',  value: 'approved' },
    { label: 'Rechazados', value: 'rejected' },
  ];

  typeFilters = [
    { label: 'Todos los tipos',  value: '' },
    { label: 'Cambio cliente',   value: 'change_clients' },
    { label: 'Moroso',           value: 'overdue_customer' },
  ];

  ngOnInit() {
    this.load();
    this.loadStats();
  }

  load() {
    this.loading.set(true);
    this.error.set(null);
    this.svc.getAll(this.activeStatus() || undefined, this.activeType() || undefined).subscribe({
      next: res => {
        this.items.set(res.data?.data ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los reclamos. Intenta de nuevo.');
        this.loading.set(false);
      },
    });
  }

  loadStats() {
    this.svc.getStats().subscribe({
      next: res => this.stats.set(res.data),
      error: () => {},
    });
  }

  setStatusFilter(value: string) {
    this.activeStatus.set(value);
    this.load();
  }

  setTypeFilter(value: string) {
    this.activeType.set(value);
    this.load();
  }

  clientName(r: Reclamo): string {
    return r.customer_name
      ? `${r.customer_name} ${r.customer_first_last_name ?? ''}`.trim()
      : r.customer_id ? `Cliente #${r.customer_id}` : '—';
  }

  distribuidoraName(r: Reclamo): string {
    const p = r.distributor?.person_data;
    return p ? `${p.name} ${p.first_last_name}` : `Dist. #${r.distributor_id}`;
  }

  typeLabel(type: ReclamoType): string {
    return type === 'change_clients' ? 'Cambio de cliente' : 'Cliente moroso';
  }

  typeBadge(type: ReclamoType): string {
    const base = 'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold';
    return type === 'change_clients'
      ? `${base} bg-[#0288D1]/10 text-[#0288D1]`
      : `${base} bg-[#E53935]/10 text-[#E53935]`;
  }

  statusLabel(status: string): string {
    if (status === 'pending')  return 'Pendiente';
    if (status === 'approved') return 'Aprobado';
    if (status === 'rejected') return 'Rechazado';
    return 'Cerrado';
  }

  statusBadge(status: string): string {
    const base = 'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold';
    if (status === 'pending')  return `${base} bg-[#FF8800]/10 text-[#FF8800]`;
    if (status === 'approved') return `${base} bg-[#22C55E]/10 text-[#22C55E]`;
    return `${base} bg-[#E53935]/10 text-[#E53935]`;
  }

  formatDate(date?: string): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('es-MX', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  }
}