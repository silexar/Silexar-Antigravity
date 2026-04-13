/**
 * Utilidades de validación para el sistema SILEXAR PULSE
 * Incluye validación de email, RUT chileno y formatos de moneda
 */

// ═══════════════════════════════════════════════════════════════
// VALIDACIÓN DE EMAIL
// ═══════════════════════════════════════════════════════════════

/**
 * Valida si un email tiene formato correcto
 * @param email - Email a validar
 * @returns boolean indicando si el email es válido
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  
  const trimmed = email.trim();
  
  // Rechazar emails con puntos consecutivos
  if (trimmed.includes('..')) return false;
  
  // Regex para validación de email
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  return emailRegex.test(trimmed);
}

/**
 * Obtiene el dominio de un email
 * @param email - Email del cual extraer el dominio
 * @returns string con el dominio o null si es inválido
 */
export function getEmailDomain(email: string): string | null {
  if (!isValidEmail(email)) return null;
  const parts = email.split('@');
  return (parts[1] || null)?.toLowerCase() || null;
}

// ═══════════════════════════════════════════════════════════════
// VALIDACIÓN DE RUT CHILENO
// ═══════════════════════════════════════════════════════════════

/**
 * Calcula el dígito verificador de un RUT chileno
 * @param rut - Número del RUT sin dígito verificador ni puntos
 * @returns string con el dígito verificador (0-9 o K)
 */
export function calculateRutDigit(rut: string): string {
  let sum = 0;
  let multiplier = 2;
  
  // Recorremos el RUT de derecha a izquierda
  for (let i = rut.length - 1; i >= 0; i--) {
    sum += parseInt(rut[i], 10) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  
  const remainder = sum % 11;
  const digit = 11 - remainder;
  
  if (digit === 11) return '0';
  if (digit === 10) return 'K';
  if (digit === 11) return '0';
  return digit.toString();
}

/**
 * Limpia un RUT dejando solo números y K/k
 * @param rut - RUT con formato (puntos, guión)
 * @returns string limpio (solo números y K)
 */
export function cleanRut(rut: string): string {
  return rut.replace(/[^0-9kK]/g, '').toUpperCase();
}

/**
 * Formatea un RUT chileno con puntos y guión
 * @param rut - RUT limpio o con formato parcial
 * @returns string formateado (XX.XXX.XXX-X) o null si es inválido
 */
export function formatRut(rut: string): string | null {
  const clean = cleanRut(rut);
  if (clean.length < 2) return null;
  
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  
  // Formatear con puntos cada 3 dígitos desde la derecha
  const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  return `${formattedBody}-${dv}`;
}

/**
 * Valida si un RUT chileno es válido
 * @param rut - RUT a validar (puede tener puntos, guión o estar limpio)
 * @returns boolean indicando si el RUT es válido
 */
export function isValidRut(rut: string): boolean {
  if (!rut || typeof rut !== 'string') return false;
  
  const clean = cleanRut(rut);
  
  // Debe tener al menos 2 caracteres (número + DV)
  if (clean.length < 2) return false;
  
  // No puede tener más de 9 caracteres (8 números + 1 DV)
  if (clean.length > 9) return false;
  
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  
  // El cuerpo debe ser numérico
  if (!/^\d+$/.test(body)) return false;
  
  // El DV debe ser número o K
  if (!/^[0-9K]$/.test(dv)) return false;
  
  // Validar que el cuerpo no sea 0
  if (parseInt(body, 10) === 0) return false;
  
  // Calcular y comparar dígito verificador
  const calculatedDV = calculateRutDigit(body);
  
  return calculatedDV === dv;
}

/**
 * Obtiene solo el número del RUT sin dígito verificador
 * @param rut - RUT completo
 * @returns number con el RUT sin DV o null si es inválido
 */
export function getRutNumber(rut: string): number | null {
  if (!isValidRut(rut)) return null;
  const clean = cleanRut(rut);
  const body = clean.slice(0, -1);
  return parseInt(body, 10);
}

// ═══════════════════════════════════════════════════════════════
// FORMATOS DE MONEDA
// ═══════════════════════════════════════════════════════════════

export interface CurrencyFormatOptions {
  currency?: 'CLP' | 'USD' | 'EUR' | 'MXN' | 'ARS';
  locale?: string;
  decimals?: number;
  showSymbol?: boolean;
}

/**
 * Formatea un número como moneda
 * @param value - Valor a formatear (número o string)
 * @param options - Opciones de formato
 * @returns string formateado como moneda
 */
export function formatCurrency(
  value: number | string,
  options: CurrencyFormatOptions = {}
): string {
  const {
    currency = 'CLP',
    locale = 'es-CL',
    decimals = 0,
    showSymbol = true,
  } = options;
  
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num)) {
    return showSymbol ? getCurrencySymbol(currency) + '0' : '0';
  }
  
  const formatter = new Intl.NumberFormat(locale, {
    style: showSymbol ? 'currency' : 'decimal',
    currency: currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  
  return formatter.format(num);
}

/**
 * Obtiene el símbolo de una moneda
 * @param currency - Código de moneda
 * @returns string con el símbolo
 */
export function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    CLP: '$',
    USD: 'US$',
    EUR: '€',
    MXN: 'MX$',
    ARS: 'AR$',
    GBP: '£',
    JPY: '¥',
  };
  
  return symbols[currency] || '$';
}

