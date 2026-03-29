import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { calcularTiempoRestante } from '../_lib/components';

describe('Cuñas Components Logic: calcularTiempoRestante', () => {
  beforeEach(() => {
    // Fijar el tiempo actual a "2026-03-01T12:00:00.000Z" para que los tests sean determinísticos
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-01T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debería retornar formato en horas para emisiones futuras (> 1 hr)', () => {
    // Emisión a las 14:30 (2 horas y media después)
    const proxima = new Date('2026-03-01T14:30:00.000Z').toISOString();
    const result = calcularTiempoRestante(proxima);
    
    expect(result.texto).toMatch(/h/); // e.g., "2.5h" o similar según implementación
    expect(result).toHaveProperty('esInminente');
    expect(result).toHaveProperty('esCritico');
    expect(result.esCritico).toBe(false);
  });

  it('debería marcar como inminente emisiones menores a 1 hora', () => {
    // Emisión a las 12:45 (45 mins)
    const proxima = new Date('2026-03-01T12:45:00.000Z').toISOString();
    const result = calcularTiempoRestante(proxima);
    
    expect(result.esInminente).toBe(true);
    expect(result.esCritico).toBe(false);
    expect(result.texto).toMatch(/45m/); // Asumiendo formato de minutos
  });

  it('debería marcar como CRÍTICO emisiones menores a 15 minutos', () => {
    // Emisión a las 12:10 (10 mins)
    const proxima = new Date('2026-03-01T12:10:00.000Z').toISOString();
    const result = calcularTiempoRestante(proxima);
    
    expect(result.esInminente).toBe(true);
    expect(result.esCritico).toBe(true);
    expect(result.texto).toMatch(/10m/);
  });

  it('debería manejar emisiones que ya pasaron (negativas)', () => {
    // Emisión a las 11:30 (ya pasó)
    const proxima = new Date('2026-03-01T11:30:00.000Z').toISOString();
    const result = calcularTiempoRestante(proxima);
    
    expect(result.texto.toLowerCase()).toContain('emitida');
    // o el texto que la función retorne por defecto
  });
});
