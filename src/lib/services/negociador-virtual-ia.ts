/**
 * 🤖 SILEXAR PULSE - NEGOCIADOR VIRTUAL IA
 * 
 * @description IA que negocia autónomamente con clientes:
 * - Análisis de posición del cliente
 * - Generación de contra-ofertas óptimas
 * - Evaluación de concesiones
 * - Predicción de punto de acuerdo
 * - Estrategias de negociación personalizadas
 * 
 * @version 2030.0.0
 * @tier TIER_0_FORTUNE_10
 */

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export interface PerfilNegociador {
  clienteId: string;
  estilo: 'competitivo' | 'colaborativo' | 'evitativo' | 'acomodativo';
  sensibilidadPrecio: number; // 0-100
  valoraRelacion: number; // 0-100
  tiempoDisponible: 'urgente' | 'normal' | 'amplio';
  poderNegociacion: number; // 0-100
  historialConcesiones: number[]; // Porcentajes de concesiones anteriores
}

export interface Propuesta {
  id: string;
  tipo: 'inicial' | 'contra_oferta' | 'final' | 'ultimatum';
  precio: number;
  descuentoOfrecido: number;
  condiciones: string[];
  validezHoras: number;
  origen: 'vendedor' | 'cliente' | 'ia';
}

export interface EvaluacionPropuesta {
  propuesta: Propuesta;
  probabilidadAceptacion: number;
  valorParaNosotros: number;
  valorParaCliente: number;
  zonaAcuerdo: boolean;
  distanciaZOPA: number; // Distancia a la Zona de Posible Acuerdo
  recomendacion: 'aceptar' | 'rechazar' | 'contra_ofertar';
  razon: string;
}

export interface ContraOferta {
  precioSugerido: number;
  descuentoMaximoRecomendado: number;
  condicionesAgregar: string[];
  condicionesCeder: string[];
  argumentos: string[];
  tacticaRecomendada: string;
  probabilidadCierre: number;
}

export interface ResultadoNegociacion {
  exito: boolean;
  precioFinal: number;
  descuentoFinal: number;
  condicionesAcordadas: string[];
  rondasNegociacion: number;
  duracionMinutos: number;
  valorCapturado: number;
  aprendizajes: string[];
}

// ═══════════════════════════════════════════════════════════════
// NEGOCIADOR VIRTUAL IA
// ═══════════════════════════════════════════════════════════════

export class NegociadorVirtualIA {

  // Límites de la empresa
  private static limites = {
    descuentoMaximo: 25,
    margenMinimo: 15,
    precioMinimo: 0.75 // 75% del precio base
  };

  /**
   * Analiza el perfil del negociador del cliente
   */
  static analizarPerfilCliente(clienteId: string, historial?: {
    promedioDescuentoObtenido: number;
    tiempoPromedioNegociacion: number;
    tasaExito: number;
  }): PerfilNegociador {
    
    // Inferir estilo basado en historial
    let estilo: PerfilNegociador['estilo'] = 'colaborativo';
    if (historial) {
      if (historial.promedioDescuentoObtenido > 20) estilo = 'competitivo';
      else if (historial.tiempoPromedioNegociacion > 30) estilo = 'evitativo';
    }
    
    return {
      clienteId,
      estilo,
      sensibilidadPrecio: historial?.promedioDescuentoObtenido ? Math.min(100, historial.promedioDescuentoObtenido * 4) : 50,
      valoraRelacion: estilo === 'colaborativo' ? 80 : 40,
      tiempoDisponible: 'normal',
      poderNegociacion: historial?.tasaExito ? Math.round(historial.tasaExito * 100) : 50,
      historialConcesiones: [10, 8, 12, 5, 15]
    };
  }

