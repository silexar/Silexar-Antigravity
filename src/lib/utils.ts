import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '$0';
  const formatter = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  // es-CL coloca el signo negativo entre $ y el número ('$-1.000')
  // Normalizamos al formato estándar '-$1.000'
  if (num < 0) return '-' + formatter.format(-num);
  return formatter.format(num);
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  // Extraer solo la parte de fecha (maneja ISO 'YYYY-MM-DD' y datetime 'YYYY-MM-DDTxx:xx')
  // Evita problemas de zona horaria y diferencias de separador según locale en Node.js
  const datePart = dateString.split('T')[0];
  const parts = datePart.split('-');
  if (parts.length !== 3) return 'Invalid Date';
  const [year, month, day] = parts;
  if (!year || !month || !day || isNaN(Number(year)) || isNaN(Number(month)) || isNaN(Number(day))) {
    return 'Invalid Date';
  }
  return `${day}/${month}/${year}`;
}
