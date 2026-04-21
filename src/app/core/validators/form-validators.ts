import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// ── Regex patterns ────────────────────────────────────────────────────────────
const CURP_REGEX      = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z\d]\d$/i;
const RFC_REGEX       = /^[A-ZÑ&]{3,4}\d{6}[A-Z\d]{2}[A\d]$/i;
const PHONE_REGEX     = /^\d{10}$/;
const CP_REGEX        = /^\d{5}$/;
const CLABE_REGEX     = /^\d{18}$/;
const ONLY_TEXT       = /^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s'-]+$/;

/**
 * Detecta patrones típicos de SQL injection y otros vectores de inyección.
 * Bloquea: comillas simples/dobles no balanceadas, palabras clave SQL peligrosas,
 * comentarios SQL (-- y /* *\/), y secuencias de escape comunes.
 */
const SQL_INJECTION_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|TRUNCATE|GRANT|REVOKE)\b)/i,
  /(-{2}|\/\*|\*\/)/,          // comentarios SQL
  /[;](?!\s*$)/,               // punto y coma (excepto al final)
  /\b(OR|AND)\s+['"]?\d+['"]?\s*=\s*['"]?\d+['"]?/i, // OR 1=1 / AND 1=1
  /xp_\w+/i,                   // procedimientos extendidos MSSQL
  /\bCAST\s*\(/i,
  /\bCONVERT\s*\(/i,
  /\bCHAR\s*\(\d+\)/i,
  /0x[0-9a-fA-F]+/,            // literales hexadecimales
];

// ── Custom validators ─────────────────────────────────────────────────────────

/** Valida que el RFC tenga formato correcto (12 o 13 caracteres). */
export function rfcValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const val = (control.value ?? '').toString().trim();
    if (!val) return null;
    return RFC_REGEX.test(val) ? null : { rfc: true };
  };
}

/** Valida que la CURP tenga exactamente 18 caracteres y formato correcto. */
export function curpValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const val = (control.value ?? '').toString().trim();
    if (!val) return null;
    if (val.length !== 18) return { curpLength: true };
    return CURP_REGEX.test(val) ? null : { curp: true };
  };
}

/** Valida que el teléfono tenga exactamente 10 dígitos. */
export function phoneValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const val = (control.value ?? '').toString().replace(/\D/g, '');
    if (!val) return null;
    return PHONE_REGEX.test(val) ? null : { phone: true };
  };
}

/** Valida que el código postal tenga exactamente 5 dígitos. */
export function postalCodeValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const val = (control.value ?? '').toString().trim();
    if (!val) return null;
    return CP_REGEX.test(val) ? null : { postalCode: true };
  };
}

/** Valida que la CLABE interbancaria tenga exactamente 18 dígitos. */
export function clabeValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const val = (control.value ?? '').toString().replace(/\s/g, '');
    if (!val) return null;
    return CLABE_REGEX.test(val) ? null : { clabe: true };
  };
}

/** Valida que el campo solo contenga letras, espacios, guiones y apóstrofes. */
export function onlyTextValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const val = (control.value ?? '').toString().trim();
    if (!val) return null;
    return ONLY_TEXT.test(val) ? null : { onlyText: true };
  };
}

/**
 * Detecta y bloquea patrones de inyección SQL y otros vectores de ataque
 * en campos de texto libre. Usar en nombres, comentarios, descripciones, etc.
 */
export function noInjectionValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const val = (control.value ?? '').toString();
    if (!val) return null;
    const hasThreat = SQL_INJECTION_PATTERNS.some(pattern => pattern.test(val));
    return hasThreat ? { injection: true } : null;
  };
}

/**
 * Valida que el candidato sea mayor de edad (>= minAge años).
 * El control debe contener una fecha en formato reconocido por Date.
 * @param minAge Edad mínima requerida (por defecto 18).
 */
export function minAgeValidator(minAge = 18): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const val = control.value;
    if (!val) return null;
    const birth = new Date(val);
    if (isNaN(birth.getTime())) return { invalidDate: true };
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    const dayDiff   = today.getDate() - birth.getDate();
    const fullAge   = age - (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? 1 : 0);
    return fullAge >= minAge ? null : { minAge: { required: minAge, actual: fullAge } };
  };
}

/**
 * Valida que la contraseña sea segura:
 * - Mínimo 8 caracteres
 * - Al menos una mayúscula
 * - Al menos una minúscula
 * - Al menos un dígito
 * - Al menos un carácter especial (!@#$%^&*...)
 */
