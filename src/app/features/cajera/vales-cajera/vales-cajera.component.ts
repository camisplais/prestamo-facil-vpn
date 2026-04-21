import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { DecimalPipe} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-vales-cajera',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, DecimalPipe],
  template: `
    <!-- ═══════════════ PANTALLA 1: DISTRIBUIDORAS ═══════════════ -->
    @if (screen() === 'distribuidoras') {
      <div>
        <div class="mb-6">
          <h1 class="font-[Montserrat] text-[22px] font-extrabold text-[#1A1A2E]">Vales</h1>
          <p class="text-[13px] text-[#6B7280] mt-0.5">Busca una distribuidora por número de referencia</p>
        </div>

        <!-- Buscador -->
        <div class="bg-white rounded-[10px] p-5 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] mb-6">
          <div class="flex items-center gap-3">
            <input type="search" [(ngModel)]="searchQuery" (keyup.enter)="searchDistribuidoras()"
              placeholder="Buscar por número de referencia o nombre…"
              class="flex-1 border border-[#E0E0E0] rounded-lg px-4 py-2.5 text-[13px] outline-none focus:border-[#003399] transition-colors"
            />
            <button (click)="searchDistribuidoras()"
              class="px-5 py-2.5 rounded-lg text-[13px] font-semibold bg-[#003399] text-white hover:bg-[#002277] transition-colors border-0 cursor-pointer">
              Buscar
            </button>
          </div>
        </div>

        @if (loadingDist()) {
          <div class="flex items-center justify-center py-16 text-[#6B7280] text-[13px]">
            <svg class="w-5 h-5 animate-spin mr-2 text-[#003399]" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            Buscando…
          </div>
        } @else if (distribuidoras().length > 0) {
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            @for (d of distribuidoras(); track d.id) {
              <div (click)="selectDistribuidora(d)"
                class="bg-white rounded-[10px] p-5 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] cursor-pointer hover:border-[#003399] hover:shadow-[0_4px_16px_rgba(0,51,153,0.15)] transition-all">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 rounded-[10px] bg-[#003399]/10 text-[#003399] flex items-center justify-center flex-shrink-0 font-extrabold text-[18px]">
                    {{ distInitial(d) }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="font-semibold text-[14px] text-[#1A1A2E] truncate">{{ distName(d) }}</div>
                    <div class="text-[12px] text-[#6B7280] mt-0.5">Ref: {{ d.reference_number || '—' }}</div>
                  </div>
                  <svg class="w-5 h-5 text-[#6B7280] flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
                  </svg>
                </div>
              </div>
            }
          </div>
        } @else if (searched()) {
          <div class="bg-[#F8FAFD] rounded-[10px] p-8 border border-[#E0E0E0] text-center">
            <p class="text-[14px] font-semibold text-[#1A1A2E] mb-1">Sin resultados</p>
            <p class="text-[13px] text-[#6B7280]">No se encontraron distribuidoras con esa búsqueda.</p>
          </div>
        }
      </div>
    }

    <!-- ═══════════════ PANTALLA 2: VALES DE LA DISTRIBUIDORA ═══════════════ -->
    @if (screen() === 'vales') {
      <div>
        <div class="flex items-center gap-3 mb-6">
          <button (click)="screen.set('distribuidoras')" class="text-[#6B7280] hover:text-[#003399] transition-colors bg-transparent border-0 cursor-pointer p-0">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <div>
            <h1 class="font-[Montserrat] text-[22px] font-extrabold text-[#1A1A2E]">Vales de {{ distName(selectedDist()!) }}</h1>
            <p class="text-[13px] text-[#6B7280] mt-0.5">Ref: {{ selectedDist()?.reference_number }}</p>
          </div>
        </div>

        @if (loadingVales()) {
          <div class="flex items-center justify-center py-16 text-[#6B7280] text-[13px]">
            <svg class="w-5 h-5 animate-spin mr-2 text-[#003399]" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            Cargando vales…
          </div>
        } @else {
          <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
            <div class="px-5 py-4 border-b border-[#E0E0E0]">
              <span class="font-[Montserrat] font-bold text-[14px] text-[#1A1A2E]">Vales por autorizar</span>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-[13px] border-collapse">
                <thead>
                  <tr>
                    <th class="bg-[#F8FAFD] font-[Montserrat] font-bold text-[11px] uppercase tracking-[0.5px] text-[#6B7280] px-5 py-3 text-left border-b border-[#E0E0E0]">ID</th>
                    <th class="bg-[#F8FAFD] font-[Montserrat] font-bold text-[11px] uppercase tracking-[0.5px] text-[#6B7280] px-5 py-3 text-left border-b border-[#E0E0E0]">Cliente</th>
                    <th class="bg-[#F8FAFD] font-[Montserrat] font-bold text-[11px] uppercase tracking-[0.5px] text-[#6B7280] px-5 py-3 text-left border-b border-[#E0E0E0]">Producto</th>
                    <th class="bg-[#F8FAFD] font-[Montserrat] font-bold text-[11px] uppercase tracking-[0.5px] text-[#6B7280] px-5 py-3 text-left border-b border-[#E0E0E0]">Total</th>
                    <th class="bg-[#F8FAFD] font-[Montserrat] font-bold text-[11px] uppercase tracking-[0.5px] text-[#6B7280] px-5 py-3 text-left border-b border-[#E0E0E0]">Tipo</th>
                    <th class="bg-[#F8FAFD] font-[Montserrat] font-bold text-[11px] uppercase tracking-[0.5px] text-[#6B7280] px-5 py-3 text-left border-b border-[#E0E0E0]">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  @for (v of paginatedCreados(); track v.id) {
                    <tr class="border-b border-[#F0F0F0] hover:bg-[#F8FAFD] transition-colors">
                      <td class="px-5 py-3 font-mono text-[12px] text-[#003399] font-semibold">#{{ v.id }}</td>
                      <td class="px-5 py-3 font-semibold text-[#1A1A2E]">{{ customerName(v) }}</td>
                      <td class="px-5 py-3 text-[#6B7280]">\${{ v.product?.quantity | number }}</td>
                      <td class="px-5 py-3 text-[#6B7280]">\${{ v.total_value | number:'1.2-2' }}</td>
                      <td class="px-5 py-3 text-[#6B7280]">{{ v.type === 'pre-loan' ? 'Pre-vale' : 'Vale' }}</td>
                      <td class="px-5 py-3">
                        <button (click)="selectVale(v)"
                          class="px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-[#003399] text-white hover:bg-[#002277] transition-colors border-0 cursor-pointer">
                          Ver cliente
                        </button>
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="6" class="px-5 py-12 text-center text-[#6B7280] text-[13px]">No hay vales pendientes de autorización.</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <!-- Pagination: Vales por autorizar -->
            @if (totalPagesCreados() > 1) {
              <div class="px-5 py-3 border-t border-[#E0E0E0] flex items-center justify-between gap-3 flex-wrap">
                <span class="text-[12px] text-[#6B7280]">
                  Mostrando {{ rangeStartCreados() }}–{{ rangeEndCreados() }} de {{ valesCreados().length }}
                </span>
                <div class="flex items-center gap-1">
                  <button (click)="goToPageCreados(currentPageCreados() - 1)" [disabled]="currentPageCreados() === 1"
                    class="w-8 h-8 flex items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#F0F4FF] hover:text-[#003399] disabled:opacity-30 disabled:cursor-not-allowed border-0 bg-transparent cursor-pointer transition-colors">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
                  </button>
                  @for (page of visiblePagesCreados(); track page) {
                    @if (page === -1) {
                      <span class="w-8 h-8 flex items-center justify-center text-[12px] text-[#6B7280]">…</span>
                    } @else {
                      <button (click)="goToPageCreados(page)"
                        [class]="page === currentPageCreados() ? 'bg-[#003399] text-white shadow-sm' : 'text-[#6B7280] hover:bg-[#F0F4FF] hover:text-[#003399]'"
                        class="w-8 h-8 flex items-center justify-center rounded-lg text-[12px] font-semibold border-0 cursor-pointer transition-colors">
                        {{ page }}
                      </button>
                    }
                  }
                  <button (click)="goToPageCreados(currentPageCreados() + 1)" [disabled]="currentPageCreados() === totalPagesCreados()"
                    class="w-8 h-8 flex items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#F0F4FF] hover:text-[#003399] disabled:opacity-30 disabled:cursor-not-allowed border-0 bg-transparent cursor-pointer transition-colors">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
                  </button>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-[12px] text-[#6B7280]">Filas:</span>
                  <select class="border border-[#E0E0E0] rounded-lg px-2 py-1 text-[12px] outline-none focus:border-[#003399] bg-white cursor-pointer"
                    [value]="pageSizeCreados()" (change)="changePageSizeCreados($event)">
                    @for (opt of pageSizeOptions; track opt) {
                      <option [value]="opt">{{ opt }}</option>
                    }
                  </select>
                </div>
              </div>
            }
          </div>

          <!-- Tabla de vales autorizados (para canjear) -->
          <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] mt-6">
            <div class="px-5 py-4 border-b border-[#E0E0E0]">
              <span class="font-[Montserrat] font-bold text-[14px] text-[#1A1A2E]">Vales para canjear</span>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-[13px] border-collapse">
                <thead>
                  <tr>
                    <th class="bg-[#F8FAFD] font-[Montserrat] font-bold text-[11px] uppercase tracking-[0.5px] text-[#6B7280] px-5 py-3 text-left border-b border-[#E0E0E0]">ID</th>
                    <th class="bg-[#F8FAFD] font-[Montserrat] font-bold text-[11px] uppercase tracking-[0.5px] text-[#6B7280] px-5 py-3 text-left border-b border-[#E0E0E0]">Cliente</th>
                    <th class="bg-[#F8FAFD] font-[Montserrat] font-bold text-[11px] uppercase tracking-[0.5px] text-[#6B7280] px-5 py-3 text-left border-b border-[#E0E0E0]">Producto</th>
                    <th class="bg-[#F8FAFD] font-[Montserrat] font-bold text-[11px] uppercase tracking-[0.5px] text-[#6B7280] px-5 py-3 text-left border-b border-[#E0E0E0]">Total</th>
                    <th class="bg-[#F8FAFD] font-[Montserrat] font-bold text-[11px] uppercase tracking-[0.5px] text-[#6B7280] px-5 py-3 text-left border-b border-[#E0E0E0]">Tipo</th>
                    <th class="bg-[#F8FAFD] font-[Montserrat] font-bold text-[11px] uppercase tracking-[0.5px] text-[#6B7280] px-5 py-3 text-left border-b border-[#E0E0E0]">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  @for (v of paginatedAutorizados(); track v.id) {
                    <tr class="border-b border-[#F0F0F0] hover:bg-[#F8FAFD] transition-colors">
                      <td class="px-5 py-3 font-mono text-[12px] text-[#FF8800] font-semibold">#{{ v.id }}</td>
                      <td class="px-5 py-3 font-semibold text-[#1A1A2E]">{{ customerName(v) }}</td>
                      <td class="px-5 py-3 text-[#6B7280]">\${{ v.product?.quantity | number }}</td>
                      <td class="px-5 py-3 text-[#6B7280]">\${{ v.total_value | number:'1.2-2' }}</td>
                      <td class="px-5 py-3 text-[#6B7280]">{{ v.type === 'pre-loan' ? 'Pre-vale' : 'Vale' }}</td>
                      <td class="px-5 py-3">
                        <button (click)="selectVale(v)"
                          class="px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-[#FF8800] text-white hover:bg-[#E67A00] transition-colors border-0 cursor-pointer">
                          Canjear
                        </button>
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="6" class="px-5 py-12 text-center text-[#6B7280] text-[13px]">No hay vales autorizados para canjear.</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <!-- Pagination: Vales para canjear -->
            @if (totalPagesAutorizados() > 1) {
              <div class="px-5 py-3 border-t border-[#E0E0E0] flex items-center justify-between gap-3 flex-wrap">
                <span class="text-[12px] text-[#6B7280]">
                  Mostrando {{ rangeStartAutorizados() }}–{{ rangeEndAutorizados() }} de {{ valesAutorizados().length }}
                </span>
                <div class="flex items-center gap-1">
                  <button (click)="goToPageAutorizados(currentPageAutorizados() - 1)" [disabled]="currentPageAutorizados() === 1"
                    class="w-8 h-8 flex items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#F0F4FF] hover:text-[#003399] disabled:opacity-30 disabled:cursor-not-allowed border-0 bg-transparent cursor-pointer transition-colors">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
                  </button>
                  @for (page of visiblePagesAutorizados(); track page) {
                    @if (page === -1) {
                      <span class="w-8 h-8 flex items-center justify-center text-[12px] text-[#6B7280]">…</span>
                    } @else {
                      <button (click)="goToPageAutorizados(page)"
                        [class]="page === currentPageAutorizados() ? 'bg-[#003399] text-white shadow-sm' : 'text-[#6B7280] hover:bg-[#F0F4FF] hover:text-[#003399]'"
                        class="w-8 h-8 flex items-center justify-center rounded-lg text-[12px] font-semibold border-0 cursor-pointer transition-colors">
                        {{ page }}
                      </button>
                    }
                  }
                  <button (click)="goToPageAutorizados(currentPageAutorizados() + 1)" [disabled]="currentPageAutorizados() === totalPagesAutorizados()"
                    class="w-8 h-8 flex items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#F0F4FF] hover:text-[#003399] disabled:opacity-30 disabled:cursor-not-allowed border-0 bg-transparent cursor-pointer transition-colors">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
                  </button>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-[12px] text-[#6B7280]">Filas:</span>
                  <select class="border border-[#E0E0E0] rounded-lg px-2 py-1 text-[12px] outline-none focus:border-[#003399] bg-white cursor-pointer"
                    [value]="pageSizeAutorizados()" (change)="changePageSizeAutorizados($event)">
                    @for (opt of pageSizeOptions; track opt) {
                      <option [value]="opt">{{ opt }}</option>
                    }
                  </select>
                </div>
              </div>
            }
          </div>
        }
      </div>
    }

    <!-- ═══════════════ PANTALLA 3: DETALLE DEL CLIENTE ═══════════════ -->
    @if (screen() === 'detalle') {
      <div>
        <div class="flex items-center gap-3 mb-6">
          <button (click)="screen.set('vales')" class="text-[#6B7280] hover:text-[#003399] transition-colors bg-transparent border-0 cursor-pointer p-0">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <div>
            <h1 class="font-[Montserrat] text-[22px] font-extrabold text-[#1A1A2E]">Vale #{{ selectedVale()?.id }}</h1>
            <p class="text-[13px] text-[#6B7280] mt-0.5">Verifica la identidad del cliente</p>
          </div>
        </div>

        @if (loadingDetalle()) {
          <div class="flex items-center justify-center py-16 text-[#6B7280] text-[13px]">
            <svg class="w-5 h-5 animate-spin mr-2 text-[#003399]" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            Cargando…
          </div>
        } @else if (valeDetalle()) {
          <!-- Info del vale -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            <!-- Datos del cliente -->
            <div class="bg-white rounded-[10px] p-6 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
              <p class="text-[12px] font-bold text-[#003399] uppercase tracking-wide mb-4">Datos del cliente</p>
              <div class="flex flex-col gap-3">
                <div class="flex justify-between text-[13px]">
                  <span class="text-[#6B7280]">Nombre</span>
                  <span class="font-semibold text-[#1A1A2E]">{{ fullName(valeDetalle()!.final_customer) }}</span>
                </div>
                <div class="flex justify-between text-[13px]">
                  <span class="text-[#6B7280]">CURP</span>
                  <span class="font-mono font-semibold text-[#1A1A2E]">{{ valeDetalle()!.final_customer?.curp }}</span>
                </div>
                <div class="flex justify-between text-[13px]">
                  <span class="text-[#6B7280]">No. INE</span>
                  <span class="font-mono font-semibold text-[#1A1A2E]">{{ valeDetalle()!.final_customer?.national_id }}</span>
                </div>
                <div class="flex justify-between text-[13px]">
                  <span class="text-[#6B7280]">Teléfono</span>
                  <span class="font-semibold text-[#1A1A2E]">{{ valeDetalle()!.final_customer?.person_data?.phone_number || valeDetalle()!.final_customer?.person_data?.personal_phone_number || '—' }}</span>
                </div>
                <div class="flex justify-between text-[13px]">
                  <span class="text-[#6B7280]">Sexo</span>
                  <span class="font-semibold text-[#1A1A2E]">{{ genderLabel(valeDetalle()!.final_customer?.person_data?.gender) }}</span>
                </div>
              </div>
            </div>

            <!-- Info del vale -->
            <div class="bg-white rounded-[10px] p-6 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
              <p class="text-[12px] font-bold text-[#003399] uppercase tracking-wide mb-4">Información del vale</p>
              <div class="flex flex-col gap-3">
                <div class="flex justify-between text-[13px]">
                  <span class="text-[#6B7280]">Producto</span>
                  <span class="font-semibold text-[#1A1A2E]">\${{ valeDetalle()!.product?.quantity | number }}</span>
                </div>
                <div class="flex justify-between text-[13px]">
                  <span class="text-[#6B7280]">Total</span>
                  <span class="font-semibold text-[#003399]">\${{ valeDetalle()!.total_value | number:'1.2-2' }}</span>
                </div>
                <div class="flex justify-between text-[13px]">
                  <span class="text-[#6B7280]">Pago quincenal</span>
                  <span class="font-semibold text-[#1A1A2E]">\${{ valeDetalle()!.debt_biweekly | number:'1.2-2' }}</span>
                </div>
                <div class="flex justify-between text-[13px]">
                  <span class="text-[#6B7280]">Tipo</span>
                  <span class="font-semibold text-[#1A1A2E]">{{ valeDetalle()!.type === 'pre-loan' ? 'Pre-vale' : 'Vale' }}</span>
                </div>
                <div class="flex justify-between text-[13px]">
                  <span class="text-[#6B7280]">Estado</span>
                  <span class="bg-[#FF8800]/10 text-[#FF8800] border-[#FF8800]/20 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border">
                    {{ valeDetalle()!.status === 'created' ? 'Creado' : valeDetalle()!.status === 'authorized' ? 'Autorizado' : valeDetalle()!.status }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          @if (actionMsg()) {
            <div class="bg-[#00A86B]/10 text-[#00A86B] text-[13px] px-4 py-3 rounded-lg border border-[#00A86B]/20 mb-6">{{ actionMsg() }}</div>
          }
          @if (actionError()) {
            <div class="bg-[#E53935]/10 text-[#E53935] text-[13px] px-4 py-3 rounded-lg border border-[#E53935]/20 mb-6">{{ actionError() }}</div>
          }

          <!-- Botones de acción -->
          <div class="flex flex-wrap gap-3">
            @if (valeDetalle()!.status === 'created') {
              <button (click)="autorizarVale()" [disabled]="actionLoading()"
                class="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-[14px] font-semibold bg-[#00A86B] text-white hover:bg-[#008F5A] transition-colors border-0 cursor-pointer disabled:opacity-60">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                @if (actionLoading()) { Autorizando… } @else { Verificar y autorizar }
              </button>
            }

            @if (valeDetalle()!.status === 'authorized') {
              <button (click)="openTransferir()" [disabled]="actionLoading()"
                class="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-[14px] font-semibold bg-[#FF8800] text-white hover:bg-[#E67A00] transition-colors border-0 cursor-pointer disabled:opacity-60 shadow-[0_2px_8px_rgba(255,136,0,0.3)]">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Transferir
              </button>
            }
          </div>
        }
      </div>
    }

    <!-- ═══════════════ MODAL TRANSFERIR ═══════════════ -->
    @if (showTransferModal()) {
      <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        (click)="closeTransferModal()">
        <div class="bg-white rounded-[10px] w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto"
          (click)="$event.stopPropagation()">

          <div class="px-5 py-4 border-b border-[#E0E0E0] flex items-center justify-between sticky top-0 bg-white z-10">
            <span class="font-[Montserrat] font-bold text-[15px]">Transferir vale #{{ valeDetalle()?.id }}</span>
            <button (click)="closeTransferModal()" class="text-[#6B7280] hover:text-[#1A1A2E] bg-transparent border-0 cursor-pointer">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <div class="p-5 flex flex-col gap-5">
            @if (transferError()) {
              <div class="bg-[#E53935]/10 text-[#E53935] text-[13px] px-3 py-2 rounded-lg border border-[#E53935]/20">{{ transferError() }}</div>
            }
            @if (transferSuccess()) {
              <div class="bg-[#00A86B]/10 text-[#00A86B] text-[13px] px-3 py-2 rounded-lg border border-[#00A86B]/20">{{ transferSuccess() }}</div>
            }

            <!-- Resumen -->
            <div class="bg-[#F8FAFD] rounded-lg p-4 border border-[#E0E0E0]">
              <div class="flex justify-between text-[13px] mb-2">
                <span class="text-[#6B7280]">Cliente</span>
                <span class="font-semibold text-[#1A1A2E]">{{ fullName(valeDetalle()!.final_customer) }}</span>
              </div>
              <div class="flex justify-between text-[13px]">
                <span class="text-[#6B7280]">Monto a transferir</span>
                <span class="font-extrabold text-[#003399]">\${{ valeDetalle()!.product?.quantity | number }}</span>
              </div>
            </div>

            <!-- Seleccionar cuenta -->
            <div class="flex flex-col gap-1">
              <label class="text-[12px] font-semibold text-[#1A1A2E]">Cuenta destino *</label>
              @if (loadingCuentas()) {
                <div class="text-[12px] text-[#6B7280] py-2">Cargando cuentas…</div>
              } @else {
                <select [(ngModel)]="selectedCardId"
                  class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] transition-colors bg-white">
                  <option value="">— Seleccionar cuenta —</option>
                  @for (c of cuentas(); track c.id) {
                    <option [value]="c.id">{{ c.bank_account?.name || 'Banco' }} — **** {{ c.card ? c.card.slice(-4) : '????' }} ({{ c.type || 'Tarjeta' }})</option>
                  }
                </select>
                @if (cuentas().length === 0) {
                  <span class="text-[11px] text-[#E53935]">Este cliente no tiene cuentas bancarias registradas.</span>
                }
              }
            </div>

            <div class="flex justify-end gap-2 pt-1">
              <button type="button" (click)="closeTransferModal()"
                class="px-4 py-2 rounded-lg text-[13px] font-semibold bg-white text-[#003399] border border-[#E0E0E0] hover:border-[#003399] transition-colors cursor-pointer"
              >Cancelar</button>
              <button type="button" (click)="confirmarTransferencia()" [disabled]="transferLoading()"
                class="px-4 py-2 rounded-lg text-[13px] font-semibold bg-[#FF8800] text-white hover:bg-[#E67A00] transition-colors border-0 cursor-pointer disabled:opacity-60"
              >
                @if (transferLoading()) { Transfiriendo… } @else { Confirmar transferencia }
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class ValesCajeraComponent implements OnInit {
  private http = inject(HttpClient);
  private readonly API = `${environment.apiUrl}/cajera`;

  // ── Screens ─────────────────────────────────────────────────
  screen = signal<'distribuidoras' | 'vales' | 'detalle'>('distribuidoras');

  // ── Distribuidoras ──────────────────────────────────────────
  searchQuery    = '';
  searched       = signal(false);
  loadingDist    = signal(false);
  distribuidoras = signal<any[]>([]);
  selectedDist   = signal<any>(null);

  // ── Vales ───────────────────────────────────────────────────
  loadingVales = signal(false);
  vales        = signal<any[]>([]);
  selectedVale = signal<any>(null);

  valesCreados    = computed(() => this.vales().filter(v => v.status === 'created'));
  valesAutorizados = computed(() => this.vales().filter(v => v.status === 'authorized'));

  // ── Pagination: Vales por autorizar ─────────────────────────
  currentPageCreados = signal(1);
  pageSizeCreados    = signal(10);
  readonly pageSizeOptions = [5, 10, 20, 50];

  totalPagesCreados = computed(() => Math.max(1, Math.ceil(this.valesCreados().length / this.pageSizeCreados())));
  paginatedCreados  = computed(() => {
    const start = (this.currentPageCreados() - 1) * this.pageSizeCreados();
    return this.valesCreados().slice(start, start + this.pageSizeCreados());
  });
  rangeStartCreados = computed(() =>
    this.valesCreados().length === 0 ? 0 : (this.currentPageCreados() - 1) * this.pageSizeCreados() + 1
  );
  rangeEndCreados = computed(() =>
    Math.min(this.currentPageCreados() * this.pageSizeCreados(), this.valesCreados().length)
  );
  visiblePagesCreados = computed(() => {
    const total = this.totalPagesCreados();
    const cur   = this.currentPageCreados();
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: number[] = [1];
    if (cur > 3) pages.push(-1);
    for (let p = Math.max(2, cur - 1); p <= Math.min(total - 1, cur + 1); p++) pages.push(p);
    if (cur < total - 2) pages.push(-1);
    pages.push(total);
    return pages;
  });

  // ── Pagination: Vales para canjear ─────────────────────────
  currentPageAutorizados = signal(1);
  pageSizeAutorizados    = signal(10);

  totalPagesAutorizados = computed(() => Math.max(1, Math.ceil(this.valesAutorizados().length / this.pageSizeAutorizados())));
  paginatedAutorizados  = computed(() => {
    const start = (this.currentPageAutorizados() - 1) * this.pageSizeAutorizados();
    return this.valesAutorizados().slice(start, start + this.pageSizeAutorizados());
  });
  rangeStartAutorizados = computed(() =>
    this.valesAutorizados().length === 0 ? 0 : (this.currentPageAutorizados() - 1) * this.pageSizeAutorizados() + 1
  );
  rangeEndAutorizados = computed(() =>
    Math.min(this.currentPageAutorizados() * this.pageSizeAutorizados(), this.valesAutorizados().length)
  );
  visiblePagesAutorizados = computed(() => {
    const total = this.totalPagesAutorizados();
    const cur   = this.currentPageAutorizados();
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: number[] = [1];
    if (cur > 3) pages.push(-1);
    for (let p = Math.max(2, cur - 1); p <= Math.min(total - 1, cur + 1); p++) pages.push(p);
    if (cur < total - 2) pages.push(-1);
    pages.push(total);
    return pages;
  });

  // ── Detalle ─────────────────────────────────────────────────
  loadingDetalle = signal(false);
  valeDetalle    = signal<any>(null);
  actionLoading  = signal(false);
  actionMsg      = signal('');
  actionError    = signal('');

  // ── Transfer modal ──────────────────────────────────────────
  showTransferModal = signal(false);
  loadingCuentas    = signal(false);
  cuentas           = signal<any[]>([]);
  selectedCardId    = '';
  transferLoading   = signal(false);
  transferError     = signal('');
  transferSuccess   = signal('');

  // ── Helpers ─────────────────────────────────────────────────
  distName(d: any): string {
    const pd = d?.person_data;
    if (!pd) return `Distribuidora #${d?.id}`;
    return [pd.name, pd.first_last_name, pd.second_last_name].filter(Boolean).join(' ');
  }

  distInitial(d: any): string {
    return d?.person_data?.name?.charAt(0)?.toUpperCase() || 'D';
  }

  customerName(v: any): string {
    const pd = v?.final_customer?.person_data;
    if (!pd) return '—';
    return [pd.name, pd.first_last_name, pd.second_last_name].filter(Boolean).join(' ');
  }

  fullName(c: any): string {
    const pd = c?.person_data;
    if (!pd) return '—';
    return [pd.name, pd.first_last_name, pd.second_last_name].filter(Boolean).join(' ');
  }

  genderLabel(g: string | undefined): string {
    if (!g) return '—';
    const map: Record<string, string> = { M: 'Masculino', F: 'Femenino', O: 'Otro' };
    return map[g] ?? g;
  }

  ngOnInit() {}

  // ── Pagination helpers ──────────────────────────────────────
  goToPageCreados(p: number) { this.currentPageCreados.set(Math.max(1, Math.min(p, this.totalPagesCreados()))); }
  changePageSizeCreados(e: Event) {
    this.pageSizeCreados.set(Number((e.target as HTMLSelectElement).value));
    this.currentPageCreados.set(1);
  }

  goToPageAutorizados(p: number) { this.currentPageAutorizados.set(Math.max(1, Math.min(p, this.totalPagesAutorizados()))); }
  changePageSizeAutorizados(e: Event) {
    this.pageSizeAutorizados.set(Number((e.target as HTMLSelectElement).value));
    this.currentPageAutorizados.set(1);
  }

  // ── Pantalla 1: Buscar distribuidoras ───────────────────────
  searchDistribuidoras() {
    if (!this.searchQuery.trim()) return;
    this.loadingDist.set(true);
    this.searched.set(true);

    this.http.get<any>(`${this.API}/distribuidoras`, {
      params: { q: this.searchQuery.trim() },
    }).subscribe({
      next: res => {
        this.distribuidoras.set(res.data ?? []);
        this.loadingDist.set(false);
      },
      error: err => {
        console.error('=== SEARCH DIST ERROR ===', err);
        this.distribuidoras.set([]);
        this.loadingDist.set(false);
      },
    });
  }

  selectDistribuidora(d: any) {
    this.selectedDist.set(d);
    this.screen.set('vales');
    this.loadVales(d.id);
  }

  // ── Pantalla 2: Vales de distribuidora ──────────────────────
  private loadVales(distId: number) {
    this.loadingVales.set(true);
    this.http.get<any>(`${this.API}/distribuidoras/${distId}/vales`).subscribe({
      next: res => {
        this.vales.set(res.data?.data ?? [])
        this.currentPageCreados.set(1);
        this.currentPageAutorizados.set(1);
        this.loadingVales.set(false);
      },
      error: err => {
        console.error('=== LOAD VALES ERROR ===', err);
        this.vales.set([]);
        this.loadingVales.set(false);
      },
    });
  }

  selectVale(v: any) {
    this.selectedVale.set(v);
    this.screen.set('detalle');
    this.loadDetalle(v.id);
  }

  // ── Pantalla 3: Detalle del vale ────────────────────────────
  private loadDetalle(loanId: number) {
    this.loadingDetalle.set(true);
    this.actionMsg.set('');
    this.actionError.set('');

    this.http.get<any>(`${this.API}/vales/${loanId}`).subscribe({
      next: res => {
        this.valeDetalle.set(res.data ?? null);
        this.loadingDetalle.set(false);
      },
      error: err => {
        console.error('=== LOAD DETALLE ERROR ===', err);
        this.loadingDetalle.set(false);
      },
    });
  }

  // ── Autorizar vale ──────────────────────────────────────────
  autorizarVale() {
    if (!confirm('¿Confirmas que la identidad del cliente coincide con la información del sistema?')) return;

    this.actionLoading.set(true);
    this.actionMsg.set('');
    this.actionError.set('');

    const loanId = this.valeDetalle()?.id;
    this.http.put<any>(`${this.API}/vales/${loanId}/autorizar`, {}).subscribe({
      next: res => {
        this.actionLoading.set(false);
        this.actionMsg.set(res?.message ?? 'Vale autorizado correctamente.');
        // Recargar detalle para actualizar el status
        this.loadDetalle(loanId);
      },
      error: err => {
        console.error('=== AUTORIZAR ERROR ===', err);
        this.actionLoading.set(false);
        this.actionError.set(err?.error?.message ?? 'Error al autorizar.');
      },
    });
  }

  // ── Modal transferir ────────────────────────────────────────
  openTransferir() {
    this.selectedCardId = '';
    this.transferError.set('');
    this.transferSuccess.set('');
    this.showTransferModal.set(true);
    this.loadCuentas();
  }

  closeTransferModal() { this.showTransferModal.set(false); }

  private loadCuentas() {
    this.loadingCuentas.set(true);
    const loanId = this.valeDetalle()?.id;

    this.http.get<any>(`${this.API}/vales/${loanId}/cuentas`).subscribe({
      next: res => {
        this.cuentas.set(res.data ?? []);
        this.loadingCuentas.set(false);
      },
      error: err => {
        console.error('=== LOAD CUENTAS ERROR ===', err);
        this.cuentas.set([]);
        this.loadingCuentas.set(false);
      },
    });
  }

  confirmarTransferencia() {
    if (!this.selectedCardId) {
      this.transferError.set('Selecciona una cuenta destino.');
      return;
    }

    if (!confirm('¿Confirmas la transferencia a la cuenta seleccionada?')) return;

    this.transferLoading.set(true);
    this.transferError.set('');
    this.transferSuccess.set('');

    const loanId = this.valeDetalle()?.id;
    this.http.put<any>(`${this.API}/vales/${loanId}/transferir`, {
      customer_card_id: Number(this.selectedCardId),
    }).subscribe({
      next: res => {
        this.transferLoading.set(false);
        this.transferSuccess.set(res?.message ?? 'Transferencia realizada correctamente.');
        setTimeout(() => {
          this.closeTransferModal();
          this.loadDetalle(loanId);
        }, 2000);
      },
      error: err => {
        console.error('=== TRANSFER ERROR ===', err);
        this.transferLoading.set(false);
        this.transferError.set(err?.error?.message ?? 'Error al transferir.');
      },
    });
  }
}
