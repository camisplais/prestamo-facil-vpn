import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DistribuidoraReclamoService } from '../../../core/services/distribuidora-reclamo.service';
import { FinalCustomer } from '../../../core/models';

@Component({
  selector: 'app-distribuidora-reclamo-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="max-w-2xl mx-auto">
      <a routerLink="/distribuidora/reclamos" class="inline-flex items-center gap-1.5 text-[13px] text-[#6B7280] hover:text-[#003399] transition-colors mb-5 no-underline">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
        </svg>
        Volver a reclamos
      </a>

      <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] p-6">
        <h1 class="font-[Montserrat] text-[20px] font-extrabold text-[#1A1A2E] mb-1">Nuevo reclamo</h1>
        <p class="text-[13px] text-[#6B7280] mb-6">Selecciona el tipo de reclamo y completa la información</p>

        @if (successMsg()) {
          <div class="mb-5 bg-[#00A86B]/10 border border-[#00A86B]/30 rounded-lg px-4 py-3 text-[13px] text-[#00A86B] font-semibold flex items-center gap-2">
            <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
            </svg>
            {{ successMsg() }}
          </div>
        }

        @if (errorMsg()) {
          <div class="mb-5 bg-[#E53935]/10 border border-[#E53935]/30 rounded-lg px-4 py-3 text-[13px] text-[#E53935] font-semibold flex items-center gap-2">
            <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
            {{ errorMsg() }}
          </div>
        }

        <div class="space-y-5">

          <!-- Tipo -->
          <div>
            <label class="block text-[12px] font-semibold text-[#1A1A2E] mb-2">
              Tipo de reclamo <span class="text-[#E53935]">*</span>
            </label>
            <div class="grid grid-cols-2 gap-2">
              @for (t of tipos; track t.value) {
                <button
                  (click)="selectTipo(t.value)"
                  [class]="selectedTipo() === t.value
                    ? 'border-[#003399] bg-[#003399]/5 text-[#003399]'
                    : 'border-[#E0E0E0] text-[#6B7280] hover:border-[#003399]'"
                  class="border rounded-lg px-3 py-3 text-[12px] font-semibold text-left transition-colors cursor-pointer bg-white"
                >
                  {{ t.label }}
                </button>
              }
            </div>
          </div>

          <!-- Cliente (solo para change_clients y overdue_customer) -->
          @if (selectedTipo() === 'change_clients' || selectedTipo() === 'overdue_customer') {
            <div>
              <label class="block text-[12px] font-semibold text-[#1A1A2E] mb-1.5">
                Cliente <span class="text-[#E53935]">*</span>
              </label>
              @if (loadingClientes()) {
                <div class="text-[12px] text-[#6B7280]">Cargando clientes...</div>
              } @else {
                <select
                  [(ngModel)]="selectedClienteId"
                  class="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] text-[#1A1A2E] focus:outline-none focus:border-[#003399] focus:ring-1 focus:ring-[#003399]/20 transition-colors bg-white"
                >
                  <option value="">Selecciona un cliente</option>
                  @for (c of clientes(); track c.id) {
                    <option [value]="c.id">{{ clienteName(c) }}</option>
                  }
                </select>
              }
            </div>
          }

          <!-- Distribuidora destino (solo change_clients) -->
          @if (selectedTipo() === 'change_clients') {
            <div>
              <label class="block text-[12px] font-semibold text-[#1A1A2E] mb-1.5">
                Distribuidora destino <span class="text-[#E53935]">*</span>
              </label>
              @if (loadingDistribuidoras()) {
                <div class="text-[12px] text-[#6B7280]">Cargando distribuidoras...</div>
              } @else {
                <select
                  [(ngModel)]="selectedDistribuidoraId"
                  class="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] text-[#1A1A2E] focus:outline-none focus:border-[#003399] focus:ring-1 focus:ring-[#003399]/20 transition-colors bg-white"
                >
                  <option value="">Selecciona una distribuidora</option>
                  @for (d of distribuidoras(); track d.id) {
                    <option [value]="d.id">{{ d.name }}</option>
                  }
                </select>
              }
            </div>
          }

          <!-- Comentarios -->
          <div>
            <label class="block text-[12px] font-semibold text-[#1A1A2E] mb-1.5">
              Comentarios <span class="text-[#E53935]">*</span>
            </label>
            <textarea
              [(ngModel)]="comments"
              rows="4"
              maxlength="500"
              placeholder="Describe el motivo de tu reclamo (mínimo 10 caracteres)..."
              class="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] text-[#1A1A2E] focus:outline-none focus:border-[#003399] focus:ring-1 focus:ring-[#003399]/20 transition-colors resize-none"
            ></textarea>
            <p class="text-[11px] text-[#6B7280] mt-1 text-right">{{ comments.length }}/500</p>
          </div>

          <!-- Adjuntos (solo money_claim) -->
          @if (selectedTipo() === 'money_claim') {
            <div>
              <label class="block text-[12px] font-semibold text-[#1A1A2E] mb-1.5">
                Comprobantes de pago <span class="text-[#E53935]">*</span>
              </label>
              <div
                class="border-2 border-dashed border-[#E0E0E0] rounded-lg p-5 text-center cursor-pointer hover:border-[#003399] transition-colors"
                (click)="fileInput.click()"
              >
                <svg class="w-8 h-8 text-[#6B7280]/50 mx-auto mb-2" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/>
                </svg>
                <p class="text-[12px] text-[#6B7280]">Haz clic para subir archivos</p>
                <p class="text-[11px] text-[#6B7280]/70 mt-1">JPG, PNG o PDF — máx. 5MB por archivo, hasta 4 archivos</p>
              </div>
              <input
                #fileInput
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.pdf"
                class="hidden"
                (change)="onFilesSelected($event)"
              />
              @if (selectedFiles().length > 0) {
                <div class="mt-3 space-y-1.5">
                  @for (f of selectedFiles(); track f.name) {
                    <div class="flex items-center justify-between bg-[#F8FAFD] border border-[#E0E0E0] rounded-lg px-3 py-2">
                      <span class="text-[12px] text-[#1A1A2E] truncate">{{ f.name }}</span>
                      <button (click)="removeFile(f)" class="text-[#E53935] hover:text-[#C62828] ml-2 border-0 bg-transparent cursor-pointer text-[11px] font-semibold">Quitar</button>
                    </div>
                  }
                </div>
              }
            </div>
          }

          <button
            (click)="submit()"
            [disabled]="submitting() || !isValid()"
            class="w-full bg-[#003399] text-white rounded-lg py-2.5 text-[13px] font-bold flex items-center justify-center gap-2 hover:bg-[#002580] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border-0"
          >
            @if (submitting()) {
              <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              Enviando...
            } @else {
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
              </svg>
              Enviar reclamo
            }
          </button>

        </div>
      </div>
    </div>
  `,
})
export class DistribuidoraReclamoFormComponent implements OnInit {
  private svc    = inject(DistribuidoraReclamoService);
  private router = inject(Router);

  clientes              = signal<FinalCustomer[]>([]);
  distribuidoras        = signal<{ id: number; name: string }[]>([]);
  loadingClientes       = signal(false);
  loadingDistribuidoras = signal(false);
  submitting            = signal(false);
  successMsg            = signal('');
  errorMsg              = signal('');
  selectedTipo          = signal('');
  selectedFiles         = signal<File[]>([]);

  comments               = '';
  selectedClienteId      = '';
  selectedDistribuidoraId = '';

  tipos = [
    { label: 'Cobro no aplicado',  value: 'money_claim' },
    { label: 'Aumento de crédito', value: 'credit_increase' },
    { label: 'Cambio de cliente',  value: 'change_clients' },
    { label: 'Cliente vencido',    value: 'overdue_customer' },
  ];

  ngOnInit() {}

  selectTipo(value: string) {
    this.selectedTipo.set(value);
    this.selectedFiles.set([]);
    this.selectedClienteId       = '';
    this.selectedDistribuidoraId = '';

    if (value === 'change_clients' || value === 'overdue_customer') {
      this.loadClientes();
    }
    if (value === 'change_clients') {
      this.loadDistribuidoras();
    }
  }

  private loadClientes() {
    if (this.clientes().length > 0) return;
    this.loadingClientes.set(true);
    this.svc.getClientes().subscribe({
      next: c  => { this.clientes.set(c);  this.loadingClientes.set(false); },
      error: () => { this.clientes.set([]); this.loadingClientes.set(false); },
    });
  }

  private loadDistribuidoras() {
    if (this.distribuidoras().length > 0) return;
    this.loadingDistribuidoras.set(true);
    this.svc.getDistribuidorasSucursal().subscribe({
      next: d  => { this.distribuidoras.set(d);  this.loadingDistribuidoras.set(false); },
      error: () => { this.distribuidoras.set([]); this.loadingDistribuidoras.set(false); },
    });
  }

  onFilesSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (!input.files) return;
        const nuevos = Array.from(input.files);
        const actuales = this.selectedFiles();
        const combinados = [...actuales, ...nuevos].slice(0, 4);
        this.selectedFiles.set(combinados);
        input.value = ''; // resetea el input para permitir seleccionar el mismo archivo
}

  removeFile(file: File) {
    this.selectedFiles.set(this.selectedFiles().filter(f => f !== file));
  }

  isValid(): boolean {
    if (!this.selectedTipo()) return false;
    if (this.comments.length < 10) return false;
    if (this.selectedTipo() === 'money_claim' && this.selectedFiles().length === 0) return false;
    if ((this.selectedTipo() === 'change_clients' || this.selectedTipo() === 'overdue_customer') && !this.selectedClienteId) return false;
    if (this.selectedTipo() === 'change_clients' && !this.selectedDistribuidoraId) return false;
    return true;
  }

  submit() {
    if (!this.isValid()) return;

    const fd = new FormData();
    fd.append('type', this.selectedTipo());

    // Si es cambio de cliente, concatena la distribuidora destino al comentario
    let finalComments = this.comments;
    if (this.selectedTipo() === 'change_clients' && this.selectedDistribuidoraId) {
      const dist = this.distribuidoras().find(d => d.id === +this.selectedDistribuidoraId);
      finalComments = `Distribuidora destino: ${dist?.name ?? this.selectedDistribuidoraId}. ${this.comments}`;
    }
    fd.append('comments', finalComments);

    if (this.selectedClienteId) {
      fd.append('client_id', this.selectedClienteId);
    }

    this.selectedFiles().forEach(f => fd.append('attachments[]', f));

    this.submitting.set(true);
    this.successMsg.set('');
    this.errorMsg.set('');

    this.svc.store(fd).subscribe({
      next: () => {
        this.submitting.set(false);
        this.successMsg.set('Reclamo enviado correctamente.');
        setTimeout(() => this.router.navigate(['/distribuidora/reclamos']), 1500);
      },
      error: err => {
        this.submitting.set(false);
        this.errorMsg.set(err?.error?.message ?? err?.error?.error ?? 'Error al enviar el reclamo.');
      },
    });
  }

  clienteName = (c: FinalCustomer) => {
    const pd = (c as any).person_data ?? (c as any).personData;
    if (!pd) return `Cliente #${c.id}`;
    return [pd.name, pd.first_last_name, pd.second_last_name].filter(Boolean).join(' ');
  };
}