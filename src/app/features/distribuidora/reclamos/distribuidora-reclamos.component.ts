import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
  computed,
} from '@angular/core';
import { Router } from '@angular/router';
import { DistribuidoraReclamoService } from '../../../core/services/distribuidora-reclamo.service';
import { Reclamo } from '../../../core/models';

@Component({
  selector: 'app-distribuidora-reclamos',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  template: `
    <div class="p-4 md:p-0">
      <div class="flex flex-col sm:flex-row sm:items-start justify-between mb-6 gap-4">
        <div>
          <h1 class="font-[Montserrat] text-[20px] md:text-[22px] font-extrabold text-[#1A1A2E]">Reclamos</h1>
          <p class="text-[13px] text-[#6B7280] mt-0.5">Historial de reclamos enviados a tu sucursal</p>
        </div>
        <button
          (click)="goToForm()"
          class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#003399] text-white rounded-lg text-[13px] font-semibold hover:bg-[#002580] transition-colors border-0 cursor-pointer"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
          </svg>
          Nuevo reclamo
        </button>
      </div>

      <!-- Stats cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <div class="bg-white rounded-[10px] p-4 md:p-5 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
          <div class="font-[Montserrat] text-[18px] md:text-[22px] font-extrabold text-[#1A1A2E]">{{ total() }}</div>
          <div class="text-[11px] md:text-[12px] text-[#6B7280] mt-0.5">Total</div>
        </div>
        <div class="bg-white rounded-[10px] p-4 md:p-5 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
          <div class="font-[Montserrat] text-[18px] md:text-[22px] font-extrabold text-[#FF8800]">{{ countByStatus('pending') }}</div>
          <div class="text-[11px] md:text-[12px] text-[#6B7280] mt-0.5">Pendientes</div>
        </div>
        <div class="bg-white rounded-[10px] p-4 md:p-5 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
          <div class="font-[Montserrat] text-[18px] md:text-[22px] font-extrabold text-[#00A86B]">{{ countByStatus('approved') }}</div>
          <div class="text-[11px] md:text-[12px] text-[#6B7280] mt-0.5">Aprobados</div>
        </div>
        <div class="bg-white rounded-[10px] p-4 md:p-5 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
          <div class="font-[Montserrat] text-[18px] md:text-[22px] font-extrabold text-[#E53935]">{{ countByStatus('rejected') }}</div>
          <div class="text-[11px] md:text-[12px] text-[#6B7280] mt-0.5">Rechazados</div>
        </div>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] overflow-hidden">
        <div class="px-5 py-4 border-b border-[#E0E0E0]">
          <span class="font-[Montserrat] font-bold text-[14px] text-[#1A1A2E]">Historial de reclamos</span>
        </div>

        @if (loading()) {
          <div class="flex items-center justify-center py-16 text-[#6B7280] text-[13px]">
            <svg class="w-5 h-5 animate-spin mr-2 text-[#003399]" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            Cargando reclamos...
          </div>
        } @else {
          <!-- Desktop table -->
          <div class="hidden md:block overflow-x-auto">
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
                    <td class="px-5 py-3">
                      <span [class]="typeClass(item.type)" class="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border">
                        {{ typeLabel(item.type) }}
                      </span>
                    </td>
                    <td class="px-5 py-3 text-[#6B7280] font-mono text-[12px]">{{ item.reference_number || '—' }}</td>
                    <td class="px-5 py-3 text-[#6B7280] max-w-[200px] truncate">{{ item.comments || '—' }}</td>
                    <td class="px-5 py-3">
                      <span [class]="statusClass(item.status)" class="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border">
                        {{ statusLabel(item.status) }}
                      </span>
                    </td>
                    <td class="px-5 py-3 text-[#6B7280]">{{ formatDate(item.created_at) }}</td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="5" class="px-5 py-12 text-center text-[#6B7280] text-[13px]">
                      No has enviado ningún reclamo aún.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Mobile cards -->
          <div class="md:hidden divide-y divide-[#F0F0F0]">
            @for (item of items(); track item.id) {
              <div class="p-4 space-y-3">
                <div class="flex justify-between items-start">
                  <span [class]="typeClass(item.type)" class="text-[10px] font-semibold px-2 py-0.5 rounded-full border">
                    {{ typeLabel(item.type) }}
                  </span>
                  <span class="text-[11px] text-[#6B7280]">{{ formatDate(item.created_at) }}</span>
                </div>
                <div>
                  <div class="text-[11px] text-[#9CA3AF] uppercase font-bold tracking-wider">Referencia</div>
                  <div class="text-[13px] font-mono text-[#1A1A2E]">{{ item.reference_number || '—' }}</div>
                </div>
                <div>
                  <div class="text-[11px] text-[#9CA3AF] uppercase font-bold tracking-wider">Comentarios</div>
                  <div class="text-[13px] text-[#4B5563] italic line-clamp-2">"{{ item.comments || 'Sin comentarios' }}"</div>
                </div>
                <div class="flex justify-between items-center pt-1">
                  <span [class]="statusClass(item.status)" class="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border">
                    {{ statusLabel(item.status) }}
                  </span>
                </div>
              </div>
            } @empty {
              <div class="px-5 py-12 text-center text-[#6B7280] text-[13px]">
                No has enviado ningún reclamo aún.
              </div>
            }
          </div>

          <!-- Pagination -->
          @if (lastPage() > 1) {
            <div class="px-5 py-4 border-t border-[#E0E0E0] flex flex-col sm:flex-row items-center justify-between gap-3">
              <span class="text-[12px] text-[#6B7280]">
                Página {{ currentPage() }} de {{ lastPage() }} — {{ total() }} registros
              </span>
              <div class="flex items-center gap-1">
                <!-- First -->
                <button
                  (click)="goToPage(1)"
                  [disabled]="currentPage() === 1"
                  class="w-8 h-8 flex items-center justify-center rounded-lg text-[12px] border border-[#E0E0E0] text-[#6B7280] hover:bg-[#F8FAFD] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="Primera página"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M11 19l-7-7 7-7M19 19l-7-7 7-7"/>
                  </svg>
                </button>
                <!-- Prev -->
                <button
                  (click)="goToPage(currentPage() - 1)"
                  [disabled]="currentPage() === 1"
                  class="w-8 h-8 flex items-center justify-center rounded-lg text-[12px] border border-[#E0E0E0] text-[#6B7280] hover:bg-[#F8FAFD] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
                  </svg>
                </button>

                <!-- Page numbers -->
                @for (p of visiblePages(); track p) {
                  @if (p === -1) {
                    <span class="w-8 h-8 flex items-center justify-center text-[12px] text-[#6B7280]">…</span>
                  } @else {
                    <button
                      (click)="goToPage(p)"
                      [class]="p === currentPage()
                        ? 'w-8 h-8 flex items-center justify-center rounded-lg text-[12px] font-semibold bg-[#003399] text-white border border-[#003399]'
                        : 'w-8 h-8 flex items-center justify-center rounded-lg text-[12px] border border-[#E0E0E0] text-[#6B7280] hover:bg-[#F8FAFD] transition-colors'"
                    >{{ p }}</button>
                  }
                }

                <!-- Next -->
                <button
                  (click)="goToPage(currentPage() + 1)"
                  [disabled]="currentPage() === lastPage()"
                  class="w-8 h-8 flex items-center justify-center rounded-lg text-[12px] border border-[#E0E0E0] text-[#6B7280] hover:bg-[#F8FAFD] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
                  </svg>
                </button>
                <!-- Last -->
                <button
                  (click)="goToPage(lastPage())"
                  [disabled]="currentPage() === lastPage()"
                  class="w-8 h-8 flex items-center justify-center rounded-lg text-[12px] border border-[#E0E0E0] text-[#6B7280] hover:bg-[#F8FAFD] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="Última página"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>
            </div>
          }
        }
      </div>
    </div>
  `,
})
export class DistribuidoraReclamosComponent implements OnInit {
  private svc    = inject(DistribuidoraReclamoService);
  private router = inject(Router);

