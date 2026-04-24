/**
 * HANDLER: PROCESAR AUDIO — TIER 0
 *
 * Orquesta el pipeline de análisis técnico de audio:
 * 1. Crea entidad Audio en estado 'pendiente'
 * 2. Llama al servicio de procesamiento técnico (LUFS, bitrate, etc.)
 * 3. Registra resultados y marca como 'listo' o 'rechazado'
 * 4. Notifica a la cuña padre con el ID del audio procesado
 */

import { Result } from '@/modules/shared/domain/Result';
import { Audio } from '../../domain/entities/Audio';
import type { IAudioRepository } from '../../domain/repositories/IAudioRepository';
import type { ICunaRepository } from '../../domain/repositories/ICunaRepository';
import type { ProcesarAudioCommand } from '../commands/ProcesarAudioCommand';

export interface AudioProcessingResult {
  audioId: string;
  duracionSegundos: number;
  duracionMilisegundos: number;
  bitrate: number;
  sampleRate: number;
  canales: number;
  peakLevelDb: number;
  rmsLevelDb: number;
  lufsIntegrado: number;
  rangoDinamicoDB: number;
  fingerprint: string;
  puntajeCalidad: number;
  pathFinal: string;
  transcripcion?: string;
  idiomaDetectado?: string;
}

export interface IAudioProcessingService {
  procesar(pathOriginal: string, tenantId: string): Promise<AudioProcessingResult>;
}

export class ProcesarAudioHandler {
  constructor(
    private readonly audioRepository: IAudioRepository,
    private readonly cunaRepository: ICunaRepository,
    private readonly audioProcessingService: IAudioProcessingService,
  ) {}

  async execute(command: ProcesarAudioCommand): Promise<Result<Audio, string>> {
    try {
      const { input } = command;

      // 1. Verificar que la cuña existe
      const cuna = await this.cunaRepository.findById(input.cunaId, input.tenantId);
      if (!cuna) {
        return Result.fail(`Cuña no encontrada: ${input.cunaId}`);
      }

      // 2. Verificar duplicado por fingerprint (procesamiento previo)
      // Se hace después del análisis real, aquí solo se crea la entidad

      // 3. Crear entidad Audio en estado pendiente
      const audio = Audio.create({
        tenantId: input.tenantId,
        cunaId: input.cunaId,
        pathOriginal: input.pathOriginal,
        nombreArchivo: input.nombreArchivo,
        tamanoBytes: input.tamanoBytes,
        formato: input.formato,
        duracionSegundos: 0,       // Se llena tras el análisis
        duracionMilisegundos: 0,
        subidoPorId: input.subidoPorId,
      });

      await this.audioRepository.save(audio);

      // 4. Iniciar procesamiento técnico
      audio.iniciarProcesamiento();
      await this.audioRepository.update(audio);

      // 5. Llamar al servicio externo de análisis
      const analisis = await this.audioProcessingService.procesar(
        input.pathOriginal,
        input.tenantId
      );

      // 6. Verificar duplicado por fingerprint
      const duplicado = await this.audioRepository.findByFingerprint(
        analisis.fingerprint,
        input.tenantId
      );
      if (duplicado && duplicado.id !== audio.id) {
        audio.rechazar(`Audio duplicado — ya existe como ${duplicado.id}`);
        await this.audioRepository.update(audio);
        return Result.fail(`Audio duplicado detectado: ${duplicado.id}`);
      }

      // 7. Registrar resultados del análisis
      audio.registrarAnalisisTecnico(analisis);

      if (analisis.transcripcion && input.generarTranscripcion) {
        audio.registrarTranscripcion(
          analisis.transcripcion,
          analisis.idiomaDetectado ?? 'es'
        );
      }

      // 8. Verificar estándares de broadcast
      if (audio.cumpleEstandaresBroadcast()) {
        audio.marcarComoBroadcastReady();
      }

      await this.audioRepository.update(audio);

      return Result.ok(audio);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error al procesar audio';
      return Result.fail(msg);
    }
  }
}
