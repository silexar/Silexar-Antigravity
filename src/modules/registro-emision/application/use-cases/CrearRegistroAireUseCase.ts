import { randomUUID } from 'crypto';
import { RegistroAire } from '../../domain/entities/RegistroAire';
import type { IRegistroAireRepository } from '../../domain/repositories/IRegistroAireRepository';
import type { CrearRegistroAireDTO, RegistroAireResponse } from '../dtos/RegistroAireDTOs';

export class CrearRegistroAireUseCase {
  constructor(private readonly repo: IRegistroAireRepository) {}

  async execute(dto: CrearRegistroAireDTO): Promise<RegistroAireResponse> {
    const id = randomUUID();
    const registro = RegistroAire.crear({
      id,
      tenantId: dto.tenantId,
      emisoraId: dto.emisoraId,
      fechaEmision: dto.fechaEmision,
      urlArchivo: dto.urlArchivo,
      duracionSegundos: dto.duracionSegundos,
      formato: dto.formato,
      tamanioBytes: dto.tamanioBytes,
      hashSha256: dto.hashSha256,
      metadata: dto.metadata,
      estado: 'pendiente',
      creadoPorId: dto.creadoPorId,
      creadoEn: new Date(),
    });

    await this.repo.guardar(registro);

    return {
      id: registro.id,
      tenantId: registro.tenantId,
      emisoraId: registro.emisoraId,
      fechaEmision: registro.fechaEmision,
      urlArchivo: registro.urlArchivo,
      duracionSegundos: registro.duracionSegundos,
      formato: registro.formato,
      estado: registro.estado.valor,
      hashSha256: registro.hashSha256?.valor,
      creadoEn: registro.creadoEn,
    };
  }
}
