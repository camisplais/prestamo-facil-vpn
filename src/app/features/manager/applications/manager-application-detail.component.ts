import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { GerenteSolicitud, GerenteDecisionPayload } from '../../../core/models';
import { ManagerApplicationService } from '../../../core/services/manager-application.service';

@Component({
  selector: 'app-application-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ReactiveFormsModule],
  template: `
    <div class="max-w-6xl mx-auto">
      <div class="flex items-center gap-3 mb-6">
        <a [routerLink]="backPath()" class="text-[#6B7280] hover:text-[#003399] transition-colors no-underline" aria-label="Back">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
          </svg>
        </a>
        <div>
          <h1 class="font-[Montserrat] text-[22px] font-extrabold text-[#1A1A2E]">Detalle de solicitud</h1>
          <p class="text-[13px] text-[#6B7280]">Revision de datos, buro y decision final</p>
        </div>
      </div>

      @if (loading()) {
        <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] p-8 text-center text-[#6B7280] text-[13px]">
          Cargando informacion...
        </div>
      } @else if (item()) {
        <div class="grid grid-cols-1 xl:grid-cols-[1.6fr_1fr] gap-6">
          <div class="flex flex-col gap-6">
            <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] p-6">
              <div class="flex items-start justify-between gap-4 mb-5">
                <div>
                  <p class="text-[12px] font-bold text-[#003399] uppercase tracking-wide mb-1">Informacion general</p>
                  <h2 class="font-[Montserrat] text-[20px] font-extrabold text-[#1A1A2E]">{{ fullName(item()!) }}</h2>
                  <p class="text-[13px] text-[#6B7280]">{{ item()?.personData?.curp || 'Sin CURP' }}</p>
                </div>
                <div class="flex flex-col items-end gap-2">
                  <span [class]="statusClass(item()?.status)" class="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border">
                    {{ statusLabel(item()?.status) }}
                  </span>
                  <span [class]="bureauClass(item()?.credit_bureau_hit)" class="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border">
                    {{ bureauLabel(item()?.credit_bureau_hit) }}
                  </span>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-[13px]">
                <div class="rounded-lg border border-[#E0E0E0] p-4">
                  <p class="text-[#6B7280] text-[11px] uppercase font-semibold mb-1">Telefono</p>
                  <p class="text-[#1A1A2E] font-medium">{{ item()?.personData?.phone_number || '—' }}</p>
                </div>
                <div class="rounded-lg border border-[#E0E0E0] p-4">
                  <p class="text-[#6B7280] text-[11px] uppercase font-semibold mb-1">Telefono personal</p>
                  <p class="text-[#1A1A2E] font-medium">{{ item()?.personData?.personal_phone_number || '—' }}</p>
                </div>
                <div class="rounded-lg border border-[#E0E0E0] p-4 md:col-span-2">
                  <p class="text-[#6B7280] text-[11px] uppercase font-semibold mb-1">Direccion</p>
                  <p class="text-[#1A1A2E] font-medium">{{ addressText(item()?.personData) }}</p>
                </div>
                <div class="rounded-lg border border-[#E0E0E0] p-4">
                  <p class="text-[#6B7280] text-[11px] uppercase font-semibold mb-1">Coordinador</p>
                  <p class="text-[#1A1A2E] font-medium">{{ item()?.coordinator?.name || '—' }}</p>
                </div>
                <div class="rounded-lg border border-[#E0E0E0] p-4">
                  <p class="text-[#6B7280] text-[11px] uppercase font-semibold mb-1">Verificador</p>
                  <p class="text-[#1A1A2E] font-medium">{{ item()?.verifier?.name || '—' }}</p>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] p-6">
              <p class="text-[12px] font-bold text-[#003399] uppercase tracking-wide mb-4">Documentos y evidencias</p>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-[13px]">
                <div class="rounded-lg border border-[#E0E0E0] p-4">
                  <p class="text-[11px] uppercase font-semibold text-[#6B7280] mb-2">INE</p>
                  @if (item()?.personData?.ine) {
                    <a class="text-[#003399] font-semibold break-all" [href]="fileUrl(item()?.personData?.ine)" target="_blank" rel="noopener noreferrer">Abrir archivo</a>
                  } @else {
                    <p class="text-[#6B7280]">—</p>
                  }
                </div>
                <div class="rounded-lg border border-[#E0E0E0] p-4">
                  <p class="text-[11px] uppercase font-semibold text-[#6B7280] mb-2">Comprobante de domicilio</p>
                  @if (item()?.proof_of_address) {
                    <a class="text-[#003399] font-semibold break-all" [href]="fileUrl(item()?.proof_of_address)" target="_blank" rel="noopener noreferrer">Abrir archivo</a>
                  } @else {
                    <p class="text-[#6B7280]">—</p>
                  }
                </div>
                <div class="rounded-lg border border-[#E0E0E0] p-4">
                  <p class="text-[11px] uppercase font-semibold text-[#6B7280] mb-2">Buro de credito</p>
                  @if (item()?.credit_bureau) {
                    <a class="text-[#003399] font-semibold break-all" [href]="fileUrl(item()?.credit_bureau)" target="_blank" rel="noopener noreferrer">Abrir archivo</a>
                  } @else {
                    <p class="text-[#6B7280]">—</p>
                  }
                </div>
                <div class="rounded-lg border border-[#E0E0E0] p-4">
                  <p class="text-[11px] uppercase font-semibold text-[#6B7280] mb-2">Fotos de vivienda</p>
                  @if (item()?.house_picture?.length) {
                    <div class="flex flex-col gap-1">
                      @for (photo of item()?.house_picture; track photo) {
                        <a class="text-[#003399] font-semibold break-all" [href]="fileUrl(photo)" target="_blank" rel="noopener noreferrer">{{ photo }}</a>
                      }
                    </div>
                  } @else {
                    <p class="text-[#6B7280]">—</p>
                  }
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] p-6">
                <p class="text-[12px] font-bold text-[#003399] uppercase tracking-wide mb-4">Familiares</p>
                @if (item()?.familyMembers?.length) {
                  <div class="flex flex-col gap-3">
                    @for (member of item()?.familyMembers; track member.id) {
                      <div class="rounded-lg border border-[#E0E0E0] p-4">
                        <p class="font-semibold text-[#1A1A2E]">{{ personName(member.personalData) }}</p>
                        <p class="text-[12px] text-[#6B7280]">{{ member.relationship }}</p>
                      </div>
                    }
                  </div>
                } @else {
                  <p class="text-[13px] text-[#6B7280]">No se encontraron familiares.</p>
                }
              </div>

              <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] p-6">
                <p class="text-[12px] font-bold text-[#003399] uppercase tracking-wide mb-4">Vehiculos</p>
                @if (item()?.vehicles?.length) {
                  <div class="flex flex-col gap-3">
                    @for (vehicle of item()?.vehicles; track vehicle.id) {
                      <div class="rounded-lg border border-[#E0E0E0] p-4">
                        <p class="font-semibold text-[#1A1A2E]">{{ vehicle.brand || 'Sin marca' }} {{ vehicle.model || '' }}</p>
                        <p class="text-[12px] text-[#6B7280]">{{ vehicle.plate || 'Sin placas' }} · {{ vehicle.type || 'Sin tipo' }}</p>
                      </div>
                    }
                  </div>
                } @else {
                  <p class="text-[13px] text-[#6B7280]">No se encontraron vehiculos.</p>
                }
              </div>
            </div>

            <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] p-6">
              <p class="text-[12px] font-bold text-[#003399] uppercase tracking-wide mb-4">Afiliaciones</p>
              @if (item()?.affiliations?.length) {
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  @for (affiliation of item()?.affiliations; track affiliation.id) {
                    <div class="rounded-lg border border-[#E0E0E0] p-4">
                      <p class="font-semibold text-[#1A1A2E]">{{ affiliation.externalSubsidiary?.name || 'Sin nombre' }}</p>
                      <p class="text-[12px] text-[#6B7280]">Limite de credito: {{ formatMoney(affiliation.credit_limit) }}</p>
                    </div>
                  }
                </div>
              } @else {
                <p class="text-[13px] text-[#6B7280]">No se encontraron afiliaciones.</p>
              }
            </div>
          </div>

          <div class="flex flex-col gap-6">
            <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] p-6">
              <p class="text-[12px] font-bold text-[#003399] uppercase tracking-wide mb-4">Buro de credito</p>
              <p class="text-[13px] text-[#6B7280] mb-4">Marcar manualmente si aparece en buro de credito.</p>

              @if (errorMsg()) {
                <div class="bg-[#E53935]/10 text-[#E53935] text-[13px] px-3 py-2 rounded-lg border border-[#E53935]/20 mb-4" role="alert">
                  {{ errorMsg() }}
                </div>
              }

              @if (successMsg()) {
                <div class="bg-[#00A86B]/10 text-[#00A86B] text-[13px] px-3 py-2 rounded-lg border border-[#00A86B]/20 mb-4" role="status">
                  {{ successMsg() }}
                </div>
              }

              <div class="flex gap-2 mb-4">
                <button
                  type="button"
                  (click)="selectBuro(true)"
                  [class]="buroSelected() === true ? 'bg-[#E53935] text-white' : 'bg-white text-[#E53935] border border-[#E53935]/20 hover:bg-[#E53935]/10'"
                  class="flex-1 px-3 py-2 rounded-lg text-[12px] font-semibold transition-colors cursor-pointer"
                >Si, esta en buro</button>
                <button
                  type="button"
                  (click)="selectBuro(false)"
                  [class]="buroSelected() === false ? 'bg-[#00A86B] text-white' : 'bg-white text-[#00A86B] border border-[#00A86B]/20 hover:bg-[#00A86B]/10'"
                  class="flex-1 px-3 py-2 rounded-lg text-[12px] font-semibold transition-colors cursor-pointer"
                >No, no esta en buro</button>
              </div>

              <button
                type="button"
                [disabled]="savingBuro() || buroSelected() === null"
                (click)="saveBuro()"
                class="w-full py-2.5 rounded-lg text-[13px] font-semibold bg-[#003399] text-white hover:bg-[#002277] transition-colors border-0 cursor-pointer disabled:opacity-60"
              >
                @if (savingBuro()) { Guardando... } @else { Guardar resultado }
              </button>

              <div class="mt-4 text-[12px] text-[#6B7280] space-y-1">
                <p>Resultado actual: <strong class="text-[#1A1A2E]">{{ bureauLabel(item()?.credit_bureau_hit) }}</strong></p>
                <p>Revisado por: <strong class="text-[#1A1A2E]">{{ item()?.creditBureauChecker?.name || '—' }}</strong></p>
                <p>Fecha: <strong class="text-[#1A1A2E]">{{ formatDate(item()?.credit_bureau_checked_at) }}</strong></p>
              </div>
            </div>

            <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] p-6">
              <p class="text-[12px] font-bold text-[#003399] uppercase tracking-wide mb-4">Decision del gerente</p>

              @if (item()?.status === 'rejected') {
                <div class="bg-[#FF8800]/10 text-[#FF8800] text-[13px] px-3 py-2 rounded-lg border border-[#FF8800]/20" role="status">
                  Esta solicitud fue rechazada por verificacion. Solo informativa.
                </div>

                <div class="mt-4 rounded-lg border border-[#E0E0E0] p-4 text-[13px]">
                  <p class="text-[11px] uppercase font-semibold text-[#6B7280] mb-1">Notas del verificador</p>
                  <p class="text-[#1A1A2E]">{{ item()?.notes || 'Sin notas' }}</p>
                </div>
              } @else {
                <form [formGroup]="decisionForm" (ngSubmit)="submitDecision()" class="flex flex-col gap-4">
                  <div class="flex flex-col gap-1">
                    <label class="text-[12px] font-semibold text-[#1A1A2E]" for="decision">Decision *</label>
                    <select
                      id="decision"
                      formControlName="decision"
                      class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] transition-colors bg-white"
                    >
                      <option value="">-- Seleccionar --</option>
                      <option value="approved">Aprobar</option>
                      <option value="rejected">Rechazar</option>
                    </select>
                  </div>

                  <div class="flex flex-col gap-1">
                    <label class="text-[12px] font-semibold text-[#1A1A2E]" for="comentario">Comentario</label>
                    <textarea
                      id="comentario"
                      formControlName="comentario"
                      rows="4"
                      placeholder="Notas de revision"
                      class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] transition-colors resize-y"
                    ></textarea>
                  </div>

                  @if (item()?.credit_bureau_hit === true) {
                    <div class="bg-[#FF8800]/10 text-[#FF8800] text-[13px] px-3 py-2 rounded-lg border border-[#FF8800]/20" role="status">
                      La persona aparece en buro de credito. Solo se permite rechazar.
                    </div>
                  }

                  <button
                    type="submit"
                    [disabled]="savingDecision()"
                    class="w-full py-2.5 rounded-lg text-[13px] font-semibold bg-[#003399] text-white hover:bg-[#002277] transition-colors border-0 cursor-pointer disabled:opacity-60"
                  >
                    @if (savingDecision()) { Guardando... } @else { Registrar decision }
                  </button>
                </form>
              }
            </div>

            @if (item()?.distributor) {
              <div class="bg-white rounded-[10px] border border-[#00A86B]/20 shadow-[0_2px_12px_rgba(0,51,153,0.08)] p-6">
                <p class="text-[12px] font-bold text-[#00A86B] uppercase tracking-wide mb-4">Expediente generado</p>
                <div class="grid grid-cols-1 gap-3 text-[13px]">
                  <div class="rounded-lg border border-[#E0E0E0] p-4">
                    <p class="text-[11px] uppercase font-semibold text-[#6B7280] mb-1">Categoria</p>
                    <p class="font-semibold text-[#1A1A2E]">{{ item()?.distributor?.category?.name || '—' }}</p>
                  </div>
                  <div class="rounded-lg border border-[#E0E0E0] p-4">
                    <p class="text-[11px] uppercase font-semibold text-[#6B7280] mb-1">Puntos</p>
                    <p class="font-semibold text-[#1A1A2E]">{{ item()?.distributor?.points ?? 0 }}</p>
                  </div>
                  <div class="rounded-lg border border-[#E0E0E0] p-4">
                    <p class="text-[11px] uppercase font-semibold text-[#6B7280] mb-1">Credito actual</p>
                    <p class="font-semibold text-[#1A1A2E]">{{ formatMoney(item()?.distributor?.current_credit) }}</p>
                  </div>
                  <div class="rounded-lg border border-[#E0E0E0] p-4">
                    <p class="text-[11px] uppercase font-semibold text-[#6B7280] mb-1">Credito disponible</p>
                    <p class="font-semibold text-[#1A1A2E]">{{ formatMoney(item()?.distributor?.available_credit) }}</p>
                  </div>
                  <div class="rounded-lg border border-[#E0E0E0] p-4">
                    <p class="text-[11px] uppercase font-semibold text-[#6B7280] mb-1">Referencia</p>
                    <p class="font-semibold text-[#1A1A2E]">{{ item()?.distributor?.reference_number || '—' }}</p>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      } @else {
        <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] p-8 text-center text-[#6B7280] text-[13px]">
          Solicitud no encontrada.
        </div>
      }
    </div>
  `,
})
export class ApplicationDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  readonly backPath = () =>
    this.router.url.includes('/admin/') ? '/admin/gerente/solicitudes' : '/gerente/solicitudes';
  private svc = inject(ManagerApplicationService);
  private fb = inject(FormBuilder);

  item = signal<GerenteSolicitud | null>(null);
  loading = signal(true);
  savingBuro = signal(false);
  savingDecision = signal(false);
  errorMsg = signal('');
  successMsg = signal('');
  buroSelected = signal<boolean | null>(null);

  decisionForm = this.fb.group({
    decision: ['', Validators.required],
    comentario: [''],
  });

  ngOnInit() {
    this.load();
  }

  private load() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isFinite(id)) {
      this.loading.set(false);
      return;
    }

    this.svc.getOne(id).subscribe({
      next: res => {
        const data = res.data?.data ?? res.data;
        this.item.set(data);
        this.buroSelected.set(data?.credit_bureau_hit ?? null);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  selectBuro(value: boolean) {
    this.buroSelected.set(value);
    this.errorMsg.set('');
    this.successMsg.set('');
  }

  saveBuro() {
    const id = this.item()?.id;
    const buro = this.buroSelected();

    if (!id || buro === null) {
      return;
    }

    this.savingBuro.set(true);
    this.errorMsg.set('');
    this.successMsg.set('');

    this.svc.updateBuro(id, buro).subscribe({
      next: res => {
        const data = res.data?.data ?? res.data;
        const current = this.item();
        const next = this.mergeApplication(current, data, buro);
        this.item.set(next);
        this.buroSelected.set(next?.credit_bureau_hit ?? buro);
        this.savingBuro.set(false);
        this.successMsg.set('Resultado de buro guardado correctamente.');
      },
      error: err => {
        this.savingBuro.set(false);
        this.errorMsg.set(err?.error?.message ?? 'No se pudo guardar el resultado de buro.');
      },
    });
  }

  submitDecision() {
    this.decisionForm.markAllAsTouched();
    if (this.decisionForm.invalid || !this.item()) {
      return;
    }

    const decision = this.decisionForm.value.decision as GerenteDecisionPayload['decision'];
    const comentario = this.decisionForm.value.comentario || undefined;

    if (decision === 'approved' && this.item()?.credit_bureau_hit === true) {
      this.errorMsg.set('No puedes aprobar a una persona marcada en buro de credito.');
      return;
    }

    if (decision === 'approved' && this.item()?.status === 'rejected') {
      this.errorMsg.set('No puedes aprobar una solicitud rechazada por verificacion.');
      return;
    }

    this.savingDecision.set(true);
    this.errorMsg.set('');
    this.successMsg.set('');

    this.svc.decide(this.item()!.id, { decision, comentario }).subscribe({
      next: res => {
        const data = res.data?.pre_solicitud ?? res.data?.data?.pre_solicitud ?? res.data?.preApplication ?? res.data?.data ?? this.item();
        const next = this.mergeApplication(this.item(), data, this.buroSelected() ?? false);
        this.item.set(next);
        this.savingDecision.set(false);
        this.successMsg.set(decision === 'approved'
          ? 'Solicitud aprobada y expediente generado.'
          : 'Solicitud rechazada correctamente.');
      },
      error: err => {
        this.savingDecision.set(false);
        this.errorMsg.set(err?.error?.message ?? 'No se pudo registrar la decision.');
      },
    });
  }

  private mergeApplication(
    current: GerenteSolicitud | null,
    data: GerenteSolicitud | null | undefined,
    buro: boolean,
  ) {
    if (!current) {
      return data ?? null;
    }

    if (!data) {
      return { ...current, credit_bureau_hit: buro };
    }

    return {
      ...current,
      ...data,
      personData: data.personData ?? current.personData ?? null,
      coordinator: data.coordinator ?? current.coordinator ?? null,
      verifier: data.verifier ?? current.verifier ?? null,
      manager: data.manager ?? current.manager ?? null,
      creditBureauChecker: data.creditBureauChecker ?? current.creditBureauChecker ?? null,
      proof_of_address: data.proof_of_address ?? current.proof_of_address ?? null,
      credit_bureau: data.credit_bureau ?? current.credit_bureau ?? null,
      house_picture: data.house_picture ?? current.house_picture ?? null,
      familyMembers: data.familyMembers ?? current.familyMembers ?? [],
      vehicles: data.vehicles ?? current.vehicles ?? [],
      affiliations: data.affiliations ?? current.affiliations ?? [],
      distributor: data.distributor ?? current.distributor ?? null,
    };
  }

  fullName(item: GerenteSolicitud) {
    return [item.personData?.name, item.personData?.first_last_name, item.personData?.second_last_name].filter(Boolean).join(' ');
  }

  personName(person?: { name?: string; first_last_name?: string; second_last_name?: string } | null) {
    return [person?.name, person?.first_last_name, person?.second_last_name].filter(Boolean).join(' ') || '—';
  }

  addressText(person?: GerenteSolicitud['personData']) {
    if (!person) {
      return '—';
    }

    return [person.street, person.house_number, person.neighborhood, person.postal_code].filter(Boolean).join(', ') || '—';
  }

  fileUrl(path?: string | null) {
    if (!path) {
      return '#';
    }

    // Already an absolute URL
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }

    const baseUrl = environment.apiUrl.replace(/\/api$/, '');

    // Already has /storage/ prefix
    if (path.startsWith('/storage/')) {
      return `${baseUrl}${path}`;
    }

    // Has public/ prefix, normalize it
    if (path.startsWith('public/')) {
      return `${baseUrl}/storage/${path.slice('public/'.length)}`;
    }

    // Fallback: prepend /storage/
    return `${baseUrl}/storage/${path}`;
  }

  formatMoney(value?: string | number | null) {
    if (value === null || value === undefined || value === '') {
      return '—';
    }

    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(value));
  }

  formatDate(value?: string | null) {
    return value ? new Date(value).toLocaleString('es-MX') : '—';
  }

  statusLabel(status?: string | null) {
    return ({
      pending: 'Pendiente',
      verified: 'Verificada',
      approved: 'Aprobada',
      rejected: 'Rechazada',
    }[status ?? ''] ?? status ?? '—');
  }

  statusClass(status?: string | null) {
    return ({
      pending: 'bg-[#FF8800]/10 text-[#FF8800] border-[#FF8800]/20',
      verified: 'bg-[#0288D1]/10 text-[#0288D1] border-[#0288D1]/20',
      approved: 'bg-[#00A86B]/10 text-[#00A86B] border-[#00A86B]/20',
      rejected: 'bg-[#E53935]/10 text-[#E53935] border-[#E53935]/20',
    }[status ?? ''] ?? 'bg-[#F8FAFD] text-[#6B7280] border-[#E0E0E0]');
  }

  bureauLabel(hit?: boolean | null) {
    return hit === true ? 'En buro' : hit === false ? 'Sin buro' : 'Pendiente';
  }

  bureauClass(hit?: boolean | null) {
    return hit === true
      ? 'bg-[#E53935]/10 text-[#E53935] border-[#E53935]/20'
      : hit === false
        ? 'bg-[#00A86B]/10 text-[#00A86B] border-[#00A86B]/20'
        : 'bg-[#FF8800]/10 text-[#FF8800] border-[#FF8800]/20';
  }
}