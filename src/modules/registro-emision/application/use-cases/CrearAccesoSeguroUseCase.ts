import { randomUUID } from 'crypto';
import { AccesoSeguro } from '../../domain/entities/AccesoSeguro';
import type { ILinkTemporalRepository } from '../../domain/repositories/ILinkTemporalRepository';
import type { CrearAccesoSeguroDTO, AccesoSeguroResponse } from '../dtos/AccesoSeguroDTOs';
import { CodigoAcceso } from '../../domain/value-objects/CodigoAcceso';

export class CrearAccesoSeguroUseCase {
  constructor(private readonly repo: ILinkTemporalRepository) {}

  async execute(dto: CrearAccesoSeguroDTO): Promise<AccesoSeguroResponse> {
    const id = randomUUID();
    const linkUuid = randomUUID();
    const codigo = CodigoAcceso.generar(6);

    const expiracion = new Date();
    expiracion.setDate(expiracion.getDate() + 30);

    const acceso = AccesoSeguro.crear({
      id,
      tenantId: dto.tenantId,
      linkUuid,
      codigoAcceso: codigo.valor,
      verificacionId: dto.verificacionId,
      clipEvidenciaId: dto.clipEvidenciaId,
      tipoLink: dto.tipoLink,
      itemsJson: dto.itemsJson,
      materialNombre: dto.materialNombre,
      spxCode: dto.spxCode,
      clipUrl: dto.clipUrl,
      imageUrl: dto.imageUrl,
      esDigital: dto.esDigital,
      clienteNombre: dto.clienteNombre,
      clienteEmail: dto.clienteEmail,
      campanaNombre: dto.campanaNombre,
      usosPermitidos: dto.usosPermitidos,
      creadoPorId: dto.creadoPorId,
      creadoPorNombre: dto.creadoPorNombre,
      fechaExpiracion: expiracion,
    });

    await this.repo.guardar(acceso);

    return {
      id: acceso.id,
      linkUuid: acceso.linkUuid,
      codigoAcceso: acceso.codigoAcceso.valor,
      estado: acceso.estado,
      clienteEmail: acceso.clienteEmail,
      clipUrl: acceso.clipUrl,
      fechaExpiracion: acceso.fechaExpiracion,
      usosPermitidos: acceso.usosPermitidos,
      usosRealizados: acceso.usosRealizados,
    };
  }
}
