import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuditorService } from '../../core/services/auditor.service';

@Component({
  selector: 'app-auditor-usuario-detalle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">

      <!-- Back -->
      <button (click)="volver()"
        class="inline-flex items-center gap-1.5 text-[13px] text-[#003399] font-semibold hover:underline bg-transparent border-0 cursor-pointer p-0">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
        </svg>
        Volver a usuarios
      </button>

      @if (loading()) {
        <div class="flex items-center justify-center h-40 text-[#6B7280] text-[14px]">Cargando...</div>
      }

      @if (usuario()) {
        <!-- Header usuario -->
        <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] p-5 flex items-center gap-5">
          <div class="w-14 h-14 rounded-full bg-[#003399] text-white flex items-center justify-center font-bold text-[20px] font-[Montserrat] flex-shrink-0">
            {{ usuario()!.name?.charAt(0)?.toUpperCase() }}
          </div>
          <div class="flex-1">
            <h1 class="font-[Montserrat] text-[20px] font-extrabold text-[#1A1A2E]">{{ usuario()!.name }}</h1>
            <p class="text-[13px] text-[#6B7280]">{{ usuario()!.email }}</p>
            <div class="flex flex-wrap gap-1.5 mt-2">
              @for (rol of usuario()!.roles; track rol.name) {
                <span class="bg-[#003399]/10 text-[#003399] text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                  {{ rol.name }}
                </span>
              }
              <span [class]="usuario()!.status ? 'bg-[#00A86B]/10 text-[#00A86B]' : 'bg-[#E53935]/10 text-[#E53935]'"
                class="text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                {{ usuario()!.status ? 'Activo' : 'Inactivo' }}
              </span>
            </div>
          </div>
          <div class="text-right text-[13px] text-[#6B7280]">
            <div class="font-semibold text-[#1A1A2E] text-[22px] font-[Montserrat]">{{ totalLogs() }}</div>
            <div>eventos registrados</div>
          </div>
        </div>

        <!-- Logs del usuario -->
        <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
          <div class="px-5 py-4 border-b border-[#E0E0E0]">
            <span class="font-[Montserrat] font-bold text-[14px] text-[#1A1A2E]">Historial de actividad</span>
          </div>
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
                @for (log of logs(); track log.id) {
                  <tr class="border-b border-[#F0F0F0] hover:bg-[#FAFBFF]">
                    <td class="px-[14px] py-[12px]">
                      <span [class]="methodClass(log.method)"
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
                        {{ log.method }}
                      </span>
                    </td>
                    <td class="px-[14px] py-[12px]">
                      <span class="font-mono text-[12px] bg-[#F0F4FF] text-[#003399] px-2 py-0.5 rounded">
                        {{ log.table_name }}
                      </span>
                    </td>
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
                      <td colspan="4" class="px-[14px] py-[12px]">
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
                @if (logs().length === 0) {
                  <tr><td colspan="4" class="text-center py-10 text-[#6B7280]">Sin actividad registrada para este usuario</td></tr>
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
      }
    </div>
  `,
})
export class AuditorUsuarioDetalleComponent implements OnInit {
  private svc    = inject(AuditorService);
  private route  = inject(ActivatedRoute);
  private router = inject(Router);

  volver() {
    const url = this.router.url;
    const base = url.startsWith('/admin') ? '/admin/auditor/usuarios' : '/auditor/usuarios';
    this.router.navigate([base]);
  }

  usuario  = signal<any>(null);
  logs     = signal<any[]>([]);
  meta     = signal<any>(null);
  loading  = signal(true);
  detalleAbierto = signal<number | null>(null);

  cols = ['Método', 'Tabla', 'Fecha', 'Cambios'];

  get totalLogs() {
    return () => this.meta()?.total ?? this.logs().length;
  }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.cargar(id);
  }

  cargar(id: number, page = 1) {
    this.loading.set(true);
    this.svc.logsPorUsuario(id, page).subscribe({
      next: r => {
        this.usuario.set(r.usuario);
        this.logs.set(r.logs.data);
        this.meta.set(r.logs.meta);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  paginar(page: number) {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.cargar(id, page);
  }

  toggleDetalle(id: number) {
    this.detalleAbierto.set(this.detalleAbierto() === id ? null : id);
  }

  methodClass(method: string) {
    const m: Record<string, string> = {
      POST:  'bg-[#003399]/10 text-[#003399]',
      PUT:   'bg-[#FF8800]/12 text-[#FF8800]',
      PATCH: 'bg-[#F59E0B]/12 text-[#B45309]',
      GET:   'bg-[#6B7280]/10 text-[#6B7280]',
    };
    return m[method] ?? 'bg-[#6B7280]/10 text-[#6B7280]';
  }
}
