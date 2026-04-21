import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { passwordMatchValidator, noInjectionValidator, strongPasswordValidator, getErrorMessage } from '../../../core/validators/form-validators';
import { Distributor, DistributorForm, DistributorCategory } from '../../../core/models';
import { DistributorService } from '../../../core/services/distributor.service';
import { PaginationControlsComponent } from '../../../shared/components/pagination-controls.component';

@Component({
  selector: 'app-distributors',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, PaginationControlsComponent],
  template: `
    <div>
      <div class="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 class="font-[Montserrat] text-[22px] font-extrabold text-[#1A1A2E]">Distribuidoras</h1>
          <p class="text-[13px] text-[#6B7280] mt-0.5">Registro y gestión de distribuidoras</p>
        </div>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div class="bg-white rounded-[10px] p-5 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] flex gap-4">
          <div class="w-11 h-11 rounded-[10px] bg-[#003399]/10 text-[#003399] flex items-center justify-center flex-shrink-0">
            <svg class="w-[22px] h-[22px]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          </div>
          <div>
            <div class="font-[Montserrat] text-[22px] font-extrabold">{{ totalCount() }}</div>
            <div class="text-[12px] text-[#6B7280] mt-0.5">Total</div>
          </div>
        </div>
        <div class="bg-white rounded-[10px] p-5 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] flex gap-4">
          <div class="w-11 h-11 rounded-[10px] bg-[#00A86B]/10 text-[#00A86B] flex items-center justify-center flex-shrink-0">
            <svg class="w-[22px] h-[22px]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <div>
            <div class="font-[Montserrat] text-[22px] font-extrabold">{{ activeCount() }}</div>
            <div class="text-[12px] text-[#6B7280] mt-0.5">Activas</div>
          </div>
        </div>
        <div class="bg-white rounded-[10px] p-5 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] flex gap-4">
          <div class="w-11 h-11 rounded-[10px] bg-[#E53935]/10 text-[#E53935] flex items-center justify-center flex-shrink-0">
            <svg class="w-[22px] h-[22px]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>
          </div>
          <div>
            <div class="font-[Montserrat] text-[22px] font-extrabold">{{ inactiveCount() }}</div>
            <div class="text-[12px] text-[#6B7280] mt-0.5">Inactivas</div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
        <div class="px-5 py-4 border-b border-[#E0E0E0] flex items-center justify-between gap-3">
          <span class="font-[Montserrat] font-bold text-[14px] text-[#1A1A2E]">Lista de distribuidoras</span>
          <input type="search" placeholder="Buscar..." (input)="search($event)"
            class="border border-[#E0E0E0] rounded-lg px-3 py-1.5 text-[13px] outline-none focus:border-[#003399] w-56 transition-colors"
            aria-label="Buscar distribuidora"
          />
        </div>

        @if (loading()) {
          <div class="flex items-center justify-center py-16 text-[#6B7280] text-[13px]">
            <svg class="w-5 h-5 animate-spin mr-2 text-[#003399]" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            Cargando...
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
                @for (item of items(); track item.id) {
                  <tr class="border-b border-[#F0F0F0] hover:bg-[#F8FAFD] transition-colors">
                    <td class="px-5 py-3 font-semibold text-[#1A1A2E]">{{ fullName(item) }}</td>
                    <td class="px-5 py-3 text-[#6B7280]">
                      <div class="flex flex-col gap-1">
                        <span>{{ item.user?.email || '—' }}</span>
                        @if (!item.user) {
                          <span class="inline-flex w-fit items-center rounded-full border border-[#FF8800]/20 bg-[#FF8800]/10 px-2 py-0.5 text-[10px] font-semibold text-[#FF8800]">
                            Sin cuenta
                          </span>
                        }
                      </div>
                    </td>
                    <td class="px-5 py-3 text-[#6B7280]">{{ item.personData?.curp || '—' }}</td>
                    <td class="px-5 py-3 text-[#6B7280]">{{ item.points }}</td>
                    <td class="px-5 py-3 text-[#6B7280]">
                      @if (item.category) {
                        {{ item.category.name }} · {{ formatPercentage(item.category.percentage) }}
                      } @else {
                        —
                      }
                    </td>
                    <td class="px-5 py-3 text-[#6B7280]">{{ formatMoney(item.credit?.credit_limit) }}</td>
                    <td class="px-5 py-3">
                      <span
                        [class]="statusBadgeClass(item)"
                        class="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border"
                      >
                        {{ statusBadgeLabel(item) }}
                      </span>
                    </td>
                    <td class="px-5 py-3">
                      <div class="flex items-center gap-1">
                        @if (!item.user) {
                          <button (click)="openAccountModal(item)"
                            class="p-1.5 rounded-lg text-[#FF8800] hover:bg-[#FF8800]/10 transition-colors border-0 cursor-pointer bg-transparent"
                            aria-label="Crear cuenta" title="Crear cuenta"
                          >
                            <svg class="w-[15px] h-[15px]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2m14-10l2 2 4-4m-6 0a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                          </button>
                        }
                        <button (click)="openEdit(item)"
                          class="p-1.5 rounded-lg text-[#003399] hover:bg-[#003399]/10 transition-colors border-0 cursor-pointer bg-transparent"
                          aria-label="Editar" title="Editar"
                        >
                          <svg class="w-[15px] h-[15px]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="8" class="px-5 py-12 text-center text-[#6B7280] text-[13px]">No se encontraron distribuidoras.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
          <app-pagination-controls
            [currentPage]="currentPage()"
            [totalPages]="totalPages()"
            [totalItems]="pagination().total"
            [rangeStart]="rangeStart()"
            [rangeEnd]="rangeEnd()"
            (pageChange)="goToPage($event)"
          />
      </div>
    </div>

    @if (showModal()) {
      <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        role="dialog" aria-modal="true"
        [attr.aria-label]="editingId() ? 'Editar distribuidora' : 'Nueva distribuidora'"
        (click)="closeModal()"
      >
        <div class="bg-white rounded-[10px] w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto"
          (click)="$event.stopPropagation()"
        >
          <div class="px-5 py-4 border-b border-[#E0E0E0] flex items-center justify-between sticky top-0 bg-white z-10">
            <span class="font-[Montserrat] font-bold text-[15px]">
              Editar distribuidora
            </span>
            <button (click)="closeModal()" class="text-[#6B7280] hover:text-[#1A1A2E] bg-transparent border-0 cursor-pointer" aria-label="Cerrar">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <form [formGroup]="form" (ngSubmit)="submit()" class="p-5 flex flex-col gap-5">
            @if (errorMsg()) {
              <div class="bg-[#E53935]/10 text-[#E53935] text-[13px] px-3 py-2 rounded-lg border border-[#E53935]/20" role="alert">{{ errorMsg() }}</div>
            }
            @if (fieldErrors().length) {
              <ul class="bg-[#E53935]/10 text-[#E53935] text-[12px] px-3 py-2 rounded-lg border border-[#E53935]/20 list-disc list-inside" role="alert">
                @for (msg of fieldErrors(); track msg) {
                  <li>{{ msg }}</li>
                }
              </ul>
            }

            <section>
              <p class="text-[12px] font-bold text-[#003399] uppercase tracking-wide mb-3">Datos de distribuidora</p>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div class="flex flex-col gap-1">
                  <label class="text-[12px] font-semibold text-[#1A1A2E]" for="d-category">Categoría *</label>
                  <select id="d-category" formControlName="category_id"
                    class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] transition-colors bg-white"
                    [class.border-[#E53935]]="isInvalid('category_id')"
                  >
                    <option [ngValue]="null">-- Seleccionar --</option>
                    @for (cat of categoryOptions(); track cat.id) {
                      <option [ngValue]="cat.id">{{ cat.name }} · {{ formatPercentage(cat.percentage) }}</option>
                    }
                  </select>
                  @if (isInvalid('category_id')) { <span class="text-[11px] text-[#E53935]">Selecciona una categoría.</span> }
                </div>
                <div class="flex flex-col gap-1">
                  <label class="text-[12px] font-semibold text-[#1A1A2E]" for="d-credit">Límite de crédito *</label>
                  <input id="d-credit" formControlName="credit_limit" type="number" min="0" step="0.01" placeholder="0"
                    class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] transition-colors"
                    [class.border-[#E53935]]="isInvalid('credit_limit')"
                  />
                  @if (isInvalid('credit_limit')) { <span class="text-[11px] text-[#E53935]">{{ errMsg('credit_limit', 'Límite de crédito') }}</span> }
                </div>
              </div>
            </section>

            <section>
              <p class="text-[12px] font-bold text-[#003399] uppercase tracking-wide mb-3">Buro de crédito</p>
              <div class="flex flex-col gap-2">
                <label class="text-[12px] font-semibold text-[#1A1A2E]" for="d-bureau">Resultado</label>
                <select id="d-bureau" formControlName="credit_bureau_hit"
                  class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] transition-colors bg-white"
                >
                  <option [ngValue]="null">-- Mantener sin cambio --</option>
                  <option [ngValue]="true">Sí, está en buro</option>
                  <option [ngValue]="false">No, no está en buro</option>
                </select>
              </div>
            </section>

            <section>
              <p class="text-[12px] font-bold text-[#003399] uppercase tracking-wide mb-3">Datos personales (solo lectura)</p>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div class="flex flex-col gap-1">
                  <label class="text-[12px] font-semibold text-[#1A1A2E]" for="p-name">Nombre completo</label>
                  <input id="p-name" type="text" disabled
                    [value]="selectedDistributor() ? fullName(selectedDistributor()!) : ''"
                    class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] bg-[#F8FAFD] text-[#6B7280]"
                  />
                </div>
                <div class="flex flex-col gap-1">
                  <label class="text-[12px] font-semibold text-[#1A1A2E]" for="p-curp">CURP</label>
                  <input id="p-curp" type="text" disabled
                    [value]="selectedDistributor()?.personData?.curp || ''"
                    class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] bg-[#F8FAFD] text-[#6B7280]"
                  />
                </div>
                <div class="flex flex-col gap-1">
                  <label class="text-[12px] font-semibold text-[#1A1A2E]" for="p-rfc">RFC</label>
                  <input id="p-rfc" type="text" disabled
                    [value]="selectedDistributor()?.personData?.rfc || ''"
                    class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] bg-[#F8FAFD] text-[#6B7280]"
                  />
                </div>
                <div class="flex flex-col gap-1">
                  <label class="text-[12px] font-semibold text-[#1A1A2E]" for="p-points">Puntos</label>
                  <input id="p-points" type="text" disabled
                    [value]="selectedDistributor()?.points ?? 0"
                    class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] bg-[#F8FAFD] text-[#6B7280]"
                  />
                </div>
              </div>
            </section>

            <div class="flex justify-end gap-2 pt-1">
              <button type="button" (click)="closeModal()"
                class="px-4 py-2 rounded-lg text-[13px] font-semibold bg-white text-[#003399] border border-[#E0E0E0] hover:border-[#003399] transition-colors cursor-pointer"
              >Cancelar</button>
              <button type="submit" [disabled]="saving()"
                class="px-4 py-2 rounded-lg text-[13px] font-semibold bg-[#003399] text-white hover:bg-[#002277] transition-colors border-0 cursor-pointer disabled:opacity-60"
              >
                @if (saving()) { Guardando... } @else { Guardar }
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    @if (showAccountModal()) {
      <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        role="dialog" aria-modal="true"
        aria-label="Crear cuenta de distribuidora"
        (click)="closeAccountModal()"
      >
        <div class="bg-white rounded-[10px] w-full max-w-xl shadow-xl max-h-[90vh] overflow-y-auto"
          (click)="$event.stopPropagation()"
        >
          <div class="px-5 py-4 border-b border-[#E0E0E0] flex items-center justify-between sticky top-0 bg-white z-10">
            <span class="font-[Montserrat] font-bold text-[15px]">Crear cuenta</span>
            <button (click)="closeAccountModal()" class="text-[#6B7280] hover:text-[#1A1A2E] bg-transparent border-0 cursor-pointer" aria-label="Cerrar">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <form [formGroup]="accountForm" (ngSubmit)="submitAccount()" class="p-5 flex flex-col gap-5">
            @if (accountErrorMsg()) {
              <div class="bg-[#E53935]/10 text-[#E53935] text-[13px] px-3 py-2 rounded-lg border border-[#E53935]/20" role="alert">{{ accountErrorMsg() }}</div>
            }
            @if (accountFieldErrors().length) {
              <ul class="bg-[#E53935]/10 text-[#E53935] text-[12px] px-3 py-2 rounded-lg border border-[#E53935]/20 list-disc list-inside" role="alert">
                @for (msg of accountFieldErrors(); track msg) {
                  <li>{{ msg }}</li>
                }
              </ul>
            }

            <section>
              <p class="text-[12px] font-bold text-[#003399] uppercase tracking-wide mb-3">Cuenta de acceso</p>
              <p class="text-[12px] text-[#6B7280] mb-3">Se creará la cuenta para {{ selectedDistributor() ? fullName(selectedDistributor()!) : 'la distribuidora seleccionada' }}.</p>
              <div class="grid grid-cols-1 gap-3">
                <div class="flex flex-col gap-1">
                  <label class="text-[12px] font-semibold text-[#1A1A2E]" for="acc-email">Correo electrónico *</label>
                  <input id="acc-email" formControlName="email" type="email" placeholder="correo@ejemplo.com"
                    class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] transition-colors"
                    [class.border-[#E53935]]="isAccountInvalid('email')"
                  />
                  @if (isAccountInvalid('email')) { <span class="text-[11px] text-[#E53935]">{{ errAccountMsg('email', 'Correo electrónico') }}</span> }
                </div>
                <div class="flex flex-col gap-1">
                  <label class="text-[12px] font-semibold text-[#1A1A2E]" for="acc-pwd">Contraseña *</label>
                  <input id="acc-pwd" formControlName="password" type="password" placeholder="Mínimo 8 caracteres"
                    class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] transition-colors"
                    [class.border-[#E53935]]="isAccountInvalid('password')"
                    autocomplete="new-password"
                  />
                  @if (isAccountInvalid('password')) { <span class="text-[11px] text-[#E53935]">{{ errAccountMsg('password', 'Contraseña') }}</span> }
                </div>
                <div class="flex flex-col gap-1">
                  <label class="text-[12px] font-semibold text-[#1A1A2E]" for="acc-pwdc">Confirmar contraseña *</label>
                  <input id="acc-pwdc" formControlName="password_confirmation" type="password" placeholder="Repetir contraseña"
                    class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] transition-colors"
                    [class.border-[#E53935]]="isAccountInvalid('password_confirmation') || accountPwdMismatch"
                    autocomplete="new-password"
                  />
                  @if (isAccountInvalid('password_confirmation') || accountPwdMismatch) {
                    <span class="text-[11px] text-[#E53935]">{{ accountPwdMismatch ? 'Las contraseñas no coinciden.' : errAccountMsg('password_confirmation', 'Confirmación') }}</span>
                  }
                </div>
              </div>
            </section>

            <div class="flex justify-end gap-2 pt-1">
              <button type="button" (click)="closeAccountModal()"
                class="px-4 py-2 rounded-lg text-[13px] font-semibold bg-white text-[#003399] border border-[#E0E0E0] hover:border-[#003399] transition-colors cursor-pointer"
              >Cancelar</button>
              <button type="submit" [disabled]="savingAccount()"
                class="px-4 py-2 rounded-lg text-[13px] font-semibold bg-[#FF8800] text-white hover:bg-[#E67A00] transition-colors border-0 cursor-pointer disabled:opacity-60"
              >
                @if (savingAccount()) { Guardando... } @else { Crear cuenta }
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
})
export class DistributorsComponent implements OnInit {
  private svc = inject(DistributorService);
  private fb = inject(FormBuilder);

  items = signal<Distributor[]>([]);
  loading = signal(true);
  showModal = signal(false);
  showAccountModal = signal(false);
  saving = signal(false);
  savingAccount = signal(false);
  editingId = signal<number | null>(null);
  selectedDistributor = signal<Distributor | null>(null);
  errorMsg = signal('');
  accountErrorMsg = signal('');
  fieldErrors = signal<string[]>([]);
  accountFieldErrors = signal<string[]>([]);
  categories = signal<DistributorCategory[]>([]);
  query = signal('');
  pagination = signal({ current_page: 1, last_page: 1, per_page: 15, total: 0, from: 0, to: 0 });

  headers = ['Nombre', 'Correo', 'CURP', 'Puntos', 'Categoría', 'Crédito', 'Estado', 'Acciones'];

  totalCount    = computed(() => this.pagination().total || this.items().length);
  activeCount   = computed(() => this.items().filter(item => item.status).length);
  inactiveCount = computed(() => this.items().filter(item => !item.status).length);
  currentPage   = signal(1);
  pageSize      = signal(10);

  totalPages = computed(() => Math.max(1, this.pagination().last_page || Math.ceil(this.pagination().total / this.pageSize())));
  rangeStart = computed(() => this.pagination().from);
  rangeEnd   = computed(() => this.pagination().to);

  goToPage(page: number) {
    this.currentPage.set(Math.max(1, Math.min(page, this.totalPages())));
    this.load();
  }
  categoryOptions = computed<DistributorCategory[]>(() => {
    if (this.categories().length) {
      return [...this.categories()].sort((a, b) => a.name.localeCompare(b.name));
    }

    const map = new Map<number, DistributorCategory>();
    this.items().forEach(item => {
      const cat = item.category;
      if (cat?.id) {
        map.set(cat.id, cat);
      }
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  });

  form = this.fb.group({
    category_id: [null as number | null, [Validators.required]],
    credit_limit: [0, [Validators.required, Validators.min(0)]],
    credit_bureau_hit: [null as boolean | null],
  });

  accountForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, strongPasswordValidator()]],
    password_confirmation: ['', [Validators.required]],
  }, { validators: passwordMatchValidator() });

  ngOnInit() {
    this.load();
    this.loadCategories();
  }

  private load() {
    this.loading.set(true);
    this.svc.getAll(undefined, undefined, this.query() || undefined, this.currentPage(), this.pageSize()).subscribe({
      next: res => {
        const data = res.data?.data ?? res.data ?? [];
        this.items.set(data);
        this.pagination.set(res.pagination ?? { current_page: this.currentPage(), last_page: 1, per_page: this.pageSize(), total: data.length, from: data.length ? 1 : 0, to: data.length });
        this.currentPage.set(this.pagination().current_page);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private loadCategories() {
    this.svc.getCategories().subscribe({
      next: res => {
        const data = res.data ?? [];
        this.categories.set(Array.isArray(data) ? data : []);
      },
      error: () => this.categories.set([]),
    });
  }

  search(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.query.set(value);
    this.currentPage.set(1);
    this.load();
  }

  openEdit(item: Distributor) {
    this.editingId.set(item.id);
    this.selectedDistributor.set(item);
    this.form.reset({
      category_id: item.category?.id ?? null,
      credit_limit: Number(item.credit?.credit_limit ?? 0),
      credit_bureau_hit: item.creditBureauHit ?? null,
    });
    this.errorMsg.set('');
    this.fieldErrors.set([]);
    this.showModal.set(true);
  }

  openAccountModal(item: Distributor) {
    this.selectedDistributor.set(item);
    this.accountForm.reset({
      email: '',
      password: '',
      password_confirmation: '',
    });
    this.accountErrorMsg.set('');
    this.accountFieldErrors.set([]);
    this.showAccountModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.selectedDistributor.set(null);
    this.fieldErrors.set([]);
  }

  closeAccountModal() {
    this.showAccountModal.set(false);
    this.selectedDistributor.set(null);
    this.accountFieldErrors.set([]);
  }

  isInvalid(field: string) {
    const control = this.form.get(field);
    return control?.invalid && control?.touched;
  }

  isAccountInvalid(field: string) {
    const control = this.accountForm.get(field);
    return control?.invalid && control?.touched;
  }

  get accountPwdMismatch() { return this.accountForm.hasError('passwordMismatch') && this.accountForm.get('password_confirmation')?.touched; }
  errMsg(f: string, label = '')        { return getErrorMessage(this.form.get(f), label); }
  errAccountMsg(f: string, label = '') { return getErrorMessage(this.accountForm.get(f), label); }

  submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.errorMsg.set('Revisa los campos obligatorios.');
      this.fieldErrors.set(this.collectFormErrors());
      return;
    }

    const formValue = this.form.getRawValue();

    this.saving.set(true);
    this.errorMsg.set('');
    this.fieldErrors.set([]);

    const payload = this.buildPayload(formValue);
    const id = this.editingId();
    if (!id) {
      this.saving.set(false);
      this.errorMsg.set('No se pudo identificar la distribuidora.');
      return;
    }

    this.svc.update(id, payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.closeModal();
        this.load();
      },
      error: err => {
        this.saving.set(false);
        this.errorMsg.set(err?.error?.message ?? 'Error al guardar.');
        const errors = err?.error?.errors ?? null;
        if (errors && typeof errors === 'object') {
          const messages = Object.values(errors)
            .flat()
            .filter((msg): msg is string => typeof msg === 'string');
          this.fieldErrors.set(messages);
        }
      },
    });
  }

  submitAccount() {
    this.accountForm.markAllAsTouched();
    if (this.accountForm.invalid) {
      this.accountErrorMsg.set('Revisa los campos obligatorios.');
      this.accountFieldErrors.set(this.collectAccountFormErrors());
      return;
    }

    const formValue = this.accountForm.getRawValue();
    if (formValue.password !== formValue.password_confirmation) {
      this.accountErrorMsg.set('Las contraseñas no coinciden.');
      return;
    }

    const distributor = this.selectedDistributor();
    if (!distributor) {
      this.accountErrorMsg.set('No se pudo identificar la distribuidora.');
      return;
    }

    this.savingAccount.set(true);
    this.accountErrorMsg.set('');
    this.accountFieldErrors.set([]);

    this.svc.createAccount(distributor.id, {
      email: formValue.email ?? '',
      password: formValue.password ?? '',
      password_confirmation: formValue.password_confirmation ?? '',
    }).subscribe({
      next: () => {
        this.savingAccount.set(false);
        this.closeAccountModal();
        this.load();
      },
      error: err => {
        this.savingAccount.set(false);
        this.accountErrorMsg.set(err?.error?.message ?? 'Error al crear la cuenta.');
        const errors = err?.error?.errors ?? null;
        if (errors && typeof errors === 'object') {
          const messages = Object.values(errors)
            .flat()
            .filter((msg): msg is string => typeof msg === 'string');
          this.accountFieldErrors.set(messages);
        }
      },
    });
  }

  private buildPayload(value: any): Partial<DistributorForm> {
    const payload: Partial<DistributorForm> = {
      category_id: Number(value.category_id),
      credit_limit: Number(value.credit_limit ?? 0),
    };

    if (value.credit_bureau_hit !== null && value.credit_bureau_hit !== undefined) {
      payload.credit_bureau_hit = value.credit_bureau_hit;
    }

    return payload;
  }

  fullName(item: Distributor) {
    return [item.personData?.name, item.personData?.first_last_name, item.personData?.second_last_name].filter(Boolean).join(' ');
  }

  statusBadgeLabel(item: Distributor) {
    if (item.creditBureauHit === true) {
      return 'Desactivada por buro';
    }

    return item.status ? 'Activa' : 'Inactiva';
  }

  statusBadgeClass(item: Distributor) {
    if (item.creditBureauHit === true) {
      return 'bg-[#E53935]/10 text-[#E53935] border-[#E53935]/20';
    }

    return item.status
      ? 'bg-[#00A86B]/10 text-[#00A86B] border-[#00A86B]/20'
      : 'bg-[#E53935]/10 text-[#E53935] border-[#E53935]/20';
  }

  formatMoney(value?: string | number | null) {
    if (value === null || value === undefined || value === '') {
      return '—';
    }

    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(value));
  }

  formatPercentage(value?: string | number | null) {
    if (value === null || value === undefined || value === '') {
      return '—';
    }

    return `${Number(value)}%`;
  }

  private collectFormErrors() {
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
        this.buildMessages(path, control.errors).forEach(msg => messages.add(msg));
      }
    };

    walk(this.form, '');
    return Array.from(messages);
  }

  private buildMessages(path: string, errors: Record<string, any>) {
    const label = this.fieldLabel(path);
    return Object.keys(errors).map(key => {
      switch (key) {
        case 'required':
          return `${label} es obligatorio.`;
        case 'email':
          return `${label} tiene un formato inválido.`;
        case 'minlength':
          return `${label} debe tener al menos ${errors['minlength'].requiredLength} caracteres.`;
        case 'min':
          return `${label} debe ser mayor o igual a ${errors['min'].min}.`;
        default:
          return `${label} es inválido.`;
      }
    });
  }

  private fieldLabel(path: string) {
    const labels: Record<string, string> = {
      category_id: 'La categoría',
      credit_limit: 'El límite de crédito',
      credit_bureau_hit: 'El buro de crédito',
    };

    return (labels[path] ?? path) || 'El campo';
  }

  private collectAccountFormErrors() {
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
        this.buildAccountMessages(path, control.errors).forEach(msg => messages.add(msg));
      }
    };

    walk(this.accountForm, '');
    return Array.from(messages);
  }

  private buildAccountMessages(path: string, errors: Record<string, any>) {
    const label = this.accountFieldLabel(path);
    return Object.keys(errors).map(key => {
      switch (key) {
        case 'required':
          return `${label} es obligatorio.`;
        case 'email':
          return `${label} tiene un formato inválido.`;
        case 'minlength':
          return `${label} debe tener al menos ${errors['minlength'].requiredLength} caracteres.`;
        default:
          return `${label} es inválido.`;
      }
    });
  }

  private accountFieldLabel(path: string) {
    const labels: Record<string, string> = {
      email: 'El correo electrónico',
      password: 'La contraseña',
      password_confirmation: 'La confirmación de contraseña',
    };

    return (labels[path] ?? path) || 'El campo';
  }
}