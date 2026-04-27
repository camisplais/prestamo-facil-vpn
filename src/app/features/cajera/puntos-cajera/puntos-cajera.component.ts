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
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-incentivos-cajera',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, DecimalPipe, DatePipe],
  template: `
    <!-- ═══════════════ PANTALLA 1: LISTADO DE SOLICITUDES ═══════════════ -->
    @if (screen() === 'lista') {
      <div>
        <div class="mb-6">
          <h1 class="font-[Montserrat] text-[22px] font-extrabold text-[#1A1A2E]">Canje de puntos</h1>
          <p class="text-[13px] text-[#6B7280] mt-0.5">Solicitudes de canje de puntos asignadas a tu caja</p>
        </div>

        @if (loading()) {
          <div class="flex items-center justify-center py-16 text-[#6B7280] text-[13px]">
            <svg class="w-5 h-5 animate-spin mr-2 text-[#003399]" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            Cargando solicitudes…
          </div>
        } @else {

          <!-- Pendientes de autorizar -->
          <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] mb-6">
            <div class="px-5 py-4 border-b border-[#E0E0E0] flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-[#FF8800] inline-block"></span>
              <span class="font-[Montserrat] font-bold text-[14px] text-[#1A1A2E]">Pendientes de autorización</span>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-[13px] border-collapse">
                <thead>
                  <tr>
                    <th class="bg-[#F8FAFD] font-[Montserrat] font-bold text-[11px] uppercase tracking-[0.5px] text-[#6B7280] px-5 py-3 text-left border-b border-[#E0E0E0]">ID</th>
                    <th class="bg-[#F8FAFD] font-[Montserrat] font-bold text-[11px] uppercase tracking-[0.5px] text-[#6B7280] px-5 py-3 text-left border-b border-[#E0E0E0]">Distribuidora</th>
                    <th class="bg-[#F8FAFD] font-[Montserrat] font-bold text-[11px] uppercase tracking-[0.5px] text-[#6B7280] px-5 py-3 text-left border-b border-[#E0E0E0]">Puntos</th>
                    <th class="bg-[#F8FAFD] font-[Montserrat] font-bold text-[11px] uppercase tracking-[0.5px] text-[#6B7280] px-5 py-3 text-left border-b border-[#E0E0E0]">Valor punto</th>
                    <th class="bg-[#F8FAFD] font-[Montserrat] font-bold text-[11px] uppercase tracking-[0.5px] text-[#6B7280] px-5 py-3 text-left border-b border-[#E0E0E0]">Total a pagar</th>
                    <th class="bg-[#F8FAFD] font-[Montserrat] font-bold text-[11px] uppercase tracking-[0.5px] text-[#6B7280] px-5 py-3 text-left border-b border-[#E0E0E0]">Fecha</th>
                    <th class="bg-[#F8FAFD] font-[Montserrat] font-bold text-[11px] uppercase tracking-[0.5px] text-[#6B7280] px-5 py-3 text-left border-b border-[#E0E0E0]">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  @for (s of pendientes(); track s.application_id) {
                    <tr class="border-b border-[#F0F0F0] hover:bg-[#F8FAFD] transition-colors">
                      <td class="px-5 py-3 font-mono text-[12px] text-[#003399] font-semibold">#{{ s.application_id }}</td>
                      <td class="px-5 py-3 font-semibold text-[#1A1A2E]">{{ s.distributor.name }}</td>
                      <td class="px-5 py-3 text-[#6B7280]">{{ s.distributor.points | number }}</td>
                      <td class="px-5 py-3 text-[#6B7280]">\${{ s.point_value | number:'1.2-2' }}</td>
                      <td class="px-5 py-3 font-semibold text-[#003399]">\${{ s.total_payout | number:'1.2-2' }}</td>
                      <td class="px-5 py-3 text-[#6B7280]">{{ s.created_at | date:'dd/MM/yyyy' }}</td>
                      <td class="px-5 py-3">
                        <button (click)="selectSolicitud(s)"
                          class="px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-[#003399] text-white hover:bg-[#002277] transition-colors border-0 cursor-pointer">
                          Revisar
                        </button>
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="7" class="px-5 py-10 text-center text-[#6B7280] text-[13px]">No hay solicitudes pendientes.</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>

          <!-- Autorizadas (listas para canjear) -->
          <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
            <div class="px-5 py-4 border-b border-[#E0E0E0] flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-[#00A86B] inline-block"></span>
              <span class="font-[Montserrat] font-bold text-[14px] text-[#1A1A2E]">Autorizadas — listas para canjear</span>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-[13px] border-collapse">
                <thead>
                  <tr>
                    <th class="bg-[#F8FAFD] font-[Montserrat] font-bold text-[11px] uppercase tracking-[0.5px] text-[#6B7280] px-5 py-3 text-left border-b border-[#E0E0E0]">ID</th>
                    <th class="bg-[#F8FAFD] font-[Montserrat] font-bold text-[11px] uppercase tracking-[0.5px] text-[#6B7280] px-5 py-3 text-left border-b border-[#E0E0E0]">Distribuidora</th>
                    <th class="bg-[#F8FAFD] font-[Montserrat] font-bold text-[11px] uppercase tracking-[0.5px] text-[#6B7280] px-5 py-3 text-left border-b border-[#E0E0E0]">Puntos</th>
                    <th class="bg-[#F8FAFD] font-[Montserrat] font-bold text-[11px] uppercase tracking-[0.5px] text-[#6B7280] px-5 py-3 text-left border-b border-[#E0E0E0]">Total a pagar</th>
                    <th class="bg-[#F8FAFD] font-[Montserrat] font-bold text-[11px] uppercase tracking-[0.5px] text-[#6B7280] px-5 py-3 text-left border-b border-[#E0E0E0]">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  @for (s of autorizadas(); track s.application_id) {
                    <tr class="border-b border-[#F0F0F0] hover:bg-[#F8FAFD] transition-colors">
                      <td class="px-5 py-3 font-mono text-[12px] text-[#00A86B] font-semibold">#{{ s.application_id }}</td>
                      <td class="px-5 py-3 font-semibold text-[#1A1A2E]">{{ s.distributor.name }}</td>
                      <td class="px-5 py-3 text-[#6B7280]">{{ s.distributor.points | number }}</td>
                      <td class="px-5 py-3 font-semibold text-[#003399]">\${{ s.total_payout | number:'1.2-2' }}</td>
                      <td class="px-5 py-3">
                        <button (click)="openTransferModal(s)"
                          class="px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-[#00A86B] text-white hover:bg-[#008F5A] transition-colors border-0 cursor-pointer">
                          Canjear
                        </button>
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="5" class="px-5 py-10 text-center text-[#6B7280] text-[13px]">No hay solicitudes autorizadas pendientes de canje.</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>

        }
      </div>
    }

    <!-- ═══════════════ PANTALLA 2: DETALLE / AUTORIZAR ═══════════════ -->
    @if (screen() === 'detalle') {
      <div>
        <div class="flex items-center gap-3 mb-6">
          <button (click)="screen.set('lista')" class="text-[#6B7280] hover:text-[#003399] transition-colors bg-transparent border-0 cursor-pointer p-0">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <div>
            <h1 class="font-[Montserrat] text-[22px] font-extrabold text-[#1A1A2E]">
              Solicitud #{{ selectedSolicitud()?.application_id }}
            </h1>
            <p class="text-[13px] text-[#6B7280] mt-0.5">Revisa los datos antes de autorizar</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          <!-- Datos de la distribuidora -->
          <div class="bg-white rounded-[10px] p-6 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
            <p class="text-[12px] font-bold text-[#003399] uppercase tracking-wide mb-4">Datos de la distribuidora</p>
            <div class="flex flex-col gap-3">
              <div class="flex justify-between text-[13px]">
                <span class="text-[#6B7280]">Nombre</span>
                <span class="font-semibold text-[#1A1A2E]">{{ selectedSolicitud()?.distributor?.name }}</span>
              </div>
              <div class="flex justify-between text-[13px]">
                <span class="text-[#6B7280]">Puntos acumulados</span>
                <span class="font-semibold text-[#1A1A2E]">{{ selectedSolicitud()?.distributor?.points | number }}</span>
              </div>
              <div class="flex justify-between text-[13px]">
                <span class="text-[#6B7280]">Fecha de solicitud</span>
                <span class="font-semibold text-[#1A1A2E]">{{ selectedSolicitud()?.created_at | date:'dd/MM/yyyy HH:mm' }}</span>
              </div>
              @if (selectedSolicitud()?.comments) {
                <div class="flex justify-between text-[13px]">
                  <span class="text-[#6B7280]">Comentarios</span>
                  <span class="font-semibold text-[#1A1A2E]">{{ selectedSolicitud()?.comments }}</span>
                </div>
              }
            </div>
          </div>

          <!-- Resumen del canje -->
          <div class="bg-white rounded-[10px] p-6 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
            <p class="text-[12px] font-bold text-[#003399] uppercase tracking-wide mb-4">Resumen del canje</p>
            <div class="flex flex-col gap-3">
              <div class="flex justify-between text-[13px]">
                <span class="text-[#6B7280]">Puntos a canjear</span>
                <span class="font-semibold text-[#1A1A2E]">{{ selectedSolicitud()?.distributor?.points | number }}</span>
              </div>
              <div class="flex justify-between text-[13px]">
                <span class="text-[#6B7280]">Valor por punto</span>
                <span class="font-semibold text-[#1A1A2E]">\${{ selectedSolicitud()?.point_value | number:'1.2-2' }}</span>
              </div>
              <div class="h-px bg-[#E0E0E0] my-1"></div>
              <div class="flex justify-between text-[14px]">
                <span class="font-bold text-[#1A1A2E]">Total a pagar</span>
                <span class="font-extrabold text-[#003399]">\${{ selectedSolicitud()?.total_payout | number:'1.2-2' }}</span>
              </div>
            </div>
          </div>
        </div>

        @if (actionMsg()) {
          <div class="bg-[#00A86B]/10 text-[#00A86B] text-[13px] px-4 py-3 rounded-lg border border-[#00A86B]/20 mb-4">{{ actionMsg() }}</div>
        }
        @if (actionError()) {
          <div class="bg-[#E53935]/10 text-[#E53935] text-[13px] px-4 py-3 rounded-lg border border-[#E53935]/20 mb-4">{{ actionError() }}</div>
        }

        <div class="flex gap-3">
          <button (click)="autorizarSolicitud()" [disabled]="actionLoading()"
            class="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-[14px] font-semibold bg-[#003399] text-white hover:bg-[#002277] transition-colors border-0 cursor-pointer disabled:opacity-60">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            @if (actionLoading()) { Autorizando… } @else { Autorizar solicitud }
          </button>
        </div>
      </div>
    }

    <!-- ═══════════════ MODAL CANJEAR / TRANSFERIR ═══════════════ -->
    @if (showTransferModal()) {
      <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        (click)="closeTransferModal()">
        <div class="bg-white rounded-[10px] w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto"
          (click)="$event.stopPropagation()">

          <div class="px-5 py-4 border-b border-[#E0E0E0] flex items-center justify-between sticky top-0 bg-white z-10">
            <span class="font-[Montserrat] font-bold text-[15px]">
              Canjear puntos — #{{ transferSolicitud()?.application_id }}
            </span>
            <button (click)="closeTransferModal()" class="text-[#6B7280] hover:text-[#1A1A2E] bg-transparent border-0 cursor-pointer">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <div class="p-5 flex flex-col gap-4">
            @if (transferError()) {
              <div class="bg-[#E53935]/10 text-[#E53935] text-[13px] px-3 py-2 rounded-lg border border-[#E53935]/20">{{ transferError() }}</div>
            }
            @if (transferSuccess()) {
              <div class="bg-[#00A86B]/10 text-[#00A86B] text-[13px] px-3 py-2 rounded-lg border border-[#00A86B]/20">{{ transferSuccess() }}</div>
            }

            <!-- Resumen -->
            <div class="bg-[#F8FAFD] rounded-lg p-4 border border-[#E0E0E0]">
              <div class="flex justify-between text-[13px] mb-2">
                <span class="text-[#6B7280]">Distribuidora</span>
                <span class="font-semibold text-[#1A1A2E]">{{ transferSolicitud()?.distributor?.name }}</span>
              </div>
              <div class="flex justify-between text-[13px]">
                <span class="text-[#6B7280]">Monto a transferir</span>
                <span class="font-extrabold text-[#003399]">\${{ transferSolicitud()?.total_payout | number:'1.2-2' }}</span>
              </div>
            </div>

            <!-- Datos de tarjeta -->
            <p class="text-[12px] font-bold text-[#003399] uppercase tracking-wide">Datos de tarjeta</p>

            <!-- Nombre del titular -->
            <div class="flex flex-col gap-1">
              <label class="text-[12px] font-semibold text-[#1A1A2E]">Nombre del titular *</label>
              <input type="text" [(ngModel)]="cardName" placeholder="Como aparece en la tarjeta"
                class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] transition-colors uppercase"
                maxlength="60"
              />
            </div>

            <!-- Número de tarjeta -->
            <div class="flex flex-col gap-1">
              <label class="text-[12px] font-semibold text-[#1A1A2E]">Número de tarjeta *</label>
              <input type="text" [(ngModel)]="cardNumber" placeholder="0000 0000 0000 0000"
                (input)="formatCardNumber($event)"
                class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] font-mono outline-none focus:border-[#003399] transition-colors tracking-widest"
                maxlength="19"
              />
            </div>

            <!-- CVV y Fecha -->
            <div class="grid grid-cols-2 gap-3">
              <div class="flex flex-col gap-1">
                <label class="text-[12px] font-semibold text-[#1A1A2E]">Fecha de expiración *</label>
                <input type="text" [(ngModel)]="cardExpiry" placeholder="MM/AA"
                  (input)="formatExpiry($event)"
                  class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] font-mono outline-none focus:border-[#003399] transition-colors"
                  maxlength="5"
                />
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-[12px] font-semibold text-[#1A1A2E]">CVV *</label>
                <input type="password" [(ngModel)]="cardCvv" placeholder="•••"
                  class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] font-mono outline-none focus:border-[#003399] transition-colors"
                  maxlength="4"
                />
              </div>
            </div>

            <div class="flex justify-end gap-2 pt-1">
              <button type="button" (click)="closeTransferModal()"
                class="px-4 py-2 rounded-lg text-[13px] font-semibold bg-white text-[#003399] border border-[#E0E0E0] hover:border-[#003399] transition-colors cursor-pointer"
              >Cancelar</button>
              <button type="button" (click)="confirmarTransferencia()" [disabled]="transferLoading()"
                class="px-4 py-2 rounded-lg text-[13px] font-semibold bg-[#00A86B] text-white hover:bg-[#008F5A] transition-colors border-0 cursor-pointer disabled:opacity-60"
              >
                @if (transferLoading()) { Procesando… } @else { Confirmar transferencia }
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class PuntosCajeraComponent implements OnInit {
  private http = inject(HttpClient);
  private readonly API = `${environment.apiUrl}/cajera`;

  // ── Screens ─────────────────────────────────────────────────
  screen = signal<'lista' | 'detalle'>('lista');

  // ── Lista ────────────────────────────────────────────────────
  loading      = signal(true);
  solicitudes  = signal<any[]>([]);

  pendientes  = computed(() => this.solicitudes().filter(s => s.status === 'pending'));
  autorizadas = computed(() => this.solicitudes().filter(s => s.status === 'approved'));

  // ── Detalle / Autorizar ──────────────────────────────────────
  selectedSolicitud = signal<any>(null);
  actionLoading     = signal(false);
  actionMsg         = signal('');
  actionError       = signal('');

  // ── Transfer modal ───────────────────────────────────────────
  showTransferModal  = signal(false);
  transferSolicitud  = signal<any>(null);
  transferLoading    = signal(false);
  transferError      = signal('');
  transferSuccess    = signal('');

  cardName   = '';
  cardNumber = '';
  cardExpiry = '';
  cardCvv    = '';

  // ── Lifecycle ────────────────────────────────────────────────
  ngOnInit() {
    this.load();
  }

  private load() {
    this.loading.set(true);
    this.http.get<any>(`${this.API}/incentive-redemptions`).subscribe({
      next: res => {
        this.solicitudes.set(res.data ?? []);
        this.loading.set(false);
      },
      error: err => {
        this.loading.set(false);
      },
    });
  }

  // ── Pantalla detalle ─────────────────────────────────────────
  selectSolicitud(s: any) {
    this.selectedSolicitud.set(s);
    this.actionMsg.set('');
    this.actionError.set('');
    this.screen.set('detalle');
  }

  
  // ── Autorizar ────────────────────────────────────────────────
  autorizarSolicitud() {
    if (!confirm('¿Confirmas la autorización de esta solicitud de canje?')) return;

    this.actionLoading.set(true);
    this.actionMsg.set('');
    this.actionError.set('');

    const id = this.selectedSolicitud()?.application_id;
    this.http.post<any>(`${this.API}/incentive-redemptions/${id}/authorize`, {}).subscribe({
      next: res => {
        this.actionLoading.set(false);
        this.actionMsg.set(res?.message ?? 'Solicitud autorizada. La distribuidora ya puede realizar el canje.');
        this.load();
        // Actualizar la solicitud seleccionada con status autorizado
        this.selectedSolicitud.set({ ...this.selectedSolicitud(), status: 'authorized' });
      },
      error: err => {

         
        this.actionLoading.set(false); // ← estaba faltando esto también
        this.actionError.set(err?.error?.message ?? `Error interno del servidor.`);
        this.loading.set(false);
      },
    });
  }

  // ── Transfer modal ───────────────────────────────────────────
  openTransferModal(s: any) {
    this.transferSolicitud.set(s);
    this.cardName   = '';
    this.cardNumber = '';
    this.cardExpiry = '';
    this.cardCvv    = '';
    this.transferError.set('');
    this.transferSuccess.set('');
    this.showTransferModal.set(true);
  }

  closeTransferModal() {
    this.showTransferModal.set(false);
    this.transferSolicitud.set(null);
  }

  formatCardNumber(e: Event) {
    const input = e.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '').slice(0, 16);
    this.cardNumber = digits.replace(/(.{4})/g, '$1 ').trim();
    input.value = this.cardNumber;
  }

  formatExpiry(e: Event) {
    const input = e.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '').slice(0, 4);
    this.cardExpiry = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
    input.value = this.cardExpiry;
  }

  confirmarTransferencia() {
    if (!this.cardName.trim()) {
      this.transferError.set('Ingresa el nombre del titular.');
      return;
    }
    if (this.cardNumber.replace(/\s/g, '').length < 16) {
      this.transferError.set('Ingresa un número de tarjeta válido (16 dígitos).');
      return;
    }
    if (this.cardExpiry.length < 5) {
      this.transferError.set('Ingresa la fecha de expiración (MM/AA).');
      return;
    }
    if (this.cardCvv.length < 3) {
      this.transferError.set('Ingresa el CVV (mínimo 3 dígitos).');
      return;
    }

    if (!confirm('¿Confirmas la transferencia? Esta acción no se puede deshacer.')) return;

    this.transferLoading.set(true);
    this.transferError.set('');
    this.transferSuccess.set('');

    const id = this.transferSolicitud()?.application_id;
    this.http.post<any>(`${this.API}/incentive-redemptions/${id}/transfer`, {
      card_name:   this.cardName.trim().toUpperCase(),
      card_number: this.cardNumber.replace(/\s/g, ''),
      card_expiry: this.cardExpiry,
      card_cvv:    this.cardCvv,
    }).subscribe({
      next: res => {
        this.transferLoading.set(false);
        this.transferSuccess.set(res?.message ?? 'Transferencia realizada correctamente.');
        this.load();
        setTimeout(() => this.closeTransferModal(), 2000);
      },
      error: err => {

        this.transferLoading.set(false); // ← estaba faltando esto también
        this.transferError.set(err?.error?.message ?? `Error interno del servidor.`);
        this.loading.set(false);
      },
    });
  }
}