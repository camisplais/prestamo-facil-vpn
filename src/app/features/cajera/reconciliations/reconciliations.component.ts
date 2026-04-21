import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ReconciliationService } from '../../../core/services/reconciliation.service';
import { Reconciliation } from '../../../core/models';

@Component({
  selector: 'app-reconciliations',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [DecimalPipe],
  template: `
    <div>
      <div class="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 class="font-[Montserrat] text-[22px] font-extrabold text-[#1A1A2E]">Conciliaciones</h1>
          <p class="text-[13px] text-[#6B7280] mt-0.5">Historial de conciliaciones de pagos por quincena</p>
        </div>
        <label class="flex items-center gap-2 bg-[#003399] text-white px-4 py-2 rounded-lg text-[13px] font-semibold cursor-pointer hover:bg-[#002580] transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
          </svg>
          Subir Excel
          <input type="file" accept=".xlsx,.xls" class="hidden" (change)="onFileChange($event)" />
        </label>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white rounded-[10px] p-5 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
          <div class="font-[Montserrat] text-[22px] font-extrabold text-[#1A1A2E]">{{ total() }}</div>
          <div class="text-[12px] text-[#6B7280] mt-0.5">Total</div>
        </div>
        <div class="bg-white rounded-[10px] p-5 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
          <div class="font-[Montserrat] text-[22px] font-extrabold text-[#00A86B]">{{ countEarly() }}</div>
          <div class="text-[12px] text-[#6B7280] mt-0.5">Anticipados</div>
        </div>
        <div class="bg-white rounded-[10px] p-5 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
          <div class="font-[Montserrat] text-[22px] font-extrabold text-[#003399]">{{ countOnTime() }}</div>
          <div class="text-[12px] text-[#6B7280] mt-0.5">A tiempo</div>
        </div>
        <div class="bg-white rounded-[10px] p-5 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
          <div class="font-[Montserrat] text-[22px] font-extrabold text-[#E53935]">{{ countLate() }}</div>
          <div class="text-[12px] text-[#6B7280] mt-0.5">Atrasados</div>
        </div>
      </div>

      @if (uploading()) {
        <div class="bg-[#003399]/5 border border-[#003399]/20 rounded-[10px] px-5 py-4 mb-4 flex items-center gap-3 text-[13px] text-[#003399] font-semibold">
          <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
          Procesando Excel...
        </div>
      }

      @if (uploadError()) {
        <div class="bg-[#E53935]/5 border border-[#E53935]/20 rounded-[10px] px-5 py-4 mb-4 text-[13px] text-[#E53935] font-semibold">
          {{ uploadError() }}
        </div>
      }

      @if (uploadSuccess()) {
        <div class="bg-[#00A86B]/5 border border-[#00A86B]/20 rounded-[10px] px-5 py-4 mb-4 text-[13px] text-[#00A86B] font-semibold">
          Conciliacion procesada correctamente
        </div>
      }

      <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
        <div class="px-5 py-4 border-b border-[#E0E0E0] flex items-center justify-between gap-3 flex-wrap">
          <span class="font-[Montserrat] font-bold text-[14px] text-[#1A1A2E]">Lista de conciliaciones</span>
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
          </div>
        </div>

        @if (loading()) {
          <div class="flex items-center justify-center py-16 text-[#6B7280] text-[13px]">
            <svg class="w-5 h-5 animate-spin mr-2 text-[#003399]" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            Cargando conciliaciones...
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
                @for (item of filteredItems(); track item.id) {
                  <tr class="border-b border-[#F0F0F0] hover:bg-[#F8FAFD] transition-colors">
                    <td class="px-5 py-3 font-semibold text-[#1A1A2E]">{{ distributorName(item) }}</td>
                    <td class="px-5 py-3 font-mono text-[12px] text-[#6B7280]">{{ item.period_start }} / {{ item.period_end }}</td>
                    <td class="px-5 py-3 text-[#1A1A2E]">\${{ item.total_expected | number:'1.2-2' }}</td>
                    <td class="px-5 py-3 text-[#1A1A2E]">\${{ item.amount_paid | number:'1.2-2' }}</td>
                    <td class="px-5 py-3">
                      @if (item.debt > 0) {
                        <span class="text-[#E53935] font-semibold">-\${{ item.debt | number:'1.2-2' }}</span>
                      } @else if (item.over_payment > 0) {
                        <span class="text-[#00A86B] font-semibold">+\${{ item.over_payment | number:'1.2-2' }}</span>
                      } @else {
                        <span class="text-[#6B7280]">—</span>
                      }
                    </td>
                    <td class="px-5 py-3">
                      <span [class]="statusClass(item.status)" class="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border">
                        {{ statusLabel(item.status) }}
                      </span>
                    </td>
                    <td class="px-5 py-3 text-[#6B7280]">{{ formatDate(item.payment_date) }}</td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="7" class="px-5 py-12 text-center text-[#6B7280] text-[13px]">
                      No se encontraron conciliaciones.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <div class="px-5 py-4 border-t border-[#E0E0E0] flex items-center justify-between text-[13px] text-[#6B7280]">
            <span>{{ total() }} conciliaciones en total</span>
            <div class="flex items-center gap-2">
              <button
                (click)="goToPage(currentPage() - 1)"
                [disabled]="currentPage() === 1"
                class="px-3 py-1.5 rounded-lg border border-[#E0E0E0] hover:border-[#003399] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer bg-white transition-colors"
              >Anterior</button>
              <span class="font-semibold text-[#1A1A2E]">{{ currentPage() }} / {{ lastPage() }}</span>
              <button
                (click)="goToPage(currentPage() + 1)"
                [disabled]="currentPage() === lastPage()"
                class="px-3 py-1.5 rounded-lg border border-[#E0E0E0] hover:border-[#003399] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer bg-white transition-colors"
              >Siguiente</button>
            </div>
          </div>

        }
      </div>
    </div>
  `,
})
export class ReconciliationsComponent implements OnInit {
  private svc = inject(ReconciliationService);

