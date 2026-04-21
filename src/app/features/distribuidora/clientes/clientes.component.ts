import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormBuilder, FormArray, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

// ── Validadores personalizados ──────────────────────────────────────────────

/** CURP mexicana: 18 caracteres con patrón oficial */
function curpValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const pattern = /^[A-Z]{1}[AEIOU]{1}[A-Z]{2}[0-9]{2}(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])[HMhm]{1}(AS|BC|BS|CC|CL|CM|CS|CH|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[0-9A-Z]{1}[0-9]{1}$/i;
  return pattern.test(control.value.toUpperCase()) ? null : { curpInvalid: true };
}

/** RFC: 12 caracteres (persona moral) o 13 (persona física) */
function rfcValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null; // es opcional
  const pfisica = /^[A-ZÑ&]{4}[0-9]{6}[A-Z0-9]{3}$/i;
  const pmoral  = /^[A-ZÑ&]{3}[0-9]{6}[A-Z0-9]{3}$/i;
  const v = control.value.toUpperCase().trim();
  return pfisica.test(v) || pmoral.test(v) ? null : { rfcInvalid: true };
}

/** Exactamente 10 dígitos (acepta espacios y guiones que se ignoran) */
function phone10Validator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null; // opcional
  const digits = control.value.replace(/[\s\-().]/g, '');
  return /^\d{10}$/.test(digits) ? null : { phone10Invalid: true };
}

