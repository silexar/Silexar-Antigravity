import { randomUUID } from 'crypto';
import { VerificacionEmision } from '../../domain/entities/VerificacionEmision';
import type { IVerificacionEmisionRepository } from '../../domain/repositories/IVerificacionEmisionRepository';
import type { CrearVerificacionDTO, VerificacionResponse } from '../dtos/VerificacionEmisionDTOs';

export class CrearVerificacionUseCase {
  constructor(private readonly repo: IVerificacionEmisionRepository) {}

  async execute(dto: CrearVerificacionDTO): Promise<VerificacionResponse> {
    const id = randomUUID();
    const verificacion = VerificacionEmision.crear({
      id,
      tenantId: dto.tenantId,
      anuncianteId: dto.anuncianteId,
      campanaId: dto.campanaId,
      contratoId: dto.contratoId,
      ejecutivoId: dto.ejecutivoId,
      fechaBusqueda: dto.fechaBusqueda,
      horaInicio: dto.horaInicio,
      horaFin: dto.horaFin,
      emisorasIds: dto.emisorasIds,
      registrosAireIds: dto.registrosAireIds,
      materialesIds: dto.materialesIds,
      tiposMaterial: dto.tiposMaterial,
      toleranciaMinutos: dto.toleranciaMinutos,
      sensibilidadPorcentaje: dto.sensibilidadPorcentaje,
      creadoPorId: dto.creadoPorId,
      creadoEn: new Date(),
    });

    await this.repo.guardar(verificacion);

    return this.toResponse(verificacion);
  }

  private toResponse(v: VerificacionEmision): VerificacionResponse {
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
