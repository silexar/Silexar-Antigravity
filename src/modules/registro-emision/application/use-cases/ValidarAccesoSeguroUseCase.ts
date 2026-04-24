import type { ILinkTemporalRepository } from '../../domain/repositories/ILinkTemporalRepository';
import type { ValidarAccesoDTO, AccesoSeguroResponse } from '../dtos/AccesoSeguroDTOs';
import { AccesoExpiradoError, LimiteDeUsosAlcanzadoError } from '../../domain/errors/RegistroEmisionErrors';

export interface ValidarAccesoResult {
  acceso: AccesoSeguroResponse;
  clips: Array<{
    materialNombre: string;
    clipUrl?: string;
    imageUrl?: string;
    esDigital?: boolean;
    horaEmision?: string;
    spxCode?: string;
  }>;
}

export class ValidarAccesoSeguroUseCase {
  constructor(private readonly repo: ILinkTemporalRepository) {}

  async execute(dto: ValidarAccesoDTO): Promise<ValidarAccesoResult> {
    const acceso = await this.repo.buscarPorCodigo(dto.codigoAcceso, dto.tenantId);
    if (!acceso) throw new Error('Código de acceso no encontrado');

    if (!acceso.puedeUsarse()) {
      if (acceso.estado === 'expirado') {
        throw new AccesoExpiradoError();
      }
      throw new LimiteDeUsosAlcanzadoError();
    }

    acceso.registrarAcceso('visualizacion', dto.ipAddress, dto.userAgent);
    await this.repo.actualizar(acceso);

    const clips = acceso.tipoLink === 'basket' && acceso.itemsJson
      ? acceso.itemsJson
      : [{
          materialNombre: acceso.materialNombre ?? 'Evidencia',
          clipUrl: acceso.clipUrl,
          imageUrl: acceso.imageUrl,
          esDigital: acceso.esDigital,
          spxCode: acceso.spxCode,
        }];

    return {
      acceso: {
        id: acceso.id,
        linkUuid: acceso.linkUuid,
        codigoAcceso: acceso.codigoAcceso.valor,
        estado: acceso.estado,
        clienteEmail: acceso.clienteEmail,
        clipUrl: acceso.clipUrl,
        fechaExpiracion: acceso.fechaExpiracion,
        usosPermitidos: acceso.usosPermitidos,
        usosRealizados: acceso.usosRealizados,
      },
      clips: clips.filter((c): c is NonNullable<typeof c> => !!c),
    };
  }
}
