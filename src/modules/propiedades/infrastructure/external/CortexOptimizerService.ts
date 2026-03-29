import { Result } from '../../../../core/domain/Result';

export type SugerenciaIA = {
  id: string;
  tipoAccion: 'FUSIONAR' | 'CREAR_NUEVO' | 'MARCAR_DEPRECADO';
  entidadesInvolucradas: string[]; // Códigos
  confianzaScore: number; // 0.0 - 1.0
  justificacionText: string;
};

/**
 * SERVICIO EXTERNO: Cortex Optimizer Service (Mock)
 * 
 * Simula el motor de IA que analiza el grafo de propiedades 
 * para recomendar optimizaciones de estructura.
 */
export class CortexOptimizerService {
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async analizarEstructura(_tiposActuales: unknown[]): Promise<Result<SugerenciaIA[]>> {
    // Simulamos latencia del modelo LLM
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Devolvemos sugerencias prefabricadas simulando un análisis de IA
    const sugerenciasMock: SugerenciaIA[] = [
      {
        id: 'opt-001',
        tipoAccion: 'FUSIONAR',
        entidadesInvolucradas: ['INDUSTRIA-TECNOLOGIA', 'INDUSTRIA-SOFTWARE'],
        confianzaScore: 0.94,
        justificacionText: 'El 98% de los vendedores usan estos dos valores de forma indistinta. Se recomienda fusionar en "Tecnología/Software" para limpiar reportes.'
      },
      {
        id: 'opt-002',
        tipoAccion: 'MARCAR_DEPRECADO',
        entidadesInvolucradas: ['TIPO-CANJE-LOCAL'],
        confianzaScore: 0.88,
        justificacionText: 'No ha sido utilizado en los últimos 18 meses tras la última actualización de políticas comerciales.'
      }
    ];

    return Result.ok(sugerenciasMock);
  }
}
