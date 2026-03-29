import { ICupoComercialRepository } from '../../domain/repositories/ICupoComercialRepository';
import { logger } from '@/lib/observability';
import { DomainEvent } from '../../domain/events/DomainEvent';

export interface ActivarAuspicioDTO {
  cupoId: string;
  autorizadoPor: string;
}

export class ActivarAuspicioCommand {
  constructor(private readonly cupoRepository: ICupoComercialRepository) {}

  async execute(dto: ActivarAuspicioDTO) {
    logger.info(`Command: Activando cupo publicitario ${dto.cupoId} autorizado por ${dto.autorizadoPor}`);
    // Modificaría estado en base de datos 
    // y dispararía un Evento de Actividad
    return { success: true, estado: 'ACTIVO' };
  }
}
