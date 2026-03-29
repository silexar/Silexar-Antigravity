import { describe, it, expect, beforeEach } from 'vitest'
import { Contrato } from '../../../modules/contratos/domain/entities/Contrato.js'
import { EstadoContrato } from '../../../modules/contratos/domain/value-objects/EstadoContrato.js'
import { TotalesContrato } from '../../../modules/contratos/domain/value-objects/TotalesContrato.js'
import { NumeroContrato } from '../../../modules/contratos/domain/value-objects/NumeroContrato.js'
import { TasaComision } from '../../../modules/contratos/domain/value-objects/TasaComision.js'
import { TerminosPago } from '../../../modules/contratos/domain/value-objects/TerminosPago.js'
import { RiesgoCredito } from '../../../modules/contratos/domain/value-objects/RiesgoCredito.js'
import { MetricasRentabilidad } from '../../../modules/contratos/domain/value-objects/MetricasRentabilidad.js'

function makeFutureDate(daysFromNow: number): Date {
  const d = new Date()
  d.setDate(d.getDate() + daysFromNow)
  return d
}

function buildContratoProps(overrides: Partial<Parameters<typeof Contrato.create>[0]> = {}) {
  const totales = TotalesContrato.create(1_000_000, 10)
  const riesgoBajo = RiesgoCredito.create(800)
  return {
    numero: NumeroContrato.fromString('CON-2025-00001'),
    anuncianteId: 'anunc-1',
    anunciante: 'Empresa Test SA',
    rutAnunciante: '76.000.001-1',
    producto: 'Campaña Radio Verano',
    ejecutivoId: 'exec-1',
    ejecutivo: 'Juan Pérez',
    totales,
    moneda: 'CLP' as const,
    tasaComision: TasaComision.porcentaje(15),
    fechaInicio: makeFutureDate(1),
    fechaFin: makeFutureDate(30),
    estado: EstadoContrato.borrador(),
    prioridad: 'media' as const,
    tipoContrato: 'B' as const,
    terminosPago: TerminosPago.net30(),
    modalidadFacturacion: 'hitos' as const,
    tipoFactura: 'posterior' as const,
    esCanje: false,
    facturarComisionAgencia: false,
    riesgoCredito: riesgoBajo,
    metricas: MetricasRentabilidad.create({ margenBruto: 70, roi: 84, valorVida: 1_500_000, costoAdquisicion: 300_000 }),
    etapaActual: 'inicial',
    progreso: 10,
    proximaAccion: 'Revisar borrador',
    responsableActual: 'exec-1',
    fechaLimiteAccion: makeFutureDate(3),
    alertas: [],
    tags: [],
    creadoPor: 'exec-1',
    actualizadoPor: 'exec-1',
    ...overrides,
  }
}

