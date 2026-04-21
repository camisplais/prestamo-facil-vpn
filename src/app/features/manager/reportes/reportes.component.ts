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
import { PaginationControlsComponent } from '../../../shared/components/pagination-controls.component';
import {
  ManagerReporteService,
  DistribuidoraMorosa,
  PreSolicitudReporte,
  SaldoCorte,
  SaldoPunto,
  CorteActivo,
} from '../../../core/services/manager-reporte.service';

type Tab = 'morosas' | 'pre-solicitudes' | 'saldo-cortes' | 'saldo-puntos';

@Component({
  selector: 'app-manager-reportes',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, DecimalPipe, PaginationControlsComponent],
  template: `
    <div>
      <!-- Encabezado -->
      <div class="mb-6">
        <h1 class="font-[Montserrat] text-[22px] font-extrabold text-[#1A1A2E]">Reportes</h1>
        <p class="text-[13px] text-[#6B7280] mt-0.5">Consulta y filtra reportes operativos de tu sucursal</p>
      </div>

      <!-- Tabs -->
      <div class="flex gap-1 mb-6 bg-white rounded-[10px] border border-[#E0E0E0] p-1 w-fit shadow-[0_2px_8px_rgba(0,51,153,0.06)]">
        @for (tab of tabs; track tab.id) {
          <button
            (click)="setTab(tab.id)"
            [class]="activeTab() === tab.id
              ? 'bg-[#003399] text-white shadow-sm'
              : 'text-[#6B7280] hover:text-[#1A1A2E]'"
            class="px-4 py-2 rounded-lg text-[13px] font-semibold transition-all cursor-pointer border-0"
          >{{ tab.label }}</button>
        }
      </div>

      <!-- Filtros comunes -->
      <div class="bg-white rounded-[10px] border border-[#E0E0E0] px-5 py-4 mb-5 shadow-[0_2px_8px_rgba(0,51,153,0.06)]">
        <div class="flex flex-wrap items-end gap-4">
          <div class="flex flex-col gap-1">
            <label class="text-[11px] font-bold text-[#6B7280] uppercase tracking-wide">Fecha inicio</label>
            <input
              type="date"
              [(ngModel)]="fechaInicio"
              [max]="today"
              class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] text-[#1A1A2E] focus:outline-none focus:border-[#003399] w-[160px]"
            />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-[11px] font-bold text-[#6B7280] uppercase tracking-wide">Fecha fin</label>
            <input
              type="date"
              [(ngModel)]="fechaFin"
              [max]="today"
              [min]="fechaInicio || ''"
              class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] text-[#1A1A2E] focus:outline-none focus:border-[#003399] w-[160px]"
            />
          </div>

          @if (activeTab() === 'pre-solicitudes') {
            <div class="flex flex-col gap-1">
              <label class="text-[11px] font-bold text-[#6B7280] uppercase tracking-wide">Estado</label>
              <select
                [(ngModel)]="estadoFiltro"
                class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] text-[#1A1A2E] focus:outline-none focus:border-[#003399] w-[160px] bg-white"
              >
                <option value="">Todos</option>
                <option value="pending">Pendiente</option>
                <option value="verified">Verificada</option>
                <option value="approved">Aprobada</option>
                <option value="rejected">Rechazada</option>
              </select>
            </div>
          }

          <button
            (click)="buscar()"
            [disabled]="loading()"
            class="bg-[#003399] text-white px-5 py-2 rounded-lg text-[13px] font-semibold hover:bg-[#002277] transition-colors cursor-pointer border-0 disabled:opacity-50"
          >
            @if (loading()) {
              <svg class="w-4 h-4 animate-spin inline mr-1" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
            }
            Buscar
          </button>

          @if (fechaInicio || fechaFin || estadoFiltro) {
            <button
              (click)="limpiar()"
              class="text-[#6B7280] hover:text-[#E53935] text-[13px] font-medium cursor-pointer border-0 bg-transparent underline"
            >Limpiar filtros</button>
          }
        </div>

        @if (errorMsg()) {
          <p class="mt-3 text-[12px] text-[#E53935] font-medium">{{ errorMsg() }}</p>
        }
      </div>

      <!-- ── Tab: Distribuidoras Morosas ── -->
      @if (activeTab() === 'morosas') {
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-5">
          <div class="bg-white rounded-[10px] p-5 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
            <div class="font-[Montserrat] text-[24px] font-extrabold text-[#E53935]">{{ pagination().total }}</div>
            <div class="text-[12px] text-[#6B7280] mt-0.5">Distribuidoras en buró</div>
          </div>
          <div class="bg-white rounded-[10px] p-5 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
            <div class="font-[Montserrat] text-[24px] font-extrabold text-[#1A1A2E]">{{ totalCreditoMorosas() | number:'1.2-2' }}</div>
            <div class="text-[12px] text-[#6B7280] mt-0.5">Crédito total otorgado</div>
          </div>
          <div class="bg-white rounded-[10px] p-5 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
            <div class="font-[Montserrat] text-[24px] font-extrabold text-[#FF8800]">{{ countMorosaInactivas() }}</div>
            <div class="text-[12px] text-[#6B7280] mt-0.5">Inactivas</div>
          </div>
        </div>

        <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
          <div class="px-5 py-4 border-b border-[#E0E0E0] flex items-center justify-between gap-3">
            <span class="font-[Montserrat] font-bold text-[14px] text-[#1A1A2E]">
              Distribuidoras morosas — {{ pagination().total }} resultado(s)
            </span>
            @if (!loading() && morosas().length) {
              <div class="flex gap-2">
                <button (click)="exportExcel()" class="flex items-center gap-1.5 border border-[#00A86B] text-[#00A86B] hover:bg-[#00A86B]/10 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors cursor-pointer bg-transparent">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                  Excel
                </button>
                <button (click)="exportPdf()" class="flex items-center gap-1.5 border border-[#E53935] text-[#E53935] hover:bg-[#E53935]/10 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors cursor-pointer bg-transparent">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
                  PDF
                </button>
              </div>
            }
          </div>
          @if (loading()) {
            <div class="flex items-center justify-center py-16 text-[#6B7280] text-[13px]">
              <svg class="w-5 h-5 animate-spin mr-2 text-[#003399]" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              Cargando...
            </div>
          } @else {
            <div class="overflow-x-auto">
              <table class="w-full text-[13px] border-collapse">
                <thead>
                  <tr>
                    @for (h of headersMorosas; track h) {
                      <th class="bg-[#F8FAFD] font-[Montserrat] font-bold text-[11px] uppercase tracking-[0.5px] text-[#6B7280] px-5 py-3 text-left border-b border-[#E0E0E0] whitespace-nowrap">{{ h }}</th>
                    }
                  </tr>
                </thead>
                <tbody>
                  @for (m of morosas(); track m.id) {
                    <tr class="border-b border-[#F0F0F0] hover:bg-[#F8FAFD] transition-colors">
                      <td class="px-5 py-3 font-semibold text-[#1A1A2E]">{{ m.nombre || '—' }}</td>
                      <td class="px-5 py-3 font-mono text-[12px] text-[#6B7280]">{{ m.curp || '—' }}</td>
                      <td class="px-5 py-3 text-[#6B7280]">{{ m.categoria || '—' }}</td>
                      <td class="px-5 py-3 text-right font-semibold text-[#1A1A2E]">\${{ m.credito.current_credit | number:'1.2-2' }}</td>
                      <td class="px-5 py-3 text-right text-[#6B7280]">\${{ m.credito.available_credit | number:'1.2-2' }}</td>
                      <td class="px-5 py-3 text-right text-[#003399] font-semibold">\${{ m.credito.credit_limit | number:'1.2-2' }}</td>
                      <td class="px-5 py-3 text-center font-semibold text-[#FF8800]">{{ m.puntos }}</td>
                      <td class="px-5 py-3">
                        <span
                          [class]="m.status ? 'bg-[#00A86B]/10 text-[#00A86B] border-[#00A86B]/20' : 'bg-[#E53935]/10 text-[#E53935] border-[#E53935]/20'"
                          class="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border"
                        >{{ m.status ? 'Activa' : 'Inactiva' }}</span>
                      </td>
                      <td class="px-5 py-3 text-[#6B7280]">{{ formatDate(m.buro_revisado_en) }}</td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="9" class="px-5 py-12 text-center text-[#6B7280] text-[13px]">
                        No se encontraron distribuidoras morosas con los filtros seleccionados.
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      }

      <!-- ── Tab: Pre-Solicitudes ── -->
      @if (activeTab() === 'pre-solicitudes') {
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-5">
          <div class="bg-white rounded-[10px] p-5 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
            <div class="font-[Montserrat] text-[24px] font-extrabold text-[#1A1A2E]">{{ pagination().total }}</div>
            <div class="text-[12px] text-[#6B7280] mt-0.5">Total</div>
          </div>
          <div class="bg-white rounded-[10px] p-5 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
            <div class="font-[Montserrat] text-[24px] font-extrabold text-[#FF8800]">{{ countPreByStatus('pending') }}</div>
            <div class="text-[12px] text-[#6B7280] mt-0.5">Pendientes</div>
          </div>
          <div class="bg-white rounded-[10px] p-5 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
            <div class="font-[Montserrat] text-[24px] font-extrabold text-[#0288D1]">{{ countPreByStatus('verified') }}</div>
            <div class="text-[12px] text-[#6B7280] mt-0.5">Verificadas</div>
          </div>
          <div class="bg-white rounded-[10px] p-5 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
            <div class="font-[Montserrat] text-[24px] font-extrabold text-[#00A86B]">{{ countPreByStatus('approved') }}</div>
            <div class="text-[12px] text-[#6B7280] mt-0.5">Aprobadas</div>
          </div>
          <div class="bg-white rounded-[10px] p-5 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
            <div class="font-[Montserrat] text-[24px] font-extrabold text-[#E53935]">{{ countPreByStatus('rejected') }}</div>
            <div class="text-[12px] text-[#6B7280] mt-0.5">Rechazadas</div>
          </div>
        </div>

        <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
          <div class="px-5 py-4 border-b border-[#E0E0E0] flex items-center justify-between gap-3">
            <span class="font-[Montserrat] font-bold text-[14px] text-[#1A1A2E]">
              Solicitudes — {{ pagination().total }} resultado(s)
            </span>
            @if (!loading() && preSolicitudes().length) {
              <div class="flex gap-2">
                <button (click)="exportExcel()" class="flex items-center gap-1.5 border border-[#00A86B] text-[#00A86B] hover:bg-[#00A86B]/10 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors cursor-pointer bg-transparent">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                  Excel
                </button>
                <button (click)="exportPdf()" class="flex items-center gap-1.5 border border-[#E53935] text-[#E53935] hover:bg-[#E53935]/10 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors cursor-pointer bg-transparent">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
                  PDF
                </button>
              </div>
            }
          </div>
          @if (loading()) {
            <div class="flex items-center justify-center py-16 text-[#6B7280] text-[13px]">
              <svg class="w-5 h-5 animate-spin mr-2 text-[#003399]" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              Cargando...
            </div>
          } @else {
            <div class="overflow-x-auto">
              <table class="w-full text-[13px] border-collapse">
                <thead>
                  <tr>
                    @for (h of headersPreSolicitudes; track h) {
                      <th class="bg-[#F8FAFD] font-[Montserrat] font-bold text-[11px] uppercase tracking-[0.5px] text-[#6B7280] px-5 py-3 text-left border-b border-[#E0E0E0] whitespace-nowrap">{{ h }}</th>
                    }
                  </tr>
                </thead>
                <tbody>
                  @for (p of preSolicitudes(); track p.id) {
                    <tr class="border-b border-[#F0F0F0] hover:bg-[#F8FAFD] transition-colors">
                      <td class="px-5 py-3 font-semibold text-[#1A1A2E]">{{ p.nombre || '—' }}</td>
                      <td class="px-5 py-3 font-mono text-[12px] text-[#6B7280]">{{ p.curp || '—' }}</td>
                      <td class="px-5 py-3 text-[#6B7280]">{{ p.coordinador || '—' }}</td>
                      <td class="px-5 py-3 text-[#6B7280]">{{ p.verificador || '—' }}</td>
                      <td class="px-5 py-3">
                        <span [class]="statusPreClass(p.status)" class="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border">
                          {{ statusPreLabel(p.status) }}
                        </span>
                      </td>
                      <td class="px-5 py-3">
                        @if (p.en_buro === true) {
                          <span class="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border bg-[#E53935]/10 text-[#E53935] border-[#E53935]/20">En buró</span>
                        } @else if (p.en_buro === false) {
                          <span class="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border bg-[#00A86B]/10 text-[#00A86B] border-[#00A86B]/20">Limpia</span>
                        } @else {
                          <span class="text-[#6B7280]">—</span>
                        }
                      </td>
                      <td class="px-5 py-3 text-[#6B7280]">{{ formatDate(p.creado_en) }}</td>
                      <td class="px-5 py-3 text-[#6B7280]">{{ formatDate(p.verificado_en) }}</td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="8" class="px-5 py-12 text-center text-[#6B7280] text-[13px]">
                        No se encontraron pre-solicitudes con los filtros seleccionados.
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      }

      <!-- ── Tab: Saldo de Cortes ── -->
      @if (activeTab() === 'saldo-cortes') {
        @if (corteActivo()) {
          <div class="mb-4 bg-[#003399]/5 border border-[#003399]/15 rounded-[10px] px-5 py-3 flex items-center gap-2 text-[13px] text-[#003399]">
            <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            Los cortes se generan los días <strong class="mx-1">{{ corteActivo()!.cutoff_day_1 }}</strong> y <strong class="mx-1">{{ corteActivo()!.cutoff_day_2 }}</strong> de cada mes
          </div>
        }

        <!-- Resumen global -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
          <div class="bg-white rounded-[10px] p-5 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
            <div class="font-[Montserrat] text-[24px] font-extrabold text-[#003399]">{{ pagination().total }}</div>
            <div class="text-[12px] text-[#6B7280] mt-0.5">Quincenas en el período</div>
          </div>
          <div class="bg-white rounded-[10px] p-5 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
            <div class="font-[Montserrat] text-[24px] font-extrabold text-[#1A1A2E]">\${{ totalSaldoCortesPagado() | number:'1.0-0' }}</div>
            <div class="text-[12px] text-[#6B7280] mt-0.5">Total cobrado</div>
          </div>
          <div class="bg-white rounded-[10px] p-5 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
            <div class="font-[Montserrat] text-[24px] font-extrabold text-[#E53935]">\${{ totalSaldoCortesDeuda() | number:'1.0-0' }}</div>
            <div class="text-[12px] text-[#6B7280] mt-0.5">Deuda total pendiente</div>
          </div>
          <div class="bg-white rounded-[10px] p-5 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
            <div class="font-[Montserrat] text-[24px] font-extrabold text-[#00A86B]">\${{ totalSaldoCortesFavor() | number:'1.0-0' }}</div>
            <div class="text-[12px] text-[#6B7280] mt-0.5">Saldo a favor acumulado</div>
          </div>
        </div>

        @if (!loading() && saldoCortes().length) {
          <div class="flex justify-end gap-2 mb-4">
            <button (click)="exportExcel()" class="flex items-center gap-1.5 border border-[#00A86B] text-[#00A86B] hover:bg-[#00A86B]/10 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors cursor-pointer bg-transparent">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
              Excel
            </button>
            <button (click)="exportPdf()" class="flex items-center gap-1.5 border border-[#E53935] text-[#E53935] hover:bg-[#E53935]/10 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors cursor-pointer bg-transparent">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
              PDF
            </button>
          </div>
        }

        @if (loading()) {
          <div class="flex items-center justify-center py-16 text-[#6B7280] text-[13px] bg-white rounded-[10px] border border-[#E0E0E0]">
            <svg class="w-5 h-5 animate-spin mr-2 text-[#003399]" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
            Cargando...
          </div>
        } @else {
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            @for (c of saldoCortes(); track c.period_start) {
              <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] overflow-hidden">

                <!-- Encabezado del período -->
                <div class="px-5 py-4 border-b border-[#E0E0E0] flex items-start justify-between gap-3">
                  <div>
                    <p class="font-[Montserrat] font-extrabold text-[15px] text-[#1A1A2E]">{{ formatPeriod(c.period_start, c.period_end) }}</p>
                    <p class="text-[12px] text-[#6B7280] mt-0.5">{{ c.distribuidoras }} distribuidora{{ c.distribuidoras !== 1 ? 's' : '' }} con pago registrado</p>
                  </div>
                  <span [class]="saludCorte(c).cls" class="text-[11px] font-semibold px-3 py-1 rounded-full border shrink-0">{{ saludCorte(c).label }}</span>
                </div>

                <!-- Montos principales -->
                <div class="px-5 py-4 grid grid-cols-3 gap-3 border-b border-[#F0F0F0]">
                  <div>
                    <p class="text-[10px] text-[#6B7280] uppercase font-bold tracking-wide mb-1">Total a cobrar</p>
                    <p class="font-[Montserrat] font-extrabold text-[16px] text-[#1A1A2E]">\${{ c.total_expected | number:'1.0-0' }}</p>
                  </div>
                  <div>
                    <p class="text-[10px] text-[#6B7280] uppercase font-bold tracking-wide mb-1">Cobrado</p>
                    <p class="font-[Montserrat] font-extrabold text-[16px] text-[#003399]">\${{ c.total_pagado | number:'1.0-0' }}</p>
                  </div>
                  <div>
                    <p class="text-[10px] text-[#6B7280] uppercase font-bold tracking-wide mb-1">% cobrado</p>
                    <p class="font-[Montserrat] font-extrabold text-[16px]"
                      [class]="pctCobrado(c) >= 90 ? 'text-[#00A86B]' : pctCobrado(c) >= 70 ? 'text-[#FF8800]' : 'text-[#E53935]'">
                      {{ pctCobrado(c) }}%
                    </p>
                  </div>
                </div>

                <!-- Barra de progreso -->
                <div class="px-5 py-3 border-b border-[#F0F0F0]">
                  <div class="h-2.5 bg-[#F0F0F0] rounded-full overflow-hidden">
                    <div class="h-full rounded-full transition-all duration-500"
                      [style.width.%]="pctCobrado(c)"
                      [class]="pctCobrado(c) >= 90 ? 'bg-[#00A86B]' : pctCobrado(c) >= 70 ? 'bg-[#FF8800]' : 'bg-[#E53935]'">
                    </div>
                  </div>
                </div>

                <!-- Desglose de pagos + deuda/favor -->
                <div class="px-5 py-3 flex flex-wrap items-center justify-between gap-2">
                  <div class="flex flex-wrap gap-1.5">
                    @if (c.count_early) {
                      <span class="bg-[#0288D1]/10 text-[#0288D1] text-[11px] font-semibold px-2 py-0.5 rounded-full border border-[#0288D1]/20">
                        {{ c.count_early }} anticipado{{ c.count_early !== 1 ? 's' : '' }}
                      </span>
                    }
                    @if (c.count_on_time) {
                      <span class="bg-[#00A86B]/10 text-[#00A86B] text-[11px] font-semibold px-2 py-0.5 rounded-full border border-[#00A86B]/20">
                        {{ c.count_on_time }} a tiempo
                      </span>
                    }
                    @if (c.count_late) {
                      <span class="bg-[#E53935]/10 text-[#E53935] text-[11px] font-semibold px-2 py-0.5 rounded-full border border-[#E53935]/20">
                        {{ c.count_late }} tardío{{ c.count_late !== 1 ? 's' : '' }}
                      </span>
                    }
                  </div>
                  <div class="flex gap-3 text-[12px] font-semibold">
                    @if (c.total_deuda > 0) {
                      <span class="text-[#E53935]">Deuda: \${{ c.total_deuda | number:'1.0-0' }}</span>
                    }
                    @if (c.total_saldo_favor > 0) {
                      <span class="text-[#00A86B]">A favor: \${{ c.total_saldo_favor | number:'1.0-0' }}</span>
                    }
                    @if (c.total_penalizacion > 0) {
                      <span class="text-[#FF8800]">Penalización: \${{ c.total_penalizacion | number:'1.0-0' }}</span>
                    }
                    @if (c.total_deuda === 0 && c.total_penalizacion === 0) {
                      <span class="text-[#00A86B]">Quincena liquidada</span>
                    }
                  </div>
                </div>

              </div>
            } @empty {
              <div class="col-span-2 bg-white rounded-[10px] border border-[#E0E0E0] py-16 text-center text-[#6B7280] text-[13px]">
                No hay datos de cortes para el período seleccionado.
              </div>
            }
          </div>
        }
      }

      <!-- ── Tab: Saldo de Puntos ── -->
      @if (activeTab() === 'saldo-puntos') {
        @if (corteActivo()) {
          <div class="mb-4 bg-[#003399]/5 border border-[#003399]/15 rounded-[10px] px-5 py-3 text-[13px] text-[#003399]">
            Configuración de corte activa: días <strong>{{ corteActivo()!.cutoff_day_1 }}</strong> y <strong>{{ corteActivo()!.cutoff_day_2 }}</strong> de cada mes
          </div>
        }
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-5">
          <div class="bg-white rounded-[10px] p-5 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
            <div class="font-[Montserrat] text-[24px] font-extrabold text-[#003399]">{{ pagination().total }}</div>
            <div class="text-[12px] text-[#6B7280] mt-0.5">Distribuidoras activas</div>
          </div>
          <div class="bg-white rounded-[10px] p-5 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
            <div class="font-[Montserrat] text-[24px] font-extrabold text-[#FF8800]">{{ sumPuntos() }}</div>
            <div class="text-[12px] text-[#6B7280] mt-0.5">Total puntos</div>
          </div>
          <div class="bg-white rounded-[10px] p-5 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
            <div class="font-[Montserrat] text-[24px] font-extrabold text-[#1A1A2E]">{{ saldoPuntos().length ? (sumPuntos() / saldoPuntos().length | number:'1.0-0') : 0 }}</div>
            <div class="text-[12px] text-[#6B7280] mt-0.5">Promedio por distribuidora</div>
          </div>
        </div>

        <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
          <div class="px-5 py-4 border-b border-[#E0E0E0] flex items-center justify-between gap-3">
            <span class="font-[Montserrat] font-bold text-[14px] text-[#1A1A2E]">
              Puntos por distribuidora — {{ pagination().total }} registro(s)
            </span>
            @if (!loading() && saldoPuntos().length) {
              <div class="flex gap-2">
                <button (click)="exportExcel()" class="flex items-center gap-1.5 border border-[#00A86B] text-[#00A86B] hover:bg-[#00A86B]/10 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors cursor-pointer bg-transparent">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                  Excel
                </button>
                <button (click)="exportPdf()" class="flex items-center gap-1.5 border border-[#E53935] text-[#E53935] hover:bg-[#E53935]/10 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors cursor-pointer bg-transparent">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
                  PDF
                </button>
              </div>
            }
          </div>
          @if (loading()) {
            <div class="flex items-center justify-center py-16 text-[#6B7280] text-[13px]">
              <svg class="w-5 h-5 animate-spin mr-2 text-[#003399]" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
              Cargando...
            </div>
          } @else {
            <div class="overflow-x-auto">
              <table class="w-full text-[13px] border-collapse">
                <thead>
                  <tr>
                    @for (h of ['#', 'Nombre', 'Referencia', 'Categoría', 'Puntos', 'Crédito usado', 'Crédito disponible', 'Estado']; track h) {
                      <th class="bg-[#F8FAFD] font-[Montserrat] font-bold text-[11px] uppercase tracking-[0.5px] text-[#6B7280] px-4 py-3 text-left border-b border-[#E0E0E0] whitespace-nowrap">{{ h }}</th>
                    }
                  </tr>
                </thead>
                <tbody>
                  @for (p of saldoPuntos(); track p.id; let i = $index) {
                    <tr class="border-b border-[#F0F0F0] hover:bg-[#F8FAFD] transition-colors">
                      <td class="px-4 py-3 text-[#6B7280] font-mono text-[12px]">{{ i + 1 }}</td>
                      <td class="px-4 py-3 font-semibold text-[#1A1A2E]">{{ p.nombre || '—' }}</td>
                      <td class="px-4 py-3 font-mono text-[12px] text-[#6B7280]">{{ p.reference_number || '—' }}</td>
                      <td class="px-4 py-3 text-[#6B7280]">{{ p.categoria || '—' }}</td>
                      <td class="px-4 py-3 text-center">
                        <span class="font-extrabold text-[#FF8800] text-[15px]">{{ p.puntos }}</span>
                      </td>
                      <td class="px-4 py-3 text-right">\${{ p.current_credit | number:'1.2-2' }}</td>
                      <td class="px-4 py-3 text-right">\${{ p.available_credit | number:'1.2-2' }}</td>
                      <td class="px-4 py-3">
                        <span [class]="p.status ? 'bg-[#00A86B]/10 text-[#00A86B] border-[#00A86B]/20' : 'bg-[#E53935]/10 text-[#E53935] border-[#E53935]/20'"
                          class="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border">
                          {{ p.status ? 'Activa' : 'Inactiva' }}
                        </span>
                      </td>
                    </tr>
                  } @empty {
                    <tr><td colspan="8" class="px-5 py-12 text-center text-[#6B7280] text-[13px]">No hay distribuidoras activas.</td></tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      }

      <app-pagination-controls
        [currentPage]="currentPage()"
        [totalPages]="totalPages()"
        [totalItems]="pagination().total"
        [rangeStart]="rangeStart()"
        [rangeEnd]="rangeEnd()"
        (pageChange)="goToPage($event)"
      />
    </div>
  `,
})
export class ReportesComponent implements OnInit {
  private svc = inject(ManagerReporteService);