@Component({
  selector: 'app-clientes',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <div>
      <!-- Header -->
      <div class="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 class="font-[Montserrat] text-[22px] font-extrabold text-[#1A1A2E]">Clientes</h1>
          <p class="text-[13px] text-[#6B7280] mt-0.5">Registro y gestión de clientes finales</p>
        </div>
        <button
          (click)="openCreate()"
          class="inline-flex items-center gap-1.5 px-[18px] py-[9px] rounded-lg text-[13px] font-semibold bg-[#003399] text-white hover:bg-[#002277] transition-colors border-0 cursor-pointer flex-shrink-0"
        >
          <svg class="w-[15px] h-[15px]" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
          </svg>
          Nuevo cliente
        </button>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div class="bg-white rounded-[10px] p-5 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] flex gap-4">
          <div class="w-11 h-11 rounded-[10px] bg-[#003399]/10 text-[#003399] flex items-center justify-center flex-shrink-0">
            <svg class="w-[22px] h-[22px]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
            </svg>
          </div>
          <div>
            <div class="font-[Montserrat] text-[22px] font-extrabold">{{ totalCount() }}</div>
            <div class="text-[12px] text-[#6B7280] mt-0.5">Total</div>
          </div>
        </div>
        <div class="bg-white rounded-[10px] p-5 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] flex gap-4">
          <div class="w-11 h-11 rounded-[10px] bg-[#00A86B]/10 text-[#00A86B] flex items-center justify-center flex-shrink-0">
            <svg class="w-[22px] h-[22px]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div>
            <div class="font-[Montserrat] text-[22px] font-extrabold">{{ alCorrienteCount() }}</div>
            <div class="text-[12px] text-[#6B7280] mt-0.5">Al corriente</div>
          </div>
        </div>
        <div class="bg-white rounded-[10px] p-5 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] flex gap-4">
          <div class="w-11 h-11 rounded-[10px] bg-[#E53935]/10 text-[#E53935] flex items-center justify-center flex-shrink-0">
            <svg class="w-[22px] h-[22px]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            </svg>
          </div>
          <div>
            <div class="font-[Montserrat] text-[22px] font-extrabold">{{ morososCount() }}</div>
            <div class="text-[12px] text-[#6B7280] mt-0.5">Con adeudo</div>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
        <div class="px-5 py-4 border-b border-[#E0E0E0] flex items-center justify-between gap-3">
          <span class="font-[Montserrat] font-bold text-[14px] text-[#1A1A2E]">Lista de clientes</span>
          <input type="search" placeholder="Buscar por nombre, CURP o INE…" (input)="search($event)"
            class="border border-[#E0E0E0] rounded-lg px-3 py-1.5 text-[13px] outline-none focus:border-[#003399] w-64 transition-colors"
          />
        </div>

        @if (loading()) {
          <div class="flex items-center justify-center py-16 text-[#6B7280] text-[13px]">
            <svg class="w-5 h-5 animate-spin mr-2 text-[#003399]" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            Cargando…
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-[13px] border-collapse">
              <thead>
                <tr>
                  @for (h of headers; track h) {
                    <th class="bg-[#F8FAFD] font-[Montserrat] font-bold text-[11px] uppercase tracking-[0.5px] text-[#6B7280] px-5 py-3 text-left border-b border-[#E0E0E0] whitespace-nowrap">{{ h }}</th>
                  }
                </tr>
              </thead>
              <tbody>
                @for (c of paginated(); track c.id) {
                  <tr class="border-b border-[#F0F0F0] hover:bg-[#F8FAFD] transition-colors">
                    <td class="px-5 py-3 font-semibold text-[#1A1A2E]">{{ fullName(c) }}</td>
                    <td class="px-5 py-3 font-mono text-[12px] text-[#6B7280]">{{ c.curp }}</td>
                    <td class="px-5 py-3 font-mono text-[12px] text-[#6B7280]">{{ c.national_id }}</td>
                    <td class="px-5 py-3 text-[#6B7280]">{{ c.person_data?.phone_number || c.person_data?.personal_phone_number || '—' }}</td>
                    <td class="px-5 py-3">
                      <span
                        [class]="c.status === 'al_corriente'
                          ? 'bg-[#00A86B]/10 text-[#00A86B] border-[#00A86B]/20'
                          : 'bg-[#E53935]/10 text-[#E53935] border-[#E53935]/20'"
                        class="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border"
                      >
                        {{ c.status === 'al_corriente' ? 'Al corriente' : c.status }}
                      </span>
                    </td>
                    <td class="px-5 py-3">
                      <div class="flex items-center gap-1">
                        <button (click)="openEdit(c)"
                          class="p-1.5 rounded-lg text-[#003399] hover:bg-[#003399]/10 transition-colors border-0 cursor-pointer bg-transparent"
                          title="Editar"
                        >
                          <svg class="w-[15px] h-[15px]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                          </svg>
                        </button>
                        @if (c.status === 'al_corriente') {
                          <button (click)="markOverdue(c)"
                            class="p-1.5 rounded-lg text-[#E53935] hover:bg-[#E53935]/10 transition-colors border-0 cursor-pointer bg-transparent"
                            title="Marcar como moroso"
                          >
                            <svg class="w-[15px] h-[15px]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
                            </svg>
                          </button>
                        }
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="6" class="px-5 py-12 text-center text-[#6B7280] text-[13px]">No se encontraron clientes.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          @if (totalPages() > 1) {
            <div class="px-5 py-3 border-t border-[#E0E0E0] flex items-center justify-between gap-3 flex-wrap">
              <span class="text-[12px] text-[#6B7280]">
                Mostrando {{ rangeStart() }}–{{ rangeEnd() }} de {{ filtered().length }}
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
        }
      </div>
    </div>

    <!-- ═══════════════ MODAL CREAR / EDITAR ═══════════════ -->
    @if (showModal()) {
      <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        (click)="closeModal()">
        <div class="bg-white rounded-[10px] w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto"
          (click)="$event.stopPropagation()">

          <div class="px-5 py-4 border-b border-[#E0E0E0] flex items-center justify-between sticky top-0 bg-white z-10">
            <span class="font-[Montserrat] font-bold text-[15px]">
              {{ editingId() ? 'Editar cliente' : 'Nuevo cliente' }}
            </span>
            <button (click)="closeModal()" class="text-[#6B7280] hover:text-[#1A1A2E] bg-transparent border-0 cursor-pointer">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <div class="p-5 flex flex-col gap-5">
            @if (errorMsg()) {
              <div class="bg-[#E53935]/10 text-[#E53935] text-[13px] px-3 py-2 rounded-lg border border-[#E53935]/20">{{ errorMsg() }}</div>
            }

            <!-- Identificación -->
            <section>
              <p class="text-[12px] font-bold text-[#003399] uppercase tracking-wide mb-3">Identificación</p>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">

                <!-- CURP -->
                <div class="flex flex-col gap-1">
                  <label class="text-[12px] font-semibold text-[#1A1A2E]" for="c-curp">CURP *</label>
                  <input id="c-curp" [formControl]="formCurp" type="text"
                    placeholder="ABCD000101HDFXXX00"
                    maxlength="18"
                    (input)="toUppercaseCtrl(formCurp, $event)"
                    class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] uppercase font-mono outline-none focus:border-[#003399] transition-colors"
                    [class.border-red-500]="formCurp.invalid && formCurp.touched"
                    [readOnly]="!!editingId()"
                  />
                  <!-- Contador de caracteres -->
                  <div class="flex items-center justify-between">
                    <span class="text-[11px] text-[#6B7280]">{{ (formCurp.value?.length ?? 0) }}/18 caracteres</span>
                  </div>
                  @if (formCurp.touched) {
                    @if (formCurp.errors?.['required']) {
                      <span class="text-[11px] text-[#E53935]">La CURP es obligatoria.</span>
                    } @else if (formCurp.errors?.['minlength'] || formCurp.errors?.['maxlength']) {
                      <span class="text-[11px] text-[#E53935]">Debe tener exactamente 18 caracteres.</span>
                    } @else if (formCurp.errors?.['curpInvalid']) {
                      <span class="text-[11px] text-[#E53935]">Formato de CURP inválido.</span>
                    }
                  }
                </div>

                <!-- No. INE -->
                <div class="flex flex-col gap-1">
                  <label class="text-[12px] font-semibold text-[#1A1A2E]" for="c-ine">No. INE *</label>
                  <input id="c-ine" [formControl]="formNationalId" type="text"
                    placeholder="Número de credencial"
                    class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] transition-colors"
                    [class.border-red-500]="formNationalId.invalid && formNationalId.touched"
                    [readOnly]="!!editingId()"
                  />
                  @if (formNationalId.invalid && formNationalId.touched) {
                    <span class="text-[11px] text-[#E53935]">Número de INE obligatorio.</span>
                  }
                </div>
              </div>
            </section>

            <!-- Documentos -->
            <section>
              <p class="text-[12px] font-bold text-[#003399] uppercase tracking-wide mb-3">Documentos</p>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div class="flex flex-col gap-1">
                  <label class="text-[12px] font-semibold text-[#1A1A2E]" for="c-ine-file">
                    Imagen INE {{ editingId() ? '(opcional)' : '*' }}
                  </label>
                  <input id="c-ine-file" type="file" accept=".jpg,.jpeg,.png,.pdf"
                    (change)="onFileChange($event, 'national_id_image')"
                    class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] transition-colors file:mr-3 file:rounded-lg file:border-0 file:bg-[#003399]/10 file:text-[#003399] file:px-3 file:py-1 file:text-[12px] file:font-semibold file:cursor-pointer"
                  />
                </div>
                <div class="flex flex-col gap-1">
                  <label class="text-[12px] font-semibold text-[#1A1A2E]" for="c-dom-file">
                    Comprobante domicilio {{ editingId() ? '(opcional)' : '*' }}
                  </label>
                  <input id="c-dom-file" type="file" accept=".jpg,.jpeg,.png,.pdf"
                    (change)="onFileChange($event, 'proof_of_address')"
                    class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] transition-colors file:mr-3 file:rounded-lg file:border-0 file:bg-[#003399]/10 file:text-[#003399] file:px-3 file:py-1 file:text-[12px] file:font-semibold file:cursor-pointer"
                  />
                </div>
              </div>
            </section>

            <!-- Datos personales -->
            <section [formGroup]="personForm">
              <p class="text-[12px] font-bold text-[#003399] uppercase tracking-wide mb-3">Datos personales</p>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-3">

                <!-- Nombre(s) -->
                <div class="flex flex-col gap-1">
                  <label class="text-[12px] font-semibold text-[#1A1A2E]" for="c-name">Nombre(s) *</label>
                  <input id="c-name" formControlName="name" type="text" placeholder="Juan" maxlength="100"
                    class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] transition-colors"
                    [class.border-red-500]="isPDInvalid('name')"
                  />
                  @if (isPDInvalid('name')) {
                    @if (personForm.get('name')?.errors?.['required']) {
                      <span class="text-[11px] text-[#E53935]">Obligatorio.</span>
                    } @else if (personForm.get('name')?.errors?.['pattern']) {
                      <span class="text-[11px] text-[#E53935]">Solo letras, sin números.</span>
                    }
                  }
                </div>

                <!-- Primer apellido -->
                <div class="flex flex-col gap-1">
                  <label class="text-[12px] font-semibold text-[#1A1A2E]" for="c-fn">Primer apellido *</label>
                  <input id="c-fn" formControlName="first_last_name" type="text" placeholder="García" maxlength="100"
                    class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] transition-colors"
                    [class.border-red-500]="isPDInvalid('first_last_name')"
                  />
                  @if (isPDInvalid('first_last_name')) {
                    @if (personForm.get('first_last_name')?.errors?.['required']) {
                      <span class="text-[11px] text-[#E53935]">Obligatorio.</span>
                    } @else if (personForm.get('first_last_name')?.errors?.['pattern']) {
                      <span class="text-[11px] text-[#E53935]">Solo letras, sin números.</span>
                    }
                  }
                </div>

                <!-- Segundo apellido -->
                <div class="flex flex-col gap-1">
                  <label class="text-[12px] font-semibold text-[#1A1A2E]" for="c-sn">Segundo apellido</label>
                  <input id="c-sn" formControlName="second_last_name" type="text" placeholder="López" maxlength="100"
                    class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] transition-colors"
                  />
                  @if (personForm.get('second_last_name')?.touched && personForm.get('second_last_name')?.errors?.['pattern']) {
                    <span class="text-[11px] text-[#E53935]">Solo letras, sin números.</span>
                  }
                </div>

                <!-- Género -->
                <div class="flex flex-col gap-1">
                  <label class="text-[12px] font-semibold text-[#1A1A2E]" for="c-gender">Sexo</label>
                  <select id="c-gender" formControlName="gender"
                    class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] transition-colors bg-white">
                    <option value="">— —</option>
                    <option value="F">Femenino</option>
                    <option value="M">Masculino</option>
                    <option value="O">Otro</option>
                  </select>
                </div>

                <!-- Fecha de nacimiento -->
                <div class="flex flex-col gap-1">
                  <label class="text-[12px] font-semibold text-[#1A1A2E]" for="c-bd">Fecha de nacimiento</label>
                  <input id="c-bd" formControlName="birth_date" type="date"
                    class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] transition-colors"
                  />
                </div>

                <!-- RFC -->
                <div class="flex flex-col gap-1">
                  <label class="text-[12px] font-semibold text-[#1A1A2E]" for="c-rfc">
                    RFC
                    <span class="text-[10px] text-[#6B7280] font-normal ml-1">(12 o 13 caracteres)</span>
                  </label>
                  <input id="c-rfc" formControlName="rfc" type="text"
                    placeholder="ABCD000101XXX"
                    maxlength="13"
                    (input)="toUppercaseFormCtrl('rfc', $event)"
                    class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] uppercase font-mono outline-none focus:border-[#003399] transition-colors"
                    [class.border-red-500]="isPDInvalid('rfc')"
                  />
                  <div class="flex items-center justify-between">
                    <span class="text-[11px] text-[#6B7280]">{{ (personForm.get('rfc')?.value?.length ?? 0) }}/13 caracteres</span>
                  </div>
                  @if (isPDInvalid('rfc')) {
                    <span class="text-[11px] text-[#E53935]">RFC inválido (12 chars persona moral, 13 persona física).</span>
                  }
                </div>

                <!-- Tel. personal -->
                <div class="flex flex-col gap-1">
                  <label class="text-[12px] font-semibold text-[#1A1A2E]" for="c-tel">
                    Tel. personal
                    <span class="text-[10px] text-[#6B7280] font-normal ml-1">(10 dígitos)</span>
                  </label>
                  <input id="c-tel" formControlName="personal_phone_number"
                    type="tel"
                    placeholder="614 000 0000"
                    maxlength="14"
                    class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] transition-colors"
                    [class.border-red-500]="isPDInvalid('personal_phone_number')"
                  />
                  @if (isPDInvalid('personal_phone_number')) {
                    <span class="text-[11px] text-[#E53935]">Debe tener exactamente 10 dígitos.</span>
                  }
                </div>

                <!-- Celular -->
                <div class="flex flex-col gap-1">
                  <label class="text-[12px] font-semibold text-[#1A1A2E]" for="c-cel">
                    Celular
                    <span class="text-[10px] text-[#6B7280] font-normal ml-1">(10 dígitos)</span>
                  </label>
                  <input id="c-cel" formControlName="phone_number"
                    type="tel"
                    placeholder="614 000 0001"
                    maxlength="14"
                    class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] transition-colors"
                    [class.border-red-500]="isPDInvalid('phone_number')"
                  />
                  @if (isPDInvalid('phone_number')) {
                    <span class="text-[11px] text-[#E53935]">Debe tener exactamente 10 dígitos.</span>
                  }
                </div>

              </div>
            </section>

            <!-- ══ Tarjetas ══ -->
            <section>
                <div class="flex items-center justify-between mb-3">
                  <p class="text-[12px] font-bold text-[#003399] uppercase tracking-wide">Tarjetas bancarias</p>
                  <button type="button" (click)="addCard()"
                    class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-[#003399]/10 text-[#003399] hover:bg-[#003399]/20 transition-colors border-0 cursor-pointer">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
                    </svg>
                    Agregar tarjeta
                  </button>
                </div>

                @if (cardsArray.length === 0) {
                  <p class="text-[12px] text-[#6B7280] italic">Sin tarjetas agregadas (opcional).</p>
                }

                <div class="flex flex-col gap-3" [formGroup]="cardsForm">
                  <div formArrayName="cards">
                    @for (card of cardsArray.controls; track $index) {
                      <div [formGroupName]="$index"
                        class="bg-[#F8FAFD] rounded-lg p-4 border border-[#E0E0E0] flex flex-col gap-3">
                        <div class="flex items-center justify-between">
                          <span class="text-[12px] font-bold text-[#1A1A2E]">Tarjeta #{{ $index + 1 }}</span>
                          <button type="button" (click)="removeCard($index)"
                            class="text-[#E53935] hover:bg-[#E53935]/10 p-1 rounded-lg transition-colors bg-transparent border-0 cursor-pointer">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                          </button>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div class="flex flex-col gap-1">
                            <label class="text-[12px] font-semibold text-[#1A1A2E]">Número de tarjeta *</label>
                            <input formControlName="card" type="text" placeholder="0000 0000 0000 0000"
                              maxlength="19"
                              (input)="formatCardInput($event, $index)"
                              class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] font-mono outline-none focus:border-[#003399] transition-colors tracking-widest"
                              [class.border-red-500]="card.get('card')?.invalid && card.get('card')?.touched"
                            />
                            @if (card.get('card')?.invalid && card.get('card')?.touched) {
                              <span class="text-[11px] text-[#E53935]">Número requerido.</span>
                            }
                          </div>
                          <div class="flex flex-col gap-1">
                            <label class="text-[12px] font-semibold text-[#1A1A2E]">Tipo *</label>
                            <select formControlName="type"
                              class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] transition-colors bg-white"
                              [class.border-red-500]="card.get('type')?.invalid && card.get('type')?.touched"
                            >
                              <option value="">— Seleccionar —</option>
                              <option value="debito">Débito</option>
                              <option value="credito">Crédito</option>
                            </select>
                            @if (card.get('type')?.invalid && card.get('type')?.touched) {
                              <span class="text-[11px] text-[#E53935]">Tipo requerido.</span>
                            }
                          </div>
                          <div class="flex flex-col gap-1">
                            <label class="text-[12px] font-semibold text-[#1A1A2E]">Banco *</label>
                            <div class="flex gap-2">
                              <select formControlName="bank_account_id"
                                class="flex-1 border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] transition-colors bg-white"
                                [class.border-red-500]="card.get('bank_account_id')?.invalid && card.get('bank_account_id')?.touched"
                              >
                                <option value="">— Seleccionar banco —</option>
                                @for (b of bankAccounts(); track b.id) {
                                  <option [value]="b.id">{{ b.name }}</option>
                                }
                              </select>
                              <button type="button" (click)="openBankModal()"
                                title="Agregar nuevo banco"
                                class="px-2.5 py-2 rounded-lg bg-[#003399]/10 text-[#003399] hover:bg-[#003399]/20 transition-colors border-0 cursor-pointer flex-shrink-0">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
                                </svg>
                              </button>
                            </div>
                            @if (card.get('bank_account_id')?.invalid && card.get('bank_account_id')?.touched) {
                              <span class="text-[11px] text-[#E53935]">Banco requerido.</span>
                            }
                          </div>
                        </div>
                      </div>
                    }
                  </div>
                </div>
            </section>

            <!-- Indicador de campos requeridos pendientes -->
            @if (!isFormReadyToSave() && !editingId()) {
              <div class="flex items-center gap-2 bg-[#FFF8E1] border border-[#FFE082] rounded-lg px-3 py-2 text-[12px] text-[#795548]">
                <svg class="w-4 h-4 flex-shrink-0 text-[#F9A825]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Completa los campos obligatorios (*) para habilitar el guardado.
              </div>
            }

            <div class="flex justify-end gap-2 pt-1">
              <button type="button" (click)="closeModal()"
                class="px-4 py-2 rounded-lg text-[13px] font-semibold bg-white text-[#003399] border border-[#E0E0E0] hover:border-[#003399] transition-colors cursor-pointer"
              >Cancelar</button>

              <!-- Botón Guardar: en creación pide todos los campos, en edición permite actualización parcial -->
              <button type="button" (click)="submit()"
                [disabled]="saving() || (!editingId() && !isFormReadyToSave())"
                [title]="!editingId() && !isFormReadyToSave() ? 'Completa todos los campos obligatorios' : ''"
                class="px-4 py-2 rounded-lg text-[13px] font-semibold bg-[#003399] text-white hover:bg-[#002277] transition-colors border-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                @if (saving()) { Guardando… } @else { Guardar }
              </button>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- ═══════════════ MODAL NUEVO BANCO ═══════════════ -->
    @if (showBankModal()) {
      <div class="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4"
        (click)="closeBankModal()">
        <div class="bg-white rounded-[10px] w-full max-w-sm shadow-xl"
          (click)="$event.stopPropagation()">

          <div class="px-5 py-4 border-b border-[#E0E0E0] flex items-center justify-between">
            <span class="font-[Montserrat] font-bold text-[15px]">Nuevo banco</span>
            <button (click)="closeBankModal()" class="text-[#6B7280] hover:text-[#1A1A2E] bg-transparent border-0 cursor-pointer">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <div class="p-5 flex flex-col gap-4">
            @if (bankError()) {
              <div class="bg-[#E53935]/10 text-[#E53935] text-[13px] px-3 py-2 rounded-lg border border-[#E53935]/20">{{ bankError() }}</div>
            }
            @if (bankSuccess()) {
              <div class="bg-[#00A86B]/10 text-[#00A86B] text-[13px] px-3 py-2 rounded-lg border border-[#00A86B]/20">{{ bankSuccess() }}</div>
            }

            <div class="flex flex-col gap-1">
              <label class="text-[12px] font-semibold text-[#1A1A2E]">Nombre del banco *</label>
              <input type="text" [formControl]="bankNameCtrl" placeholder="Ej. BBVA, Santander…"
                class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] transition-colors"
                [class.border-red-500]="bankNameCtrl.invalid && bankNameCtrl.touched"
              />
              @if (bankNameCtrl.invalid && bankNameCtrl.touched) {
                <span class="text-[11px] text-[#E53935]">Nombre obligatorio.</span>
              }
            </div>

            <div class="flex justify-end gap-2">
              <button type="button" (click)="closeBankModal()"
                class="px-4 py-2 rounded-lg text-[13px] font-semibold bg-white text-[#003399] border border-[#E0E0E0] hover:border-[#003399] transition-colors cursor-pointer"
              >Cancelar</button>
              <button type="button" (click)="submitBank()" [disabled]="bankSaving()"
                class="px-4 py-2 rounded-lg text-[13px] font-semibold bg-[#003399] text-white hover:bg-[#002277] transition-colors border-0 cursor-pointer disabled:opacity-60"
              >
                @if (bankSaving()) { Guardando… } @else { Guardar banco }
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class ClientesComponent implements OnInit {
  private http = inject(HttpClient);
  private fb   = inject(FormBuilder);

  private readonly API      = `${environment.apiUrl}/distribuidora/customer`;
  private readonly API_BANK = `${environment.apiUrl}/distribuidora/customer/card`;

  customers = signal<any[]>([]);
  filtered  = signal<any[]>([]);
  loading   = signal(true);
  showModal = signal(false);
  saving    = signal(false);
  editingId = signal<number | null>(null);
  errorMsg  = signal('');

  // ── Banks ────────────────────────────────────────────────────
  bankAccounts  = signal<any[]>([]);
  showBankModal = signal(false);
  bankSaving    = signal(false);
  bankError     = signal('');
  bankSuccess   = signal('');
  bankNameCtrl  = this.fb.control('', [Validators.required]);

  // ── Files ───────────────────────────────────────────────────
  private ineFile: File | null = null;
  private domFile: File | null = null;

  // ── Form controls ───────────────────────────────────────────
  /** CURP: obligatorio, exactamente 18 chars, patrón oficial */
  formCurp = this.fb.control('', [
    Validators.required,
    Validators.minLength(18),
    Validators.maxLength(18),
    curpValidator,
  ]);

  /** No. INE: solo obligatorio */
  formNationalId = this.fb.control('', [Validators.required]);

  personForm = this.fb.group({
    name:                  ['', [Validators.required, Validators.maxLength(100), Validators.pattern(/^[a-zA-ZÁÉÍÓÚáéíóúÑñÜü\s]+$/)]],
    first_last_name:       ['', [Validators.required, Validators.maxLength(100), Validators.pattern(/^[a-zA-ZÁÉÍÓÚáéíóúÑñÜü\s]+$/)]],
    second_last_name:      ['', [Validators.maxLength(100), Validators.pattern(/^[a-zA-ZÁÉÍÓÚáéíóúÑñÜü\s]*$/)]],
    gender:                [''],
    birth_date:            [''],
    curp:                  [''],
    /** RFC: opcional, pero si se llena debe tener 12 o 13 chars válidos */
    rfc:                   ['', [Validators.maxLength(13), rfcValidator]],
    /** Teléfonos: opcionales, pero si se llenan deben tener 10 dígitos */
    personal_phone_number: ['', [Validators.maxLength(20), phone10Validator]],
    phone_number:          ['', [Validators.maxLength(20), phone10Validator]],
  });

  // ── Cards FormArray ─────────────────────────────────────────
  cardsForm = this.fb.group({
    cards: this.fb.array([]),
  });

  get cardsArray(): FormArray {
    return this.cardsForm.get('cards') as FormArray;
  }

  addCard() {
    this.cardsArray.push(this.fb.group({
      card:            ['', [Validators.required]],
      type:            ['', [Validators.required]],
      bank_account_id: ['', [Validators.required]],
    }));
  }

  removeCard(index: number) {
    this.cardsArray.removeAt(index);
  }

  formatCardInput(e: Event, index: number) {
    const input = e.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '').slice(0, 16);
    const formatted = digits.replace(/(.{4})/g, '$1 ').trim();
    input.value = formatted;
    this.cardsArray.at(index)?.get('card')?.setValue(digits, { emitEvent: false });
  }

  // ── Helpers uppercase ───────────────────────────────────────
  /** Convierte a mayúsculas un FormControl standalone al teclear */
  toUppercaseCtrl(ctrl: ReturnType<typeof this.fb.control>, e: Event) {
    const input = e.target as HTMLInputElement;
    const pos   = input.selectionStart ?? 0;
    const upper = input.value.toUpperCase();
    ctrl.setValue(upper, { emitEvent: false });
    input.value = upper;
    input.setSelectionRange(pos, pos);
  }

  /** Convierte a mayúsculas un control dentro de personForm al teclear */
  toUppercaseFormCtrl(field: string, e: Event) {
    const input = e.target as HTMLInputElement;
    const pos   = input.selectionStart ?? 0;
    const upper = input.value.toUpperCase();
    this.personForm.get(field)?.setValue(upper, { emitEvent: false });
    input.value = upper;
    input.setSelectionRange(pos, pos);
  }

  // ── Computed: valida si el formulario está listo para guardar ──
  isFormReadyToSave(): boolean {
    const isCreate = !this.editingId();

    // En creación: CURP, INE, archivos y datos personales son obligatorios
    if (isCreate) {
      if (this.formCurp.invalid) return false;
      if (this.formNationalId.invalid) return false;
      if (!this.ineFile || !this.domFile) return false;
      if (this.personForm.invalid) return false;
    } else {
      // En edición: solo validar tarjetas si se agregaron
      // Los datos personales son opcionales en edición
    }

    // Tarjetas (opcional): si se agregaron deben ser válidas
    if (this.cardsArray.length > 0 && this.cardsArray.invalid) return false;

    return true;
  }

  // ── Pagination ──────────────────────────────────────────────
  currentPage = signal(1);
  pageSize    = signal(10);
  readonly pageSizeOptions = [5, 10, 20, 50];
  headers = ['Nombre', 'CURP', 'INE', 'Teléfono', 'Estado', 'Acciones'];

  totalPages = computed(() => Math.max(1, Math.ceil(this.filtered().length / this.pageSize())));
  paginated  = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filtered().slice(start, start + this.pageSize());
  });
  rangeStart = computed(() =>
    this.filtered().length === 0 ? 0 : (this.currentPage() - 1) * this.pageSize() + 1
  );
  rangeEnd = computed(() =>
    Math.min(this.currentPage() * this.pageSize(), this.filtered().length)
  );
  visiblePages = computed(() => {
    const total = this.totalPages();
    const cur   = this.currentPage();
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: number[] = [1];
    if (cur > 3) pages.push(-1);
    for (let p = Math.max(2, cur - 1); p <= Math.min(total - 1, cur + 1); p++) pages.push(p);
    if (cur < total - 2) pages.push(-1);
    pages.push(total);
    return pages;
  });

  // ── Stats ───────────────────────────────────────────────────
  totalCount       = computed(() => this.customers().length);
  alCorrienteCount = computed(() => this.customers().filter(c => c.status === 'al_corriente').length);
  morososCount     = computed(() => this.customers().filter(c => c.status !== 'al_corriente').length);

  fullName(c: any): string {
    return [c.person_data?.name, c.person_data?.first_last_name, c.person_data?.second_last_name]
      .filter(Boolean).join(' ');
  }

  isPDInvalid(f: string): boolean {
    const c = this.personForm.get(f);
    return !!(c?.invalid && c?.touched);
  }

  // ── Lifecycle ───────────────────────────────────────────────
  ngOnInit() {
    this.load();
    this.loadBankAccounts();
  }

  private loadBankAccounts() {
    this.http.get<any>(this.API_BANK).subscribe({
      next: res => this.bankAccounts.set(res.data ?? []),
      error: err => console.error('Error cargando bancos:', err.error),
    });
  }

  private load() {
    this.loading.set(true);
    this.http.get<any>(this.API).subscribe({
      next: res => {
        const data = res.data?.data ?? res.data ?? [];
        this.customers.set(data);
        this.filtered.set(data);
        this.currentPage.set(1);
        this.loading.set(false);
      },
      error: err => {
        console.error('Status:', err.status);
        console.error('Error body:', err.error);
        this.loading.set(false);
      },
    });
  }

  search(e: Event) {
    const q = (e.target as HTMLInputElement).value.toLowerCase();
    this.filtered.set(this.customers().filter(c =>
      this.fullName(c).toLowerCase().includes(q) ||
      (c.curp ?? '').toLowerCase().includes(q) ||
      (c.national_id ?? '').toLowerCase().includes(q)
    ));
    this.currentPage.set(1);
  }

  goToPage(p: number) { this.currentPage.set(Math.max(1, Math.min(p, this.totalPages()))); }

  changePageSize(e: Event) {
    this.pageSize.set(Number((e.target as HTMLSelectElement).value));
    this.currentPage.set(1);
  }

  // ── Modal ───────────────────────────────────────────────────
  openCreate() {
    this.editingId.set(null);
    this.formCurp.reset();
    this.formNationalId.reset();
    this.personForm.reset();
    this.cardsArray.clear();
    this.ineFile = null;
    this.domFile = null;
    this.errorMsg.set('');
    this.showModal.set(true);
  }

  openEdit(c: any) {
    this.editingId.set(c.id);
    this.formCurp.setValue(c.curp ?? '');
    this.formNationalId.setValue(c.national_id ?? '');
    this.personForm.patchValue(c.person_data ?? {});
    this.cardsArray.clear();

    // Cargar tarjetas existentes
    if (c.cards && Array.isArray(c.cards)) {
      c.cards.forEach((card: any) => {
        this.cardsArray.push(this.fb.group({
          card:            [card.card ?? '', [Validators.required]],
          type:            [card.type ?? '', [Validators.required]],
          bank_account_id: [card.bank_account_id ?? '', [Validators.required]],
        }));
      });
    }

    this.ineFile = null;
    this.domFile = null;
    this.errorMsg.set('');
    this.showModal.set(true);
  }

  closeModal() { this.showModal.set(false); }

  onFileChange(e: Event, field: 'national_id_image' | 'proof_of_address') {
    const file = (e.target as HTMLInputElement).files?.[0] ?? null;
    if (field === 'national_id_image') this.ineFile = file;
    else this.domFile = file;
  }

  // ── Submit ──────────────────────────────────────────────────
  submit() {
    const isCreate = !this.editingId();

    // En creación, marcar todo como touched para validar
    if (isCreate) {
      this.formCurp.markAsTouched();
      this.formNationalId.markAsTouched();
      this.personForm.markAllAsTouched();
      this.cardsArray.controls.forEach(c => (c as FormGroup).markAllAsTouched());
    } else {
      // En edición, solo marcar tarjetas como touched
      this.cardsArray.controls.forEach(c => (c as FormGroup).markAllAsTouched());
    }

    if (!this.isFormReadyToSave()) {
      if (isCreate && (!this.ineFile || !this.domFile)) {
        this.errorMsg.set('Debes adjuntar la imagen del INE y el comprobante de domicilio.');
      }
      return;
    }

    this.saving.set(true);
    this.errorMsg.set('');

    const fd = new FormData();

    if (isCreate) {
      fd.append('curp', this.formCurp.value!.toUpperCase());
      fd.append('national_id', this.formNationalId.value!);
    }

    if (this.ineFile) fd.append('national_id_image', this.ineFile);
    if (this.domFile) fd.append('proof_of_address', this.domFile);

    // person_data
    const pd = this.personForm.value;
    Object.entries(pd).forEach(([key, val]) => {
      if (val) fd.append(`person_data[${key}]`, val as string);
    });

    // cards — en creación y edición
    if (this.cardsArray.value.length > 0) {
      this.cardsArray.value.forEach((card: any, i: number) => {
        fd.append(`cards[${i}][card]`,            card.card.replace(/\s/g, ''));
        fd.append(`cards[${i}][type]`,            card.type);
        fd.append(`cards[${i}][bank_account_id]`, String(card.bank_account_id));
      });
    }

    const url = isCreate ? this.API : `${this.API}/${this.editingId()}`;
    if (!isCreate) fd.append('_method', 'PUT');

    this.http.post<any>(url, fd).subscribe({
      next: () => {
        this.saving.set(false);
        this.closeModal();
        this.load();
      },
      
      error: err => {
  this.saving.set(false);

  console.group('❌ Error 500 detalle:');
  console.log('Status:', err.status);
  console.log('Message:', err.error?.message);
  console.log('Errors:', err.error?.errors);
  console.log('Exception:', err.error?.exception);
  console.log('File:', err.error?.file);
  console.log('Line:', err.error?.line);
  console.log('Trace:', err.error?.trace);
  console.groupEnd();

  const errors = err?.error?.errors;
  if (errors) {
    // Muestra TODOS los errores de validación, no solo el primero
    const allErrors = Object.entries(errors)
      .map(([campo, msgs]) => `• ${campo}: ${(msgs as string[]).join(', ')}`)
      .join('\n');
    this.errorMsg.set(allErrors);
  } else {
    this.errorMsg.set(
      err?.error?.message ?? 'Error interno del servidor (500). Revisa la consola para más detalles.'
    );
  }
},
    });
  }

  // ── Modal banco ─────────────────────────────────────────────
  openBankModal() {
    this.bankNameCtrl.reset();
    this.bankError.set('');
    this.bankSuccess.set('');
    this.showBankModal.set(true);
  }

  closeBankModal() { this.showBankModal.set(false); }

  submitBank() {
    this.bankNameCtrl.markAsTouched();
    if (this.bankNameCtrl.invalid) return;

    this.bankSaving.set(true);
    this.bankError.set('');
    this.bankSuccess.set('');

    this.http.post<any>(this.API_BANK, { name: this.bankNameCtrl.value }).subscribe({
      next: res => {
        this.bankSaving.set(false);
        this.bankSuccess.set(res?.message ?? 'Banco creado correctamente.');
        this.loadBankAccounts();
        setTimeout(() => this.closeBankModal(), 1500);
      },
      error: err => {
        this.bankSaving.set(false);
        this.bankError.set(err?.error?.message ?? 'Error al crear el banco.');
      },
    });
  }

  // ── Marcar moroso ───────────────────────────────────────────
  markOverdue(c: any) {
    if (c.status !== 'al_corriente') {
      alert('Este cliente ya tiene un estado diferente a "al corriente".');
      return;
    }
    if (!confirm(`¿Marcar a "${this.fullName(c)}" como moroso?`)) return;

    this.http.get<any>(`${this.API}/${c.id}`).subscribe({
      next: res => {
        alert(res?.message ?? 'Cambio de estado exitoso.');
        this.load();
      },
      error: err => {
        alert(err?.error?.message ?? 'No se pudo cambiar el estado.');
      },
    });
  }
}
