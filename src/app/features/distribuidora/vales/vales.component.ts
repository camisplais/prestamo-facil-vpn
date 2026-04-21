import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-vales',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, DecimalPipe],
  template: `
    <div>
      <!-- Header -->
      <div class="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 class="font-[Montserrat] text-[22px] font-extrabold text-[#1A1A2E]">Vales</h1>
          <p class="text-[13px] text-[#6B7280] mt-0.5">Gestión de vales y préstamos de clientes</p>
        </div>
        <button
          (click)="openCreate()"
          class="inline-flex items-center gap-1.5 px-[18px] py-[9px] rounded-lg text-[13px] font-semibold bg-[#003399] text-white hover:bg-[#002277] transition-colors border-0 cursor-pointer flex-shrink-0"
        >
          <svg class="w-[15px] h-[15px]" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
          </svg>
          Nuevo vale
        </button>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white rounded-[10px] p-5 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] flex gap-4">
          <div class="w-11 h-11 rounded-[10px] bg-[#003399]/10 text-[#003399] flex items-center justify-center flex-shrink-0">
            <svg class="w-[22px] h-[22px]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </div>
          <div>
            <div class="font-[Montserrat] text-[22px] font-extrabold">{{ totalCount() }}</div>
            <div class="text-[12px] text-[#6B7280] mt-0.5">Total</div>
          </div>
        </div>
        <div class="bg-white rounded-[10px] p-5 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] flex gap-4">
          <div class="w-11 h-11 rounded-[10px] bg-[#FF8800]/10 text-[#FF8800] flex items-center justify-center flex-shrink-0">
            <svg class="w-[22px] h-[22px]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div>
            <div class="font-[Montserrat] text-[22px] font-extrabold">{{ createdCount() }}</div>
            <div class="text-[12px] text-[#6B7280] mt-0.5">Creados</div>
          </div>
        </div>
        <div class="bg-white rounded-[10px] p-5 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] flex gap-4">
          <div class="w-11 h-11 rounded-[10px] bg-[#00A86B]/10 text-[#00A86B] flex items-center justify-center flex-shrink-0">
            <svg class="w-[22px] h-[22px]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div>
            <div class="font-[Montserrat] text-[22px] font-extrabold">{{ authorizedCount() }}</div>
            <div class="text-[12px] text-[#6B7280] mt-0.5">Autorizados</div>
          </div>
        </div>
        <div class="bg-white rounded-[10px] p-5 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] flex gap-4">
          <div class="w-11 h-11 rounded-[10px] bg-[#E53935]/10 text-[#E53935] flex items-center justify-center flex-shrink-0">
            <svg class="w-[22px] h-[22px]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
            </svg>
          </div>
          <div>
            <div class="font-[Montserrat] text-[22px] font-extrabold">{{ canceledCount() }}</div>
            <div class="text-[12px] text-[#6B7280] mt-0.5">Cancelados</div>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
        <div class="px-5 py-4 border-b border-[#E0E0E0] flex items-center justify-between gap-3">
          <span class="font-[Montserrat] font-bold text-[14px] text-[#1A1A2E]">Lista de vales</span>
          <input type="search" placeholder="Buscar por cliente o ID…" (input)="search($event)"
            class="border border-[#E0E0E0] rounded-lg px-3 py-1.5 text-[13px] outline-none focus:border-[#003399] w-64 transition-colors"
          />
        </div>

        @if (loading()) {
          <div class="flex items-center justify-center py-16 text-[#6B7280] text-[13px]">
            <svg class="w-5 h-5 animate-spin mr-2 text-[#003399]" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            Cargando…
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
                @for (v of paginated(); track v.id) {
                  <tr class="border-b border-[#F0F0F0] hover:bg-[#F8FAFD] transition-colors">
                    <td class="px-5 py-3 font-mono text-[12px] text-[#003399] font-semibold">#{{ v.id }}</td>
                    <td class="px-5 py-3 font-semibold text-[#1A1A2E]">{{ customerName(v) }}</td>
                    <td class="px-5 py-3 text-[#6B7280]">{{ v.product?.quantity | number }} </td>
                    <td class="px-5 py-3 text-[#6B7280]">{{ v.total_value | number:'1.2-2' }}</td>
                    <td class="px-5 py-3 text-[#6B7280]">{{ v.debt_biweekly | number:'1.2-2' }}</td>
                    <td class="px-5 py-3 text-[#6B7280]">{{ v.type === 'pre-loan' ? 'Pre-vale' : 'Vale' }}</td>
                    <td class="px-5 py-3">
                      <span [class]="statusClass(v.status)"
                        class="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border">
                        {{ statusLabel(v.status) }}
                      </span>
                    </td>
                    <td class="px-5 py-3">
                      <div class="flex items-center gap-1">
                        <!-- 👇 Botón ver pagos: solo habilitado si cashed u on_hold -->
                        <button (click)="goToDetail(v)"
                          [disabled]="v.status !== 'cashed' && v.status !== 'on_hold'"
                          [title]="v.status === 'cashed' || v.status === 'on_hold' ? 'Ver pagos' : 'Solo disponible cuando el vale esté activo (cashed)'"
                          class="p-1.5 rounded-lg text-[#003399] hover:bg-[#003399]/10 transition-colors border-0 cursor-pointer bg-transparent disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <svg class="w-[15px] h-[15px]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                          </svg>
                        </button>
                        @if (v.status === 'created' || v.status === 'authorized') {
                          <button (click)="cancelVale(v)"
                            class="p-1.5 rounded-lg text-[#E53935] hover:bg-[#E53935]/10 transition-colors border-0 cursor-pointer bg-transparent"
                            title="Cancelar vale"
                          >
                            <svg class="w-[15px] h-[15px]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
                            </svg>
                          </button>
                        }
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="8" class="px-5 py-12 text-center text-[#6B7280] text-[13px]">No se encontraron vales.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          @if (totalPages() > 1) {
            <div class="px-5 py-3 border-t border-[#E0E0E0] flex items-center justify-between gap-3 flex-wrap">
              <span class="text-[12px] text-[#6B7280]">
                Mostrando {{ rangeStart() }}–{{ rangeEnd() }} de {{ filtered().length }}
              </span>
              <div class="flex items-center gap-1">
                <button (click)="goToPage(currentPage() - 1)" [disabled]="currentPage() === 1"
                  class="w-8 h-8 flex items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#F0F4FF] hover:text-[#003399] disabled:opacity-30 disabled:cursor-not-allowed border-0 bg-transparent cursor-pointer transition-colors">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
                </button>
                @for (page of visiblePages(); track page) {
                  @if (page === -1) {
                    <span class="w-8 h-8 flex items-center justify-center text-[12px] text-[#6B7280]">…</span>
                  } @else {
                    <button (click)="goToPage(page)"
                      [class]="page === currentPage() ? 'bg-[#003399] text-white shadow-sm' : 'text-[#6B7280] hover:bg-[#F0F4FF] hover:text-[#003399]'"
                      class="w-8 h-8 flex items-center justify-center rounded-lg text-[12px] font-semibold border-0 cursor-pointer transition-colors">
                      {{ page }}
                    </button>
                  }
                }
                <button (click)="goToPage(currentPage() + 1)" [disabled]="currentPage() === totalPages()"
                  class="w-8 h-8 flex items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#F0F4FF] hover:text-[#003399] disabled:opacity-30 disabled:cursor-not-allowed border-0 bg-transparent cursor-pointer transition-colors">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
                </button>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-[12px] text-[#6B7280]">Filas:</span>
                <select class="border border-[#E0E0E0] rounded-lg px-2 py-1 text-[12px] outline-none focus:border-[#003399] bg-white cursor-pointer"
                  [value]="pageSize()" (change)="changePageSize($event)">
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

    <!-- ═══════════════ MODAL NUEVO VALE ═══════════════ -->
    @if (showModal()) {
      <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        (click)="closeModal()">
        <div class="bg-white rounded-[10px] w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto"
          (click)="$event.stopPropagation()">

          <div class="px-5 py-4 border-b border-[#E0E0E0] flex items-center justify-between sticky top-0 bg-white z-10">
            <span class="font-[Montserrat] font-bold text-[15px]">Nuevo vale</span>
            <button (click)="closeModal()" class="text-[#6B7280] hover:text-[#1A1A2E] bg-transparent border-0 cursor-pointer">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <div class="p-5 flex flex-col gap-5">
            @if (errorMsg()) {
              <div class="bg-[#E53935]/10 text-[#E53935] text-[13px] px-3 py-2 rounded-lg border border-[#E53935]/20">{{ errorMsg() }}</div>
            }

            <!-- Cliente -->
            <div class="flex flex-col gap-1">
              <label class="text-[12px] font-semibold text-[#1A1A2E]" for="v-customer">Cliente *</label>
              @if (loadingCustomers()) {
                <div class="text-[12px] text-[#6B7280] py-2">Cargando clientes…</div>
              } @else {
                <select id="v-customer" [(ngModel)]="selectedCustomerId"
                  class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] transition-colors bg-white">
                  <option value="">— Seleccionar cliente —</option>
                  @for (c of eligibleCustomers(); track c.id) {
                    <option [value]="c.id">{{ customerNameFromObj(c) }}</option>
                  }
                </select>
                @if (eligibleCustomers().length === 0) {
                  <span class="text-[11px] text-[#E53935]">No hay clientes elegibles (deben estar al corriente y sin vales activos).</span>
                }
              }
            </div>

            <!-- Producto -->
            <div class="flex flex-col gap-1">
              <label class="text-[12px] font-semibold text-[#1A1A2E]" for="v-product">Producto *</label>
              @if (loadingProducts()) {
                <div class="text-[12px] text-[#6B7280] py-2">Cargando productos disponibles…</div>
              } @else {
                <select id="v-product" [(ngModel)]="selectedProductId"
                  class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] transition-colors bg-white">
                  <option value="">— Seleccionar producto —</option>
                  @for (p of availableProducts(); track p.id) {
                    <option [value]="p.id">\${{ p.quantity }} — {{ p.name || 'Producto #' + p.id }}</option>
                  }
                </select>
                @if (availableProducts().length === 0 && !loadingProducts()) {
                  <span class="text-[11px] text-[#E53935]">No hay productos disponibles para tu crédito actual.</span>
                }
              }
            </div>

            <!-- Info del producto seleccionado -->
            @if (selectedProduct()) {
              <div class="bg-[#F8FAFD] rounded-lg p-4 border border-[#E0E0E0]">
                <p class="text-[12px] font-bold text-[#003399] uppercase tracking-wide mb-2">Detalle del producto</p>
                <div class="grid grid-cols-2 gap-2 text-[13px]">
                  <div>
                    <span class="text-[#6B7280]">Monto:</span>
                    <span class="font-semibold text-[#1A1A2E] ml-1">\${{ selectedProduct()!.quantity | number }}</span>
                  </div>
                  <div>
                    <span class="text-[#6B7280]">Interés:</span>
                    <span class="font-semibold text-[#1A1A2E] ml-1">{{ selectedProduct()!.interest }}%</span>
                  </div>
                  <div>
                    <span class="text-[#6B7280]">Quincenas:</span>
                    <span class="font-semibold text-[#1A1A2E] ml-1">{{ selectedProduct()!.fortnights }}</span>
                  </div>
                  <div>
                    <span class="text-[#6B7280]">Depósito:</span>
                    <span class="font-semibold text-[#1A1A2E] ml-1">\${{ selectedProduct()!.deposit | number }}</span>
                  </div>
                </div>
              </div>
            }

            <div class="flex justify-end gap-2 pt-1">
              <button type="button" (click)="closeModal()"
                class="px-4 py-2 rounded-lg text-[13px] font-semibold bg-white text-[#003399] border border-[#E0E0E0] hover:border-[#003399] transition-colors cursor-pointer"
              >Cancelar</button>
              <button type="button" (click)="submitVale()" [disabled]="saving()"
                class="px-4 py-2 rounded-lg text-[13px] font-semibold bg-[#003399] text-white hover:bg-[#002277] transition-colors border-0 cursor-pointer disabled:opacity-60"
              >
                @if (saving()) { Creando… } @else { Crear vale }
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class ValesComponent implements OnInit {
  private http   = inject(HttpClient);
  private router = inject(Router);

  private readonly API_LOAN = `${environment.apiUrl}/distribuidora/loan`;

  vales     = signal<any[]>([]);
  filtered  = signal<any[]>([]);
  loading   = signal(true);
  showModal = signal(false);
  saving    = signal(false);
  errorMsg  = signal('');

  // ── Create modal ────────────────────────────────────────────
  eligibleCustomers = signal<any[]>([]);
  availableProducts = signal<any[]>([]);
  loadingCustomers  = signal(false);
  loadingProducts   = signal(false);

  selectedCustomerId = '';
  selectedProductId  = '';

  selectedProduct = computed(() => {
    if (!this.selectedProductId) return null;
    return this.availableProducts().find((p: any) => String(p.id) === this.selectedProductId) ?? null;
  });

  // ── Pagination ──────────────────────────────────────────────
  currentPage = signal(1);
  pageSize    = signal(10);
  readonly pageSizeOptions = [5, 10, 20, 50];
  headers = ['ID', 'Cliente', 'Monto', 'Total', 'Quincenal', 'Tipo', 'Estado', 'Acciones'];

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

  // ── Stats ───────────────────────────────────────────────────
  totalCount      = computed(() => this.vales().length);
  createdCount    = computed(() => this.vales().filter(v => v.status === 'created').length);
  authorizedCount = computed(() => this.vales().filter(v => v.status === 'authorized').length);
  canceledCount   = computed(() => this.vales().filter(v => v.status === 'canceled').length);

  customerName(v: any): string {
    const pd = v.final_customer?.person_data;
    if (!pd) return '—';
    return [pd.name, pd.first_last_name, pd.second_last_name].filter(Boolean).join(' ');
  }

  customerNameFromObj(c: any): string {
    const pd = c.person_data;
    if (!pd) return `Cliente #${c.id}`;
    return [pd.name, pd.first_last_name, pd.second_last_name].filter(Boolean).join(' ');
  }

  statusLabel(s: string): string {
    const map: Record<string, string> = {
      created:    'Creado',
      authorized: 'Autorizado',
      cashed:     'Activo',
      on_hold:    'En espera',
      paidoff:    'Pagado',
      canceled:   'Cancelado',
      overdue:    'Vencido',
    };
    return map[s] ?? s;
  }

  statusClass(s: string): string {
    const map: Record<string, string> = {
      created:    'bg-[#FF8800]/10 text-[#FF8800] border-[#FF8800]/20',
      authorized: 'bg-[#003399]/10 text-[#003399] border-[#003399]/20',
      cashed:     'bg-[#00A86B]/10 text-[#00A86B] border-[#00A86B]/20',
      on_hold:    'bg-[#FF8800]/10 text-[#FF8800] border-[#FF8800]/20',
      paidoff:    'bg-[#00A86B]/10 text-[#00A86B] border-[#00A86B]/20',
      canceled:   'bg-[#E53935]/10 text-[#E53935] border-[#E53935]/20',
      overdue:    'bg-[#E53935]/10 text-[#E53935] border-[#E53935]/20',
    };
    return map[s] ?? 'bg-[#6B7280]/10 text-[#6B7280] border-[#6B7280]/20';
  }

  // ── Helpers ─────────────────────────────────────────────────
  canViewDetail(v: any): boolean {
    return v.status === 'cashed' || v.status === 'on_hold';
  }

  // ── Lifecycle ───────────────────────────────────────────────
  ngOnInit() {
    this.load();
  }

  private load() {
    this.loading.set(true);
    this.http.get<any>(this.API_LOAN).subscribe({
      next: res => {
        const data = res.data?.data ?? res.data ?? [];
        this.vales.set(data);
        this.filtered.set(data);
        this.currentPage.set(1);
        this.loading.set(false);
      },
      error: err => {
        console.error('Status:', err.status);
        console.error('Error body:', err.error);
        this.loading.set(false);
      },
    });
  }

  search(e: Event) {
    const q = (e.target as HTMLInputElement).value.toLowerCase();
    this.filtered.set(this.vales().filter(v =>
      this.customerName(v).toLowerCase().includes(q) ||
      String(v.id).includes(q)
    ));
    this.currentPage.set(1);
  }

  goToPage(p: number) { this.currentPage.set(Math.max(1, Math.min(p, this.totalPages()))); }

  changePageSize(e: Event) {
    this.pageSize.set(Number((e.target as HTMLSelectElement).value));
    this.currentPage.set(1);
  }

  // ── Modal crear ─────────────────────────────────────────────
  openCreate() {
    this.selectedCustomerId = '';
    this.selectedProductId  = '';
    this.errorMsg.set('');
    this.showModal.set(true);
    this.loadCustomers();
    this.loadProducts();
  }

  closeModal() { this.showModal.set(false); }

  private loadCustomers() {
    this.loadingCustomers.set(true);
    this.http.get<any>(`${this.API_LOAN}/customer`).subscribe({
      next: res => {
        this.eligibleCustomers.set(res.data ?? []);
        this.loadingCustomers.set(false);
      },
      error: err => {
        console.error('Status:', err.status);
        console.error('Error body:', err.error);
        this.eligibleCustomers.set([]);
        this.loadingCustomers.set(false);
      },
    });
  }

  private loadProducts() {
    this.loadingProducts.set(true);
    this.http.get<any>(`${this.API_LOAN}/filter`).subscribe({
      next: res => {
        this.availableProducts.set(res.data ?? []);
        this.loadingProducts.set(false);
      },
      error: err => {
        console.error('Status:', err.status);
        console.error('Error body:', err.error);
        this.availableProducts.set([]);
        this.loadingProducts.set(false);
        if (err?.error?.message) {
          this.errorMsg.set(err.error.message);
        }
      },
    });
  }

  submitVale() {
    if (!this.selectedCustomerId) {
      this.errorMsg.set('Selecciona un cliente.');
      return;
    }
    if (!this.selectedProductId) {
      this.errorMsg.set('Selecciona un producto.');
      return;
    }

    this.saving.set(true);
    this.errorMsg.set('');

    this.http.post<any>(this.API_LOAN, {
      final_customer_id: Number(this.selectedCustomerId),
      product_id:        Number(this.selectedProductId),
    }).subscribe({
      next: () => {
        this.saving.set(false);
        this.closeModal();
        this.load();
      },
      error: err => {
        console.error('Status:', err.status);
        console.error('Error body:', err.error);
        this.saving.set(false);
        this.errorMsg.set(err?.error?.message ?? 'Error al crear el vale.');
      },
    });
  }

  // ── Cancelar vale ───────────────────────────────────────────
  cancelVale(v: any) {
    if (v.status !== 'created' && v.status !== 'authorized') {
      alert('No se pueden cancelar vales ya activos o en progreso de pago.');
      return;
    }

    if (!confirm(`¿Cancelar el vale #${v.id} de ${this.customerName(v)}?`)) return;

    this.http.get<any>(`${this.API_LOAN}/${v.id}`).subscribe({
      next: res => {
        alert(res?.message ?? 'Vale cancelado correctamente.');
        this.load();
      },
      error: err => {
        console.error('Status:', err.status);
        console.error('Error body:', err.error);
        alert(err?.error?.message ?? 'No se pudo cancelar el vale.');
      },
    });
  }

  // ── Ver detalle de vale ─────────────────────────────────────
  goToDetail(v: any) {
    // 👇 Solo permite navegar si el vale está cashed u on_hold
    if (!this.canViewDetail(v)) {
      alert('Solo puedes ver los pagos cuando el vale esté activo (cashed) o en espera (on_hold).');
      return;
    }
    this.router.navigate(['/distribuidora/vales', v.id]);
  }
}