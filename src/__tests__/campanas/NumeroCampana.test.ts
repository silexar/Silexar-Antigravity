/**
 * Unit tests for NumeroCampana value object
 */
import { describe, it, expect } from 'vitest';
import { NumeroCampana } from '../../modules/campanas/domain/value-objects/NumeroCampana';

describe('NumeroCampana', () => {
  describe('crear()', () => {
    it('should accept valid format CAMP-YYYY-NNNNN', () => {
      expect(() => NumeroCampana.crear('CAMP-2025-00001')).not.toThrow();
      expect(() => NumeroCampana.crear('CAMP-2025-12345')).not.toThrow();
      expect(() => NumeroCampana.crear('CAMP-2040-99999')).not.toThrow();
    });

    it('should reject invalid formats', () => {
      expect(() => NumeroCampana.crear('CAMP-2025-1')).toThrow('Número de campaña inválido');
      expect(() => NumeroCampana.crear('CAM-2025-00001')).toThrow('Número de campaña inválido');
      expect(() => NumeroCampana.crear('CAMP-25-00001')).toThrow('Número de campaña inválido');
      expect(() => NumeroCampana.crear('')).toThrow('Número de campaña inválido');
      expect(() => NumeroCampana.crear('CAMP-2025-000001')).toThrow('Número de campaña inválido');
    });
  });

  describe('generar()', () => {
    it('should generate valid number from year and sequential', () => {
      const numero = NumeroCampana.generar(2025, 1);
      expect(numero.valor).toBe('CAMP-2025-00001');
    });

    it('should pad sequential with zeros to 5 digits', () => {
      expect(NumeroCampana.generar(2025, 42).valor).toBe('CAMP-2025-00042');
      expect(NumeroCampana.generar(2025, 99999).valor).toBe('CAMP-2025-99999');
    });

    it('should create a valid NumeroCampana that passes crear validation', () => {
      const generated = NumeroCampana.generar(2025, 1);
      expect(() => NumeroCampana.crear(generated.valor)).not.toThrow();
    });
  });

  describe('equals()', () => {
    it('should return true for equal numbers', () => {
      const a = NumeroCampana.crear('CAMP-2025-00001');
      const b = NumeroCampana.crear('CAMP-2025-00001');
      expect(a.equals(b)).toBe(true);
    });

    it('should return false for different numbers', () => {
      const a = NumeroCampana.crear('CAMP-2025-00001');
      const b = NumeroCampana.crear('CAMP-2025-00002');
      expect(a.equals(b)).toBe(false);
    });
  });

  describe('toString()', () => {
    it('should return the full number string', () => {
      expect(NumeroCampana.crear('CAMP-2025-00042').toString()).toBe('CAMP-2025-00042');
    });
  });
});