  /**
   * Evalúa una propuesta del cliente
   */
  static evaluarPropuesta(
    propuesta: Propuesta,
    precioBase: number,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _perfilCliente: PerfilNegociador
  ): EvaluacionPropuesta {
    
    const descuentoSolicitado = ((precioBase - propuesta.precio) / precioBase) * 100;
    const enZonaAcuerdo = descuentoSolicitado <= this.limites.descuentoMaximo;
    const distancia = Math.max(0, descuentoSolicitado - this.limites.descuentoMaximo);
    
    // Calcular valor para ambas partes
    const valorParaNosotros = precioBase - propuesta.precio;
    const valorParaCliente = descuentoSolicitado; // Simplificado
    
    // Probabilidad de aceptación si aceptamos
    let probabilidadAceptacion = 90;
    if (propuesta.tipo === 'ultimatum') probabilidadAceptacion = 75;
    
    // Recomendación
    let recomendacion: EvaluacionPropuesta['recomendacion'];
    let razon: string;
    
    if (enZonaAcuerdo && descuentoSolicitado <= 15) {
      recomendacion = 'aceptar';
      razon = 'Dentro del margen objetivo, cerrar rápido';
    } else if (enZonaAcuerdo) {
      recomendacion = 'contra_ofertar';
      razon = 'Margen aceptable pero podemos mejorar';
    } else if (distancia <= 5) {
      recomendacion = 'contra_ofertar';
      razon = 'Cerca del límite, negociar condiciones';
    } else {
      recomendacion = 'rechazar';
      razon = 'Fuera de rango rentable';
    }
    
    return {
      propuesta,
      probabilidadAceptacion,
      valorParaNosotros,
      valorParaCliente,
      zonaAcuerdo: enZonaAcuerdo,
      distanciaZOPA: distancia,
      recomendacion,
      razon
    };
  }

  /**
   * Genera contra-oferta óptima
   */
  static generarContraOferta(
    propuestaCliente: Propuesta,
    precioBase: number,
    perfilCliente: PerfilNegociador,
    ronda: number
  ): ContraOferta {
    
    const descuentoSolicitado = ((precioBase - propuestaCliente.precio) / precioBase) * 100;
    
    // Estrategia basada en estilo del cliente
    let descuentoOfrecer: number;
    let tacticaRecomendada: string;
    
    switch (perfilCliente.estilo) {
      case 'competitivo':
        // Empezar bajo, subir gradualmente
        descuentoOfrecer = Math.min(this.limites.descuentoMaximo, 5 + ronda * 3);
        tacticaRecomendada = 'Mantener posición firme, conceder lentamente';
        break;
        
      case 'colaborativo':
        // Buscar punto medio rápido
        descuentoOfrecer = Math.min(this.limites.descuentoMaximo, (descuentoSolicitado + 5) / 2);
        tacticaRecomendada = 'Proponer solución win-win';
        break;
        
      case 'evitativo':
        // Ofrecer algo atractivo para cerrar rápido
        descuentoOfrecer = Math.min(this.limites.descuentoMaximo, 12);
        tacticaRecomendada = 'Simplificar la decisión, ofrecer paquete cerrado';
        break;
        
      default:
        descuentoOfrecer = Math.min(this.limites.descuentoMaximo, 10);
        tacticaRecomendada = 'Negociación estándar';
    }
    
    const precioSugerido = Math.round(precioBase * (1 - descuentoOfrecer / 100));
    
    // Condiciones a agregar para justificar descuento
    const condicionesAgregar: string[] = [];
    if (descuentoOfrecer >= 15) condicionesAgregar.push('Contrato mínimo 3 meses');
    if (descuentoOfrecer >= 20) condicionesAgregar.push('Pago a 15 días');
    if (descuentoOfrecer >= 10) condicionesAgregar.push('Exclusividad en horario');
    
    // Condiciones a ceder si el cliente insiste
    const condicionesCeder = [
      'Flexibilidad en fechas de pauta',
      'Ajuste de horarios específicos'
    ];
    
    // Argumentos de venta
    const argumentos = [
      `Nuestro valor diferencial es el alcance de ${perfilCliente.sensibilidadPrecio > 70 ? '1.2M oyentes' : 'audiencia premium'}`,
      `El ROI promedio de clientes similares es 4.2x`,
      `Incluimos reportes en tiempo real sin costo adicional`
    ];
    
    // Probabilidad de cierre con esta oferta
    const prob = Math.round(50 + (20 - Math.abs(descuentoOfrecer - descuentoSolicitado)) * 2);
    
    return {
      precioSugerido,
      descuentoMaximoRecomendado: Math.min(this.limites.descuentoMaximo, descuentoOfrecer + 5),
      condicionesAgregar,
      condicionesCeder,
      argumentos,
      tacticaRecomendada,
      probabilidadCierre: Math.min(95, Math.max(20, prob))
    };
  }

