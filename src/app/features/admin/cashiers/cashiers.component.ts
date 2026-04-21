import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Employee, EmployeeForm, Subsidiary } from '../../../core/models';
import { curpValidator, rfcValidator, phoneValidator, passwordMatchValidator, onlyTextValidator, noInjectionValidator, minAgeValidator, strongPasswordValidator, getErrorMessage } from '../../../core/validators/form-validators';
import { EmployeeService } from '../../../core/services/employee.service';
import { SubsidiaryService } from '../../../core/services/subsidiary.service';

@Component({
  selector: 'app-cashiers',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <div>
      <!-- Header -->
      <div class="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 class="font-[Montserrat] text-[22px] font-extrabold text-[#1A1A2E]">Cajeras</h1>
          <p class="text-[13px] text-[#6B7280] mt-0.5">Registro y gestión del personal de cajas</p>
        </div>
        <button
          (click)="openCreate()"
          class="inline-flex items-center gap-1.5 px-[18px] py-[9px] rounded-lg text-[13px] font-semibold bg-[#003399] text-white hover:bg-[#002277] transition-colors border-0 cursor-pointer flex-shrink-0"
        >
          <svg class="w-[15px] h-[15px]" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
          </svg>
          Nueva cajera
        </button>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div class="bg-white rounded-[10px] p-5 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] flex gap-4">
          <div class="w-11 h-11 rounded-[10px] bg-[#003399]/10 text-[#003399] flex items-center justify-center flex-shrink-0">
            <svg class="w-[22px] h-[22px]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
          </div>
          <div>
            <div class="font-[Montserrat] text-[22px] font-extrabold">{{ employees().length }}</div>
            <div class="text-[12px] text-[#6B7280] mt-0.5">Total</div>
          </div>
        </div>
        <div class="bg-white rounded-[10px] p-5 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] flex gap-4">
          <div class="w-11 h-11 rounded-[10px] bg-[#00A86B]/10 text-[#00A86B] flex items-center justify-center flex-shrink-0">
            <svg class="w-[22px] h-[22px]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <div>
            <div class="font-[Montserrat] text-[22px] font-extrabold">{{ activeCount() }}</div>
            <div class="text-[12px] text-[#6B7280] mt-0.5">Activos</div>
          </div>
        </div>
        <div class="bg-white rounded-[10px] p-5 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] flex gap-4">
          <div class="w-11 h-11 rounded-[10px] bg-[#E53935]/10 text-[#E53935] flex items-center justify-center flex-shrink-0">
            <svg class="w-[22px] h-[22px]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>
          </div>
          <div>
            <div class="font-[Montserrat] text-[22px] font-extrabold">{{ inactiveCount() }}</div>
            <div class="text-[12px] text-[#6B7280] mt-0.5">Inactivos</div>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
        <div class="px-5 py-4 border-b border-[#E0E0E0] flex items-center justify-between gap-3">
          <span class="font-[Montserrat] font-bold text-[14px] text-[#1A1A2E]">Lista de cajeras</span>
          <input type="search" placeholder="Buscar…" (input)="search($event)"
            class="border border-[#E0E0E0] rounded-lg px-3 py-1.5 text-[13px] outline-none focus:border-[#003399] w-52 transition-colors"
            aria-label="Buscar cajera"
          />
        </div>

        @if (loading()) {
          <div class="flex items-center justify-center py-16 text-[#6B7280] text-[13px]">
            <svg class="w-5 h-5 animate-spin mr-2 text-[#003399]" fill="none" viewBox="0 0 24 24" aria-hidden="true">
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
                @for (e of paginated(); track e.id) {
                  <tr class="border-b border-[#F0F0F0] hover:bg-[#F8FAFD] transition-colors">
                    <td class="px-5 py-3 font-semibold text-[#1A1A2E]">{{ fullName(e) }}</td>
                    <td class="px-5 py-3 text-[#6B7280]">{{ e.email }}</td>
                    <td class="px-5 py-3 text-[#6B7280]">{{ e.subsidiary || '—' }}</td>
                    <td class="px-5 py-3 font-mono text-[12px] text-[#6B7280]">{{ e.code || '—' }}</td>
                    <td class="px-5 py-3">
                      <span
                        [class]="e.status
                          ? 'bg-[#00A86B]/10 text-[#00A86B] border-[#00A86B]/20'
                          : 'bg-[#E53935]/10 text-[#E53935] border-[#E53935]/20'"
                        class="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border"
                      >
                        {{ e.status ? 'Activo' : 'Inactivo' }}
                      </span>
                    </td>
                    <td class="px-5 py-3">
                      <div class="flex items-center gap-1">
                        <button (click)="openEdit(e)"
                          class="p-1.5 rounded-lg text-[#003399] hover:bg-[#003399]/10 transition-colors border-0 cursor-pointer bg-transparent"
                          aria-label="Editar" title="Editar"
                        >
                          <svg class="w-[15px] h-[15px]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                        </button>
                        @if (e.status) {
                          <button (click)="deactivate(e)"
                            class="p-1.5 rounded-lg text-[#E53935] hover:bg-[#E53935]/10 transition-colors border-0 cursor-pointer bg-transparent"
                            aria-label="Dar de baja" title="Dar de baja"
                          >
                            <svg class="w-[15px] h-[15px]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>
                          </button>
                        } @else {
                          <button (click)="restore(e)"
                            class="p-1.5 rounded-lg text-[#00A86B] hover:bg-[#00A86B]/10 transition-colors border-0 cursor-pointer bg-transparent"
                            aria-label="Activar" title="Activar"
                          >
                            <svg class="w-[15px] h-[15px]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                          </button>
                        }
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="6" class="px-5 py-12 text-center text-[#6B7280] text-[13px]">No se encontraron cajeras.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          @if (totalPages() > 1 || filtered().length > pageSize()) {
            <div class="px-5 py-3 border-t border-[#E0E0E0] flex items-center justify-between gap-3 flex-wrap">
              <span class="text-[12px] text-[#6B7280]">
                Mostrando {{ rangeStart() }}–{{ rangeEnd() }} de {{ filtered().length }} registros
              </span>
              <div class="flex items-center gap-1">
                <button (click)="goToPage(1)" [disabled]="currentPage() === 1"
                  class="w-8 h-8 flex items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#F0F4FF] hover:text-[#003399] disabled:opacity-30 disabled:cursor-not-allowed border-0 bg-transparent cursor-pointer transition-colors"
                  aria-label="Primera página" title="Primera página">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11 19l-7-7 7-7M18 19l-7-7 7-7"/></svg>
                </button>
                <button (click)="goToPage(currentPage() - 1)" [disabled]="currentPage() === 1"
                  class="w-8 h-8 flex items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#F0F4FF] hover:text-[#003399] disabled:opacity-30 disabled:cursor-not-allowed border-0 bg-transparent cursor-pointer transition-colors"
                  aria-label="Página anterior" title="Anterior">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
                </button>
                @for (page of visiblePages(); track page) {
                  @if (page === -1) {
                    <span class="w-8 h-8 flex items-center justify-center text-[12px] text-[#6B7280]">…</span>
                  } @else {
                    <button (click)="goToPage(page)"
                      [class]="page === currentPage() ? 'bg-[#003399] text-white shadow-sm' : 'text-[#6B7280] hover:bg-[#F0F4FF] hover:text-[#003399]'"
                      class="w-8 h-8 flex items-center justify-center rounded-lg text-[12px] font-semibold border-0 cursor-pointer transition-colors"
                      [attr.aria-current]="page === currentPage() ? 'page' : null">
                      {{ page }}
                    </button>
                  }
                }
                <button (click)="goToPage(currentPage() + 1)" [disabled]="currentPage() === totalPages()"
                  class="w-8 h-8 flex items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#F0F4FF] hover:text-[#003399] disabled:opacity-30 disabled:cursor-not-allowed border-0 bg-transparent cursor-pointer transition-colors"
                  aria-label="Página siguiente" title="Siguiente">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
                </button>
                <button (click)="goToPage(totalPages())" [disabled]="currentPage() === totalPages()"
                  class="w-8 h-8 flex items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#F0F4FF] hover:text-[#003399] disabled:opacity-30 disabled:cursor-not-allowed border-0 bg-transparent cursor-pointer transition-colors"
                  aria-label="Última página" title="Última página">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 5l7 7-7 7M6 5l7 7-7 7"/></svg>
                </button>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-[12px] text-[#6B7280]">Filas:</span>
                <select class="border border-[#E0E0E0] rounded-lg px-2 py-1 text-[12px] outline-none focus:border-[#003399] bg-white transition-colors cursor-pointer"
                  [value]="pageSize()" (change)="changePageSize($event)" aria-label="Filas por página">
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

    <!-- MODAL -->
    @if (showModal()) {
      <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        role="dialog" aria-modal="true"
        [attr.aria-label]="editingId() ? 'Editar cajera' : 'Nueva cajera'"
        (click)="closeModal()"
      >
        <div class="bg-white rounded-[10px] w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto"
          (click)="$event.stopPropagation()"
        >
          <div class="px-5 py-4 border-b border-[#E0E0E0] flex items-center justify-between sticky top-0 bg-white z-10">
            <span class="font-[Montserrat] font-bold text-[15px]">
              {{ editingId() ? 'Editar cajera' : 'Nueva cajera' }}
            </span>
            <button (click)="closeModal()" class="text-[#6B7280] hover:text-[#1A1A2E] bg-transparent border-0 cursor-pointer" aria-label="Cerrar">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <form [formGroup]="form" (ngSubmit)="submit()" class="p-5 flex flex-col gap-5">
            @if (errorMsg()) {
              <div class="bg-[#E53935]/10 text-[#E53935] text-[13px] px-3 py-2 rounded-lg border border-[#E53935]/20" role="alert">{{ errorMsg() }}</div>
            }

            <section>
              <p class="text-[12px] font-bold text-[#003399] uppercase tracking-wide mb-3">Cuenta de acceso</p>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div class="flex flex-col gap-1">
                  <label class="text-[12px] font-semibold text-[#1A1A2E]" for="v-email">Correo electrónico *</label>
                  <input id="v-email" formControlName="email" type="email" placeholder="correo@ejemplo.com"
                    class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] transition-colors"
                    [class.border-[#E53935]]="isInvalid('email')"
                    autocomplete="off"
                  />
                  @if (isInvalid('email')) {
                    <span class="text-[11px] text-[#E53935]">{{ errMsg('email', 'Correo electrónico') }}</span>
                  }
                </div>
                <div class="flex flex-col gap-1">
                  <label class="text-[12px] font-semibold text-[#1A1A2E]" for="v-sub">Sucursal *</label>
                  <select id="v-sub" formControlName="subsidiary_id"
                    class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] transition-colors bg-white"
                    [class.border-[#E53935]]="isInvalid('subsidiary_id')"
                  >
                    <option value="">— Seleccionar sucursal —</option>
                    @for (s of subsidiaries(); track s.id) {
                      <option [value]="s.id">{{ s.name }}</option>
                    }
                  </select>
                  @if (isInvalid('subsidiary_id')) {
                    <span class="text-[11px] text-[#E53935]">Selecciona una sucursal.</span>
                  }
                </div>
                <div class="flex flex-col gap-1">
                  <label class="text-[12px] font-semibold text-[#1A1A2E]" for="v-pwd">
                    Contraseña {{ editingId() ? '(dejar vacío para no cambiar)' : '*' }}
                  </label>
                  <input id="v-pwd" formControlName="password" type="password" placeholder="Mínimo 8 caracteres"
                    class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] transition-colors"
                    [class.border-[#E53935]]="isInvalid('password')"
                    autocomplete="new-password"
                  />
                  @if (isInvalid('password')) {
                    <span class="text-[11px] text-[#E53935]">{{ errMsg('password', 'Contraseña') }}</span>
                  }
                </div>
                <div class="flex flex-col gap-1">
                  <label class="text-[12px] font-semibold text-[#1A1A2E]" for="v-pwdc">Confirmar contraseña</label>
                  <input id="v-pwdc" formControlName="password_confirmation" type="password" placeholder="Repetir contraseña"
                    class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] transition-colors"
                    [class.border-[#E53935]]="pwdMismatch"
                    autocomplete="new-password"
                  />
                  @if (pwdMismatch) {
                    <span class="text-[11px] text-[#E53935]">Las contraseñas no coinciden.</span>
                  }
                </div>
              </div>
            </section>

            <section formGroupName="person_data">
              <p class="text-[12px] font-bold text-[#003399] uppercase tracking-wide mb-3">Datos personales</p>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div class="flex flex-col gap-1">
                  <label class="text-[12px] font-semibold text-[#1A1A2E]" for="v-name">Nombre(s) *</label>
                  <input id="v-name" formControlName="name" type="text" placeholder="Juan"
                    class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] transition-colors"
                    [class.border-[#E53935]]="isInvalidNested('person_data','name')"
                  />
                  @if (isInvalidNested('person_data','name')) {
                    <span class="text-[11px] text-[#E53935]">{{ errMsgNested('person_data','name','Nombre') }}</span>
                  }
                </div>
                <div class="flex flex-col gap-1">
                  <label class="text-[12px] font-semibold text-[#1A1A2E]" for="v-fn">Primer apellido *</label>
                  <input id="v-fn" formControlName="first_last_name" type="text" placeholder="Pérez"
                    class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] transition-colors"
                    [class.border-[#E53935]]="isInvalidNested('person_data','first_last_name')"
                  />
                  @if (isInvalidNested('person_data','first_last_name')) {
                    <span class="text-[11px] text-[#E53935]">{{ errMsgNested('person_data','first_last_name','Primer apellido') }}</span>
                  }
                </div>
                <div class="flex flex-col gap-1">
                  <label class="text-[12px] font-semibold text-[#1A1A2E]" for="v-sn">Segundo apellido</label>
                  <input id="v-sn" formControlName="second_last_name" type="text" placeholder="Martínez"
                    class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] transition-colors"
                  />
                </div>
                <div class="flex flex-col gap-1">
                  <label class="text-[12px] font-semibold text-[#1A1A2E]" for="v-gender">Sexo</label>
                  <select id="v-gender" formControlName="gender"
                    class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] transition-colors bg-white"
                  >
                    <option value="">— —</option>
                    <option value="F">Femenino</option>
                    <option value="M">Masculino</option>
                    <option value="O">Otro</option>
                  </select>
                </div>
                <div class="flex flex-col gap-1">
                  <label class="text-[12px] font-semibold text-[#1A1A2E]" for="v-bd">Fecha de nacimiento</label>
                  <input id="v-bd" formControlName="birth_date" type="date"
                    class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] transition-colors"
                    [max]="today"
                  />
                </div>
                <div class="flex flex-col gap-1">
                  <label class="text-[12px] font-semibold text-[#1A1A2E]" for="v-curp">CURP</label>
                  <input id="v-curp" formControlName="curp" type="text" maxlength="18" placeholder="18 caracteres"
                    class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] uppercase outline-none focus:border-[#003399] transition-colors"
                    [class.border-[#E53935]]="isInvalidNested('person_data','curp')"
                  />
                  @if (isInvalidNested('person_data','curp')) {
                    <span class="text-[11px] text-[#E53935]">{{ errMsgNested('person_data','curp','CURP') }}</span>
                  }
                </div>
                <div class="flex flex-col gap-1">
                  <label class="text-[12px] font-semibold text-[#1A1A2E]" for="v-rfc">RFC</label>
                  <input id="v-rfc" formControlName="rfc" type="text" maxlength="13" placeholder="12 o 13 caracteres"
                    class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] uppercase outline-none focus:border-[#003399] transition-colors"
                    [class.border-[#E53935]]="isInvalidNested('person_data','rfc')"
                  />
                  @if (isInvalidNested('person_data','rfc')) {
                    <span class="text-[11px] text-[#E53935]">{{ errMsgNested('person_data','rfc','RFC') }}</span>
                  }
                </div>
                <div class="flex flex-col gap-1">
                  <label class="text-[12px] font-semibold text-[#1A1A2E]" for="v-tel">Tel. personal</label>
                  <input id="v-tel" formControlName="personal_phone_number" type="tel" placeholder="10 dígitos"
                    class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] transition-colors"
                    [class.border-[#E53935]]="isInvalidNested('person_data','personal_phone_number')"
                  />
                  @if (isInvalidNested('person_data','personal_phone_number')) {
                    <span class="text-[11px] text-[#E53935]">{{ errMsgNested('person_data','personal_phone_number','Teléfono') }}</span>
                  }
                </div>
                <div class="flex flex-col gap-1">
                  <label class="text-[12px] font-semibold text-[#1A1A2E]" for="v-cel">Celular</label>
                  <input id="v-cel" formControlName="phone_number" type="tel" placeholder="10 dígitos"
                    class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] transition-colors"
                    [class.border-[#E53935]]="isInvalidNested('person_data','phone_number')"
                  />
                  @if (isInvalidNested('person_data','phone_number')) {
                    <span class="text-[11px] text-[#E53935]">{{ errMsgNested('person_data','phone_number','Celular') }}</span>
                  }
                </div>
              </div>
            </section>

            <div class="flex justify-end gap-2 pt-1">
              <button type="button" (click)="closeModal()"
                class="px-4 py-2 rounded-lg text-[13px] font-semibold bg-white text-[#003399] border border-[#E0E0E0] hover:border-[#003399] transition-colors cursor-pointer"
              >Cancelar</button>
              <button type="submit" [disabled]="saving()"
                class="px-4 py-2 rounded-lg text-[13px] font-semibold bg-[#003399] text-white hover:bg-[#002277] transition-colors border-0 cursor-pointer disabled:opacity-60"
              >
                @if (saving()) { Guardando… } @else { Guardar }
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
})
export class CashiersComponent implements OnInit {
  private empSvc = inject(EmployeeService);
  private subSvc = inject(SubsidiaryService);
  private fb     = inject(FormBuilder);

  protected readonly ROLE = 'cajera';
  readonly today = new Date().toISOString().split('T')[0];

  employees    = signal<Employee[]>([]);
  filtered     = signal<Employee[]>([]);
  subsidiaries = signal<Subsidiary[]>([]);
  loading      = signal(true);
  showModal    = signal(false);
  saving       = signal(false);
  editingId    = signal<number | null>(null);
  errorMsg     = signal('');

  // ── Pagination ──────────────────────────────────────────────
  currentPage = signal(1);
  pageSize    = signal(10);
  readonly pageSizeOptions = [5, 10, 20, 50];

  totalPages = computed(() => Math.max(1, Math.ceil(this.filtered().length / this.pageSize())));

  paginated = computed(() => {
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
  // ────────────────────────────────────────────────────────────

  headers = ['Nombre', 'Correo', 'Sucursal', 'Código', 'Estado', 'Acciones'];

  activeCount   = () => this.employees().filter(e => e.status).length;
  inactiveCount = () => this.employees().filter(e => !e.status).length;
  fullName      = (e: Employee) => [e.person_data?.name, e.person_data?.first_last_name, e.person_data?.second_last_name].filter(Boolean).join(' ');

  form = this.fb.group({
    email:                 ['', [Validators.required, Validators.email]],
    password:              [''],
    password_confirmation: [''],
    subsidiary_id:         ['' as any, Validators.required],
    person_data: this.fb.group({
      name:                  ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100), onlyTextValidator(), noInjectionValidator()]],
      first_last_name:       ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100), onlyTextValidator(), noInjectionValidator()]],
      second_last_name:      [''],
      gender:                [''],
      birth_date:            ['', [minAgeValidator(18)]],
      curp:                  ['', curpValidator()],
      rfc:                   ['', rfcValidator()],
      personal_phone_number: ['', phoneValidator()],
      phone_number:          ['', phoneValidator()],
    }),
  }, { validators: passwordMatchValidator() });

  ngOnInit() {
    this.subSvc.getAll().subscribe(r => this.subsidiaries.set(r.data));
    this.load();
  }

  private load() {
    this.loading.set(true);
    this.empSvc.getAll(this.ROLE).subscribe({
      next: r => { this.employees.set(r.data); this.filtered.set(r.data); this.currentPage.set(1); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  search(e: Event) {
    const q = (e.target as HTMLInputElement).value.toLowerCase();
    this.filtered.set(this.employees().filter(emp =>
      this.fullName(emp).toLowerCase().includes(q) || emp.email.toLowerCase().includes(q)
    ));
    this.currentPage.set(1);
  }


  goToPage(page: number) {
    this.currentPage.set(Math.max(1, Math.min(page, this.totalPages())));
  }

  changePageSize(e: Event) {
    this.pageSize.set(Number((e.target as HTMLSelectElement).value));
    this.currentPage.set(1);
  }

  openCreate() {
    this.editingId.set(null);
    this.form.reset();
    this.form.get('password')?.setValidators([Validators.required, strongPasswordValidator()]);
    this.form.get('password')?.updateValueAndValidity();
    this.errorMsg.set('');
    this.showModal.set(true);
  }

  openEdit(e: Employee) {
    this.editingId.set(e.id);
    this.form.get('password')?.clearValidators();
    this.form.get('password')?.updateValueAndValidity();
    this.form.patchValue({ email: e.email, subsidiary_id: e.subsidiary_id, person_data: e.person_data as any });
    this.errorMsg.set('');
    this.showModal.set(true);
  }

  closeModal() { this.showModal.set(false); }

  isInvalid(f: string) { const c = this.form.get(f); return c?.invalid && c?.touched; }
  isInvalidNested(group: string, f: string) { const c = this.form.get(`${group}.${f}`); return c?.invalid && c?.touched; }
  errMsg(f: string, label = '') { return getErrorMessage(this.form.get(f), label); }
  errMsgNested(group: string, f: string, label = '') { return getErrorMessage(this.form.get(`${group}.${f}`), label); }
  get pwdMismatch() { return this.form.hasError('passwordMismatch') && this.form.get('password_confirmation')?.touched; }

  submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.saving.set(true);
    this.errorMsg.set('');

    const val = this.form.value as EmployeeForm;
    const id  = this.editingId();
    const obs = id ? this.empSvc.update(this.ROLE, id, val) : this.empSvc.create(this.ROLE, val);

    obs.subscribe({
      next:  () => { this.saving.set(false); this.closeModal(); this.load(); },
      error: err => { this.saving.set(false); this.errorMsg.set(err?.error?.message ?? 'Error al guardar.'); },
    });
  }

  deactivate(e: Employee) {
    if (!confirm(`¿Dar de baja a "${this.fullName(e)}"?`)) return;
    this.empSvc.deactivate(this.ROLE, e.id).subscribe({ next: () => this.load() });
  }

  restore(e: Employee) {
    this.empSvc.restore(this.ROLE, e.id).subscribe({ next: () => this.load() });
  }
}
