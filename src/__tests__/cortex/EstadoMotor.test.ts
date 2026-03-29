/**
 * Unit tests for EstadoMotor value object (Cortex module)
 */
import { describe, it, expect } from 'vitest';
import { EstadoMotor } from '../../modules/cortex/domain/value-objects/EstadoMotor';

describe('EstadoMotor', () => {
  describe('crear()', () => {
    it('should create valid estados', () => {
      const valid = ['INICIALIZANDO', 'ACTIVO', 'DEGRADADO', 'DETENIDO', 'ERROR'];
      for (const estado of valid) {
        expect(() => EstadoMotor.crear(estado)).not.toThrow();
      }
    });

    it('should throw for invalid estado', () => {
      expect(() => EstadoMotor.crear('INVALIDO')).toThrow('Estado de motor inválido');
    });
  });

  describe('transitions', () => {
    it('INICIALIZANDO can go to ACTIVO or ERROR', () => {
      const s = EstadoMotor.inicializando();
      expect(s.puedeTransicionarA('ACTIVO')).toBe(true);
      expect(s.puedeTransicionarA('ERROR')).toBe(true);
      expect(s.puedeTransicionarA('DETENIDO')).toBe(false);
    });

    it('ACTIVO can go to DEGRADADO, DETENIDO, ERROR', () => {
      const s = EstadoMotor.activo();
      expect(s.puedeTransicionarA('DEGRADADO')).toBe(true);
      expect(s.puedeTransicionarA('DETENIDO')).toBe(true);
      expect(s.puedeTransicionarA('ERROR')).toBe(true);
    });

    it('DETENIDO can only go to INICIALIZANDO', () => {
      const s = EstadoMotor.detenido();
      expect(s.puedeTransicionarA('INICIALIZANDO')).toBe(true);
      expect(s.puedeTransicionarA('ACTIVO')).toBe(false);
    });
  });

  describe('computed properties', () => {
    it('estaOperacional is true for ACTIVO and DEGRADADO', () => {
      expect(EstadoMotor.activo().estaOperacional).toBe(true);
      expect(EstadoMotor.crear('DEGRADADO').estaOperacional).toBe(true);
      expect(EstadoMotor.detenido().estaOperacional).toBe(false);
    });

    it('tieneError is true only for ERROR', () => {
      expect(EstadoMotor.crear('ERROR').tieneError).toBe(true);
      expect(EstadoMotor.activo().tieneError).toBe(false);
    });
  });
});
