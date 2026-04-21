import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserMenuComponent } from '../../shared/components/user-menu/user-menu.component';


@Component({
  selector: 'app-manager-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, UserMenuComponent],
  template: `
    <div class="flex h-screen overflow-hidden bg-[#F4F7FA]">
      <aside
        [class]="collapsed() ? 'w-[68px] min-w-[68px]' : 'w-[260px] min-w-[260px]'"
        class="bg-[#003399] flex flex-col transition-all duration-300 overflow-hidden relative z-50 shadow-[4px_0_20px_rgba(0,0,0,0.15)]"
        aria-label="Navegación gerente"
      >
        <div class="flex items-center gap-3 px-[18px] h-16 border-b border-white/10 flex-shrink-0">
          <div class="w-9 h-9 rounded-[9px] bg-[#FF8800] flex items-center justify-center font-extrabold text-lg text-white flex-shrink-0 font-[Montserrat]">P</div>
          @if (!collapsed()) {
            <div class="font-[Montserrat] font-bold text-[15px] text-white leading-tight whitespace-nowrap">
              Préstamo<span class="text-[#FF8800]">Fácil</span>
            </div>
          }
        </div>

        <nav class="flex-1 overflow-y-auto overflow-x-hidden py-3">
          @if (!collapsed()) {
            <p class="text-[10px] font-bold tracking-[1.5px] text-white/35 px-5 pt-3 pb-1 uppercase">Gerente</p>
          }
          <a
            routerLink="/gerente/solicitudes"
            routerLinkActive="bg-[#FF8800] text-white"
            [routerLinkActiveOptions]="{ exact: true }"
            class="flex items-center gap-3 px-[18px] py-[9px] mx-2 my-0.5 rounded-lg cursor-pointer transition-all text-white/72 no-underline hover:bg-white/10 hover:text-white"
            [attr.title]="collapsed() ? 'Solicitudes' : null"
          >
            <svg class="w-[18px] h-[18px] flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            @if (!collapsed()) {
              <span class="text-[13px] font-medium whitespace-nowrap">Solicitudes</span>
            }
          </a>
          <a
            routerLink="/gerente/distribuidoras"
            routerLinkActive="bg-[#FF8800] text-white"
            [routerLinkActiveOptions]="{ exact: true }"
            class="flex items-center gap-3 px-[18px] py-[9px] mx-2 my-0.5 rounded-lg cursor-pointer transition-all text-white/72 no-underline hover:bg-white/10 hover:text-white"
            [attr.title]="collapsed() ? 'Distribuidoras' : null"
          >
            <svg class="w-[18px] h-[18px] flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            @if (!collapsed()) {
              <span class="text-[13px] font-medium whitespace-nowrap">Distribuidoras</span>
            }
          </a>
          <a
            routerLink="/gerente/puntos"
            routerLinkActive="bg-[#FF8800] text-white"
            [routerLinkActiveOptions]="{ exact: true }"
            class="flex items-center gap-3 px-[18px] py-[9px] mx-2 my-0.5 rounded-lg cursor-pointer transition-all text-white/72 no-underline hover:bg-white/10 hover:text-white"
            [attr.title]="collapsed() ? 'Puntos' : null"
          >
            <svg class="w-[18px] h-[18px] flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 10v-1m0 0c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            @if (!collapsed()) {
              <span class="text-[13px] font-medium whitespace-nowrap">Puntos</span>
            }
          </a>
          <a
            routerLink="/gerente/reclamos"
            routerLinkActive="bg-[#FF8800] text-white"
            [routerLinkActiveOptions]="{ exact: true }"
            class="flex items-center gap-3 px-[18px] py-[9px] mx-2 my-0.5 rounded-lg cursor-pointer transition-all text-white/72 no-underline hover:bg-white/10 hover:text-white"
            [attr.title]="collapsed() ? 'Reclamos' : null"
          >
            <svg class="w-[18px] h-[18px] flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            </svg>
            @if (!collapsed()) {
              <span class="text-[13px] font-medium whitespace-nowrap">Reclamos</span>
            }
          </a>
          <a
            routerLink="/gerente/reportes"
            routerLinkActive="bg-[#FF8800] text-white"
            [routerLinkActiveOptions]="{ exact: true }"
            class="flex items-center gap-3 px-[18px] py-[9px] mx-2 my-0.5 rounded-lg cursor-pointer transition-all text-white/72 no-underline hover:bg-white/10 hover:text-white"
            [attr.title]="collapsed() ? 'Reportes' : null"
          >
            <svg class="w-[18px] h-[18px] flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            @if (!collapsed()) {
              <span class="text-[13px] font-medium whitespace-nowrap">Reportes</span>
            }
          </a>
          <a
            routerLink="/gerente/historial"
            routerLinkActive="bg-[#FF8800] text-white"
            [routerLinkActiveOptions]="{ exact: true }"
            class="flex items-center gap-3 px-[18px] py-[9px] mx-2 my-0.5 rounded-lg cursor-pointer transition-all text-white/72 no-underline hover:bg-white/10 hover:text-white"
            [attr.title]="collapsed() ? 'Historial Pagos' : null"
          >
            <svg class="w-[18px] h-[18px] flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
            </svg>
            @if (!collapsed()) {
              <span class="text-[13px] font-medium whitespace-nowrap">Historial Pagos</span>
            }
          </a>
        </nav>

        <button
          (click)="collapsed.set(!collapsed())"
          class="h-12 flex items-center justify-center border-t border-white/10 cursor-pointer text-white/50 hover:text-white transition-colors flex-shrink-0 bg-transparent border-x-0 border-b-0 w-full"
          [attr.aria-label]="collapsed() ? 'Expandir menú' : 'Colapsar menú'"
        >
          <svg [class]="collapsed() ? 'rotate-180' : ''" class="w-5 h-5 transition-transform duration-300" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
      </aside>

      <div class="flex-1 flex flex-col overflow-hidden">
        <header class="h-16 bg-white flex items-center gap-4 px-6 border-b border-[#E0E0E0] flex-shrink-0 z-40 shadow-[0_1px_8px_rgba(0,0,0,0.06)]">
          <div class="text-[13px] text-[#6B7280] flex items-center gap-1.5">
            <span>Gerente</span>
            <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
            </svg>
            <strong class="text-[#1A1A2E] font-semibold">Panel</strong>
          </div>

          <div class="flex-1"></div>

          <span class="bg-[#003399]/10 text-[#003399] text-[12px] font-semibold px-3 py-1 rounded-full border border-[#003399]/15">
            Gerente
          </span>

          <app-user-menu />
        </header>

        <main class="flex-1 overflow-y-auto p-7">
          <router-outlet/>
        </main>
      </div>
    </div>
  `,
})
export class ManagerShellComponent {
  protected auth = inject(AuthService);
  collapsed = signal(false);

  protected initials() {
    const name = this.auth.user()?.name ?? 'M';
    return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  }
}
