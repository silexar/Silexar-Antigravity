/**
 * EXTERNAL SERVICE: VENCIMIENTOS VALIDATION SERVICE — TIER 0
 *
 * Servicio de infraestructura que coordina la validación cruzada
 * entre el módulo Cuñas y el módulo Vencimientos.
 *
 * Responsabilidades:
 * - Verificar que una cuña tiene contrato/vencimientos vigente
 * - Detectar cuñas cuyo contrato vence pronto
 * - Sincronizar el estado de cuñas cuando vence un contrato
 */

export interface VencimientoValidacion {
  cunaId: string;
  contratoId: string;
  tieneVencimientoActivo: boolean;
  fechaVencimiento?: Date | null;
  diasRestantes?: number | null;
  observaciones?: string | null;
}

export interface ResultadoValidacionMasiva {
  totalValidadas: number;
  conVencimientoActivo: number;
  sinVencimiento: number;
  vencenEn7Dias: VencimientoValidacion[];
  vencenEn3Dias: VencimientoValidacion[];
  vencenHoy: VencimientoValidacion[];
  yaVencidas: VencimientoValidacion[];
}

export interface CunaParaValidar {
  cunaId: string;
  contratoId: string | null;
  tenantId: string;
}

export class VencimientosValidationService {
  private readonly baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl ?? process.env['VENCIMIENTOS_SERVICE_URL'] ?? '/api/vencimientos';
  }

  /**
   * Valida si una cuña tiene un contrato/vencimientos activo.
   * Llama al módulo Vencimientos via API interna.
   */
  async validarCuna(cunaId: string, contratoId: string, tenantId: string): Promise<VencimientoValidacion> {
    try {
      const response = await fetch(
        `${this.baseUrl}/validar?cunaId=${cunaId}&contratoId=${contratoId}&tenantId=${tenantId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-Tenant-Id': tenantId,
          },
        }
      );

      if (!response.ok) {
        // Si el servicio no está disponible, retorna validación permisiva
        console.warn(`[VencimientosValidationService] Servicio no disponible (${response.status}), modo permisivo`);
        return {
          cunaId,
          contratoId,
          tieneVencimientoActivo: true,
          fechaVencimiento: null,
          diasRestantes: null,
          observaciones: 'Validación omitida — servicio Vencimientos no disponible',
        };
      }

      return await response.json() as VencimientoValidacion;
    } catch (error) {
      console.warn(`[VencimientosValidationService] Error de conectividad:`, error);
      // Modo degradado: no bloquea la operación
      return {
        cunaId,
        contratoId,
        tieneVencimientoActivo: true,
        fechaVencimiento: null,
        diasRestantes: null,
        observaciones: 'Error de conectividad con módulo Vencimientos',
      };
    }
  }

  /**
   * Valida múltiples cuñas en batch.
   * Optimizado para el cron job de alertas diarias.
   */
  async validarCunasBatch(cunas: CunaParaValidar[]): Promise<ResultadoValidacionMasiva> {
    const cunasConContrato = cunas.filter(c => c.contratoId !== null);

    if (cunasConContrato.length === 0) {
      return {
        totalValidadas: 0,
        conVencimientoActivo: 0,
        sinVencimiento: cunas.length,
        vencenEn7Dias: [],
        vencenEn3Dias: [],
        vencenHoy: [],
        yaVencidas: [],
      };
    }

    const validaciones = await Promise.allSettled(
      cunasConContrato.map(c =>
        this.validarCuna(c.cunaId, c.contratoId!, c.tenantId)
      )
    );

    const resultados: VencimientoValidacion[] = validaciones
      .filter((r): r is PromiseFulfilledResult<VencimientoValidacion> => r.status === 'fulfilled')
      .map(r => r.value);

    const ahora = new Date();

    return {
      totalValidadas: resultados.length,
      conVencimientoActivo: resultados.filter(r => r.tieneVencimientoActivo).length,
      sinVencimiento: cunas.length - cunasConContrato.length,
      vencenEn7Dias: resultados.filter(r => {
        const d = r.diasRestantes ?? Infinity;
        return d > 3 && d <= 7;
      }),
      vencenEn3Dias: resultados.filter(r => {
        const d = r.diasRestantes ?? Infinity;
        return d > 0 && d <= 3;
      }),
      vencenHoy: resultados.filter(r => (r.diasRestantes ?? Infinity) === 0),
      yaVencidas: resultados.filter(r => (r.diasRestantes ?? 1) < 0),
    };
  }

  /**
   * Notifica al módulo Vencimientos que una cuña fue finalizada.
   * Permite al módulo Vencimientos liberar el slot del contrato.
   */
  async notificarCunaFinalizada(cunaId: string, contratoId: string, tenantId: string): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/cuna-finalizada`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-Id': tenantId,
        },
        body: JSON.stringify({ cunaId, contratoId, tenantId }),
      });
    } catch (error) {
      // No bloquea, solo registra
      console.warn(`[VencimientosValidationService] Error al notificar finalización:`, error);
    }
  }
}
