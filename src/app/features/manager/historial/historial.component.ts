import {
  ChangeDetectionStrategy,
  Component,
  computed,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ManagerHistorialService,
  DistribuidoraResumen,
  DistribuidoraDetalle,
  PagoHistorial,
} from '../../../core/services/manager-historial.service';
import { PaginationControlsComponent } from '../../../shared/components/pagination-controls.component';

type HistorialPaginatedResponse = {
  distribuidor: DistribuidoraDetalle;
  historial: {
    data: PagoHistorial[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
      from: number;
      to: number;
    };
  };
};

@Component({
  selector: 'app-manager-historial',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, DecimalPipe, PaginationControlsComponent],
  template: `
    <div>
      <div class="mb-6">
        <h1 class="font-[Montserrat] text-[22px] font-extrabold text-[#1A1A2E]">Historial de Pagos</h1>
        <p class="text-[13px] text-[#6B7280] mt-0.5">Seguimiento de conciliaciones quincenales por distribuidora</p>
      </div>

      @if (!selected()) {
        <!-- ── LISTA ── -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
          <div class="bg-white rounded-[10px] p-5 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
            <div class="font-[Montserrat] text-[24px] font-extrabold text-[#003399]">{{ resumenLista().total }}</div>
            <div class="text-[12px] text-[#6B7280] mt-0.5">Total distribuidoras</div>
          </div>
          <div class="bg-white rounded-[10px] p-5 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
            <div class="font-[Montserrat] text-[24px] font-extrabold text-[#00A86B]">{{ resumenLista().alDia }}</div>
            <div class="text-[12px] text-[#6B7280] mt-0.5">Al día (último pago)</div>
          </div>
          <div class="bg-white rounded-[10px] p-5 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
            <div class="font-[Montserrat] text-[24px] font-extrabold text-[#E53935]">{{ resumenLista().conDeuda }}</div>
            <div class="text-[12px] text-[#6B7280] mt-0.5">Con deuda pendiente</div>
          </div>
          <div class="bg-white rounded-[10px] p-5 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
            <div class="font-[Montserrat] text-[24px] font-extrabold text-[#1A1A2E]">\${{ resumenLista().totalCobrado | number:'1.0-0' }}</div>
            <div class="text-[12px] text-[#6B7280] mt-0.5">Total cobrado acumulado</div>
          </div>
        </div>

        <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
          <div class="px-5 py-4 border-b border-[#E0E0E0] flex items-center justify-between gap-3">
            <span class="font-[Montserrat] font-bold text-[14px] text-[#1A1A2E]">
              Distribuidoras — {{ paginationLista().total }} resultado(s)
            </span>
            <input
              type="text"
              [(ngModel)]="busqueda"
              (ngModelChange)="onSearchChange($event)"
              placeholder="Buscar por nombre o referencia..."
              class="border border-[#E0E0E0] rounded-lg px-3 py-1.5 text-[13px] text-[#1A1A2E] focus:outline-none focus:border-[#003399] w-[240px]"
            />
          </div>

          @if (loadingLista()) {
            <div class="flex items-center justify-center py-16 text-[#6B7280] text-[13px]">
              <svg class="w-5 h-5 animate-spin mr-2 text-[#003399]" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
              Cargando...
            </div>
          } @else {
            <div class="overflow-x-auto">
              <table class="w-full text-[13px] border-collapse">
                <thead>
                  <tr>
                    @for (h of ['Distribuidora', 'Categoría', 'Quincenas', 'Total cobrado', 'Deuda actual', 'Saldo a favor', 'Último estado', '']; track h) {
                      <th class="bg-[#F8FAFD] font-[Montserrat] font-bold text-[11px] uppercase tracking-[0.5px] text-[#6B7280] px-5 py-3 text-left border-b border-[#E0E0E0] whitespace-nowrap">{{ h }}</th>
                    }
                  </tr>
                </thead>
                <tbody>
                  @for (d of lista(); track d.id) {
                    <tr class="border-b border-[#F0F0F0] hover:bg-[#F8FAFD] transition-colors">
                      <td class="px-5 py-3">
                        <p class="font-semibold text-[#1A1A2E]">{{ d.nombre || '—' }}</p>
                        <p class="text-[11px] text-[#6B7280] font-mono mt-0.5">{{ d.reference_number || '—' }}</p>
                      </td>
                      <td class="px-5 py-3 text-[#6B7280]">{{ d.categoria || '—' }}</td>
                      <td class="px-5 py-3 text-center">
                        <span class="font-extrabold text-[#003399] text-[16px]">{{ d.total_pagos }}</span>
                        <p class="text-[11px] text-[#6B7280]">registradas</p>
                      </td>
                      <td class="px-5 py-3 text-right">
                        <p class="font-semibold text-[#1A1A2E]">\${{ d.total_pagado | number:'1.2-2' }}</p>
                        <p class="text-[11px] text-[#6B7280]">acumulado</p>
                      </td>
                      <td class="px-5 py-3 text-right">
                        @if (d.deuda_actual > 0) {
                          <p class="font-semibold text-[#E53935]">\${{ d.deuda_actual | number:'1.2-2' }}</p>
                          <p class="text-[11px] text-[#E53935]/70">pendiente</p>
                        } @else {
                          <span class="text-[11px] font-semibold text-[#00A86B]">Sin deuda</span>
                        }
                      </td>
                      <td class="px-5 py-3 text-right">
                        @if (d.saldo_favor > 0) {
                          <p class="font-semibold text-[#00A86B]">\${{ d.saldo_favor | number:'1.2-2' }}</p>
                          <p class="text-[11px] text-[#00A86B]/70">a su favor</p>
                        } @else {
                          <span class="text-[#6B7280]">—</span>
                        }
                      </td>
                      <td class="px-5 py-3">
                        @if (d.ultimo_status) {
                          <span [class]="statusClass(d.ultimo_status)" class="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border">
                            {{ statusLabel(d.ultimo_status) }}
                          </span>
                          <p class="text-[11px] text-[#6B7280] mt-1">{{ formatDate(d.ultimo_pago) }}</p>
                        } @else {
                          <span class="text-[#6B7280] text-[12px]">Sin pagos</span>
                        }
                      </td>
                      <td class="px-5 py-3">
                        <button
                          (click)="verDetalle(d)"
                          class="bg-[#003399] text-white hover:bg-[#002277] px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors cursor-pointer border-0 whitespace-nowrap"
                        >Ver historial →</button>
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="8" class="px-5 py-12 text-center text-[#6B7280] text-[13px]">
                        No se encontraron distribuidoras.
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }

          <app-pagination-controls
            [currentPage]="currentPageLista()"
            [totalPages]="totalPagesLista()"
            [totalItems]="paginationLista().total"
            [rangeStart]="rangeStartLista()"
            [rangeEnd]="rangeEndLista()"
            (pageChange)="goToPageLista($event)"
          />
        </div>

      } @else {
        <!-- ── DETALLE ── -->
        <div class="mb-5 flex items-center gap-3">
          <button
            (click)="volverLista()"
            class="flex items-center gap-1.5 text-[#6B7280] hover:text-[#003399] transition-colors border-0 bg-transparent cursor-pointer text-[13px] font-medium"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
            Volver a la lista
          </button>
          <span class="text-[#E0E0E0]">|</span>
          <div>
            <span class="font-[Montserrat] text-[17px] font-extrabold text-[#1A1A2E]">{{ detalle()?.distribuidor?.nombre }}</span>
            <span class="text-[12px] text-[#6B7280] ml-2">{{ detalle()?.distribuidor?.reference_number }} · {{ detalle()?.distribuidor?.categoria }}</span>
          </div>
        </div>

        <!-- Summary cards -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
          <div class="bg-white rounded-[10px] p-5 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
            <div class="font-[Montserrat] text-[22px] font-extrabold text-[#003399]">{{ detalle()?.distribuidor?.total_pagos }}</div>
            <div class="text-[12px] text-[#6B7280] mt-0.5">Quincenas registradas</div>
          </div>
          <div class="bg-white rounded-[10px] p-5 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
            <div class="font-[Montserrat] text-[22px] font-extrabold text-[#1A1A2E]">\${{ (detalle()?.distribuidor?.total_pagado ?? 0) | number:'1.2-2' }}</div>
            <div class="text-[12px] text-[#6B7280] mt-0.5">Total cobrado</div>
          </div>
          <div class="bg-white rounded-[10px] p-5 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
            @if ((detalle()?.distribuidor?.deuda_actual ?? 0) > 0) {
              <div class="font-[Montserrat] text-[22px] font-extrabold text-[#E53935]">\${{ (detalle()?.distribuidor?.deuda_actual ?? 0) | number:'1.2-2' }}</div>
              <div class="text-[12px] text-[#6B7280] mt-0.5">Deuda actual</div>
            } @else {
              <div class="font-[Montserrat] text-[22px] font-extrabold text-[#00A86B]">Sin deuda</div>
              <div class="text-[12px] text-[#6B7280] mt-0.5">Estado actual</div>
            }
          </div>
          <div class="bg-white rounded-[10px] p-5 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
            @if ((detalle()?.distribuidor?.saldo_favor ?? 0) > 0) {
              <div class="font-[Montserrat] text-[22px] font-extrabold text-[#00A86B]">\${{ (detalle()?.distribuidor?.saldo_favor ?? 0) | number:'1.2-2' }}</div>
            } @else {
              <div class="font-[Montserrat] text-[22px] font-extrabold text-[#6B7280]">—</div>
            }
            <div class="text-[12px] text-[#6B7280] mt-0.5">Saldo a favor</div>
          </div>
        </div>

        <!-- Filtros -->
        <div class="bg-white rounded-[10px] border border-[#E0E0E0] px-5 py-4 mb-5 shadow-[0_2px_8px_rgba(0,51,153,0.06)]">
          <div class="flex flex-wrap items-end gap-4">
            <div class="flex flex-col gap-1">
              <label class="text-[11px] font-bold text-[#6B7280] uppercase tracking-wide">Período desde</label>
              <input type="date" [(ngModel)]="fechaInicio" [max]="today"
                class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] text-[#1A1A2E] focus:outline-none focus:border-[#003399] w-[160px]"/>
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-[11px] font-bold text-[#6B7280] uppercase tracking-wide">Período hasta</label>
              <input type="date" [(ngModel)]="fechaFin" [max]="today" [min]="fechaInicio || ''"
                class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] text-[#1A1A2E] focus:outline-none focus:border-[#003399] w-[160px]"/>
            </div>
            <button (click)="filtrarDetalle()" [disabled]="loadingDetalle()"
              class="bg-[#003399] text-white px-5 py-2 rounded-lg text-[13px] font-semibold hover:bg-[#002277] transition-colors cursor-pointer border-0 disabled:opacity-50">
              Filtrar
            </button>
            @if (fechaInicio || fechaFin) {
              <button (click)="limpiarFiltro()"
                class="text-[#6B7280] hover:text-[#E53935] text-[13px] font-medium cursor-pointer border-0 bg-transparent underline">
                Limpiar
              </button>
            }
          </div>
        </div>

        <!-- Tarjetas de quincena -->
        @if (loadingDetalle()) {
          <div class="flex items-center justify-center py-16 text-[#6B7280] text-[13px] bg-white rounded-[10px] border border-[#E0E0E0]">
            <svg class="w-5 h-5 animate-spin mr-2 text-[#003399]" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
            Cargando historial...
          </div>
        } @else if (!detalle()?.historial?.data?.length) {
          <div class="bg-white rounded-[10px] border border-[#E0E0E0] py-16 text-center text-[#6B7280] text-[13px]">
            No hay registros de pago para esta distribuidora.
          </div>
        } @else {
          <p class="text-[11px] text-[#6B7280] mb-3 font-medium uppercase tracking-wide">
            Mostrando {{ rangeStartDetalle() }}–{{ rangeEndDetalle() }} de {{ paginationDetalle().total }} quincena(s) · Toca una fila para ver el desglose completo
          </p>
          <div class="flex flex-col gap-3">
            @for (p of detalle()!.historial.data; track p.id) {
              <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_8px_rgba(0,51,153,0.06)] overflow-hidden">

                <!-- Fila principal clickeable -->
                <button
                  (click)="togglePago(p.id)"
                  class="w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-[#F8FAFD] transition-colors cursor-pointer bg-transparent border-0"
                >
                  <!-- Período -->
                  <div class="min-w-[150px] shrink-0">
                    <p class="font-[Montserrat] font-bold text-[13px] text-[#1A1A2E]">{{ formatPeriod(p.period_start, p.period_end) }}</p>
                    <p class="text-[11px] text-[#6B7280] mt-0.5">
                      {{ formatDate(p.payment_date) !== '—' ? 'Pagó el ' + formatDate(p.payment_date) : 'Sin fecha de pago' }}
                    </p>
                  </div>

                  <!-- Estado -->
                  <span [class]="statusClass(p.status)" class="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border whitespace-nowrap shrink-0">
                    {{ statusLabel(p.status) }}
                  </span>

                  <!-- Barra de progreso + montos -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between text-[12px] mb-1.5">
                      <span class="text-[#6B7280]">A cobrar: <strong class="text-[#1A1A2E]">\${{ p.total_expected | number:'1.2-2' }}</strong></span>
                      <span class="text-[#003399] font-semibold">Pagó: \${{ p.amount_paid | number:'1.2-2' }} ({{ pctPagado(p) }}%)</span>
                    </div>
                    <div class="h-2 bg-[#F0F0F0] rounded-full overflow-hidden">
                      <div class="h-full rounded-full transition-all duration-500"
                        [style.width.%]="pctPagado(p)"
                        [class]="pctPagado(p) >= 100 ? 'bg-[#00A86B]' : pctPagado(p) >= 75 ? 'bg-[#FF8800]' : 'bg-[#E53935]'">
                      </div>
                    </div>
                  </div>

                  <!-- Resultado -->
                  <div class="shrink-0 text-right min-w-[90px]">
                    @if (p.debt > 0) {
                      <p class="text-[12px] font-semibold text-[#E53935]">Deuda</p>
                      <p class="text-[12px] font-extrabold text-[#E53935]">\${{ p.debt | number:'1.0-0' }}</p>
                    } @else if (p.over_payment > 0) {
                      <p class="text-[12px] font-semibold text-[#00A86B]">A favor</p>
                      <p class="text-[12px] font-extrabold text-[#00A86B]">\${{ p.over_payment | number:'1.0-0' }}</p>
                    } @else {
                      <p class="text-[12px] font-semibold text-[#00A86B]">Liquidado</p>
                    }
                  </div>

                  <!-- Flecha -->
                  <svg class="w-4 h-4 text-[#6B7280] shrink-0 transition-transform duration-200"
                    [class.rotate-180]="expandedPagoId() === p.id"
                    fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>

                <!-- Desglose expandido -->
                @if (expandedPagoId() === p.id) {
                  <div class="border-t border-[#F0F0F0] px-5 py-4 bg-[#F8FAFD]">
                    <div class="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4 text-[13px]">
                      <div>
                        <p class="text-[10px] text-[#6B7280] uppercase font-bold tracking-wide mb-0.5">Cuota quincenal base</p>
                        <p class="font-semibold text-[#1A1A2E]">\${{ p.total_biweekly | number:'1.2-2' }}</p>
                      </div>
                      <div>
                        <p class="text-[10px] text-[#6B7280] uppercase font-bold tracking-wide mb-0.5">Deuda arrastrada del período anterior</p>
                        <p class="font-semibold" [class]="p.previous_debt > 0 ? 'text-[#E53935]' : 'text-[#6B7280]'">
                          {{ p.previous_debt > 0 ? '$' + (p.previous_debt | number:'1.2-2') : 'Sin arrastre' }}
                        </p>
                      </div>
                      <div>
                        <p class="text-[10px] text-[#6B7280] uppercase font-bold tracking-wide mb-0.5">Saldo a favor del período anterior</p>
                        <p class="font-semibold" [class]="p.previous_over_payment > 0 ? 'text-[#00A86B]' : 'text-[#6B7280]'">
                          {{ p.previous_over_payment > 0 ? '$' + (p.previous_over_payment | number:'1.2-2') : '—' }}
                        </p>
                      </div>
                      <div>
                        <p class="text-[10px] text-[#6B7280] uppercase font-bold tracking-wide mb-0.5">Diferencia (pagado − a cobrar)</p>
                        <p class="font-semibold" [class]="p.difference >= 0 ? 'text-[#00A86B]' : 'text-[#E53935]'">
                          {{ p.difference >= 0 ? '+' : '' }}\${{ p.difference | number:'1.2-2' }}
                        </p>
                      </div>
                      <div>
                        <p class="text-[10px] text-[#6B7280] uppercase font-bold tracking-wide mb-0.5">Penalización por retraso</p>
                        <p class="font-semibold" [class]="p.penalty > 0 ? 'text-[#FF8800]' : 'text-[#6B7280]'">
                          {{ p.penalty > 0 ? '$' + (p.penalty | number:'1.2-2') : 'Sin penalización' }}
                        </p>
                      </div>
                      <div>
                        <p class="text-[10px] text-[#6B7280] uppercase font-bold tracking-wide mb-0.5">Registrado por</p>
                        <p class="font-semibold text-[#1A1A2E]">{{ p.registrado_por || '—' }}</p>
                      </div>
                    </div>
                  </div>
                }
              </div>
            }
          </div>

          <app-pagination-controls
            [currentPage]="currentPageDetalle()"
            [totalPages]="totalPagesDetalle()"
            [totalItems]="paginationDetalle().total"
            [rangeStart]="rangeStartDetalle()"
            [rangeEnd]="rangeEndDetalle()"
            (pageChange)="goToPageDetalle($event)"
          />
        }
      }
    </div>
  `,
})
export class HistorialComponent implements OnInit {
  private svc = inject(ManagerHistorialService);

