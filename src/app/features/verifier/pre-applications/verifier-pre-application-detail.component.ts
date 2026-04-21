import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { VerifierService } from '../../../core/services/verifier.service';

@Component({
  selector: 'app-verifier-pre-application-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ReactiveFormsModule],
  template: `
    <div class="max-w-4xl mx-auto">

      <!-- Header -->
      <div class="flex items-center gap-3 mb-6">
        <a [routerLink]="backPath()"
          class="text-[#6B7280] hover:text-[#003399] transition-colors no-underline"
          aria-label="Regresar"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
          </svg>
        </a>
        <div class="flex-1">
          <h1 class="font-[Montserrat] text-[22px] font-extrabold text-[#1A1A2E]">Detalle de Pre-Solicitud</h1>
          <p class="text-[13px] text-[#6B7280] mt-0.5">#{{ id }}</p>
        </div>
        @if (item()) {
          <span [class]="statusClass(item().status)" class="text-[12px] font-semibold px-3 py-1 rounded-full border">
            {{ statusLabel(item().status) }}
          </span>
        }
      </div>

      @if (loadingItem()) {
        <div class="flex items-center justify-center py-20 text-[#6B7280] text-[13px]">
          <svg class="w-5 h-5 animate-spin mr-2 text-[#003399]" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
          Cargando...
        </div>
      } @else if (item()) {

        <!-- DATOS PERSONALES -->
        <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] p-6 mb-5">
          <p class="text-[12px] font-bold text-[#003399] uppercase tracking-wide mb-4">Datos personales</p>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3 text-[13px]">
            <div>
              <span class="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide block mb-0.5">Nombre completo</span>
              <span class="text-[#1A1A2E] font-medium">{{ fullName() }}</span>
            </div>
            <div>
              <span class="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide block mb-0.5">Sexo</span>
              <span class="text-[#1A1A2E]">{{ item().person_data?.gender || '-' }}</span>
            </div>
            <div>
              <span class="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide block mb-0.5">Fecha de nacimiento</span>
              <span class="text-[#1A1A2E]">{{ formatDate(item().person_data?.birth_date) }}</span>
            </div>
            <div>
              <span class="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide block mb-0.5">CURP</span>
              <span class="text-[#1A1A2E] font-mono text-[12px]">{{ item().person_data?.curp || '-' }}</span>
            </div>
            <div>
              <span class="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide block mb-0.5">RFC</span>
              <span class="text-[#1A1A2E] font-mono text-[12px]">{{ item().person_data?.rfc || '-' }}</span>
            </div>
            <div>
              <span class="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide block mb-0.5">Telefono</span>
              <span class="text-[#1A1A2E]">{{ item().person_data?.phone_number || '-' }}</span>
            </div>
            <div class="col-span-2 md:col-span-3">
              <span class="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide block mb-0.5">Domicilio</span>
              <span class="text-[#1A1A2E]">
                {{ item().person_data?.street }} {{ item().person_data?.house_number }},
                {{ item().person_data?.neighborhood }}, CP {{ item().person_data?.postal_code }}
              </span>
            </div>
            @if (item().coordinates) {
              <div class="col-span-2 md:col-span-3">
                <span class="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide block mb-0.5">Coordenadas GPS</span>
                <span class="text-[#1A1A2E] font-mono text-[12px]">{{ item().coordinates }}</span>
              </div>
            }
          </div>
        </div>

        <!-- DOCUMENTOS -->
        <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] p-6 mb-5">
          <p class="text-[12px] font-bold text-[#003399] uppercase tracking-wide mb-4">Documentos adjuntos</p>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <a [href]="fileUrl(item().person_data?.ine)" target="_blank" rel="noopener"
              class="flex items-center gap-3 p-3 rounded-lg border border-[#E0E0E0] hover:border-[#003399] transition-colors no-underline group"
            >
              <div class="w-9 h-9 rounded-[8px] bg-[#003399]/10 text-[#003399] flex items-center justify-center flex-shrink-0">
                <svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2"/>
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-[12px] font-semibold text-[#1A1A2E] group-hover:text-[#003399] transition-colors">INE</div>
                <div class="text-[11px] text-[#6B7280] truncate">{{ fileName(item().person_data?.ine) }}</div>
              </div>
            </a>

            <a [href]="fileUrl(item().proof_of_address)" target="_blank" rel="noopener"
              class="flex items-center gap-3 p-3 rounded-lg border border-[#E0E0E0] hover:border-[#003399] transition-colors no-underline group"
            >
              <div class="w-9 h-9 rounded-[8px] bg-[#FF8800]/10 text-[#FF8800] flex items-center justify-center flex-shrink-0">
                <svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-[12px] font-semibold text-[#1A1A2E] group-hover:text-[#003399] transition-colors">Comprobante de domicilio</div>
                <div class="text-[11px] text-[#6B7280] truncate">{{ fileName(item().proof_of_address) }}</div>
              </div>
            </a>

            <a [href]="fileUrl(item().credit_bureau)" target="_blank" rel="noopener"
              class="flex items-center gap-3 p-3 rounded-lg border border-[#E0E0E0] hover:border-[#003399] transition-colors no-underline group"
            >
              <div class="w-9 h-9 rounded-[8px] bg-[#0288D1]/10 text-[#0288D1] flex items-center justify-center flex-shrink-0">
                <svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-[12px] font-semibold text-[#1A1A2E] group-hover:text-[#003399] transition-colors">Buro de credito</div>
                <div class="text-[11px] text-[#6B7280] truncate">{{ fileName(item().credit_bureau) }}</div>
              </div>
            </a>
          </div>

          @if (item().house_picture?.length) {
            <div class="mt-4">
              <p class="text-[11px] font-bold text-[#6B7280] uppercase tracking-wide mb-2">Fotos de vivienda (coordinador)</p>
              <div class="flex flex-wrap gap-2">
                @for (foto of item().house_picture; track foto) {
                  <a [href]="fileUrl(foto)" target="_blank" rel="noopener"
                    class="text-[11px] text-[#003399] underline hover:no-underline"
                  >{{ fileName(foto) }}</a>
                }
              </div>
            </div>
          }
        </div>

        <!-- FAMILIARES -->
        @if (item().family_members?.length) {
          <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] p-6 mb-5">
            <p class="text-[12px] font-bold text-[#003399] uppercase tracking-wide mb-4">Familiares</p>
            <div class="flex flex-col gap-2">
              @for (f of item().family_members; track f.id) {
                <div class="flex items-center gap-4 px-4 py-2.5 rounded-lg bg-[#F8FAFD] border border-[#E0E0E0] text-[13px]">
                  <span class="font-medium text-[#1A1A2E]">
                    {{ f.personal_data?.name }} {{ f.personal_data?.first_last_name }} {{ f.personal_data?.second_last_name }}
                  </span>
                  <span class="text-[11px] bg-[#003399]/10 text-[#003399] px-2 py-0.5 rounded-full font-semibold">{{ f.relationship }}</span>
                </div>
              }
            </div>
          </div>
        }

        <!-- VEHICULOS -->
        @if (item().vehicles?.length) {
          <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] p-6 mb-5">
            <p class="text-[12px] font-bold text-[#003399] uppercase tracking-wide mb-4">Vehiculos</p>
            <div class="flex flex-col gap-2">
              @for (v of item().vehicles; track v.id) {
                <div class="grid grid-cols-3 gap-4 px-4 py-2.5 rounded-lg bg-[#F8FAFD] border border-[#E0E0E0] text-[13px]">
                  <span><span class="text-[#6B7280] text-[11px] block">Marca</span>{{ v.brand || '-' }}</span>
                  <span><span class="text-[#6B7280] text-[11px] block">Modelo</span>{{ v.model || '-' }}</span>
                  <span><span class="text-[#6B7280] text-[11px] block">Placas</span>{{ v.plate || '-' }}</span>
                </div>
              }
            </div>
          </div>
        }

        <!-- AFILIACIONES -->
        @if (item().affiliations?.length) {
          <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] p-6 mb-5">
            <p class="text-[12px] font-bold text-[#003399] uppercase tracking-wide mb-4">Otras afiliaciones</p>
            <div class="flex flex-col gap-2">
              @for (a of item().affiliations; track a.id) {
                <div class="flex items-center justify-between px-4 py-2.5 rounded-lg bg-[#F8FAFD] border border-[#E0E0E0] text-[13px]">
                  <span class="font-medium text-[#1A1A2E]">{{ a.external_subsidiary?.name }}</span>
                  <span class="text-[#6B7280]">Limite: <strong class="text-[#1A1A2E]">{{ formatMoney(a.credit_limit) }}</strong></span>
                </div>
              }
            </div>
          </div>
        }

        <!-- SECCION PENDIENTE: subir evidencia + evaluar -->
        @if (item().status === 'pending') {

          <!-- Subir evidencia -->
          <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] p-6 mb-5">
            <p class="text-[12px] font-bold text-[#003399] uppercase tracking-wide mb-1">Evidencia fotografica de la visita</p>
            <p class="text-[12px] text-[#6B7280] mb-4">Sube las fotografias tomadas durante la visita al domicilio. Solo se guardara el nombre del archivo.</p>

            @if (item().verification_pictures?.length) {
              <div class="mb-4">
                <p class="text-[11px] font-bold text-[#6B7280] uppercase tracking-wide mb-2">Fotos subidas anteriormente</p>
                <div class="flex flex-wrap gap-2">
                  @for (foto of item().verification_pictures; track foto) {
                    <span class="flex items-center gap-1.5 text-[12px] bg-[#0288D1]/10 text-[#0288D1] px-2.5 py-1 rounded-full border border-[#0288D1]/20">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                      </svg>
                      {{ fileName(foto) }}
                    </span>
                  }
                </div>
              </div>
            }

            <div
              class="border-2 border-dashed border-[#E0E0E0] rounded-[10px] p-6 text-center hover:border-[#003399] transition-colors cursor-pointer"
              [class.border-[#003399]]="dragOver()"
              (dragover)="onDragOver($event)"
              (dragleave)="dragOver.set(false)"
              (drop)="onDrop($event)"
              (click)="fileInput.click()"
              role="button"
              tabindex="0"
              aria-label="Zona de carga de imagenes"
              (keydown.enter)="fileInput.click()"
            >
              <svg class="w-10 h-10 text-[#D0D5DD] mx-auto mb-2" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <p class="text-[13px] text-[#6B7280]">Arrastra imagenes aqui o <span class="text-[#003399] font-semibold">haz clic para seleccionar</span></p>
              <p class="text-[11px] text-[#9CA3AF] mt-1">JPG, PNG - Max. 10 MB por imagen</p>
              <input #fileInput type="file" accept="image/jpeg,image/png,image/jpg" multiple class="hidden"
                (change)="onFilesSelected($event)"
              />
            </div>

            @if (selectedFiles().length) {
              <div class="mt-3 flex flex-wrap gap-2">
                @for (f of selectedFiles(); track f.name) {
                  <div class="flex items-center gap-1.5 text-[12px] bg-[#F8FAFD] border border-[#E0E0E0] px-2.5 py-1 rounded-full">
                    <svg class="w-3 h-3 text-[#003399]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14"/>
                    </svg>
                    <span class="text-[#1A1A2E] max-w-[140px] truncate">{{ f.name }}</span>
                    <button (click)="removeFile(f)" class="text-[#6B7280] hover:text-[#E53935] transition-colors border-0 bg-transparent cursor-pointer p-0 ml-0.5" aria-label="Quitar archivo">x</button>
                  </div>
                }
              </div>
            }

            @if (uploadError()) {
              <div class="mt-3 text-[12px] text-[#E53935]" role="alert">{{ uploadError() }}</div>
            }
            @if (uploadSuccess()) {
              <div class="mt-3 text-[12px] text-[#00A86B]" role="status">Fotos subidas correctamente.</div>
            }

            <div class="mt-4 flex justify-end">
              <button
                (click)="subirEvidencia()"
                [disabled]="!selectedFiles().length || uploading()"
                class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold bg-[#003399] text-white hover:bg-[#002277] transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-0 cursor-pointer"
              >
                @if (uploading()) {
                  <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  Subiendo...
                } @else {
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                  </svg>
                  Subir fotos ({{ selectedFiles().length }})
                }
              </button>
            </div>
          </div>

          <!-- Evaluacion -->
          <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] p-6 mb-5">
            <p class="text-[12px] font-bold text-[#003399] uppercase tracking-wide mb-1">Evaluacion de la solicitud</p>
            <p class="text-[12px] text-[#6B7280] mb-5">Revisa toda la informacion y determina si la candidata cumple los requisitos.</p>

            <form [formGroup]="evalForm" class="flex flex-col gap-4">
              <div class="flex flex-col gap-1">
                <label class="text-[12px] font-semibold text-[#1A1A2E]" for="comentario">
                  Comentario <span class="text-[#E53935]">*</span>
                </label>
                <textarea
                  id="comentario"
                  formControlName="comentario"
                  rows="4"
                  placeholder="Describe los hallazgos de la visita, bienes observados, condiciones del domicilio y el motivo de tu decision..."
                  class="border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-[13px] outline-none focus:border-[#003399] transition-colors resize-none"
                  [class.border-[#E53935]]="evalForm.get('comentario')?.invalid && evalForm.get('comentario')?.touched"
                ></textarea>
                @if (evalForm.get('comentario')?.invalid && evalForm.get('comentario')?.touched) {
                  <span class="text-[11px] text-[#E53935]">El comentario es obligatorio.</span>
                }
              </div>

              @if (evalError()) {
                <div class="bg-[#E53935]/10 text-[#E53935] text-[13px] px-4 py-3 rounded-lg border border-[#E53935]/20" role="alert">
                  {{ evalError() }}
                </div>
              }

              <div class="flex gap-3 justify-end pt-1">
                <button
                  type="button"
                  (click)="evaluar('rejected')"
                  [disabled]="evaluating()"
                  class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-semibold bg-[#E53935] text-white hover:bg-[#C62828] transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-0 cursor-pointer"
                >
                  @if (evaluating() === 'rejected') {
                    <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                  } @else {
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  }
                  Rechazar
                </button>

                <button
                  type="button"
                  (click)="evaluar('verified')"
                  [disabled]="evaluating()"
                  class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-semibold bg-[#0288D1] text-white hover:bg-[#0277BD] transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-0 cursor-pointer"
                >
                  @if (evaluating() === 'verified') {
                    <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                  } @else {
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                    </svg>
                  }
                  Marcar como verificada
                </button>
              </div>
            </form>
          </div>
        }

        <!-- RESULTADO SI YA FUE EVALUADA -->
        @if (item().status !== 'pending' && item().notes) {
          <div class="rounded-[10px] border p-5 mb-5"
            [class]="item().status === 'verified'
              ? 'bg-[#0288D1]/5 border-[#0288D1]/20'
              : 'bg-[#E53935]/5 border-[#E53935]/20'"
          >
            <p class="text-[12px] font-bold uppercase tracking-wide mb-1"
              [class]="item().status === 'verified' ? 'text-[#0288D1]' : 'text-[#E53935]'"
            >
              {{ item().status === 'verified' ? 'Verificada' : 'Rechazada' }} - Comentario del verificador
            </p>
            <p class="text-[13px] text-[#1A1A2E]">{{ item().notes }}</p>
            @if (item().verified_at) {
              <p class="text-[11px] text-[#6B7280] mt-2">{{ formatDate(item().verified_at) }}</p>
            }
          </div>
        }

      } @else {
        <div class="bg-white rounded-[10px] border border-[#E0E0E0] p-10 text-center text-[#6B7280] text-[13px]">
          No se encontro la pre-solicitud.
        </div>
      }
    </div>
  `,
})
export class VerifierPreApplicationDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  readonly backPath = () =>
    this.router.url.includes('/admin/') ? '/admin/verificador/pre-solicitudes' : '/verificador/pre-solicitudes';
  private svc   = inject(VerifierService);
  private fb    = inject(FormBuilder);

  id          = Number(this.route.snapshot.paramMap.get('id'));
  item        = signal<any>(null);
  loadingItem = signal(true);

  selectedFiles = signal<File[]>([]);
  dragOver      = signal(false);
  uploading     = signal(false);
  uploadError   = signal('');
  uploadSuccess = signal(false);

  evaluating = signal<'verified' | 'rejected' | false>(false);
  evalError  = signal('');

  evalForm = this.fb.group({
    comentario: ['', [Validators.required, Validators.maxLength(1000)]],
  });

  ngOnInit() { this.loadItem(); }

  private loadItem() {
    this.loadingItem.set(true);
    this.svc.getOne(this.id).subscribe({
      next:  r => { this.item.set(r.data ?? r); this.loadingItem.set(false); },
      error: () => this.loadingItem.set(false),
    });
  }

  fullName() {
    const p = this.item()?.person_data;
    return [p?.name, p?.first_last_name, p?.second_last_name].filter(Boolean).join(' ');
  }

  formatDate  = (d: string) => d ? new Date(d).toLocaleDateString('es-MX') : '-';
  formatMoney = (n: number) => n != null ? n.toLocaleString('es-MX') : '-';
  fileName    = (path: string) => path?.split('/').pop() ?? path ?? '-';
  fileUrl = (path: string) => {
    if (!path) return '#';
    if (/^https?:\/\//i.test(path)) return path;
    return '/storage/' + path;
  };
  statusLabel = (s: string) => ({ pending: 'Pendiente', verified: 'Verificada', rejected: 'Rechazada' }[s] ?? s);
  statusClass = (s: string) => ({
    pending:  'bg-[#FF8800]/10 text-[#FF8800] border-[#FF8800]/20',
    verified: 'bg-[#0288D1]/10 text-[#0288D1] border-[#0288D1]/20',
    rejected: 'bg-[#E53935]/10 text-[#E53935] border-[#E53935]/20',
  }[s] ?? '');

  onDragOver(e: DragEvent) {
    e.preventDefault();
    this.dragOver.set(true);
  }

  onDrop(e: DragEvent) {
    e.preventDefault();
    this.dragOver.set(false);
    const files = Array.from(e.dataTransfer?.files ?? []).filter(f => f.type.startsWith('image/'));
    this.selectedFiles.set([...this.selectedFiles(), ...files]);
  }

  onFilesSelected(e: Event) {
    const files = Array.from((e.target as HTMLInputElement).files ?? []);
    this.selectedFiles.set([...this.selectedFiles(), ...files]);
    (e.target as HTMLInputElement).value = '';
  }

  removeFile(file: File) {
    this.selectedFiles.set(this.selectedFiles().filter(f => f !== file));
  }

  subirEvidencia() {
    if (!this.selectedFiles().length) return;
    this.uploading.set(true);
    this.uploadError.set('');
    this.uploadSuccess.set(false);

    const fd = new FormData();
    this.selectedFiles().forEach(f => fd.append('fotos_evidencia[]', f));

    this.svc.uploadEvidencia(this.id, fd).subscribe({
      next: r => {
        this.uploading.set(false);
        this.uploadSuccess.set(true);
        this.selectedFiles.set([]);
        this.item.set({
          ...this.item(),
          verification_pictures: r.data?.fotos_evidencia ?? this.item().verification_pictures,
        });
      },
      error: err => {
        this.uploading.set(false);
        this.uploadError.set(err?.error?.message ?? 'Error al subir las fotos. Intenta de nuevo.');
      },
    });
  }

  evaluar(estado: 'verified' | 'rejected') {
    this.evalForm.markAllAsTouched();
    if (this.evalForm.invalid) return;

    this.evaluating.set(estado);
    this.evalError.set('');
    const comentario = this.evalForm.value.comentario!;

    this.svc.updateEstado(this.id, estado, comentario).subscribe({
      next: r => {
        this.evaluating.set(false);
        this.item.set(r.data ?? this.item());
      },
      error: err => {
        this.evaluating.set(false);
        this.evalError.set(err?.error?.message ?? 'Error al guardar la evaluacion. Intenta de nuevo.');
      },
    });
  }
}