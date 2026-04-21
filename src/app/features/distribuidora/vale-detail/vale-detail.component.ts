import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-vale-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, DecimalPipe, DatePipe],
  template: `
    <div>
      <!-- Header -->
      <div class="flex items-start justify-between mb-6 gap-4">
        <div class="flex items-center gap-3">
          <button (click)="goBack()"
            class="text-[#6B7280] hover:text-[#003399] transition-colors bg-transparent border-0 cursor-pointer p-0">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <div>
            <h1 class="font-[Montserrat] text-[22px] font-extrabold text-[#1A1A2E]">Vale #{{ loanId }}</h1>
            <p class="text-[13px] text-[#6B7280] mt-0.5">Registro de pagos</p>
          </div>
        </div>
        <button (click)="openPayment()" [disabled]="isValeFullyPaid()"
          class="inline-flex items-center gap-1.5 px-[18px] py-[9px] rounded-lg text-[13px] font-semibold bg-[#003399] text-white hover:bg-[#002277] transition-colors border-0 cursor-pointer flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg class="w-[15px] h-[15px]" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
          </svg>
          Registrar pago
        </button>
      </div>

      <!-- Info del vale -->
      @if (loanInfo()) {
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div class="bg-white rounded-[10px] p-5 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
            <div class="text-[12px] text-[#6B7280] mb-1">Producto</div>
            <div class="font-[Montserrat] text-[16px] font-extrabold text-[#1A1A2E]">
              \${{ loanInfo()!.loan?.product?.quantity | number }}
            </div>
          </div>
          <div class="bg-white rounded-[10px] p-5 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
            <div class="text-[12px] text-[#6B7280] mb-1">Total del vale</div>
            <div class="font-[Montserrat] text-[16px] font-extrabold text-[#003399]">
              \${{ loanInfo()!.loan?.total_value | number:'1.2-2' }}
            </div>
          </div>
          <div class="bg-white rounded-[10px] p-5 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
            <div class="text-[12px] text-[#6B7280] mb-1">Pago quincenal</div>
            <div class="font-[Montserrat] text-[16px] font-extrabold text-[#FF8800]">
              \${{ loanInfo()!.loan?.debt_biweekly | number:'1.2-2' }}
            </div>
          </div>
          <div class="bg-white rounded-[10px] p-5 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
            <div class="text-[12px] text-[#6B7280] mb-1">Pagos realizados</div>
            <div class="font-[Montserrat] text-[16px] font-extrabold text-[#00A86B]">
              {{ paidPayments() }} / {{ loanInfo()!.loan?.product?.fortnights ?? '—' }}
            </div>
          </div>
        </div>
      }

      <!-- Table -->
      <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
        <div class="px-5 py-4 border-b border-[#E0E0E0]">
          <span class="font-[Montserrat] font-bold text-[14px] text-[#1A1A2E]">Historial de pagos</span>
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
                @for (d of paginated(); track d.id; let i = $index) {
                  <tr class="border-b border-[#F0F0F0] hover:bg-[#F8FAFD] transition-colors">
                    <td class="px-5 py-3 font-semibold text-[#1A1A2E]">{{ (currentPage() - 1) * pageSize() + i + 1 }}</td>
                    <td class="px-5 py-3 text-[#6B7280]">{{ d.date | date:'dd/MM/yyyy' }}</td>
                    <td class="px-5 py-3 font-semibold text-[#00A86B]">\${{ d.installment | number:'1.2-2' }}</td>
                    <td class="px-5 py-3 text-[#E53935]">\${{ d.debt | number:'1.2-2' }}</td>
                    <td class="px-5 py-3 text-[#FF8800]">\${{ d.penalty | number:'1.2-2' }}</td>
                    <td class="px-5 py-3 text-[#003399]">\${{ d.over_payment | number:'1.2-2' }}</td>
                    <td class="px-5 py-3">
                      <span [class]="detailStatusClass(d.status)"
                        class="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border">
                        {{ detailStatusLabel(d.status) }}
                      </span>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="7" class="px-5 py-12 text-center text-[#6B7280] text-[13px]">No hay pagos registrados aún.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          @if (totalPages() > 1) {
            <div class="px-5 py-3 border-t border-[#E0E0E0] flex items-center justify-between gap-3 flex-wrap">
              <span class="text-[12px] text-[#6B7280]">
                Mostrando {{ rangeStart() }}–{{ rangeEnd() }} de {{ details().length }}
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

    <!-- ═══════════════ MODAL REGISTRAR PAGO ═══════════════ -->
    @if (showModal()) {
      <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        (click)="closeModal()">
        <div class="bg-white rounded-[10px] w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto"
          (click)="$event.stopPropagation()">

          <div class="px-5 py-4 border-b border-[#E0E0E0] flex items-center justify-between sticky top-0 bg-white z-10">
            <span class="font-[Montserrat] font-bold text-[15px]">Registrar pago</span>
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

            @if (successMsg()) {
              <div class="bg-[#00A86B]/10 text-[#00A86B] text-[13px] px-3 py-2 rounded-lg border border-[#00A86B]/20">{{ successMsg() }}</div>
            }

            <!-- Info de referencia -->
            @if (loanInfo()) {
              <div class="bg-[#F8FAFD] rounded-lg p-4 border border-[#E0E0E0]">
                <div class="flex justify-between text-[13px] mb-2">
                  <span class="text-[#6B7280]">Pago quincenal</span>
                  <span class="font-semibold text-[#1A1A2E]">\${{ loanInfo()!.loan?.debt_biweekly | number:'1.2-2' }}</span>
                </div>
                @if (lastDetail()) {
                  <div class="flex justify-between text-[13px] mb-2">
                    <span class="text-[#6B7280]">Adeudo anterior</span>
                    <span class="font-semibold text-[#E53935]">\${{ lastDetail()!.debt | number:'1.2-2' }}</span>
                  </div>
                  @if (lastDetail()!.over_payment > 0) {
                    <div class="flex justify-between text-[13px]">
                      <span class="text-[#6B7280]">Saldo a favor</span>
                      <span class="font-semibold text-[#00A86B]">\${{ lastDetail()!.over_payment | number:'1.2-2' }}</span>
                    </div>
                  }
                }
              </div>
            }

            <!-- Monto del pago -->
            <div class="flex flex-col gap-1">
              <label class="text-[12px] font-semibold text-[#1A1A2E]" for="p-amount">Monto del pago *</label>
              <input id="p-amount" [(ngModel)]="paymentAmount" type="number" min="0" step="0.01"
                placeholder="0.00"
                class="border border-[#E0E0E0] rounded-lg px-3 py-3 text-[18px] font-mono font-bold text-center outline-none focus:border-[#003399] transition-colors"
              />
            </div>

            <div class="flex justify-end gap-2 pt-1">
              <button type="button" (click)="closeModal()"
                class="px-4 py-2 rounded-lg text-[13px] font-semibold bg-white text-[#003399] border border-[#E0E0E0] hover:border-[#003399] transition-colors cursor-pointer"
              >Cancelar</button>
              <button type="button" (click)="submitPayment()" [disabled]="saving()"
                class="px-4 py-2 rounded-lg text-[13px] font-semibold bg-[#003399] text-white hover:bg-[#002277] transition-colors border-0 cursor-pointer disabled:opacity-60"
              >
                @if (saving()) { Registrando… } @else { Registrar pago }
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class ValeDetailComponent implements OnInit {
  private http  = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private readonly API = `${environment.apiUrl}/distribuidora/loan`;

  loanId = 0;

  details    = signal<any[]>([]);
  loanInfo   = signal<any>(null);
  loading    = signal(true);
  showModal  = signal(false);
  saving     = signal(false);
  errorMsg   = signal('');
  successMsg = signal('');

  paymentAmount: number | null = null;

  headers = ['#', 'Fecha', 'Abono', 'Adeudo', 'Penalización', 'Saldo a favor', 'Estado'];

  lastDetail = computed(() => {
    const d = this.details();
    return d.length > 0 ? d[d.length - 1] : null;
  });

  paidPayments = computed(() => {
    return this.details().filter(d => d.status === 'paid').length;
  });

  isValeFullyPaid = computed(() => {
    const loan = this.loanInfo()?.loan;
    if (!loan) return false;
    const total = loan.product?.fortnights ?? 0;
    return this.paidPayments() >= total && total > 0;
  });

  // ── Pagination ──────────────────────────────────────────────
  currentPage = signal(1);
  pageSize    = signal(10);
  readonly pageSizeOptions = [5, 10, 20, 50];

  totalPages = computed(() => Math.max(1, Math.ceil(this.details().length / this.pageSize())));
  paginated  = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.details().slice(start, start + this.pageSize());
  });
  rangeStart = computed(() =>
    this.details().length === 0 ? 0 : (this.currentPage() - 1) * this.pageSize() + 1
  );
  rangeEnd = computed(() =>
    Math.min(this.currentPage() * this.pageSize(), this.details().length)
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

  detailStatusLabel(s: string): string {
    const map: Record<string, string> = {
      paid: 'Pagado', pending: 'Pendiente', overdue: 'Atrasado',
    };
    return map[s] ?? s;
  }

  detailStatusClass(s: string): string {
    const map: Record<string, string> = {
      paid:    'bg-[#00A86B]/10 text-[#00A86B] border-[#00A86B]/20',
      pending: 'bg-[#FF8800]/10 text-[#FF8800] border-[#FF8800]/20',
      overdue: 'bg-[#E53935]/10 text-[#E53935] border-[#E53935]/20',
    };
    return map[s] ?? 'bg-[#6B7280]/10 text-[#6B7280] border-[#6B7280]/20';
  }

  ngOnInit() {
    this.loanId = Number(this.route.snapshot.paramMap.get('id'));
    this.load();
  }

  private load() {
    this.loading.set(true);
    this.http.get<any>(`${this.API}/detail/${this.loanId}`).subscribe({
      next: res => {
        const data = res.data ?? [];
        this.details.set(data);
        this.currentPage.set(1);
        // Guardar info del loan desde el primer detalle
        if (data.length > 0) {
          this.loanInfo.set(data[0]);
        }
        this.loading.set(false);
      },
      error: err => {
        console.error('=== LOAD DETAILS ERROR ===', err);
        this.loading.set(false);
      },
    });
  }

  goBack() {
    this.router.navigate(['/distribuidora/loan']);
  }

  goToPage(p: number) { this.currentPage.set(Math.max(1, Math.min(p, this.totalPages()))); }

  changePageSize(e: Event) {
    this.pageSize.set(Number((e.target as HTMLSelectElement).value));
    this.currentPage.set(1);
  }

  openPayment() {
    this.paymentAmount = null;
    this.errorMsg.set('');
    this.successMsg.set('');
    this.showModal.set(true);
  }

  closeModal() { this.showModal.set(false); }

  submitPayment() {
    if (!this.paymentAmount || this.paymentAmount <= 0) {
      this.errorMsg.set('Ingresa un monto válido.');
      return;
    }

    this.saving.set(true);
    this.errorMsg.set('');
    this.successMsg.set('');

    this.http.post<any>(`${this.API}/detail/${this.loanId}`, {
      installment: this.paymentAmount,
    }).subscribe({
      next: res => {
        this.saving.set(false);
        this.successMsg.set(res?.message ?? 'Pago registrado exitosamente.');
        this.load();
        setTimeout(() => this.closeModal(), 1500);
      },
      error: err => {
        console.error('=== SUBMIT PAYMENT ERROR ===', err);
        this.saving.set(false);
        this.errorMsg.set(err?.error?.message ?? 'Error al registrar el pago.');
      },
    });
  }
}
