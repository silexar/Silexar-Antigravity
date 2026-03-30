/**
 * Unit tests for Campana aggregate root
 * Tests business logic: state transitions, domain events, queries
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { Campana } from '../../modules/campanas/domain/entities/Campana';
import type { CampanaProps } from '../../modules/campanas/domain/entities/Campana';

const baseProps = (): CampanaProps => ({
  id: 'test-id-1',
  tenantId: 'tenant-1',
  numeroCampana: 'CAMP-2025-00001',
  nombre: 'Campaña Test',
  tipo: 'REPARTIDO',
  estado: 'BORRADOR',
  anuncianteId: 'anunciante-1',
  presupuesto: { monto: 100000, moneda: 'CLP' },
  fechaInicio: new Date('2025-01-01'),
  fechaFin: new Date('2025-12-31'),
  creadoPor: 'user-1',
  creadoEn: new Date('2025-01-01'),
  actualizadoEn: new Date('2025-01-01'),
});

describe('Campana entity', () => {
  describe('crear()', () => {
    it('should create a valid campaign and emit CAMPANA_CREADA event', () => {
      const campana = Campana.crear(baseProps());
      expect(campana.id).toBe('test-id-1');
      expect(campana.estado.esBorrador).toBe(true);

      const events = campana.tomarEventos();
      expect(events).toHaveLength(1);
      expect(events[0].tipo).toBe('CAMPANA_CREADA');
    });

    it('should throw if nombre is too short', () => {
      expect(() => Campana.crear({ ...baseProps(), nombre: 'AB' }))
        .toThrow('al menos 3 caracteres');
    });

    it('should throw if fechaInicio >= fechaFin', () => {
      expect(() => Campana.crear({
        ...baseProps(),
        fechaInicio: new Date('2025-12-31'),
        fechaFin: new Date('2025-01-01'),
      })).toThrow('fecha de inicio debe ser anterior');
    });

    it('should throw if id is empty', () => {
      expect(() => Campana.crear({ ...baseProps(), id: '' })).toThrow('ID de campaña es requerido');
    });

    it('should throw if tenantId is empty', () => {
      expect(() => Campana.crear({ ...baseProps(), tenantId: '' })).toThrow('Tenant ID es requerido');
    });

    it('should throw if anuncianteId is empty', () => {
      expect(() => Campana.crear({ ...baseProps(), anuncianteId: '' })).toThrow('Anunciante ID es requerido');
    });
  });

  describe('reconstituir()', () => {
    it('should reconstituir without emitting events', () => {
      const campana = Campana.reconstituir(baseProps());
      expect(campana.tomarEventos()).toHaveLength(0);
    });
  });

  describe('activar()', () => {
    it('should transition from BORRADOR to ACTIVA', () => {
      const campana = Campana.crear(baseProps());
      campana.tomarEventos(); // clear creation event
      campana.activar('admin-user');
      expect(campana.estado.estaActiva).toBe(true);

      const events = campana.tomarEventos();
      expect(events[0].tipo).toBe('CAMPANA_ACTIVADA');
    });

    it('should NOT allow activar from ACTIVA state', () => {
      const campana = Campana.reconstituir({ ...baseProps(), estado: 'ACTIVA' });
      expect(() => campana.activar('user')).toThrow('No se puede activar');
    });

    it('should NOT allow activar from FINALIZADA state', () => {
      const campana = Campana.reconstituir({ ...baseProps(), estado: 'FINALIZADA' });
      expect(() => campana.activar('user')).toThrow('No se puede activar');
    });
  });

  describe('pausar()', () => {
    it('should transition from ACTIVA to PAUSADA', () => {
      const campana = Campana.reconstituir({ ...baseProps(), estado: 'ACTIVA' });
      campana.pausar('Pausa técnica', 'admin-user');
      expect(campana.estado.estaPausada).toBe(true);

      const events = campana.tomarEventos();
      expect(events[0].tipo).toBe('CAMPANA_PAUSADA');
      expect(events[0].datos.motivo).toBe('Pausa técnica');
    });

    it('should NOT allow pausar from BORRADOR', () => {
      const campana = Campana.crear(baseProps());
      expect(() => campana.pausar('motivo', 'user')).toThrow('No se puede pausar');
    });
  });

  describe('finalizar()', () => {
    it('should transition from ACTIVA to FINALIZADA', () => {
      const campana = Campana.reconstituir({ ...baseProps(), estado: 'ACTIVA' });
      campana.finalizar('admin-user');
      expect(campana.estado.estaFinalizada).toBe(true);
    });

    it('should transition from PAUSADA to FINALIZADA', () => {
      const campana = Campana.reconstituir({ ...baseProps(), estado: 'PAUSADA' });
      campana.finalizar('admin-user');
      expect(campana.estado.estaFinalizada).toBe(true);
    });

    it('should NOT allow finalizar from FINALIZADA', () => {
      const campana = Campana.reconstituir({ ...baseProps(), estado: 'FINALIZADA' });
      expect(() => campana.finalizar('user')).toThrow('No se puede finalizar');
    });
  });

  describe('cancelar()', () => {
    it('should allow cancelar from BORRADOR', () => {
      const campana = Campana.crear(baseProps());
      campana.cancelar('Sin presupuesto', 'admin-user');
      expect(campana.estado.estaCancelada).toBe(true);
    });

    it('should NOT allow cancelar a FINALIZADA campaign', () => {
      const campana = Campana.reconstituir({ ...baseProps(), estado: 'FINALIZADA' });
      expect(() => campana.cancelar('motivo', 'user')).toThrow('No se puede cancelar');
    });

    it('should NOT allow cancelar an already CANCELADA campaign', () => {
      const campana = Campana.reconstituir({ ...baseProps(), estado: 'CANCELADA' });
      expect(() => campana.cancelar('motivo', 'user')).toThrow('No se puede cancelar');
    });
  });

  describe('actualizarNombre()', () => {
    it('should update nombre in BORRADOR state', () => {
      const campana = Campana.crear(baseProps());
      campana.actualizarNombre('Nuevo Nombre Test');
      expect(campana.nombre).toBe('Nuevo Nombre Test');
    });

    it('should update nombre in PAUSADA state', () => {
      const campana = Campana.reconstituir({ ...baseProps(), estado: 'PAUSADA' });
      campana.actualizarNombre('Nombre desde pausada');
      expect(campana.nombre).toBe('Nombre desde pausada');
    });

    it('should NOT allow update nombre in ACTIVA state', () => {
      const campana = Campana.reconstituir({ ...baseProps(), estado: 'ACTIVA' });
      expect(() => campana.actualizarNombre('Nuevo Nombre')).toThrow('Solo se puede modificar');
    });

    it('should reject nombres shorter than 3 chars', () => {
      const campana = Campana.crear(baseProps());
      expect(() => campana.actualizarNombre('AB')).toThrow('al menos 3 caracteres');
    });

    it('should trim the nombre', () => {
      const campana = Campana.crear(baseProps());
      campana.actualizarNombre('  Nombre Largo  ');
      expect(campana.nombre).toBe('Nombre Largo');
    });
  });

  describe('estaVigente()', () => {
    it('should return true when ACTIVA and within dates', () => {
      const now = new Date();
      const campana = Campana.reconstituir({
        ...baseProps(),
        estado: 'ACTIVA',
        fechaInicio: new Date(now.getTime() - 1000),
        fechaFin: new Date(now.getTime() + 86400000),
      });
      expect(campana.estaVigente()).toBe(true);
    });

    it('should return false when BORRADOR even within dates', () => {
      const now = new Date();
      const campana = Campana.reconstituir({
        ...baseProps(),
        estado: 'BORRADOR',
        fechaInicio: new Date(now.getTime() - 1000),
        fechaFin: new Date(now.getTime() + 86400000),
      });
      expect(campana.estaVigente()).toBe(false);
    });
  });

  describe('diasRestantes()', () => {
    it('should return 0 for FINALIZADA campaigns', () => {
      const campana = Campana.reconstituir({ ...baseProps(), estado: 'FINALIZADA' });
      expect(campana.diasRestantes()).toBe(0);
    });

    it('should return positive days for active future campaigns', () => {
      const fechaFin = new Date();
      fechaFin.setDate(fechaFin.getDate() + 10);
      const campana = Campana.reconstituir({
        ...baseProps(),
        estado: 'ACTIVA',
        fechaFin,
      });
      expect(campana.diasRestantes()).toBeGreaterThan(0);
      expect(campana.diasRestantes()).toBeLessThanOrEqual(10);
    });
  });

  describe('tomarEventos()', () => {
    it('should clear events after taking them', () => {
      const campana = Campana.crear(baseProps());
      expect(campana.tomarEventos()).toHaveLength(1);
      expect(campana.tomarEventos()).toHaveLength(0); // cleared
    });
  });
});
