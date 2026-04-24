import type { TipoMaterialVerificacion } from '../../domain/entities/VerificacionEmision';

export interface CrearVerificacionDTO {
  tenantId: string;
  anuncianteId?: string;
  campanaId?: string;
  contratoId?: string;
  ejecutivoId?: string;
  fechaBusqueda: Date;
  horaInicio: string;
  horaFin: string;
  emisorasIds?: string[];
  registrosAireIds?: string[];
  materialesIds?: string[];
  tiposMaterial?: TipoMaterialVerificacion[];
  toleranciaMinutos?: number;
  sensibilidadPorcentaje?: number;
  creadoPorId?: string;
}

export interface EjecutarVerificacionDTO {
  verificacionId: string;
  tenantId: string;
  ejecutadoPorId: string;
}

export interface VerificacionResponse {
  id: string;
  tenantId: string;
  estado: string;
  progresoPorcentaje: number;
  materialesEncontrados: number;
  materialesNoEncontrados: number;
  accuracyPromedio: number;
  resultadosDetalle: Record<string, unknown>[];
  creadoEn: Date;
}

export interface ResultadoVerificacionItem {
  materialId: string;
  materialNombre: string;
  tipo: TipoMaterialVerificacion;
  encontrado: boolean;
  horaDetectada?: string;
  confidence?: number;
  duracionSegundos?: number;
  transcripcion?: string;
  deteccionId?: string;
}
