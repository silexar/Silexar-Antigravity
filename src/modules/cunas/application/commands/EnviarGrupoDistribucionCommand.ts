/**
 * COMMAND: ENVIAR GRUPO DISTRIBUCIÓN — TIER 0
 *
 * Despacha una cuña aprobada a un grupo de distribución.
 * Registra el envío, el canal y el resultado por destinatario.
 */

export type CanalDistribucion = 'email' | 'whatsapp' | 'ftp' | 'api';

export interface EnviarGrupoDistribucionInput {
  tenantId: string;
  cunaId: string;
  grupoId: string;
  canal: CanalDistribucion;
  asunto?: string;               // Para canal email
  mensajePersonalizado?: string; // Cuerpo del mensaje
  adjuntarAudio?: boolean;       // Si incluir el archivo de audio
  enviadoPorId: string;
  programarPara?: Date | null;   // null = enviar ahora
}

export class EnviarGrupoDistribucionCommand {
  constructor(public readonly input: EnviarGrupoDistribucionInput) {}
}