export function strongPasswordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const val: string = control.value ?? '';
    if (!val) return null;
    const errors: Record<string, boolean> = {};
    if (val.length < 8)                          errors['passwordTooShort']    = true;
    if (!/[A-Z]/.test(val))                       errors['passwordNoUpper']     = true;
    if (!/[a-z]/.test(val))                       errors['passwordNoLower']     = true;
    if (!/\d/.test(val))                          errors['passwordNoNumber']    = true;
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(val)) errors['passwordNoSpecial'] = true;
    return Object.keys(errors).length ? errors : null;
  };
}

/**
 * Valida que la fecha del control sea posterior a `minDate`
 * y anterior a `maxDate`. Ambos límites son opcionales.
 */
export function dateRangeValidator(minDate?: Date, maxDate?: Date): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const val = control.value;
    if (!val) return null;
    const d = new Date(val);
    if (isNaN(d.getTime())) return { invalidDate: true };
    if (minDate && d < minDate) return { dateTooEarly: { min: minDate.toISOString().split('T')[0] } };
    if (maxDate && d > maxDate) return { dateTooLate:  { max: maxDate.toISOString().split('T')[0] } };
    return null;
  };
}

/** Valida que la confirmación de contraseña coincida con la contraseña. */
export function passwordMatchValidator(passwordField = 'password'): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const pwd  = group.get(passwordField)?.value ?? '';
    const conf = group.get('password_confirmation')?.value ?? '';
    if (!pwd && !conf) return null;
    if (pwd && conf && pwd !== conf) {
      group.get('password_confirmation')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    const confCtrl = group.get('password_confirmation');
    if (confCtrl?.hasError('passwordMismatch')) {
      confCtrl.setErrors(null);
    }
    return null;
  };
}

/** Valida que la fecha no sea futura. */
export function notFutureDateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const val = control.value;
    if (!val) return null;
    const date = new Date(val);
    return date > new Date() ? { futureDate: true } : null;
  };
}

/** Valida que el valor sea un número positivo mayor que cero. */
export function positiveNumberValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const val = parseFloat(control.value);
    if (isNaN(val)) return null;
    return val > 0 ? null : { notPositive: true };
  };
}

// ── Mensajes de error centralizados ──────────────────────────────────────────

export function getErrorMessage(control: AbstractControl | null, label = 'Este campo'): string {
  if (!control || !control.errors) return '';

  const e = control.errors;

  if (e['required'])            return `${label} es obligatorio.`;
  if (e['email'])               return 'Ingresa un correo electrónico válido (ej. nombre@correo.com).';
  if (e['minlength'])           return `Mínimo ${e['minlength'].requiredLength} caracteres.`;
  if (e['maxlength'])           return `Máximo ${e['maxlength'].requiredLength} caracteres.`;
  if (e['min'])                 return `El valor mínimo permitido es ${e['min'].min}.`;
  if (e['max'])                 return `El valor máximo permitido es ${e['max'].max}.`;
  if (e['rfc'])                 return 'El RFC no tiene un formato válido (ej. XAXX010101000).';
  if (e['curp'])                return 'La CURP no tiene un formato válido.';
  if (e['curpLength'])          return 'La CURP debe tener exactamente 18 caracteres.';
  if (e['phone'])               return 'Ingresa un número de 10 dígitos sin espacios ni guiones.';
  if (e['postalCode'])          return 'El código postal debe tener 5 dígitos.';
  if (e['clabe'])               return 'La CLABE debe tener exactamente 18 dígitos numéricos.';
  if (e['onlyText'])            return 'Solo se permiten letras, sin números ni caracteres especiales.';
  if (e['injection'])           return 'El texto contiene caracteres o palabras no permitidos.';
  if (e['passwordMismatch'])    return 'Las contraseñas no coinciden.';
  if (e['futureDate'])          return 'La fecha no puede ser futura.';
  if (e['invalidDate'])         return 'La fecha ingresada no es válida.';
  if (e['notPositive'])         return 'El valor debe ser mayor que cero.';
  if (e['pattern'])             return `El formato de ${label.toLowerCase()} no es válido.`;
  if (e['minAge'])              return `Debes tener al menos ${e['minAge'].required} años. Edad actual: ${e['minAge'].actual} años.`;
  if (e['passwordTooShort'])    return 'La contraseña debe tener al menos 8 caracteres.';
  if (e['passwordNoUpper'])     return 'La contraseña debe incluir al menos una letra mayúscula.';
  if (e['passwordNoLower'])     return 'La contraseña debe incluir al menos una letra minúscula.';
  if (e['passwordNoNumber'])    return 'La contraseña debe incluir al menos un número.';
  if (e['passwordNoSpecial'])   return 'La contraseña debe incluir al menos un carácter especial (!@#$%...).';
  if (e['dateTooEarly'])        return `La fecha no puede ser anterior a ${e['dateTooEarly'].min}.`;
  if (e['dateTooLate'])         return `La fecha no puede ser posterior a ${e['dateTooLate'].max}.`;

  return 'Valor no válido.';
}