  /**
   * Predice el punto de acuerdo más probable
   */
  static predecirPuntoAcuerdo(
    precioBase: number,
    propuestaInicial: Propuesta,
    perfilCliente: PerfilNegociador
  ): {
    precioEsperado: number;
    descuentoEsperado: number;
    rondasEstimadas: number;
    confianza: number;
  } {
    // Calcular punto medio ponderado
    const descuentoSolicitado = ((precioBase - propuestaInicial.precio) / precioBase) * 100;
    const nuestroMinimo = 5;
    
    // El punto de acuerdo tiende hacia el más fuerte
    const pesoCliente = perfilCliente.poderNegociacion / 100;
    const descuentoEsperado = nuestroMinimo + (descuentoSolicitado - nuestroMinimo) * pesoCliente;
    
    const descuentoFinal = Math.min(this.limites.descuentoMaximo, Math.round(descuentoEsperado));
    const precioEsperado = Math.round(precioBase * (1 - descuentoFinal / 100));
    
    return {
      precioEsperado,
      descuentoEsperado: descuentoFinal,
      rondasEstimadas: perfilCliente.estilo === 'competitivo' ? 4 : perfilCliente.estilo === 'colaborativo' ? 2 : 3,
      confianza: 75 + Math.random() * 15
    };
  }

  /**
   * Genera script de negociación personalizado
   */
  static generarScriptNegociacion(perfilCliente: PerfilNegociador): {
    apertura: string;
    argumentosPrincipales: string[];
    manejoObjeciones: { objecion: string; respuesta: string }[];
    cierre: string;
  } {
    const estiloApertura: Record<string, string> = {
      competitivo: 'Entiendo que buscan el mejor precio. Permítanme mostrarles por qué nuestra propuesta es la más rentable...',
      colaborativo: 'Me encanta que podamos trabajar juntos en una solución que beneficie a ambos...',
      evitativo: 'Quiero simplificar esto. Tengo una propuesta todo incluido que creo les va a gustar...',
      acomodativo: 'Valoramos mucho la relación con ustedes. ¿Cómo podemos hacer que esto funcione?'
    };
    
    return {
      apertura: estiloApertura[perfilCliente.estilo] || estiloApertura.colaborativo,
      argumentosPrincipales: [
        'ROI demostrable con métricas en tiempo real',
        'Audiencia verificada por terceros independientes',
        'Flexibilidad que ningún competidor ofrece',
        'Soporte dedicado 24/7'
      ],
      manejoObjeciones: [
        { objecion: 'Es muy caro', respuesta: 'Entiendo. ¿Comparado con qué referencia? Nuestro CPM es 15% menor que el promedio' },
        { objecion: 'Lo voy a pensar', respuesta: 'Por supuesto. ¿Qué información adicional necesita para tomar la decisión?' },
        { objecion: 'La competencia ofrece más barato', respuesta: '¿Incluyen las mismas métricas y alcance? Comparemos manzanas con manzanas' }
      ],
      cierre: perfilCliente.estilo === 'competitivo' 
        ? 'Esta es nuestra mejor oferta. ¿Cerramos hoy?' 
        : '¿Qué les parece si avanzamos con el contrato?'
    };
  }
}

export default NegociadorVirtualIA;
