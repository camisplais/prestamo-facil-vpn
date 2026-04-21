import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ExpirationDate, ExpirationDateForm } from '../../../core/models';
import { ExpirationDateService } from '../../../core/services/expiration-date.service';

@Component({
  selector: 'app-expiration-dates',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, DatePipe],
  template: `
    <div>
      <!-- Header -->
      <div class="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 class="font-[Montserrat] text-[22px] font-extrabold text-[#1A1A2E]">Fechas de Corte</h1>
          <p class="text-[13px] text-[#6B7280] mt-0.5">
            Configura los días de corte quincenal. Solo puede haber una configuración vigente.
          </p>
        </div>
        <button
          (click)="openCreate()"
          class="inline-flex items-center gap-1.5 px-[18px] py-[9px] rounded-lg text-[13px] font-semibold bg-[#003399] text-white hover:bg-[#002277] transition-colors border-0 cursor-pointer flex-shrink-0"
        >
          <svg class="w-[15px] h-[15px]" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
          </svg>
          Nueva configuración
        </button>
      </div>

      <!-- Banner configuración vigente -->
      @if (active()) {
        <div class="bg-[#003399]/5 border border-[#003399]/20 rounded-[10px] p-5 mb-6 flex items-center gap-4">
          <div class="w-11 h-11 rounded-full bg-[#003399] text-white flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
          </div>
          <div>
            <p class="text-[11px] font-semibold text-[#003399] uppercase tracking-wider mb-0.5">Vigente ahora</p>
            <p class="text-[17px] font-[Montserrat] font-extrabold text-[#1A1A2E]">
              Día {{ active()!.cutoff_day_1 }} y Día {{ active()!.cutoff_day_2 }} de cada mes
            </p>
            <p class="text-[12px] text-[#6B7280]">Activa desde {{ active()!.created_at | date:'dd/MM/yyyy' }}</p>
          </div>
        </div>
      }

      <!-- Stats -->
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div class="bg-white rounded-[10px] p-5 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] flex gap-4">
          <div class="w-11 h-11 rounded-[10px] bg-[#003399]/10 text-[#003399] flex items-center justify-center flex-shrink-0">
            <svg class="w-[22px] h-[22px]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
          </div>
          <div>
            <div class="font-[Montserrat] text-[22px] font-extrabold">{{ configs().length }}</div>
            <div class="text-[12px] text-[#6B7280] mt-0.5">Total</div>
          </div>
        </div>
        <div class="bg-white rounded-[10px] p-5 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] flex gap-4">
          <div class="w-11 h-11 rounded-[10px] bg-[#00A86B]/10 text-[#00A86B] flex items-center justify-center flex-shrink-0">
            <svg class="w-[22px] h-[22px]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div>
            <div class="font-[Montserrat] text-[22px] font-extrabold">{{ activeCount() }}</div>
            <div class="text-[12px] text-[#6B7280] mt-0.5">Vigentes</div>
          </div>
        </div>
        <div class="bg-white rounded-[10px] p-5 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] flex gap-4">
          <div class="w-11 h-11 rounded-[10px] bg-[#6B7280]/10 text-[#6B7280] flex items-center justify-center flex-shrink-0">
            <svg class="w-[22px] h-[22px]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div>
            <div class="font-[Montserrat] text-[22px] font-extrabold">{{ disabledCount() }}</div>
            <div class="text-[12px] text-[#6B7280] mt-0.5">Históricas</div>
          </div>
        </div>
      </div>

      <!-- Tabla -->
      <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
        <div class="px-5 py-4 border-b border-[#E0E0E0]">
          <h2 class="font-[Montserrat] text-[15px] font-bold text-[#1A1A2E]">Historial de configuraciones</h2>
        </div>

        @if (loading()) {
          <div class="p-8 text-center text-[#6B7280] text-[13px]">Cargando...</div>
        } @else if (configs().length === 0) {
          <div class="p-8 text-center text-[#6B7280] text-[13px]">Sin configuraciones registradas.</div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-[13px]">
              <thead>
                <tr class="border-b border-[#E0E0E0] bg-[#F9FAFB]">
                  <th class="px-5 py-3 text-left font-semibold text-[#374151]">#</th>
                  <th class="px-5 py-3 text-left font-semibold text-[#374151]">Corte 1</th>
                  <th class="px-5 py-3 text-left font-semibold text-[#374151]">Corte 2</th>
                  <th class="px-5 py-3 text-left font-semibold text-[#374151]">Estado</th>
                  <th class="px-5 py-3 text-left font-semibold text-[#374151]">Creada</th>
                  <th class="px-5 py-3 text-left font-semibold text-[#374151]">Acciones</th>
                </tr>
              </thead>
              <tbody>
                @for (cfg of paginated(); track cfg.id) {
                  <tr class="border-b border-[#F3F4F6] hover:bg-[#F9FAFB] transition-colors">
                    <td class="px-5 py-3 font-mono text-[#9CA3AF]">{{ cfg.id }}</td>
                    <td class="px-5 py-3 font-semibold text-[#1A1A2E]">Día {{ cfg.cutoff_day_1 }}</td>
                    <td class="px-5 py-3 font-semibold text-[#1A1A2E]">Día {{ cfg.cutoff_day_2 }}</td>
                    <td class="px-5 py-3">
                      @if (cfg.status === 'active') {
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#00A86B]/10 text-[#00A86B]">
                          <span class="w-1.5 h-1.5 rounded-full bg-[#00A86B]"></span>
                          Vigente
                        </span>
                      } @else {
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#6B7280]/10 text-[#6B7280]">
                          <span class="w-1.5 h-1.5 rounded-full bg-[#6B7280]"></span>
                          Histórica
                        </span>
                      }
                    </td>
                    <td class="px-5 py-3 text-[#6B7280]">{{ cfg.created_at | date:'dd/MM/yyyy' }}</td>
                    <td class="px-5 py-3">
                      <div class="flex items-center gap-2">
                        <button
                          (click)="openEdit(cfg)"
                          class="text-[11px] px-2.5 py-1 rounded bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB] transition-colors font-semibold border-0 cursor-pointer"
                        >Editar</button>

                        @if (cfg.status !== 'active') {
                          <button
                            (click)="onActivate(cfg)"
                            class="text-[11px] px-2.5 py-1 rounded bg-[#003399]/10 text-[#003399] hover:bg-[#003399]/20 transition-colors font-semibold border-0 cursor-pointer"
                          >Activar</button>

                          <button
                            (click)="onDelete(cfg)"
                            class="text-[11px] px-2.5 py-1 rounded bg-[#FEE2E2] text-[#E53935] hover:bg-[#FECACA] transition-colors font-semibold border-0 cursor-pointer"
                          >Eliminar</button>
                        }
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Paginación -->
          @if (totalPages() > 1) {
            <div class="px-5 py-3 border-t border-[#E0E0E0] flex items-center justify-between text-[13px] text-[#6B7280]">
              <span>Mostrando {{ rangeStart() }}–{{ rangeEnd() }} de {{ configs().length }}</span>
              <div class="flex gap-2">
                <button [disabled]="currentPage() === 1" (click)="goToPage(currentPage() - 1)"
                  class="px-3 py-1.5 rounded-lg border border-[#E0E0E0] bg-white hover:border-[#003399] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">‹ Anterior</button>
                <button [disabled]="currentPage() === totalPages()" (click)="goToPage(currentPage() + 1)"
                  class="px-3 py-1.5 rounded-lg border border-[#E0E0E0] bg-white hover:border-[#003399] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Siguiente ›</button>
              </div>
            </div>
          }
        }
      </div>

      <!-- Modal crear / editar -->
      @if (showModal()) {
        <div
          class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          (click)="closeModal()"
        >
          <div
            class="bg-white rounded-[14px] shadow-2xl w-full max-w-md"
            (click)="$event.stopPropagation()"
          >
            <div class="px-6 pt-6 pb-4 border-b border-[#E0E0E0]">
              <h3 class="font-[Montserrat] text-[17px] font-extrabold text-[#1A1A2E]">
                {{ editingId() ? 'Editar' : 'Nueva' }} configuración de corte
              </h3>
              @if (!editingId()) {
                <p class="text-[12px] text-[#6B7280] mt-1">
                  Al crear una nueva configuración, la actual quedará como histórica.
                </p>
              }
            </div>

            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="p-6 space-y-4">
              <div>
                <label class="block text-[12px] font-semibold text-[#374151] mb-1.5">
                  Primer día de corte <span class="text-[#6B7280] font-normal">(1 – 28)</span>
                </label>
                <input
                  formControlName="cutoff_day_1"
                  type="number" min="1" max="28"
                  class="w-full border border-[#D1D5DB] rounded-lg px-3 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#003399]/30 focus:border-[#003399]"
                  placeholder="Ej: 1"
                />
                @if (form.get('cutoff_day_1')?.invalid && form.get('cutoff_day_1')?.touched) {
                  <p class="text-[11px] text-[#E53935] mt-1">Ingresa un día válido entre 1 y 28.</p>
                }
              </div>

              <div>
                <label class="block text-[12px] font-semibold text-[#374151] mb-1.5">
                  Segundo día de corte <span class="text-[#6B7280] font-normal">(1 – 28, diferente al primero)</span>
                </label>
                <input
                  formControlName="cutoff_day_2"
                  type="number" min="1" max="28"
                  class="w-full border border-[#D1D5DB] rounded-lg px-3 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#003399]/30 focus:border-[#003399]"
                  placeholder="Ej: 15"
                />
                @if (form.get('cutoff_day_2')?.invalid && form.get('cutoff_day_2')?.touched) {
                  <p class="text-[11px] text-[#E53935] mt-1">Ingresa un día válido entre 1 y 28, diferente al primero.</p>
                }
              </div>

              @if (formError()) {
                <div class="bg-[#FEE2E2] text-[#E53935] rounded-lg px-4 py-3 text-[12px]">
                  {{ formError() }}
                </div>
              }

              <div class="flex gap-3 pt-2">
                <button
                  type="button"
                  (click)="closeModal()"
                  class="flex-1 py-2.5 rounded-lg border border-[#D1D5DB] text-[13px] font-semibold text-[#374151] hover:bg-[#F9FAFB] transition-colors cursor-pointer bg-white"
                >Cancelar</button>
                <button
                  type="submit"
                  [disabled]="form.invalid || saving()"
                  class="flex-1 py-2.5 rounded-lg bg-[#003399] text-white text-[13px] font-semibold hover:bg-[#002277] disabled:opacity-50 disabled:cursor-not-allowed transition-colors border-0 cursor-pointer"
                >
                  {{ saving() ? 'Guardando...' : (editingId() ? 'Actualizar' : 'Crear y activar') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
})
export class ExpirationDatesComponent implements OnInit {
  private svc = inject(ExpirationDateService);
  private fb  = inject(FormBuilder);

  configs   = signal<ExpirationDate[]>([]);
  loading   = signal(true);
  saving    = signal(false);
  showModal = signal(false);
  editingId = signal<number | null>(null);
  formError = signal<string | null>(null);

  // Paginación
  currentPage = signal(1);
  readonly pageSize = 10;
  totalPages  = computed(() => Math.max(1, Math.ceil(this.configs().length / this.pageSize)));
  paginated   = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.configs().slice(start, start + this.pageSize);
  });
  rangeStart  = computed(() => this.configs().length === 0 ? 0 : (this.currentPage() - 1) * this.pageSize + 1);
  rangeEnd    = computed(() => Math.min(this.currentPage() * this.pageSize, this.configs().length));

  active        = computed(() => this.configs().find(c => c.status === 'active') ?? null);
  activeCount   = computed(() => this.configs().filter(c => c.status === 'active').length);
  disabledCount = computed(() => this.configs().filter(c => c.status === 'disabled').length);

  form = this.fb.group({
    cutoff_day_1: [null as number | null, [Validators.required, Validators.min(1), Validators.max(28)]],
    cutoff_day_2: [null as number | null, [Validators.required, Validators.min(1), Validators.max(28)]],
  });

  ngOnInit(): void { this.load(); }

  goToPage(page: number) { this.currentPage.set(page); }

  private load(): void {
    this.loading.set(true);
    this.svc.getAll().subscribe({
      next: res => { this.configs.set(res.data); this.loading.set(false); },
      error: ()  => this.loading.set(false),
    });
  }

  openCreate(): void {
    this.editingId.set(null);
    this.form.reset();
    this.formError.set(null);
    this.showModal.set(true);
  }

  openEdit(cfg: ExpirationDate): void {
    this.editingId.set(cfg.id);
    this.form.setValue({ cutoff_day_1: cfg.cutoff_day_1, cutoff_day_2: cfg.cutoff_day_2 });
    this.formError.set(null);
    this.showModal.set(true);
  }

  closeModal(): void { this.showModal.set(false); }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    const v = this.form.value;
    if (v.cutoff_day_1 === v.cutoff_day_2) {
      this.formError.set('Los dos días de corte deben ser diferentes.');
      return;
    }

    const diff = Math.abs((v.cutoff_day_1 ?? 0) - (v.cutoff_day_2 ?? 0));
    if (diff !== 14) {
      this.formError.set(`Los días de corte deben tener exactamente 14 días de diferencia (diferencia actual: ${diff} días).`);
      return;
    }

    this.saving.set(true);
    this.formError.set(null);
    const body = this.form.value as ExpirationDateForm;
    const req$ = this.editingId()
      ? this.svc.update(this.editingId()!, body)
      : this.svc.create(body);

    req$.subscribe({
      next: () => { this.saving.set(false); this.closeModal(); this.load(); },
      error: err => {
        this.saving.set(false);
        this.formError.set(err?.error?.message ?? 'Ocurrió un error. Intenta de nuevo.');
      },
    });
  }

  onActivate(cfg: ExpirationDate): void {
    if (!confirm(`¿Activar la configuración "Día ${cfg.cutoff_day_1} / Día ${cfg.cutoff_day_2}" como vigente?`)) return;
    this.svc.activate(cfg.id).subscribe({
      next: () => this.load(),
      error: err => alert(err?.error?.message ?? 'No se pudo activar.'),
    });
  }

  onDelete(cfg: ExpirationDate): void {
    if (!confirm('¿Eliminar esta configuración histórica? Esta acción no se puede deshacer.')) return;
    this.svc.remove(cfg.id).subscribe({
      next: () => this.load(),
      error: err => alert(err?.error?.message ?? 'No se pudo eliminar.'),
    });
  }
}