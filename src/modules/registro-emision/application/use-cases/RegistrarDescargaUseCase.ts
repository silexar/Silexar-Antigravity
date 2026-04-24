import type { ILinkTemporalRepository } from '../../domain/repositories/ILinkTemporalRepository';
import type { RegistrarDescargaDTO } from '../dtos/AccesoSeguroDTOs';
import { AccesoExpiradoError, LimiteDeUsosAlcanzadoError } from '../../domain/errors/RegistroEmisionErrors';

export class RegistrarDescargaUseCase {
  constructor(private readonly repo: ILinkTemporalRepository) {}

  async execute(dto: RegistrarDescargaDTO): Promise<void> {
    const acceso = await this.repo.buscarPorId(dto.accesoId, dto.tenantId);
    if (!acceso) throw new Error('Acceso no encontrado');

    if (!acceso.puedeUsarse()) {
      if (acceso.estado === 'expirado') {
        throw new AccesoExpiradoError();
      }
      throw new LimiteDeUsosAlcanzadoError();
    }

    acceso.registrarAcceso('descarga', dto.ipAddress, dto.userAgent);
    await this.repo.actualizar(acceso);
  }
}
