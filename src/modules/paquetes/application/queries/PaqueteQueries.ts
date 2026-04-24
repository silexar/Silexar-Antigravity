/**
 * QUERIES: PAQUETE QUERIES
 * 
 * @description Queries para operaciones de lectura en el módulo Paquetes.
 * Implementa el patrón CQS (Command Query Separation).
 * 
 * @version 1.0.0
 */

export interface ObtenerDetallePaqueteQuery {
    id: string
}

export interface BuscarPaquetesQuery {
    texto?: string
    tipo?: string
    estado?: string
    editoraId?: string
    pagina?: number
    limite?: number
}

export interface ObtenerPaquetesPorEditoraQuery {
    editoraId: string
    activos?: boolean
}

export interface ObtenerDisponibilidadQuery {
    paqueteId: string
    desde?: Date
    hasta?: Date
}

export interface GenerarAnalisisRentabilidadQuery {
    paqueteId: string
    periodoDias?: number
}

// Resultados
export interface PaqueteDetalleResult {
    id: string
    codigo: string
    nombre: string
    descripcion: string
    tipo: string
    estado: string
    editora: { id: string; nombre: string }
    programa: { id: string; nombre: string }
    horario: { inicio: string; fin: string }
    diasSemana: string[]
    duraciones: number[]
    precioBase: number
    precioActual: number
    nivelExclusividad: string
    vigencia: { desde: Date; hasta: Date }
    metrics: {
        utilizationPct: number
        revenueYTD: number
        avgPrice: number
    }
}

export interface PaquetesListaResult {
    total: number
    pagina: number
    limite: number
    items: PaqueteDetalleResult[]
}