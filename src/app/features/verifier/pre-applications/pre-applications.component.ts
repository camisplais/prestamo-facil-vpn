import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { VerifierService } from '../../../core/services/verifier.service';

@Component({
  selector: 'app-verifier-pre-applications',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div>
      <!-- Header -->
      <div class="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 class="font-[Montserrat] text-[22px] font-extrabold text-[#1A1A2E]">Pre-Solicitudes</h1>
          <p class="text-[13px] text-[#6B7280] mt-0.5">Revisión y verificación de candidatas a distribuidoras</p>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div class="bg-white rounded-[10px] p-5 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] flex gap-4">
          <div class="w-11 h-11 rounded-[10px] bg-[#003399]/10 text-[#003399] flex items-center justify-center flex-shrink-0">
            <svg class="w-[22px] h-[22px]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </div>
          <div>
            <div class="font-[Montserrat] text-[22px] font-extrabold">{{ items().length }}</div>
            <div class="text-[12px] text-[#6B7280] mt-0.5">Total</div>
          </div>
        </div>
        <div class="bg-white rounded-[10px] p-5 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] flex gap-4">
          <div class="w-11 h-11 rounded-[10px] bg-[#FF8800]/10 text-[#FF8800] flex items-center justify-center flex-shrink-0">
            <svg class="w-[22px] h-[22px]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div>
            <div class="font-[Montserrat] text-[22px] font-extrabold">{{ countByStatus('pending') }}</div>
            <div class="text-[12px] text-[#6B7280] mt-0.5">Pendientes</div>
          </div>
        </div>
        <div class="bg-white rounded-[10px] p-5 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] flex gap-4">
          <div class="w-11 h-11 rounded-[10px] bg-[#0288D1]/10 text-[#0288D1] flex items-center justify-center flex-shrink-0">
            <svg class="w-[22px] h-[22px]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
          </div>
          <div>
            <div class="font-[Montserrat] text-[22px] font-extrabold">{{ countByStatus('verified') }}</div>
            <div class="text-[12px] text-[#6B7280] mt-0.5">Verificadas</div>
          </div>
        </div>
      </div>

      <!-- Tabla -->
      <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
        <div class="px-5 py-4 border-b border-[#E0E0E0] flex items-center justify-between gap-3 flex-wrap">
          <span class="font-[Montserrat] font-bold text-[14px] text-[#1A1A2E]">Lista de pre-solicitudes</span>
          <div class="flex gap-2 flex-wrap">
            @for (f of filters; track f.value) {
              <button
                (click)="setFilter(f.value)"
                [class]="activeFilter() === f.value
                  ? 'bg-[#003399] text-white'
                  : 'bg-white text-[#6B7280] border border-[#E0E0E0] hover:border-[#003399]'"
                class="px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors cursor-pointer border-0"
              >{{ f.label }}</button>
            }
            <input
              type="search"
              placeholder="Buscar…"
              (input)="search($event)"
              class="border border-[#E0E0E0] rounded-lg px-3 py-1.5 text-[13px] outline-none focus:border-[#003399] w-44 transition-colors"
              aria-label="Buscar pre-solicitud"
            />
          </div>
        </div>

        @if (loading()) {
          <div class="flex items-center justify-center py-16 text-[#6B7280] text-[13px]">
            <svg class="w-5 h-5 animate-spin mr-2 text-[#003399]" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            Cargando pre-solicitudes…
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
                @for (p of paginated(); track p.id) {
                  <tr class="border-b border-[#F0F0F0] hover:bg-[#F8FAFD] transition-colors">
                    <td class="px-5 py-3 font-semibold text-[#1A1A2E]">{{ fullName(p) }}</td>
                    <td class="px-5 py-3 text-[#6B7280]">{{ p.person_data?.curp || '—' }}</td>
                    <td class="px-5 py-3 text-[#6B7280]">{{ p.coordinator?.name || '—' }}</td>
                    <td class="px-5 py-3">
                      <span [class]="statusClass(p.status)" class="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border">
                        {{ statusLabel(p.status) }}
                      </span>
                    </td>
                    <td class="px-5 py-3 text-[#6B7280]">{{ formatDate(p.created_at) }}</td>
                    <td class="px-5 py-3">
                      <a
                        [routerLink]="['/verificador/pre-solicitudes', p.id]"
                        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-[#003399] border border-[#003399]/20 hover:bg-[#003399]/10 transition-colors no-underline"
                        [class.opacity-50]="p.status !== 'pending'"
                        [attr.title]="p.status !== 'pending' ? 'Ya evaluada' : 'Evaluar'"
                      >
                        <svg class="w-[13px] h-[13px]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                          <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        </svg>
                        {{ p.status === 'pending' ? 'Evaluar' : 'Ver detalle' }}
                      </a>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="6" class="px-5 py-12 text-center text-[#6B7280] text-[13px]">
                      No hay pre-solicitudes para mostrar.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
          <!-- Paginación -->
          @if (totalPages() > 1 || filtered().length > pageSize()) {
            <div class="px-5 py-3 border-t border-[#E0E0E0] flex items-center justify-between gap-3 flex-wrap text-[13px] text-[#6B7280]">
              <span>Mostrando {{ rangeStart() }}–{{ rangeEnd() }} de {{ filtered().length }}</span>
              <div class="flex items-center gap-2">
                <button (click)="goToPage(1)" [disabled]="currentPage() === 1"
                  class="p-1.5 rounded-lg border border-[#E0E0E0] bg-white hover:border-[#003399] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Primera página">«</button>
                <button (click)="goToPage(currentPage() - 1)" [disabled]="currentPage() === 1"
                  class="px-3 py-1.5 rounded-lg border border-[#E0E0E0] bg-white hover:border-[#003399] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">‹ Ant.</button>
                @for (page of visiblePages(); track page) {
                  @if (page === -1) {
                    <span class="px-2 text-[#9CA3AF]">…</span>
                  } @else {
                    <button (click)="goToPage(page)"
                      [class]="page === currentPage() ? 'bg-[#003399] text-white shadow-sm' : 'text-[#6B7280] hover:bg-[#F0F4FF] hover:text-[#003399]'"
                      class="min-w-[32px] h-8 px-2 rounded-lg text-[12px] font-semibold transition-colors border-0 cursor-pointer"
                      [attr.aria-current]="page === currentPage() ? 'page' : null">{{ page }}</button>
                  }
                }
                <button (click)="goToPage(currentPage() + 1)" [disabled]="currentPage() === totalPages()"
                  class="px-3 py-1.5 rounded-lg border border-[#E0E0E0] bg-white hover:border-[#003399] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Sig. ›</button>
                <button (click)="goToPage(totalPages())" [disabled]="currentPage() === totalPages()"
                  class="p-1.5 rounded-lg border border-[#E0E0E0] bg-white hover:border-[#003399] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Última página">»</button>
                <select [value]="pageSize()" (change)="changePageSize($event)"
                  class="border border-[#E0E0E0] rounded-lg px-2 py-1.5 text-[12px] bg-white outline-none focus:border-[#003399]"
                  aria-label="Filas por página">
                  @for (opt of pageSizeOptions; track opt) {
                    <option [value]="opt">{{ opt }} / pág.</option>
                  }
                </select>
              </div>
            </div>
          }
      </div>
    </div>
  `,
})
export class VerifierPreApplicationsComponent implements OnInit {
  private svc = inject(VerifierService);

  items        = signal<any[]>([]);
  filtered     = signal<any[]>([]);
  loading      = signal(true);
  activeFilter = signal('pending'); // Por default muestra pendientes

  headers = ['Nombre', 'CURP', 'Coordinador', 'Estado', 'Fecha', 'Acción'];

  filters = [
    { label: 'Pendientes',  value: 'pending'  },
    { label: 'Verificadas', value: 'verified' },
    { label: 'Rechazadas',  value: 'rejected' },
    { label: 'Todas',       value: ''         },
  ];

  countByStatus = (s: string) => this.items().filter(i => i.status === s).length;
  fullName      = (p: any)    => [p.person_data?.name, p.person_data?.first_last_name, p.person_data?.second_last_name].filter(Boolean).join(' ');
  formatDate    = (d: string) => d ? new Date(d).toLocaleDateString('es-MX') : '—';

  statusLabel = (s: string) => ({ pending: 'Pendiente', verified: 'Verificada', rejected: 'Rechazada' }[s] ?? s);
  statusClass = (s: string) => ({
    pending:  'bg-[#FF8800]/10 text-[#FF8800] border-[#FF8800]/20',
    verified: 'bg-[#0288D1]/10 text-[#0288D1] border-[#0288D1]/20',
    rejected: 'bg-[#E53935]/10 text-[#E53935] border-[#E53935]/20',
  }[s] ?? '');

  ngOnInit() { this.load(); }

  private load() {
    this.loading.set(true);
    this.svc.getAll(this.activeFilter() || undefined).subscribe({
      next: r => {
        const data = r.data?.data ?? r.data ?? [];
        this.items.set(data);
        this.filtered.set(data);
        this.currentPage.set(1);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  setFilter(value: string) {
    this.activeFilter.set(value);
    this.currentPage.set(1);
    this.load();
  }

  search(e: Event) {
    const q = (e.target as HTMLInputElement).value.toLowerCase();
    this.filtered.set(this.items().filter(p => this.fullName(p).toLowerCase().includes(q)));
    this.currentPage.set(1);
  }

  currentPage    = signal(1);
  pageSize       = signal(10);
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
    if (total <= 1) return [1];
    const pages: number[] = [1];
    if (cur > 3) pages.push(-1);
    for (let p = Math.max(2, cur - 1); p <= Math.min(total - 1, cur + 1); p++) pages.push(p);
    if (cur < total - 2) pages.push(-1);
    if (total > 1) pages.push(total);
    return pages;
  });

  goToPage(page: number) {
    this.currentPage.set(Math.max(1, Math.min(page, this.totalPages())));
  }

  changePageSize(e: Event) {
    this.pageSize.set(Number((e.target as HTMLSelectElement).value));
    this.currentPage.set(1);
  }
}