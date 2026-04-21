import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { positiveNumberValidator, getErrorMessage } from '../../../core/validators/form-validators';
import { CurrencyPipe } from '@angular/common';
import { Product, ProductForm } from '../../../core/models';
import { ProductService } from '../../../core/services/product.service';

@Component({
  selector: 'app-products',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, CurrencyPipe],
  template: `
    <div>
      <!-- Header -->
      <div class="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 class="font-[Montserrat] text-[22px] font-extrabold text-[#1A1A2E]">Productos</h1>
          <p class="text-[13px] text-[#6B7280] mt-0.5">Gestión de productos disponibles para distribuidoras</p>
        </div>
        <button
          (click)="openCreate()"
          class="inline-flex items-center gap-1.5 px-[18px] py-[9px] rounded-lg text-[13px] font-semibold bg-[#003399] text-white hover:bg-[#002277] transition-colors border-0 cursor-pointer flex-shrink-0"
        >
          <svg class="w-[15px] h-[15px]" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
          </svg>
          Nuevo producto
        </button>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white rounded-[10px] p-5 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] flex gap-4">
          <div class="w-11 h-11 rounded-[10px] bg-[#003399]/10 text-[#003399] flex items-center justify-center flex-shrink-0">
            <svg class="w-[22px] h-[22px]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"/></svg>
          </div>
          <div>
            <div class="font-[Montserrat] text-[22px] font-extrabold">{{ products().length }}</div>
            <div class="text-[12px] text-[#6B7280] mt-0.5">Total</div>
          </div>
        </div>
        <div class="bg-white rounded-[10px] p-5 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] flex gap-4">
          <div class="w-11 h-11 rounded-[10px] bg-[#00A86B]/10 text-[#00A86B] flex items-center justify-center flex-shrink-0">
            <svg class="w-[22px] h-[22px]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <div>
            <div class="font-[Montserrat] text-[22px] font-extrabold">{{ activeCount() }}</div>
            <div class="text-[12px] text-[#6B7280] mt-0.5">Activos</div>
          </div>
        </div>
        <div class="bg-white rounded-[10px] p-5 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] flex gap-4">
          <div class="w-11 h-11 rounded-[10px] bg-[#E53935]/10 text-[#E53935] flex items-center justify-center flex-shrink-0">
            <svg class="w-[22px] h-[22px]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>
          </div>
          <div>
            <div class="font-[Montserrat] text-[22px] font-extrabold">{{ inactiveCount() }}</div>
            <div class="text-[12px] text-[#6B7280] mt-0.5">Inactivos</div>
          </div>
        </div>
        <div class="bg-white rounded-[10px] p-5 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] flex gap-4">
          <div class="w-11 h-11 rounded-[10px] bg-[#FF8800]/12 text-[#FF8800] flex items-center justify-center flex-shrink-0">
            <svg class="w-[22px] h-[22px]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <div>
            <div class="font-[Montserrat] text-[22px] font-extrabold">{{ avgInterest() }}%</div>
            <div class="text-[12px] text-[#6B7280] mt-0.5">Interés prom.</div>
          </div>
        </div>
      </div>

      <!-- Table card -->
      <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
        <div class="px-5 py-4 border-b border-[#E0E0E0] flex items-center justify-between gap-3">
          <span class="font-[Montserrat] font-bold text-[14px] text-[#1A1A2E]">Lista de productos</span>
          <input
            type="search"
            placeholder="Buscar producto…"
            class="border border-[#E0E0E0] rounded-lg px-3 py-1.5 text-[13px] outline-none focus:border-[#003399] w-52 transition-colors"
            (input)="search($event)"
            aria-label="Buscar producto"
          />
        </div>

        @if (loading()) {
          <div class="flex items-center justify-center py-16 text-[#6B7280] text-[13px]">
            <svg class="w-5 h-5 animate-spin mr-2 text-[#003399]" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            Cargando productos…
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-[13px] border-collapse">
              <thead>
                <tr>
                  @for (h of headers; track h) {
                    <th class="bg-[#F8FAFD] font-[Montserrat] font-bold text-[11px] uppercase tracking-[0.5px] text-[#6B7280] px-5 py-3 text-left border-b border-[#E0E0E0] whitespace-nowrap">
                      {{ h }}
                    </th>
                  }
                </tr>
              </thead>
              <tbody>
                @for (p of paginated(); track p.id) {
                  <tr class="border-b border-[#F0F0F0] hover:bg-[#F8FAFD] transition-colors">
                    <td class="px-5 py-3 font-semibold text-[#1A1A2E]">{{ p.name }}</td>
                    <td class="px-5 py-3 text-[#1A1A2E]">{{ p.quantity | currency:'MXN':'symbol':'1.2-2':'es-MX' }}</td>
                    <td class="px-5 py-3 text-[#1A1A2E]">{{ p.fortnights }}</td>
                    <td class="px-5 py-3 text-[#1A1A2E]">{{ p.deposit | currency:'MXN':'symbol':'1.2-2':'es-MX' }}</td>
                    <td class="px-5 py-3 text-[#1A1A2E]">{{ p.interest }}%</td>
                    <td class="px-5 py-3">
                      <span
                        [class]="p.status === 'active'
                          ? 'bg-[#00A86B]/10 text-[#00A86B] border-[#00A86B]/20'
                          : 'bg-[#E53935]/10 text-[#E53935] border-[#E53935]/20'"
                        class="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border"
                      >
                        {{ p.status === 'active' ? 'Activo' : 'Inactivo' }}
                      </span>
                    </td>
                    <td class="px-5 py-3">
                      <div class="flex items-center gap-1">
                        <button
                          (click)="openEdit(p)"
                          class="p-1.5 rounded-lg text-[#003399] hover:bg-[#003399]/10 transition-colors border-0 cursor-pointer bg-transparent"
                          aria-label="Editar producto"
                          title="Editar"
                        >
                          <svg class="w-[15px] h-[15px]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                        </button>
                        @if (p.status === 'active') {
                          <button
                            (click)="deactivate(p)"
                            class="p-1.5 rounded-lg text-[#E53935] hover:bg-[#E53935]/10 transition-colors border-0 cursor-pointer bg-transparent"
                            aria-label="Dar de baja producto"
                            title="Dar de baja"
                          >
                            <svg class="w-[15px] h-[15px]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>
                          </button>
                        } @else {
                          <button
                            (click)="restore(p)"
                            class="p-1.5 rounded-lg text-[#00A86B] hover:bg-[#00A86B]/10 transition-colors border-0 cursor-pointer bg-transparent"
                            aria-label="Activar producto"
                            title="Activar"
                          >
                            <svg class="w-[15px] h-[15px]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                          </button>
                        }
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="7" class="px-5 py-12 text-center text-[#6B7280] text-[13px]">
                      No se encontraron productos.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          @if (totalPages() > 1 || filtered().length > pageSize()) {
            <div class="px-5 py-3 border-t border-[#E0E0E0] flex items-center justify-between gap-3 flex-wrap">
              <!-- Info -->
              <span class="text-[12px] text-[#6B7280]">
                Mostrando {{ rangeStart() }}–{{ rangeEnd() }} de {{ filtered().length }} productos
              </span>

              <!-- Controls -->
              <div class="flex items-center gap-1">
                <!-- First -->
                <button
                  (click)="goToPage(1)"
                  [disabled]="currentPage() === 1"
                  class="w-8 h-8 flex items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#F0F4FF] hover:text-[#003399] disabled:opacity-30 disabled:cursor-not-allowed border-0 bg-transparent cursor-pointer transition-colors"
                  aria-label="Primera página"
                  title="Primera página"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11 19l-7-7 7-7M18 19l-7-7 7-7"/></svg>
                </button>

                <!-- Prev -->
                <button
                  (click)="goToPage(currentPage() - 1)"
                  [disabled]="currentPage() === 1"
                  class="w-8 h-8 flex items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#F0F4FF] hover:text-[#003399] disabled:opacity-30 disabled:cursor-not-allowed border-0 bg-transparent cursor-pointer transition-colors"
                  aria-label="Página anterior"
                  title="Anterior"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
                </button>

                <!-- Page numbers -->
                @for (page of visiblePages(); track page) {
                  @if (page === -1) {
                    <span class="w-8 h-8 flex items-center justify-center text-[12px] text-[#6B7280]">…</span>
                  } @else {
                    <button
                      (click)="goToPage(page)"
                      [class]="page === currentPage()
                        ? 'bg-[#003399] text-white shadow-sm'
                        : 'text-[#6B7280] hover:bg-[#F0F4FF] hover:text-[#003399]'"
                      class="w-8 h-8 flex items-center justify-center rounded-lg text-[12px] font-semibold border-0 cursor-pointer transition-colors"
                      [attr.aria-current]="page === currentPage() ? 'page' : null"
                    >
                      {{ page }}
                    </button>
                  }
                }

                <!-- Next -->
                <button
                  (click)="goToPage(currentPage() + 1)"
                  [disabled]="currentPage() === totalPages()"
                  class="w-8 h-8 flex items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#F0F4FF] hover:text-[#003399] disabled:opacity-30 disabled:cursor-not-allowed border-0 bg-transparent cursor-pointer transition-colors"
                  aria-label="Página siguiente"
                  title="Siguiente"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
                </button>

                <!-- Last -->
                <button
                  (click)="goToPage(totalPages())"
                  [disabled]="currentPage() === totalPages()"
                  class="w-8 h-8 flex items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#F0F4FF] hover:text-[#003399] disabled:opacity-30 disabled:cursor-not-allowed border-0 bg-transparent cursor-pointer transition-colors"
                  aria-label="Última página"
                  title="Última página"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 5l7 7-7 7M6 5l7 7-7 7"/></svg>
                </button>
              </div>

              <!-- Page size selector -->
              <div class="flex items-center gap-2">
                <span class="text-[12px] text-[#6B7280]">Filas:</span>
                <select
                  class="border border-[#E0E0E0] rounded-lg px-2 py-1 text-[12px] outline-none focus:border-[#003399] bg-white transition-colors cursor-pointer"
                  [value]="pageSize()"
                  (change)="changePageSize($event)"
                  aria-label="Filas por página"
                >
                  @for (opt of pageSizeOptions; track opt) {
                    <option [value]="opt">{{ opt }}</option>
                  }
                </select>
              </div>
            </div>
          }
        }
      </div>
    </div>

    <!-- ── MODAL ── -->
    @if (showModal()) {
      <div
        class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="editingId() ? 'Editar producto' : 'Crear producto'"
        (click)="closeModal()"
      >
        <div
          class="bg-white rounded-[10px] w-full max-w-md shadow-xl"
          (click)="$event.stopPropagation()"
        >
          <div class="px-5 py-4 border-b border-[#E0E0E0] flex items-center justify-between">
            <span class="font-[Montserrat] font-bold text-[15px]">
              {{ editingId() ? 'Editar producto' : 'Nuevo producto' }}
            </span>
            <button
              (click)="closeModal()"
              class="text-[#6B7280] hover:text-[#1A1A2E] transition-colors bg-transparent border-0 cursor-pointer"
              aria-label="Cerrar modal"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <form [formGroup]="form" (ngSubmit)="submit()" class="p-5 flex flex-col gap-4">
            @if (errorMsg()) {
              <div class="bg-[#E53935]/10 text-[#E53935] text-[13px] px-3 py-2 rounded-lg border border-[#E53935]/20" role="alert">
                {{ errorMsg() }}
              </div>
            }

            <div class="flex flex-col gap-1">
              <label class="text-[12px] font-semibold text-[#1A1A2E]" for="p-name">Nombre *</label>
              <input id="p-name" formControlName="name" type="text" placeholder="Ej. Producto Básico"
                class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] transition-colors"
                [class.border-[#E53935]]="isInvalid('name')"
              />
              @if (isInvalid('name')) {
                <span class="text-[11px] text-[#E53935]">{{ errMsg('name', 'Nombre') }}</span>
              }
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="flex flex-col gap-1">
                <label class="text-[12px] font-semibold text-[#1A1A2E]" for="p-qty">Monto ($) *</label>
                <input id="p-qty" formControlName="quantity" type="number" min="0" step="0.01" placeholder="0.00"
                  class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] transition-colors"
                  [class.border-[#E53935]]="isInvalid('quantity')"
                />
                @if (isInvalid('quantity')) {
                  <span class="text-[11px] text-[#E53935]">{{ errMsg('quantity', 'Monto') }}</span>
                }
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-[12px] font-semibold text-[#1A1A2E]" for="p-fort">Quincenas *</label>
                <input id="p-fort" formControlName="fortnights" type="number" min="1" placeholder="1"
                  class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] transition-colors"
                  [class.border-[#E53935]]="isInvalid('fortnights')"
                />
                @if (isInvalid('fortnights')) {
                  <span class="text-[11px] text-[#E53935]">{{ errMsg('fortnights', 'Quincenas') }}</span>
                }
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="flex flex-col gap-1">
                <label class="text-[12px] font-semibold text-[#1A1A2E]" for="p-dep">Depósito ($)</label>
                <input id="p-dep" formControlName="deposit" type="number" min="0" step="0.01" placeholder="0.00"
                  class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] transition-colors"
                  [class.border-[#E53935]]="isInvalid('deposit')"
                />
                @if (isInvalid('deposit')) { <span class="text-[11px] text-[#E53935]">{{ errMsg('deposit', 'Depósito') }}</span> }
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-[12px] font-semibold text-[#1A1A2E]" for="p-int">Interés (%) <span class="text-[#6B7280] font-normal">0–100</span></label>
                <input id="p-int" formControlName="interest" type="number" min="0" max="100" step="0.01" placeholder="0.00"
                  class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] transition-colors"
                  [class.border-[#E53935]]="isInvalid('interest')"
                />
                @if (isInvalid('interest')) { <span class="text-[11px] text-[#E53935]">{{ errMsg('interest', 'Interés') }}</span> }
              </div>
            </div>

            @if (editingId()) {
              <div class="flex flex-col gap-1">
                <label class="text-[12px] font-semibold text-[#1A1A2E]" for="p-status">Estado</label>
                <select id="p-status" formControlName="status"
                  class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] transition-colors bg-white"
                >
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                </select>
              </div>
            }

            <div class="flex justify-end gap-2 pt-1">
              <button
                type="button"
                (click)="closeModal()"
                class="px-4 py-2 rounded-lg text-[13px] font-semibold bg-white text-[#003399] border border-[#E0E0E0] hover:border-[#003399] hover:bg-blue-50 transition-colors cursor-pointer"
              >Cancelar</button>
              <button
                type="submit"
                [disabled]="saving()"
                class="px-4 py-2 rounded-lg text-[13px] font-semibold bg-[#003399] text-white hover:bg-[#002277] transition-colors border-0 cursor-pointer disabled:opacity-60"
              >
                @if (saving()) { Guardando… } @else { Guardar }
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
})
export class ProductsComponent implements OnInit {
  private svc = inject(ProductService);
  private fb  = inject(FormBuilder);

  products  = signal<Product[]>([]);
  filtered  = signal<Product[]>([]);
  loading   = signal(true);
  showModal = signal(false);
  saving    = signal(false);
  editingId = signal<number | null>(null);
  errorMsg  = signal('');

  // ── Pagination ──────────────────────────────────────────────
  currentPage = signal(1);
  pageSize    = signal(10);
  readonly pageSizeOptions = [5, 10, 20, 50];

  totalPages = computed(() => Math.max(1, Math.ceil(this.filtered().length / this.pageSize())));

  paginated = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filtered().slice(start, start + this.pageSize());
  });

  rangeStart = computed(() =>
    this.filtered().length === 0 ? 0 : (this.currentPage() - 1) * this.pageSize() + 1
  );

  rangeEnd = computed(() =>
    Math.min(this.currentPage() * this.pageSize(), this.filtered().length)
  );

  /** Returns page numbers with -1 as ellipsis placeholder */
  visiblePages = computed(() => {
    const total = this.totalPages();
    const cur   = this.currentPage();
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    const pages: number[] = [1];
    if (cur > 3) pages.push(-1);
    for (let p = Math.max(2, cur - 1); p <= Math.min(total - 1, cur + 1); p++) pages.push(p);
    if (cur < total - 2) pages.push(-1);
    pages.push(total);
    return pages;
  });
  // ────────────────────────────────────────────────────────────

  headers = ['Nombre', 'Monto', 'Quincenas', 'Depósito', 'Interés', 'Estado', 'Acciones'];

  activeCount   = () => this.products().filter(p => p.status === 'active').length;
  inactiveCount = () => this.products().filter(p => p.status === 'inactive').length;
  avgInterest   = () => {
    const list = this.products();
    if (!list.length) return '0.00';
    return (list.reduce((s, p) => s + +p.interest, 0) / list.length).toFixed(2);
  };

  form = this.fb.group({
    name:       ['', [Validators.required, Validators.minLength(2)]],
    quantity:   [null as number | null, [Validators.required, positiveNumberValidator()]],
    fortnights: [null as number | null, [Validators.required, Validators.min(1)]],
    deposit:    [0, [Validators.min(0)]],
    interest:   [0, [Validators.min(0), Validators.max(100)]],
    status:     ['active'],
  });

  ngOnInit() { this.load(); }

  private load() {
    this.loading.set(true);
    this.svc.getAll().subscribe({
      next: res => {
        this.products.set(res.data);
        this.filtered.set(res.data);
        this.currentPage.set(1);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  search(e: Event) {
    const q = (e.target as HTMLInputElement).value.toLowerCase();
    this.filtered.set(this.products().filter(p => p.name.toLowerCase().includes(q)));
    this.currentPage.set(1); // reset to first page on search
  }

  goToPage(page: number) {
    const clamped = Math.max(1, Math.min(page, this.totalPages()));
    this.currentPage.set(clamped);
  }

  changePageSize(e: Event) {
    this.pageSize.set(Number((e.target as HTMLSelectElement).value));
    this.currentPage.set(1);
  }

  openCreate() {
    this.editingId.set(null);
    this.form.reset({ deposit: 0, interest: 0, status: 'active' });
    this.errorMsg.set('');
    this.showModal.set(true);
  }

  openEdit(p: Product) {
    this.editingId.set(p.id);
    this.form.patchValue(p);
    this.errorMsg.set('');
    this.showModal.set(true);
  }

  closeModal() { this.showModal.set(false); }

  isInvalid(field: string) { return this.form.get(field)?.invalid && this.form.get(field)?.touched; }
  errMsg(f: string, label = '') { return getErrorMessage(this.form.get(f), label); }

  submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.saving.set(true);
    this.errorMsg.set('');
    const val = this.form.value as ProductForm;
    const id  = this.editingId();

    const obs = id ? this.svc.update(id, val) : this.svc.create(val);

    obs.subscribe({
      next: () => { this.saving.set(false); this.closeModal(); this.load(); },
      error: err => {
        this.saving.set(false);
        this.errorMsg.set(err?.error?.message ?? 'Error al guardar.');
      },
    });
  }

  deactivate(p: Product) {
    if (!confirm(`¿Dar de baja "${p.name}"?`)) return;
    this.svc.deactivate(p.id).subscribe({ next: () => this.load() });
  }

  restore(p: Product) {
    this.svc.restore(p.id).subscribe({ next: () => this.load() });
  }
}
