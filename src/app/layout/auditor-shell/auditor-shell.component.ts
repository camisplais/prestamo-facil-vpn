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
  section?: string;
}

@Component({
  selector: 'app-auditor-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, UserMenuComponent],
  template: `
    <div class="flex h-screen overflow-hidden bg-[#F4F7FA]">

      <!-- ── SIDEBAR ── -->
      <aside
        [class]="collapsed() ? 'w-[68px] min-w-[68px]' : 'w-[260px] min-w-[260px]'"
        class="bg-[#003399] flex flex-col transition-all duration-300 overflow-hidden relative z-50 shadow-[4px_0_20px_rgba(0,0,0,0.15)]"
        aria-label="Navegación auditor"
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
          @for (item of navItems; track item.path) {
            @if (item.section && !collapsed()) {
              <p class="text-[10px] font-bold tracking-[1.5px] text-white/35 px-5 pt-4 pb-1 uppercase">
                {{ item.section }}
              </p>
            }
            <a
              [routerLink]="['/auditor', item.path]"
              routerLinkActive="bg-[#FF8800] text-white"
              class="flex items-center gap-3 px-[18px] py-[9px] mx-2 my-0.5 rounded-lg cursor-pointer transition-all duration-150 text-white/72 no-underline hover:bg-white/10 hover:text-white"
              [attr.title]="collapsed() ? item.label : null"
            >
              <span class="w-[18px] h-[18px] flex-shrink-0" [innerHTML]="item.icon" aria-hidden="true"></span>
              @if (!collapsed()) {
                <span class="text-[13px] font-medium whitespace-nowrap">{{ item.label }}</span>
              }
            </a>
          }
        </nav>

        <!-- Toggle -->
        <button
          (click)="collapsed.set(!collapsed())"
          class="h-12 flex items-center justify-center border-t border-white/10 cursor-pointer text-white/50 hover:text-white transition-colors flex-shrink-0 bg-transparent border-x-0 border-b-0 w-full"
          [attr.aria-label]="collapsed() ? 'Expandir menú' : 'Colapsar menú'"
        >
          <svg
            [class]="collapsed() ? 'rotate-180' : ''"
            class="w-5 h-5 transition-transform duration-300"
            fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"
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
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
            <span>Auditoría</span>
          </div>

          <div class="flex-1"></div>

          <span class="bg-[#003399]/10 text-[#003399] text-[12px] font-semibold px-3 py-1 rounded-full border border-[#003399]/15">
            🔍 Auditor
          </span>

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
export class AuditorShellComponent {
  protected auth = inject(AuthService);
  collapsed = signal(false);

  protected initials() {
    const name = this.auth.user()?.name ?? 'A';
    return name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase();
  }

  protected navItems: NavItem[] = [
    {
      section: 'General',
      label: 'Dashboard',
      path: 'dashboard',
      icon: `<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>`,
    },
    {
      label: 'Log de actividad',
      path: 'logs',
      icon: `<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
    },
    {
      section: 'Módulos',
      label: 'Pre-solicitudes',
      path: 'pre-solicitudes',
      icon: `<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>`,
    },
    {
      label: 'Distribuidoras',
      path: 'distribuidoras',
      icon: `<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`,
    },
    {
      label: 'Pagos y relaciones',
      path: 'pagos',
      icon: `<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>`,
    },
    {
      label: 'Productos',
      path: 'productos',
      icon: `<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"/></svg>`,
    },
    {
      section: 'Accesos',
      label: 'Usuarios',
      path: 'usuarios',
      icon: `<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>`,
    },
  ];
}
