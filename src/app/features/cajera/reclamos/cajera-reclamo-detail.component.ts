import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CashierReclamoService, ManualReconciliationResponse } from '../../../core/services/cashier-reclamo.service';
import { Reclamo, Reconciliation } from '../../../core/models';

@Component({
  selector: 'app-cajera-reclamo-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FormsModule],
  template: `
    <div>
      <a routerLink="/cajera/reclamos" class="inline-flex items-center gap-1.5 text-[13px] text-[#6B7280] hover:text-[#003399] transition-colors mb-5 no-underline">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
        </svg>
        Volver a reclamos
      </a>

      @if (!claim()) {
        <div class="flex flex-col items-center justify-center py-24 gap-3 text-center">
          <p class="text-[#6B7280] text-[14px]">No se encontró el reclamo.</p>
          <a routerLink="/cajera/reclamos" class="text-[#003399] text-[13px] font-semibold hover:underline no-underline">Volver a la lista</a>
        </div>
      } @else {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <!-- Detalle -->
          <div class="lg:col-span-2">
            <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] p-6">
              <div class="flex items-start justify-between gap-4 mb-5">
                <div>
                  <h1 class="font-[Montserrat] text-[20px] font-extrabold text-[#1A1A2E]">Reclamo #{{ claim()!.id }}</h1>
                  <p class="text-[13px] text-[#6B7280] mt-0.5">{{ formatDate(claim()!.created_at) }}</p>
                </div>
                <span [class]="typeClass(claim()!.type)" class="text-[11px] font-semibold px-3 py-1 rounded-full border flex-shrink-0">
                  {{ typeLabel(claim()!.type) }}
                </span>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-[11px] font-bold uppercase tracking-[0.5px] text-[#6B7280] mb-1">Distribuidora</p>
                  <p class="text-[14px] font-semibold text-[#1A1A2E]">{{ distributorName(claim()!) }}</p>
                </div>
                <div>
                  <p class="text-[11px] font-bold uppercase tracking-[0.5px] text-[#6B7280] mb-1">Referencia</p>
                  <p class="text-[14px] font-mono text-[#1A1A2E]">{{ claim()!.reference_number || '—' }}</p>
                </div>
                <div>
                  <p class="text-[11px] font-bold uppercase tracking-[0.5px] text-[#6B7280] mb-1">Estado</p>
                  <span [class]="statusClass(claim()!.status)" class="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border">
                    {{ statusLabel(claim()!.status) }}
                  </span>
                </div>
                @if (claim()!.amount_approved) {
                  <div>
                    <p class="text-[11px] font-bold uppercase tracking-[0.5px] text-[#6B7280] mb-1">Monto aprobado</p>
                    <p class="text-[14px] font-semibold text-[#1A1A2E]">{{ formatCurrency(claim()!.amount_approved!) }}</p>
                  </div>
                }
              </div>

              @if (claim()!.decision_notes) {
                <div class="mt-4 pt-4 border-t border-[#F0F0F0]">
                  <p class="text-[11px] font-bold uppercase tracking-[0.5px] text-[#6B7280] mb-1">Notas del gerente</p>
                  <p class="text-[13px] text-[#1A1A2E]">{{ claim()!.decision_notes }}</p>
                </div>
              }

              @if (claim()!.comments) {
                <div class="mt-4 pt-4 border-t border-[#F0F0F0]">
                  <p class="text-[11px] font-bold uppercase tracking-[0.5px] text-[#6B7280] mb-1">Comentarios</p>
                  <p class="text-[13px] text-[#1A1A2E]">{{ claim()!.comments }}</p>
                </div>
              }

              @if (claim()!.attachments && claim()!.attachments!.length > 0) {
                <div class="mt-4 pt-4 border-t border-[#F0F0F0]">
                  <p class="text-[11px] font-bold uppercase tracking-[0.5px] text-[#6B7280] mb-2">Archivos adjuntos</p>
                  <div class="flex flex-col gap-2">
                    @for (file of claim()!.attachments!; track file) {
                      <a
                        [href]="file"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="inline-flex items-center gap-2 text-[13px] text-[#003399] hover:underline no-underline"
                      >
                        <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
                        </svg>
                        {{ fileName(file) }}
                      </a>
                    }
                  </div>
                </div>
              }

            </div>
          </div>

          <!-- Sidebar -->
          <div class="lg:col-span-1 space-y-5">

            @if (claim()!.status === 'approved') {
              <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] p-6">
                <h2 class="font-[Montserrat] text-[15px] font-extrabold text-[#1A1A2E] mb-1">Conciliación manual</h2>
                <p class="text-[12px] text-[#6B7280] mb-5">Registra el pago recibido de la distribuidora</p>

                @if (successMsg()) {
                  <div class="mb-4 bg-[#00A86B]/10 border border-[#00A86B]/30 rounded-lg px-4 py-3 text-[13px] text-[#00A86B] font-semibold flex items-center gap-2">
                    <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                    </svg>
                    {{ successMsg() }}
                  </div>
                }

                @if (errorMsg()) {
                  <div class="mb-4 bg-[#E53935]/10 border border-[#E53935]/30 rounded-lg px-4 py-3 text-[13px] text-[#E53935] font-semibold flex items-center gap-2">
                    <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                    {{ errorMsg() }}
                  </div>
                }

                <div class="space-y-4">
                  <div>
                    <label class="block text-[12px] font-semibold text-[#1A1A2E] mb-1.5">
                      Fecha de pago <span class="text-[#E53935]">*</span>
                    </label>
                    <input
                      type="date"
                      [(ngModel)]="paymentDateInput"
                      [max]="todayISO"
                      class="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] text-[#1A1A2E] focus:outline-none focus:border-[#003399] focus:ring-1 focus:ring-[#003399]/20 transition-colors"
                    />
                  </div>

                  <div>
                    <label class="block text-[12px] font-semibold text-[#1A1A2E] mb-1.5">
                      Monto pagado <span class="text-[#E53935]">*</span>
                    </label>
                    <div class="relative">
                      <span class="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-[#6B7280] font-semibold">$</span>
                      <input
                        type="number"
                        [(ngModel)]="amountPaidInput"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        class="w-full border border-[#E0E0E0] rounded-lg pl-7 pr-3 py-2 text-[13px] text-[#1A1A2E] focus:outline-none focus:border-[#003399] focus:ring-1 focus:ring-[#003399]/20 transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    (click)="submitReconciliation()"
                    [disabled]="submitting() || !paymentDateInput || !amountPaidInput"
                    class="w-full bg-[#003399] text-white rounded-lg py-2.5 text-[13px] font-bold flex items-center justify-center gap-2 hover:bg-[#002580] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border-0"
                  >
                    @if (submitting()) {
                      <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                      </svg>
                      Procesando...
                    } @else {
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      Registrar conciliación
                    }
                  </button>
                </div>
              </div>
            } @else {
              <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] p-6 flex flex-col items-center justify-center text-center gap-3 min-h-[180px]">
                <svg class="w-10 h-10 text-[#6B7280]/40" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p class="text-[13px] text-[#6B7280]">Este reclamo ya fue conciliado.</p>
              </div>
            }

            @if (result()) {
              <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] p-6">
                <h3 class="font-[Montserrat] text-[14px] font-extrabold text-[#1A1A2E] mb-4">Resultado</h3>
                <div class="space-y-3">
                  <div class="flex justify-between text-[13px]">
                    <span class="text-[#6B7280]">Total quincena</span>
                    <span class="font-semibold text-[#1A1A2E]">{{ formatCurrency(result()!.total_biweekly) }}</span>
                  </div>
                  @if (result()!.previous_debt > 0) {
                    <div class="flex justify-between text-[13px]">
                      <span class="text-[#6B7280]">Deuda anterior</span>
                      <span class="font-semibold text-[#E53935]">{{ formatCurrency(result()!.previous_debt) }}</span>
                    </div>
                  }
                  @if (result()!.previous_over_payment > 0) {
                    <div class="flex justify-between text-[13px]">
                      <span class="text-[#6B7280]">Saldo favor anterior</span>
                      <span class="font-semibold text-[#00A86B]">- {{ formatCurrency(result()!.previous_over_payment) }}</span>
                    </div>
                  }
                  @if (result()!.penalty > 0) {
                    <div class="flex justify-between text-[13px]">
                      <span class="text-[#6B7280]">Penalización</span>
                      <span class="font-semibold text-[#FF8800]">{{ formatCurrency(result()!.penalty) }}</span>
                    </div>
                  }
                  <div class="flex justify-between text-[13px] border-t border-[#F0F0F0] pt-3">
                    <span class="text-[#6B7280]">Total esperado</span>
                    <span class="font-bold text-[#1A1A2E]">{{ formatCurrency(result()!.total_expected) }}</span>
                  </div>
                  <div class="flex justify-between text-[13px]">
                    <span class="text-[#6B7280]">Monto pagado</span>
                    <span class="font-bold text-[#003399]">{{ formatCurrency(result()!.amount_paid) }}</span>
                  </div>
                  <div class="flex justify-between text-[13px] border-t border-[#F0F0F0] pt-3">
                    <span class="text-[#6B7280]">Diferencia</span>
                    <span [class]="result()!.difference >= 0 ? 'text-[#00A86B]' : 'text-[#E53935]'" class="font-bold">
                      {{ formatCurrency(result()!.difference) }}
                    </span>
                  </div>
                  @if (result()!.debt > 0) {
                    <div class="bg-[#E53935]/10 border border-[#E53935]/20 rounded-lg px-3 py-2.5 flex justify-between text-[13px]">
                      <span class="font-semibold text-[#E53935]">Deuda pendiente</span>
                      <span class="font-bold text-[#E53935]">{{ formatCurrency(result()!.debt) }}</span>
                    </div>
                  }
                  @if (result()!.over_payment > 0) {
                    <div class="bg-[#00A86B]/10 border border-[#00A86B]/20 rounded-lg px-3 py-2.5 flex justify-between text-[13px]">
                      <span class="font-semibold text-[#00A86B]">Saldo a favor</span>
                      <span class="font-bold text-[#00A86B]">{{ formatCurrency(result()!.over_payment) }}</span>
                    </div>
                  }
                  <div class="flex justify-between text-[13px] pt-1">
                    <span class="text-[#6B7280]">Pago</span>
                    <span [class]="paymentStatusClass(result()!.status)" class="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border">
                      {{ paymentStatusLabel(result()!.status) }}
                    </span>
                  </div>
                </div>
              </div>
            }

          </div>
        </div>
      }
    </div>
  `,
})
export class CajeraReclamoDetailComponent implements OnInit {
  private svc    = inject(CashierReclamoService);
  private router = inject(Router);