  lista = signal<DistribuidoraResumen[]>([]);
  currentPageLista = signal(1);
  readonly pageSizeLista = 15;
  paginationLista = signal({ current_page: 1, last_page: 1, per_page: 15, total: 0, from: 0, to: 0 });

  selected = signal<DistribuidoraResumen | null>(null);
  detalle = signal<HistorialPaginatedResponse | null>(null);
  currentPageDetalle = signal(1);
  readonly pageSizeDetalle = 15;
  paginationDetalle = signal({ current_page: 1, last_page: 1, per_page: 15, total: 0, from: 0, to: 0 });

  loadingLista = signal(false);
  loadingDetalle = signal(false);
  expandedPagoId = signal<number | null>(null);

  busqueda = '';
  fechaInicio = '';
  fechaFin = '';
  today = new Date().toISOString().split('T')[0];

  private searchDebounce?: ReturnType<typeof setTimeout>;

  totalPagesLista = computed(() => Math.max(1, this.paginationLista().last_page));
  rangeStartLista = computed(() => this.paginationLista().total === 0 ? 0 : this.paginationLista().from);
  rangeEndLista = computed(() => this.paginationLista().total === 0 ? 0 : this.paginationLista().to);

  totalPagesDetalle = computed(() => Math.max(1, this.paginationDetalle().last_page));
  rangeStartDetalle = computed(() => this.paginationDetalle().total === 0 ? 0 : this.paginationDetalle().from);
  rangeEndDetalle = computed(() => this.paginationDetalle().total === 0 ? 0 : this.paginationDetalle().to);

