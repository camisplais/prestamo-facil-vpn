import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuditorService } from '../../core/services/auditor.service';

@Component({
  selector: 'app-auditor-pre-solicitud-detalle',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-6">

      <!-- Back -->
      <a routerLink="/auditor/pre-solicitudes"
        class="inline-flex items-center gap-1.5 text-[13px] text-[#003399] font-semibold hover:underline">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
        </svg>
        Volver a pre-solicitudes
      </a>

      @if (loading()) {
        <div class="flex items-center justify-center h-40 text-[#6B7280] text-[14px]">Cargando...</div>
      }

      @if (data()) {
        <!-- Header -->
        <div class="flex items-start justify-between gap-4">
          <div>
            <h1 class="font-[Montserrat] text-[22px] font-extrabold text-[#1A1A2E]">
              Pre-solicitud #{{ data()!.id }}
            </h1>
            <p class="text-[13px] text-[#6B7280] mt-1">
              Registrada el {{ data()!.created_at | date:'dd/MM/yyyy HH:mm' }}
            </p>
          </div>
          <span [class]="estadoClass(data()!.status)"
            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold">
            {{ estadoLabel(data()!.status) }}
          </span>
        </div>

        <!-- Grid de info -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">

          <!-- Datos personales -->
          <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
            <div class="px-5 py-4 border-b border-[#E0E0E0]">
              <span class="font-[Montserrat] font-bold text-[14px] text-[#1A1A2E]">Candidata</span>
            </div>
            <div class="p-5 space-y-3">
              @for (field of candidataFields(); track field.label) {
                <div class="bg-[#F4F7FA] rounded-lg px-4 py-2.5">
                  <div class="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide">{{ field.label }}</div>
                  <div class="text-[13px] font-semibold text-[#1A1A2E] mt-0.5">{{ field.value || '—' }}</div>
                </div>
              }
            </div>
          </div>

          <!-- Responsables -->
          <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
            <div class="px-5 py-4 border-b border-[#E0E0E0]">
              <span class="font-[Montserrat] font-bold text-[14px] text-[#1A1A2E]">Responsables</span>
            </div>
            <div class="p-5 space-y-3">
              @for (field of responsablesFields(); track field.label) {
                <div class="bg-[#F4F7FA] rounded-lg px-4 py-2.5">
                  <div class="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide">{{ field.label }}</div>
                  <div class="text-[13px] font-semibold text-[#1A1A2E] mt-0.5">{{ field.value || '—' }}</div>
                </div>
              }
            </div>
          </div>

          <!-- Documentos -->
          <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
            <div class="px-5 py-4 border-b border-[#E0E0E0]">
              <span class="font-[Montserrat] font-bold text-[14px] text-[#1A1A2E]">Documentos</span>
            </div>
            <div class="p-5 space-y-3">
              @for (doc of documentos(); track doc.label) {
                <div class="flex items-center justify-between bg-[#F4F7FA] rounded-lg px-4 py-2.5">
                  <div class="text-[12px] font-semibold text-[#6B7280]">{{ doc.label }}</div>
                  @if (doc.url) {
                    <a [href]="doc.url" target="_blank"
                      class="text-[12px] font-semibold text-[#003399] hover:underline flex items-center gap-1">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                      </svg>
                      Ver archivo
                    </a>
                  } @else {
                    <span class="text-[12px] text-[#9CA3AF]">No subido</span>
                  }
                </div>
              }

              <!-- Fotos vivienda -->
              @if (data()!.house_picture?.length) {
                <div class="mt-2">
                  <div class="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide mb-2">Fotos de vivienda</div>
                  <div class="flex flex-wrap gap-2">
                    @for (foto of data()!.house_picture; track foto) {
                      <a [href]="foto" target="_blank"
                        class="w-16 h-16 rounded-lg border border-[#E0E0E0] bg-[#F4F7FA] flex items-center justify-center text-[#6B7280] hover:border-[#003399] transition-colors">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                          <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                          <polyline points="21 15 16 10 5 21"/>
                        </svg>
                      </a>
                    }
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Familiares y vehículos -->
          <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
            <div class="px-5 py-4 border-b border-[#E0E0E0]">
              <span class="font-[Montserrat] font-bold text-[14px] text-[#1A1A2E]">Familiares y vehículos</span>
            </div>
            <div class="p-5 space-y-4">
              @if (data()!.family_members?.length) {
                <div>
                  <div class="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide mb-2">Familiares</div>
                  @for (f of data()!.family_members; track f.id) {
                    <div class="bg-[#F4F7FA] rounded-lg px-4 py-2.5 mb-2 text-[13px]">
                      <span class="font-semibold">{{ f.personal_data?.name }} {{ f.personal_data?.first_last_name }}</span>
                      <span class="text-[#6B7280] ml-2">— {{ f.relationship }}</span>
                    </div>
                  }
                </div>
              } @else {
                <p class="text-[13px] text-[#9CA3AF]">Sin familiares registrados</p>
              }

              @if (data()!.vehicles?.length) {
                <div>
                  <div class="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide mb-2">Vehículos</div>
                  @for (v of data()!.vehicles; track v.id) {
                    <div class="bg-[#F4F7FA] rounded-lg px-4 py-2.5 mb-2 text-[13px]">
                      {{ v.brand }} {{ v.model }} — <span class="font-mono">{{ v.plate ?? 'Sin placas' }}</span>
                    </div>
                  }
                </div>
              } @else {
                <p class="text-[13px] text-[#9CA3AF]">Sin vehículos registrados</p>
              }
            </div>
          </div>
        </div>

        <!-- Timeline de logs -->
        @if (logs().length) {
          <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
            <div class="px-5 py-4 border-b border-[#E0E0E0]">
              <span class="font-[Montserrat] font-bold text-[14px] text-[#1A1A2E]">Historial de cambios</span>
            </div>
            <div class="p-5">
              <ul class="space-y-0">
                @for (log of logs(); track log.id; let last = $last) {
                  <li class="flex gap-4 pb-5 relative">
                    @if (!last) {
                      <div class="absolute left-[17px] top-[30px] bottom-0 w-0.5 bg-[#E0E0E0]"></div>
                    }
                    <div [class]="dotClass(log.method)"
                      class="w-9 h-9 rounded-full border-2 flex items-center justify-center flex-shrink-0 text-[11px] font-bold">
                      {{ log.method.slice(0, 1) }}
                    </div>
                    <div class="pt-1">
                      <p class="text-[13px] font-semibold text-[#1A1A2E]">
                        {{ log.method }} en <span class="font-mono text-[12px] bg-[#F0F4FF] text-[#003399] px-1.5 rounded">{{ log.table_name }}</span>
                      </p>
                      <small class="text-[11px] text-[#6B7280]">
                        {{ log.users?.[0]?.name ?? 'Sistema' }} · {{ log.occurred_at | date:'dd/MM/yyyy HH:mm' }}
                      </small>
                    </div>
                  </li>
                }
              </ul>
            </div>
          </div>
        }
      }
    </div>
  `,
})
export class AuditorPreSolicitudDetalleComponent implements OnInit {
  private svc   = inject(AuditorService);
  private route = inject(ActivatedRoute);

  data    = signal<any>(null);
  logs    = signal<any[]>([]);
  loading = signal(true);

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.svc.preSolicitudDetalle(id).subscribe({
      next: r => {
        this.data.set(r.data);
        this.logs.set(r.logs ?? []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  candidataFields() {
    const p = this.data()?.person_data;
    if (!p) return [];
    return [
      { label: 'Nombre completo', value: `${p.name} ${p.first_last_name} ${p.second_last_name ?? ''}`.trim() },
      { label: 'CURP', value: p.curp },
      { label: 'RFC', value: p.rfc },
      { label: 'Fecha de nacimiento', value: p.birth_date },
      { label: 'Teléfono', value: p.phone_number },
      { label: 'Domicilio', value: `${p.street} ${p.house_number}, ${p.neighborhood}, CP ${p.postal_code}` },
    ];
  }

  responsablesFields() {
    const d = this.data();
    if (!d) return [];
    return [
      { label: 'Coordinador', value: d.coordinator ? `${d.coordinator.name} (${d.coordinator.email})` : null },
      { label: 'Verificador', value: d.verifier   ? `${d.verifier.name} (${d.verifier.email})` : null },
      { label: 'Gerente',     value: d.manager    ? `${d.manager.name} (${d.manager.email})` : null },
      { label: 'Coordenadas GPS', value: d.coordinates },
      { label: 'Notas gerente', value: d.manager_notes },
    ];
  }

  documentos() {
    const d = this.data();
    if (!d) return [];
    return [
      { label: 'INE',                 url: d.person_data?.ine },
      { label: 'Comprobante domicilio', url: d.proof_of_address },
      { label: 'Buró de crédito',     url: d.credit_bureau },
    ];
  }

  estadoLabel(s: string) {
    const m: Record<string, string> = { pending: 'Pendiente', verified: 'Verificada', approved: 'Aprobada', rejected: 'Rechazada' };
    return m[s] ?? s;
  }

  estadoClass(s: string) {
    const m: Record<string, string> = {
      pending:  'bg-[#F59E0B]/12 text-[#B45309]',
      verified: 'bg-[#0288D1]/10 text-[#0288D1]',
      approved: 'bg-[#00A86B]/10 text-[#00A86B]',
      rejected: 'bg-[#E53935]/10 text-[#E53935]',
    };
    return m[s] ?? 'bg-[#6B7280]/10 text-[#6B7280]';
  }

  dotClass(method: string) {
    const m: Record<string, string> = {
      POST:  'bg-[#003399]/10 border-[#003399] text-[#003399]',
      PUT:   'bg-[#FF8800]/12 border-[#FF8800] text-[#FF8800]',
      PATCH: 'bg-[#F59E0B]/12 border-[#F59E0B] text-[#B45309]',
      GET:   'bg-[#E0E0E0] border-[#9CA3AF] text-[#6B7280]',
    };
    return m[method] ?? 'bg-[#E0E0E0] border-[#9CA3AF] text-[#6B7280]';
  }
}