  activeTab = signal<Tab>('morosas');
  loading   = signal(false);
  errorMsg  = signal('');
  currentPage = signal(1);
  pagination = signal({ current_page: 1, last_page: 1, per_page: 15, total: 0, from: 0, to: 0 });
  readonly pageSize = 15;

  morosas        = signal<DistribuidoraMorosa[]>([]);
  preSolicitudes = signal<PreSolicitudReporte[]>([]);
  saldoCortes    = signal<SaldoCorte[]>([]);
  saldoPuntos    = signal<SaldoPunto[]>([]);
  corteActivo    = signal<CorteActivo | null>(null);

  fechaInicio  = '';
  fechaFin     = '';
  estadoFiltro = '';

  today = new Date().toISOString().split('T')[0];

  tabs = [
    { id: 'morosas' as Tab,         label: 'Distribuidoras Morosas' },
    { id: 'pre-solicitudes' as Tab, label: 'Solicitudes' },
    { id: 'saldo-cortes' as Tab,    label: 'Saldo de Cortes' },
    { id: 'saldo-puntos' as Tab,    label: 'Puntos por Distribuidora' },
  ];

  headersMorosas = ['Nombre', 'CURP', 'Categoría', 'Crédito usado', 'Crédito disponible', 'Límite', 'Puntos', 'Estado', 'Buró revisado'];
  headersPreSolicitudes = ['Nombre', 'CURP', 'Coordinador', 'Verificador', 'Estado', 'Buró', 'Creada', 'Verificada'];

