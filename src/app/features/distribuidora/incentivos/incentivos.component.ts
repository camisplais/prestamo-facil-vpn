import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-incentivos',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <div>
      <!-- Header -->
      <div class="mb-6">
        <h1 class="font-[Montserrat] text-[22px] font-extrabold text-[#1A1A2E]">Incentivos</h1>
        <p class="text-[13px] text-[#6B7280] mt-0.5">Consulta tus puntos acumulados y canjéalos</p>
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
        <!-- Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

          <!-- Categoría -->
          <div class="bg-white rounded-[10px] p-6 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-[10px] bg-[#003399]/10 text-[#003399] flex items-center justify-center flex-shrink-0">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                </svg>
              </div>
              <div>
                <div class="text-[12px] text-[#6B7280] mb-1">Categoría</div>
                <div class="font-[Montserrat] text-[20px] font-extrabold text-[#1A1A2E]">{{ incentiveData()?.name || '—' }}</div>
              </div>
            </div>
          </div>

          <!-- Puntos -->
          <div class="bg-white rounded-[10px] p-6 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-[10px] bg-[#FF8800]/10 text-[#FF8800] flex items-center justify-center flex-shrink-0">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                </svg>
              </div>
              <div>
                <div class="text-[12px] text-[#6B7280] mb-1">Puntos acumulados</div>
                <div class="font-[Montserrat] text-[20px] font-extrabold text-[#1A1A2E]">{{ incentiveData()?.points ?? 0 }}</div>
              </div>
            </div>
          </div>

          <!-- Valor del punto -->
          <div class="bg-white rounded-[10px] p-6 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-[10px] bg-[#00A86B]/10 text-[#00A86B] flex items-center justify-center flex-shrink-0">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div>
                <div class="text-[12px] text-[#6B7280] mb-1">Valor por punto</div>
                <div class="font-[Montserrat] text-[20px] font-extrabold text-[#1A1A2E]">\${{ pointValue()?.value ?? 0 }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Resumen de valor total -->
        <div class="bg-white rounded-[10px] p-6 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] mb-8">
          <div class="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div class="text-[13px] text-[#6B7280] mb-1">Valor total de tus puntos</div>
              <div class="font-[Montserrat] text-[28px] font-extrabold text-[#003399]">
                \${{ totalValue().toFixed(2) }}
              </div>
              <div class="text-[12px] text-[#6B7280] mt-1">
                {{ incentiveData()?.points ?? 0 }} puntos × \${{ pointValue()?.value ?? 0 }} por punto
              </div>
            </div>
            @if ((incentiveData()?.points ?? 0) > 0) {
              <button (click)="openRedeem()"
                class="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-[14px] font-semibold bg-[#FF8800] text-white hover:bg-[#E67A00] transition-colors border-0 cursor-pointer shadow-[0_2px_8px_rgba(255,136,0,0.3)]"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Canjear puntos
              </button>
            }
          </div>
        </div>

        @if ((incentiveData()?.points ?? 0) === 0) {
          <div class="bg-[#F8FAFD] rounded-[10px] p-8 border border-[#E0E0E0] text-center">
            <svg class="w-12 h-12 mx-auto text-[#6B7280]/40 mb-3" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
            </svg>
            <p class="text-[14px] font-semibold text-[#1A1A2E] mb-1">Sin puntos acumulados</p>
            <p class="text-[13px] text-[#6B7280]">Aún no tienes puntos para canjear. Sigue trabajando para acumular incentivos.</p>
          </div>
        }
      }
    </div>

    <!-- ═══════════════ MODAL CANJEAR PUNTOS ═══════════════ -->
    @if (showModal()) {
      <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        (click)="closeModal()">
        <div class="bg-white rounded-[10px] w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto"
          (click)="$event.stopPropagation()">

          <div class="px-5 py-4 border-b border-[#E0E0E0] flex items-center justify-between sticky top-0 bg-white z-10">
            <span class="font-[Montserrat] font-bold text-[15px]">Solicitud de canje de puntos</span>
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

            <!-- Resumen -->
            <div class="bg-[#F8FAFD] rounded-lg p-4 border border-[#E0E0E0]">
              <div class="flex justify-between text-[13px] mb-2">
                <span class="text-[#6B7280]">Puntos a canjear</span>
                <span class="font-semibold text-[#1A1A2E]">{{ incentiveData()?.points ?? 0 }}</span>
              </div>
              <div class="flex justify-between text-[13px] mb-2">
                <span class="text-[#6B7280]">Valor por punto</span>
                <span class="font-semibold text-[#1A1A2E]">\${{ pointValue()?.value ?? 0 }}</span>
              </div>
              <div class="border-t border-[#E0E0E0] pt-2 mt-2 flex justify-between text-[14px]">
                <span class="font-semibold text-[#003399]">Total a recibir</span>
                <span class="font-extrabold text-[#003399]">\${{ totalValue().toFixed(2) }}</span>
              </div>
            </div>

            <div class="flex justify-end gap-2 pt-1">
              <button type="button" (click)="closeModal()"
                class="px-4 py-2 rounded-lg text-[13px] font-semibold bg-white text-[#003399] border border-[#E0E0E0] hover:border-[#003399] transition-colors cursor-pointer"
              >Cancelar</button>
              <button type="button" (click)="submitRedeem()" [disabled]="saving()"
                class="px-4 py-2 rounded-lg text-[13px] font-semibold bg-[#FF8800] text-white hover:bg-[#E67A00] transition-colors border-0 cursor-pointer disabled:opacity-60"
              >
                @if (saving()) { Enviando… } @else { Solicitar canje }
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class IncentivosComponent implements OnInit {
  private http = inject(HttpClient);

  private readonly API = `${environment.apiUrl}/distribuidora/incentive`;

  loading      = signal(true);
  incentiveData = signal<any>(null);
  pointValue   = signal<any>(null);
  showModal    = signal(false);
  saving       = signal(false);
  errorMsg     = signal('');
  successMsg   = signal('');

  redeemComments = '';

  totalValue(): number {
    const points = this.incentiveData()?.points ?? 0;
    const value  = this.pointValue()?.value ?? 0;
    return points * value;
  }

  ngOnInit() {
    console.log('=== IncentivosComponent INIT ===');
    this.load();
  }

  private load() {
    console.log('=== CALLING API:', this.API);
    this.loading.set(true);
    this.http.get<any>(this.API).subscribe({
      next: res => {
        console.log('=== API RESPONSE:', res);
        this.incentiveData.set(res.data ?? null);
        this.pointValue.set(res.point_value ?? null);
        this.loading.set(false);
      },
      error: err => {
        console.log('=== API ERROR:', err);
        this.loading.set(false);
      },
    });
  }

  openRedeem() {
    this.redeemComments = '';
    this.errorMsg.set('');
    this.successMsg.set('');
    this.showModal.set(true);
  }

  closeModal() { this.showModal.set(false); }

  submitRedeem() {
    this.saving.set(true);
    this.errorMsg.set('');
    this.successMsg.set('');

    this.http.get<any>(`${this.API}/application`).subscribe({
      next: res => {
        this.saving.set(false);
        this.successMsg.set(res?.message ?? 'Solicitud creada exitosamente.');
        this.load();
        setTimeout(() => this.closeModal(), 2000);
      },
      /*error: err => {
        this.saving.set(false);
        this.errorMsg.set(err?.error?.message ?? 'Error al enviar la solicitud.');
      },*/
          error: err => {
      this.saving.set(false);
      
      // 👇 Agrega esto para ver TODO el error en consola
      console.error('=== HTTP ERROR ===');
      console.error('Status:', err.status);
      console.error('Error body:', err.error);
      console.error('Full error:', err);

      const msg = err?.error?.message ?? 'Error al guardar.';
      const errors = err?.error?.errors;
      if (errors) {
        const first = Object.values(errors).flat()[0];
        this.errorMsg.set(first as string);
      } else {
        this.errorMsg.set(msg);
      }
    },
    });
  }
}