import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  AfterViewInit,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { curpValidator, rfcValidator, phoneValidator, postalCodeValidator, onlyTextValidator, noInjectionValidator, minAgeValidator, getErrorMessage } from '../../../core/validators/form-validators';
import { Router, RouterLink } from '@angular/router';
import { PreApplicationService } from '../../../core/services/pre-application.service';
import { Subject, debounceTime, distinctUntilChanged, switchMap, of, from } from 'rxjs';

declare const L: any;

@Component({
  selector: 'app-new-pre-application',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="flex items-center gap-3 mb-6">
        <a routerLink="/coordinador/pre-solicitudes"
          class="text-[#6B7280] hover:text-[#003399] transition-colors no-underline"
          aria-label="Regresar"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
          </svg>
        </a>
        <div>
          <h1 class="font-[Montserrat] text-[22px] font-extrabold text-[#1A1A2E]">Nueva Pre-Solicitud</h1>
          <p class="text-[13px] text-[#6B7280]">Paso {{ step() }} de 4</p>
        </div>
      </div>

      <!-- Steps indicator -->
      <div class="flex items-center mb-8">
        @for (s of steps; track s.n) {
          <div class="flex items-center" [class.flex-1]="s.n < 4">
            <div class="flex items-center gap-2">
              <div
                [class]="step() >= s.n ? 'bg-[#003399] text-white' : 'bg-[#E0E0E0] text-[#6B7280]'"
                class="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold flex-shrink-0 transition-colors"
              >{{ s.n }}</div>
              <span class="text-[12px] font-medium hidden md:block whitespace-nowrap"
                [class]="step() >= s.n ? 'text-[#003399]' : 'text-[#6B7280]'"
              >{{ s.label }}</span>
            </div>
            @if (s.n < 4) {
              <div class="flex-1 h-px bg-[#E0E0E0] mx-3"></div>
            }
          </div>
        }
      </div>

      @if (errorMsg()) {
        <div class="bg-[#E53935]/10 text-[#E53935] text-[13px] px-4 py-3 rounded-lg border border-[#E53935]/20 mb-4" role="alert">
          {{ errorMsg() }}
        </div>
      }

      <!-- STEP 1: Datos personales + domicilio -->
      @if (step() === 1) {
        <form [formGroup]="step1" class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] p-6 flex flex-col gap-5">
          <div>
            <p class="text-[12px] font-bold text-[#003399] uppercase tracking-wide mb-4">Datos personales</p>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="flex flex-col gap-1">
                <label class="text-[12px] font-semibold text-[#1A1A2E]" for="nombre">Nombre(s) *</label>
                <input id="nombre" formControlName="nombre" type="text" placeholder="María"
                  class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] transition-colors"
                  [class.border-[#E53935]]="inv(step1, 'nombre')"
                />
                @if (inv(step1, 'nombre')) { <span class="text-[11px] text-[#E53935]">{{ err(step1, 'nombre', 'Nombre') }}</span> }
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-[12px] font-semibold text-[#1A1A2E]" for="pa">Primer apellido *</label>
                <input id="pa" formControlName="primer_apellido" type="text" placeholder="García"
                  class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] transition-colors"
                  [class.border-[#E53935]]="inv(step1, 'primer_apellido')"
                />
                @if (inv(step1, 'primer_apellido')) { <span class="text-[11px] text-[#E53935]">{{ err(step1, 'primer_apellido', 'Primer apellido') }}</span> }
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-[12px] font-semibold text-[#1A1A2E]" for="sa">Segundo apellido</label>
                <input id="sa" formControlName="segundo_apellido" type="text" placeholder="López"
                  class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] transition-colors"
                />
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-[12px] font-semibold text-[#1A1A2E]" for="sexo">Sexo *</label>
                <select id="sexo" formControlName="sexo"
                  class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] transition-colors bg-white"
                  [class.border-[#E53935]]="inv(step1, 'sexo')"
                >
                  <option value="">-- --</option>
                  <option value="Femenino">Femenino</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Otro">Otro</option>
                </select>
                @if (inv(step1, 'sexo')) { <span class="text-[11px] text-[#E53935]">Selecciona el sexo.</span> }
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-[12px] font-semibold text-[#1A1A2E]" for="fn">Fecha de nacimiento *</label>
                <input id="fn" formControlName="fecha_nacimiento" type="date" [max]="today"
                  class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] transition-colors"
                  [class.border-[#E53935]]="inv(step1, 'fecha_nacimiento')"
                />
                @if (inv(step1, 'fecha_nacimiento')) { <span class="text-[11px] text-[#E53935]">La fecha de nacimiento es obligatoria.</span> }
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-[12px] font-semibold text-[#1A1A2E]" for="curp">CURP</label>
                <input id="curp" formControlName="curp" type="text" maxlength="18" placeholder="18 caracteres"
                  class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] uppercase outline-none focus:border-[#003399] transition-colors"
                  [class.border-[#E53935]]="inv(step1, 'curp')"
                />
                @if (inv(step1, 'curp')) { <span class="text-[11px] text-[#E53935]">{{ err(step1, 'curp', 'CURP') }}</span> }
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-[12px] font-semibold text-[#1A1A2E]" for="rfc">RFC</label>
                <input id="rfc" formControlName="rfc" type="text" maxlength="13" placeholder="12 o 13 caracteres"
                  class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] uppercase outline-none focus:border-[#003399] transition-colors"
                  [class.border-[#E53935]]="inv(step1, 'rfc')"
                />
                @if (inv(step1, 'rfc')) { <span class="text-[11px] text-[#E53935]">{{ err(step1, 'rfc', 'RFC') }}</span> }
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-[12px] font-semibold text-[#1A1A2E]" for="tel">Teléfono *</label>
                <input id="tel" formControlName="telefono" type="tel" placeholder="10 dígitos"
                  class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] transition-colors"
                  [class.border-[#E53935]]="inv(step1, 'telefono')"
                />
                @if (inv(step1, 'telefono')) { <span class="text-[11px] text-[#E53935]">{{ err(step1, 'telefono', 'Teléfono') }}</span> }
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-[12px] font-semibold text-[#1A1A2E]" for="telp">Tel. personal</label>
                <input id="telp" formControlName="telefono_personal" type="tel" placeholder="10 dígitos"
                  class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] transition-colors"
                  [class.border-[#E53935]]="inv(step1, 'telefono_personal')"
                />
                @if (inv(step1, 'telefono_personal')) { <span class="text-[11px] text-[#E53935]">{{ err(step1, 'telefono_personal', 'Teléfono personal') }}</span> }
              </div>
            </div>
          </div>

          <div>
            <p class="text-[12px] font-bold text-[#003399] uppercase tracking-wide mb-4">Domicilio</p>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="flex flex-col gap-1 md:col-span-2">
                <label class="text-[12px] font-semibold text-[#1A1A2E]" for="calle">Calle *</label>
                <input id="calle" formControlName="calle" type="text" placeholder="Av. Constitución"
                  class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] transition-colors"
                  [class.border-[#E53935]]="inv(step1, 'calle')"
                />
                @if (inv(step1, 'calle')) { <span class="text-[11px] text-[#E53935]">{{ err(step1, 'calle', 'Calle') }}</span> }
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-[12px] font-semibold text-[#1A1A2E]" for="ne">Núm. exterior *</label>
                <input id="ne" formControlName="numero_exterior" type="text" placeholder="100"
                  class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] transition-colors"
                  [class.border-[#E53935]]="inv(step1, 'numero_exterior')"
                />
                @if (inv(step1, 'numero_exterior')) { <span class="text-[11px] text-[#E53935]">El número exterior es obligatorio.</span> }
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-[12px] font-semibold text-[#1A1A2E]" for="col">Colonia *</label>
                <input id="col" formControlName="colonia" type="text" placeholder="Centro"
                  class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] transition-colors"
                  [class.border-[#E53935]]="inv(step1, 'colonia')"
                />
                @if (inv(step1, 'colonia')) { <span class="text-[11px] text-[#E53935]">La colonia es obligatoria.</span> }
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-[12px] font-semibold text-[#1A1A2E]" for="cp">C.P. *</label>
                <input id="cp" formControlName="codigo_postal" type="text" maxlength="5" placeholder="5 dígitos"
                  class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] transition-colors"
                  [class.border-[#E53935]]="inv(step1, 'codigo_postal')"
                />
                @if (inv(step1, 'codigo_postal')) { <span class="text-[11px] text-[#E53935]">{{ err(step1, 'codigo_postal', 'Código postal') }}</span> }
              </div>
            </div>
          </div>

          <!-- MAPA LEAFLET -->
          <div>
            <p class="text-[12px] font-bold text-[#003399] uppercase tracking-wide mb-1">Ubicacion en el mapa <span class="text-[#6B7280] font-normal normal-case">(opcional)</span></p>
            <p class="text-[12px] text-[#6B7280] mb-3">La ubicación se detecta automáticamente al ingresar la dirección. Si no se encuentra, haz clic en el mapa o usa tu ubicación actual.</p>

            <!-- Estado: buscando -->
            @if (geocoding()) {
              <div class="flex items-center gap-2 text-[12px] text-[#003399] mb-3" role="status" aria-live="polite">
                <svg class="w-4 h-4 animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                Buscando ubicación en el mapa...
              </div>
            }

            <!-- Estado: dirección no encontrada -->
            @if (geocodeError() && !geocoding()) {
              <div class="flex items-start gap-2 text-[12px] text-[#B45309] bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3" role="alert">
                <svg class="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                </svg>
                {{ geocodeError() }}
              </div>
            }

            <!-- Boton geolocalizar -->
            <button type="button" (click)="geolocate()"
              class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-[#003399] border border-[#003399]/20 hover:bg-[#003399]/10 transition-colors bg-transparent cursor-pointer mb-3"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              Usar mi ubicacion actual
            </button>

            <!-- Contenedor del mapa -->
            <div id="pre-app-map" class="w-full rounded-[10px] border border-[#E0E0E0] overflow-hidden" style="height: 320px;"></div>

            <!-- Coordenadas seleccionadas -->
            @if (step1.value.latitud && step1.value.longitud) {
              <div class="mt-2 flex items-center gap-2 text-[12px] text-[#00A86B]">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
                Ubicacion marcada: {{ fmt(step1.value.latitud) }}, {{ fmt(step1.value.longitud) }}
                <button type="button" (click)="clearCoords()"
                  class="text-[#6B7280] hover:text-[#E53935] transition-colors bg-transparent border-0 cursor-pointer text-[11px] underline"
                >Quitar</button>
              </div>
            }
          </div>
        </form>
      }

      <!-- STEP 2: Documentos + Afiliales -->
      @if (step() === 2) {
        <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] p-6 flex flex-col gap-6">
          <div>
            <p class="text-[12px] font-bold text-[#003399] uppercase tracking-wide mb-4">Documentos obligatorios</p>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="flex flex-col gap-1">
                <label class="text-[12px] font-semibold text-[#1A1A2E]" for="ine">
                  INE * <span class="text-[#6B7280] font-normal">(jpg, png, pdf)</span>
                </label>
                <input id="ine" type="file" accept=".jpg,.jpeg,.png,.pdf"
                  (change)="onFile($event, 'ine')"
                  class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] transition-colors"
                  [class.border-[#E53935]]="fileError('ine')"
                />
                @if (fileError('ine')) { <span class="text-[11px] text-[#E53935]">Archivo obligatorio.</span> }
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-[12px] font-semibold text-[#1A1A2E]" for="comp">
                  Comprobante de domicilio * <span class="text-[#6B7280] font-normal">(jpg, png, pdf)</span>
                </label>
                <input id="comp" type="file" accept=".jpg,.jpeg,.png,.pdf"
                  (change)="onFile($event, 'comprobante_domicilio')"
                  class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] transition-colors"
                  [class.border-[#E53935]]="fileError('comprobante_domicilio')"
                />
                @if (fileError('comprobante_domicilio')) { <span class="text-[11px] text-[#E53935]">Archivo obligatorio.</span> }
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-[12px] font-semibold text-[#1A1A2E]" for="buro">
                  Buró de crédito * <span class="text-[#6B7280] font-normal">(jpg, png, pdf)</span>
                </label>
                <input id="buro" type="file" accept=".jpg,.jpeg,.png,.pdf"
                  (change)="onFile($event, 'buro_credito')"
                  class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] transition-colors"
                  [class.border-[#E53935]]="fileError('buro_credito')"
                />
                @if (fileError('buro_credito')) { <span class="text-[11px] text-[#E53935]">Archivo obligatorio.</span> }
              </div>
            </div>
          </div>

          <div>
            <p class="text-[12px] font-bold text-[#003399] uppercase tracking-wide mb-4">
              Fotos de vivienda <span class="text-[#6B7280] font-normal normal-case">(opcional, max. 5)</span>
            </p>
            <input type="file" accept=".jpg,.jpeg,.png" multiple
              (change)="onMultipleFiles($event)"
              class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] transition-colors w-full"
            />
            @if (houseFiles().length > 0) {
              <div class="mt-3 flex flex-wrap gap-2">
                @for (f of houseFiles(); track f.name) {
                  <span class="text-[12px] bg-[#F8FAFD] border border-[#E0E0E0] px-2 py-1 rounded-lg text-[#6B7280]">
                    {{ f.name }}
                  </span>
                }
              </div>
            }
          </div>

          <!-- Afiliales -->
          <div>
            <div class="flex items-center justify-between mb-4">
              <p class="text-[12px] font-bold text-[#003399] uppercase tracking-wide">Otras afiliales donde labora</p>
              <button type="button" (click)="addAffiliate()"
                class="text-[12px] font-semibold text-[#003399] hover:underline bg-transparent border-0 cursor-pointer"
              >+ Agregar afiliada</button>
            </div>
            @for (aff of affiliates.controls; track $index) {
  <div [formGroup]="getGroup(aff)" class="flex flex-col gap-3 mb-3 p-4 bg-[#F8FAFD] rounded-lg border border-[#E0E0E0]">

    <!-- Toggle existente / nueva -->
    <div class="flex gap-3">
      <button type="button"
        (click)="getGroup(aff).patchValue({ es_nueva: false, nombre: '', id: null })"
        [class]="!getGroup(aff).value.es_nueva ? 'bg-[#003399] text-white' : 'bg-white text-[#6B7280] border border-[#E0E0E0]'"
        class="px-3 py-1 rounded-lg text-[12px] font-semibold transition-colors cursor-pointer border-0"
      >Seleccionar existente</button>

      <button type="button"
        (click)="getGroup(aff).patchValue({ es_nueva: true, nombre: '', id: null })"
        [class]="getGroup(aff).value.es_nueva ? 'bg-[#003399] text-white' : 'bg-white text-[#6B7280] border border-[#E0E0E0]'"
        class="px-3 py-1 rounded-lg text-[12px] font-semibold transition-colors cursor-pointer border-0"
      >Registrar nueva</button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-3">

      @if (!getGroup(aff).value.es_nueva) {
        <div class="flex flex-col gap-1 md:col-span-2">
          <label class="text-[12px] font-semibold text-[#1A1A2E]">Financiera *</label>
          <select formControlName="nombre"
            class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] bg-white transition-colors"
          >
            <option value="">-- Selecciona --</option>
            @for (af of afiliadesExistentes(); track af.id) {
              <option [value]="af.name">{{ af.name }}</option>
            }
          </select>
        </div>
      }

      @if (getGroup(aff).value.es_nueva) {
        <div class="flex flex-col gap-1 md:col-span-2">
          <label class="text-[12px] font-semibold text-[#1A1A2E]">Nombre de la financiera *</label>
          <input formControlName="nombre" type="text" placeholder="Ej. Mi Financiera SA"
            class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] bg-white transition-colors"
          />
        </div>
      }

      <div class="flex flex-col gap-1">
        <label class="text-[12px] font-semibold text-[#1A1A2E]">Limite de credito ($) *</label>
        <input formControlName="limite_credito" type="number" min="0" placeholder="0.00"
          class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] bg-white transition-colors"
        />
      </div>
    </div>

    <div class="flex justify-end">
      <button type="button" (click)="removeAffiliate($index)"
        class="text-[#E53935] hover:bg-[#E53935]/10 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors bg-transparent border-0 cursor-pointer"
      >Quitar</button>
    </div>
  </div>
}
            @if (affiliates.length === 0) {
              <p class="text-[13px] text-[#6B7280] text-center py-3">Sin afiliales registradas</p>
            }
          </div>
        </div>
      }

      <!-- STEP 3: Familia + Vehiculos -->
      @if (step() === 3) {
        <div class="flex flex-col gap-6">
          <!-- Familia -->
          <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] p-6">
            <div class="flex items-center justify-between mb-4">
              <div>
                <p class="text-[12px] font-bold text-[#003399] uppercase tracking-wide">Datos familiares</p>
                <p class="text-[12px] text-[#6B7280] mt-0.5">Pareja sentimental, hijos y padres</p>
              </div>
              <button type="button" (click)="addFamily()"
                class="text-[12px] font-semibold text-[#003399] hover:underline bg-transparent border-0 cursor-pointer"
              >+ Agregar familiar</button>
            </div>
            @for (m of family.controls; track $index) {
              <div [formGroup]="getGroup(m)" class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 p-3 bg-[#F8FAFD] rounded-lg border border-[#E0E0E0]">
                <div class="flex flex-col gap-1">
                  <label class="text-[12px] font-semibold text-[#1A1A2E]">Parentesco *</label>
                  <select formControlName="parentesco"
                    class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] bg-white transition-colors"
                  >
                    <option value="">-- --</option>
                    <option value="Pareja sentimental">Pareja sentimental</option>
                    <option value="Hijo/a">Hijo/a</option>
                    <option value="Padre">Padre</option>
                    <option value="Madre">Madre</option>
                    <option value="Hermano/a">Hermano/a</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <div class="flex flex-col gap-1">
                  <label class="text-[12px] font-semibold text-[#1A1A2E]">Nombre(s) *</label>
                  <input formControlName="nombre" type="text"
                    class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] bg-white transition-colors"
                  />
                </div>
                <div class="flex flex-col gap-1">
                  <label class="text-[12px] font-semibold text-[#1A1A2E]">Primer apellido *</label>
                  <input formControlName="primer_apellido" type="text"
                    class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] bg-white transition-colors"
                  />
                </div>
                <div class="flex items-end gap-2">
                  <div class="flex flex-col gap-1 flex-1">
                    <label class="text-[12px] font-semibold text-[#1A1A2E]">Segundo apellido</label>
                    <input formControlName="segundo_apellido" type="text"
                      class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] bg-white transition-colors"
                    />
                  </div>
                  <button type="button" (click)="removeFamily($index)"
                    class="text-[#E53935] hover:bg-[#E53935]/10 p-2 rounded-lg transition-colors bg-transparent border-0 cursor-pointer mb-0.5"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              </div>
            }
            @if (family.length === 0) {
              <p class="text-[13px] text-[#6B7280] text-center py-4">Sin familiares registrados</p>
            }
          </div>

          <!-- Vehiculos -->
          <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] p-6">
            <div class="flex items-center justify-between mb-4">
              <p class="text-[12px] font-bold text-[#003399] uppercase tracking-wide">Vehiculos</p>
              <button type="button" (click)="addCar()"
                class="text-[12px] font-semibold text-[#003399] hover:underline bg-transparent border-0 cursor-pointer"
              >+ Agregar vehiculo</button>
            </div>
            @for (c of cars.controls; track $index) {
              <div [formGroup]="getGroup(c)" class="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3 p-3 bg-[#F8FAFD] rounded-lg border border-[#E0E0E0]">
                <div class="flex flex-col gap-1">
                  <label class="text-[12px] font-semibold text-[#1A1A2E]">Marca</label>
                  <input formControlName="marca" type="text" placeholder="Toyota"
                    class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] bg-white transition-colors"
                  />
                </div>
                <div class="flex flex-col gap-1">
                  <label class="text-[12px] font-semibold text-[#1A1A2E]">Modelo</label>
                  <input formControlName="modelo" type="text" placeholder="Corolla 2020"
                    class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] bg-white transition-colors"
                  />
                </div>
                <div class="flex flex-col gap-1">
                  <label class="text-[12px] font-semibold text-[#1A1A2E]">Placas</label>
                  <input formControlName="placas" type="text"
                    class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] bg-white transition-colors"
                  />
                </div>
                <div class="flex flex-col gap-1">
                  <label class="text-[12px] font-semibold text-[#1A1A2E]">Tipo</label>
                  <select formControlName="tipo"
                    class="border border-[#E0E0E0] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003399] bg-white transition-colors"
                  >
                    <option value="">-- --</option>
                    <option value="Sedan">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="Pickup">Pickup</option>
                    <option value="Moto">Moto</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <div class="flex items-end">
                  <button type="button" (click)="removeCar($index)"
                    class="text-[#E53935] hover:bg-[#E53935]/10 p-2 rounded-lg transition-colors bg-transparent border-0 cursor-pointer"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              </div>
            }
            @if (cars.length === 0) {
              <p class="text-[13px] text-[#6B7280] text-center py-4">Sin vehiculos registrados</p>
            }
          </div>
        </div>
      }

      <!-- STEP 4: Resumen -->
      @if (step() === 4) {
        <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)] p-6">
          <p class="text-[12px] font-bold text-[#003399] uppercase tracking-wide mb-6">Resumen de la pre-solicitud</p>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div class="bg-[#F8FAFD] rounded-lg p-4 border border-[#E0E0E0]">
              <p class="text-[11px] text-[#6B7280] uppercase tracking-wide mb-2">Candidata</p>
              <p class="text-[15px] font-bold text-[#1A1A2E]">
                {{ step1.value.nombre }} {{ step1.value.primer_apellido }} {{ step1.value.segundo_apellido }}
              </p>
              <p class="text-[13px] text-[#6B7280] mt-1">{{ step1.value.sexo }} - {{ step1.value.fecha_nacimiento }}</p>
              <p class="text-[13px] text-[#6B7280]">{{ step1.value.telefono }}</p>
              <p class="text-[13px] text-[#6B7280]">CURP: {{ step1.value.curp || 'No proporcionada' }}</p>
            </div>
            <div class="bg-[#F8FAFD] rounded-lg p-4 border border-[#E0E0E0]">
              <p class="text-[11px] text-[#6B7280] uppercase tracking-wide mb-2">Domicilio</p>
              <p class="text-[13px] text-[#1A1A2E]">
                {{ step1.value.calle }} {{ step1.value.numero_exterior }},
                Col. {{ step1.value.colonia }}, C.P. {{ step1.value.codigo_postal }}
              </p>
              @if (step1.value.latitud && step1.value.longitud) {
                <p class="text-[12px] text-[#00A86B] mt-1">Ubicacion GPS marcada</p>
              }
            </div>
          </div>

          <!-- Documentos -->
          <div class="mb-6">
            <p class="text-[11px] text-[#6B7280] uppercase tracking-wide mb-3">Documentos</p>
            <div class="grid grid-cols-3 gap-3">
              <div [class]="files['ine'] ? 'border-[#00A86B] bg-[#00A86B]/5' : 'border-[#E53935] bg-[#E53935]/5'"
                class="rounded-lg p-3 border text-center"
              >
                <p class="text-[12px] font-semibold">INE</p>
                <p class="text-[11px] mt-0.5" [class]="files['ine'] ? 'text-[#00A86B]' : 'text-[#E53935]'">
                  {{ files['ine'] ? files['ine'].name : 'Sin archivo' }}
                </p>
              </div>
              <div [class]="files['comprobante_domicilio'] ? 'border-[#00A86B] bg-[#00A86B]/5' : 'border-[#E53935] bg-[#E53935]/5'"
                class="rounded-lg p-3 border text-center"
              >
                <p class="text-[12px] font-semibold">Comprobante</p>
                <p class="text-[11px] mt-0.5" [class]="files['comprobante_domicilio'] ? 'text-[#00A86B]' : 'text-[#E53935]'">
                  {{ files['comprobante_domicilio'] ? files['comprobante_domicilio'].name : 'Sin archivo' }}
                </p>
              </div>
              <div [class]="files['buro_credito'] ? 'border-[#00A86B] bg-[#00A86B]/5' : 'border-[#E53935] bg-[#E53935]/5'"
                class="rounded-lg p-3 border text-center"
              >
                <p class="text-[12px] font-semibold">Buro de credito</p>
                <p class="text-[11px] mt-0.5" [class]="files['buro_credito'] ? 'text-[#00A86B]' : 'text-[#E53935]'">
                  {{ files['buro_credito'] ? files['buro_credito'].name : 'Sin archivo' }}
                </p>
              </div>
            </div>
          </div>

          <!-- Contadores -->
          <div class="grid grid-cols-3 gap-4 pt-4 border-t border-[#E0E0E0]">
            <div class="text-center">
              <p class="font-[Montserrat] text-[24px] font-extrabold text-[#003399]">{{ family.length }}</p>
              <p class="text-[12px] text-[#6B7280]">Familiares</p>
            </div>
            <div class="text-center">
              <p class="font-[Montserrat] text-[24px] font-extrabold text-[#FF8800]">{{ cars.length }}</p>
              <p class="text-[12px] text-[#6B7280]">Vehiculos</p>
            </div>
            <div class="text-center">
              <p class="font-[Montserrat] text-[24px] font-extrabold text-[#00A86B]">{{ affiliates.length }}</p>
              <p class="text-[12px] text-[#6B7280]">Afiliales</p>
            </div>
          </div>

          @if (!allFilesOk()) {
            <div class="mt-4 bg-[#FF8800]/10 text-[#FF8800] text-[13px] px-4 py-3 rounded-lg border border-[#FF8800]/20">
              Faltan documentos obligatorios: INE, Comprobante de domicilio y Buro de credito.
            </div>
          }
        </div>
      }

      <!-- Navigation -->
      <div class="flex justify-between mt-6">
        <button
          type="button"
          (click)="prev()"
          [class.invisible]="step() === 1"
          class="px-6 py-2.5 rounded-lg text-[13px] font-semibold bg-white text-[#003399] border border-[#E0E0E0] hover:border-[#003399] transition-colors cursor-pointer"
        >Anterior</button>

        @if (step() < 4) {
          <button type="button" (click)="next()"
            class="px-6 py-2.5 rounded-lg text-[13px] font-semibold bg-[#003399] text-white hover:bg-[#002277] transition-colors border-0 cursor-pointer"
          >Siguiente</button>
        } @else {
          <button type="button" (click)="submit()" [disabled]="saving() || !allFilesOk()"
            class="px-6 py-2.5 rounded-lg text-[13px] font-semibold bg-[#00A86B] text-white hover:bg-[#008f5a] transition-colors border-0 cursor-pointer disabled:opacity-60"
          >
            @if (saving()) { Guardando... } @else { Enviar pre-solicitud }
          </button>
        }
      </div>
    </div>
  `,
})
export class NewPreApplicationComponent implements AfterViewInit, OnInit, OnDestroy {
  private svc    = inject(PreApplicationService);
  private router = inject(Router);
  private fb     = inject(FormBuilder);
  private cdr    = inject(ChangeDetectorRef);

  step       = signal(1);
  saving     = signal(false);
  errorMsg   = signal('');
  houseFiles = signal<File[]>([]);
  afiliadesExistentes = signal<{id: number, name: string}[]>([]);

  // Geocodificación automática
  geocoding     = signal(false);
  geocodeError  = signal('');
  private geocode$ = new Subject<string>();
  private geocodeSub = this.geocode$.pipe(
    debounceTime(1200),
    distinctUntilChanged(),
    switchMap(q => { try { const p = JSON.parse(q); return p['cp'] ? this.fetchCoords(q) : of(null); } catch { return of(null); } }),
  ).subscribe(result => {
    this.geocoding.set(false);
    if (result) {
      this.geocodeError.set('');
      this.placeMarker(result.lat, result.lng);
      if (this.map) this.map.setView([result.lat, result.lng], 16);
    } else if (result === null && this.step1.value.calle) {
      // búsqueda con resultado vacío — se manejará como no encontrado
    }
    this.cdr.markForCheck();
  });

  files: { [key: string]: File } = {};
  submitted2 = false;

  private map: any = null;
  private marker: any = null;

  steps = [
    { n: 1, label: 'Datos personales' },
    { n: 2, label: 'Documentos' },
    { n: 3, label: 'Familia y vehiculos' },
    { n: 4, label: 'Resumen' },
  ];

  step1 = this.fb.group({
    nombre:            ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100), onlyTextValidator(), noInjectionValidator()]],
    primer_apellido:   ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100), onlyTextValidator(), noInjectionValidator()]],
    segundo_apellido:  [''],
    sexo:              ['', Validators.required],
    fecha_nacimiento:  ['', [Validators.required, minAgeValidator(18)]],
    curp:              ['', curpValidator()],
    rfc:               ['', rfcValidator()],
    telefono:          ['', [Validators.required, phoneValidator()]],
    telefono_personal: ['', phoneValidator()],
    calle:             ['', [Validators.required, Validators.minLength(3), Validators.maxLength(150), noInjectionValidator()]],
    numero_exterior:   ['', Validators.required],
    colonia:           ['', [Validators.required, Validators.maxLength(100), noInjectionValidator()]],
    codigo_postal:     ['', [Validators.required, postalCodeValidator()]],
    latitud:           [null as number | null],
    longitud:          [null as number | null],
  });

  step2 = this.fb.group({ afiliaciones: this.fb.array([]) });
  step3 = this.fb.group({ familiares: this.fb.array([]), vehiculos: this.fb.array([]) });

  get affiliates() { return this.step2.get('afiliaciones') as FormArray; }
  get family()     { return this.step3.get('familiares') as FormArray; }
  get cars()       { return this.step3.get('vehiculos') as FormArray; }
  getGroup(c: any) { return c; }

  readonly today = new Date().toISOString().split('T')[0];
  inv(form: any, field: string) {
    const c = form.get(field);
    return c?.invalid && c?.touched;
  }
  err(form: any, field: string, label = '') {
    return getErrorMessage(form.get(field), label);
  }

  fileError(key: string) { return this.submitted2 && !this.files[key]; }
  allFilesOk()           { return !!this.files['ine'] && !!this.files['comprobante_domicilio'] && !!this.files['buro_credito']; }

  onFile(e: Event, key: string) {
    const f = (e.target as HTMLInputElement).files?.[0];
    if (f) this.files[key] = f;
  }

  onMultipleFiles(e: Event) {
    const files = Array.from((e.target as HTMLInputElement).files ?? []);
    this.houseFiles.set(files.slice(0, 5));
  }

  addAffiliate()	  { this.affiliates.push(this.fb.group({ id: [null], nombre: ['', Validators.required], limite_credito: [0, Validators.required], es_nueva: [false], })); }

  removeAffiliate(i: number) { this.affiliates.removeAt(i); }

  addFamily()             { this.family.push(this.fb.group({ parentesco: ['', Validators.required], nombre: ['', Validators.required], primer_apellido: ['', Validators.required], segundo_apellido: [''] })); }
  removeFamily(i: number) { this.family.removeAt(i); }

  addCar()             { this.cars.push(this.fb.group({ marca: [''], modelo: [''], placas: [''], tipo: [''], numero_serie: [''] })); }
  removeCar(i: number) { this.cars.removeAt(i); }

  // ── MAPA ────────────────────────────────────────────────────────────────

  ngOnInit() {
    this.svc.getAfiliales().subscribe({
      next: r => this.afiliadesExistentes.set(r.data ?? []),
      error: () => {},
    });

    // Geocodificar automáticamente cuando cambien los campos de dirección
    const addressFields = ['calle', 'numero_exterior', 'colonia', 'codigo_postal'];
    addressFields.forEach(field => {
      this.step1.get(field)?.valueChanges.subscribe(() => this.triggerGeocode());
    });
  }

  ngAfterViewInit() {
    // Esperar a que el DOM esté listo y Leaflet disponible
    setTimeout(() => this.initMap(), 100);
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    this.geocodeSub.unsubscribe();
    this.geocode$.complete();
  }

  private initMap() {
    if (typeof L === 'undefined') {
      console.warn('Leaflet no esta cargado. Asegurate de incluirlo en index.html');
      return;
    }
    const container = document.getElementById('pre-app-map');
    if (!container) return;

    // Centro default: Torreon, Coahuila
    this.map = L.map('pre-app-map').setView([25.5428, -103.4068], 13);

    L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(this.map);

    // Si ya hay coordenadas guardadas, mostrar el pin
    const lat = this.step1.value.latitud;
    const lng = this.step1.value.longitud;
    if (lat && lng) {
      this.placeMarker(lat, lng);
    }

    // Clic en el mapa para poner/mover el pin
    this.map.on('click', (e: any) => {
      this.placeMarker(e.latlng.lat, e.latlng.lng);
    });
  }

  private placeMarker(lat: number, lng: number) {
    if (this.marker) {
      this.marker.setLatLng([lat, lng]);
    } else {
      this.marker = L.marker([lat, lng], { draggable: true }).addTo(this.map);
      this.marker.on('dragend', (e: any) => {
        const pos = e.target.getLatLng();
        this.setCoords(pos.lat, pos.lng);
      });
    }
    this.setCoords(lat, lng);
    this.map.panTo([lat, lng]);
  }

  private setCoords(lat: number, lng: number) {
    // Redondear a 6 decimales
    const latR = Math.round(lat * 1e6) / 1e6;
    const lngR = Math.round(lng * 1e6) / 1e6;
    this.step1.patchValue({ latitud: latR, longitud: lngR });
  }

  fmt = (n: number | null | undefined) => n != null ? n.toFixed(6) : '';

  clearCoords() {
    this.step1.patchValue({ latitud: null, longitud: null });
    if (this.marker) {
      this.marker.remove();
      this.marker = null;
    }
  }

  // ── GEOCODIFICACIÓN AUTOMÁTICA ──────────────────────────────────────────

  private triggerGeocode() {
    const v       = this.step1.value;
    const cp      = (v.codigo_postal ?? '').trim();
    const calle   = (v.calle ?? '').trim();
    const numExt  = (v.numero_exterior ?? '').trim();
    const colonia = (v.colonia ?? '').trim();

    // El C.P. es el ancla principal — sin él no podemos garantizar la ciudad correcta
    if (!cp || cp.length < 5) return;

    this.geocoding.set(true);
    this.geocodeError.set('');

    // Armamos los parámetros de búsqueda y los pasamos como objeto
    const params: Record<string, string> = { cp, colonia, numExt };
    if (calle) params['street'] = calle;

    this.geocode$.next(JSON.stringify(params));
  }

  private fetchCoords(paramsJson: string) {
    const p = JSON.parse(paramsJson) as Record<string, string>;

    // Photon acepta número exterior solo si es numérico puro.
    // Si tiene letras (ej. "128B") lo dejamos solo con el número, si es solo letras lo omitimos.
    const rawNum      = (p['numExt'] ?? '').trim();
    const numLimpio   = rawNum.replace(/[^0-9]/g, '');          // "128B" → "128", "S/N" → ""
    const calle       = (p['street'] ?? '').trim();
    const streetPart  = calle ? (numLimpio ? `${numLimpio} ${calle}` : calle) + ', ' : '';
    const coloniaPart = p['colonia'] ? `${p['colonia']}, ` : '';
    const fullQuery   = `${streetPart}${coloniaPart}${p['cp']}, México`;

    const fetchPhoton = (q: string, limit = 5) =>
      fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=${limit}`)
        .then(r => r.ok ? r.json() : { features: [] })
        .catch(() => ({ features: [] }));

    const pickBestMatch = (geo: any): { lat: number; lng: number } | null => {
      const features: any[] = geo?.features ?? [];
      // Preferir resultado con C.P. exacto
      const exact = features.find((f: any) =>
        (f.properties?.postcode ?? '').replace(/\s/g, '') === p['cp']
      );
      const match = exact ?? features[0];
      if (!match) return null;
      const [lng, lat] = match.geometry.coordinates;
      return { lat, lng };
    };

    const promise = fetchPhoton(fullQuery)
      .then(async (geo: any) => {
        const result = pickBestMatch(geo);
        if (result) return result;

        // Fallback 1: solo colonia + C.P.
        if (p['colonia']) {
          const geo2 = await fetchPhoton(`${p['colonia']}, ${p['cp']}, México`, 3);
          const r2   = pickBestMatch(geo2);
          if (r2) {
            this.geocodeError.set('Dirección aproximada — ajusta el pin si es necesario.');
            this.cdr.markForCheck();
            return r2;
          }
        }

        // Fallback 2: solo C.P.
        const geo3 = await fetchPhoton(`${p['cp']}, México`, 1);
        const r3   = pickBestMatch(geo3);
        if (r3) {
          this.geocodeError.set('Dirección exacta no encontrada. Mapa centrado en tu C.P. — ajusta el pin manualmente.');
          this.cdr.markForCheck();
          return r3;
        }

        this.geocodeError.set('Dirección no encontrada. Puedes marcarla manualmente en el mapa.');
        this.cdr.markForCheck();
        return null;
      })
      .catch(() => {
        this.geocodeError.set('No se pudo conectar al servicio de ubicación. Marca la dirección manualmente en el mapa.');
        this.cdr.markForCheck();
        return null;
      });

    return of(null).pipe(switchMap(() => from(promise)));
  }

  geolocate() {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        if (this.map) {
          this.map.setView([lat, lng], 16);
          this.placeMarker(lat, lng);
        }
      },
      () => alert('No se pudo obtener la ubicacion. Verifica los permisos del navegador.')
    );
  }

  // ── NAVEGACION ──────────────────────────────────────────────────────────

  next() {
    if (this.step() === 1) {
      this.step1.markAllAsTouched();
      if (this.step1.invalid) return;
    }
    if (this.step() === 2) {
      this.submitted2 = true;
      if (!this.allFilesOk()) return;
    }
    this.step.update(s => s + 1);

    // Reinicializar el mapa si se regresa al step 1
    if (this.step() === 1) {
      setTimeout(() => this.initMap(), 200);
    }
  }

  prev() {
    this.step.update(s => s - 1);
    if (this.step() === 1) {
      setTimeout(() => this.initMap(), 200);
    }
  }

  // ── SUBMIT ──────────────────────────────────────────────────────────────

  submit() {
    if (!this.allFilesOk()) return;
    this.saving.set(true);
    this.errorMsg.set('');

    const fd = new FormData();
    const s1 = this.step1.value;

    fd.append('nombre',           s1.nombre ?? '');
    fd.append('primer_apellido',  s1.primer_apellido ?? '');
    fd.append('segundo_apellido', s1.segundo_apellido ?? '');
    fd.append('sexo',             s1.sexo ?? '');
    fd.append('fecha_nacimiento', s1.fecha_nacimiento ?? '');
    if (s1.curp)              fd.append('curp',              s1.curp);
    if (s1.rfc)               fd.append('rfc',               s1.rfc);
    fd.append('telefono',         s1.telefono ?? '');
    if (s1.telefono_personal) fd.append('telefono_personal', s1.telefono_personal);
    fd.append('calle',            s1.calle ?? '');
    fd.append('numero_exterior',  s1.numero_exterior ?? '');
    fd.append('colonia',          s1.colonia ?? '');
    fd.append('codigo_postal',    s1.codigo_postal ?? '');
    if (s1.latitud)  fd.append('latitud',  String(s1.latitud));
    if (s1.longitud) fd.append('longitud', String(s1.longitud));

    fd.append('ine',                   this.files['ine']);
    fd.append('comprobante_domicilio', this.files['comprobante_domicilio']);
    fd.append('buro_credito',          this.files['buro_credito']);

    this.houseFiles().forEach((f, i) => fd.append('fotos_vivienda[' + i + ']', f));

    this.affiliates.value.forEach((a: any, i: number) => {
      fd.append('afiliaciones[' + i + '][nombre]',         a.nombre);
      fd.append('afiliaciones[' + i + '][limite_credito]', String(a.limite_credito ?? 0));
    });

    this.family.value.forEach((m: any, i: number) => {
      fd.append('familiares[' + i + '][parentesco]',      m.parentesco);
      fd.append('familiares[' + i + '][nombre]',          m.nombre);
      fd.append('familiares[' + i + '][primer_apellido]', m.primer_apellido);
      if (m.segundo_apellido) fd.append('familiares[' + i + '][segundo_apellido]', m.segundo_apellido);
    });

    this.cars.value.forEach((c: any, i: number) => {
      if (c.marca)        fd.append('vehiculos[' + i + '][marca]',        c.marca);
      if (c.modelo)       fd.append('vehiculos[' + i + '][modelo]',       c.modelo);
      if (c.placas)       fd.append('vehiculos[' + i + '][placas]',       c.placas);
      if (c.tipo)         fd.append('vehiculos[' + i + '][tipo]',         c.tipo);
      if (c.numero_serie) fd.append('vehiculos[' + i + '][numero_serie]', c.numero_serie);
    });

    this.svc.create(fd).subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/coordinador/pre-solicitudes']);
      },
      error: err => {
        this.saving.set(false);
        this.errorMsg.set(err?.error?.message ?? 'Error al guardar. Verifica los datos.');
      },
    });
  }
}