  totalCreditoMorosas  = () => this.morosas().reduce((s, m) => s + m.credito.current_credit, 0);
  countMorosaInactivas = () => this.morosas().filter(m => !m.status).length;
  countPreByStatus     = (s: string) => this.preSolicitudes().filter(p => p.status === s).length;

  totalPages = computed(() => Math.max(1, this.pagination().last_page || Math.ceil(this.pagination().total / this.pageSize)));
  rangeStart = computed(() => this.pagination().from);
  rangeEnd = computed(() => this.pagination().to);

  statusPreLabel = (s: string) => ({ pending: 'Pendiente', verified: 'Verificada', approved: 'Aprobada', rejected: 'Rechazada' }[s] ?? s);
  statusPreClass = (s: string) => ({
    pending:  'bg-[#FF8800]/10 text-[#FF8800] border-[#FF8800]/20',
    verified: 'bg-[#0288D1]/10 text-[#0288D1] border-[#0288D1]/20',
    approved: 'bg-[#00A86B]/10 text-[#00A86B] border-[#00A86B]/20',
    rejected: 'bg-[#E53935]/10 text-[#E53935] border-[#E53935]/20',
  }[s] ?? 'bg-[#F8FAFD] text-[#6B7280] border-[#E0E0E0]');

  formatDate = (d?: string | null) => d ? new Date(d).toLocaleDateString('es-MX') : '—';

