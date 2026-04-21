import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Reclamo, ReclamoDecisionPayload } from '../../../core/models';
import { ManagerReclamoService } from '../../../core/services/manager-reclamo.service';

@Component({
  selector: 'app-reclamo-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ReactiveFormsModule],
  template: `
    <div class="max-w-5xl mx-auto">
      <div class="flex items-center gap-3 mb-6">
        <a routerLink="/gerente/reclamos" class="text-[#6B7280] hover:text-[#003399] transition-colors no-underline" aria-label="Volver">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
          </svg>
        </a>
        <div>
          <h1 class="font-[Montserrat] text-[22px] font-extrabold text-[#1A1A2E]">Detalle de reclamo</h1>
          <p class="text-[13px] text-[#6B7280]">Revision y decision del reclamo recibido</p>
        </div>
      </div>

      @if (loading()) {
        <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] p-8 text-center text-[#6B7280] text-[13px]">
          Cargando reclamo...
        </div>
      } @else if (item()) {
        <div class="grid grid-cols-1 xl:grid-cols-[1.6fr_1fr] gap-6">

          <!-- Columna izquierda: info del reclamo -->
          <div class="flex flex-col gap-6">

            <!-- Informacion general -->
            <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] p-6">
              <div class="flex items-start justify-between gap-4 mb-5">
                <div>
                  <p class="text-[12px] font-bold text-[#003399] uppercase tracking-wide mb-1">Informacion del reclamo</p>
                  <h2 class="font-[Montserrat] text-[20px] font-extrabold text-[#1A1A2E]">{{ distributorName(item()!) }}</h2>
                  <p class="text-[13px] text-[#6B7280] mt-0.5">Reclamo #{{ item()!.id }}</p>
                </div>
                <div class="flex flex-col items-end gap-2">
                  <span [class]="typeClass(item()!.type)" class="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border">
                    {{ typeLabel(item()!.type) }}
                  </span>
                  <span [class]="statusClass(item()!.status)" class="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border">
                    {{ statusLabel(item()!.status) }}
                  </span>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-[13px]">
                <div class="rounded-lg border border-[#E0E0E0] p-4">
                  <p class="text-[#6B7280] text-[11px] uppercase font-semibold mb-1">Fecha de envio</p>
                  <p class="text-[#1A1A2E] font-medium">{{ formatDate(item()!.created_at) }}</p>
                </div>
                <div class="rounded-lg border border-[#E0E0E0] p-4">
                  <p class="text-[#6B7280] text-[11px] uppercase font-semibold mb-1">Cajera asignada</p>
                  <p class="text-[#1A1A2E] font-medium">{{ item()!.cashier?.name || '—' }}</p>
                </div>
                @if (item()!.reference_number) {
                  <div class="rounded-lg border border-[#E0E0E0] p-4 md:col-span-2">
                    <p class="text-[#6B7280] text-[11px] uppercase font-semibold mb-1">Numero de referencia</p>
                    <p class="text-[#1A1A2E] font-medium font-mono">{{ item()!.reference_number }}</p>
                  </div>
                }
                <div class="rounded-lg border border-[#E0E0E0] p-4 md:col-span-2">
                  <p class="text-[#6B7280] text-[11px] uppercase font-semibold mb-1">Comentarios de la distribuidora</p>
                  <p class="text-[#1A1A2E]">{{ item()!.comments || '—' }}</p>
                </div>
              </div>
            </div>

            <!-- Comprobantes (solo money_claim) -->
            @if (item()!.type === 'money_claim') {
              <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] p-6">
                <p class="text-[12px] font-bold text-[#003399] uppercase tracking-wide mb-4">Comprobantes de transferencia</p>
                @if (item()!.attachments?.length) {
                  <div class="flex flex-col gap-2">
                    @for (url of item()!.attachments!; track url; let i = $index) {
                      <a
                        [href]="url"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="flex items-center gap-2 text-[#003399] text-[13px] font-semibold hover:underline no-underline"
                      >
                        <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
                        </svg>
                        Comprobante {{ i + 1 }}
                      </a>
                    }
                  </div>
                } @else {
                  <p class="text-[13px] text-[#6B7280]">No se adjuntaron comprobantes.</p>
                }
              </div>
            }

            <!-- Info de la distribuidora -->
            <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] p-6">
              <p class="text-[12px] font-bold text-[#003399] uppercase tracking-wide mb-4">Datos de la distribuidora</p>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-[13px]">
                <div class="rounded-lg border border-[#E0E0E0] p-4">
                  <p class="text-[#6B7280] text-[11px] uppercase font-semibold mb-1">Categoria</p>
                  <p class="text-[#1A1A2E] font-medium">{{ item()!.distributor?.category?.name || '—' }}</p>
                </div>
                <div class="rounded-lg border border-[#E0E0E0] p-4">
                  <p class="text-[#6B7280] text-[11px] uppercase font-semibold mb-1">Puntos acumulados</p>
                  <p class="text-[#1A1A2E] font-medium">{{ item()!.distributor?.points ?? 0 }}</p>
                </div>
                <div class="rounded-lg border border-[#E0E0E0] p-4">
                  <p class="text-[#6B7280] text-[11px] uppercase font-semibold mb-1">Credito actual</p>
                  <p class="text-[#1A1A2E] font-medium">{{ formatMoney(item()!.distributor?.current_credit) }}</p>
                </div>
                <div class="rounded-lg border border-[#E0E0E0] p-4">
                  <p class="text-[#6B7280] text-[11px] uppercase font-semibold mb-1">Credito disponible</p>
                  <p class="text-[#1A1A2E] font-medium">{{ formatMoney(item()!.distributor?.available_credit) }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Columna derecha: decision -->
          <div class="flex flex-col gap-6">
            @if (item()!.status === 'pending') {
              <!-- Formulario de decision -->
              <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] p-6">
                <p class="text-[12px] font-bold text-[#003399] uppercase tracking-wide mb-4">Tomar decision</p>

                @if (item()!.type === 'money_claim') {
                  <div class="bg-[#0288D1]/10 text-[#0288D1] text-[13px] px-3 py-2 rounded-lg border border-[#0288D1]/20 mb-4" role="note">
                    Al aprobar, confirmas que la transferencia es valida y la cajera podra proceder con la conciliacion manual.
                  </div>
                }

                @if (errorMsg()) {
                  <div class="bg-[#E53935]/10 text-[#E53935] text-[13px] px-3 py-2 rounded-lg border border-[#E53935]/20 mb-4" role="alert">
                    {{ errorMsg() }}
                  </div>
                }

                @if (successMsg()) {
                  <div class="bg-[#00A86B]/10 text-[#00A86B] text-[13px] px-3 py-2 rounded-lg border border-[#00A86B]/20 mb-4" role="status">
                    {{ successMsg() }}
                  </div>
                }

                <form [formGroup]="form" (ngSubmit)="submit()" class="flex flex-col gap-4">
                  <div class="flex flex-col gap-1">
                    <label class="text-[12px] font-semibold text-[#1A1A2E]" for="decision">Decision *</label>
                    <select
                      id="decision"
                      formControlName="decision"
                      class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] transition-colors bg-white"
                    >
                      <option value="">-- Seleccionar --</option>
                      <option value="approved">Aprobar</option>
                      <option value="rejected">Rechazar</option>
                    </select>
                  </div>

                  @if (item()!.type === 'credit_increase' && form.value.decision === 'approved') {
                    <div class="flex flex-col gap-1">
                      <label class="text-[12px] font-semibold text-[#1A1A2E]" for="amount">Monto a aprobar (MXN) *</label>
                      <input
                        id="amount"
                        type="number"
                        min="1"
                        step="0.01"
                        formControlName="amount_approved"
                        placeholder="0.00"
                        class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] transition-colors"
                        [class.border-red-400]="isInvalid('amount_approved')"
                      />
                      @if (isInvalid('amount_approved')) {
                        <span class="text-[11px] text-[#E53935]">El monto es obligatorio y debe ser mayor a cero.</span>
                      }
                    </div>
                  }

                  <div class="flex flex-col gap-1">
                    <label class="text-[12px] font-semibold text-[#1A1A2E]" for="notes">Notas (opcional)</label>
                    <textarea
                      id="notes"
                      formControlName="decision_notes"
                      rows="4"
                      placeholder="Observaciones o justificacion de la decision..."
                      class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] transition-colors resize-y"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    [disabled]="saving()"
                    class="w-full py-2.5 rounded-lg text-[13px] font-semibold bg-[#003399] text-white hover:bg-[#002277] transition-colors border-0 cursor-pointer disabled:opacity-60"
                  >
                    @if (saving()) { Guardando... } @else { Registrar decision }
                  </button>
                </form>
              </div>
            } @else {
              <!-- Decision ya tomada -->
              <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] p-6">
                <p class="text-[12px] font-bold text-[#003399] uppercase tracking-wide mb-4">Decision registrada</p>

                <div
                  [class]="item()!.status === 'approved'
                    ? 'bg-[#00A86B]/10 border-[#00A86B]/20 text-[#00A86B]'
                    : item()!.status === 'rejected'
                      ? 'bg-[#E53935]/10 border-[#E53935]/20 text-[#E53935]'
                      : 'bg-[#6B7280]/10 border-[#6B7280]/20 text-[#6B7280]'"
                  class="rounded-lg border px-4 py-3 text-[13px] font-semibold mb-4"
                >
                  {{ statusLabel(item()!.status) }}
                </div>

                <div class="flex flex-col gap-3 text-[13px]">
                  <div class="rounded-lg border border-[#E0E0E0] p-4">
                    <p class="text-[#6B7280] text-[11px] uppercase font-semibold mb-1">Fecha de decision</p>
                    <p class="text-[#1A1A2E] font-medium">{{ formatDate(item()!.decided_at) }}</p>
                  </div>

                  @if (item()!.decision_notes) {
                    <div class="rounded-lg border border-[#E0E0E0] p-4">
                      <p class="text-[#6B7280] text-[11px] uppercase font-semibold mb-1">Notas</p>
                      <p class="text-[#1A1A2E]">{{ item()!.decision_notes }}</p>
                    </div>
                  }

                  @if (item()!.amount_approved) {
                    <div class="rounded-lg border border-[#E0E0E0] p-4">
                      <p class="text-[#6B7280] text-[11px] uppercase font-semibold mb-1">Monto aprobado</p>
                      <p class="text-[#1A1A2E] font-semibold text-[15px]">{{ formatMoney(item()!.amount_approved) }}</p>
                    </div>
                  }

                  @if (item()!.type === 'money_claim' && item()!.status === 'approved') {
                    <div class="bg-[#0288D1]/10 text-[#0288D1] text-[13px] px-3 py-2 rounded-lg border border-[#0288D1]/20" role="note">
                      La cajera tiene habilitada la conciliacion manual para este reclamo.
                    </div>
                  }
                </div>
              </div>
            }
          </div>

        </div>
      } @else {
        <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] p-8 text-center text-[#6B7280] text-[13px]">
          Reclamo no encontrado.
        </div>
      }
    </div>
  `,
})
export class ReclamoDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private svc = inject(ManagerReclamoService);
  private fb = inject(FormBuilder);

  item = signal<Reclamo | null>(null);
  loading = signal(true);
  saving = signal(false);
  errorMsg = signal('');
  successMsg = signal('');

  form = this.fb.group({
    decision: ['', Validators.required],
    decision_notes: [''],
    amount_approved: [null as number | null],
  });

  ngOnInit() {
    this.load();
  }

  private load() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isFinite(id)) {
      this.loading.set(false);
      return;
    }

    this.svc.getOne(id).subscribe({
      next: reclamo => {
        this.item.set(reclamo);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid || !this.item()) return;

    const { decision, decision_notes, amount_approved } = this.form.getRawValue();

    if (this.item()!.type === 'credit_increase' && decision === 'approved' && !amount_approved) {
      this.errorMsg.set('Debes ingresar el monto aprobado para un aumento de credito.');
      return;
    }

    const payload: ReclamoDecisionPayload = {
      decision: decision as 'approved' | 'rejected',
      ...(decision_notes ? { decision_notes } : {}),
      ...(amount_approved ? { amount_approved: Number(amount_approved) } : {}),
    };

    this.saving.set(true);
    this.errorMsg.set('');
    this.successMsg.set('');

    this.svc.decide(this.item()!.id, payload).subscribe({
      next: updated => {
        this.item.set(updated);
        this.saving.set(false);
        this.successMsg.set(
          decision === 'approved'
            ? this.item()!.type === 'money_claim'
              ? 'Transferencia confirmada. La cajera puede proceder con la conciliacion manual.'
              : 'Reclamo aprobado correctamente.'
            : 'Reclamo rechazado correctamente.',
        );
      },
      error: err => {
        this.saving.set(false);
        this.errorMsg.set(err?.error?.message ?? 'No se pudo registrar la decision.');
      },
    });
  }

  isInvalid(field: string) {
    const ctrl = this.form.get(field);
    return ctrl?.invalid && ctrl?.touched;
  }

  distributorName = (item: Reclamo) => {
    const pd = item.distributor?.personData;
    if (!pd) return '—';
    return [pd.name, pd.first_last_name, pd.second_last_name].filter(Boolean).join(' ');
  };

  typeLabel = (type: string) => ({
    money_claim: 'Transferencia',
    credit_increase: 'Aumento de credito',
    redeem_points: 'Canje de puntos',
  }[type] ?? type);

  typeClass = (type: string) => ({
    money_claim: 'bg-[#0288D1]/10 text-[#0288D1] border-[#0288D1]/20',
    credit_increase: 'bg-[#7B1FA2]/10 text-[#7B1FA2] border-[#7B1FA2]/20',
    redeem_points: 'bg-[#00796B]/10 text-[#00796B] border-[#00796B]/20',
  }[type] ?? 'bg-[#F8FAFD] text-[#6B7280] border-[#E0E0E0]');

  statusLabel = (s: string) => ({
    pending: 'Pendiente',
    approved: 'Aprobado',
    rejected: 'Rechazado',
    closed: 'Cerrado',
  }[s] ?? s);

  statusClass = (s: string) => ({
    pending: 'bg-[#FF8800]/10 text-[#FF8800] border-[#FF8800]/20',
    approved: 'bg-[#00A86B]/10 text-[#00A86B] border-[#00A86B]/20',
    rejected: 'bg-[#E53935]/10 text-[#E53935] border-[#E53935]/20',
    closed: 'bg-[#6B7280]/10 text-[#6B7280] border-[#6B7280]/20',
  }[s] ?? 'bg-[#F8FAFD] text-[#6B7280] border-[#E0E0E0]');

  formatDate = (date?: string | null) =>
    date ? new Date(date).toLocaleString('es-MX') : '—';

  formatMoney = (value?: string | number | null) => {
    if (value === null || value === undefined || value === '') return '—';
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(value));
  };
}