/**
 * Parsea un string de moneda a número
 * @param value - String con formato de moneda
 * @returns number parseado o NaN si es inválido
 */
export function parseCurrency(value: string): number {
  if (!value || typeof value !== 'string') return NaN;
  
  // Remover símbolos de moneda, puntos de miles y espacios
  const clean = value
    .replace(/[$€¥£]/g, '')
    .replace(/US|MX|AR/g, '')
    .replace(/\./g, '')
    .replace(/\s/g, '')
    .replace(',', '.');
  
  return parseFloat(clean);
}

/**
 * Formatea un número como porcentaje
 * @param value - Valor decimal (0.15 = 15%)
 * @param decimals - Número de decimales
 * @returns string formateado como porcentaje
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Formatea un número compacto (K, M, B)
 * @param value - Número a formatear
 * @returns string formateado de forma compacta
 */
export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat('es-CL', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

// ═══════════════════════════════════════════════════════════════
// VALIDACIONES ADICIONALES
// ═══════════════════════════════════════════════════════════════

/**
 * Valida si un string es un número de teléfono chileno válido
 * @param phone - Número de teléfono a validar
 * @returns boolean indicando si es válido
 */
export function isValidChileanPhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false;
  
  // Limpiar el número
  const clean = phone.replace(/\s/g, '').replace(/^\+56/, '').replace(/^0/, '');
  
  // Debe tener 9 dígitos (formato chileno: 9XXXXYYYY)
  const phoneRegex = /^9\d{8}$/;
  
  return phoneRegex.test(clean);
}

/**
 * Valida la fortaleza de una contraseña
 * @param password - Contraseña a validar
 * @returns objeto con el resultado de la validación
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  score: number; // 0-4
  errors: string[];
} {
  const errors: string[] = [];
  let score = 0;
  
  if (!password || password.length < 8) {
    errors.push('La contraseña debe tener al menos 8 caracteres');
  } else {
    score++;
  }
  
  if (password.length >= 12) {
    score++;
  }
  
  if (/[A-Z]/.test(password)) {
    score++;
  } else {
    errors.push('Debe contener al menos una mayúscula');
  }
  
  if (/[0-9]/.test(password)) {
    score++;
  } else {
    errors.push('Debe contener al menos un número');
  }
  
  if (/[^A-Za-z0-9]/.test(password)) {
    score++;
  } else {
    errors.push('Debe contener al menos un carácter especial');
  }
  
  return {
    isValid: errors.length === 0,
    score: Math.min(score, 4),
    errors,
  };
}
