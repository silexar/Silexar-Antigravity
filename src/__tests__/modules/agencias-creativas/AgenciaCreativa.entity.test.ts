import { describe, it, expect } from 'vitest'
import { AgenciaCreativa } from '../../../modules/agencias-creativas/domain/entities/AgenciaCreativa.js'
import { RutAgenciaCreativa } from '../../../modules/agencias-creativas/domain/value-objects/RutAgenciaCreativa.js'
import { TipoAgenciaCreativa } from '../../../modules/agencias-creativas/domain/value-objects/TipoAgenciaCreativa.js'
import { EspecializacionCreativa } from '../../../modules/agencias-creativas/domain/value-objects/EspecializacionCreativa.js'
import { NivelExperiencia } from '../../../modules/agencias-creativas/domain/value-objects/NivelExperiencia.js'
import { ScoreCreativo } from '../../../modules/agencias-creativas/domain/value-objects/ScoreCreativo.js'
import { EstadoDisponibilidad } from '../../../modules/agencias-creativas/domain/value-objects/EstadoDisponibilidad.js'
import { RangoPresupuesto } from '../../../modules/agencias-creativas/domain/value-objects/RangoPresupuesto.js'

// Use a hardcoded valid empresa RUT (76543210-3, verified modulo-11)
const validRut = new RutAgenciaCreativa('76543210-3')

function buildProps(overrides: Partial<Parameters<typeof AgenciaCreativa.create>[0]> = {}) {
  return {
    nombre: 'Agencia Creativa Test',
    razonSocial: 'Test SpA',
    rut: validRut,
    email: 'contacto@agencia.cl',
    telefono: '+56912345678',
    tipo: new TipoAgenciaCreativa('FULL_SERVICE'),
    especializaciones: [new EspecializacionCreativa('BRANDING')],
    nivelExperiencia: new NivelExperiencia(8),
    rangoPresupuesto: new RangoPresupuesto('MEDIANO'),
    direccion: 'Av. Providencia 123',
    ciudad: 'Santiago',
    region: 'RM',
    pais: 'Chile',
    scoreCreativo: ScoreCreativo.fromNumber(750),
    estadoDisponibilidad: new EstadoDisponibilidad('DISPONIBLE'),
    metricas: {
      proyectosCompletados: 10,
      proyectosActivos: 2,
      promedioCalidad: 8.5,
      puntualidadEntregas: 90,
      tiempoRespuesta: 24,
      satisfaccionClientes: 9.0,
      volumenFacturado: 50_000_000,
      crecimientoAnual: 15,
    },
    capacidadesTecnicas: {
      video4K: true,
      audioHD: true,
      motionGraphics: true,
      colorGrading: false,
      animacion3D: false,
      liveAction: true,
      postProduccion: true,
      efectosEspeciales: false,
      realidadAumentada: false,
      realidadVirtual: false,
    },
    certificaciones: [],
    premios: [],
    añosExperiencia: 8,
    numeroEmpleados: 15,
    clientesPrincipales: ['Cliente A', 'Cliente B'],
    sectoresExperiencia: ['Retail', 'Servicios'],
    configuracion: {
      tiempoRespuestaPromedio: 24,
      metodologiaTrabajo: ['Agile', 'Design Thinking'],
      herramientasColaboracion: ['Slack', 'Figma'],
      formatosEntrega: ['MP4', 'PSD', 'AI'],
      politicasRevision: {
        numeroRevisionesIncluidas: 2,
        tiempoRevision: 48,
        costoRevisionAdicional: 100_000,
      },
    },
    activo: true,
    fechaUltimaActividad: new Date(),
    fechaRegistro: new Date(),
    tenantId: 'tenant-test-1',
    creadoPor: 'user-1',
    ...overrides,
  }
}