  claim      = signal<Reclamo | null>(null);
  submitting = signal(false);
  successMsg = signal('');
  errorMsg   = signal('');
  result     = signal<Reconciliation | null>(null);

  paymentDateInput  = '';
  amountPaidInput: number | null = null;
  todayISO = new Date().toISOString().split('T')[0];

  ngOnInit() {
        const reclamo = history.state?.reclamo as Reclamo | undefined;

        if (reclamo) {
            this.claim.set(reclamo);
        } else {
            this.router.navigate(['/cajera/reclamos']);
        }
    }

  submitReconciliation() {
    if (!this.paymentDateInput || !this.amountPaidInput || !this.claim()) return;

    const [y, m, d] = this.paymentDateInput.split('-');
    const paymentDate = `${d}/${m}/${y}`;

    this.submitting.set(true);
    this.successMsg.set('');
    this.errorMsg.set('');

    this.svc.manualReconciliation(this.claim()!.id, {
      payment_date: paymentDate,
      amount_paid:  this.amountPaidInput,
    }).subscribe({
      next: res => {
        this.submitting.set(false);
        this.successMsg.set('Conciliación registrada correctamente.');
        this.result.set(res.data);
        this.claim.set({ ...this.claim()!, status: 'closed' });
      },
      error: err => {
        this.submitting.set(false);
        this.errorMsg.set(err?.error?.message ?? 'Error al procesar la conciliación.');
      },
    });
  }

