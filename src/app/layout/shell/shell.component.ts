import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserMenuComponent } from '../../shared/components/user-menu/user-menu.component';


interface NavItem {
  label: string;
  path: string;
  icon: string;
  absolute?: boolean;
}

@Component({
  selector: 'app-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive,UserMenuComponent],
  template: `
    <div class="flex h-screen overflow-hidden bg-[#F4F7FA]">

      <!-- ── SIDEBAR ── -->
      <aside
        [class]="collapsed() ? 'w-[68px] min-w-[68px]' : 'w-[260px] min-w-[260px]'"
        class="bg-[#003399] flex flex-col transition-all duration-300 overflow-hidden relative z-50 shadow-[4px_0_20px_rgba(0,0,0,0.15)]"
        aria-label="Navegación principal"
      >
        <!-- Logo -->
        <div class="flex items-center gap-3 px-[18px] h-16 border-b border-white/10 flex-shrink-0">
          <div class="w-9 h-9 rounded-[9px] bg-[#FF8800] flex items-center justify-center font-extrabold text-lg text-white flex-shrink-0 font-[Montserrat]">
            P
          </div>
          @if (!collapsed()) {
            <div class="font-[Montserrat] font-bold text-[15px] text-white leading-tight whitespace-nowrap">
              Préstamo<span class="text-[#FF8800]">Fácil</span>
            </div>
          }
        </div>

        <!-- Nav -->
        <nav class="flex-1 overflow-y-auto overflow-x-hidden py-3" role="navigation">

          <!-- ── Administración ── -->
          @if (!collapsed()) {
            <p class="text-[10px] font-bold tracking-[1.5px] text-white/35 px-5 pt-3 pb-1 uppercase">
              Administración
            </p>
          }

          @for (item of navItems; track item.path) {
            <a
              [routerLink]="item.absolute ? item.path : '/admin/' + item.path"
              routerLinkActive="bg-[#FF8800] text-white"
              [routerLinkActiveOptions]="{ exact: true }"
              class="flex items-center gap-3 px-[18px] py-[9px] mx-2 my-0.5 rounded-lg cursor-pointer transition-all duration-150 text-white/72 no-underline hover:bg-white/10 hover:text-white"
              [attr.aria-label]="item.label"
              [attr.title]="collapsed() ? item.label : null"
            >
              <span class="w-[18px] h-[18px] flex-shrink-0" [innerHTML]="item.icon" aria-hidden="true"></span>
              @if (!collapsed()) {
                <span class="text-[13px] font-medium whitespace-nowrap">{{ item.label }}</span>
              }
            </a>
          }


        </nav>

        <!-- Toggle collapse -->
        <button
          (click)="collapsed.set(!collapsed())"
          class="h-12 flex items-center justify-center border-t border-white/10 cursor-pointer text-white/50 hover:text-white transition-colors flex-shrink-0 bg-transparent border-x-0 border-b-0 w-full"
          [attr.aria-label]="collapsed() ? 'Expandir menú' : 'Colapsar menú'"
        >
          <svg
            [class]="collapsed() ? 'rotate-180' : ''"
            class="w-5 h-5 transition-transform duration-300"
            fill="none" stroke="currentColor" stroke-width="2"
            viewBox="0 0 24 24" aria-hidden="true"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
      </aside>

      <!-- ── MAIN ── -->
      <div class="flex-1 flex flex-col overflow-hidden">

        <!-- Topbar -->
        <header class="h-16 bg-white flex items-center gap-4 px-6 border-b border-[#E0E0E0] flex-shrink-0 z-40 shadow-[0_1px_8px_rgba(0,0,0,0.06)]">
          <div class="text-[13px] text-[#6B7280] flex items-center gap-1.5">
            <span>Admin</span>
            <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
            </svg>
            <strong class="text-[#1A1A2E] font-semibold">Panel</strong>
          </div>

          <div class="flex-1"></div>

          <span class="bg-[#003399]/10 text-[#003399] text-[12px] font-semibold px-3 py-1 rounded-full border border-[#003399]/15">
            Administrador
          </span>

          <button
            class="w-9 h-9 rounded-full bg-[#F4F7FA] flex items-center justify-center text-[#6B7280] hover:bg-[#E0E0E0] transition-colors border-0 cursor-pointer relative"
            aria-label="Notificaciones"
          >
            <svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
            </svg>
          </button>

          <app-user-menu />
        </header>

        <!-- Page content -->
        <main class="flex-1 overflow-y-auto p-7" id="main-content">
          <router-outlet/>
        </main>
      </div>
    </div>
  `,
})
export class ShellComponent {
  protected auth = inject(AuthService);

  collapsed = signal(false);

  protected initials() {
    const name = this.auth.user()?.name ?? 'A';
    return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  }

  protected navItems: NavItem[] = [
    {
      label: 'Productos',
      path: 'productos',
      icon: `<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"/></svg>`,
    },
    {
      label: 'Sucursales',
      path: 'sucursales',
      icon: `<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>`,
    },
    {
      path: 'fechas-corte',
      label: 'Fechas de Corte',
      icon: `<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>`,
    },
    {
      label: 'Gerentes',
      path:  'gerentes',
      icon:  `<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round"
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
      </svg>`,
    },
    {
      label: 'Coordinadores',
      path: 'coordinadores',
      icon: `<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`,
    },
    {
      label: 'Verificadores',
      path: 'verificadores',
      icon: `<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>`,
    },
    {
      label: 'Cajeras',
      path: 'cajeras',
      icon: `<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg>`,
    },
    {
      label: 'Pre-solicitudes',
      path: 'pre-solicitudes',
      icon: `<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>`,
    },
    {
      label: 'Reclamos',
      path: 'reclamos',
      icon: `<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`,
    },
    {
      label: 'Vales',
      path: 'vales',
      icon: `<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/></svg>`,
    },
  ];


}