import { Result, AppError } from "../core/Result";
import { IniciarConciliacionDiariaCommand, IniciarConciliacionDiariaSchema } from "../commands/IniciarConciliacionDiariaCommand";
import { ConciliacionDiaria } from "../../domain/entities/ConciliacionDiaria";
import { IConciliacionDiariaRepository } from "../../domain/repositories/IConciliacionDiariaRepository";
import { FechaConciliacion } from "../../domain/value-objects/FechaConciliacion";
import { EmisoraTarget } from "../../domain/value-objects/EmisoraTarget";

export class ConciliacionCommandHandler {
  private repository: IConciliacionDiariaRepository;

  constructor(repository: IConciliacionDiariaRepository) {
    this.repository = repository;
  }

  public async execute(command: IniciarConciliacionDiariaCommand): Promise<Result<string>> {
    try {
      // 1. Validar DTO
      const validation = IniciarConciliacionDiariaSchema.safeParse(command);
      if (!validation.success) {
        return Result.fail(new AppError(validation.error.message, "VALIDATION_ERROR"));
      }

      // 2. Crear Value Objects
      const fecha = FechaConciliacion.create(command.fecha);
      const emisora = EmisoraTarget.create(command.emisoraId, command.emisoraNombre);

      // 3. Verificar si ya existe
      const existente = await this.repository.findByFechaAndEmisora(fecha, command.emisoraId);
      if (existente) {
        return Result.fail(new AppError("Ya existe una conciliación para esta emisora en la fecha indicada", "CONFLICT"));
      }

      // 4. Crear nueva entidad Aggregate Root
      const nuevaConciliacion = ConciliacionDiaria.create({
        fecha,
        emisora,
        registrosProgramados: [], // Se llenaría luego importando la programación
        registrosReales: []       // Se llenaría al procesar Dalet
      });

      // 5. Guardar en BD
      await this.repository.save(nuevaConciliacion);

      return Result.ok(nuevaConciliacion.id);

    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return Result.fail(new AppError(`Error iniciando conciliación: ${message}`, "INTERNAL_ERROR"));
    }
  }
}