  items       = signal<Reclamo[]>([]);
  loading     = signal(true);
  currentPage = signal(1);
  lastPage    = signal(1);
  total       = signal(0);

  headers = ['Tipo', 'Referencia', 'Comentarios', 'Estado', 'Fecha'];

  // Muestra página actual ± 1, siempre primero y último, con "…" entre medios
  visiblePages = computed(() => {
    const cur  = this.currentPage();
    const last = this.lastPage();
    const pages = new Set<number>();

    pages.add(1);
    pages.add(last);
    for (let p = Math.max(1, cur - 1); p <= Math.min(last, cur + 1); p++) pages.add(p);

    const sorted = [...pages].sort((a, b) => a - b);
    const result: number[] = [];
    for (let i = 0; i < sorted.length; i++) {
      if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push(-1); // ellipsis
      result.push(sorted[i]);
    }
    return result;
  });

countByStatus = (s: string) => 
  Array.isArray(this.items()) 
    ? this.items().filter(i => i.status === s).length 
    : 0;

  typeLabel = (t: string) => ({ money_claim: 'Cobro no aplicado', credit_increase: 'Aumento de crédito', change_clients: 'Cambio de cliente', overdue_customer: 'Cliente moroso' }[t] ?? t);
  typeClass = (t: string) => ({ money_claim: 'bg-[#0288D1]/10 text-[#0288D1] border-[#0288D1]/20', credit_increase: 'bg-[#7B1FA2]/10 text-[#7B1FA2] border-[#7B1FA2]/20', change_clients: 'bg-[#00796B]/10 text-[#00796B] border-[#00796B]/20', overdue_customer: 'bg-[#FF8800]/10 text-[#FF8800] border-[#FF8800]/20' }[t] ?? 'bg-[#F8FAFD] text-[#6B7280] border-[#E0E0E0]');
  statusLabel = (s: string) => ({ pending: 'Pendiente', approved: 'Aprobado', rejected: 'Rechazado', closed: 'Cerrado' }[s] ?? s);
  statusClass = (s: string) => ({ pending: 'bg-[#FF8800]/10 text-[#FF8800] border-[#FF8800]/20', approved: 'bg-[#00A86B]/10 text-[#00A86B] border-[#00A86B]/20', rejected: 'bg-[#E53935]/10 text-[#E53935] border-[#E53935]/20', closed: 'bg-[#6B7280]/10 text-[#6B7280] border-[#6B7280]/20' }[s] ?? 'bg-[#F8FAFD] text-[#6B7280] border-[#E0E0E0]');
  formatDate = (date?: string) => date ? new Date(date).toLocaleDateString('es-MX') : '—';

  ngOnInit() { this.load(); }

  goToPage(page: number) {
    if (page < 1 || page > this.lastPage() || page === this.currentPage()) return;
    this.currentPage.set(page);
    this.load();
  }

  goToForm() {
    this.router.navigate(['/distribuidora/reclamos/nuevo']);
  }

  private load() {
    this.loading.set(true);
    this.svc.getAll(this.currentPage()).subscribe({
      next: res => {
        this.items.set(res.data ?? []);  // <-- asegura que sea el array
        this.currentPage.set(res.current_page);
        this.lastPage.set(res.last_page);
        this.total.set(res.total);
        this.loading.set(false);
      },
      error: (err) => {
        console.log('ERR:', err)
        this.items.set([]);
        this.loading.set(false);
      },
    });
  }
}