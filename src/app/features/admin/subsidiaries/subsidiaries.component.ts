import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { phoneValidator, postalCodeValidator, getErrorMessage } from '../../../core/validators/form-validators';
import { Subsidiary } from '../../../core/models';
import { SubsidiaryService } from '../../../core/services/subsidiary.service';

@Component({
  selector: 'app-subsidiaries',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <div>
      <!-- Header -->
      <div class="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 class="font-[Montserrat] text-[22px] font-extrabold text-[#1A1A2E]">Sucursales</h1>
          <p class="text-[13px] text-[#6B7280] mt-0.5">Alta, edición y baja de sucursales de la empresa</p>
        </div>
        <button
          (click)="openCreate()"
          class="inline-flex items-center gap-1.5 px-[18px] py-[9px] rounded-lg text-[13px] font-semibold bg-[#003399] text-white hover:bg-[#002277] transition-colors border-0 cursor-pointer flex-shrink-0"
        >
          <svg class="w-[15px] h-[15px]" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
          </svg>
          Nueva sucursal
        </button>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 gap-4 mb-6">
        <div class="bg-white rounded-[10px] p-5 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] flex gap-4">
          <div class="w-11 h-11 rounded-[10px] bg-[#003399]/10 text-[#003399] flex items-center justify-center flex-shrink-0">
            <svg class="w-[22px] h-[22px]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
          </div>
          <div>
            <div class="font-[Montserrat] text-[22px] font-extrabold">{{ subsidiaries().length }}</div>
            <div class="text-[12px] text-[#6B7280] mt-0.5">Total de sucursales</div>
          </div>
        </div>
        <div class="bg-white rounded-[10px] p-5 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] flex gap-4">
          <div class="w-11 h-11 rounded-[10px] bg-[#FF8800]/12 text-[#FF8800] flex items-center justify-center flex-shrink-0">
            <svg class="w-[22px] h-[22px]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          </div>
          <div>
            <div class="font-[Montserrat] text-[22px] font-extrabold">—</div>
            <div class="text-[12px] text-[#6B7280] mt-0.5">Usuarios asignados</div>
          </div>
        </div>
      </div>

      <!-- Table card -->
      <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
        <div class="px-5 py-4 border-b border-[#E0E0E0] flex items-center justify-between gap-3">
          <span class="font-[Montserrat] font-bold text-[14px] text-[#1A1A2E]">Lista de sucursales</span>
          <input
            type="search"
            placeholder="Buscar sucursal…"
            (input)="search($event)"
            class="border border-[#E0E0E0] rounded-lg px-3 py-1.5 text-[13px] outline-none focus:border-[#003399] w-52 transition-colors"
            aria-label="Buscar sucursal"
          />
        </div>

        @if (loading()) {
          <div class="flex items-center justify-center py-16 text-[#6B7280] text-[13px]">
            <svg class="w-5 h-5 animate-spin mr-2 text-[#003399]" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            Cargando sucursales…
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
                @for (s of paginated(); track s.id) {
                  <tr class="border-b border-[#F0F0F0] hover:bg-[#F8FAFD] transition-colors">
                    <td class="px-5 py-3 font-semibold text-[#1A1A2E]">{{ s.name }}</td>
                    <td class="px-5 py-3 text-[#1A1A2E]">{{ s.phone || '—' }}</td>
                    <td class="px-5 py-3 text-[#6B7280]">{{ formatAddress(s) }}</td>
                    <td class="px-5 py-3">
                      <div class="flex items-center gap-1">
                        <button
                          (click)="openEdit(s)"
                          class="p-1.5 rounded-lg text-[#003399] hover:bg-[#003399]/10 transition-colors border-0 cursor-pointer bg-transparent"
                          aria-label="Editar sucursal"
                          title="Editar"
                        >
                          <svg class="w-[15px] h-[15px]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                        </button>
                        <button
                          (click)="remove(s)"
                          class="p-1.5 rounded-lg text-[#E53935] hover:bg-[#E53935]/10 transition-colors border-0 cursor-pointer bg-transparent"
                          aria-label="Eliminar sucursal"
                          title="Eliminar"
                        >
                          <svg class="w-[15px] h-[15px]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="4" class="px-5 py-12 text-center text-[#6B7280] text-[13px]">
                      No se encontraron sucursales.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          @if (totalPages() > 1 || filtered().length > pageSize()) {
            <div class="px-5 py-3 border-t border-[#E0E0E0] flex items-center justify-between gap-3 flex-wrap">
              <span class="text-[12px] text-[#6B7280]">
                Mostrando {{ rangeStart() }}–{{ rangeEnd() }} de {{ filtered().length }} registros
              </span>
              <div class="flex items-center gap-1">
                <button (click)="goToPage(1)" [disabled]="currentPage() === 1"
                  class="w-8 h-8 flex items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#F0F4FF] hover:text-[#003399] disabled:opacity-30 disabled:cursor-not-allowed border-0 bg-transparent cursor-pointer transition-colors"
                  aria-label="Primera página" title="Primera página">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11 19l-7-7 7-7M18 19l-7-7 7-7"/></svg>
                </button>
                <button (click)="goToPage(currentPage() - 1)" [disabled]="currentPage() === 1"
                  class="w-8 h-8 flex items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#F0F4FF] hover:text-[#003399] disabled:opacity-30 disabled:cursor-not-allowed border-0 bg-transparent cursor-pointer transition-colors"
                  aria-label="Página anterior" title="Anterior">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
                </button>
                @for (page of visiblePages(); track page) {
                  @if (page === -1) {
                    <span class="w-8 h-8 flex items-center justify-center text-[12px] text-[#6B7280]">…</span>
                  } @else {
                    <button (click)="goToPage(page)"
                      [class]="page === currentPage() ? 'bg-[#003399] text-white shadow-sm' : 'text-[#6B7280] hover:bg-[#F0F4FF] hover:text-[#003399]'"
                      class="w-8 h-8 flex items-center justify-center rounded-lg text-[12px] font-semibold border-0 cursor-pointer transition-colors"
                      [attr.aria-current]="page === currentPage() ? 'page' : null">
                      {{ page }}
                    </button>
                  }
                }
                <button (click)="goToPage(currentPage() + 1)" [disabled]="currentPage() === totalPages()"
                  class="w-8 h-8 flex items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#F0F4FF] hover:text-[#003399] disabled:opacity-30 disabled:cursor-not-allowed border-0 bg-transparent cursor-pointer transition-colors"
                  aria-label="Página siguiente" title="Siguiente">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
                </button>
                <button (click)="goToPage(totalPages())" [disabled]="currentPage() === totalPages()"
                  class="w-8 h-8 flex items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#F0F4FF] hover:text-[#003399] disabled:opacity-30 disabled:cursor-not-allowed border-0 bg-transparent cursor-pointer transition-colors"
                  aria-label="Última página" title="Última página">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 5l7 7-7 7M6 5l7 7-7 7"/></svg>
                </button>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-[12px] text-[#6B7280]">Filas:</span>
                <select class="border border-[#E0E0E0] rounded-lg px-2 py-1 text-[12px] outline-none focus:border-[#003399] bg-white transition-colors cursor-pointer"
                  [value]="pageSize()" (change)="changePageSize($event)" aria-label="Filas por página">
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

    <!-- ── MODAL ── -->
    @if (showModal()) {
      <div
        class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        role="dialog" aria-modal="true"
        [attr.aria-label]="editingId() ? 'Editar sucursal' : 'Nueva sucursal'"
        (click)="closeModal()"
      >
        <div
          class="bg-white rounded-[10px] w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto"
          (click)="$event.stopPropagation()"
        >
          <div class="px-5 py-4 border-b border-[#E0E0E0] flex items-center justify-between sticky top-0 bg-white z-10">
            <span class="font-[Montserrat] font-bold text-[15px]">
              {{ editingId() ? 'Editar sucursal' : 'Nueva sucursal' }}
            </span>
            <button (click)="closeModal()" class="text-[#6B7280] hover:text-[#1A1A2E] bg-transparent border-0 cursor-pointer" aria-label="Cerrar modal">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <form [formGroup]="form" (ngSubmit)="submit()" class="p-5 flex flex-col gap-4">
            @if (errorMsg()) {
              <div class="bg-[#E53935]/10 text-[#E53935] text-[13px] px-3 py-2 rounded-lg border border-[#E53935]/20" role="alert">{{ errorMsg() }}</div>
            }

            <p class="text-[12px] font-bold text-[#003399] uppercase tracking-wide">Datos generales</p>

            <div class="grid grid-cols-2 gap-3">
              <div class="flex flex-col gap-1 col-span-2 md:col-span-1">
                <label class="text-[12px] font-semibold text-[#1A1A2E]" for="s-name">Nombre *</label>
                <input id="s-name" formControlName="name" type="text" placeholder="Sucursal Centro"
                  class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] transition-colors"
                  [class.border-[#E53935]]="isInvalid('name')"
                />
                @if (isInvalid('name')) { <span class="text-[11px] text-[#E53935]">{{ errMsg('name', 'Nombre') }}</span> }
              </div>
              <div class="flex flex-col gap-1 col-span-2 md:col-span-1">
                <label class="text-[12px] font-semibold text-[#1A1A2E]" for="s-phone">Teléfono</label>
                <input id="s-phone" formControlName="phone" type="tel" placeholder="10 dígitos"
                  class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] transition-colors"
                  [class.border-[#E53935]]="isInvalid('phone')"
                />
                @if (isInvalid('phone')) { <span class="text-[11px] text-[#E53935]">{{ errMsg('phone', 'Teléfono') }}</span> }
              </div>
            </div>

            <p class="text-[12px] font-bold text-[#003399] uppercase tracking-wide mt-1">Dirección</p>

            <div formGroupName="address" class="flex flex-col gap-3">
              <div class="grid grid-cols-3 gap-3">
                <div class="flex flex-col gap-1 col-span-2">
                  <label class="text-[12px] font-semibold text-[#1A1A2E]" for="s-street">Calle *</label>
                  <input id="s-street" formControlName="street" type="text" placeholder="Av. Constitución"
                    class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] transition-colors"
                    [class.border-[#E53935]]="isAddrInvalid('street')"
                  />
                  @if (isAddrInvalid('street')) { <span class="text-[11px] text-[#E53935]">{{ errAddrMsg('street', 'Calle') }}</span> }
                </div>
                <div class="flex flex-col gap-1">
                  <label class="text-[12px] font-semibold text-[#1A1A2E]" for="s-ext">Núm. ext *</label>
                  <input id="s-ext" formControlName="exterior_number" type="text" placeholder="100"
                    class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] transition-colors"
                    [class.border-[#E53935]]="isAddrInvalid('exterior_number')"
                  />
                  @if (isAddrInvalid('exterior_number')) { <span class="text-[11px] text-[#E53935]">{{ errAddrMsg('exterior_number', 'Número exterior') }}</span> }
                </div>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div class="flex flex-col gap-1">
                  <label class="text-[12px] font-semibold text-[#1A1A2E]" for="s-nb">Colonia *</label>
                  <input id="s-nb" formControlName="neighborhood" type="text" placeholder="Centro"
                    class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] transition-colors"
                    [class.border-[#E53935]]="isAddrInvalid('neighborhood')"
                  />
                  @if (isAddrInvalid('neighborhood')) { <span class="text-[11px] text-[#E53935]">{{ errAddrMsg('neighborhood', 'Colonia') }}</span> }
                </div>
                <div class="flex flex-col gap-1">
                  <label class="text-[12px] font-semibold text-[#1A1A2E]" for="s-cp">C.P. *</label>
                  <input id="s-cp" formControlName="postal_code" type="text" maxlength="5" placeholder="5 dígitos"
                    class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] transition-colors"
                    [class.border-[#E53935]]="isAddrInvalid('postal_code')"
                  />
                  @if (isAddrInvalid('postal_code')) { <span class="text-[11px] text-[#E53935]">{{ errAddrMsg('postal_code', 'Código postal') }}</span> }
                </div>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div class="flex flex-col gap-1">
                  <label class="text-[12px] font-semibold text-[#1A1A2E]" for="s-city">Ciudad *</label>
                  <input id="s-city" formControlName="city" type="text" placeholder="Torreón"
                    class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] transition-colors"
                    [class.border-[#E53935]]="isAddrInvalid('city')"
                  />
                  @if (isAddrInvalid('city')) { <span class="text-[11px] text-[#E53935]">{{ errAddrMsg('city', 'Ciudad') }}</span> }
                </div>
                <div class="flex flex-col gap-1">
                  <label class="text-[12px] font-semibold text-[#1A1A2E]" for="s-state">Estado *</label>
                  <input id="s-state" formControlName="state" type="text" placeholder="Coahuila"
                    class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] transition-colors"
                    [class.border-[#E53935]]="isAddrInvalid('state')"
                  />
                  @if (isAddrInvalid('state')) { <span class="text-[11px] text-[#E53935]">{{ errAddrMsg('state', 'Estado') }}</span> }
                </div>
              </div>
            </div>

            <div class="flex justify-end gap-2 pt-1">
              <button type="button" (click)="closeModal()"
                class="px-4 py-2 rounded-lg text-[13px] font-semibold bg-white text-[#003399] border border-[#E0E0E0] hover:border-[#003399] transition-colors cursor-pointer"
              >Cancelar</button>
              <button type="submit" [disabled]="saving()"
                class="px-4 py-2 rounded-lg text-[13px] font-semibold bg-[#003399] text-white hover:bg-[#002277] transition-colors border-0 cursor-pointer disabled:opacity-60"
              >
                @if (saving()) { Guardando… } @else { Guardar }
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
})
export class SubsidiariesComponent implements OnInit {
  private svc = inject(SubsidiaryService);
  private fb  = inject(FormBuilder);

  subsidiaries = signal<Subsidiary[]>([]);
  filtered     = signal<Subsidiary[]>([]);
  loading      = signal(true);
  showModal    = signal(false);
  saving       = signal(false);
  editingId    = signal<number | null>(null);
  errorMsg     = signal('');

  // ── Pagination ──────────────────────────────────────────────
  currentPage = signal(1);
  pageSize    = signal(10);
  readonly pageSizeOptions = [5, 10, 20, 50];

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
  // ────────────────────────────────────────────────────────────

  headers = ['Nombre', 'Teléfono', 'Dirección', 'Acciones'];

  form = this.fb.group({
    name:  ['', [Validators.required, Validators.minLength(2)]],
    phone: ['', phoneValidator()],
    address: this.fb.group({
      street:           ['', [Validators.required, Validators.minLength(2)]],
      exterior_number:  ['', Validators.required],
      interior_number:  [''],
      neighborhood:     ['', Validators.required],
      postal_code:      ['', [Validators.required, postalCodeValidator()]],
      city:             ['', Validators.required],
      state:            ['', Validators.required],
      country:          ['Mexico'],
      references:       [''],
    }),
  });

  ngOnInit() { this.load(); }

  private load() {
    this.loading.set(true);
    this.svc.getAll().subscribe({
      next: res => { this.subsidiaries.set(res.data); this.filtered.set(res.data); this.currentPage.set(1); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  search(e: Event) {
    const q = (e.target as HTMLInputElement).value.toLowerCase();
    this.filtered.set(this.subsidiaries().filter(s => s.name.toLowerCase().includes(q)));
    this.currentPage.set(1);
  }

  formatAddress(s: Subsidiary): string {
    if (!s.address) return '—';
    const a = s.address;
    return `${a.street} ${a.exterior_number}, ${a.neighborhood}, ${a.city}`;
  }


  goToPage(page: number) {
    this.currentPage.set(Math.max(1, Math.min(page, this.totalPages())));
  }

  changePageSize(e: Event) {
    this.pageSize.set(Number((e.target as HTMLSelectElement).value));
    this.currentPage.set(1);
  }

  openCreate() {
    this.editingId.set(null);
    this.form.reset({ address: { country: 'Mexico' } });
    this.errorMsg.set('');
    this.showModal.set(true);
  }

  openEdit(s: Subsidiary) {
    this.editingId.set(s.id);
    this.form.patchValue({ name: s.name, phone: s.phone, address: s.address as any });
    this.errorMsg.set('');
    this.showModal.set(true);
  }

  closeModal() { this.showModal.set(false); }

  isInvalid(f: string)     { const c = this.form.get(f);              return c?.invalid && c?.touched; }
  isAddrInvalid(f: string) { const c = this.form.get('address.' + f); return c?.invalid && c?.touched; }
  errMsg(f: string, label = '')      { return getErrorMessage(this.form.get(f), label); }
  errAddrMsg(f: string, label = '')  { return getErrorMessage(this.form.get('address.' + f), label); }

  submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.saving.set(true);
    this.errorMsg.set('');

    const val  = this.form.value as any;
    const id   = this.editingId();
    const obs  = id ? this.svc.update(id, val) : this.svc.create(val);

    obs.subscribe({
      next:  () => { this.saving.set(false); this.closeModal(); this.load(); },
      error: err => { this.saving.set(false); this.errorMsg.set(err?.error?.message ?? 'Error al guardar.'); },
    });
  }

  remove(s: Subsidiary) {
    if (!confirm(`¿Eliminar sucursal "${s.name}"? Esta acción no se puede deshacer.`)) return;
    this.svc.delete(s.id).subscribe({
      next:  () => this.load(),
      error: err => alert(err?.error?.message ?? 'No se pudo eliminar.'),
    });
  }
}