  distributorName = (item: Reclamo) => {
    const pd = (item.distributor as any)?.person_data;
    if (!pd) return '—';
    return [pd.name, pd.first_last_name, pd.second_last_name].filter(Boolean).join(' ');
  };

  typeLabel = (t: string) => ({ money_claim: 'Transferencia', credit_increase: 'Aumento de crédito', redeem_points: 'Canje de puntos' }[t] ?? t);
  typeClass = (t: string) => ({ money_claim: 'bg-[#0288D1]/10 text-[#0288D1] border-[#0288D1]/20', credit_increase: 'bg-[#7B1FA2]/10 text-[#7B1FA2] border-[#7B1FA2]/20', redeem_points: 'bg-[#00796B]/10 text-[#00796B] border-[#00796B]/20' }[t] ?? 'bg-[#F8FAFD] text-[#6B7280] border-[#E0E0E0]');
  statusLabel = (s: string) => ({ pending: 'Pendiente', approved: 'Aprobado', rejected: 'Rechazado', closed: 'Cerrado' }[s] ?? s);
  statusClass = (s: string) => ({ pending: 'bg-[#FF8800]/10 text-[#FF8800] border-[#FF8800]/20', approved: 'bg-[#00A86B]/10 text-[#00A86B] border-[#00A86B]/20', rejected: 'bg-[#E53935]/10 text-[#E53935] border-[#E53935]/20', closed: 'bg-[#6B7280]/10 text-[#6B7280] border-[#6B7280]/20' }[s] ?? 'bg-[#F8FAFD] text-[#6B7280] border-[#E0E0E0]');
  paymentStatusLabel = (s: string) => ({ early: 'Anticipado', on_time: 'A tiempo', late: 'Tardío' }[s] ?? s);
  paymentStatusClass = (s: string) => ({ early: 'bg-[#0288D1]/10 text-[#0288D1] border-[#0288D1]/20', on_time: 'bg-[#00A86B]/10 text-[#00A86B] border-[#00A86B]/20', late: 'bg-[#E53935]/10 text-[#E53935] border-[#E53935]/20' }[s] ?? 'bg-[#F8FAFD] text-[#6B7280] border-[#E0E0E0]');
  formatDate = (date?: string) => date ? new Date(date).toLocaleDateString('es-MX') : '—';
  formatCurrency = (v: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(v ?? 0);
   fileName = (url: string) => url.split('/').pop() ?? url;
}