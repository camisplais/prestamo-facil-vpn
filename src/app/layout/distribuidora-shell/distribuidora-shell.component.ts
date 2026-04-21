import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserMenuComponent } from '../../shared/components/user-menu/user-menu.component';

@Component({
  selector: 'app-distribuidora-shell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, UserMenuComponent],
  template: `
    <div class="flex h-screen overflow-hidden bg-[#F4F7FA]">

  <!-- Overlay móvil -->
  <div
    (click)="collapsed.set(true)"
    class="fixed inset-0 bg-black/40 z-40 lg:hidden transition-opacity duration-300"
    [class.opacity-0]="collapsed()"
    [class.pointer-events-none]="collapsed()"
  ></div>

  <!-- Sidebar -->
  <aside
    [class]="collapsed() ? 'lg:w-[68px] lg:min-w-[68px] -translate-x-full lg:translate-x-0' : 'w-[260px] min-w-[260px] translate-x-0'"
    class="fixed lg:relative inset-y-0 left-0 bg-[#003399] flex flex-col transition-all duration-300 overflow-hidden z-50"
  >
    <div class="flex items-center gap-3 px-[18px] h-16 border-b border-white/10 flex-shrink-0">
      <div class="w-9 h-9 rounded-[9px] bg-[#FF8800] flex items-center justify-center font-extrabold text-lg text-white flex-shrink-0">P</div>
      @if (!collapsed()) {
        <div class="font-bold text-[15px] text-white leading-tight whitespace-nowrap">PrestaMo<span class="text-[#FF8800]">Facil</span></div>
      }
      <!-- Cerrar en móvil -->
      <button
        (click)="collapsed.set(true)"
        class="lg:hidden ml-auto bg-transparent border-0 text-white/60 hover:text-white cursor-pointer p-1"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>

    <nav class="flex-1 overflow-y-auto overflow-x-hidden py-3">
      @if (!collapsed()) {
        <p class="text-[10px] font-bold tracking-[1.5px] text-white/35 px-5 pt-3 pb-1 uppercase">Distribuidora</p>
      }
      <a routerLink="/distribuidora/clientes" routerLinkActive="bg-[#FF8800] text-white" [routerLinkActiveOptions]="{ exact: true }" (click)="collapsed.set(true)" class="flex items-center gap-3 px-[18px] py-[9px] mx-2 my-0.5 rounded-lg cursor-pointer transition-all text-white/70 no-underline hover:bg-white/10 hover:text-white">
        <svg class="w-[18px] h-[18px] flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path stroke-linecap="round" stroke-linejoin="round" d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
        @if (!collapsed()) { <span class="text-[13px] font-medium whitespace-nowrap">Clientes</span> }
      </a>
      <a routerLink="/distribuidora/incentivos" routerLinkActive="bg-[#FF8800] text-white" [routerLinkActiveOptions]="{ exact: true }" (click)="collapsed.set(true)" class="flex items-center gap-3 px-[18px] py-[9px] mx-2 my-0.5 rounded-lg cursor-pointer transition-all text-white/70 no-underline hover:bg-white/10 hover:text-white">
        <svg class="w-[18px] h-[18px] flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        @if (!collapsed()) { <span class="text-[13px] font-medium whitespace-nowrap">Incentivos</span> }
      </a>
      <a routerLink="/distribuidora/vales" routerLinkActive="bg-[#FF8800] text-white" [routerLinkActiveOptions]="{ exact: true }" (click)="collapsed.set(true)" class="flex items-center gap-3 px-[18px] py-[9px] mx-2 my-0.5 rounded-lg cursor-pointer transition-all text-white/70 no-underline hover:bg-white/10 hover:text-white">
        <svg class="w-[18px] h-[18px] flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/></svg>
        @if (!collapsed()) { <span class="text-[13px] font-medium whitespace-nowrap">Vales</span> }
      </a>
      <a routerLink="/distribuidora/mis-pagos" routerLinkActive="bg-[#FF8800] text-white" [routerLinkActiveOptions]="{ exact: true }" (click)="collapsed.set(true)" class="flex items-center gap-3 px-[18px] py-[9px] mx-2 my-0.5 rounded-lg cursor-pointer transition-all text-white/70 no-underline hover:bg-white/10 hover:text-white">
        <svg class="w-[18px] h-[18px] flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
        </svg>
        @if (!collapsed()) { <span class="text-[13px] font-medium whitespace-nowrap">Mis Pagos</span> }
      </a>
      <a routerLink="/distribuidora/reclamos" routerLinkActive="bg-[#FF8800] text-white" [routerLinkActiveOptions]="{ exact: true }" (click)="collapsed.set(true)" class="flex items-center gap-3 px-[18px] py-[9px] mx-2 my-0.5 rounded-lg cursor-pointer transition-all text-white/70 no-underline hover:bg-white/10 hover:text-white">
        <svg class="w-[18px] h-[18px] flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
        @if (!collapsed()) { <span class="text-[13px] font-medium whitespace-nowrap">Reclamos</span> }
      </a>
    </nav>

    <button (click)="collapsed.set(!collapsed())" class="h-12 flex items-center justify-center border-t border-white/10 cursor-pointer text-white/50 hover:text-white transition-colors flex-shrink-0 bg-transparent border-x-0 border-b-0 w-full">
      <svg [class]="collapsed() ? 'lg:rotate-180' : ''" class="w-5 h-5 transition-transform duration-300" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
      </svg>
    </button>
  </aside>

  <!-- Main -->
  <div class="flex-1 flex flex-col overflow-hidden">
    <header class="h-16 bg-white flex items-center gap-4 px-4 md:px-6 border-b border-[#E0E0E0] flex-shrink-0 z-40">
      <!-- Hamburger solo en móvil/tablet -->
      <button
        (click)="collapsed.set(false)"
        class="lg:hidden bg-transparent border-0 text-[#6B7280] hover:text-[#1A1A2E] cursor-pointer p-1 -ml-1"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      </button>

      <div class="text-[13px] text-[#6B7280] flex items-center gap-1.5">
        <span>Distribuidora</span>
        <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
        <strong class="text-[#1A1A2E] font-semibold">Panel</strong>
      </div>
      <div class="flex-1"></div>
      <span class="hidden sm:inline bg-[#003399]/10 text-[#003399] text-[12px] font-semibold px-3 py-1 rounded-full border border-[#003399]/15">Distribuidora</span>
      <app-user-menu />
    </header>
    <main class="flex-1 overflow-y-auto p-4 md:p-7">
      <router-outlet/>
    </main>
  </div>
</div>
  `,
})
export class DistribuidoraShellComponent {
  protected auth = inject(AuthService);
  collapsed = signal(false);
}