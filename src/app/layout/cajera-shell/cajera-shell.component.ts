import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserMenuComponent } from '../../shared/components/user-menu/user-menu.component';

@Component({
  selector: 'app-cajera-shell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, UserMenuComponent],
  template: `
    <div class="flex h-screen overflow-hidden bg-[#F4F7FA]">
      <aside [class]="collapsed() ? 'w-[68px] min-w-[68px]' : 'w-[260px] min-w-[260px]'" class="bg-[#003399] flex flex-col transition-all duration-300 overflow-hidden relative z-50">
        <div class="flex items-center gap-3 px-[18px] h-16 border-b border-white/10 flex-shrink-0">
          <div class="w-9 h-9 rounded-[9px] bg-[#FF8800] flex items-center justify-center font-extrabold text-lg text-white flex-shrink-0">P</div>
          @if (!collapsed()) {
            <div class="font-bold text-[15px] text-white leading-tight whitespace-nowrap">PrestaMo<span class="text-[#FF8800]">Facil</span></div>
          }
        </div>
        <nav class="flex-1 overflow-y-auto overflow-x-hidden py-3">
          @if (!collapsed()) {
            <p class="text-[10px] font-bold tracking-[1.5px] text-white/35 px-5 pt-3 pb-1 uppercase">Cajera</p>
          }
          <a routerLink="/cajera/conciliaciones" routerLinkActive="bg-[#FF8800] text-white" [routerLinkActiveOptions]="{ exact: true }" class="flex items-center gap-3 px-[18px] py-[9px] mx-2 my-0.5 rounded-lg cursor-pointer transition-all text-white/72 no-underline hover:bg-white/10 hover:text-white">
            <svg class="w-[18px] h-[18px] flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            @if (!collapsed()) { <span class="text-[13px] font-medium whitespace-nowrap">Conciliaciones</span> }
          </a>
          <a routerLink="/cajera/vales" routerLinkActive="bg-[#FF8800] text-white" [routerLinkActiveOptions]="{ exact: true }" class="flex items-center gap-3 px-[18px] py-[9px] mx-2 my-0.5 rounded-lg cursor-pointer transition-all text-white/72 no-underline hover:bg-white/10 hover:text-white">
            <svg class="w-[18px] h-[18px] flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/></svg>
            @if (!collapsed()) { <span class="text-[13px] font-medium whitespace-nowrap">Vales</span> }
          </a>
          <a routerLink="/cajera/reclamos" routerLinkActive="bg-[#FF8800] text-white" [routerLinkActiveOptions]="{ exact: true }" class="flex items-center gap-3 px-[18px] py-[9px] mx-2 my-0.5 rounded-lg cursor-pointer transition-all text-white/72 no-underline hover:bg-white/10 hover:text-white">
            <svg class="w-[18px] h-[18px] flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
            @if (!collapsed()) { <span class="text-[13px] font-medium whitespace-nowrap">Reclamos</span> }
          </a>
          <!-- 👇 Puntos agregado -->
          <a routerLink="/cajera/puntos" routerLinkActive="bg-[#FF8800] text-white" [routerLinkActiveOptions]="{ exact: true }" class="flex items-center gap-3 px-[18px] py-[9px] mx-2 my-0.5 rounded-lg cursor-pointer transition-all text-white/72 no-underline hover:bg-white/10 hover:text-white">
            <svg class="w-[18px] h-[18px] flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>
            @if (!collapsed()) { <span class="text-[13px] font-medium whitespace-nowrap">Puntos</span> }
          </a>
        </nav>
        <button (click)="collapsed.set(!collapsed())" class="h-12 flex items-center justify-center border-t border-white/10 cursor-pointer text-white/50 hover:text-white transition-colors flex-shrink-0 bg-transparent border-x-0 border-b-0 w-full">
          <svg [class]="collapsed() ? 'rotate-180' : ''" class="w-5 h-5 transition-transform duration-300" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
        </button>
      </aside>
      <div class="flex-1 flex flex-col overflow-hidden">
        <header class="h-16 bg-white flex items-center gap-4 px-6 border-b border-[#E0E0E0] flex-shrink-0 z-40">
          <div class="text-[13px] text-[#6B7280] flex items-center gap-1.5">
            <span>Cajera</span>
            <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
            <strong class="text-[#1A1A2E] font-semibold">Panel</strong>
          </div>
          <div class="flex-1"></div>
          <span class="bg-[#003399]/10 text-[#003399] text-[12px] font-semibold px-3 py-1 rounded-full border border-[#003399]/15">Cajera</span>
          <app-user-menu />
        </header>
        <main class="flex-1 overflow-y-auto p-7">
          <router-outlet/>
        </main>
      </div>
    </div>
  `,
})
export class CajeraShellComponent {
  protected auth = inject(AuthService);
  collapsed = signal(false);
}