  items = signal<Reconciliation[]>([]);
  loading = signal(true);
  uploading = signal(false);
  uploadError = signal('');
  uploadSuccess = signal(false);
  activeStatus = signal('');
  currentPage = signal(1);
  lastPage = signal(1);
  total = signal(0);
  countEarly   = signal(0);
  countOnTime  = signal(0);
  countLate    = signal(0);

  headers = ['Distribuidora', 'Periodo', 'Esperado', 'Pagado', 'Diferencia', 'Estado', 'Fecha pago'];

  statusFilters = [
    { label: 'Todos', value: '' },
    { label: 'Anticipados', value: 'early' },
    { label: 'A tiempo', value: 'on_time' },
    { label: 'Atrasados', value: 'late' },
  ];

  filteredItems() {
    const status = this.activeStatus();
    if (!status) return this.items();
    return this.items().filter(i => i.status === status);
  }

  countByStatus = (s: string) => this.items().filter(i => i.status === s).length;

  distributorName = (item: Reconciliation) => {
    const pd = item.distributor?.personData;
    if (!pd) return '—';
    return [pd.name, pd.first_last_name, pd.second_last_name].filter(Boolean).join(' ');
  };

  statusLabel = (s: string) => ({
    early: 'Anticipado',
    on_time: 'A tiempo',
    late: 'Atrasado',
    pending: 'Pendiente',
  }[s] ?? s);

  statusClass = (s: string) => ({
    early: 'bg-[#00A86B]/10 text-[#00A86B] border-[#00A86B]/20',
    on_time: 'bg-[#003399]/10 text-[#003399] border-[#003399]/20',
    late: 'bg-[#E53935]/10 text-[#E53935] border-[#E53935]/20',
    pending: 'bg-[#FF8800]/10 text-[#FF8800] border-[#FF8800]/20',
  }[s] ?? 'bg-[#F8FAFD] text-[#6B7280] border-[#E0E0E0]');

    formatDate = (date?: string) => {
    if (!date) return '—';
    // Agregar T12:00:00 para evitar problemas de timezone
    return new Date(date + 'T12:00:00').toLocaleDateString('es-MX');
    }

  ngOnInit() {
    this.load();
  }

  setStatusFilter(value: string) {
    this.activeStatus.set(value);
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const maxSize = 8 * 1024 * 1024; // 8MB en bytes
    if (file.size > maxSize) {
        this.uploadError.set('El archivo no puede pesar mas de 8MB');
        input.value = '';
        return;
    }

    this.uploading.set(true);
    this.uploadError.set('');
    this.uploadSuccess.set(false);

    this.svc.upload(file).subscribe({
      next: newItems => {
        this.items.update(prev => [...newItems, ...prev]);
        this.uploading.set(false);
        this.uploadSuccess.set(true);
        setTimeout(() => this.uploadSuccess.set(false), 3000);
      },
      error: (err) => {
            this.uploadError.set(
                err?.error?.message ?? 'Error al procesar el archivo. Verifica el formato e intenta de nuevo.'
            );
            this.uploading.set(false);
        },
    });
  }

    private load() {
        this.loading.set(true);
        this.svc.getAll(this.currentPage()).subscribe({
            next: ({ items, lastPage, total, counts }) => {
            this.items.set(items);
            this.lastPage.set(lastPage);
            this.total.set(total);
            this.countEarly.set(counts.early);
            this.countOnTime.set(counts.on_time);
            this.countLate.set(counts.late);
            this.loading.set(false);
            },
            error: () => {
            this.items.set([]);
            this.loading.set(false);
            },
        });
    }

   goToPage(page: number) {
        if (page < 1 || page > this.lastPage()) return;
        this.currentPage.set(page);
        this.load();
    }

}