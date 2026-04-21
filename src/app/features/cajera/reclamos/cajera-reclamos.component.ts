import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { CashierReclamoService } from '../../../core/services/cashier-reclamo.service';
import { Reclamo } from '../../../core/models';

@Component({
  selector: 'app-cajera-reclamos',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  template: `
    <div>
      <div class="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 class="font-[Montserrat] text-[22px] font-extrabold text-[#1A1A2E]">Reclamos aprobados</h1>
          <p class="text-[13px] text-[#6B7280] mt-0.5">Reclamos autorizados por el gerente pendientes de conciliación</p>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 gap-4 mb-6">
        <div class="bg-white rounded-[10px] p-5 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
          <div class="font-[Montserrat] text-[22px] font-extrabold text-[#1A1A2E]">{{ items().length }}</div>
          <div class="text-[12px] text-[#6B7280] mt-0.5">Total</div>
        </div>
        <div class="bg-white rounded-[10px] p-5 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
          <div class="font-[Montserrat] text-[22px] font-extrabold text-[#0288D1]">{{ items().length }}</div>
          <div class="text-[12px] text-[#6B7280] mt-0.5">Transferencias</div>
        </div>
      </div>

      <!-- Tabla -->
      <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
        <div class="px-5 py-4 border-b border-[#E0E0E0]">
          <span class="font-[Montserrat] font-bold text-[14px] text-[#1A1A2E]">Lista de reclamos</span>
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
                      <span class="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border bg-[#0288D1]/10 text-[#0288D1] border-[#0288D1]/20">
                        Transferencia
                      </span>
                    </td>
                    <td class="px-5 py-3 text-[#6B7280] font-mono text-[12px]">{{ item.reference_number || '—' }}</td>
                    <td class="px-5 py-3 text-[#6B7280]">{{ formatDate(item.created_at) }}</td>
                    <td class="px-5 py-3">
                      <button
                        (click)="navigateToDetail(item)"
                        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-[#003399]/10 text-[#003399] hover:bg-[#003399] hover:text-white transition-colors border-0 cursor-pointer"
                      >
                        <svg class="w-[13px] h-[13px]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                        </svg>
                        Conciliar
                      </button>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="5" class="px-5 py-12 text-center text-[#6B7280] text-[13px]">
                      No hay reclamos aprobados pendientes de conciliación.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>
  `,
})
export class CajeraReclamosComponent implements OnInit {
  private svc    = inject(CashierReclamoService);
  private router = inject(Router);

  items   = signal<Reclamo[]>([]);
  loading = signal(true);

  headers = ['Distribuidora', 'Tipo', 'Referencia', 'Fecha', 'Acciones'];

  distributorName = (item: Reclamo) => {
    const pd = (item.distributor as any)?.person_data;
    if (!pd) return '—';
    return [pd.name, pd.first_last_name, pd.second_last_name].filter(Boolean).join(' ');
  };

  formatDate = (date?: string) => date ? new Date(date).toLocaleDateString('es-MX') : '—';

  ngOnInit() { this.load(); }

  navigateToDetail(item: Reclamo) {
    this.router.navigate(['/cajera/reclamos', item.id], {
      state: { reclamo: item }
    });
  }

  private load() {
    this.loading.set(true);
    this.svc.getAll().subscribe({
      next: items => { this.items.set(items); this.loading.set(false); },
      error: ()    => { this.items.set([]);   this.loading.set(false); },
    });
  }
}