import {
  ChangeDetectionStrategy,
  Component,
  computed,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ManagerApplicationService } from '../../../core/services/manager-application.service';
import { GerenteSolicitud } from '../../../core/models';

@Component({
  selector: 'app-manager-applications',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FormsModule],
  template: `
    <div>
      <div class="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 class="font-[Montserrat] text-[22px] font-extrabold text-[#1A1A2E]">Solicitudes</h1>
          <p class="text-[13px] text-[#6B7280] mt-0.5">Revision de solicitudes verificadas, rechazadas y aprobadas</p>
        </div>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white rounded-[10px] p-5 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
          <div class="font-[Montserrat] text-[22px] font-extrabold">{{ pagination().total }}</div>
          <div class="text-[12px] text-[#6B7280] mt-0.5">Total</div>
        </div>
        <div class="bg-white rounded-[10px] p-5 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
          <div class="font-[Montserrat] text-[22px] font-extrabold">{{ countByStatus('verified') }}</div>
          <div class="text-[12px] text-[#6B7280] mt-0.5">Verificadas</div>
        </div>
        <div class="bg-white rounded-[10px] p-5 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
          <div class="font-[Montserrat] text-[22px] font-extrabold">{{ countByStatus('approved') }}</div>
          <div class="text-[12px] text-[#6B7280] mt-0.5">Aprobadas</div>
        </div>
        <div class="bg-white rounded-[10px] p-5 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
          <div class="font-[Montserrat] text-[22px] font-extrabold">{{ countByStatus('rejected') }}</div>
          <div class="text-[12px] text-[#6B7280] mt-0.5">Rechazadas</div>
        </div>
      </div>

      <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
        <div class="px-5 py-4 border-b border-[#E0E0E0] flex items-center justify-between gap-3 flex-wrap">
          <span class="font-[Montserrat] font-bold text-[14px] text-[#1A1A2E]">Lista de solicitudes</span>
          <div class="flex gap-2 flex-wrap items-center">
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
              placeholder="Buscar nombre, CURP o RFC..."
              class="border border-[#E0E0E0] rounded-lg px-3 py-1.5 text-[13px] outline-none focus:border-[#003399] w-56 transition-colors"
              [value]="query()"
              (input)="search($event)"
              aria-label="Buscar solicitud"
            />
          </div>
        </div>

        @if (loading()) {
          <div class="flex items-center justify-center py-16 text-[#6B7280] text-[13px]">
            <svg class="w-5 h-5 animate-spin mr-2 text-[#003399]" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            Cargando solicitudes...
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
                    <td class="px-5 py-3 text-[#6B7280]">{{ item.personData?.curp || '—' }}</td>
                    <td class="px-5 py-3 text-[#6B7280]">{{ item.personData?.rfc || '—' }}</td>
                    <td class="px-5 py-3">
                      <span [class]="bureauClass(item.credit_bureau_hit)" class="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border">
                        {{ bureauLabel(item.credit_bureau_hit) }}
                      </span>
                    </td>
                    <td class="px-5 py-3">
                      <span [class]="statusClass(item.status)" class="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border">
                        {{ statusLabel(item.status) }}
                      </span>
                    </td>
                    <td class="px-5 py-3 text-[#6B7280]">{{ formatDate(item.created_at) }}</td>
                    <td class="px-5 py-3">
                      <a
                        [routerLink]="[basePath(), item.id]"
                        class="p-1.5 rounded-lg text-[#003399] hover:bg-[#003399]/10 transition-colors inline-flex"
                        title="Ver detalle"
                        aria-label="Ver detalle"
                      >
                        <svg class="w-[15px] h-[15px]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                          <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        </svg>
                      </a>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="7" class="px-5 py-12 text-center text-[#6B7280] text-[13px]">
                      No se encontraron solicitudes.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
          <!-- Paginación -->
          @if (totalPages() > 1 || pagination().total > pageSize()) {
            <div class="px-5 py-3 border-t border-[#E0E0E0] flex items-center justify-between gap-3 flex-wrap text-[13px] text-[#6B7280]">
              <span>Mostrando {{ rangeStart() }}–{{ rangeEnd() }} de {{ pagination().total }}</span>
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
export class ApplicationsComponent implements OnInit {
  private router = inject(Router);
  readonly basePath = () => {
    const url = this.router.url.split('?')[0];
    return url.includes('/admin/') ? '/admin/gerente/solicitudes' : '/gerente/solicitudes';
  };
  private svc = inject(ManagerApplicationService);

  items = signal<GerenteSolicitud[]>([]);
  pagination = signal({ current_page: 1, last_page: 1, per_page: 15, total: 0, from: 0, to: 0 });
  loading = signal(true);
  activeFilter = signal('');
  query = signal('');

  private searchDebounce?: ReturnType<typeof setTimeout>;

  headers = ['Nombre', 'CURP', 'RFC', 'Buro', 'Estado', 'Fecha', 'Acciones'];

  filters = [
    { label: 'Todas', value: '' },
    { label: 'Verificadas', value: 'verified' },
    { label: 'Aprobadas', value: 'approved' },
    { label: 'Rechazadas', value: 'rejected' },
    { label: 'Pendientes', value: 'pending' },
  ];

  countByStatus = (status: string) => this.items().filter(item => item.status === status).length;
  fullName = (item: GerenteSolicitud) => [item.personData?.name, item.personData?.first_last_name, item.personData?.second_last_name].filter(Boolean).join(' ');
  formatDate = (date?: string) => date ? new Date(date).toLocaleDateString('es-MX') : '—';

  statusLabel = (status: string) => ({
    pending: 'Pendiente',
    verified: 'Verificada',
    approved: 'Aprobada',
    rejected: 'Rechazada',
  }[status] ?? status);

  statusClass = (status: string) => ({
    pending: 'bg-[#FF8800]/10 text-[#FF8800] border-[#FF8800]/20',
    verified: 'bg-[#0288D1]/10 text-[#0288D1] border-[#0288D1]/20',
    approved: 'bg-[#00A86B]/10 text-[#00A86B] border-[#00A86B]/20',
    rejected: 'bg-[#E53935]/10 text-[#E53935] border-[#E53935]/20',
  }[status] ?? 'bg-[#F8FAFD] text-[#6B7280] border-[#E0E0E0]');

  bureauLabel = (hit: boolean | null | undefined) => hit === true ? 'En buro' : hit === false ? 'Sin buro' : 'Pendiente';
  bureauClass = (hit: boolean | null | undefined) => hit === true
    ? 'bg-[#E53935]/10 text-[#E53935] border-[#E53935]/20'
    : hit === false
      ? 'bg-[#00A86B]/10 text-[#00A86B] border-[#00A86B]/20'
      : 'bg-[#FF8800]/10 text-[#FF8800] border-[#FF8800]/20';

  ngOnInit() {
    this.load();
  }

  private load() {
    this.loading.set(true);
    this.svc.getAll(
      this.activeFilter() || undefined,
      this.query() || undefined,
      this.currentPage(),
      this.pageSize(),
    ).subscribe({
      next: res => {
        const data = res.data?.data ?? res.data ?? [];
        this.items.set(data);

        if (res.pagination) {
          this.pagination.set(res.pagination);
          this.currentPage.set(res.pagination.current_page);
        }

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

  search(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.query.set(value);
    this.currentPage.set(1);

    if (this.searchDebounce) {
      clearTimeout(this.searchDebounce);
    }

    this.searchDebounce = setTimeout(() => this.load(), 300);
  }

  currentPage    = signal(1);
  pageSize       = signal(15);
  readonly pageSizeOptions = [5, 10, 15, 20, 50];

  totalPages = computed(() => Math.max(1, this.pagination().last_page));

  rangeStart = computed(() => {
    const p = this.pagination();
    return p.total === 0 ? 0 : p.from;
  });

  rangeEnd = computed(() => {
    const p = this.pagination();
    return p.total === 0 ? 0 : p.to;
  });

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
    const nextPage = Math.max(1, Math.min(page, this.totalPages()));
    if (nextPage !== this.currentPage()) {
      this.currentPage.set(nextPage);
      this.load();
    }
  }

  changePageSize(e: Event) {
    this.pageSize.set(Number((e.target as HTMLSelectElement).value));
    this.currentPage.set(1);
    this.load();
  }
}