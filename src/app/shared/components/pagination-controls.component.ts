import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-pagination-controls',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (totalPages > 1) {
      <div class="px-5 py-3 border-t border-[#E0E0E0] flex items-center justify-between gap-3 flex-wrap text-[13px] text-[#6B7280]">
        <span>Mostrando {{ rangeStart }}–{{ rangeEnd }} de {{ totalItems }}</span>
        <div class="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            (click)="goToPage(1)"
            [disabled]="currentPage === 1"
            class="p-1.5 rounded-lg border border-[#E0E0E0] bg-white hover:border-[#003399] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Primera página"
          >«</button>
          <button
            type="button"
            (click)="goToPage(currentPage - 1)"
            [disabled]="currentPage === 1"
            class="px-3 py-1.5 rounded-lg border border-[#E0E0E0] bg-white hover:border-[#003399] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >‹ Ant.</button>
          @for (page of visiblePages(); track page) {
            @if (page === -1) {
              <span class="px-2 text-[#9CA3AF]">…</span>
            } @else {
              <button
                type="button"
                (click)="goToPage(page)"
                [class]="page === currentPage ? 'bg-[#003399] text-white shadow-sm' : 'text-[#6B7280] hover:bg-[#F0F4FF] hover:text-[#003399]'"
                class="min-w-[32px] h-8 px-2 rounded-lg text-[12px] font-semibold transition-colors border-0 cursor-pointer"
                [attr.aria-current]="page === currentPage ? 'page' : null"
              >{{ page }}</button>
            }
          }
          <button
            type="button"
            (click)="goToPage(currentPage + 1)"
            [disabled]="currentPage === totalPages"
            class="px-3 py-1.5 rounded-lg border border-[#E0E0E0] bg-white hover:border-[#003399] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >Sig. ›</button>
          <button
            type="button"
            (click)="goToPage(totalPages)"
            [disabled]="currentPage === totalPages"
            class="p-1.5 rounded-lg border border-[#E0E0E0] bg-white hover:border-[#003399] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Última página"
          >»</button>
        </div>
      </div>
    }
  `,
})
export class PaginationControlsComponent {
  @Input() currentPage = 1;
  @Input() totalPages = 1;
  @Input() totalItems = 0;
  @Input() rangeStart = 0;
  @Input() rangeEnd = 0;

  @Output() pageChange = new EventEmitter<number>();

  goToPage(page: number) {
    const nextPage = Math.max(1, Math.min(page, this.totalPages));
    if (nextPage !== this.currentPage) {
      this.pageChange.emit(nextPage);
    }
  }

  visiblePages() {
    const total = this.totalPages;
    const current = this.currentPage;

    if (total <= 1) {
      return [1];
    }

    const pages: number[] = [1];

    if (current > 3) {
      pages.push(-1);
    }

    for (let page = Math.max(2, current - 1); page <= Math.min(total - 1, current + 1); page += 1) {
      pages.push(page);
    }

    if (current < total - 2) {
      pages.push(-1);
    }

    pages.push(total);
    return pages;
  }
}
