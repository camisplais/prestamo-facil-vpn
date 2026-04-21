import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditorService } from '../../core/services/auditor.service';

@Component({
  selector: 'app-auditor-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-5">
      <div>
        <h1 class="font-[Montserrat] text-[22px] font-extrabold text-[#1A1A2E]">Productos</h1>
        <p class="text-[13px] text-[#6B7280] mt-1">Historial de altas, ediciones y bajas del catálogo de productos</p>
      </div>

      <!-- Filtros -->
      <div class="flex flex-wrap gap-3 items-center">
        <select [(ngModel)]="filters.metodo" (change)="buscar()"
          class="px-3 py-[9px] border-[1.5px] border-[#E0E0E0] rounded-lg text-[13px] font-[Inter] bg-white outline-none focus:border-[#003399]">
          <option value="">Todos los métodos</option>
          <option value="POST">POST (alta)</option>
          <option value="PUT">PUT (edición)</option>
          <option value="PATCH">PATCH (actualización)</option>
        </select>
        <button (click)="limpiar()"
          class="px-4 py-[9px] rounded-lg text-[13px] font-semibold bg-white border-[1.5px] border-[#E0E0E0] text-[#003399] hover:border-[#003399] transition-colors">
          Limpiar
        </button>
      </div>

      <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
        <div class="overflow-x-auto">
          <table class="w-full text-[13px] border-collapse">
            <thead>
              <tr>
                @for (col of cols; track col) {
                  <th class="bg-[#F8FAFD] font-[Montserrat] font-bold text-[11px] text-[#6B7280] uppercase tracking-[0.5px] px-[14px] py-[11px] text-left border-b-2 border-[#E0E0E0] whitespace-nowrap">{{ col }}</th>
                }
              </tr>
            </thead>
            <tbody>
              @if (loading()) {
                <tr><td [attr.colspan]="cols.length" class="text-center py-10 text-[#6B7280]">Cargando...</td></tr>
              }
              @for (log of logs(); track log.id) {
                <tr class="border-b border-[#F0F0F0] hover:bg-[#FAFBFF]">
                  <td class="px-[14px] py-[12px]">
                    <span [class]="methodClass(log.method)"
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
                      {{ log.method }}
                    </span>
                  </td>
                  <td class="px-[14px] py-[12px] font-semibold text-[#1A1A2E]">
                    {{ log.new_data?.name ?? log.old_data?.name ?? '—' }}
                  </td>
                  <td class="px-[14px] py-[12px] font-mono text-[12px] text-[#6B7280]">
                    {{ (log.new_data?.quantity ?? log.old_data?.quantity) | currency:'MXN':'symbol':'1.2-2' }}
                  </td>
                  <td class="px-[14px] py-[12px] text-[#6B7280]">{{ log.users?.[0]?.name ?? '—' }}</td>
                  <td class="px-[14px] py-[12px] text-[#6B7280] whitespace-nowrap">
                    {{ log.occurred_at | date:'dd/MM/yyyy HH:mm' }}
                  </td>
                  <td class="px-[14px] py-[12px]">
                    <button (click)="toggleDetalle(log.id)"
                      class="text-[12px] font-semibold text-[#003399] hover:underline">
                      {{ detalleAbierto() === log.id ? 'Cerrar' : 'Ver diff' }}
                    </button>
                  </td>
                </tr>
                @if (detalleAbierto() === log.id) {
                  <tr class="bg-[#F8FAFD]">
                    <td colspan="6" class="px-[14px] py-[12px]">
                      <div class="grid grid-cols-2 gap-4">
                        <div>
                          <div class="text-[11px] font-bold text-[#6B7280] mb-1">Antes</div>
                          <pre class="bg-white border border-[#E0E0E0] rounded-lg p-3 text-[11px] overflow-auto max-h-40">{{ log.old_data | json }}</pre>
                        </div>
                        <div>
                          <div class="text-[11px] font-bold text-[#6B7280] mb-1">Después</div>
                          <pre class="bg-white border border-[#E0E0E0] rounded-lg p-3 text-[11px] overflow-auto max-h-40">{{ log.new_data | json }}</pre>
                        </div>
                      </div>
                    </td>
                  </tr>
                }
              }
              @if (!loading() && logs().length === 0) {
                <tr><td [attr.colspan]="cols.length" class="text-center py-10 text-[#6B7280]">Sin resultados</td></tr>
              }
            </tbody>
          </table>
        </div>

        @if (meta()) {
          <div class="px-5 py-3 border-t border-[#E0E0E0] flex items-center justify-between text-[13px] text-[#6B7280]">
            <span>{{ meta()!.from }}–{{ meta()!.to }} de {{ meta()!.total }}</span>
            <div class="flex gap-2">
              <button [disabled]="meta()!.current_page === 1" (click)="paginar(meta()!.current_page - 1)"
                class="px-3 py-1.5 rounded-lg border border-[#E0E0E0] bg-white hover:border-[#003399] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">‹ Anterior</button>
              <button [disabled]="meta()!.current_page === meta()!.last_page" (click)="paginar(meta()!.current_page + 1)"
                class="px-3 py-1.5 rounded-lg border border-[#E0E0E0] bg-white hover:border-[#003399] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Siguiente ›</button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class AuditorProductosComponent implements OnInit {
  private svc = inject(AuditorService);

  logs    = signal<any[]>([]);
  meta    = signal<any>(null);
  loading = signal(true);
  detalleAbierto = signal<number | null>(null);

  filters = { metodo: '' };
  cols = ['Método', 'Producto', 'Monto', 'Usuario', 'Fecha', 'Cambios'];

  ngOnInit() { this.buscar(); }

  buscar(page = 1) {
    this.loading.set(true);
    this.svc.productos({ ...this.filters, page }).subscribe({
      next: r => { this.logs.set(r.data); this.meta.set(r.meta); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  paginar(page: number) { this.buscar(page); }
  limpiar() { this.filters = { metodo: '' }; this.buscar(); }
  toggleDetalle(id: number) { this.detalleAbierto.set(this.detalleAbierto() === id ? null : id); }

  methodClass(method: string) {
    const m: Record<string, string> = {
      POST:  'bg-[#003399]/10 text-[#003399]',
      PUT:   'bg-[#FF8800]/12 text-[#FF8800]',
      PATCH: 'bg-[#F59E0B]/12 text-[#B45309]',
    };
    return m[method] ?? 'bg-[#6B7280]/10 text-[#6B7280]';
  }
}
