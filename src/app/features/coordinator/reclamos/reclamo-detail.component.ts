// src/app/features/coordinator/reclamos/reclamo-detail.component.ts
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReclamoCoordinadorService } from '../../../core/services/reclamo-coordinador.service';
import { CoordinadorReclamo as Reclamo, CoordinadorDistribuidora } from '../../../core/models';

@Component({
  selector: 'app-reclamo-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="max-w-3xl">
      <!-- Back -->
      <a
        routerLink="/coordinador/reclamos"
        class="inline-flex items-center gap-1.5 text-[13px] text-[#6B7280] hover:text-[#003399] transition-colors mb-5 no-underline"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/>
        </svg>
        Volver a reclamos
      </a>

      @if (loadingDetail()) {
        <div class="flex items-center justify-center py-20 text-[#6B7280] text-[13px]">
          <svg class="w-5 h-5 animate-spin mr-2 text-[#003399]" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
          Cargando reclamo…
        </div>
      } @else if (!reclamo()) {
        <div class="text-center py-20 text-[#E53935] text-[14px]">
          Reclamo no encontrado o no tienes acceso.
        </div>
      } @else {
        <!-- Header card -->
        <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] p-6 mb-5">
          <div class="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 class="font-[Montserrat] text-[20px] font-extrabold text-[#1A1A2E] mb-1">
                Reclamo #{{ reclamo()!.id }}
              </h1>
              <div class="flex items-center gap-2 flex-wrap">
                <span [class]="typeBadge(reclamo()!.type)">{{ typeLabel(reclamo()!.type) }}</span>
                <span [class]="statusBadge(reclamo()!.status)">{{ statusLabel(reclamo()!.status) }}</span>
              </div>
            </div>
            <span class="text-[12px] text-[#6B7280]">{{ formatDate(reclamo()!.created_at) }}</span>
          </div>
        </div>

        <!-- Info grid -->
        <div class="grid md:grid-cols-2 gap-5 mb-5">
          <!-- Cliente -->
          <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] p-5">
            <p class="font-[Montserrat] font-bold text-[12px] uppercase tracking-[0.5px] text-[#6B7280] mb-3">Cliente involucrado</p>
            <p class="font-semibold text-[#1A1A2E] text-[15px]">{{ clientName() }}</p>
            <p class="text-[13px] text-[#6B7280] mt-0.5">ID: {{ reclamo()!.customer_id ?? '—' }}</p>          </div>

          <!-- Distribuidora solicitante -->
          <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] p-5">
            <p class="font-[Montserrat] font-bold text-[12px] uppercase tracking-[0.5px] text-[#6B7280] mb-3">Distribuidora solicitante</p>
            <p class="font-semibold text-[#1A1A2E] text-[15px]">{{ distribuidoraName() }}</p>
          </div>
        </div>

        <!-- Motivo -->
        @if (reclamo()!.comments) {
          <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] p-5 mb-5">
            <p class="font-[Montserrat] font-bold text-[12px] uppercase tracking-[0.5px] text-[#6B7280] mb-3">Motivo del reclamo</p>
            <p class="text-[14px] text-[#1A1A2E] leading-relaxed whitespace-pre-wrap">{{ reclamo()!.comments }}</p>
          </div>
        }

        <!-- Resolución existente (si ya fue resuelto) -->
        @if (isResolved()) {
          <div [class]="reclamo()!.status === 'approved'
            ? 'bg-[#22C55E]/5 border-[#22C55E]/30'
            : 'bg-[#E53935]/5 border-[#E53935]/30'"
            class="rounded-[10px] border p-5 mb-5">
            <p class="font-[Montserrat] font-bold text-[12px] uppercase tracking-[0.5px] mb-2"
               [class]="reclamo()!.status === 'approved' ? 'text-[#22C55E]' : 'text-[#E53935]'">
              {{ reclamo()!.status === 'approved' ? 'Aprobado' : 'Rechazado' }}
            </p>
            @if (reclamo()!.decision_notes) {
              <p class="text-[14px] text-[#1A1A2E] whitespace-pre-wrap">{{ reclamo()!.decision_notes }}</p>
            } @else {
              <p class="text-[13px] text-[#6B7280] italic">Sin nota adicional.</p>
            }
          </div>
        }

        <!-- Panel de resolución (solo si está pendiente) -->
        @if (reclamo()!.status === 'pending') {
          <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] p-6">
            <h2 class="font-[Montserrat] font-bold text-[15px] text-[#1A1A2E] mb-4">Resolver reclamo</h2>

            <!-- Select distribuidora destino (solo change_clients) -->
            @if (reclamo()!.type === 'change_clients') {
              <div class="mb-4">
                <label class="font-[Montserrat] font-semibold text-[12px] text-[#1A1A2E] uppercase tracking-[0.5px] mb-1.5 block">
                  Distribuidora destino <span class="text-[#E53935]">*</span>
                </label>
                @if (loadingDistribuidoras()) {
                  <p class="text-[13px] text-[#6B7280] italic">Cargando distribuidoras…</p>
                } @else {
                  <select
                    [value]="selectedDistribuidoraId()"
                    (change)="selectedDistribuidoraId.set(+$any($event.target).value || null)"
                    class="w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-[13px] text-[#1A1A2E] outline-none focus:border-[#003399] transition-colors bg-white"
                  >
                    <option value="">— Selecciona una distribuidora —</option>
                    @for (dist of distribuidoras(); track dist.id) {
                      <option [value]="dist.id">{{ dist.name }}</option>
                    }
                  </select>
                }
              </div>
            }

            <!-- Nota del coordinador -->
            <label class="block mb-4">
              <span class="font-[Montserrat] font-semibold text-[12px] text-[#1A1A2E] uppercase tracking-[0.5px] mb-1.5 block">
                Nota para la distribuidora <span class="text-[#6B7280] font-normal normal-case">(opcional)</span>
              </span>
              <textarea
                [(ngModel)]="coordinatorNote"
                rows="3"
                maxlength="500"
                placeholder="Escribe una nota explicando tu decisión…"
                class="w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-[13px] text-[#1A1A2E] outline-none focus:border-[#003399] transition-colors resize-none placeholder:text-[#9CA3AF]"
              ></textarea>
              <span class="text-[11px] text-[#9CA3AF] float-right">{{ coordinatorNote.length }}/500</span>
            </label>

            <!-- Mensaje de error -->
            @if (resolveError()) {
              <div class="rounded-lg bg-[#E53935]/10 border border-[#E53935]/20 px-4 py-3 mb-4 text-[13px] text-[#E53935]">
                {{ resolveError() }}
              </div>
            }

            <!-- Botones de acción -->
            <div class="flex gap-3 mt-2">
              <button
                (click)="resolve('approved')"
                [disabled]="resolving()"
                class="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-[14px] font-semibold bg-[#22C55E] text-white hover:bg-[#16A34A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border-0"
              >
                @if (resolving() && pendingResolution() === 'approved') {
                  <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                } @else {
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                }
                Aprobar
              </button>

              <button
                (click)="resolve('rejected')"
                [disabled]="resolving()"
                class="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-[14px] font-semibold bg-[#E53935] text-white hover:bg-[#C62828] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border-0"
              >
                @if (resolving() && pendingResolution() === 'rejected') {
                  <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                } @else {
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
                  </svg>
                }
                Rechazar
              </button>
            </div>
          </div>
        }

        <!-- Toast de éxito -->
        @if (successMsg()) {
          <div class="fixed bottom-6 right-6 z-50 bg-[#1A1A2E] text-white px-5 py-3.5 rounded-[10px] shadow-xl text-[13px] font-semibold flex items-center gap-2.5 animate-in slide-in-from-bottom-4">
            <svg class="w-4 h-4 text-[#22C55E] flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            {{ successMsg() }}
          </div>
        }
      }
    </div>
  `,
})
export class ReclamoDetailComponent implements OnInit {
  private svc    = inject(ReclamoCoordinadorService);
  private route  = inject(ActivatedRoute);
  private router = inject(Router);

  reclamo           = signal<Reclamo | null>(null);
  loadingDetail     = signal(true);
  resolving         = signal(false);
  resolveError      = signal<string | null>(null);
  successMsg        = signal<string | null>(null);
  pendingResolution = signal<'approved' | 'rejected' | null>(null);

  coordinatorNote        = '';
  distribuidoras         = signal<CoordinadorDistribuidora[]>([]);
  selectedDistribuidoraId = signal<number | null>(null);
  loadingDistribuidoras  = signal(false);

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.svc.getOne(id).subscribe({
      next: res => {
        this.reclamo.set(res.data);
        this.loadingDetail.set(false);
        // Cargamos distribuidoras solo si el reclamo es change_clients y está pendiente
        if (res.data.type === 'change_clients' && res.data.status === 'pending') {
          this.cargarDistribuidoras();
        }
      },
      error: () => this.loadingDetail.set(false),
    });
  }

  cargarDistribuidoras() {
    this.loadingDistribuidoras.set(true);
    this.svc.getDistribuidoras(this.reclamo()!.id).subscribe({
      next: res => {
        this.distribuidoras.set(res.data);
        this.loadingDistribuidoras.set(false);
      },
      error: () => this.loadingDistribuidoras.set(false),
    });
  }

  /** El reclamo ya fue resuelto por el coordinador */
  isResolved(): boolean {
    const s = this.reclamo()?.status;
    return s === 'approved' || s === 'rejected';
  }

  resolve(resolution: 'approved' | 'rejected') {
    if (this.resolving()) return;

    // Validar que eligió distribuidora destino para change_clients aprobado
    if (resolution === 'approved' && this.reclamo()?.type === 'change_clients' && !this.selectedDistribuidoraId()) {
      this.resolveError.set('Debes seleccionar la distribuidora destino antes de aprobar.');
      return;
    }

    this.resolving.set(true);
    this.resolveError.set(null);
    this.pendingResolution.set(resolution);

    const id = this.reclamo()!.id;

    this.svc.resolve(id, {
      resolution,
      coordinator_note: this.coordinatorNote.trim() || undefined,
      target_distributor_id: this.selectedDistribuidoraId() ?? undefined,
    }).subscribe({
      next: res => {
        this.reclamo.set(res.data);
        this.resolving.set(false);
        this.pendingResolution.set(null);
        this.successMsg.set(
          resolution === 'approved' ? 'Reclamo aprobado correctamente.' : 'Reclamo rechazado.'
        );
        setTimeout(() => this.successMsg.set(null), 3000);
      },
      error: err => {
        this.resolveError.set(
          err?.error?.message ?? 'Error al procesar la resolución. Intenta de nuevo.'
        );
        this.resolving.set(false);
        this.pendingResolution.set(null);
      },
    });
  }

  clientName(): string {
    const r = this.reclamo();
    return r?.customer_name
      ? `${r.customer_name} ${r.customer_first_last_name ?? ''}`.trim()
      : r?.customer_id ? `Cliente #${r.customer_id}` : '—';
  }

  distribuidoraName(): string {
    const p = this.reclamo()?.distributor?.person_data;
    return p ? `${p.name} ${p.first_last_name}` : `Distribuidora #${this.reclamo()?.distributor_id}`;
  }

  typeLabel(type: string): string {
    return type === 'change_clients' ? 'Cambio de cliente' : 'Cliente moroso';
  }

  typeBadge(type: string): string {
    const base = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-semibold';
    return type === 'change_clients'
      ? `${base} bg-[#0288D1]/10 text-[#0288D1]`
      : `${base} bg-[#E53935]/10 text-[#E53935]`;
  }

  statusLabel(status: string): string {
    if (status === 'pending')  return 'Pendiente';
    if (status === 'approved') return 'Aprobado';
    if (status === 'rejected') return 'Rechazado';
    return 'Cerrado';
  }

  statusBadge(status: string): string {
    const base = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-semibold';
    if (status === 'pending')  return `${base} bg-[#FF8800]/10 text-[#FF8800]`;
    if (status === 'approved') return `${base} bg-[#22C55E]/10 text-[#22C55E]`;
    return `${base} bg-[#E53935]/10 text-[#E53935]`;
  }

  formatDate(date?: string): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('es-MX', {
      day: '2-digit', month: 'long', year: 'numeric',
    });
  }
}