  ngOnInit() { this.load(); }

  setTab(tab: Tab) {
    this.activeTab.set(tab);
    this.currentPage.set(1);
    this.load();
  }

  buscar() {
    this.currentPage.set(1);
    this.load();
  }

  goToPage(page: number) {
    this.currentPage.set(Math.max(1, Math.min(page, this.totalPages())));
    this.load();
  }

  exportExcel() {
    const tab = this.activeTab();
    let headers: string[];
    let rows: (string | number)[][];
    let filename: string;

    if (tab === 'morosas') {
      headers = ['Nombre', 'CURP', 'RFC', 'Categoría', 'Crédito usado', 'Crédito disponible', 'Límite', 'Puntos', 'Estado', 'Buró revisado'];
      rows = this.morosas().map(m => [
        m.nombre, m.curp ?? '', m.rfc ?? '', m.categoria ?? '',
        m.credito.current_credit, m.credito.available_credit, m.credito.credit_limit,
        m.puntos, m.status ? 'Activa' : 'Inactiva', this.formatDate(m.buro_revisado_en),
      ]);
      filename = 'distribuidoras-morosas';
    } else if (tab === 'pre-solicitudes') {
      headers = ['Nombre', 'CURP', 'RFC', 'Coordinador', 'Verificador', 'Estado', 'Buró', 'Creada', 'Verificada'];
      rows = this.preSolicitudes().map(p => [
        p.nombre, p.curp ?? '', p.rfc ?? '', p.coordinador ?? '', p.verificador ?? '',
        this.statusPreLabel(p.status),
        p.en_buro === true ? 'En buró' : p.en_buro === false ? 'Limpia' : '',
        this.formatDate(p.creado_en), this.formatDate(p.verificado_en ?? null),
      ]);
      filename = 'solicitudes';
    } else if (tab === 'saldo-cortes') {
      headers = ['Período inicio', 'Período fin', 'Distribuidoras', 'Quincenal', 'Total esperado', 'Total pagado', 'Deuda', 'Saldo favor', 'Penalización', 'Anticipados', 'A tiempo', 'Tardíos'];
      rows = this.saldoCortes().map(c => [
        this.formatDate(c.period_start), this.formatDate(c.period_end), c.distribuidoras,
        c.total_biweekly, c.total_expected, c.total_pagado, c.total_deuda,
        c.total_saldo_favor, c.total_penalizacion, c.count_early, c.count_on_time, c.count_late,
      ]);
      filename = 'saldo-cortes';
    } else {
      headers = ['#', 'Nombre', 'Referencia', 'Categoría', 'Puntos', 'Crédito usado', 'Crédito disponible', 'Estado'];
      rows = this.saldoPuntos().map((p, i) => [
        i + 1, p.nombre, p.reference_number ?? '', p.categoria ?? '',
        p.puntos, p.current_credit, p.available_credit, p.status ? 'Activa' : 'Inactiva',
      ]);
      filename = 'puntos-distribuidoras';
    }

    this.downloadCsv([headers, ...rows], filename);
  }

