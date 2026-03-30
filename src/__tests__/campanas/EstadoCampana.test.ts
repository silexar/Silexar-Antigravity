/**
 * Unit tests for EstadoCampana value object
 */
import { describe, it, expect } from 'vitest';
import { EstadoCampana } from '../../modules/campanas/domain/value-objects/EstadoCampana';

describe('EstadoCampana', () => {
  describe('crear()', () => {
    it('should create valid estados', () => {
      const valid = ['BORRADOR', 'ACTIVA', 'PAUSADA', 'FINALIZADA', 'CANCELADA'];
      for (const estado of valid) {
        expect(() => EstadoCampana.crear(estado)).not.toThrow();
      }
    });

    it('should throw for invalid estado', () => {
      expect(() => EstadoCampana.crear('INVALIDO')).toThrow('Estado de campaña inválido');
    });

    it('should throw for empty string', () => {
      expect(() => EstadoCampana.crear('')).toThrow();
    });
  });

  describe('factory methods', () => {
    it('borrador() should create BORRADOR state', () => {
      expect(EstadoCampana.borrador().valor).toBe('BORRADOR');
    });

    it('activa() should create ACTIVA state', () => {
      expect(EstadoCampana.activa().valor).toBe('ACTIVA');
    });

    it('pausada() should create PAUSADA state', () => {
      expect(EstadoCampana.pausada().valor).toBe('PAUSADA');
    });
  });

  describe('puedeTransicionarA()', () => {
    it('BORRADOR can transition to ACTIVA and CANCELADA', () => {
      const borrador = EstadoCampana.borrador();
      expect(borrador.puedeTransicionarA('ACTIVA')).toBe(true);
      expect(borrador.puedeTransicionarA('CANCELADA')).toBe(true);
    });

    it('BORRADOR cannot transition to PAUSADA or FINALIZADA', () => {
      const borrador = EstadoCampana.borrador();
      expect(borrador.puedeTransicionarA('PAUSADA')).toBe(false);
      expect(borrador.puedeTransicionarA('FINALIZADA')).toBe(false);
    });

    it('ACTIVA can transition to PAUSADA, FINALIZADA, CANCELADA', () => {
      const activa = EstadoCampana.activa();
      expect(activa.puedeTransicionarA('PAUSADA')).toBe(true);
      expect(activa.puedeTransicionarA('FINALIZADA')).toBe(true);
      expect(activa.puedeTransicionarA('CANCELADA')).toBe(true);
    });

    it('ACTIVA cannot transition to BORRADOR', () => {
      expect(EstadoCampana.activa().puedeTransicionarA('BORRADOR')).toBe(false);
    });

    it('FINALIZADA cannot transition to any state', () => {
      const finalizada = EstadoCampana.crear('FINALIZADA');
      expect(finalizada.puedeTransicionarA('ACTIVA')).toBe(false);
      expect(finalizada.puedeTransicionarA('BORRADOR')).toBe(false);
      expect(finalizada.puedeTransicionarA('CANCELADA')).toBe(false);
    });

    it('CANCELADA cannot transition to any state', () => {
      const cancelada = EstadoCampana.crear('CANCELADA');
      expect(cancelada.puedeTransicionarA('ACTIVA')).toBe(false);
      expect(cancelada.puedeTransicionarA('BORRADOR')).toBe(false);
    });

    it('PAUSADA can transition to ACTIVA', () => {
      const pausada = EstadoCampana.pausada();
      expect(pausada.puedeTransicionarA('ACTIVA')).toBe(true);
      expect(pausada.puedeTransicionarA('FINALIZADA')).toBe(true);
    });
  });

  describe('computed properties', () => {
    it('esBorrador should be true only for BORRADOR', () => {
      expect(EstadoCampana.borrador().esBorrador).toBe(true);
      expect(EstadoCampana.activa().esBorrador).toBe(false);
    });

    it('estaActiva should be true only for ACTIVA', () => {
      expect(EstadoCampana.activa().estaActiva).toBe(true);
      expect(EstadoCampana.borrador().estaActiva).toBe(false);
    });

    it('estaTerminada should be true for FINALIZADA and CANCELADA', () => {
      expect(EstadoCampana.crear('FINALIZADA').estaTerminada).toBe(true);
      expect(EstadoCampana.crear('CANCELADA').estaTerminada).toBe(true);
      expect(EstadoCampana.activa().estaTerminada).toBe(false);
      expect(EstadoCampana.borrador().estaTerminada).toBe(false);
    });
  });

  describe('equals()', () => {
    it('should return true for equal states', () => {
      expect(EstadoCampana.borrador().equals(EstadoCampana.borrador())).toBe(true);
    });

    it('should return false for different states', () => {
      expect(EstadoCampana.borrador().equals(EstadoCampana.activa())).toBe(false);
    });
  });

  describe('toString()', () => {
    it('should return the estado value', () => {
      expect(EstadoCampana.activa().toString()).toBe('ACTIVA');
    });
  });
});
