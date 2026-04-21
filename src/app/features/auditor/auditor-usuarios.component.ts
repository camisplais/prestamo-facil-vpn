import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuditorService } from '../../core/services/auditor.service';

@Component({
  selector: 'app-auditor-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-5">
      <div>
        <h1 class="font-[Montserrat] text-[22px] font-extrabold text-[#1A1A2E]">Usuarios</h1>
        <p class="text-[13px] text-[#6B7280] mt-1">Directorio de usuarios y acceso a su historial de actividad</p>
      </div>

      <!-- Filtros -->
      <div class="flex flex-wrap gap-3 items-center">
        <div class="relative flex-1 min-w-[200px]">
          <svg class="absolute left-2.5 top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-[#6B7280]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input [(ngModel)]="filters.buscar" (input)="buscar()"
            placeholder="Buscar por nombre o email..."
            class="pl-9 pr-3 py-[9px] border-[1.5px] border-[#E0E0E0] rounded-lg text-[13px] font-[Inter] bg-white w-full outline-none focus:border-[#003399]">
        </div>

        <select [(ngModel)]="filters.rol" (change)="buscar()"
          class="px-3 py-[9px] border-[1.5px] border-[#E0E0E0] rounded-lg text-[13px] font-[Inter] bg-white outline-none focus:border-[#003399]">
          <option value="">Todos los roles</option>
          <option value="admin">Admin</option>
          <option value="super_admin">Super Admin</option>
          <option value="gerente">Gerente</option>
          <option value="coordinador">Coordinador</option>
          <option value="verificador">Verificador</option>
          <option value="cajera">Cajera</option>
          <option value="auditor">Auditor</option>
        </select>

        <select [(ngModel)]="filters.estado" (change)="buscar()"
          class="px-3 py-[9px] border-[1.5px] border-[#E0E0E0] rounded-lg text-[13px] font-[Inter] bg-white outline-none focus:border-[#003399]">
          <option value="">Todos los estados</option>
          <option value="activo">Activos</option>
          <option value="inactivo">Inactivos</option>
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
              @for (u of usuarios(); track u.id) {
                <tr class="border-b border-[#F0F0F0] hover:bg-[#FAFBFF]">
                  <td class="px-[14px] py-[12px]">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-full bg-[#003399] text-white flex items-center justify-center font-bold text-[13px] font-[Montserrat] flex-shrink-0">
                        {{ u.name?.charAt(0)?.toUpperCase() }}
                      </div>
                      <div>
                        <div class="font-semibold text-[#1A1A2E]">{{ u.name }}</div>
                        <div class="text-[11px] text-[#6B7280]">{{ u.email }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-[14px] py-[12px]">
                    <div class="flex flex-wrap gap-1">
                      @for (rol of u.roles; track rol.name) {
                        <span class="bg-[#003399]/10 text-[#003399] text-[11px] font-semibold px-2 py-0.5 rounded-full">
                          {{ rol.name }}
                        </span>
                      }
                    </div>
                  </td>
                  <td class="px-[14px] py-[12px]">
                    @if (u.status) {
                      <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#00A86B]/10 text-[#00A86B]">
                        Activo
                      </span>
                    } @else {
                      <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#E53935]/10 text-[#E53935]">
                        Inactivo
                      </span>
                    }
                  </td>
                  <td class="px-[14px] py-[12px] text-[#6B7280] whitespace-nowrap">
                    {{ u.created_at | date:'dd/MM/yyyy' }}
                  </td>
                  <td class="px-[14px] py-[12px]">
                    <button (click)="verActividad(u.id)"
                      class="text-[12px] font-semibold text-[#003399] hover:underline bg-transparent border-0 cursor-pointer p-0">
                      Ver actividad →
                    </button>
                  </td>
                </tr>
              }
              @if (!loading() && usuarios().length === 0) {
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
export class AuditorUsuariosComponent implements OnInit {
  private svc    = inject(AuditorService);
  private router = inject(Router);

  /** Navega al detalle del usuario preservando el contexto (admin o auditor). */
  verActividad(id: number) {
    const url = this.router.url;
    const base = url.startsWith('/admin') ? '/admin/auditor/usuarios' : '/auditor/usuarios';
    this.router.navigate([base, id]);
  }

  usuarios = signal<any[]>([]);
  meta     = signal<any>(null);
  loading  = signal(true);

  filters = { buscar: '', rol: '', estado: '' };
  cols = ['Usuario', 'Roles', 'Estado', 'Alta', 'Actividad'];

  ngOnInit() { this.buscar(); }

  buscar(page = 1) {
    this.loading.set(true);
    this.svc.usuarios({ ...this.filters, page }).subscribe({
      next: r => { this.usuarios.set(r.data); this.meta.set(r.meta); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  paginar(page: number) { this.buscar(page); }
  limpiar() { this.filters = { buscar: '', rol: '', estado: '' }; this.buscar(); }
}