describe('Contrato entity', () => {
  // ── create ─────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('should create a valid contrato', () => {
      const contrato = Contrato.create(buildContratoProps())
      expect(contrato.id).toBeDefined()
      expect(contrato.anunciante).toBe('Empresa Test SA')
      expect(contrato.estado.valor).toBe('borrador')
    })

    it('should auto-assign id, fechaCreacion, version=1', () => {
      const snap = Contrato.create(buildContratoProps()).toSnapshot()
      expect(snap.id).toMatch(/^cont_/)
      expect(snap.version).toBe(1)
      expect(snap.fechaCreacion).toBeInstanceOf(Date)
    })

    it('should throw when anunciante is empty', () => {
      expect(() =>
        Contrato.create(buildContratoProps({ anunciante: '' }))
      ).toThrow('Anunciante es requerido')
    })

    it('should throw when producto is empty', () => {
      expect(() =>
        Contrato.create(buildContratoProps({ producto: '' }))
      ).toThrow('Producto es requerido')
    })

    it('should throw when fechaFin is before fechaInicio', () => {
      expect(() =>
        Contrato.create(buildContratoProps({
          fechaInicio: makeFutureDate(10),
          fechaFin: makeFutureDate(5),
        }))
      ).toThrow('Fecha fin debe ser posterior')
    })

    it('should throw when facturarComisionAgencia=true without agenciaId', () => {
      expect(() =>
        Contrato.create(buildContratoProps({
          facturarComisionAgencia: true,
          agenciaId: undefined,
        }))
      ).toThrow('No se puede facturar comisión sin agencia')
    })
  })

  // ── Business rules: tipoContrato limits ────────────────────────────────────

  describe('contract type financial limits', () => {
    it('tipo C rejects valorNeto above $10M', () => {
      const bigTotales = TotalesContrato.create(15_000_000, 0)
      expect(() =>
        Contrato.create(buildContratoProps({ tipoContrato: 'C', totales: bigTotales }))
      ).toThrow('Valor excede límite para contrato tipo C')
    })

    it('tipo B accepts $10M (within $100M limit)', () => {
      const totales = TotalesContrato.create(10_000_000, 0)
      const contrato = Contrato.create(buildContratoProps({ tipoContrato: 'B', totales }))
      expect(contrato.id).toBeDefined()
    })

    it('tipo A accepts $200M (within $1B limit)', () => {
      const totales = TotalesContrato.create(200_000_000, 0)
      const contrato = Contrato.create(buildContratoProps({ tipoContrato: 'A', totales }))
      expect(contrato.id).toBeDefined()
    })

    it('tipo B rejects value over $100M', () => {
      const totales = TotalesContrato.create(150_000_000, 0)
      expect(() =>
        Contrato.create(buildContratoProps({ tipoContrato: 'B', totales }))
      ).toThrow('Valor excede límite para contrato tipo B')
    })
  })

  // ── High-risk payment terms ────────────────────────────────────────────────

  describe('riesgo alto + términos de pago', () => {
    it('should throw when riesgo=alto and terminosPago > 15 days', () => {
      const riesgoAlto = RiesgoCredito.create(500) // alto
      expect(() =>
        Contrato.create(buildContratoProps({
          riesgoCredito: riesgoAlto,
          terminosPago: TerminosPago.net30(),
        }))
      ).toThrow('Clientes de alto riesgo no pueden tener términos superiores a 15 días')
    })

    it('should accept riesgo=alto with 15-day terms', () => {
      const riesgoAlto = RiesgoCredito.create(500)
      const contrato = Contrato.create(buildContratoProps({
        riesgoCredito: riesgoAlto,
        terminosPago: TerminosPago.net15(),
      }))
      expect(contrato.id).toBeDefined()
    })
  })

  // ── State machine: actualizarEstado ───────────────────────────────────────

  describe('actualizarEstado', () => {
    it('borrador → revision succeeds', () => {
      const contrato = Contrato.create(buildContratoProps())
      contrato.actualizarEstado(EstadoContrato.revision(), 'exec-1')
      expect(contrato.estado.valor).toBe('revision')
    })

    it('borrador → activo throws InvalidStateTransition', () => {
      const contrato = Contrato.create(buildContratoProps())
      expect(() =>
        contrato.actualizarEstado(EstadoContrato.activo(), 'exec-1')
      ).toThrow('no permitida')
    })

    it('increments version on each transition', () => {
      const contrato = Contrato.create(buildContratoProps())
      const vBefore = contrato.toSnapshot().version
      contrato.actualizarEstado(EstadoContrato.revision(), 'exec-1')
      expect(contrato.toSnapshot().version).toBe(vBefore + 1)
    })

    it('updates progreso automatically on state change', () => {
      const contrato = Contrato.create(buildContratoProps())
      contrato.actualizarEstado(EstadoContrato.revision(), 'exec-1')
      expect(contrato.progreso).toBe(25)
    })

    it('progreso is 10 for borrador', () => {
      const contrato = Contrato.create(buildContratoProps())
      expect(contrato.progreso).toBe(10)
    })

    it('full happy path: borrador → revision → aprobacion → firmado → activo', () => {
      const contrato = Contrato.create(buildContratoProps())
      contrato.actualizarEstado(EstadoContrato.revision(), 'u1')
      contrato.actualizarEstado(EstadoContrato.aprobacion(), 'u1')
      contrato.actualizarEstado(EstadoContrato.firmado(), 'u1')
      contrato.actualizarEstado(EstadoContrato.activo(), 'u1')
      expect(contrato.estado.valor).toBe('activo')
      expect(contrato.progreso).toBe(90)
    })

    it('finalizado cannot be changed', () => {
      const contrato = Contrato.fromPersistence({
        ...buildContratoProps(),
        id: 'test-id',
        estado: EstadoContrato.finalizado(),
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
        version: 1,
      })
      expect(() =>
        contrato.actualizarEstado(EstadoContrato.activo(), 'u1')
      ).toThrow('no permitida')
    })
  })

  // ── actualizarTotales ─────────────────────────────────────────────────────

  describe('actualizarTotales', () => {
    it('updates totales within 50% limit', () => {
      const contrato = Contrato.create(buildContratoProps())
      const nuevos = TotalesContrato.create(1_200_000, 10)
      contrato.actualizarTotales(nuevos, 'exec-1')
      expect(contrato.totales.valorBruto).toBe(1_200_000)
    })

    it('throws when new amount exceeds 150% of current valorNeto', () => {
      const contrato = Contrato.create(buildContratoProps())
      const grandes = TotalesContrato.create(2_500_000, 0) // > 150% of 900k
      expect(() =>
        contrato.actualizarTotales(grandes, 'exec-1')
      ).toThrow('50%')
    })
  })

  // ── Alertas ────────────────────────────────────────────────────────────────

  describe('agregarAlerta / removerAlerta', () => {
    it('adds an alert', () => {
      const contrato = Contrato.create(buildContratoProps())
      contrato.agregarAlerta('Alerta de prueba')
      expect(contrato.alertas).toContain('Alerta de prueba')
    })

    it('does not duplicate the same alert', () => {
      const contrato = Contrato.create(buildContratoProps())
      contrato.agregarAlerta('Duplicada')
      contrato.agregarAlerta('Duplicada')
      expect(contrato.alertas.filter(a => a === 'Duplicada')).toHaveLength(1)
    })

    it('removes an alert', () => {
      const contrato = Contrato.create(buildContratoProps())
      contrato.agregarAlerta('Para eliminar')
      contrato.removerAlerta('Para eliminar')
      expect(contrato.alertas).not.toContain('Para eliminar')
    })
  })

  // ── riesgoCredito escalation ────────────────────────────────────────────────

  describe('actualizarRiesgoCredito', () => {
    it('adds alert when risk increases', () => {
      const contrato = Contrato.create(buildContratoProps()) // riesgo bajo
      const riesgoAlto = RiesgoCredito.create(500) // alto
      contrato.actualizarRiesgoCredito(riesgoAlto)
      expect(contrato.alertas.some(a => a.includes('Riesgo crediticio incrementado'))).toBe(true)
    })

    it('adds payment terms warning when riesgo=alto and terms > 15', () => {
      const contrato = Contrato.create(buildContratoProps())
      const riesgoAlto = RiesgoCredito.create(500)
      contrato.actualizarRiesgoCredito(riesgoAlto)
      expect(contrato.alertas.some(a => a.includes('incompatibles con riesgo alto'))).toBe(true)
    })
  })

  // ── Query methods ──────────────────────────────────────────────────────────

  describe('query methods', () => {
    it('puedeSerEditado returns true for borrador and revision', () => {
      const contrato = Contrato.create(buildContratoProps())
      expect(contrato.puedeSerEditado()).toBe(true)
    })

    it('puedeSerEditado returns false for activo', () => {
      const contrato = Contrato.fromPersistence({
        ...buildContratoProps(),
        id: 'test',
        estado: EstadoContrato.activo(),
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
        version: 1,
      })
      expect(contrato.puedeSerEditado()).toBe(false)
    })

    it('requiereAprobacion returns true when estado=aprobacion', () => {
      const contrato = Contrato.fromPersistence({
        ...buildContratoProps(),
        id: 'test',
        estado: EstadoContrato.aprobacion(),
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
        version: 1,
      })
      expect(contrato.requiereAprobacion()).toBe(true)
    })

    it('estaVencido returns false for future fechaFin', () => {
      const contrato = Contrato.create(buildContratoProps())
      expect(contrato.estaVencido()).toBe(false)
    })

    it('estaVencido returns true for past fechaFin', () => {
      const past = new Date(Date.now() - 1000 * 60 * 60 * 24 * 5)
      const contrato = Contrato.fromPersistence({
        ...buildContratoProps(),
        id: 'test',
        fechaInicio: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
        fechaFin: past,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
        version: 1,
      })
      expect(contrato.estaVencido()).toBe(true)
    })

    it('calcularDiasRestantes returns positive number for future date', () => {
      const contrato = Contrato.create(buildContratoProps())
      expect(contrato.calcularDiasRestantes()).toBeGreaterThan(0)
    })
  })

  // ── validarIntegridad ──────────────────────────────────────────────────────

  describe('validarIntegridad', () => {
    it('returns empty array for valid contrato', () => {
      const contrato = Contrato.create(buildContratoProps())
      expect(contrato.validarIntegridad()).toHaveLength(0)
    })
  })

  // ── avanzarWorkflow ────────────────────────────────────────────────────────

  describe('avanzarWorkflow', () => {
    it('sets proximaAccion and responsableActual', () => {
      const contrato = Contrato.create(buildContratoProps())
      contrato.avanzarWorkflow('gerente-1', 'Aprobar contrato')
      const snap = contrato.toSnapshot()
      expect(snap.proximaAccion).toBe('Aprobar contrato')
      expect(snap.responsableActual).toBe('gerente-1')
    })

    it('sets fechaLimiteAccion 3 days from now', () => {
      const contrato = Contrato.create(buildContratoProps())
      const before = Date.now()
      contrato.avanzarWorkflow('u1', 'accion')
      const snap = contrato.toSnapshot()
      const diff = snap.fechaLimiteAccion.getTime() - before
      const threeDays = 3 * 24 * 60 * 60 * 1000
      expect(diff).toBeGreaterThan(threeDays - 1000)
      expect(diff).toBeLessThan(threeDays + 5000)
    })
  })
})