  resumenLista = () => {
    const l = this.lista();
    return {
      total: this.paginationLista().total,
      conDeuda: l.filter(d => d.deuda_actual > 0).length,
      alDia: l.filter(d => d.ultimo_status === 'on_time' || d.ultimo_status === 'early').length,
      totalCobrado: l.reduce((s, d) => s + d.total_pagado, 0),
    };
  };

  togglePago(id: number) {
    this.expandedPagoId.set(this.expandedPagoId() === id ? null : id);
  }

  pctPagado = (p: PagoHistorial) =>
    p.total_expected > 0 ? Math.min(100, Math.round((p.amount_paid / p.total_expected) * 100)) : 0;

  formatPeriod = (start: string, end: string) => {
    const parse = (d: string) => { const p = (d ?? '').split('T')[0].split('-').map(Number); return { y: p[0], m: p[1], day: p[2] }; };
    const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    const s = parse(start), e = parse(end);
    if (!s.y) return '—';
    return s.m === e.m && s.y === e.y
      ? `${s.day} – ${e.day} ${months[s.m - 1]} ${s.y}`
      : `${s.day} ${months[s.m - 1]} – ${e.day} ${months[e.m - 1]} ${s.y}`;
  };

  ngOnInit() {
    this.loadLista();
  }

  onSearchChange(value: string) {
    this.busqueda = value;
    this.currentPageLista.set(1);

    if (this.searchDebounce) {
      clearTimeout(this.searchDebounce);
    }

    this.searchDebounce = setTimeout(() => this.loadLista(), 300);
  }