  exportPdf() {
    const tab = this.activeTab();
    const titles: Record<Tab, string> = {
      'morosas':         'Distribuidoras Morosas',
      'pre-solicitudes': 'Solicitudes',
      'saldo-cortes':    'Saldo de Cortes',
      'saldo-puntos':    'Puntos por Distribuidora',
    };
    const title = titles[tab];
    let tableHtml: string;

    if (tab === 'morosas') {
      const ths = ['Nombre', 'CURP', 'RFC', 'Categoría', 'Crédito usado', 'Crédito disp.', 'Límite', 'Puntos', 'Estado', 'Buró revisado']
        .map(h => `<th>${h}</th>`).join('');
      const trs = this.morosas().map(m => `<tr>
        <td>${m.nombre}</td><td>${m.curp ?? ''}</td><td>${m.rfc ?? ''}</td>
        <td>${m.categoria ?? ''}</td>
        <td class="num">$${m.credito.current_credit.toFixed(2)}</td>
        <td class="num">$${m.credito.available_credit.toFixed(2)}</td>
        <td class="num">$${m.credito.credit_limit.toFixed(2)}</td>
        <td class="num">${m.puntos}</td>
        <td>${m.status ? 'Activa' : 'Inactiva'}</td>
        <td>${this.formatDate(m.buro_revisado_en)}</td>
      </tr>`).join('');
      tableHtml = `<table><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table>`;
    } else if (tab === 'pre-solicitudes') {
      const ths = ['Nombre', 'CURP', 'RFC', 'Coordinador', 'Verificador', 'Estado', 'Buró', 'Creada', 'Verificada']
        .map(h => `<th>${h}</th>`).join('');
      const trs = this.preSolicitudes().map(p => `<tr>
        <td>${p.nombre}</td><td>${p.curp ?? ''}</td><td>${p.rfc ?? ''}</td>
        <td>${p.coordinador ?? ''}</td><td>${p.verificador ?? ''}</td>
        <td>${this.statusPreLabel(p.status)}</td>
        <td>${p.en_buro === true ? 'En buró' : p.en_buro === false ? 'Limpia' : '—'}</td>
        <td>${this.formatDate(p.creado_en)}</td>
        <td>${this.formatDate(p.verificado_en ?? null)}</td>
      </tr>`).join('');
      tableHtml = `<table><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table>`;
    } else if (tab === 'saldo-cortes') {
      const ths = ['Período', 'Distribuidoras', 'Quincenal', 'Esperado', 'Pagado', 'Deuda', 'Saldo favor', 'Penalización', 'Anticipados', 'A tiempo', 'Tardíos']
        .map(h => `<th>${h}</th>`).join('');
      const trs = this.saldoCortes().map(c => `<tr>
        <td>${this.formatDate(c.period_start)} – ${this.formatDate(c.period_end)}</td>
        <td class="num">${c.distribuidoras}</td>
        <td class="num">$${c.total_biweekly.toFixed(2)}</td>
        <td class="num">$${c.total_expected.toFixed(2)}</td>
        <td class="num">$${c.total_pagado.toFixed(2)}</td>
        <td class="num">${c.total_deuda > 0 ? '$' + c.total_deuda.toFixed(2) : '—'}</td>
        <td class="num">${c.total_saldo_favor > 0 ? '$' + c.total_saldo_favor.toFixed(2) : '—'}</td>
        <td class="num">${c.total_penalizacion > 0 ? '$' + c.total_penalizacion.toFixed(2) : '—'}</td>
        <td class="num">${c.count_early}</td>
        <td class="num">${c.count_on_time}</td>
        <td class="num">${c.count_late}</td>
      </tr>`).join('');
      tableHtml = `<table><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table>`;
    } else {
      const ths = ['#', 'Nombre', 'Referencia', 'Categoría', 'Puntos', 'Crédito usado', 'Crédito disp.', 'Estado']
        .map(h => `<th>${h}</th>`).join('');
      const trs = this.saldoPuntos().map((p, i) => `<tr>
        <td class="num">${i + 1}</td>
        <td>${p.nombre}</td><td>${p.reference_number ?? ''}</td><td>${p.categoria ?? ''}</td>
        <td class="num">${p.puntos}</td>
        <td class="num">$${p.current_credit.toFixed(2)}</td>
        <td class="num">$${p.available_credit.toFixed(2)}</td>
        <td>${p.status ? 'Activa' : 'Inactiva'}</td>
      </tr>`).join('');
      tableHtml = `<table><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table>`;
    }

    const filtros = [
      this.fechaInicio ? `Desde: ${this.fechaInicio}` : '',
      this.fechaFin    ? `Hasta: ${this.fechaFin}`    : '',
      tab === 'pre-solicitudes' && this.estadoFiltro ? `Estado: ${this.statusPreLabel(this.estadoFiltro)}` : '',
    ].filter(Boolean).join(' · ');

    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html lang="es"><head><meta charset="utf-8">
      <title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 11px; color: #1a1a1a; margin: 20px; }
        h1 { font-size: 16px; margin-bottom: 4px; color: #003399; }
        p.sub { font-size: 10px; color: #6b7280; margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #003399; color: #fff; text-align: left; padding: 6px 8px; font-size: 10px; white-space: nowrap; }
        td { padding: 5px 8px; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
        tr:nth-child(even) td { background: #f8fafd; }
        .num { text-align: right; }
        @media print { button { display: none; } }
      </style></head><body>
      <h1>PréstamoFácil · ${title}</h1>
      <p class="sub">Generado: ${new Date().toLocaleString('es-MX')}${filtros ? ' · ' + filtros : ''}</p>
      ${tableHtml}
      <script>window.onload=()=>{window.print();}<\/script>
    </body></html>`);
    win.document.close();
  }

  private downloadCsv(rows: (string | number)[][], filename: string) {
    const csv = rows.map(r =>
      r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')
    ).join('\r\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${this.today}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  limpiar() {
    this.fechaInicio  = '';
    this.fechaFin     = '';
    this.estadoFiltro = '';
    this.currentPage.set(1);
    this.load();
  }

  statusCorteLabel = (s: string) => ({ early: 'Anticipado', on_time: 'A tiempo', late: 'Tardío' }[s] ?? s);

  totalSaldoCortesPagado  = () => this.saldoCortes().reduce((s, c) => s + c.total_pagado, 0);
  totalSaldoCortesDeuda   = () => this.saldoCortes().reduce((s, c) => s + c.total_deuda, 0);
  totalSaldoCortesFavor   = () => this.saldoCortes().reduce((s, c) => s + c.total_saldo_favor, 0);
  sumPuntos               = () => this.saldoPuntos().reduce((s, p) => s + p.puntos, 0);

  formatPeriod = (start: string, end: string) => {
    const parse = (d: string) => { const p = (d ?? '').split('T')[0].split('-').map(Number); return { y: p[0], m: p[1], day: p[2] }; };
    const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    const s = parse(start), e = parse(end);
    if (!s.y) return '—';
    return s.m === e.m && s.y === e.y
      ? `${s.day} – ${e.day} ${months[s.m - 1]} ${s.y}`
      : `${s.day} ${months[s.m - 1]} – ${e.day} ${months[e.m - 1]} ${s.y}`;
  };

  saludCorte = (c: SaldoCorte): { label: string; cls: string } => {
    if (c.distribuidoras === 0) return { label: 'Sin datos', cls: 'bg-[#F8FAFD] text-[#6B7280] border-[#E0E0E0]' };
    if (c.total_deuda === 0 && c.count_late === 0) return { label: 'Al día', cls: 'bg-[#00A86B]/10 text-[#00A86B] border-[#00A86B]/20' };
    if (c.count_late / c.distribuidoras <= 0.25) return { label: 'Estable', cls: 'bg-[#FF8800]/10 text-[#FF8800] border-[#FF8800]/20' };
    return { label: 'Con mora', cls: 'bg-[#E53935]/10 text-[#E53935] border-[#E53935]/20' };
  };

  pctCobrado = (c: SaldoCorte) =>
    c.total_expected > 0 ? Math.min(100, Math.round((c.total_pagado / c.total_expected) * 100)) : 0;

  private load() {
    this.loading.set(true);
    this.errorMsg.set('');

    const filtro = {
      fechaInicio: this.fechaInicio || undefined,
      fechaFin:    this.fechaFin    || undefined,
    };

    const tab = this.activeTab();

    if (tab === 'morosas') {
      this.svc.getDistribuidorasMorosas(filtro, this.currentPage(), this.pageSize).subscribe({
        next: res => { this.morosas.set(res.data); this.pagination.set(res.pagination ?? { current_page: this.currentPage(), last_page: 1, per_page: this.pageSize, total: res.data.length, from: res.data.length ? 1 : 0, to: res.data.length }); this.currentPage.set(this.pagination().current_page); this.loading.set(false); },
        error: err => { this.errorMsg.set(err?.error?.message ?? 'Error al cargar el reporte.'); this.loading.set(false); },
      });
    } else if (tab === 'pre-solicitudes') {
      this.svc.getPreSolicitudes({ ...filtro, estado: this.estadoFiltro || undefined }, this.currentPage(), this.pageSize).subscribe({
        next: res => { this.preSolicitudes.set(res.data); this.pagination.set(res.pagination ?? { current_page: this.currentPage(), last_page: 1, per_page: this.pageSize, total: res.data.length, from: res.data.length ? 1 : 0, to: res.data.length }); this.currentPage.set(this.pagination().current_page); this.loading.set(false); },
        error: err => { this.errorMsg.set(err?.error?.message ?? 'Error al cargar el reporte.'); this.loading.set(false); },
      });
    } else if (tab === 'saldo-cortes') {
      this.svc.getSaldoCortes(filtro, this.currentPage(), this.pageSize).subscribe({
        next: res => { this.saldoCortes.set(res.data); this.corteActivo.set(res.corteActivo); this.pagination.set(res.pagination ?? { current_page: this.currentPage(), last_page: 1, per_page: this.pageSize, total: res.data.length, from: res.data.length ? 1 : 0, to: res.data.length }); this.currentPage.set(this.pagination().current_page); this.loading.set(false); },
        error: err => { this.errorMsg.set(err?.error?.message ?? 'Error al cargar el reporte.'); this.loading.set(false); },
      });
    } else {
      this.svc.getSaldoPuntos(this.currentPage(), this.pageSize).subscribe({
        next: res => { this.saldoPuntos.set(res.data); this.corteActivo.set(res.corteActivo); this.pagination.set(res.pagination ?? { current_page: this.currentPage(), last_page: 1, per_page: this.pageSize, total: res.data.length, from: res.data.length ? 1 : 0, to: res.data.length }); this.currentPage.set(this.pagination().current_page); this.loading.set(false); },
        error: err => { this.errorMsg.set(err?.error?.message ?? 'Error al cargar el reporte.'); this.loading.set(false); },
      });
    }
  }
}
