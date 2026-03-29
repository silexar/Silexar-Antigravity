/**
 * SERVICE: COMPLIANCE VALIDATION - TIER 0 ENTERPRISE
 *
 * @description Validación de compliance comercial: límites de cupos,
 * restricciones horarias, requisitos regulatorios.
 *
 * @version 2025.3.0
 * @tier TIER_0_FORTUNE_10
 */

export interface ComplianceRule {
  id: string
  nombre: string
  tipo: 'obligatorio' | 'recomendado'
  descripcion: string
}

export interface ComplianceResult {
  cumple: boolean
  reglasCumplidas: ComplianceRule[]
  reglasVioladas: ComplianceRule[]
  advertencias: string[]
  score: number  // 0-100
}

export class ComplianceValidationService {
  private readonly reglas: ComplianceRule[] = [
    { id: 'R001', nombre: 'Límite cupos por programa', tipo: 'obligatorio', descripcion: 'No exceder capacidad máxima de cupos por tipo' },
    { id: 'R002', nombre: 'Vigencia de contrato', tipo: 'obligatorio', descripcion: 'El período del auspicio debe estar dentro de la vigencia del contrato' },
    { id: 'R003', nombre: 'Autorización ejecutivo', tipo: 'obligatorio', descripcion: 'Solo ejecutivos autorizados pueden asignar cupos' },
    { id: 'R004', nombre: 'Precio mínimo', tipo: 'obligatorio', descripcion: 'El valor no puede ser inferior al precio mínimo establecido' },
    { id: 'R005', nombre: 'Exclusividad rubro', tipo: 'obligatorio', descripcion: 'Respetar políticas de exclusividad por rubro' },
    { id: 'R006', nombre: 'Documentación completa', tipo: 'recomendado', descripcion: 'Material publicitario debe estar cargado antes del inicio' },
    { id: 'R007', nombre: 'Aprobación extensiones', tipo: 'obligatorio', descripcion: 'Cadena de aprobación R1 para extensiones' },
    { id: 'R008', nombre: 'Operador tráfico asignado', tipo: 'obligatorio', descripcion: 'Emisora debe tener operador de tráfico R2 asignado' }
  ]

  /** Validar compliance completo para un cupo */
  async validarCupo(data: {
    cuposOcupados: number
    cuposMaximos: number
    periodoInicio: Date
    periodoFin: Date
    contratoVigenciaFin?: Date
    valorAuspicio: number
    precioMinimo: number
    exclusividadViolada: boolean
    ejecutivoAutorizado: boolean
    materialCargado: boolean
    operadorTraficoAsignado: boolean
    extensionesSinAprobacion: boolean
  }): Promise<ComplianceResult> {
    const cumplidas: ComplianceRule[] = []
    const violadas: ComplianceRule[] = []
    const advertencias: string[] = []

    // R001: Límite cupos
    if (data.cuposOcupados < data.cuposMaximos) {
      cumplidas.push(this.reglas[0])
    } else {
      violadas.push(this.reglas[0])
    }

    // R002: Vigencia contrato
    if (!data.contratoVigenciaFin || data.periodoFin <= data.contratoVigenciaFin) {
      cumplidas.push(this.reglas[1])
    } else {
      violadas.push(this.reglas[1])
    }

    // R003: Autorización
    if (data.ejecutivoAutorizado) {
      cumplidas.push(this.reglas[2])
    } else {
      violadas.push(this.reglas[2])
    }

    // R004: Precio mínimo
    if (data.valorAuspicio >= data.precioMinimo) {
      cumplidas.push(this.reglas[3])
    } else {
      violadas.push(this.reglas[3])
    }

    // R005: Exclusividad
    if (!data.exclusividadViolada) {
      cumplidas.push(this.reglas[4])
    } else {
      violadas.push(this.reglas[4])
    }

    // R006: Documentación (recomendado)
    if (data.materialCargado) {
      cumplidas.push(this.reglas[5])
    } else {
      advertencias.push('Material publicitario aún no cargado')
    }

    // R007: Aprobación extensiones
    if (!data.extensionesSinAprobacion) {
      cumplidas.push(this.reglas[6])
    } else {
      violadas.push(this.reglas[6])
    }

    // R008: Operador tráfico
    if (data.operadorTraficoAsignado) {
      cumplidas.push(this.reglas[7])
    } else {
      violadas.push(this.reglas[7])
    }

    const totalObligatorias = this.reglas.filter(r => r.tipo === 'obligatorio').length
    const obligatoriasCumplidas = cumplidas.filter(r => r.tipo === 'obligatorio').length
    const score = Math.round((obligatoriasCumplidas / totalObligatorias) * 100)

    return {
      cumple: violadas.filter(r => r.tipo === 'obligatorio').length === 0,
      reglasCumplidas: cumplidas,
      reglasVioladas: violadas,
      advertencias,
      score
    }
  }
}