  goToPageLista(page: number) {
    const nextPage = Math.max(1, Math.min(page, this.totalPagesLista()));
    if (nextPage !== this.currentPageLista()) {
      this.currentPageLista.set(nextPage);
      this.loadLista();
    }
  }

  private loadLista() {
    this.loadingLista.set(true);
    this.svc.getAll(this.busqueda.trim() || undefined, this.currentPageLista(), this.pageSizeLista).subscribe({
      next: res => {
        this.lista.set(res.data);
        this.paginationLista.set(res.pagination);
        this.currentPageLista.set(res.pagination.current_page);
        this.loadingLista.set(false);
      },
      error: () => this.loadingLista.set(false),
    });
  }

  verDetalle(d: DistribuidoraResumen) {
    this.selected.set(d);
    this.fechaInicio = '';
    this.fechaFin = '';
    this.expandedPagoId.set(null);
    this.currentPageDetalle.set(1);
    this.cargarDetalle(d.id);
  }

  goToPageDetalle(page: number) {
    const nextPage = Math.max(1, Math.min(page, this.totalPagesDetalle()));
    if (nextPage !== this.currentPageDetalle()) {
      this.currentPageDetalle.set(nextPage);
      this.cargarDetalle(this.selected()!.id);
    }
  }

  filtrarDetalle() {
    if (!this.selected()) return;
    this.currentPageDetalle.set(1);
    this.cargarDetalle(this.selected()!.id);
  }

