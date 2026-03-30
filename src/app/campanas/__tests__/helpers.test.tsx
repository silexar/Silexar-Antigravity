import { describe, it, expect } from 'vitest';
import { formatFecha, formatMoney, getEstadoBadge } from '../_lib/helpers';

describe('Campañas Helpers Logic', () => {

  describe('formatFecha', () => {
    it('formatea fechas válidas según locale es-CL', () => {
      const result = formatFecha('2025-01-25T15:30:00Z');
      expect(result).toMatch(/25/); 
      expect(result).toMatch(/01/); 
      expect(result).toMatch(/2025/); 
    });

    it('maneja fechas inválidas devolviendo un string fallback', () => {
      const result = formatFecha('invalid');
      // toLocaleDateString en fecha invalida retorna "Invalid Date"
      expect(result).toBe('Invalid Date');
    });
  });

  describe('formatMoney', () => {
    it('formatea montos mayores a un millón con sufijo M', () => {
      const result = formatMoney(1200500);
      expect(result).toBe('$1.2M');
    });

    it('formatea montos mayores a mil con sufijo K', () => {
      const result = formatMoney(450500);
      expect(result).toBe('$451K'); // 450.5 redondeado a 451
    });

    it('formatea montos menores a mil con separados de miles', () => {
      const result = formatMoney(500);
      expect(result).toBe('$500');
    });
  });

  describe('getEstadoBadge', () => {
    it('retorna clases correctas para estado ejecutando (green)', () => {
      const badge = getEstadoBadge('ejecutando');
      expect(badge.props.className).toContain('green');
      expect(badge.props.children).toContain('Ejecutando');
    });

    it('retorna clases correctas para estado conflictos (red)', () => {
      const badge = getEstadoBadge('conflictos');
      expect(badge.props.className).toContain('red');
      expect(badge.props.children).toContain('Conflictos');
    });

    it('retorna badge default (borrador, gray) para estados desconocidos', () => {
      const badge = getEstadoBadge('desconocido');
      expect(badge.props.className).toContain('gray');
      expect(badge.props.children).toContain('Borrador');
    });
  });

});
