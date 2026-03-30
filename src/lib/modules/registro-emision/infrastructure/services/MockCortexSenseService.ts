/**
 * 🧠 SERVICE: MockCortexSenseService (Infrastructure)
 * 
 * Simulación ultra-realista del motor Cortex-Sense Quántico.
 * Genera resultados "dummy" pero coherentes para demostraciones y desarrollo UI.
 * 
 * @tier TIER_0_FORTUNE_10
 */

import { MaterialVerificacion, ResultadoMatch } from "../../domain/entities/Verificacion";

export class MockCortexSenseService {
  /**
   * Simula el procesamiento asíncrono de un lote de materiales.
   * Retorna resultados con datos "fake" de alta fidelidad.
   */
  public async procesarMateriales(materiales: MaterialVerificacion[]): Promise<ResultadoMatch[]> {
    // Simula latencia de red/procesamiento (esto se controlaría mejor en la capa de aplicación, 
    // pero aquí generamos los datos)
    
    return materiales.map(mat => {
      // 90% probabilidad de encontrar
      const encontrado = Math.random() > 0.1;
      
      const resultado: ResultadoMatch = {
        materialId: mat.id,
        encontrado: encontrado,
        confianza: encontrado ? 0.85 + (Math.random() * 0.15) : 0, // 0.85 - 1.00
        accuracy: encontrado ? Math.floor(95 + Math.random() * 5) : 0,
      };

      if (encontrado) {
        // Generar hora aleatoria entre 07:00 y 22:00
        const hora = new Date();
        hora.setHours(7 + Math.floor(Math.random() * 15));
        hora.setMinutes(Math.floor(Math.random() * 60));
        hora.setSeconds(Math.floor(Math.random() * 60));
        resultado.horaEmision = hora;

        resultado.clipUrl = `/api/mock/clips/${mat.id}.mp3`;
        
        if (mat.tipo === 'mencion_vivo' && mat.textoEsperado) {
          // Simular pequeña variación en transcripción
          resultado.transcripcionDetectada = mat.textoEsperado + "... (locutor enfatiza oferta)";
        }
      }

      return resultado;
    });
  }
}
