/**
 * Unit tests for CampanaCommandHandler
 * Uses mocked repository to test application layer in isolation
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CampanaCommandHandler } from '../../modules/campanas/application/handlers/CampanaCommandHandler';
import type { ICampanaRepository } from '../../modules/campanas/domain/repositories/ICampanaRepository';
import { Campana } from '../../modules/campanas/domain/entities/Campana';

// Mock repository
const mockRepository: ICampanaRepository = {
  buscarPorId: vi.fn(),
  listar: vi.fn(),
  guardar: vi.fn(),
  actualizar: vi.fn(),
  existePorNumero: vi.fn(),
  obtenerSiguienteSecuencial: vi.fn(),
  listarProximasAVencer: vi.fn(),
  contarPorEstado: vi.fn(),
};

const createMockCampana = (estado: string = 'BORRADOR') =>
  Campana.reconstituir({
    id: 'test-id-1',
    tenantId: 'tenant-1',
    numeroCampana: 'CAMP-2025-00001',
    nombre: 'Campaña Test',
    tipo: 'REPARTIDO',
    estado: estado as never,
    anuncianteId: 'anunciante-1',
    presupuesto: { monto: 100000, moneda: 'CLP' },
    fechaInicio: new Date('2025-01-01'),
    fechaFin: new Date('2025-12-31'),
    creadoPor: 'user-1',
    creadoEn: new Date('2025-01-01'),
    actualizadoEn: new Date('2025-01-01'),
  });

describe('CampanaCommandHandler', () => {
  let handler: CampanaCommandHandler;

  beforeEach(() => {
    vi.clearAllMocks();
    handler = new CampanaCommandHandler(mockRepository);
  });

  describe('crearCampana()', () => {
    it('should create a new campaign and return id and numeroCampana', async () => {
      vi.mocked(mockRepository.obtenerSiguienteSecuencial).mockResolvedValue(1);
      vi.mocked(mockRepository.guardar).mockResolvedValue(undefined);

      const result = await handler.crearCampana({
        tenantId: 'tenant-1',
        nombre: 'Nueva Campaña',
        tipo: 'REPARTIDO',
        anuncianteId: 'anunciante-1',
        presupuesto: { monto: 50000, moneda: 'CLP' },
        fechaInicio: new Date('2025-06-01'),
        fechaFin: new Date('2025-12-31'),
        creadoPor: 'user-1',
      });

      expect(result.id).toBeDefined();
      expect(result.numeroCampana).toMatch(/^CAMP-\d{4}-\d{5}$/);
      expect(mockRepository.obtenerSiguienteSecuencial).toHaveBeenCalledWith('tenant-1', 2025);
      expect(mockRepository.guardar).toHaveBeenCalledOnce();
    });
  });

  describe('activarCampana()', () => {
    it('should activate a BORRADOR campaign', async () => {
      const campana = createMockCampana('BORRADOR');
      vi.mocked(mockRepository.buscarPorId).mockResolvedValue(campana);
      vi.mocked(mockRepository.actualizar).mockResolvedValue(undefined);

      await handler.activarCampana({ campanaId: 'test-id-1', tenantId: 'tenant-1', activadoPor: 'admin' });

      expect(mockRepository.actualizar).toHaveBeenCalledOnce();
    });

    it('should throw when campaign not found', async () => {
      vi.mocked(mockRepository.buscarPorId).mockResolvedValue(null);

      await expect(
        handler.activarCampana({ campanaId: 'nonexistent', tenantId: 'tenant-1', activadoPor: 'admin' })
      ).rejects.toThrow('Campaña no encontrada');
    });

    it('should throw when campaign is already ACTIVA', async () => {
      const campana = createMockCampana('ACTIVA');
      vi.mocked(mockRepository.buscarPorId).mockResolvedValue(campana);

      await expect(
        handler.activarCampana({ campanaId: 'test-id-1', tenantId: 'tenant-1', activadoPor: 'admin' })
      ).rejects.toThrow();
    });
  });

  describe('pausarCampana()', () => {
    it('should pause an ACTIVA campaign', async () => {
      const campana = createMockCampana('ACTIVA');
      vi.mocked(mockRepository.buscarPorId).mockResolvedValue(campana);
      vi.mocked(mockRepository.actualizar).mockResolvedValue(undefined);

      await handler.pausarCampana({ campanaId: 'test-id-1', tenantId: 'tenant-1', motivo: 'Revisión', pausadoPor: 'admin' });

      expect(mockRepository.actualizar).toHaveBeenCalledOnce();
    });
  });

  describe('cancelarCampana()', () => {
    it('should cancel a BORRADOR campaign', async () => {
      const campana = createMockCampana('BORRADOR');
      vi.mocked(mockRepository.buscarPorId).mockResolvedValue(campana);
      vi.mocked(mockRepository.actualizar).mockResolvedValue(undefined);

      await handler.cancelarCampana({ campanaId: 'test-id-1', tenantId: 'tenant-1', motivo: 'Sin fondos', canceladoPor: 'admin' });

      expect(mockRepository.actualizar).toHaveBeenCalledOnce();
    });
  });

  describe('listar()', () => {
    it('should delegate to repository with correct filters', async () => {
      const mockPaginada = { datos: [], total: 0, pagina: 0, tamanoPagina: 20, totalPaginas: 0 };
      vi.mocked(mockRepository.listar).mockResolvedValue(mockPaginada);

      const result = await handler.listar({
        tenantId: 'tenant-1',
        pagina: 0,
        tamanoPagina: 20,
      });

      expect(result).toEqual(mockPaginada);
      expect(mockRepository.listar).toHaveBeenCalledWith(
        expect.objectContaining({ tenantId: 'tenant-1' }),
        0,
        20,
      );
    });
  });

  describe('obtenerConteoEstados()', () => {
    it('should return count per estado', async () => {
      const mockConteo = { BORRADOR: 5, ACTIVA: 3, PAUSADA: 1, FINALIZADA: 10, CANCELADA: 2 };
      vi.mocked(mockRepository.contarPorEstado).mockResolvedValue(mockConteo);

      const result = await handler.obtenerConteoEstados({ tenantId: 'tenant-1' });
      expect(result.ACTIVA).toBe(3);
      expect(result.BORRADOR).toBe(5);
    });
  });
});
