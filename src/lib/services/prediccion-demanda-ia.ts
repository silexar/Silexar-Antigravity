/**
 * 🔮 SILEXAR PULSE - Predicción de Demanda IA
 * 
 * @description Motor de predicción de demanda para:
 * - Forecast de qué espacios se venderán
 * - Predicción de ingresos por período
 * - Optimización de inventario
 * - Alertas de oportunidades
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export interface PrediccionEspacio {
  emisoraId: string;
  emisoraNombre: string;
  bloque: string;
  horario: string;
  fecha: Date;
  demandaPredicha: number; // 0-100
  precioSugerido: number;
  clientesProbables: { clienteId: string; nombre: string; probabilidad: number }[];
  factores: string[];
}

export interface ForecastIngresos {
  periodo: string;
  ingresoBase: number;
  ingresoOptimista: number;
  ingresoPesimista: number;
  probabilidadCumplimiento: number;
  factoresPositivos: string[];
  factoresRiesgo: string[];
  oportunidadesPerdidas: { descripcion: string; valorEstimado: number }[];
}

export interface OptimizacionInventario {
  emisoraId: string;
  recomendaciones: {
    tipo: 'aumentar_precio' | 'bajar_precio' | 'promocionar' | 'reservar';
    bloque: string;
    razon: string;
    impactoEstimado: number;
  }[];
  espaciosSobrevendidos: { bloque: string; exceso: number }[];
  espaciosSubutilizados: { bloque: string; disponibles: number; valor: number }[];
}

export interface TendenciaMercado {
  categoria: string;
  tendencia: 'subiendo' | 'estable' | 'bajando';
  variacion: number;
  prediccion30dias: number;
  factores: string[];
}

// ═══════════════════════════════════════════════════════════════
// PREDICCIÓN DEMANDA IA
// ═══════════════════════════════════════════════════════════════

export class PrediccionDemandaIA {

  /**
   * Predice demanda para un bloque horario específico
   */
  static predecirDemandaBloque(
    emisoraId: string,
    bloque: string,
    fecha: Date
  ): PrediccionEspacio {
    
    const mesActual = fecha.getMonth() + 1;
    const diaSemana = fecha.getDay();
    
    // Factores base de demanda
    let demanda = 50;
    const factores: string[] = [];
    
    // Factor temporada
    if ([12, 1, 2, 3].includes(mesActual)) {
      demanda += 25;
      factores.push('Temporada alta (verano/navidad)');
    } else if ([6, 7, 8].includes(mesActual)) {
      demanda -= 15;
      factores.push('Temporada baja (invierno)');
    }
    
    // Factor día de la semana
    if (diaSemana >= 1 && diaSemana <= 4) {
      demanda += 10;
      factores.push('Día laboral fuerte');
    } else if (diaSemana === 5) {
      demanda += 5;
      factores.push('Viernes (demanda moderada)');
    }
    
    // Factor bloque horario
    const bloqueMultiplicadores: Record<string, number> = {
      'prime': 35,
      'morning': 20,
      'midday': 15,
      'afternoon': 10,
      'night': -5,
      'late_night': -20
    };
    demanda += bloqueMultiplicadores[bloque] || 0;
    if (bloque === 'prime') factores.push('Horario prime alta demanda');
    
    // Normalizar demanda
    demanda = Math.max(10, Math.min(95, demanda));
    
    // Precio sugerido basado en demanda
    const precioBase = 45000;
    const factorDemanda = 0.5 + (demanda / 100);
    const precioSugerido = Math.round(precioBase * factorDemanda);
    
    // Clientes probables (mock)
    const clientesProbables = [
      { clienteId: 'cli-001', nombre: 'Empresa ABC', probabilidad: 75 },
      { clienteId: 'cli-002', nombre: 'Servicios XYZ', probabilidad: 45 },
      { clienteId: 'cli-003', nombre: 'Comercial DEF', probabilidad: 30 }
    ].filter(_ => Math.random() > 0.3);
    
    return {
      emisoraId,
      emisoraNombre: 'Radio Ejemplo FM',
      bloque,
      horario: this.bloqueAHorario(bloque),
      fecha,
      demandaPredicha: demanda,
      precioSugerido,
      clientesProbables,
      factores
    };
  }

  /**
   * Genera forecast de ingresos para un período
   */
  static forecastIngresos(
    tenantId: string,
    anio: number,
    mes: number
  ): ForecastIngresos {
    
    const isMesAlto = [12, 1, 2, 3].includes(mes);
    const isMesBajo = [6, 7, 8].includes(mes);
    
    // Ingresos base históricos (mock)
    const historicoPromedio = 85000000;
    
    let factorTemporada = 1;
    if (isMesAlto) factorTemporada = 1.35;
    if (isMesBajo) factorTemporada = 0.75;
    
    const ingresoBase = Math.round(historicoPromedio * factorTemporada);
    const ingresoOptimista = Math.round(ingresoBase * 1.20);
    const ingresoPesimista = Math.round(ingresoBase * 0.80);
    
    const factoresPositivos: string[] = [];
    const factoresRiesgo: string[] = [];
    
    if (isMesAlto) {
      factoresPositivos.push('Temporada alta');
      factoresPositivos.push('Campañas de fin de año activas');
    }
    
    if (isMesBajo) {
      factoresRiesgo.push('Temporada baja');
      factoresRiesgo.push('Presupuestos corporativos reducidos');
    }
    
    // Siempre hay factores genéricos
    factoresPositivos.push('Pipeline de oportunidades sólido');
    factoresRiesgo.push('Competencia activa en el mercado');
    
    // Oportunidades perdidas (mock)
    const oportunidadesPerdidas = [
      { descripcion: 'Cliente X eligió competencia', valorEstimado: 8500000 },
      { descripcion: 'Presupuesto recortado de Cliente Y', valorEstimado: 3200000 }
    ];
    
    return {
      periodo: `${anio}-${mes.toString().padStart(2, '0')}`,
      ingresoBase,
      ingresoOptimista,
      ingresoPesimista,
      probabilidadCumplimiento: isMesAlto ? 85 : isMesBajo ? 65 : 75,
      factoresPositivos,
      factoresRiesgo,
      oportunidadesPerdidas
    };
  }

  /**
   * Optimiza inventario de espacios
   */
  static optimizarInventario(emisoraId: string): OptimizacionInventario {
    const recomendaciones = [
      { tipo: 'aumentar_precio' as const, bloque: 'prime', razon: 'Demanda superior al 85% de capacidad', impactoEstimado: 2500000 },
      { tipo: 'promocionar' as const, bloque: 'late_night', razon: 'Ocupación inferior al 30%', impactoEstimado: 1200000 },
      { tipo: 'reservar' as const, bloque: 'morning', razon: 'Cliente VIP solicitó disponibilidad', impactoEstimado: 5000000 }
    ];
    
    return {
      emisoraId,
      recomendaciones,
      espaciosSobrevendidos: [
        { bloque: 'prime', exceso: 3 }
      ],
      espaciosSubutilizados: [
        { bloque: 'late_night', disponibles: 45, valor: 900000 },
        { bloque: 'weekend', disponibles: 30, valor: 600000 }
      ]
    };
  }

  /**
   * Analiza tendencias de mercado
   */
  static analizarTendencias(): TendenciaMercado[] {
    return [
      {
        categoria: 'Radio FM',
        tendencia: 'estable',
        variacion: 2,
        prediccion30dias: 3,
        factores: ['Audiencia estable', 'Competencia digital creciente']
      },
      {
        categoria: 'Podcast',
        tendencia: 'subiendo',
        variacion: 15,
        prediccion30dias: 20,
        factores: ['Crecimiento de audio digital', 'Nuevos formatos']
      },
      {
        categoria: 'Programmatic Audio',
        tendencia: 'subiendo',
        variacion: 25,
        prediccion30dias: 30,
        factores: ['Adopción de DSPs', 'Automatización de compra']
      },
      {
        categoria: 'Patrocinios',
        tendencia: 'estable',
        variacion: -1,
        prediccion30dias: 2,
        factores: ['Presupuestos grandes estables', 'Ciclos de renovación']
      }
    ];
  }

  /**
   * Detecta oportunidades de venta basadas en patrones
   */
  static detectarOportunidades(): {
    tipo: 'renovacion' | 'expansion' | 'reactivacion' | 'cross_sell';
    cliente: string;
    descripcion: string;
    valorEstimado: number;
    urgencia: 'baja' | 'media' | 'alta';
    accionSugerida: string;
  }[] {
    return [
      {
        tipo: 'renovacion',
        cliente: 'Empresa ABC',
        descripcion: 'Contrato vence en 15 días',
        valorEstimado: 24000000,
        urgencia: 'alta',
        accionSugerida: 'Agendar reunión de renovación esta semana'
      },
      {
        tipo: 'expansion',
        cliente: 'Servicios XYZ',
        descripcion: 'Cliente con ROI alto, potencial de upsell',
        valorEstimado: 8000000,
        urgencia: 'media',
        accionSugerida: 'Proponer patrocinio de programa'
      },
      {
        tipo: 'reactivacion',
        cliente: 'Comercial DEF',
        descripcion: 'Sin actividad 6 meses, antes cliente frecuente',
        valorEstimado: 12000000,
        urgencia: 'media',
        accionSugerida: 'Llamar con oferta especial de retorno'
      },
      {
        tipo: 'cross_sell',
        cliente: 'Tech Solutions',
        descripcion: 'Solo usa radio, perfil ideal para digital',
        valorEstimado: 5000000,
        urgencia: 'baja',
        accionSugerida: 'Presentar paquete radio+digital'
      }
    ];
  }

  /**
   * Proyecta ocupación de inventario
   */
  static proyectarOcupacion(emisoraId: string, diasAdelante: number): {
    fecha: string;
    ocupacionPrime: number;
    ocupacionRotativo: number;
    ingresoProyectado: number;
  }[] {
    const proyeccion = [];
    const hoy = new Date();
    
    for (let i = 0; i < diasAdelante; i++) {
      const fecha = new Date(hoy);
      fecha.setDate(fecha.getDate() + i);
      
      // Ocupación decrece en el futuro
      const factorFuturo = Math.max(0.3, 1 - (i * 0.02));
      
      proyeccion.push({
        fecha: fecha.toISOString().split('T')[0],
        ocupacionPrime: Math.round(85 * factorFuturo),
        ocupacionRotativo: Math.round(60 * factorFuturo),
        ingresoProyectado: Math.round(3500000 * factorFuturo)
      });
    }
    
    return proyeccion;
  }

  /**
   * Helper: Convierte bloque a horario legible
   */
  private static bloqueAHorario(bloque: string): string {
    const horarios: Record<string, string> = {
      'prime': '18:00 - 21:00',
      'morning': '06:00 - 10:00',
      'midday': '10:00 - 14:00',
      'afternoon': '14:00 - 18:00',
      'night': '21:00 - 00:00',
      'late_night': '00:00 - 06:00'
    };
    return horarios[bloque] || bloque;
  }
}

export default PrediccionDemandaIA;
