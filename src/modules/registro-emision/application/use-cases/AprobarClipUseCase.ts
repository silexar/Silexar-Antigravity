import { randomUUID } from 'crypto';
import { ClipEvidencia } from '../../domain/entities/ClipEvidencia';
import type { IClipEvidenciaRepository } from '../../domain/repositories/IClipEvidenciaRepository';
import type { IVerificacionEmisionRepository } from '../../domain/repositories/IVerificacionEmisionRepository';
import type { ICertificateGeneratorService } from '../services/ICertificateGeneratorService';
import type { AprobarClipDTO, ClipEvidenciaResponse } from '../dtos/ClipEvidenciaDTOs';

export interface AprobarClipResult {
  clip: ClipEvidenciaResponse;
  certificado?: {
    urlCertificado: string;
    numeroCertificado: string;
  };
}

export class AprobarClipUseCase {
  constructor(
    private readonly clipRepo: IClipEvidenciaRepository,
    private readonly verificacionRepo: IVerificacionEmisionRepository,
    private readonly certService: ICertificateGeneratorService,
  ) {}

  async execute(dto: AprobarClipDTO): Promise<AprobarClipResult> {
    const clip = await this.clipRepo.buscarPorId(dto.clipId, dto.tenantId);
    if (!clip) throw new Error('Clip no encontrado');

    clip.aprobar(dto.aprobadoPorId);
    await this.clipRepo.actualizar(clip);

    let certificado: { urlCertificado: string; numeroCertificado: string } | undefined;

    const verificacion = await this.verificacionRepo.buscarPorId(clip.verificacionId, dto.tenantId);
    if (verificacion) {
      const numeroCertificado = `CERT-${Date.now()}-${randomUUID().slice(0, 4).toUpperCase()}`;
      const certResult = await this.certService.generar({
        numeroCertificado,
        fechaEmision: new Date(),
        horaDetectada: clip.horaInicioClip,
        duracionSegundos: clip.duracionSegundos,
        hashSha256: clip.hashSha256.valor,
        fechaVerificacion: verificacion.creadoEn,
      });

      if (certResult.exito) {
        certificado = {
          urlCertificado: certResult.urlCertificado,
          numeroCertificado: certResult.numeroCertificado,
        };
      }
    }

    return {
      clip: {
        id: clip.id,
        tenantId: clip.tenantId,
        verificacionId: clip.verificacionId,
        urlArchivo: clip.urlArchivo,
        duracionSegundos: clip.duracionSegundos,
        horaInicioClip: clip.horaInicioClip,
        horaFinClip: clip.horaFinClip,
        hashSha256: clip.hashSha256.valor,
        aprobado: clip.aprobado,
        fechaExpiracion: clip.fechaExpiracion,
        creadoEn: clip.creadoEn,
      },
      certificado,
    };
  }
}
