import { ChangeDetectionStrategy, Component, inject, signal, AfterViewInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { getErrorMessage } from '../../../core/validators/form-validators';

declare const grecaptcha: any;

@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-[#F4F7FA] flex items-center justify-center p-4">
      <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_4px_24px_rgba(0,51,153,0.13)] w-full max-w-sm p-8">

        <!-- Logo -->
        <div class="flex items-center gap-3 mb-8">
          <div class="w-10 h-10 rounded-[10px] bg-[#FF8800] flex items-center justify-center font-extrabold text-xl text-white font-[Montserrat]">P</div>
          <div class="font-[Montserrat] font-bold text-[18px] text-[#1A1A2E] leading-tight">
            Prestamo<span class="text-[#FF8800]">Facil</span>
          </div>
        </div>

        <!-- ── PANTALLA 1: Login ───────────────────────────────────────── -->
        @if (screen() === 'login') {
          <h1 class="font-[Montserrat] text-[20px] font-extrabold text-[#1A1A2E] mb-1">Iniciar sesion</h1>
          <p class="text-[13px] text-[#6B7280] mb-6">Accede con tu cuenta institucional</p>

          @if (errorMsg()) {
            <div class="bg-[#E53935]/10 text-[#E53935] text-[13px] px-3 py-2 rounded-lg border border-[#E53935]/20 mb-4" role="alert">
              {{ errorMsg() }}
            </div>
          }

          <form [formGroup]="form" (ngSubmit)="submit()" class="flex flex-col gap-4">
            <div class="flex flex-col gap-1">
              <label class="text-[12px] font-semibold text-[#1A1A2E]" for="email">Correo electrónico</label>
              <input id="email" formControlName="email" type="email" placeholder="correo@prestamofacil.com"
                class="border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-[13px] outline-none focus:border-[#003399] transition-colors"
                [class.border-[#E53935]]="isInvalid('email')"
                autocomplete="email"
              />
              @if (isInvalid('email')) {
                <span class="text-[11px] text-[#E53935]">{{ errMsg('email', 'Correo electrónico') }}</span>
              }
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-[12px] font-semibold text-[#1A1A2E]" for="password">Contraseña</label>
              <input id="password" formControlName="password" type="password" placeholder="Tu contraseña"
                class="border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-[13px] outline-none focus:border-[#003399] transition-colors"
                [class.border-[#E53935]]="isInvalid('password')"
                autocomplete="current-password"
              />
              @if (isInvalid('password')) {
                <span class="text-[11px] text-[#E53935]">{{ errMsg('password', 'Contraseña') }}</span>
              }
            </div>

            <div class="flex justify-center">
              <div id="recaptcha-container"></div>
            </div>
            @if (!recaptchaToken() && formTouched()) {
              <p class="text-[11px] text-[#E53935] text-center">Por favor completa el reCAPTCHA.</p>
            }

            <button type="submit" [disabled]="loading()"
              class="w-full py-2.5 rounded-lg text-[13px] font-semibold bg-[#003399] text-white hover:bg-[#002277] transition-colors border-0 cursor-pointer disabled:opacity-60 mt-2"
            >
              @if (loading()) { Verificando... } @else { Entrar }
            </button>
          </form>
        }

        <!-- ── PANTALLA 2: Setup QR (primera vez) ────────────────────── -->
        @if (screen() === 'setup') {
          <div class="flex items-center gap-3 mb-6">
            <button type="button" (click)="backToLogin()"
              class="text-[#6B7280] hover:text-[#003399] transition-colors bg-transparent border-0 cursor-pointer p-0"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <div>
              <h1 class="font-[Montserrat] text-[20px] font-extrabold text-[#1A1A2E]">Configurar 2FA</h1>
              <p class="text-[13px] text-[#6B7280]">Solo se hace una vez</p>
            </div>
          </div>

          <div class="text-center mb-5">
            <p class="text-[13px] text-[#1A1A2E] mb-1 font-semibold">Escanea este codigo QR</p>
            <p class="text-[12px] text-[#6B7280] mb-4">Abre Google Authenticator, toca el "+" y escanea la imagen</p>

            @if (loadingQr()) {
              <div class="flex items-center justify-center h-[200px]">
                <svg class="w-6 h-6 animate-spin text-[#003399]" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
              </div>
            }

            @if (qrCode()) {
              <img [src]="qrCode()" alt="QR Code Google Authenticator" class="mx-auto w-[200px] h-[200px] rounded-lg border border-[#E0E0E0]" />
            }

            @if (secretKey()) {
              <div class="mt-3 bg-[#F8FAFD] border border-[#E0E0E0] rounded-lg px-3 py-2">
                <p class="text-[11px] text-[#6B7280] mb-1">O ingresa este codigo manualmente:</p>
                <p class="font-mono text-[13px] font-bold text-[#003399] tracking-widest">{{ secretKey() }}</p>
              </div>
            }
          </div>

          @if (errorMsg()) {
            <div class="bg-[#E53935]/10 text-[#E53935] text-[13px] px-3 py-2 rounded-lg border border-[#E53935]/20 mb-4" role="alert">
              {{ errorMsg() }}
            </div>
          }

          <p class="text-[12px] text-[#6B7280] mb-3 text-center">Cuando lo hayas escaneado, ingresa el código que muestra la app:</p>

          <form [formGroup]="codeForm" (ngSubmit)="confirmSetup()" class="flex flex-col gap-3">
            <input formControlName="code" type="text" inputmode="numeric" maxlength="6" placeholder="000000"
              class="border border-[#E0E0E0] rounded-lg px-3 py-3 text-[22px] font-mono font-bold text-center outline-none focus:border-[#003399] transition-colors tracking-[8px]"
              [class.border-[#E53935]]="codeForm.get('code')?.invalid && codeForm.get('code')?.touched"
            />
            @if (codeForm.get('code')?.invalid && codeForm.get('code')?.touched) {
              <span class="text-[11px] text-[#E53935] text-center">Ingresa el código de 6 dígitos de tu app.</span>
            }
            <button type="submit" [disabled]="loading()"
              class="w-full py-2.5 rounded-lg text-[13px] font-semibold bg-[#003399] text-white hover:bg-[#002277] transition-colors border-0 cursor-pointer disabled:opacity-60"
            >
              @if (loading()) { Verificando... } @else { Confirmar y entrar }
            </button>
          </form>
        }

        <!-- ── PANTALLA 3: Ingresar codigo TOTP ──────────────────────── -->
        @if (screen() === 'verify') {
          <div class="flex items-center gap-3 mb-6">
            <button type="button" (click)="backToLogin()"
              class="text-[#6B7280] hover:text-[#003399] transition-colors bg-transparent border-0 cursor-pointer p-0"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <div>
              <h1 class="font-[Montserrat] text-[20px] font-extrabold text-[#1A1A2E]">Verificación</h1>
              <p class="text-[13px] text-[#6B7280]">Código de Google Authenticator</p>
            </div>
          </div>

          <div class="bg-[#003399]/5 border border-[#003399]/15 rounded-lg px-4 py-3 mb-6 text-center">
            <p class="text-[13px] text-[#1A1A2E]">Abre Google Authenticator y escribe</p>
            <p class="text-[13px] font-semibold text-[#003399]">el código de 6 dígitos de PréstamoFácil</p>
          </div>

          @if (errorMsg()) {
            <div class="bg-[#E53935]/10 text-[#E53935] text-[13px] px-3 py-2 rounded-lg border border-[#E53935]/20 mb-4" role="alert">
              {{ errorMsg() }}
            </div>
          }

          <form [formGroup]="codeForm" (ngSubmit)="verify()" class="flex flex-col gap-4">
            <div class="flex flex-col gap-1">
              <label class="text-[12px] font-semibold text-[#1A1A2E]" for="code">Código de verificación</label>
              <input id="code" formControlName="code" type="text" inputmode="numeric" maxlength="6" placeholder="000000"
                class="border border-[#E0E0E0] rounded-lg px-3 py-3 text-[22px] font-mono font-bold text-center outline-none focus:border-[#003399] transition-colors tracking-[8px]"
                [class.border-[#E53935]]="codeForm.get('code')?.invalid && codeForm.get('code')?.touched"
              />
              @if (codeForm.get('code')?.invalid && codeForm.get('code')?.touched) {
                <span class="text-[11px] text-[#E53935]">Ingresa el código de 6 dígitos de tu app autenticadora.</span>
              }
            </div>
            <button type="submit" [disabled]="loading()"
              class="w-full py-2.5 rounded-lg text-[13px] font-semibold bg-[#003399] text-white hover:bg-[#002277] transition-colors border-0 cursor-pointer disabled:opacity-60"
            >
              @if (loading()) { Verificando... } @else { Confirmar }
            </button>
          </form>
        }

      </div>
    </div>
  `,
})
export class LoginComponent implements AfterViewInit {
  private readonly twoFactorSecretKey = 'prestamo-facil-2fa-secret';
  private auth   = inject(AuthService);
  private router = inject(Router);
  private fb     = inject(FormBuilder);

  screen      = signal<'login' | 'setup' | 'verify'>('login');
  loading     = signal(false);
  loadingQr   = signal(false);
  errorMsg    = signal('');
  formTouched = signal(false);
  emailFor2fa = signal('');
  qrCode      = signal('');
  secretKey   = signal('');

  recaptchaToken = signal('');
  private widgetId: any = null;

  form = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  codeForm = this.fb.group({
    code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
  });

  ngAfterViewInit() {
    this.secretKey.set(localStorage.getItem(this.twoFactorSecretKey) ?? '');
    this.renderRecaptcha();
  }

  private renderRecaptcha() {
    setTimeout(() => {
      if (typeof grecaptcha === 'undefined') return;
      const container = document.getElementById('recaptcha-container');
      if (!container || container.childElementCount > 0) return;
      this.widgetId = grecaptcha.render('recaptcha-container', {
        sitekey: '6LftL68sAAAAAGBlBr1Z2zY6IYSmJmTAH3wX37oL',
        callback: (token: string) => this.recaptchaToken.set(token),
        'expired-callback': () => this.recaptchaToken.set(''),
      });
    }, 500);
  }

  isInvalid(f: string) {
    const c = this.form.get(f);
    return c?.invalid && c?.touched;
  }

  errMsg(f: string, label = '') {
    return getErrorMessage(this.form.get(f), label);
  }

private navigateByRole(user: any) {
  const roles = (user as any).roles ?? [];
  if (roles.includes('gerente')) {
    this.router.navigate(['/gerente']);
  } else if (roles.includes('coordinador')) {
    this.router.navigate(['/coordinador']);
  } else if (roles.includes('verificador')) {
    this.router.navigate(['/verificador']);
  } else if (roles.includes('auditor')) {
    this.router.navigate(['/auditor']);
  } else if (roles.includes('cajera')) {
    this.router.navigate(['/cajera']);
  } else if (roles.includes('distribuidora')) {
    this.router.navigate(['/distribuidora']);
  } else {
    this.router.navigate(['/admin']);
  }
}

  // ── Pantalla 1: Submit login ─────────────────────────────────────────────

  submit() {
    this.form.markAllAsTouched();
    this.formTouched.set(true);
    if (this.form.invalid) return;

    if (!this.recaptchaToken()) {
      this.errorMsg.set('Por favor completa el reCAPTCHA.');
      return;
    }

    this.loading.set(true);
    this.errorMsg.set('');

    const { email, password } = this.form.value;

    this.auth.login({
      email:           email!,
      password:        password!,
      recaptcha_token: this.recaptchaToken(),
    }).subscribe({
      next: (res: any) => {
        this.loading.set(false);
        this.emailFor2fa.set(res.email);

        if (res.setup_required) {
          // Primera vez — mostrar QR
          this.loadQr(res.email);
          this.screen.set('setup');
        } else {
          // Ya tiene 2FA — pedir codigo
          this.screen.set('verify');
        }
      },
      error: err => {
        this.loading.set(false);
        this.errorMsg.set(err?.error?.message ?? 'Credenciales incorrectas.');
        if (this.widgetId !== null) {
          grecaptcha.reset(this.widgetId);
          this.recaptchaToken.set('');
        }
      },
    });
  }

  // ── Pantalla 2: Cargar QR y confirmar setup ──────────────────────────────

  private loadQr(email: string) {
    this.loadingQr.set(true);
    this.auth.setup2fa(email).subscribe({
      next: (res: any) => {
        this.loadingQr.set(false);
        this.qrCode.set(res.qr_code);
        this.secretKey.set(res.secret);
        if (res.secret) {
          localStorage.setItem(this.twoFactorSecretKey, res.secret);
        }
      },
      error: () => {
        this.loadingQr.set(false);
        this.errorMsg.set('Error al generar el codigo QR. Intenta de nuevo.');
      },
    });
  }

  confirmSetup() {
    this.codeForm.markAllAsTouched();
    if (this.codeForm.invalid) return;

    this.loading.set(true);
    this.errorMsg.set('');

    const secret = this.secretKey() || localStorage.getItem(this.twoFactorSecretKey) || undefined;

    this.auth.confirm2fa(this.emailFor2fa(), this.codeForm.value.code!, secret).subscribe({
      next: () => {
        localStorage.removeItem(this.twoFactorSecretKey);
        this.auth.loadMe().subscribe({
          next: user => this.navigateByRole(user),
          error: () => this.router.navigate(['/login']),
        });
      },
      error: err => {
        this.loading.set(false);
        this.errorMsg.set(err?.error?.message ?? 'Codigo incorrecto. Verifica tu app.');
      },
    });
  }

  // ── Pantalla 3: Verificar codigo TOTP ────────────────────────────────────

  verify() {
    this.codeForm.markAllAsTouched();
    if (this.codeForm.invalid) return;

    this.loading.set(true);
    this.errorMsg.set('');

    const secret = this.secretKey() || localStorage.getItem(this.twoFactorSecretKey) || undefined;

    this.auth.verify2fa(this.emailFor2fa(), this.codeForm.value.code!, secret).subscribe({
      next: () => {
        localStorage.removeItem(this.twoFactorSecretKey);
        this.auth.loadMe().subscribe({
          next: user => this.navigateByRole(user),
          error: () => this.router.navigate(['/login']),
        });
      },
      error: err => {
        this.loading.set(false);
        this.errorMsg.set(err?.error?.message ?? 'Codigo incorrecto. Intenta de nuevo.');
      },
    });
  }

  // ── Regresar al login ────────────────────────────────────────────────────

  backToLogin() {
    this.screen.set('login');
    this.errorMsg.set('');
    this.codeForm.reset();
    this.qrCode.set('');
    this.secretKey.set('');
    localStorage.removeItem(this.twoFactorSecretKey);
    setTimeout(() => this.renderRecaptcha(), 200);
  }
}