import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { DistribuidoraPaymentsService } from '../../../core/services/distribuidora-payments.service';
import { MyPaymentsSummary, Reconciliation } from '../../../core/models';

@Component({
  selector: 'app-mis-pagos',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="px-4 sm:px-0">
      <div class="mb-6">
        <h1 class="font-[Montserrat] text-[22px] font-extrabold text-[#1A1A2E]">Mis Pagos</h1>
        <p class="text-[13px] text-[#6B7280] mt-0.5">Resumen de tu cuenta e historial de conciliaciones</p>
        @if (summary()) {
          <div class="mt-3 flex items-center gap-3 flex-wrap">
            <span class="text-[12px] font-bold bg-[#003399]/10 text-[#003399] px-3 py-1 rounded-full">
              Ref: {{ summary()!.referencia }}
            </span>
            <span class="text-[12px] text-[#6B7280]">
              Vence: {{ fmtDate(summary()!.next_payment_date) }}
            </span>
          </div>
        }
      </div>

      @if (loading()) {
        <div class="flex items-center justify-center py-24">
          <svg class="w-7 h-7 animate-spin text-[#003399]" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
        </div>
      } @else if (error()) {
        <div class="bg-[#E53935]/10 border border-[#E53935]/20 rounded-[10px] px-5 py-4 text-[13px] text-[#E53935] font-semibold">
          {{ error() }}
        </div>
      } @else {
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          @for (item of summaryItems(); track item.label) {
            <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] p-4">
              <p class="text-[10px] font-bold uppercase tracking-[0.5px] text-[#6B7280] mb-1">{{ item.label }}</p>
              <p class="text-[16px] sm:text-[22px] font-extrabold text-[#1A1A2E] font-[Montserrat]" [class]="item.colorClass">{{ item.value }}</p>
            </div>
          }
        </div>

        <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] overflow-hidden">
          <div class="px-6 py-4 border-b border-[#F0F0F0]">
            <h2 class="font-[Montserrat] text-[15px] font-extrabold text-[#1A1A2E]">Historial de conciliaciones</h2>
          </div>

          @if (history().length === 0) {
            <div class="py-16 text-center text-[#6B7280] text-[13px]">Sin conciliaciones registradas.</div>
          } @else {
            <div class="sm:hidden divide-y divide-[#F0F0F0]">
              @for (row of history(); track row.id) {
                <div class="p-4 flex justify-between items-center">
                  <div>
                    <p class="text-[13px] font-bold text-[#1A1A2E]">{{ fmtDate(row.payment_date) }}</p>
                    <p class="text-[11px] text-[#6B7280]">{{ fmtDate(row.period_start) }} - {{ fmtDate(row.period_end) }}</p>
                  </div>
                  <div class="text-right">
                    <p class="text-[13px] font-bold text-[#003399]">{{ fmt(row.amount_paid) }}</p>
                    <span [class]="statusClass(row.status)" class="text-[10px] font-semibold px-2 py-0.5 rounded-full border">{{ statusLabel(row.status) }}</span>
                  </div>
                </div>
              }
            </div>

            <div class="hidden sm:block overflow-x-auto">
              <table class="w-full text-[13px]">
                <thead class="bg-[#F8FAFD]">
                  <tr class="border-b border-[#F0F0F0]">
                    <th class="px-6 py-3 text-left font-bold text-[#6B7280]">Período</th>
                    <th class="px-6 py-3 text-left font-bold text-[#6B7280]">Fecha pago</th>
                    <th class="px-6 py-3 text-right font-bold text-[#6B7280]">Pagado</th>
                    <th class="px-6 py-3 text-center font-bold text-[#6B7280]">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  @for (row of history(); track row.id) {
                    <tr class="border-b border-[#F8F8F8]">
                      <td class="px-6 py-3">{{ fmtDate(row.period_start) }} — {{ fmtDate(row.period_end) }}</td>
                      <td class="px-6 py-3">{{ fmtDate(row.payment_date) }}</td>
                      <td class="px-6 py-3 text-right font-semibold text-[#003399]">{{ fmt(row.amount_paid) }}</td>
                      <td class="px-6 py-3 text-center"><span [class]="statusClass(row.status)" class="text-[11px] px-2 py-0.5 rounded-full border">{{ statusLabel(row.status) }}</span></td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            @if (totalPages() > 1) {
              <div class="flex items-center justify-between px-6 py-4 border-t border-[#F0F0F0]">
                <p class="text-[12px] text-[#6B7280]">Pág. {{ currentPage() }} de {{ totalPages() }}</p>
                <div class="flex items-center gap-1">
                  <button (click)="goToPage(currentPage() - 1)" [disabled]="currentPage() === 1" class="p-2 border rounded-lg disabled:opacity-40">Anterior</button>
                  <button (click)="goToPage(currentPage() + 1)" [disabled]="currentPage() === totalPages()" class="p-2 border rounded-lg disabled:opacity-40">Siguiente</button>
                </div>
              </div>
            }
          }
        </div>
      }
    </div>
  `,
})
export class MisPagosComponent implements OnInit {
  private svc = inject(DistribuidoraPaymentsService);

  loading = signal(true);
  error = signal('');
  summary = signal<MyPaymentsSummary | null>(null);
  history = signal<Reconciliation[]>([]);
  currentPage = signal(1);
  totalPages = signal(1);
  total = signal(0);

  ngOnInit() { this.loadPage(1); }

  loadPage(page: number) {
    this.loading.set(true);
    this.svc.getMyPayments(page).subscribe({
      next: res => {
        this.summary.set(res.summary);
        this.history.set(res.history.data);
        this.currentPage.set(res.history.current_page);
        this.totalPages.set(res.history.last_page);
        this.total.set(res.history.total);
        this.loading.set(false);
      },
      error: () => { this.error.set('No se pudo cargar la información.'); this.loading.set(false); }
    });
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) this.loadPage(page);
  }

  summaryItems() {
  const s = this.summary();
  if (!s) return [];
  return [
    { 
      label: 'Pago esperado', 
      value: this.fmt(s.pago_esperado), 
      colorClass: 'text-[#1A1A2E]' 
    },
    { 
      label: 'Ya pagado', 
      value: this.fmt(s.pago_total), 
      colorClass: 'text-[#00A86B]' 
    },
    { 
      label: 'Pendiente', 
      value: s.pendiente > 0 ? this.fmt(s.pendiente) : '$0.00', 
      colorClass: s.pendiente > 0 ? 'text-[#E53935]' : 'text-[#00A86B]' 
    },
    { 
      label: 'Deuda anterior', 
      value: s.current_debt > 0 ? this.fmt(s.current_debt) : '$0.00', 
      colorClass: s.current_debt > 0 ? 'text-[#E53935]' : 'text-[#00A86B]' 
    },
  ];
}

  fmt = (v: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(v ?? 0);
  fmtDate = (d: string) => d ? new Date(d + 'T12:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }) : '—';
  statusLabel = (s: string) => ({ early: 'Anticipado', on_time: 'A tiempo', late: 'Tardío' }[s] ?? s);
  statusClass = (s: string) => ({ early: 'bg-[#0288D1]/10 text-[#0288D1] border-[#0288D1]/20', on_time: 'bg-[#00A86B]/10 text-[#00A86B] border-[#00A86B]/20', late: 'bg-[#E53935]/10 text-[#E53935] border-[#E53935]/20' }[s] ?? 'bg-[#F8FAFD] text-[#6B7280] border-[#E0E0E0]');
}