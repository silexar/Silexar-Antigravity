import { randomUUID } from 'crypto';
import { RegistroDeteccion } from '../../domain/entities/RegistroDeteccion';
import type { IVerificacionEmisionRepository } from '../../domain/repositories/IVerificacionEmisionRepository';
import type { IRegistroAireRepository } from '../../domain/repositories/IRegistroAireRepository';
import type { IAudioFingerprintService } from '../services/IAudioFingerprintService';
import type { ISpeechToTextService } from '../services/ISpeechToTextService';
import type { VerificacionResponse, ResultadoVerificacionItem } from '../dtos/VerificacionEmisionDTOs';
import { VerificacionNoEnProcesoError } from '../../domain/errors/RegistroEmisionErrors';

export interface EjecutarVerificacionInput {
  verificacionId: string;
  tenantId: string;
  ejecutadoPorId: string;
  // Mapeo materialId -> { url, nombre, tipo, palabrasClave? }
  materiales: Array<{
    id: string;
    nombre: string;
    tipo: 'audio_pregrabado' | 'mencion_vivo' | 'presentacion' | 'cierre';
    url?: string;
    palabrasClave?: string[];
    spxCode?: string;
  }>;
}

export class EjecutarVerificacionUseCase {
  constructor(
    private readonly verificacionRepo: IVerificacionEmisionRepository,
    private readonly registroAireRepo: IRegistroAireRepository,
    private readonly fingerprintService: IAudioFingerprintService,
    private readonly speechService: ISpeechToTextService,
    private readonly deteccionRepo: { guardar(d: RegistroDeteccion): Promise<void> },
  ) {}

  async execute(input: EjecutarVerificacionInput): Promise<VerificacionResponse> {
    const verificacion = await this.verificacionRepo.buscarPorId(input.verificacionId, input.tenantId);
    if (!verificacion) throw new Error('Verificación no encontrada');

    verificacion.iniciarProceso();
    await this.verificacionRepo.actualizar(verificacion);

    const registrosAire = await this.obtenerRegistrosAire(verificacion.registrosAireIds, input.tenantId);
    if (registrosAire.length === 0) {
      verificacion.marcarFallida('No se encontraron registros de aire asociados');
      await this.verificacionRepo.actualizar(verificacion);
      return this.toResponse(verificacion);
    }

    const resultados: ResultadoVerificacionItem[] = [];
    const inicioMs = Date.now();
    let encontrados = 0;
    let noEncontrados = 0;

    for (const material of input.materiales) {
      let itemResultado: ResultadoVerificacionItem | null = null;

      for (const registro of registrosAire) {
        if (material.tipo === 'audio_pregrabado' && material.url) {
          const match = await this.fingerprintService.detectarSpot({
            urlArchivo: registro.urlArchivo,
            horaInicioBusqueda: verificacion.rangoHorario.inicio,
            horaFinBusqueda: verificacion.rangoHorario.fin,
            materialUrl: material.url,
            materialId: material.id,
            materialNombre: material.nombre,
          });

          if (match) {
            const deteccion = this.crearDeteccion(match, registro.emisoraId, input.tenantId);
            await this.deteccionRepo.guardar(deteccion);

            itemResultado = {
              materialId: material.id,
              materialNombre: material.nombre,
              tipo: material.tipo,
              encontrado: true,
              horaDetectada: match.horaDetectada,
              confidence: match.confidence,
              duracionSegundos: match.offsetFinSegundos - match.offsetInicioSegundos,
              deteccionId: deteccion.id,
            };
            encontrados++;
            break;
          }
        } else if (material.tipo === 'mencion_vivo') {
          const transcription = await this.speechService.transcribir({
            urlArchivo: registro.urlArchivo,
            horaInicioBusqueda: verificacion.rangoHorario.inicio,
            horaFinBusqueda: verificacion.rangoHorario.fin,
            palabrasClave: material.palabrasClave ?? [material.nombre],
          });

          const mencion = transcription.menciones[0];
          if (mencion) {
            const deteccion = this.crearDeteccionMencion(mencion, registro.emisoraId, input.tenantId);
            await this.deteccionRepo.guardar(deteccion);

            itemResultado = {
              materialId: material.id,
              materialNombre: material.nombre,
              tipo: material.tipo,
              encontrado: true,
              horaDetectada: mencion.horaInicio,
              confidence: mencion.confidence,
              transcripcion: mencion.texto,
              deteccionId: deteccion.id,
            };
            encontrados++;
            break;
          }
        }
      }

      if (!itemResultado) {
        itemResultado = {
          materialId: material.id,
          materialNombre: material.nombre,
          tipo: material.tipo,
          encontrado: false,
        };
        noEncontrados++;
      }

      resultados.push(itemResultado);
    }

    const tiempoMs = Date.now() - inicioMs;
    const accuracy = encontrados > 0
      ? Math.round(resultados.filter(r => r.encontrado).reduce((sum, r) => sum + (r.confidence ?? 0), 0) / encontrados)
      : 0;

    if (noEncontrados === 0) {
      verificacion.completar(accuracy, resultados as unknown as Record<string, unknown>[], tiempoMs);
    } else if (encontrados > 0) {
      verificacion.marcarParcial(accuracy, resultados as unknown as Record<string, unknown>[], tiempoMs);
    } else {
      verificacion.marcarFallida('Ningún material fue encontrado en los registros de aire');
    }

    await this.verificacionRepo.actualizar(verificacion);
    return this.toResponse(verificacion);
  }

