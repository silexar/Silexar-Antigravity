/**
 * 🤖 SILEXAR PULSE - Asistente Comercial IA
 * 
 * @description Copilot inteligente para ejecutivos de ventas:
 * - Respuestas instantáneas sobre inventario, precios, disponibilidad
 * - Brief automático de clientes
 * - Análisis de objeciones
 * - Predicción de cierre
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export interface ConsultaAsistente {
  tipo: 'precio' | 'disponibilidad' | 'cliente' | 'producto' | 'objecion' | 'general';
  consulta: string;
  contexto?: {
    clienteId?: string;
    productoId?: string;
    montoDiscutido?: number;
  };
}

export interface RespuestaAsistente {
  respuesta: string;
  tipo: 'informacion' | 'sugerencia' | 'accion' | 'alerta';
  datos?: Record<string, unknown>;
  accionesSugeridas?: { label: string; accion: string; params?: Record<string, unknown> }[];
  fuentes?: string[];
  confianza: number; // 0-100
}

export interface BriefCliente {
  clienteId: string;
  nombre: string;
  resumenEjecutivo: string;
  metricas: {
    inversionTotal: number;
    campanasActivas: number;
    antiguedad: number;
    scoreSatisfaccion: number;
  };
  ultimasInteracciones: { fecha: Date; tipo: string; resumen: string }[];
  oportunidades: { tipo: string; descripcion: string; potencial: number }[];
  alertas: string[];
  temasEvitar: string[];
  temasRecomendados: string[];
}

export interface AnalisisObjecion {
  objecion: string;
  categoría: 'precio' | 'tiempo' | 'competencia' | 'decision' | 'necesidad';
  severidad: 'baja' | 'media' | 'alta';
  respuestasSugeridas: string[];
  datosApoyo: { dato: string; fuente: string }[];
  probabilidadSuperarla: number;
}

export interface PrediccionCierre {
  oportunidadId: string;
  probabilidadCierre: number;
  factoresPositivos: string[];
  factoresNegativos: string[];
  accionesRecomendadas: string[];
  tiempoEstimado: string;
  montoEstimado: number;
}

// ═══════════════════════════════════════════════════════════════
// ASISTENTE COMERCIAL IA
// ═══════════════════════════════════════════════════════════════

export class AsistenteComercialIA {

  /**
   * Procesa una consulta del ejecutivo y genera respuesta inteligente
   */
  static async procesarConsulta(consulta: ConsultaAsistente): Promise<RespuestaAsistente> {
    const query = consulta.consulta.toLowerCase();
    
    // Detectar intención
    if (query.includes('precio') || query.includes('cuánto') || query.includes('costo')) {
      return this.responderPrecio(consulta);
    }
    
    if (query.includes('disponib') || query.includes('inventario') || query.includes('espacios')) {
      return this.responderDisponibilidad(consulta);
    }
    
    if (query.includes('cliente') || query.includes('quién es') || query.includes('información de')) {
      return this.responderInfoCliente(consulta);
    }
    
    if (query.includes('objeción') || query.includes('caro') || query.includes('competencia')) {
      return this.responderObjecion(consulta);
    }
    
    if (query.includes('descuento') || query.includes('oferta')) {
      return this.responderDescuento(consulta);
    }
    
    // Respuesta general
    return {
      respuesta: 'Puedo ayudarte con: precios, disponibilidad, información de clientes, manejo de objeciones y descuentos. ¿Qué necesitas saber?',
      tipo: 'informacion',
      confianza: 80,
      accionesSugeridas: [
        { label: '📊 Ver precios', accion: 'mostrar_tarifario', params: {} },
        { label: '📅 Ver disponibilidad', accion: 'mostrar_disponibilidad', params: {} },
        { label: '👥 Buscar cliente', accion: 'buscar_cliente', params: {} }
      ]
    };
  }

  /**
   * Responde consultas de precio
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private static responderPrecio(_consulta: ConsultaAsistente): RespuestaAsistente {
    return {
      respuesta: `**Precios actuales (Dic 2025):**

• Spot 30" Prime: $67,500 (temporada alta)
• Spot 30" Rotativo: $45,000
• Spot 15" Prime: $42,000
• Spot 15" Rotativo: $28,000
• Mención en vivo: $35,000
• Patrocinio programa: desde $500,000

💡 **Tip:** En enero los precios bajan 20% por temporada baja.`,
      tipo: 'informacion',
      datos: {
        spot30Prime: 67500,
        spot30Rotativo: 45000,
        spot15Prime: 42000,
        spot15Rotativo: 28000
      },
      confianza: 95,
      accionesSugeridas: [
        { label: '💰 Generar cotización', accion: 'abrir_cotizador', params: {} },
        { label: '📋 Ver tarifario completo', accion: 'ver_tarifario', params: {} }
      ],
      fuentes: ['Tarifario 2025 v3.1']
    };
  }

  /**
   * Responde consultas de disponibilidad
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private static responderDisponibilidad(_consulta: ConsultaAsistente): RespuestaAsistente {
    return {
      respuesta: `**Disponibilidad próximas 2 semanas:**

🟢 **Alta disponibilidad:**
• Horario madrugada (00:00 - 06:00)
• Fines de semana rotativo

🟡 **Disponibilidad media:**
• Rotativo mañana (06:00 - 12:00)
• Tarde rotativo (12:00 - 18:00)

🔴 **Baja disponibilidad:**
• Prime 18:00 - 21:00 (solo 3 espacios)
• Programa "Buenos Días Chile" (AGOTADO)

⚠️ **Alerta:** Navidad y Año Nuevo ya están 80% vendidos.`,
      tipo: 'informacion',
      datos: {
        altaDisponibilidad: ['madrugada', 'fds_rotativo'],
        bajaDisponibilidad: ['prime', 'buenos_dias']
      },
      confianza: 90,
      accionesSugeridas: [
        { label: '📅 Ver calendario', accion: 'abrir_calendario', params: {} },
        { label: '🔔 Avisar cuando haya espacio', accion: 'crear_alerta', params: { programa: 'prime' } }
      ]
    };
  }

  /**
   * Responde consultas sobre cliente
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private static responderInfoCliente(_consulta: ConsultaAsistente): RespuestaAsistente {
    return {
      respuesta: `**Información del cliente:**

No especificaste cliente. Puedo buscar por:
• Nombre o razón social
• RUT
• Código de cliente

¿Cuál cliente necesitas consultar?`,
      tipo: 'informacion',
      confianza: 70,
      accionesSugeridas: [
        { label: '🔍 Buscar cliente', accion: 'buscar_cliente', params: {} },
        { label: '📋 Mis clientes asignados', accion: 'ver_cartera', params: {} }
      ]
    };
  }

  /**
   * Responde y ayuda con objeciones
   */
  private static responderObjecion(consulta: ConsultaAsistente): RespuestaAsistente {
    const query = consulta.consulta.toLowerCase();
    
    if (query.includes('caro') || query.includes('precio alto')) {
      return {
        respuesta: `**Manejo de objeción "Precio Alto":**

📌 **Respuestas sugeridas:**

1. "Entiendo la preocupación. ¿Comparando con qué referencia?"

2. "Nuestro CPM es de $X, que está 15% por debajo del promedio de mercado"

3. "Si extendemos a 3 meses, podemos ofrecer 12% de descuento"

📊 **Datos de apoyo:**
• Rating promedio: 8.2 (top 5 del país)
• Alcance: 1.2M personas/día
• ROI clientes similares: 4.5x

💡 **Tip:** Cambiar de precio a VALOR. Pregunta qué resultado espera y calcula ROI.`,
        tipo: 'sugerencia',
        datos: { tipoObjecion: 'precio', probabilidadSuperar: 75 },
        confianza: 88,
        accionesSugeridas: [
          { label: '📊 Calcular ROI', accion: 'calcular_roi', params: {} },
          { label: '💰 Simular descuento', accion: 'simular_descuento', params: {} }
        ]
      };
    }
    
    if (query.includes('competencia')) {
      return {
        respuesta: `**Manejo de objeción "Competencia":**

📌 **Respuestas sugeridas:**

1. "¿Qué emisora están considerando? Así puedo comparar beneficios"

2. "Nuestro diferencial es el perfil ABC1-C2 con poder adquisitivo real"

3. "Ofrecemos medición en tiempo real, algo que [competencia] no tiene"

📊 **Ventajas competitivas:**
• Audiencia premium verificada
• Reportes en tiempo real
• Flexibilidad de pauta
• Integración digital incluida`,
        tipo: 'sugerencia',
        confianza: 85,
        accionesSugeridas: [
          { label: '📊 Comparar con competencia', accion: 'comparar_emisoras', params: {} }
        ]
      };
    }
    
    return {
      respuesta: 'Describe la objeción del cliente y te ayudo a manejarla.',
      tipo: 'informacion',
      confianza: 60
    };
  }

  /**
   * Responde sobre descuentos
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private static responderDescuento(_consulta: ConsultaAsistente): RespuestaAsistente {
    return {
      respuesta: `**Política de descuentos vigente:**

📊 **Por volumen:**
• > $20M inversión: 5%
• > $50M inversión: 10%
• > $100M inversión: 15%

⏰ **Por pago anticipado:**
• Pago 15 días: 3%
• Pago contado: 5%

📅 **Por compromiso:**
• Contrato trimestral: 8%
• Contrato semestral: 12%
• Contrato anual: 18%

⚠️ **Máximo acumulable:** 25%

💡 Para descuentos especiales > 25%, requiere aprobación de Gerencia.`,
      tipo: 'informacion',
      confianza: 95,
      accionesSugeridas: [
        { label: '💰 Simular descuento', accion: 'simular_descuento', params: {} },
        { label: '📝 Solicitar aprobación especial', accion: 'solicitar_descuento', params: {} }
      ],
      fuentes: ['Política Comercial 2025']
    };
  }

  /**
   * Genera brief completo de un cliente para reunión
   */
  static async generarBriefCliente(clienteId: string): Promise<BriefCliente> {
    // En producción esto vendría de la BD
    return {
      clienteId,
      nombre: 'Empresa ABC Ltda',
      resumenEjecutivo: 'Cliente premium desde 2020. Inversión creciente. Preferencia por horarios prime y programas deportivos. Pago puntual.',
      metricas: {
        inversionTotal: 180000000,
        campanasActivas: 3,
        antiguedad: 5,
        scoreSatisfaccion: 92
      },
      ultimasInteracciones: [
        { fecha: new Date('2025-12-10'), tipo: 'Reunión', resumen: 'Presentación propuesta Q1 2026' },
        { fecha: new Date('2025-11-28'), tipo: 'Email', resumen: 'Solicitud de disponibilidad febrero' },
        { fecha: new Date('2025-11-15'), tipo: 'Llamada', resumen: 'Consulta sobre patrocinio evento' }
      ],
      oportunidades: [
        { tipo: 'upsell', descripcion: 'Agregar digital a campaña actual', potencial: 8000000 },
        { tipo: 'cross_sell', descripcion: 'Patrocinio programa deportivo', potencial: 15000000 }
      ],
      alertas: [
        'Factura #45678 vence en 5 días',
        'Competidor X les presentó propuesta la semana pasada'
      ],
      temasEvitar: [
        'No mencionar incidente de pauta octubre 2024 (ya resuelto)',
        'Evitar comparaciones con Radio Futuro (ex empleador del contacto)'
      ],
      temasRecomendados: [
        'Nuevo programa matinal tiene su target exacto',
        'Resultados positivos campaña Black Friday',
        'Disponibilidad premium para verano'
      ]
    };
  }

  /**
   * Analiza una objeción específica
   */
  static analizarObjecion(objecion: string): AnalisisObjecion {
    const objecionLower = objecion.toLowerCase();
    
    let categoria: AnalisisObjecion['categoría'] = 'general' as 'precio';
    let severidad: AnalisisObjecion['severidad'] = 'media';
    
    if (objecionLower.includes('caro') || objecionLower.includes('precio') || objecionLower.includes('presupuesto')) {
      categoria = 'precio';
      severidad = 'alta';
    } else if (objecionLower.includes('tiempo') || objecionLower.includes('después') || objecionLower.includes('próximo')) {
      categoria = 'tiempo';
      severidad = 'media';
    } else if (objecionLower.includes('competencia') || objecionLower.includes('otra emisora')) {
      categoria = 'competencia';
      severidad = 'alta';
    }
    
    return {
      objecion,
      categoría: categoria,
      severidad,
      respuestasSugeridas: [
        'Entiendo su punto. ¿Qué necesitaría ver para que esto tenga sentido para ustedes?',
        'Muchos de nuestros mejores clientes tuvieron esa misma duda inicialmente...',
        '¿Puedo preguntarle qué alternativa está considerando?'
      ],
      datosApoyo: [
        { dato: 'ROI promedio clientes similares: 4.2x', fuente: 'Estudio interno Q3 2025' },
        { dato: 'Tasa de renovación: 87%', fuente: 'Métricas comerciales' }
      ],
      probabilidadSuperarla: severidad === 'alta' ? 55 : severidad === 'media' ? 70 : 85
    };
  }

  /**
   * Predice probabilidad de cierre de una oportunidad
   */
  static predecirCierre(oportunidad: {
    id: string;
    monto: number;
    diasEnPipeline: number;
    reunionesRealizadas: number;
    cotizacionEnviada: boolean;
    objecionesPendientes: number;
    decisionorIdentificado: boolean;
    competenciaDetectada: boolean;
  }): PrediccionCierre {
    let probabilidad = 30; // Base
    
    // Factores positivos
    if (oportunidad.cotizacionEnviada) probabilidad += 20;
    if (oportunidad.decisionorIdentificado) probabilidad += 15;
    if (oportunidad.reunionesRealizadas >= 2) probabilidad += 15;
    if (oportunidad.diasEnPipeline < 30) probabilidad += 10;
    
    // Factores negativos
    if (oportunidad.competenciaDetectada) probabilidad -= 15;
    if (oportunidad.objecionesPendientes > 0) probabilidad -= oportunidad.objecionesPendientes * 10;
    if (oportunidad.diasEnPipeline > 60) probabilidad -= 20;
    
    probabilidad = Math.max(5, Math.min(95, probabilidad));
    
    return {
      oportunidadId: oportunidad.id,
      probabilidadCierre: probabilidad,
      factoresPositivos: [
        oportunidad.cotizacionEnviada ? 'Cotización enviada' : '',
        oportunidad.decisionorIdentificado ? 'Decisor identificado' : '',
        oportunidad.reunionesRealizadas >= 2 ? 'Múltiples reuniones' : ''
      ].filter(Boolean),
      factoresNegativos: [
        oportunidad.competenciaDetectada ? 'Competencia activa' : '',
        oportunidad.objecionesPendientes > 0 ? `${oportunidad.objecionesPendientes} objeciones sin resolver` : '',
        oportunidad.diasEnPipeline > 60 ? 'Oportunidad estancada' : ''
      ].filter(Boolean),
      accionesRecomendadas: [
        !oportunidad.cotizacionEnviada ? 'Enviar cotización formal' : '',
        !oportunidad.decisionorIdentificado ? 'Identificar al decisor final' : '',
        oportunidad.objecionesPendientes > 0 ? 'Resolver objeciones pendientes' : '',
        oportunidad.competenciaDetectada ? 'Acelerar proceso, agregar urgencia' : ''
      ].filter(Boolean),
      tiempoEstimado: probabilidad > 70 ? '1-2 semanas' : probabilidad > 50 ? '2-4 semanas' : '1-2 meses',
      montoEstimado: oportunidad.monto
    };
  }
}

export default AsistenteComercialIA;
