import { logger } from '@/lib/observability';
/**
 * 🤖 SILEXAR PULSE - AI AutoComplete Service TIER 0
 * 
 * @description Servicio de autocompletado inteligente que predice
 * y sugiere valores basados en historial, patrones y contexto.
 * 
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export interface SugerenciaAutoComplete {
  id: string;
  campo: string;
  valor: string | number;
  confianza: number;
  razon: string;
  fuente: 'historial' | 'patron' | 'similar' | 'prediccion' | 'benchmark';
}

export interface ContextoContrato {
  clienteId?: string;
  clienteNombre?: string;
  tipoContrato?: string;
  industria?: string;
  valorEstimado?: number;
  fechaInicio?: Date;
  camposCompletados: Record<string, unknown>;
}

export interface PatronHistorico {
  campo: string;
  valorMasFrecuente: string | number;
  frecuencia: number;
  ultimoUso: Date;
}

export interface BenchmarkIndustria {
  industria: string;
  valorPromedioContrato: number;
  descuentoPromedio: number;
  diasPagoPromedio: number;
  clausulasComunes: string[];
}

// ═══════════════════════════════════════════════════════════════
// MOCK DATA - HISTÓRICO
// ═══════════════════════════════════════════════════════════════

const historicoClientes: Record<string, {
  ultimoContrato: {
    valor: number;
    descuento: number;
    diasPago: number;
    duracionMeses: number;
    medios: string[];
  };
  promedioValor: number;
  tendenciaValor: number; // % cambio YoY
  preferencias: string[];
}> = {
  'banco-chile': {
    ultimoContrato: {
      valor: 85000000,
      descuento: 15,
      diasPago: 45,
      duracionMeses: 12,
      medios: ['Radio', 'TV', 'Digital']
    },
    promedioValor: 75000000,
    tendenciaValor: 12,
    preferencias: ['horario_prime', 'exclusividad_categoria', 'flexibilidad_pauta']
  },
  'falabella': {
    ultimoContrato: {
      valor: 120000000,
      descuento: 20,
      diasPago: 60,
      duracionMeses: 6,
      medios: ['Radio', 'Digital']
    },
    promedioValor: 100000000,
    tendenciaValor: 8,
    preferencias: ['campañas_estacionales', 'descuento_volumen']
  },
  'cencosud': {
    ultimoContrato: {
      valor: 200000000,
      descuento: 18,
      diasPago: 45,
      duracionMeses: 12,
      medios: ['TV', 'Radio', 'Prensa']
    },
    promedioValor: 180000000,
    tendenciaValor: 15,
    preferencias: ['multimarca', 'cobertura_nacional']
  }
};

const benchmarksIndustria: Record<string, BenchmarkIndustria> = {
  'banca': {
    industria: 'Banca y Finanzas',
    valorPromedioContrato: 95000000,
    descuentoPromedio: 12,
    diasPagoPromedio: 45,
    clausulasComunes: ['exclusividad_categoria', 'confidencialidad', 'penalizacion_cancelacion']
  },
  'retail': {
    industria: 'Retail',
    valorPromedioContrato: 75000000,
    descuentoPromedio: 18,
    diasPagoPromedio: 60,
    clausulasComunes: ['flexibilidad_pauta', 'descuento_volumen', 'prorroga_automatica']
  },
  'telecomunicaciones': {
    industria: 'Telecomunicaciones',
    valorPromedioContrato: 150000000,
    descuentoPromedio: 10,
    diasPagoPromedio: 30,
    clausulasComunes: ['exclusividad_total', 'penalizacion_incumplimiento', 'renovacion_anticipada']
  },
  'consumo_masivo': {
    industria: 'Consumo Masivo',
    valorPromedioContrato: 60000000,
    descuentoPromedio: 22,
    diasPagoPromedio: 45,
    clausulasComunes: ['campañas_estacionales', 'descuento_pronto_pago', 'flexibilidad_materiales']
  }
};

// ═══════════════════════════════════════════════════════════════
// MOTOR DE AUTOCOMPLETADO IA
// ═══════════════════════════════════════════════════════════════

class AIAutoCompleteEngine {
  private static instance: AIAutoCompleteEngine;

  private constructor() {}

  static getInstance(): AIAutoCompleteEngine {
    if (!this.instance) {
      this.instance = new AIAutoCompleteEngine();
    }
    return this.instance;
  }

  /**
   * Genera sugerencias para un campo específico
   */
  async getSugerencias(
    campo: string,
    contexto: ContextoContrato
  ): Promise<SugerenciaAutoComplete[]> {
    const sugerencias: SugerenciaAutoComplete[] = [];

    switch (campo) {
      case 'valor':
        sugerencias.push(...this.sugerirValor(contexto));
        break;
      case 'descuento':
        sugerencias.push(...this.sugerirDescuento(contexto));
        break;
      case 'diasPago':
        sugerencias.push(...this.sugerirDiasPago(contexto));
        break;
      case 'duracion':
        sugerencias.push(...this.sugerirDuracion(contexto));
        break;
      case 'fechaInicio':
        sugerencias.push(...this.sugerirFechaInicio(contexto));
        break;
      case 'medios':
        sugerencias.push(...this.sugerirMedios(contexto));
        break;
      case 'clausulas':
        sugerencias.push(...this.sugerirClausulas(contexto));
        break;
    }

    // Ordenar por confianza
    return sugerencias.sort((a, b) => b.confianza - a.confianza);
  }

  /**
   * Sugiere valor del contrato
   */
  private sugerirValor(contexto: ContextoContrato): SugerenciaAutoComplete[] {
    const sugerencias: SugerenciaAutoComplete[] = [];
    const clienteKey = contexto.clienteNombre?.toLowerCase().replace(/\s+/g, '-');

    // Sugerencia basada en historial del cliente
    if (clienteKey && historicoClientes[clienteKey]) {
      const historial = historicoClientes[clienteKey];
      const valorSugerido = Math.round(historial.promedioValor * (1 + historial.tendenciaValor / 100));
      
      sugerencias.push({
        id: 'valor-historial',
        campo: 'valor',
        valor: valorSugerido,
        confianza: 92,
        razon: `Basado en historial del cliente (+${historial.tendenciaValor}% tendencia YoY)`,
        fuente: 'historial'
      });

      // Sugerencia del último contrato
      sugerencias.push({
        id: 'valor-ultimo',
        campo: 'valor',
        valor: historial.ultimoContrato.valor,
        confianza: 85,
        razon: 'Mismo valor que el último contrato',
        fuente: 'historial'
      });
    }

    // Sugerencia basada en benchmark de industria
    if (contexto.industria) {
      const benchKey = contexto.industria.toLowerCase().replace(/\s+/g, '_');
      const benchmark = benchmarksIndustria[benchKey];
      if (benchmark) {
        sugerencias.push({
          id: 'valor-benchmark',
          campo: 'valor',
          valor: benchmark.valorPromedioContrato,
          confianza: 75,
          razon: `Promedio de industria ${benchmark.industria}`,
          fuente: 'benchmark'
        });
      }
    }

    // Sugerencia basada en IA predictiva
    if (contexto.valorEstimado) {
      sugerencias.push({
        id: 'valor-prediccion',
        campo: 'valor',
        valor: Math.round(contexto.valorEstimado * 1.1), // 10% sobre estimación
        confianza: 70,
        razon: 'Predicción IA basada en potencial detectado',
        fuente: 'prediccion'
      });
    }

    return sugerencias;
  }

  /**
   * Sugiere descuento
   */
  private sugerirDescuento(contexto: ContextoContrato): SugerenciaAutoComplete[] {
    const sugerencias: SugerenciaAutoComplete[] = [];
    const clienteKey = contexto.clienteNombre?.toLowerCase().replace(/\s+/g, '-');

    // Basado en historial
    if (clienteKey && historicoClientes[clienteKey]) {
      const descuentoAnterior = historicoClientes[clienteKey].ultimoContrato.descuento;
      
      sugerencias.push({
        id: 'descuento-historial',
        campo: 'descuento',
        valor: descuentoAnterior,
        confianza: 90,
        razon: 'Mismo descuento que el contrato anterior',
        fuente: 'historial'
      });

      // Sugerir reducción si hay crecimiento
      if (historicoClientes[clienteKey].tendenciaValor > 10) {
        sugerencias.push({
          id: 'descuento-reducido',
          campo: 'descuento',
          valor: Math.max(descuentoAnterior - 3, 5),
          confianza: 75,
          razon: 'Reducir descuento por crecimiento sostenido del cliente',
          fuente: 'prediccion'
        });
      }
    }

    // Basado en valor del contrato
    const valorContrato = contexto.camposCompletados.valor as number;
    if (valorContrato) {
      let descuentoSugerido = 10;
      if (valorContrato > 100000000) descuentoSugerido = 15;
      if (valorContrato > 200000000) descuentoSugerido = 18;
      if (valorContrato > 500000000) descuentoSugerido = 22;

      sugerencias.push({
        id: 'descuento-volumen',
        campo: 'descuento',
        valor: descuentoSugerido,
        confianza: 80,
        razon: `Descuento por volumen según valor $${(valorContrato / 1000000).toFixed(0)}M`,
        fuente: 'patron'
      });
    }

    return sugerencias;
  }

  /**
   * Sugiere días de pago
   */
  private sugerirDiasPago(contexto: ContextoContrato): SugerenciaAutoComplete[] {
    const sugerencias: SugerenciaAutoComplete[] = [];
    const clienteKey = contexto.clienteNombre?.toLowerCase().replace(/\s+/g, '-');

    // Historial del cliente
    if (clienteKey && historicoClientes[clienteKey]) {
      sugerencias.push({
        id: 'dias-historial',
        campo: 'diasPago',
        valor: historicoClientes[clienteKey].ultimoContrato.diasPago,
        confianza: 92,
        razon: 'Términos de pago habituales del cliente',
        fuente: 'historial'
      });
    }

    // Benchmark de industria
    if (contexto.industria) {
      const benchKey = contexto.industria.toLowerCase().replace(/\s+/g, '_');
      const benchmark = benchmarksIndustria[benchKey];
      if (benchmark) {
        sugerencias.push({
          id: 'dias-benchmark',
          campo: 'diasPago',
          valor: benchmark.diasPagoPromedio,
          confianza: 75,
          razon: `Estándar de industria ${benchmark.industria}`,
          fuente: 'benchmark'
        });
      }
    }

    // Valores estándar
    sugerencias.push(
      { id: 'dias-30', campo: 'diasPago', valor: 30, confianza: 60, razon: 'Término estándar 30 días', fuente: 'patron' },
      { id: 'dias-45', campo: 'diasPago', valor: 45, confianza: 55, razon: 'Término estándar 45 días', fuente: 'patron' }
    );

    return sugerencias;
  }

  /**
   * Sugiere duración del contrato
   */
  private sugerirDuracion(contexto: ContextoContrato): SugerenciaAutoComplete[] {
    const sugerencias: SugerenciaAutoComplete[] = [];
    const clienteKey = contexto.clienteNombre?.toLowerCase().replace(/\s+/g, '-');

    if (clienteKey && historicoClientes[clienteKey]) {
      const duracionAnterior = historicoClientes[clienteKey].ultimoContrato.duracionMeses;
      
      sugerencias.push({
        id: 'duracion-historial',
        campo: 'duracion',
        valor: duracionAnterior,
        confianza: 88,
        razon: `Duración del contrato anterior: ${duracionAnterior} meses`,
        fuente: 'historial'
      });

      // Sugerir extensión si relación exitosa
      if (historicoClientes[clienteKey].tendenciaValor > 5) {
        sugerencias.push({
          id: 'duracion-extendida',
          campo: 'duracion',
          valor: Math.min(duracionAnterior + 6, 24),
          confianza: 72,
          razon: 'Extensión recomendada por relación exitosa',
          fuente: 'prediccion'
        });
      }
    }

    // Estándar
    sugerencias.push(
      { id: 'duracion-12', campo: 'duracion', valor: 12, confianza: 65, razon: 'Duración anual estándar', fuente: 'patron' },
      { id: 'duracion-6', campo: 'duracion', valor: 6, confianza: 55, razon: 'Duración semestral', fuente: 'patron' }
    );

    return sugerencias;
  }

  /**
   * Sugiere fecha de inicio
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private sugerirFechaInicio(_contexto: ContextoContrato): SugerenciaAutoComplete[] {
    const hoy = new Date();
    const primeroDeMesSiguiente = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 1);
    const enUNaSemana = new Date(hoy.getTime() + 7 * 24 * 60 * 60 * 1000);

    return [
      {
        id: 'fecha-mes-siguiente',
        campo: 'fechaInicio',
        valor: primeroDeMesSiguiente.toISOString().split('T')[0],
        confianza: 85,
        razon: 'Inicio el primer día del mes siguiente',
        fuente: 'patron'
      },
      {
        id: 'fecha-semana',
        campo: 'fechaInicio',
        valor: enUNaSemana.toISOString().split('T')[0],
        confianza: 70,
        razon: 'Inicio en 7 días',
        fuente: 'patron'
      }
    ];
  }

  /**
   * Sugiere medios de comunicación
   */
  private sugerirMedios(contexto: ContextoContrato): SugerenciaAutoComplete[] {
    const sugerencias: SugerenciaAutoComplete[] = [];
    const clienteKey = contexto.clienteNombre?.toLowerCase().replace(/\s+/g, '-');

    if (clienteKey && historicoClientes[clienteKey]) {
      const mediosAnteriores = historicoClientes[clienteKey].ultimoContrato.medios;
      
      sugerencias.push({
        id: 'medios-historial',
        campo: 'medios',
        valor: mediosAnteriores.join(', '),
        confianza: 90,
        razon: 'Medios del contrato anterior',
        fuente: 'historial'
      });
    }

    // Sugerencias basadas en industria
    if (contexto.industria?.toLowerCase().includes('banca')) {
      sugerencias.push({
        id: 'medios-banca',
        campo: 'medios',
        valor: 'Radio, TV, Digital',
        confianza: 75,
        razon: 'Mix recomendado para sector financiero',
        fuente: 'benchmark'
      });
    }

    if (contexto.industria?.toLowerCase().includes('retail')) {
      sugerencias.push({
        id: 'medios-retail',
        campo: 'medios',
        valor: 'Radio, Digital, Vía Pública',
        confianza: 75,
        razon: 'Mix alto impacto para retail',
        fuente: 'benchmark'
      });
    }

    return sugerencias;
  }

  /**
   * Sugiere cláusulas
   */
  private sugerirClausulas(contexto: ContextoContrato): SugerenciaAutoComplete[] {
    const sugerencias: SugerenciaAutoComplete[] = [];

    // Basado en industria
    if (contexto.industria) {
      const benchKey = contexto.industria.toLowerCase().replace(/\s+/g, '_');
      const benchmark = benchmarksIndustria[benchKey];
      if (benchmark) {
        sugerencias.push({
          id: 'clausulas-industria',
          campo: 'clausulas',
          valor: benchmark.clausulasComunes.join(', '),
          confianza: 82,
          razon: `Cláusulas típicas para ${benchmark.industria}`,
          fuente: 'benchmark'
        });
      }
    }

    // Basado en valor del contrato
    const valorContrato = contexto.camposCompletados.valor as number;
    if (valorContrato && valorContrato > 100000000) {
      sugerencias.push({
        id: 'clausulas-alto-valor',
        campo: 'clausulas',
        valor: 'garantia_cumplimiento, penalizacion_cancelacion, revision_trimestral',
        confianza: 78,
        razon: 'Cláusulas de protección para contratos de alto valor',
        fuente: 'patron'
      });
    }

    return sugerencias;
  }

  /**
   * Obtiene sugerencias en tiempo real mientras el usuario escribe
   */
  async getRealtimeSuggestions(
    campo: string,
    valorParcial: string,
    contexto: ContextoContrato
  ): Promise<SugerenciaAutoComplete[]> {
    // Simular latencia de IA
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const todasSugerencias = await this.getSugerencias(campo, contexto);
    
    // Filtrar por valor parcial si aplica
    if (valorParcial && typeof todasSugerencias[0]?.valor === 'string') {
      return todasSugerencias.filter(s => 
        String(s.valor).toLowerCase().includes(valorParcial.toLowerCase())
      );
    }

    return todasSugerencias;
  }

  /**
   * Aprende de la selección del usuario para mejorar futuras sugerencias
   */
  async registrarSeleccion(
    campo: string,
    valorSeleccionado: string | number,
    sugerenciaUsada: string | null,
    contexto: ContextoContrato
  ): Promise<void> {
    logger.info('Registrando selección para aprendizaje:', {
      campo,
      valorSeleccionado,
      sugerenciaUsada,
      clienteId: contexto.clienteId
    });
    // Aquí iría la lógica de feedback al modelo de IA
  }
}

// ═══════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════

export const AIAutoComplete = AIAutoCompleteEngine.getInstance();

// Hook para uso en componentes React
export function useAIAutoComplete() {
  return AIAutoComplete;
}