  private async obtenerRegistrosAire(ids: string[], tenantId: string) {
    const registros: Awaited<ReturnType<IRegistroAireRepository['buscarPorId']>>[] = [];
    for (const id of ids) {
      const r = await this.registroAireRepo.buscarPorId(id, tenantId);
      if (r) registros.push(r);
    }
    return registros.filter((r): r is NonNullable<typeof r> => r !== null);
  }

  private crearDeteccion(match: { confidence: number; offsetInicioSegundos: number; offsetFinSegundos: number; horaDetectada: string }, emisoraId: string, tenantId: string) {
    return RegistroDeteccion.crearNueva(
      tenantId,
      emisoraId,
      'fingerprint',
      {
        confianza: match.confidence,
        duracionDetectada: match.offsetFinSegundos - match.offsetInicioSegundos,
        fingerprint: JSON.stringify({ offsetInicioSegundos: match.offsetInicioSegundos, horaDetectada: match.horaDetectada }),
      },
    );
  }

  private crearDeteccionMencion(mencion: { horaInicio: string; horaFin: string; confidence: number; texto: string }, emisoraId: string, tenantId: string) {
    return RegistroDeteccion.crearNueva(
      tenantId,
      emisoraId,
      'speech_to_text',
      {
        confianza: mencion.confidence,
        duracionDetectada: this.duracionSegundosEntre(mencion.horaInicio, mencion.horaFin),
        textoDetectado: mencion.texto,
      },
    );
  }

  private duracionSegundosEntre(inicio: string, fin: string): number {
    const [h1, m1, s1] = inicio.split(':').map(Number);
    const [h2, m2, s2] = fin.split(':').map(Number);
    return (h2 * 3600 + m2 * 60 + s2) - (h1 * 3600 + m1 * 60 + s1);
  }

  private toResponse(v: import('../../domain/entities/VerificacionEmision').VerificacionEmision): VerificacionResponse {
    return {
      id: v.id,
      tenantId: v.tenantId,
      estado: v.estado.valor,
      progresoPorcentaje: v.progresoPorcentaje,
      materialesEncontrados: v.materialesEncontrados,
      materialesNoEncontrados: v.materialesNoEncontrados,
      accuracyPromedio: v.accuracyPromedio,
      resultadosDetalle: v.resultadosDetalle,
      creadoEn: v.creadoEn,
    };
  }
}
