import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserMenuComponent } from '../../shared/components/user-menu/user-menu.component';


@Component({
  selector: 'app-coordinator-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, UserMenuComponent],
  template: `
    <div class="flex h-screen overflow-hidden bg-[#F4F7FA] relative">

      <!-- Overlay para cerrar sidebar en mobile/tablet cuando está abierto -->
      @if (mobileOpen()) {
        <div
          class="fixed inset-0 bg-black/40 z-40 lg:hidden"
          (click)="mobileOpen.set(false)"
          aria-hidden="true"
        ></div>
      }

      <!-- Sidebar
           - En desktop (lg+): visible según collapsed()
           - En tablet (md < lg): siempre colapsado como mini-rail
           - En mobile (< md): oculto por defecto, se abre con hamburguesa -->
      <aside
        [class]="sidebarClasses()"
        class="bg-[#003399] flex flex-col transition-all duration-300 overflow-hidden shadow-[4px_0_20px_rgba(0,0,0,0.15)]
               fixed lg:relative inset-y-0 left-0 z-50"
        aria-label="Navegación coordinador"
      >
        <div class="flex items-center gap-3 px-[18px] h-16 border-b border-white/10 flex-shrink-0">
          <div class="w-9 h-9 rounded-[9px] bg-[#FF8800] flex items-center justify-center font-extrabold text-lg text-white flex-shrink-0 font-[Montserrat]">P</div>
          @if (showLabels()) {
            <div class="font-[Montserrat] font-bold text-[15px] text-white leading-tight whitespace-nowrap">
              Préstamo<span class="text-[#FF8800]">Fácil</span>
            </div>
          }
        </div>

        <nav class="flex-1 overflow-y-auto overflow-x-hidden py-3">
          @if (showLabels()) {
            <p class="text-[10px] font-bold tracking-[1.5px] text-white/35 px-5 pt-3 pb-1 uppercase">Coordinador</p>
          }
          <a
            routerLink="/coordinador/pre-solicitudes"
            routerLinkActive="bg-[#FF8800] text-white"
            (click)="mobileOpen.set(false)"
            class="flex items-center gap-3 px-[18px] py-[9px] mx-2 my-0.5 rounded-lg cursor-pointer transition-all text-white/72 no-underline hover:bg-white/10 hover:text-white"
            [attr.title]="showLabels() ? null : 'Pre-Solicitudes'"
          >
            <svg class="w-[18px] h-[18px] flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            @if (showLabels()) {
              <span class="text-[13px] font-medium whitespace-nowrap">Pre-Solicitudes</span>
            }
          </a>
          <a
            routerLink="/coordinador/reclamos"
            routerLinkActive="bg-[#FF8800] text-white"
            (click)="mobileOpen.set(false)"
            class="flex items-center gap-3 px-[18px] py-[9px] mx-2 my-0.5 rounded-lg cursor-pointer transition-all text-white/72 no-underline hover:bg-white/10 hover:text-white"
            [attr.title]="showLabels() ? null : 'Reclamos'"
          >
            <svg class="w-[18px] h-[18px] flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            </svg>
            @if (showLabels()) {
              <span class="text-[13px] font-medium whitespace-nowrap">Reclamos</span>
            }
          </a>
        </nav>

        <!-- Botón colapsar: solo útil en desktop. En tablet/mobile se oculta. -->
        <button
          (click)="collapsed.set(!collapsed())"
          class="hidden lg:flex h-12 items-center justify-center border-t border-white/10 cursor-pointer text-white/50 hover:text-white transition-colors flex-shrink-0 bg-transparent border-x-0 border-b-0 w-full"
          [attr.aria-label]="collapsed() ? 'Expandir menú' : 'Colapsar menú'"
        >
          <svg [class]="collapsed() ? 'rotate-180' : ''" class="w-5 h-5 transition-transform duration-300" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
      </aside>

      <!-- Main -->
      <div class="flex-1 flex flex-col overflow-hidden min-w-0">
        <header class="h-16 bg-white flex items-center gap-3 sm:gap-4 px-4 sm:px-6 border-b border-[#E0E0E0] flex-shrink-0 z-40 shadow-[0_1px_8px_rgba(0,0,0,0.06)]">

          <!-- Botón hamburguesa: solo visible debajo de lg -->
          <button
            (click)="mobileOpen.set(!mobileOpen())"
            class="lg:hidden p-2 -ml-2 rounded-lg text-[#6B7280] hover:bg-[#F4F7FA] transition-colors"
            aria-label="Abrir menú"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>

          <div class="text-[13px] text-[#6B7280] flex items-center gap-1.5 min-w-0">
            <span class="hidden sm:inline">Coordinador</span>
            <svg class="w-3 h-3 hidden sm:inline" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
            </svg>
            <strong class="text-[#1A1A2E] font-semibold truncate">Panel</strong>
          </div>
          <div class="flex-1"></div>
          <span class="hidden sm:inline bg-[#003399]/10 text-[#003399] text-[12px] font-semibold px-3 py-1 rounded-full border border-[#003399]/15">
            Coordinador
          </span>
          <app-user-menu />
        </header>

        <main class="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-7">
          <router-outlet/>
        </main>
      </div>
    </div>
  `,
})
export class CoordinatorShellComponent implements OnInit {
  protected auth = inject(AuthService);

  // Estado en desktop: ¿sidebar colapsado como mini-rail?
  collapsed = signal(false);

  // Estado en mobile/tablet: ¿sidebar abierto sobre el overlay?
  mobileOpen = signal(false);

  // ¿El viewport es >= lg (1024px)? Desktop real.
  isDesktop = signal(false);

  ngOnInit() {
    this.updateViewport();
  }

  @HostListener('window:resize')
  onResize() {
    this.updateViewport();
  }

  private updateViewport() {
    this.isDesktop.set(window.innerWidth >= 1024);
  }

  /** ¿Mostrar textos del sidebar o solo íconos? */
  protected showLabels(): boolean {
    if (this.isDesktop()) {
      return !this.collapsed();
    }
    // En tablet/mobile, cuando está abierto sí mostramos labels
    return this.mobileOpen();
  }

  /** Clases dinámicas del aside según viewport y estado */
  protected sidebarClasses(): string {
    if (this.isDesktop()) {
      // Desktop: según collapsed, siempre visible
      return this.collapsed()
        ? 'w-[68px] min-w-[68px]'
        : 'w-[260px] min-w-[260px]';
    }
    // Mobile/tablet: off-canvas. Cuando está abierto, ancho completo visual.
    return this.mobileOpen()
      ? 'w-[260px] min-w-[260px] translate-x-0'
      : 'w-[260px] min-w-[260px] -translate-x-full';
  }

  protected initials() {
    const name = this.auth.user()?.name ?? 'C';
    return name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase();
  }
}