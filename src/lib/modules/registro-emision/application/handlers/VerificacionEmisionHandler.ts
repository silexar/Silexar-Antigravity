/**
 * ⚙️ APPLICATION HANDLER: VerificacionEmisionHandler
 * 
 * Orquestador principal del caso de uso "Iniciar Verificación".
 * Coordina: Dominio -> Infraestima (IA) -> Persistencia -> Eventos.
 * 
 * @tier TIER_0_ENTERPRISE
 */

import { IniciarVerificacionCommand } from "../commands/IniciarVerificacionCommand";
import { logger } from '@/lib/observability';
import { RegistroEmision } from "../../domain/entities/RegistroEmision";
import { MaterialCreativo } from "../../domain/entities/MaterialCreativo";
import { IRegistroEmisionRepository } from "../../domain/repositories/IRegistroEmisionRepository";
import { MockCortexSenseService } from "../../infrastructure/external/CortexSenseUltraService"; // Renamed
import { v4 as uuidv4 } from 'uuid';

export class VerificacionEmisionHandler {
  constructor(
    private readonly repository: IRegistroEmisionRepository,
    private readonly scannerService: MockCortexSenseService
    // private readonly eventPublisher: IEventPublisher
  ) {}

  public async handle(command: IniciarVerificacionCommand): Promise<string> {
    logger.info("🚀 [Handler] Procesando IniciarVerificacionCommand");

    // 1. Transformar DTO -> Entidades de Dominio
    const materiales = command.materiales.map(m => new MaterialCreativo(
      uuidv4(),
      m.nombre,
      m.tipo,
      m.duracionSegundos,
      m.spxCode,
      m.urlAudio
    ));

    // 2. Crear Aggregate Root
    const registro = RegistroEmision.crearNueva(
      command.tenantId,
      command.clienteId,
      command.campanaId,
      materiales
    );

    // 3. Persistir estado inicial (Pendiente)
    await this.repository.save(registro);

    // 4. Iniciar proceso en dominio
    registro.confirmarInicioProceso();

    // 5. Invocar servicio de dominio externo (IA recognition)
    // NOTA: En producción esto sería asíncrono via colas, pero aquí lo hacemos directo
    // para cumplir el requisito de "Interactive Mode" mockeado.
    
    // El servicio ahora retorna 'CoincidenciaEncontrada[]' entidades
    const coincidencias = await this.scannerService.escanear(registro);
    
    // 6. Actualizar Agregado con resultados
    coincidencias.forEach(c => registro.registrarCoincidencia(c));

    // 7. Persistir estado final
    await this.repository.save(registro);

    // 8. Publicar eventos de integración (Stub)
    // this.eventPublisher.publish(new VerificacionCompletadaEvent(registro));

    return registro.id;
  }
}
