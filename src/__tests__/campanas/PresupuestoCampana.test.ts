/**
 * Unit tests for PresupuestoCampana value object
 */
import { describe, it, expect } from 'vitest';
import { PresupuestoCampana } from '../../modules/campanas/domain/value-objects/PresupuestoCampana';

describe('PresupuestoCampana', () => {
  describe('crear()', () => {
    it('should create valid presupuesto with CLP', () => {
      expect(() => PresupuestoCampana.crear({ monto: 100000, moneda: 'CLP' })).not.toThrow();
    });

    it('should create valid presupuesto with USD and EUR', () => {
      expect(() => PresupuestoCampana.crear({ monto: 500, moneda: 'USD' })).not.toThrow();
      expect(() => PresupuestoCampana.crear({ monto: 500, moneda: 'EUR' })).not.toThrow();
    });

    it('should allow zero monto', () => {
      const p = PresupuestoCampana.crear({ monto: 0, moneda: 'CLP' });
      expect(p.esCero).toBe(true);
    });

    it('should reject negative monto', () => {
      expect(() => PresupuestoCampana.crear({ monto: -1, moneda: 'CLP' })).toThrow('negativo');
    });

    it('should reject monto exceeding maximum', () => {
      expect(() => PresupuestoCampana.crear({ monto: 2_000_000_000, moneda: 'CLP' })).toThrow('máximo');
    });

    it('should reject invalid moneda', () => {
      expect(() => PresupuestoCampana.crear({ monto: 100, moneda: 'MXN' as never })).toThrow('Moneda inválida');
    });
  });

  describe('esMayorQue()', () => {
    it('should return true when monto is greater', () => {
      const a = PresupuestoCampana.crear({ monto: 200, moneda: 'CLP' });
      const b = PresupuestoCampana.crear({ monto: 100, moneda: 'CLP' });
      expect(a.esMayorQue(b)).toBe(true);
    });

    it('should return false when monto is less', () => {
      const a = PresupuestoCampana.crear({ monto: 100, moneda: 'CLP' });
      const b = PresupuestoCampana.crear({ monto: 200, moneda: 'CLP' });
      expect(a.esMayorQue(b)).toBe(false);
    });

    it('should throw when comparing different currencies', () => {
      const a = PresupuestoCampana.crear({ monto: 100, moneda: 'CLP' });
      const b = PresupuestoCampana.crear({ monto: 100, moneda: 'USD' });
      expect(() => a.esMayorQue(b)).toThrow('distintas monedas');
    });
  });

  describe('equals()', () => {
    it('should return true for same monto and moneda', () => {
      const a = PresupuestoCampana.crear({ monto: 100, moneda: 'CLP' });
      const b = PresupuestoCampana.crear({ monto: 100, moneda: 'CLP' });
      expect(a.equals(b)).toBe(true);
    });

    it('should return false for different monto', () => {
      const a = PresupuestoCampana.crear({ monto: 100, moneda: 'CLP' });
      const b = PresupuestoCampana.crear({ monto: 200, moneda: 'CLP' });
      expect(a.equals(b)).toBe(false);
    });

    it('should return false for different moneda', () => {
      const a = PresupuestoCampana.crear({ monto: 100, moneda: 'CLP' });
      const b = PresupuestoCampana.crear({ monto: 100, moneda: 'USD' });
      expect(a.equals(b)).toBe(false);
    });
  });

  describe('getters', () => {
    it('should return correct monto and moneda', () => {
      const p = PresupuestoCampana.crear({ monto: 500000, moneda: 'CLP' });
      expect(p.monto).toBe(500000);
      expect(p.moneda).toBe('CLP');
    });
  });
});
