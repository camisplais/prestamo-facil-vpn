import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-user-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  template: `
    <div class="relative">
      <button
        (click)="menuOpen.set(!menuOpen())"
        class="w-9 h-9 rounded-full bg-[#003399] text-white flex items-center justify-center font-bold text-[14px] cursor-pointer border-0 font-[Montserrat] hover:bg-[#002277] transition-colors"
        aria-label="Menú de usuario"
      >{{ initials() }}</button>

      @if (menuOpen()) {
        <div class="fixed inset-0 z-40" (click)="menuOpen.set(false)"></div>
        <div class="absolute right-0 top-11 z-50 w-52 bg-white rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-[#E5E7EB] overflow-hidden">
          <div class="px-4 py-3 border-b border-[#F3F4F6]">
            <p class="text-[13px] font-semibold text-[#1A1A2E] truncate">{{ auth.user()?.name }}</p>
            <p class="text-[11px] text-[#6B7280] truncate">{{ auth.user()?.email }}</p>
          </div>
          <button
            (click)="auth.logout()"
            class="w-full flex items-center gap-3 px-4 py-3 text-[13px] text-[#DC2626] hover:bg-[#FEF2F2] transition-colors cursor-pointer bg-transparent border-0 text-left"
          >
            <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            Cerrar sesión
          </button>
        </div>
      }
    </div>
  `,
})
export class UserMenuComponent {
  protected auth = inject(AuthService);
  menuOpen = signal(false);

  protected initials() {
    const name = this.auth.user()?.name ?? 'U';
    return name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase();
  }
}