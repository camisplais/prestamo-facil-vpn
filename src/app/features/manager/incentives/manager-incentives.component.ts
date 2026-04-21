import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IncentivePointDivisor, IncentivePointValue } from '../../../core/models';
import { ManagerIncentiveDivisorService } from '../../../core/services/manager-incentive-divisor.service';
import { ManagerIncentiveService } from '../../../core/services/manager-incentive.service';

const DEFAULT_DIVISOR = 1200;

@Component({
  selector: 'app-manager-incentives',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <div>
      <div class="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 class="font-[Montserrat] text-[22px] font-extrabold text-[#1A1A2E]">Puntos</h1>
          <p class="text-[13px] text-[#6B7280] mt-0.5">Configuración de puntos para tu sucursal</p>
        </div>
      </div>

      <!-- ═══════════════ Valor monetario del punto ═══════════════ -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div class="bg-white rounded-[10px] p-5 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] flex gap-4">
          <div class="w-11 h-11 rounded-[10px] bg-[#003399]/10 text-[#003399] flex items-center justify-center flex-shrink-0">
            <svg class="w-[22px] h-[22px]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 10v-1m0 0c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <div>
            <div class="font-[Montserrat] text-[22px] font-extrabold">{{ formatMoney(currentPointValue()) }}</div>
            <div class="text-[12px] text-[#6B7280] mt-0.5">Valor actual del punto</div>
          </div>
        </div>

        <div class="bg-white rounded-[10px] p-5 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] flex gap-4">
          <div class="w-11 h-11 rounded-[10px] bg-[#00A86B]/10 text-[#00A86B] flex items-center justify-center flex-shrink-0">
            <svg class="w-[22px] h-[22px]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
          </div>
          <div>
            <div class="font-[Montserrat] text-[22px] font-extrabold">{{ pointLastUpdatedLabel() }}</div>
            <div class="text-[12px] text-[#6B7280] mt-0.5">Ultima actualización (valor del punto)</div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] p-5 mb-8">
        <div class="border-b border-[#E0E0E0] pb-4 mb-5">
          <h2 class="font-[Montserrat] font-bold text-[16px] text-[#1A1A2E]">Valor del punto</h2>
          <p class="text-[13px] text-[#6B7280] mt-1">Monto en MXN que representa 1 punto.</p>
        </div>

        <form [formGroup]="pointForm" (ngSubmit)="submitPointValue()" class="flex flex-col gap-5">
          @if (pointSuccessMsg()) {
            <div class="bg-[#00A86B]/10 text-[#00A86B] text-[13px] px-3 py-2 rounded-lg border border-[#00A86B]/20" role="status">{{ pointSuccessMsg() }}</div>
          }

          @if (pointErrorMsg()) {
            <div class="bg-[#E53935]/10 text-[#E53935] text-[13px] px-3 py-2 rounded-lg border border-[#E53935]/20" role="alert">{{ pointErrorMsg() }}</div>
          }

          @if (pointFieldErrors().length) {
            <ul class="bg-[#E53935]/10 text-[#E53935] text-[12px] px-3 py-2 rounded-lg border border-[#E53935]/20 list-disc list-inside" role="alert">
              @for (msg of pointFieldErrors(); track msg) { <li>{{ msg }}</li> }
            </ul>
          }

          <div class="grid grid-cols-1 md:grid-cols-[minmax(0,420px)_1fr] gap-5 items-start">
            <div class="flex flex-col gap-1">
              <label class="text-[12px] font-semibold text-[#1A1A2E]" for="point-value">Valor monetario del punto</label>
              <input id="point-value" formControlName="value" type="number" min="0" step="0.01" placeholder="0.00"
                class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] transition-colors"
                [class.border-[#E53935]]="isInvalid(pointForm, 'value')"
              />
              @if (isInvalid(pointForm, 'value')) {
                <span class="text-[11px] text-[#E53935]">Ingresa un valor válido mayor o igual a 0.</span>
              }
            </div>

            <div class="rounded-[10px] border border-[#E0E0E0] bg-[#F8FAFD] px-4 py-3">
              <p class="text-[12px] font-bold text-[#003399] uppercase tracking-wide mb-2">Vista previa</p>
              <p class="text-[13px] text-[#1A1A2E] leading-6">
                1 punto = <strong>{{ pointPreviewLabel() }}</strong>
              </p>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-1">
            <button type="button" (click)="resetPointForm()"
              class="px-4 py-2 rounded-lg text-[13px] font-semibold bg-white text-[#003399] border border-[#E0E0E0] hover:border-[#003399] transition-colors cursor-pointer"
            >Restablecer</button>
            <button type="submit" [disabled]="savingPoint()"
              class="px-4 py-2 rounded-lg text-[13px] font-semibold bg-[#003399] text-white hover:bg-[#002277] transition-colors border-0 cursor-pointer disabled:opacity-60"
            >
              @if (savingPoint()) { Guardando... } @else { {{ pointValue() ? 'Actualizar valor' : 'Guardar valor' }} }
            </button>
          </div>
        </form>
      </div>

      <!-- ═══════════════ Divisor (1200) ═══════════════ -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div class="bg-white rounded-[10px] p-5 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] flex gap-4">
          <div class="w-11 h-11 rounded-[10px] bg-[#003399]/10 text-[#003399] flex items-center justify-center flex-shrink-0">
            <svg class="w-[22px] h-[22px]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 10v-1m0 0c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <div>
            <div class="font-[Montserrat] text-[22px] font-extrabold">{{ formatNumber(currentDivisor()) }}</div>
            <div class="text-[12px] text-[#6B7280] mt-0.5">Divisor actual</div>
          </div>
        </div>

        <div class="bg-white rounded-[10px] p-5 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] flex gap-4">
          <div class="w-11 h-11 rounded-[10px] bg-[#00A86B]/10 text-[#00A86B] flex items-center justify-center flex-shrink-0">
            <svg class="w-[22px] h-[22px]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
          </div>
          <div>
            <div class="font-[Montserrat] text-[22px] font-extrabold">{{ divisorLastUpdatedLabel() }}</div>
            <div class="text-[12px] text-[#6B7280] mt-0.5">Ultima actualización (divisor)</div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] p-5">
        <div class="border-b border-[#E0E0E0] pb-4 mb-5">
          <h2 class="font-[Montserrat] font-bold text-[16px] text-[#1A1A2E]">Divisor de puntos</h2>
          <p class="text-[13px] text-[#6B7280] mt-1">Por defecto es ${DEFAULT_DIVISOR}. Se usa para el cálculo de puntos.</p>
        </div>

        <form [formGroup]="divisorForm" (ngSubmit)="submitDivisor()" class="flex flex-col gap-5">
          @if (divisorSuccessMsg()) {
            <div class="bg-[#00A86B]/10 text-[#00A86B] text-[13px] px-3 py-2 rounded-lg border border-[#00A86B]/20" role="status">{{ divisorSuccessMsg() }}</div>
          }

          @if (divisorErrorMsg()) {
            <div class="bg-[#E53935]/10 text-[#E53935] text-[13px] px-3 py-2 rounded-lg border border-[#E53935]/20" role="alert">{{ divisorErrorMsg() }}</div>
          }

          @if (divisorFieldErrors().length) {
            <ul class="bg-[#E53935]/10 text-[#E53935] text-[12px] px-3 py-2 rounded-lg border border-[#E53935]/20 list-disc list-inside" role="alert">
              @for (msg of divisorFieldErrors(); track msg) { <li>{{ msg }}</li> }
            </ul>
          }

          <div class="grid grid-cols-1 md:grid-cols-[minmax(0,420px)_1fr] gap-5 items-start">
            <div class="flex flex-col gap-1">
              <label class="text-[12px] font-semibold text-[#1A1A2E]" for="point-divisor">Divisor</label>
              <input id="point-divisor" formControlName="value" type="number" min="1" step="1" placeholder="${DEFAULT_DIVISOR}"
                class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] transition-colors"
                [class.border-[#E53935]]="isInvalid(divisorForm, 'value')"
              />
              @if (isInvalid(divisorForm, 'value')) {
                <span class="text-[11px] text-[#E53935]">Ingresa un valor válido mayor o igual a 1.</span>
              }
            </div>

            <div class="rounded-[10px] border border-[#E0E0E0] bg-[#F8FAFD] px-4 py-3">
              <p class="text-[12px] font-bold text-[#003399] uppercase tracking-wide mb-2">Cómo se usa</p>
              <p class="text-[13px] text-[#1A1A2E] leading-6">
                Puntos = (Productos entregados / <strong>{{ divisorPreviewLabel() }}</strong>) × % de categoría
              </p>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-1">
            <button type="button" (click)="resetDivisorForm()"
              class="px-4 py-2 rounded-lg text-[13px] font-semibold bg-white text-[#003399] border border-[#E0E0E0] hover:border-[#003399] transition-colors cursor-pointer"
            >Restablecer</button>
            <button type="submit" [disabled]="savingDivisor()"
              class="px-4 py-2 rounded-lg text-[13px] font-semibold bg-[#003399] text-white hover:bg-[#002277] transition-colors border-0 cursor-pointer disabled:opacity-60"
            >
              @if (savingDivisor()) { Guardando... } @else { {{ divisorValue() ? 'Actualizar divisor' : 'Guardar divisor' }} }
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class ManagerIncentivesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private pointSvc = inject(ManagerIncentiveService);
  private divisorSvc = inject(ManagerIncentiveDivisorService);

  // Valor del punto (MXN)
  savingPoint = signal(false);
  pointValue = signal<IncentivePointValue | null>(null);
  pointErrorMsg = signal('');
  pointSuccessMsg = signal('');
  pointFieldErrors = signal<string[]>([]);
  pointPreviewValue = signal(0);

  currentPointValue = computed(() => this.pointValue()?.value ?? null);
  pointLastUpdatedLabel = computed(() => this.formatDateLabel(this.pointValue()?.updated_at));
  pointPreviewLabel = computed(() => this.formatMoney(this.pointPreviewValue()));

  pointForm = this.fb.group({
    value: [0, [Validators.required, Validators.min(0)]],
  });

  // Divisor
  savingDivisor = signal(false);
  divisorValue = signal<IncentivePointDivisor | null>(null);
  divisorErrorMsg = signal('');
  divisorSuccessMsg = signal('');
  divisorFieldErrors = signal<string[]>([]);
  divisorPreviewValue = signal(DEFAULT_DIVISOR);

  currentDivisor = computed(() => Number(this.divisorValue()?.value ?? DEFAULT_DIVISOR));
  divisorLastUpdatedLabel = computed(() => this.formatDateLabel(this.divisorValue()?.updated_at));
  divisorPreviewLabel = computed(() => this.formatNumber(this.divisorPreviewValue()));

  divisorForm = this.fb.group({
    value: [DEFAULT_DIVISOR, [Validators.required, Validators.min(1)]],
  });

  ngOnInit() {
    this.pointForm.controls.value.valueChanges.subscribe(value => {
      this.pointPreviewValue.set(Number(value ?? 0));
    });

    this.divisorForm.controls.value.valueChanges.subscribe(value => {
      this.divisorPreviewValue.set(Number(value ?? DEFAULT_DIVISOR));
    });

    this.loadPointValue();
    this.loadDivisor();
  }

  private loadPointValue() {
    this.pointSvc.getPointValue().subscribe({
      next: res => {
        const value = res.data ?? null;
        const normalizedValue = Number(value?.value ?? 0);
        this.pointValue.set(value);
        this.pointPreviewValue.set(normalizedValue);
        this.pointForm.reset({ value: normalizedValue });
      },
      error: err => {
        this.pointErrorMsg.set(err?.error?.message ?? 'No se pudo cargar el valor del punto.');
      },
    });
  }

  private loadDivisor() {
    this.divisorSvc.getDivisor().subscribe({
      next: res => {
        const value = res.data ?? null;
        const normalizedValue = Number(value?.value ?? DEFAULT_DIVISOR);
        this.divisorValue.set(value);
        this.divisorPreviewValue.set(normalizedValue);
        this.divisorForm.reset({ value: normalizedValue });
      },
      error: err => {
        this.divisorErrorMsg.set(err?.error?.message ?? 'No se pudo cargar el divisor.');
      },
    });
  }

  submitPointValue() {
    this.pointForm.markAllAsTouched();
    this.pointSuccessMsg.set('');
    this.pointErrorMsg.set('');
    this.pointFieldErrors.set([]);

    if (this.pointForm.invalid) {
      this.pointErrorMsg.set('Revisa el valor capturado.');
      this.pointFieldErrors.set(this.collectFormErrors(this.pointForm, { value: 'El valor del punto' }));
      return;
    }

    const value = Number(this.pointForm.getRawValue().value ?? 0);
    this.savingPoint.set(true);

    const request = this.pointValue()
      ? this.pointSvc.updatePointValue(this.pointValue()!.id, value)
      : this.pointSvc.createPointValue(value);

    request.subscribe({
      next: res => {
        const pointValue = res.data ?? null;
        const normalizedValue = Number(pointValue?.value ?? value);
        this.pointValue.set(pointValue);
        this.pointPreviewValue.set(normalizedValue);
        this.pointForm.reset({ value: normalizedValue });
        this.savingPoint.set(false);
        this.pointSuccessMsg.set('Valor del punto guardado correctamente.');
      },
      error: err => {
        this.savingPoint.set(false);
        this.pointErrorMsg.set(err?.error?.message ?? 'No se pudo guardar el valor del punto.');
        this.pointFieldErrors.set(this.extractBackendErrors(err));
      },
    });
  }

  submitDivisor() {
    this.divisorForm.markAllAsTouched();
    this.divisorSuccessMsg.set('');
    this.divisorErrorMsg.set('');
    this.divisorFieldErrors.set([]);

    if (this.divisorForm.invalid) {
      this.divisorErrorMsg.set('Revisa el valor capturado.');
      this.divisorFieldErrors.set(this.collectFormErrors(this.divisorForm, { value: 'El divisor' }));
      return;
    }

    const value = Number(this.divisorForm.getRawValue().value ?? DEFAULT_DIVISOR);
    this.savingDivisor.set(true);

    const request = this.divisorValue()
      ? this.divisorSvc.updateDivisor(this.divisorValue()!.id, value)
      : this.divisorSvc.createDivisor(value);

    request.subscribe({
      next: res => {
        const divisor = res.data ?? null;
        const normalizedValue = Number(divisor?.value ?? value);
        this.divisorValue.set(divisor);
        this.divisorPreviewValue.set(normalizedValue);
        this.divisorForm.reset({ value: normalizedValue });
        this.savingDivisor.set(false);
        this.divisorSuccessMsg.set('Divisor guardado correctamente.');
      },
      error: err => {
        this.savingDivisor.set(false);
        this.divisorErrorMsg.set(err?.error?.message ?? 'No se pudo guardar el divisor.');
        this.divisorFieldErrors.set(this.extractBackendErrors(err));
      },
    });
  }

  resetPointForm() {
    this.pointSuccessMsg.set('');
    this.pointErrorMsg.set('');
    this.pointFieldErrors.set([]);
    const normalizedValue = Number(this.pointValue()?.value ?? 0);
    this.pointPreviewValue.set(normalizedValue);
    this.pointForm.reset({ value: normalizedValue });
  }

  resetDivisorForm() {
    this.divisorSuccessMsg.set('');
    this.divisorErrorMsg.set('');
    this.divisorFieldErrors.set([]);
    const normalizedValue = Number(this.divisorValue()?.value ?? DEFAULT_DIVISOR);
    this.divisorPreviewValue.set(normalizedValue);
    this.divisorForm.reset({ value: normalizedValue });
  }

  isInvalid(form: any, field: string) {
    const control = form?.get?.(field) as AbstractControl | null;
    return !!(control?.invalid && control?.touched);
  }

  formatMoney(value?: number | null) {
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
      return '—';
    }

    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(value));
  }

  formatNumber(value?: number | null) {
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
      return '—';
    }

    return new Intl.NumberFormat('es-MX', { maximumFractionDigits: 2 }).format(Number(value));
  }

  private formatDateLabel(value?: string) {
    if (!value) {
      return 'Sin registro';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return 'Sin registro';
    }

    return new Intl.DateTimeFormat('es-MX', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  }

  private extractBackendErrors(err: any): string[] {
    const errors = err?.error?.errors ?? null;
    if (!errors || typeof errors !== 'object') {
      return [];
    }

    return Object.values(errors)
      .flat()
      .filter((msg): msg is string => typeof msg === 'string');
  }

  private collectFormErrors(form: AbstractControl, labels: Record<string, string>) {
    const messages = new Set<string>();
    const walk = (control: AbstractControl, path: string) => {
      const controlAny = control as { controls?: Record<string, AbstractControl> };
      if (controlAny.controls) {
        Object.entries(controlAny.controls).forEach(([key, child]) => {
          const nextPath = path ? `${path}.${key}` : key;
          walk(child, nextPath);
        });
        return;
      }

      if (control.invalid && control.errors) {
        const label = (labels[path] ?? path) || 'El campo';
        Object.keys(control.errors).forEach(key => {
          switch (key) {
            case 'required':
              messages.add(`${label} es obligatorio.`);
              break;
            case 'min':
              messages.add(`${label} debe ser mayor o igual a ${(control.errors as any)['min'].min}.`);
              break;
            default:
              messages.add(`${label} es inválido.`);
              break;
          }
        });
      }
    };

    walk(form, '');
    return Array.from(messages);
  }
}
