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
import { EmployeeService } from '../../../core/services/employee.service';
import { SubsidiaryService } from '../../../core/services/subsidiary.service';
import { strongPasswordValidator } from '../../../core/validators/form-validators';

@Component({
  selector: 'app-managers',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <div>
      <!-- Header -->
      <div class="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 class="font-[Montserrat] text-[22px] font-extrabold text-[#1A1A2E]">Gerentes</h1>
          <p class="text-[13px] text-[#6B7280] mt-0.5">Registro y gestión de gerentes del sistema</p>
        </div>
        <button
          (click)="openCreate()"
          class="inline-flex items-center gap-1.5 px-[18px] py-[9px] rounded-lg text-[13px] font-semibold bg-[#003399] text-white hover:bg-[#002277] transition-colors border-0 cursor-pointer flex-shrink-0"
        >
          <svg class="w-[15px] h-[15px]" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
          </svg>
          Nuevo gerente
        </button>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div class="bg-white rounded-[10px] p-5 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] flex gap-4">
          <div class="w-11 h-11 rounded-[10px] bg-[#003399]/10 text-[#003399] flex items-center justify-center flex-shrink-0">
            <svg class="w-[22px] h-[22px]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
          </div>
          <div>
            <div class="font-[Montserrat] text-[22px] font-extrabold">{{ employees().length }}</div>
            <div class="text-[12px] text-[#6B7280] mt-0.5">Total</div>
          </div>
        </div>
        <div class="bg-white rounded-[10px] p-5 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] flex gap-4">
          <div class="w-11 h-11 rounded-[10px] bg-[#00A86B]/10 text-[#00A86B] flex items-center justify-center flex-shrink-0">
            <svg class="w-[22px] h-[22px]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div>
            <div class="font-[Montserrat] text-[22px] font-extrabold">{{ activeCount() }}</div>
            <div class="text-[12px] text-[#6B7280] mt-0.5">Activos</div>
          </div>
        </div>
        <div class="bg-white rounded-[10px] p-5 border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] flex gap-4">
          <div class="w-11 h-11 rounded-[10px] bg-[#E53935]/10 text-[#E53935] flex items-center justify-center flex-shrink-0">
            <svg class="w-[22px] h-[22px]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
            </svg>
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
          <span class="font-[Montserrat] font-bold text-[14px] text-[#1A1A2E]">Lista de gerentes</span>
          <input type="search" placeholder="Buscar…" (input)="search($event)"
            class="border border-[#E0E0E0] rounded-lg px-3 py-1.5 text-[13px] outline-none focus:border-[#003399] w-52 transition-colors"
            aria-label="Buscar gerente"
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
                          <svg class="w-[15px] h-[15px]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                          </svg>
                        </button>
                        @if (e.status) {
                          <button (click)="deactivate(e)"
                            class="p-1.5 rounded-lg text-[#E53935] hover:bg-[#E53935]/10 transition-colors border-0 cursor-pointer bg-transparent"
                            aria-label="Dar de baja" title="Dar de baja"
                          >
                            <svg class="w-[15px] h-[15px]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
                            </svg>
                          </button>
                        } @else {
                          <button (click)="restore(e)"
                            class="p-1.5 rounded-lg text-[#00A86B] hover:bg-[#00A86B]/10 transition-colors border-0 cursor-pointer bg-transparent"
                            aria-label="Activar" title="Activar"
                          >
                            <svg class="w-[15px] h-[15px]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                          </button>
                        }
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="6" class="px-5 py-12 text-center text-[#6B7280] text-[13px]">No se encontraron gerentes.</td>
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
        [attr.aria-label]="editingId() ? 'Editar gerente' : 'Nuevo gerente'"
        (click)="closeModal()"
      >
        <div class="bg-white rounded-[10px] w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto"
          (click)="$event.stopPropagation()"
        >
          <div class="px-5 py-4 border-b border-[#E0E0E0] flex items-center justify-between sticky top-0 bg-white z-10">
            <span class="font-[Montserrat] font-bold text-[15px]">
              {{ editingId() ? 'Editar gerente' : 'Nuevo gerente' }}
            </span>
            <button (click)="closeModal()" class="text-[#6B7280] hover:text-[#1A1A2E] bg-transparent border-0 cursor-pointer" aria-label="Cerrar">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <form [formGroup]="form" (ngSubmit)="submit()" class="p-5 flex flex-col gap-5">
            @if (errorMsg()) {
              <div class="bg-[#E53935]/10 text-[#E53935] text-[13px] px-3 py-2 rounded-lg border border-[#E53935]/20" role="alert">{{ errorMsg() }}</div>
            }

            <!-- Cuenta -->
            <section>
              <p class="text-[12px] font-bold text-[#003399] uppercase tracking-wide mb-3">Cuenta de acceso</p>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div class="flex flex-col gap-1">
                  <label class="text-[12px] font-semibold text-[#1A1A2E]" for="g-email">Correo electrónico *</label>
                  <input id="g-email" formControlName="email" type="email" placeholder="correo@ejemplo.com"
                    class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] transition-colors"
                    [class.border-red-500]="isInvalid('email')"
                  />
                  @if (isInvalid('email')) { <span class="text-[11px] text-[#E53935]">Correo inválido u obligatorio.</span> }
                </div>
                <div class="flex flex-col gap-1">
                  <label class="text-[12px] font-semibold text-[#1A1A2E]" for="g-sub">Sucursal *</label>
                  <select id="g-sub" formControlName="subsidiary_id"
                    class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] transition-colors bg-white"
                    [class.border-red-500]="isInvalid('subsidiary_id')"
                  >
                    <option value="">— Seleccionar —</option>
                    @for (s of subsidiaries(); track s.id) {
                      <option [value]="s.id">{{ s.name }}</option>
                    }
                  </select>
                  @if (isInvalid('subsidiary_id')) { <span class="text-[11px] text-[#E53935]">Obligatorio.</span> }
                </div>
                <div class="flex flex-col gap-1">
                  <label class="text-[12px] font-semibold text-[#1A1A2E]" for="g-pwd">
                    Contraseña {{ editingId() ? '(dejar vacío para no cambiar)' : '*' }}
                  </label>
                  <input id="g-pwd" formControlName="password" type="password" placeholder="Mínimo 8 caracteres"
                    class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] transition-colors"
                    [class.border-red-500]="isInvalid('password')"
                  />
                  @if (isInvalid('password')) { <span class="text-[11px] text-[#E53935]">Mínimo 8 caracteres.</span> }
                </div>
                <div class="flex flex-col gap-1">
                  <label class="text-[12px] font-semibold text-[#1A1A2E]" for="g-pwdc">Confirmar contraseña</label>
                  <input id="g-pwdc" formControlName="password_confirmation" type="password" placeholder="Repetir contraseña"
                    class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] transition-colors"
                  />
                </div>
              </div>
            </section>

            <!-- Datos personales -->
            <section formGroupName="person_data">
              <p class="text-[12px] font-bold text-[#003399] uppercase tracking-wide mb-3">Datos personales</p>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div class="flex flex-col gap-1">
                  <label class="text-[12px] font-semibold text-[#1A1A2E]" for="g-name">Nombre(s) *</label>
                  <input id="g-name" formControlName="name" type="text" placeholder="Juan" maxlength="60"
                    class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] transition-colors"
                    [class.border-red-500]="isPDInvalid('name')"
                  />
                  @if (isPDInvalid('name') && form.get('person_data.name')?.errors?.['required']) {
                    <span class="text-[11px] text-[#E53935]">Obligatorio.</span>
                  }
                  @if (isPDInvalid('name') && form.get('person_data.name')?.errors?.['pattern']) {
                    <span class="text-[11px] text-[#E53935]">Solo letras, sin números.</span>
                  }
                </div>
                <div class="flex flex-col gap-1">
                  <label class="text-[12px] font-semibold text-[#1A1A2E]" for="g-fn">Primer apellido *</label>
                  <input id="g-fn" formControlName="first_last_name" type="text" placeholder="García" maxlength="60"
                    class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] transition-colors"
                    [class.border-red-500]="isPDInvalid('first_last_name')"
                  />
                  @if (isPDInvalid('first_last_name') && form.get('person_data.first_last_name')?.errors?.['required']) {
                    <span class="text-[11px] text-[#E53935]">Obligatorio.</span>
                  }
                  @if (isPDInvalid('first_last_name') && form.get('person_data.first_last_name')?.errors?.['pattern']) {
                    <span class="text-[11px] text-[#E53935]">Solo letras, sin números.</span>
                  }
                </div>
                <div class="flex flex-col gap-1">
                  <label class="text-[12px] font-semibold text-[#1A1A2E]" for="g-sn">Segundo apellido</label>
                  <input id="g-sn" formControlName="second_last_name" type="text" placeholder="López" maxlength="60"
                    class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] transition-colors"
                  />
                  @if (form.get('person_data.second_last_name')?.touched && form.get('person_data.second_last_name')?.errors?.['pattern']) {
                    <span class="text-[11px] text-[#E53935]">Solo letras, sin números.</span>
                  }
                </div>
                <div class="flex flex-col gap-1">
                  <label class="text-[12px] font-semibold text-[#1A1A2E]" for="g-gender">Sexo</label>
                  <select id="g-gender" formControlName="gender"
                    class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] transition-colors bg-white"
                  >
                    <option value="">— —</option>
                    <option value="F">Femenino</option>
                    <option value="M">Masculino</option>
                    <option value="O">Otro</option>
                  </select>
                </div>
                <div class="flex flex-col gap-1">
                  <label class="text-[12px] font-semibold text-[#1A1A2E]" for="g-bd">Fecha de nacimiento</label>
                  <input id="g-bd" formControlName="birth_date" type="date"
                    class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] transition-colors"
                    [class.border-red-500]="isPDInvalid('birth_date')"
                  />
                  @if (isPDInvalid('birth_date') && form.get('person_data.birth_date')?.errors?.['menorDeEdad']) {
                    <span class="text-[11px] text-[#E53935]">Debe ser mayor de 18 años.</span>
                  }
                </div>
                <div class="flex flex-col gap-1">
                  <label class="text-[12px] font-semibold text-[#1A1A2E]" for="g-curp">CURP</label>
                  <input id="g-curp" formControlName="curp" type="text" placeholder="18 caracteres" maxlength="18"
                    class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] uppercase outline-none focus:border-[#003399] transition-colors"
                  />
                </div>
                <div class="flex flex-col gap-1">
                  <label class="text-[12px] font-semibold text-[#1A1A2E]" for="g-rfc">RFC</label>
                  <input id="g-rfc" formControlName="rfc" type="text" placeholder="RFC" maxlength="13"
                    class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] uppercase outline-none focus:border-[#003399] transition-colors"
                  />
                </div>
                <div class="flex flex-col gap-1">
                  <label class="text-[12px] font-semibold text-[#1A1A2E]" for="g-tel">Tel. personal</label>
                  <input id="g-tel" formControlName="personal_phone_number" type="tel" placeholder="614 000 0000" maxlength="10"
                    class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] transition-colors"
                    [class.border-red-500]="isPDInvalid('personal_phone_number')"
                  />
                  @if (isPDInvalid('personal_phone_number')) {
                    <span class="text-[11px] text-[#E53935]">10 dígitos numéricos.</span>
                  }
                </div>
                <div class="flex flex-col gap-1">
                  <label class="text-[12px] font-semibold text-[#1A1A2E]" for="g-cel">Celular</label>
                  <input id="g-cel" formControlName="phone_number" type="tel" placeholder="614 000 0001" maxlength="10"
                    class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] transition-colors"
                    [class.border-red-500]="isPDInvalid('phone_number')"
                  />
                  @if (isPDInvalid('phone_number')) {
                    <span class="text-[11px] text-[#E53935]">10 dígitos numéricos.</span>
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
export class ManagersComponent implements OnInit {
  private empSvc = inject(EmployeeService);
  private subSvc = inject(SubsidiaryService);
  private fb     = inject(FormBuilder);

  protected readonly ROLE = 'gerente';

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
  fullName      = (e: Employee) =>
    [e.person_data?.name, e.person_data?.first_last_name, e.person_data?.second_last_name]
      .filter(Boolean).join(' ');

  private readonly NAME_PATTERN = /^[a-zA-ZÁÉÍÓÚáéíóúÑñÜü\s]+$/;
  private readonly PHONE_PATTERN = /^\d{10}$/;

  private mayorDeEdadValidator() {
    return (control: any) => {
      if (!control.value) return null;
      const hoy    = new Date();
      const nacim  = new Date(control.value);
      const edad18 = new Date(nacim.getFullYear() + 18, nacim.getMonth(), nacim.getDate());
      return hoy >= edad18 ? null : { menorDeEdad: true };
    };
  }

  form = this.fb.group({
    email:                 ['', [Validators.required, Validators.email]],
    password:              [''],
    password_confirmation: [''],
    subsidiary_id:         ['' as any, Validators.required],
    person_data: this.fb.group({
      name:                  ['', [Validators.required, Validators.maxLength(60), Validators.pattern(this.NAME_PATTERN)]],
      first_last_name:       ['', [Validators.required, Validators.maxLength(60), Validators.pattern(this.NAME_PATTERN)]],
      second_last_name:      ['', [Validators.maxLength(60), Validators.pattern(/^[a-zA-ZÁÉÍÓÚáéíóúÑñÜü\s]*$/)]],
      gender:                [''],
      birth_date:            ['', [this.mayorDeEdadValidator()]],
      curp:                  [''],
      rfc:                   [''],
      personal_phone_number: ['', [Validators.pattern(this.PHONE_PATTERN)]],
      phone_number:          ['', [Validators.pattern(this.PHONE_PATTERN)]],
    }),
  });

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
    this.form.patchValue({
      email:         e.email,
      subsidiary_id: e.subsidiary_id,
      person_data:   e.person_data as any,
    });
    this.errorMsg.set('');
    this.showModal.set(true);
  }

  closeModal() { this.showModal.set(false); }

  isInvalid(f: string)   { const c = this.form.get(f);                  return c?.invalid && c?.touched; }
  isPDInvalid(f: string) { const c = this.form.get('person_data.' + f); return c?.invalid && c?.touched; }

  submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.saving.set(true);
    this.errorMsg.set('');

    const val = this.form.value as EmployeeForm;
    const id  = this.editingId();
    const obs = id
      ? this.empSvc.update(this.ROLE, id, val)
      : this.empSvc.create(this.ROLE, val);

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
