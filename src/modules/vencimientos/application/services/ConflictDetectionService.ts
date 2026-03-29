/**
 * SERVICE: CONFLICT DETECTION - TIER 0 ENTERPRISE
 *
 * @description Detección automática de conflictos de exclusividad entre
 * anunciantes del mismo rubro en programas y emisoras.
 *
 * @version 2025.3.0
 * @tier TIER_0_FORTUNE_10
 */

export interface ConflictoDetectado {
  tipo: 'competencia_directa' | 'subcategoria' | 'separacion_minutos' | 'brand_safety'
  severidad: 'baja' | 'media' | 'alta' | 'bloqueante'
  clienteExistente: string
  clienteNuevo: string
  rubro: string
  programa: string
  descripcion: string
  accionRecomendada: string
}

export interface ValidacionConflicto {
  permitido: boolean
  conflictos: ConflictoDetectado[]
  advertencias: string[]
}

export class ConflictDetectionService {
  /** Validar si un nuevo cliente puede entrar a un programa */
  async validarInsercion(data: {
    programaId: string
    emisoraId: string
    clienteRubro: string
    clienteNombre: string
    subcategoria?: string
    clientesExistentes: Array<{ nombre: string; rubro: string; subcategoria?: string }>
    politica: 'exclusivo' | 'limitado' | 'sin_restriccion'
    maxClientes: number
  }): Promise<ValidacionConflicto> {
    const conflictos: ConflictoDetectado[] = []
    const advertencias: string[] = []

    // Verificar competencia directa en mismo rubro
    const competidores = data.clientesExistentes.filter(
      c => c.rubro.toLowerCase() === data.clienteRubro.toLowerCase()
    )

    if (competidores.length > 0 && data.politica === 'exclusivo') {
      conflictos.push({
        tipo: 'competencia_directa',
        severidad: 'bloqueante',
        clienteExistente: competidores[0].nombre,
        clienteNuevo: data.clienteNombre,
        rubro: data.clienteRubro,
        programa: data.programaId,
        descripcion: `Política exclusiva: ${competidores[0].nombre} ya ocupa el rubro "${data.clienteRubro}"`,
        accionRecomendada: 'Buscar otro programa o solicitar excepción al gerente comercial'
      })
    }

    if (competidores.length >= data.maxClientes && data.politica === 'limitado') {
      conflictos.push({
        tipo: 'competencia_directa',
        severidad: 'bloqueante',
        clienteExistente: competidores.map(c => c.nombre).join(', '),
        clienteNuevo: data.clienteNombre,
        rubro: data.clienteRubro,
        programa: data.programaId,
        descripcion: `Límite alcanzado: ${competidores.length}/${data.maxClientes} clientes en rubro "${data.clienteRubro}"`,
        accionRecomendada: 'Esperar liberación de cupo o cambiar de programa'
      })
    }

    // Verificar subcategoría (ej: dos gaseosas en el mismo programa)
    if (data.subcategoria) {
      const mismaSubcat = competidores.filter(
        c => c.subcategoria?.toLowerCase() === data.subcategoria?.toLowerCase()
      )
      if (mismaSubcat.length > 0) {
        conflictos.push({
          tipo: 'subcategoria',
          severidad: 'alta',
          clienteExistente: mismaSubcat[0].nombre,
          clienteNuevo: data.clienteNombre,
          rubro: data.clienteRubro,
          programa: data.programaId,
          descripcion: `Subcategoría "${data.subcategoria}" ya ocupada por ${mismaSubcat[0].nombre}`,
          accionRecomendada: 'Requiere aprobación especial del jefe comercial'
        })
      }
    }

    // Advertencias de brand safety
    if (competidores.length > 0 && data.politica !== 'exclusivo') {
      advertencias.push(`Hay ${competidores.length} competidores en el rubro "${data.clienteRubro}" en este programa`)
    }

    return {
      permitido: conflictos.filter(c => c.severidad === 'bloqueante').length === 0,
      conflictos,
      advertencias
    }
  }
}