describe('AgenciaCreativa entity', () => {
  // ── create ─────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('creates entity with generated id', () => {
      const a = AgenciaCreativa.create(buildProps())
      expect(a.id).toBeDefined()
      expect(a.id.length).toBeGreaterThan(0)
    })

    it('exposes correct nombre', () => {
      const a = AgenciaCreativa.create(buildProps())
      expect(a.nombre).toBe('Agencia Creativa Test')
    })

    it('exposes correct scoreCreativo', () => {
      const a = AgenciaCreativa.create(buildProps())
      expect(a.scoreCreativo.value).toBe(750)
    })

    it('is active by default', () => {
      const a = AgenciaCreativa.create(buildProps())
      expect(a.activo).toBe(true)
    })

    it('throws when nombre is empty', () => {
      expect(() =>
        AgenciaCreativa.create(buildProps({ nombre: '' }))
      ).toThrow('nombre')
    })

    it('throws when email is missing', () => {
      expect(() =>
        AgenciaCreativa.create(buildProps({ email: '' }))
      ).toThrow('email')
    })

    it('throws when especializaciones is empty', () => {
      expect(() =>
        AgenciaCreativa.create(buildProps({ especializaciones: [] }))
      ).toThrow('especialización')
    })

    it('throws when tenantId is missing', () => {
      expect(() =>
        AgenciaCreativa.create(buildProps({ tenantId: '' }))
      ).toThrow('tenantId')
    })

    it('throws when creadoPor is missing', () => {
      expect(() =>
        AgenciaCreativa.create(buildProps({ creadoPor: '' }))
      ).toThrow('creadoPor')
    })
  })

  // ── actualizarScoreCreativo ────────────────────────────────────────────────

  describe('actualizarScoreCreativo', () => {
    it('updates scoreCreativo to new value', () => {
      const a = AgenciaCreativa.create(buildProps())
      a.actualizarScoreCreativo(900, ['+excelente_calidad', '-tiempo_respuesta'])
      expect(a.scoreCreativo.value).toBe(900)
    })

    it('updates cortexAnalysis fortalezas from + prefixed factors', () => {
      const a = AgenciaCreativa.create(buildProps())
      a.actualizarScoreCreativo(800, ['+innovacion', '+calidad'])
      const props = a.getProps()
      expect(props.cortexAnalysis?.fortalezas).toContain('innovacion')
    })

    it('updates cortexAnalysis areasOptimizacion from - prefixed factors', () => {
      const a = AgenciaCreativa.create(buildProps())
      a.actualizarScoreCreativo(700, ['-puntualidad'])
      const props = a.getProps()
      expect(props.cortexAnalysis?.areasOptimizacion).toContain('puntualidad')
    })
  })

  // ── actualizarDisponibilidad ──────────────────────────────────────────────

  describe('actualizarDisponibilidad', () => {
    it('updates estadoDisponibilidad', () => {
      const a = AgenciaCreativa.create(buildProps())
      a.actualizarDisponibilidad(new EstadoDisponibilidad('OCUPADO'))
      expect(a.estadoDisponibilidad.value).toBe('OCUPADO')
    })

    it('sets fechaUltimaActividad to now', () => {
      const before = Date.now()
      const a = AgenciaCreativa.create(buildProps())
      a.actualizarDisponibilidad(new EstadoDisponibilidad('PARCIALMENTE_DISPONIBLE'))
      expect(a.getProps().fechaUltimaActividad.getTime()).toBeGreaterThanOrEqual(before)
    })
  })

  // ── registrarProyectoCompletado ────────────────────────────────────────────

  describe('registrarProyectoCompletado', () => {
    it('increments proyectosCompletados', () => {
      const a = AgenciaCreativa.create(buildProps())
      const prev = a.metricas.proyectosCompletados
      a.registrarProyectoCompletado(9, true, 9.5)
      expect(a.metricas.proyectosCompletados).toBe(prev + 1)
    })

    it('decrements proyectosActivos', () => {
      const a = AgenciaCreativa.create(buildProps({ metricas: { ...buildProps().metricas, proyectosActivos: 3 } }))
      a.registrarProyectoCompletado(8, true, 8.5)
      expect(a.metricas.proyectosActivos).toBe(2)
    })

    it('proyectosActivos does not go below 0', () => {
      const a = AgenciaCreativa.create(buildProps({ metricas: { ...buildProps().metricas, proyectosActivos: 0 } }))
      a.registrarProyectoCompletado(7, false, 7.0)
      expect(a.metricas.proyectosActivos).toBe(0)
    })

    it('recalculates promedioCalidad as running average', () => {
      const a = AgenciaCreativa.create(buildProps({
        metricas: { ...buildProps().metricas, proyectosCompletados: 0, promedioCalidad: 0 },
      }))
      a.registrarProyectoCompletado(8, true, 9)
      a.registrarProyectoCompletado(10, true, 9)
      expect(a.metricas.promedioCalidad).toBeCloseTo(9, 0)
    })

    it('updates puntualidad to 100 when puntual=true for first project', () => {
      const a = AgenciaCreativa.create(buildProps({
        metricas: { ...buildProps().metricas, proyectosCompletados: 0, puntualidadEntregas: 0 },
      }))
      a.registrarProyectoCompletado(9, true, 9)
      expect(a.metricas.puntualidadEntregas).toBe(100)
    })
  })

  // ── asignarProyecto ────────────────────────────────────────────────────────

  describe('asignarProyecto', () => {
    it('increments proyectosActivos', () => {
      const a = AgenciaCreativa.create(buildProps())
      const prev = a.metricas.proyectosActivos
      a.asignarProyecto()
      expect(a.metricas.proyectosActivos).toBe(prev + 1)
    })

    it('sets estadoDisponibilidad to NO_DISPONIBLE when at 90%+ capacity', () => {
      // 15 empleados / 3 = 5 max projects. 90% = 4.5 → need 5 projects
      const a = AgenciaCreativa.create(buildProps({
        metricas: { ...buildProps().metricas, proyectosActivos: 4 },
      }))
      a.asignarProyecto() // now 5 = 100%
      expect(a.estadoDisponibilidad.value).toBe('NO_DISPONIBLE')
    })
  })

  // ── puedeRealizarProyecto ──────────────────────────────────────────────────

  describe('puedeRealizarProyecto', () => {
    it('returns true when available, specialized, and within budget', () => {
      const a = AgenciaCreativa.create(buildProps())
      // BRANDING is in especializaciones, MEDIANO handles 2M-10M
      expect(a.puedeRealizarProyecto('branding', 5_000_000)).toBe(true)
    })

    it('returns false when not specialized', () => {
      const a = AgenciaCreativa.create(buildProps())
      expect(a.puedeRealizarProyecto('animacion_3d', 5_000_000)).toBe(false)
    })

    it('returns false when inactive', () => {
      const a = AgenciaCreativa.create(buildProps({ activo: false }))
      expect(a.puedeRealizarProyecto('branding', 5_000_000)).toBe(false)
    })

    it('returns false when NO_DISPONIBLE', () => {
      const a = AgenciaCreativa.create(buildProps({
        estadoDisponibilidad: new EstadoDisponibilidad('NO_DISPONIBLE'),
      }))
      expect(a.puedeRealizarProyecto('branding', 5_000_000)).toBe(false)
    })
  })

  // ── getMatchingScore ───────────────────────────────────────────────────────

  describe('getMatchingScore', () => {
    it('returns score between 0 and 100', () => {
      const a = AgenciaCreativa.create(buildProps())
      const score = a.getMatchingScore('branding', 5_000_000, 'media')
      expect(score).toBeGreaterThanOrEqual(0)
      expect(score).toBeLessThanOrEqual(100)
    })

    it('gets max score (100) for perfectly matching profile', () => {
      const a = AgenciaCreativa.create(buildProps({
        metricas: {
          ...buildProps().metricas,
          promedioCalidad: 10,
          puntualidadEntregas: 100,
        },
        estadoDisponibilidad: new EstadoDisponibilidad('DISPONIBLE'),
      }))
      const score = a.getMatchingScore('branding', 5_000_000, 'baja')
      // Max: 40 (especialización) + 25 (calidad) + 20 (puntualidad) + 10 (disponibilidad) + 5 (presupuesto) = 100
      expect(score).toBe(100)
    })

    it('returns lower score when not specialized', () => {
      const a = AgenciaCreativa.create(buildProps())
      const noMatch = a.getMatchingScore('animacion_3d', 5_000_000, 'media')
      const match = a.getMatchingScore('branding', 5_000_000, 'media')
      expect(noMatch).toBeLessThan(match)
    })

    it('penalizes 30% when urgencia=critica and estado=OCUPADO', () => {
      const a = AgenciaCreativa.create(buildProps({
        estadoDisponibilidad: new EstadoDisponibilidad('OCUPADO'),
        metricas: { ...buildProps().metricas, promedioCalidad: 10, puntualidadEntregas: 100 },
      }))
      const critica = a.getMatchingScore('branding', 5_000_000, 'critica')
      const media = a.getMatchingScore('branding', 5_000_000, 'media')
      expect(critica).toBeLessThan(media)
    })
  })

  // ── desactivar / activar ───────────────────────────────────────────────────

  describe('desactivar / activar', () => {
    it('desactivar sets activo=false', () => {
      const a = AgenciaCreativa.create(buildProps())
      a.desactivar('Sin actividad')
      expect(a.activo).toBe(false)
    })

    it('activar sets activo=true', () => {
      const a = AgenciaCreativa.create(buildProps({ activo: false }))
      a.activar()
      expect(a.activo).toBe(true)
    })
  })

  // ── añadirCertificacion ────────────────────────────────────────────────────

  describe('añadirCertificacion', () => {
    it('adds certification to the list', () => {
      const a = AgenciaCreativa.create(buildProps())
      a.añadirCertificacion('ISO 9001')
      expect(a.getProps().certificaciones).toContain('ISO 9001')
    })

    it('does not duplicate the same certification', () => {
      const a = AgenciaCreativa.create(buildProps())
      a.añadirCertificacion('ISO 9001')
      a.añadirCertificacion('ISO 9001')
      expect(a.getProps().certificaciones.filter(c => c === 'ISO 9001')).toHaveLength(1)
    })
  })

  // ── RutAgenciaCreativa ─────────────────────────────────────────────────────

  describe('RutAgenciaCreativa validation', () => {
    // Use hardcoded valid empresa RUT (76543210-3) since generateRandom() has a known bug
    const testRut = new RutAgenciaCreativa('76543210-3')

    it('isValid returns true for a valid RUT string', () => {
      expect(RutAgenciaCreativa.isValid(testRut.value)).toBe(true)
    })

    it('isValid returns false for invalid RUT', () => {
      expect(RutAgenciaCreativa.isValid('76543210-9')).toBe(false)
    })

    it('isEmpresa returns true for numero >= 50000000', () => {
      expect(testRut.isEmpresa()).toBe(true)
    })

    it('getTipoContribuyente returns EMPRESA or GRAN_EMPRESA for empresa RUT', () => {
      const tipo = testRut.getTipoContribuyente()
      expect(['EMPRESA', 'GRAN_EMPRESA']).toContain(tipo)
    })

    it('formatted includes hyphen separator', () => {
      expect(testRut.formatted).toContain('-')
    })

    it('throws when RUT number is below minimum range', () => {
      expect(() => new RutAgenciaCreativa('999999-9')).toThrow()
    })

    it('equals returns true for same RUT', () => {
      const rutStr = testRut.value
      const a = RutAgenciaCreativa.fromString(rutStr)
      const b = RutAgenciaCreativa.fromString(rutStr)
      expect(a.equals(b)).toBe(true)
    })
  })
})
