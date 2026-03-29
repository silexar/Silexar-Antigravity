/**
 * 🎵 DOMAIN ENTITY: Verificacion
 * 
 * Representa un proceso de verificación de emisión ("Shazam Militar").
 * Encapsula el estado, resultados y lógica de negocio pura.
 * 
 * @tier TIER_0_FORTUNE_10
 */

import { v4 as uuidv4 } from 'uuid';
import { logger } from '@/lib/observability';

export type EstadoVerificacion = 'pendiente' | 'en_proceso' | 'completada' | 'fallida';
export type TipoMaterial = 'audio_pregrabado' | 'mencion_vivo' | 'presentacion' | 'cierre';

export interface MaterialVerificacion {
  id: string;
  nombre: string;
  tipo: TipoMaterial;
  duracionSegundos?: number;
  textoEsperado?: string;
}

export interface ResultadoMatch {
  materialId: string;
  encontrado: boolean;
  accuracy: number; // 0-100
  horaEmision?: Date;
  clipUrl?: string; // URL al audio recortado
  transcripcionDetectada?: string;
  confianza: number;
}

export class Verificacion {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly clienteId: string,
    public readonly campanaId: string,
    public readonly materiales: MaterialVerificacion[],
    public estado: EstadoVerificacion,
    public progreso: number, // 0-100
    public resultados: ResultadoMatch[],
    public fechaCreacion: Date,
    public fechaInicioProceso?: Date,
    public fechaFinProceso?: Date,
    // TIER 0 BLOCKCHAIN FIELDS
    public blockchainHash?: string,
    public certificadoUrl?: string,
    public fechaCertificacion?: Date,
  ) {}

  public static crear(
    tenantId: string,
    clienteId: string,
    campanaId: string,
    materiales: MaterialVerificacion[]
  ): Verificacion {
    if (materiales.length === 0) {
      throw new Error("Una verificación debe contener al menos un material.");
    }

    return new Verificacion(
      uuidv4(),
      tenantId,
      clienteId,
      campanaId,
      materiales,
      'pendiente',
      0,
      [],
      new Date()
    );
  }

  public iniciarProceso(): void {
    if (this.estado !== 'pendiente') {
      throw new Error("Solo se puede iniciar una verificación pendiente.");
    }
    this.estado = 'en_proceso';
    this.fechaInicioProceso = new Date();
    this.progreso = 0;
  }

  public actualizarProgreso(porcentaje: number): void {
    if (this.estado !== 'en_proceso') return;
    this.progreso = Math.min(100, Math.max(0, porcentaje));
  }

  public finalizarProceso(resultados: ResultadoMatch[]): void {
    if (this.estado !== 'en_proceso') {
       // Permisivo para reintentos o robustez
    }
    this.resultados = resultados;
    this.estado = 'completada';
    this.progreso = 100;
    this.fechaFinProceso = new Date();
  }

  public fallarProceso(_error: string): void {
    logger.error("Proceso fallido", new Error(_error));
    this.estado = 'fallida';
    this.fechaFinProceso = new Date();
    // Log error internamente o en una entidad de auditoría
  }

  public obtenerResumen() {
    const encontrados = this.resultados.filter(r => r.encontrado).length;
    const total = this.materiales.length;
    const accuracyPromedio = encontrados > 0
      ? this.resultados.filter(r => r.encontrado).reduce((acc, r) => acc + r.accuracy, 0) / encontrados
      : 0;

    return {
      total,
      encontrados,
      noEncontrados: total - encontrados,
      accuracyPromedio: Math.round(accuracyPromedio),
      tasaExito: total > 0 ? (encontrados / total) * 100 : 0
    };
  }
}
