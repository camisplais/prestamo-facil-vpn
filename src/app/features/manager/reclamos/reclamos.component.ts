import {
  ChangeDetectionStrategy,
  Component,
  computed,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { ManagerReclamoService } from '../../../core/services/manager-reclamo.service';
import { Reclamo } from '../../../core/models';
import { PaginationControlsComponent } from '../../../shared/components/pagination-controls.component';

@Component({
  selector: 'app-manager-reclamos',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, PaginationControlsComponent],
  template: `
    <div>
      <div class="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 class="font-[Montserrat] text-[22px] font-extrabold text-[#1A1A2E]">Reclamos</h1>
          <p class="text-[13px] text-[#6B7280] mt-0.5">Reclamos de transferencias, credito y puntos recibidos de distribuidoras</p>
        </div>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white rounded-[10px] p-5 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
          <div class="font-[Montserrat] text-[22px] font-extrabold text-[#1A1A2E]">{{ pagination().total }}</div>
          <div class="text-[12px] text-[#6B7280] mt-0.5">Total</div>
        </div>
        <div class="bg-white rounded-[10px] p-5 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
          <div class="font-[Montserrat] text-[22px] font-extrabold text-[#FF8800]">{{ countByStatus('pending') }}</div>
          <div class="text-[12px] text-[#6B7280] mt-0.5">Pendientes</div>
        </div>
        <div class="bg-white rounded-[10px] p-5 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
          <div class="font-[Montserrat] text-[22px] font-extrabold text-[#00A86B]">{{ countByStatus('approved') }}</div>
          <div class="text-[12px] text-[#6B7280] mt-0.5">Aprobados</div>
        </div>
        <div class="bg-white rounded-[10px] p-5 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
          <div class="font-[Montserrat] text-[22px] font-extrabold text-[#E53935]">{{ countByStatus('rejected') }}</div>
          <div class="text-[12px] text-[#6B7280] mt-0.5">Rechazados</div>
        </div>
      </div>

      <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
        <div class="px-5 py-4 border-b border-[#E0E0E0] flex items-center justify-between gap-3 flex-wrap">
          <span class="font-[Montserrat] font-bold text-[14px] text-[#1A1A2E]">Lista de reclamos</span>
          <div class="flex gap-2 flex-wrap items-center">
            @for (f of statusFilters; track f.value) {
              <button
                (click)="setStatusFilter(f.value)"
                [class]="activeStatus() === f.value
                  ? 'bg-[#003399] text-white'
                  : 'bg-white text-[#6B7280] border border-[#E0E0E0] hover:border-[#003399]'"
                class="px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors cursor-pointer border-0"
              >{{ f.label }}</button>
            }
            <span class="w-px h-5 bg-[#E0E0E0]"></span>
            @for (f of typeFilters; track f.value) {
              <button
                (click)="setTypeFilter(f.value)"
                [class]="activeType() === f.value
                  ? 'bg-[#FF8800] text-white'
                  : 'bg-white text-[#6B7280] border border-[#E0E0E0] hover:border-[#FF8800]'"
                class="px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors cursor-pointer border-0"
              >{{ f.label }}</button>
            }
          </div>
        </div>

        @if (loading()) {
          <div class="flex items-center justify-center py-16 text-[#6B7280] text-[13px]">
            <svg class="w-5 h-5 animate-spin mr-2 text-[#003399]" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            Cargando reclamos...
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
                    <td class="px-5 py-3 font-semibold text-[#1A1A2E]">{{ distributorName(item) }}</td>
                    <td class="px-5 py-3">
                      <span [class]="typeClass(item.type)" class="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border">
                        {{ typeLabel(item.type) }}
                      </span>
                    </td>
                    <td class="px-5 py-3 text-[#6B7280] font-mono text-[12px]">{{ item.reference_number || '—' }}</td>
                    <td class="px-5 py-3">
                      <span [class]="statusClass(item.status)" class="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border">
                        {{ statusLabel(item.status) }}
                      </span>
                    </td>
                    <td class="px-5 py-3 text-[#6B7280]">{{ formatDate(item.created_at) }}</td>
                    <td class="px-5 py-3">
                      <a
                        [routerLink]="['/gerente/reclamos', item.id]"
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
                    <td colspan="6" class="px-5 py-12 text-center text-[#6B7280] text-[13px]">
                      No se encontraron reclamos.
                    </td>
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
  `,
})
export class ReclamosComponent implements OnInit {
  private svc = inject(ManagerReclamoService);

  items = signal<Reclamo[]>([]);
  loading = signal(true);
  activeStatus = signal('');
  activeType = signal('');
  pagination = signal({ current_page: 1, last_page: 1, per_page: 15, total: 0, from: 0, to: 0 });
  currentPage = signal(1);
  readonly pageSize = 15;

  headers = ['Distribuidora', 'Tipo', 'Referencia', 'Estado', 'Fecha', 'Acciones'];

  statusFilters = [
    { label: 'Todos', value: '' },
    { label: 'Pendientes', value: 'pending' },
    { label: 'Aprobados', value: 'approved' },
    { label: 'Rechazados', value: 'rejected' },
  ];

  typeFilters = [
    { label: 'Todos', value: '' },
    { label: 'Transferencia', value: 'money_claim' },
    { label: 'Aumento de credito', value: 'credit_increase' },
    { label: 'Canje de puntos', value: 'redeem_points' },
  ];

  countByStatus = (s: string) => this.items().filter(i => i.status === s).length;

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

  formatDate = (date?: string) => date ? new Date(date).toLocaleDateString('es-MX') : '—';

  totalPages = computed(() => Math.max(1, this.pagination().last_page || Math.ceil(this.pagination().total / this.pageSize)));
  rangeStart = computed(() => this.pagination().from);
  rangeEnd = computed(() => this.pagination().to);

  ngOnInit() {
    this.load();
  }

  setStatusFilter(value: string) {
    this.activeStatus.set(value);
    this.currentPage.set(1);
    this.load();
  }

  setTypeFilter(value: string) {
    this.activeType.set(value);
    this.currentPage.set(1);
    this.load();
  }

  goToPage(page: number) {
    this.currentPage.set(Math.max(1, Math.min(page, this.totalPages())));
    this.load();
  }

  private load() {
    this.loading.set(true);
    this.svc.getAll(this.activeType() || undefined, this.activeStatus() || undefined, this.currentPage(), this.pageSize).subscribe({
      next: res => {
        this.items.set(res.data);
        this.pagination.set(res.pagination ?? { current_page: this.currentPage(), last_page: 1, per_page: this.pageSize, total: res.data.length, from: res.data.length ? 1 : 0, to: res.data.length });
        this.currentPage.set(this.pagination().current_page);
        this.loading.set(false);
      },
      error: () => {
        this.items.set([]);
        this.loading.set(false);
      },
    });
  }
}
