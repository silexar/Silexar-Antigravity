export type TipoAlerta = 'CRITICA' | 'ALTA' | 'MEDIA' | 'BAJA' | 'INFO'
export type CategoriaAlerta = 'CONFLICTO' | 'CUMPLIMIENTO' | 'FINANCIERO' | 'OPERACIONAL' | 'SISTEMA'

export class AlertingIntelligenceService {
  async obtenerAlertasActivas(opts?: { campanaId?: string; tipos?: TipoAlerta[]; categorias?: CategoriaAlerta[]; limite?: number }) {
    const base = [
      { id: 'al-1', tipo: 'CRITICA' as TipoAlerta, categoria: 'CONFLICTO' as CategoriaAlerta, titulo: 'Conflicto de pauta', descripcion: 'Dos cuñas en mismo bloque', fechaCreacion: new Date(), leida: false, accionRequerida: true, metadata: { impacto: 'ALTO' } },
      { id: 'al-2', tipo: 'MEDIA' as TipoAlerta, categoria: 'FINANCIERO' as CategoriaAlerta, titulo: 'Margen bajo', descripcion: 'Revisar comisión de agencia', fechaCreacion: new Date(), leida: false, accionRequerida: false, metadata: {} },
    ]
    return base.slice(0, opts?.limite ?? base.length)
  }

  async marcarAlertaComoLeida(_alertaId: string) {
    return
  }
}

export default AlertingIntelligenceService

