/**
 * HANDLER: ENVIAR GRUPO DISTRIBUCIÓN — TIER 0
 *
 * Orquesta el envío de una cuña aprobada a un grupo de distribución.
 * Validaciones:
 * - La cuña debe existir y estar aprobada o en aire.
 * - El grupo de distribución debe existir y tener destinatarios activos.
 * - Registra el envío en el repositorio.
 */

import { Result } from '@/modules/shared/domain/Result';
import type { ICunaRepository } from '../../domain/repositories/ICunaRepository';
import type { IDistribucionRepository } from '../../domain/repositories/IDistribucionRepository';
import type { EnviarGrupoDistribucionCommand } from '../commands/EnviarGrupoDistribucionCommand';

export interface IDistributionExternalService {
  enviar(params: {
    cunaId: string;
    destinatarios: string[];
    canal: string;
    asunto?: string;
    mensajePersonalizado?: string;
    adjuntarAudio?: boolean;
    programarPara?: Date | null;
  }): Promise<{ exito: boolean; error?: string }>;
}

export class EnviarGrupoDistribucionHandler {
  constructor(
    private readonly cunaRepository: ICunaRepository,
    private readonly distribucionRepository: IDistribucionRepository,
    private readonly distributionService: IDistributionExternalService,
  ) {}

  async execute(command: EnviarGrupoDistribucionCommand): Promise<Result<void, string>> {
    try {
      const { input } = command;

      // 1. Validar cuña
      const cuna = await this.cunaRepository.findById(input.cunaId, input.tenantId);
      if (!cuna) {
        return Result.fail(`Cuña no encontrada: ${input.cunaId}`);
      }

      if (cuna.estado !== 'aprobada' && cuna.estado !== 'en_aire') {
        return Result.fail(`La cuña debe estar 'aprobada' o 'en_aire' para ser enviada. Estado actual: ${cuna.estado}`);
      }

      // 2. Validar grupo de distribución
      const grupo = await this.distribucionRepository.findGrupoById(input.grupoId, input.tenantId);
      if (!grupo) {
        return Result.fail(`Grupo de distribución no encontrado: ${input.grupoId}`);
      }

      if (!grupo.tieneDestinatarios()) {
        return Result.fail(`El grupo '${grupo.nombre}' no tiene destinatarios activos.`);
      }

      // 3. Obtener destinatarios
      const emails = grupo.obtenerEmailsDestinatarios();

      // 4. Enviar mediante servicio externo
      const resultadoEnvio = await this.distributionService.enviar({
        cunaId: cuna.id,
        destinatarios: emails,
        canal: input.canal,
        asunto: input.asunto,
        mensajePersonalizado: input.mensajePersonalizado,
        adjuntarAudio: input.adjuntarAudio,
        programarPara: input.programarPara,
      });

      // 5. Registrar envío en el repositorio
      await this.distribucionRepository.saveRegistroEnvio({
        id: crypto.randomUUID(),
        cunaId: cuna.id,
        grupoId: grupo.id,
        tenantId: input.tenantId,
        canal: input.canal,
        destinatarios: emails,
        estado: resultadoEnvio.exito ? 'enviado' : 'fallido',
        errorDetalle: resultadoEnvio.error ?? null,
        enviadoEn: new Date(),
      });

      if (!resultadoEnvio.exito) {
        return Result.fail(`Fallo al enviar a servicio externo: ${resultadoEnvio.error}`);
      }

      return Result.ok(undefined);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error al enviar cuña a grupo de distribución';
      return Result.fail(msg);
    }
  }
}
