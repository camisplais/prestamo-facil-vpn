import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
  computed,
} from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-mis-relaciones',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, DatePipe],
  template: `
    <div>
      <div class="mb-6">
        <h1 class="font-[Montserrat] text-[22px] font-extrabold text-[#1A1A2E]">Mis Relaciones</h1>
        <p class="text-[13px] text-[#6B7280] mt-0.5">Historial de referencias y relaciones quincenales</p>
      </div>

      @if (loading()) {
        <div class="flex items-center justify-center py-16 text-[#6B7280] text-[13px]">
          <svg class="w-5 h-5 animate-spin mr-2 text-[#003399]" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
          Cargando referencias…
        </div>
      } @else if (referencias().length === 0) {
        <div class="bg-[#F8FAFD] rounded-[10px] p-8 border border-[#E0E0E0] text-center">
          <svg class="w-12 h-12 mx-auto mb-3 text-[#6B7280]/40" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/>
          </svg>
          <p class="text-[14px] font-semibold text-[#1A1A2E] mb-1">Sin relaciones</p>
          <p class="text-[13px] text-[#6B7280]">Aún no tienes referencias generadas.</p>
        </div>
      } @else {
        <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
          <div class="px-5 py-4 border-b border-[#E0E0E0] flex items-center justify-between">
            <span class="font-[Montserrat] font-bold text-[14px] text-[#1A1A2E]">Referencias</span>
            <span class="text-[12px] text-[#6B7280]">{{ referencias().length }} registros</span>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-[13px] border-collapse">
              <thead>
                <tr>
                  <th class="bg-[#F8FAFD] font-[Montserrat] font-bold text-[11px] uppercase tracking-[0.5px] text-[#6B7280] px-5 py-3 text-left border-b border-[#E0E0E0]">Referencia</th>
                  <th class="bg-[#F8FAFD] font-[Montserrat] font-bold text-[11px] uppercase tracking-[0.5px] text-[#6B7280] px-5 py-3 text-left border-b border-[#E0E0E0]">Pago Esperado</th>
                  <th class="bg-[#F8FAFD] font-[Montserrat] font-bold text-[11px] uppercase tracking-[0.5px] text-[#6B7280] px-5 py-3 text-left border-b border-[#E0E0E0]">Pago Total</th>
                  <th class="bg-[#F8FAFD] font-[Montserrat] font-bold text-[11px] uppercase tracking-[0.5px] text-[#6B7280] px-5 py-3 text-left border-b border-[#E0E0E0]">Periodo</th>
                  <th class="bg-[#F8FAFD] font-[Montserrat] font-bold text-[11px] uppercase tracking-[0.5px] text-[#6B7280] px-5 py-3 text-center border-b border-[#E0E0E0]">PDF</th>
                </tr>
              </thead>
              <tbody>
                @for (ref of paginatedRefs(); track ref.id) {
                  <tr class="border-b border-[#F0F0F0] hover:bg-[#F8FAFD] transition-colors">
                    <td class="px-5 py-3 font-mono text-[12px] text-[#003399] font-semibold">{{ ref.referencia }}</td>
                    <td class="px-5 py-3 text-[#1A1A2E] font-semibold">\${{ ref.pago_esperado | number:'1.2-2' }}</td>
                    <td class="px-5 py-3 text-[#1A1A2E]">\${{ ref.pago_total | number:'1.2-2' }}</td>
                    <td class="px-5 py-3 text-[#6B7280]">{{ ref.fecha_inicio | date:'dd/MM/yyyy' }} — {{ ref.fecha_fin | date:'dd/MM/yyyy' }}</td>
                    <td class="px-5 py-3 text-center">
                      @if (ref.pdf_relaciones) {
                        <button (click)="descargarPdf(ref.id)"
                          [disabled]="downloadingId() === ref.id"
                          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-[#003399] text-white hover:bg-[#002277] transition-colors border-0 cursor-pointer disabled:opacity-60">
                          @if (downloadingId() === ref.id) {
                            <svg class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                            </svg>
                          } @else {
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                            </svg>
                          }
                          Descargar
                        </button>
                      } @else {
                        <span class="text-[12px] text-[#6B7280]">—</span>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          @if (totalPages() > 1) {
            <div class="px-5 py-3 border-t border-[#E0E0E0] flex items-center justify-between gap-3 flex-wrap">
              <span class="text-[12px] text-[#6B7280]">
                Mostrando {{ rangeStart() }}–{{ rangeEnd() }} de {{ referencias().length }}
              </span>
              <div class="flex items-center gap-1">
                <button (click)="goToPage(currentPage() - 1)" [disabled]="currentPage() === 1"
                  class="w-8 h-8 flex items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#F0F4FF] hover:text-[#003399] disabled:opacity-30 disabled:cursor-not-allowed border-0 bg-transparent cursor-pointer transition-colors">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
                </button>
                @for (page of visiblePages(); track page) {
                  @if (page === -1) {
                    <span class="w-8 h-8 flex items-center justify-center text-[12px] text-[#6B7280]">…</span>
                  } @else {
                    <button (click)="goToPage(page)"
                      [class]="page === currentPage() ? 'bg-[#003399] text-white shadow-sm' : 'text-[#6B7280] hover:bg-[#F0F4FF] hover:text-[#003399]'"
                      class="w-8 h-8 flex items-center justify-center rounded-lg text-[12px] font-semibold border-0 cursor-pointer transition-colors">
                      {{ page }}
                    </button>
                  }
                }
                <button (click)="goToPage(currentPage() + 1)" [disabled]="currentPage() === totalPages()"
                  class="w-8 h-8 flex items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#F0F4FF] hover:text-[#003399] disabled:opacity-30 disabled:cursor-not-allowed border-0 bg-transparent cursor-pointer transition-colors">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
                </button>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-[12px] text-[#6B7280]">Filas:</span>
                <select class="border border-[#E0E0E0] rounded-lg px-2 py-1 text-[12px] outline-none focus:border-[#003399] bg-white cursor-pointer"
                  [value]="pageSize()" (change)="changePageSize($event)">
                  @for (opt of pageSizeOptions; track opt) {
                    <option [value]="opt">{{ opt }}</option>
                  }
                </select>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class MisRelacionesComponent implements OnInit {
  private http = inject(HttpClient);
  private readonly API = `${environment.apiUrl}/distribuidora`;

  loading = signal(false);
  referencias = signal<any[]>([]);
  downloadingId = signal<number | null>(null);

  // Pagination
  currentPage = signal(1);
  pageSize = signal(10);
  readonly pageSizeOptions = [5, 10, 20, 50];

  totalPages = computed(() => Math.max(1, Math.ceil(this.referencias().length / this.pageSize())));
  paginatedRefs = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.referencias().slice(start, start + this.pageSize());
  });
  rangeStart = computed(() =>
    this.referencias().length === 0 ? 0 : (this.currentPage() - 1) * this.pageSize() + 1
  );
  rangeEnd = computed(() =>
    Math.min(this.currentPage() * this.pageSize(), this.referencias().length)
  );
  visiblePages = computed(() => {
    const total = this.totalPages();
    const cur = this.currentPage();
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: number[] = [1];
    if (cur > 3) pages.push(-1);
    for (let p = Math.max(2, cur - 1); p <= Math.min(total - 1, cur + 1); p++) pages.push(p);
    if (cur < total - 2) pages.push(-1);
    pages.push(total);
    return pages;
  });

  ngOnInit() {
    this.loadReferencias();
  }

  private loadReferencias() {
    this.loading.set(true);
    this.http.get<any>(`${this.API}/referencias`).subscribe({
      next: res => {
        this.referencias.set(res.data ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.referencias.set([]);
        this.loading.set(false);
      },
    });
  }

  descargarPdf(refId: number) {
    this.downloadingId.set(refId);
    this.http.get(`${this.API}/referencias/${refId}/pdf`, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relacion_${refId}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.downloadingId.set(null);
      },
      error: () => {
        this.downloadingId.set(null);
        alert('No se pudo descargar el PDF.');
      },
    });
  }

  goToPage(p: number) { this.currentPage.set(Math.max(1, Math.min(p, this.totalPages()))); }
  changePageSize(e: Event) {
    this.pageSize.set(Number((e.target as HTMLSelectElement).value));
    this.currentPage.set(1);
  }
}