  limpiarFiltro() {
    this.fechaInicio = '';
    this.fechaFin = '';
    if (!this.selected()) return;
    this.currentPageDetalle.set(1);
    this.cargarDetalle(this.selected()!.id);
  }

  volverLista() {
    this.selected.set(null);
    this.detalle.set(null);
    this.expandedPagoId.set(null);
  }

  private cargarDetalle(id: number) {
    this.loadingDetalle.set(true);
    this.expandedPagoId.set(null);
    this.svc.getOne(
      id,
      this.fechaInicio || undefined,
      this.fechaFin || undefined,
      this.currentPageDetalle(),
      this.pageSizeDetalle,
    ).subscribe({
      next: res => {
        this.detalle.set(res as HistorialPaginatedResponse);
        this.paginationDetalle.set(res.historial.pagination);
        this.currentPageDetalle.set(res.historial.pagination.current_page);
        this.loadingDetalle.set(false);
      },
      error: () => this.loadingDetalle.set(false),
    });
  }

  statusLabel = (s: string) => ({ early: 'Anticipado', on_time: 'A tiempo', late: 'Tardío', pending: 'Pendiente' }[s] ?? s);
  statusClass  = (s: string) => ({
    early:   'bg-[#0288D1]/10 text-[#0288D1] border-[#0288D1]/20',
    on_time: 'bg-[#00A86B]/10 text-[#00A86B] border-[#00A86B]/20',
    late:    'bg-[#E53935]/10 text-[#E53935] border-[#E53935]/20',
    pending: 'bg-[#FF8800]/10 text-[#FF8800] border-[#FF8800]/20',
  }[s] ?? 'bg-[#F8FAFD] text-[#6B7280] border-[#E0E0E0]');

  formatDate = (d?: string | null) => d ? new Date(d).toLocaleDateString('es-MX') : '—';
}
