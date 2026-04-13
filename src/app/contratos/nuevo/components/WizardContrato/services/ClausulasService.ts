/**
 * 📚 SILEXAR PULSE - Servicio de Biblioteca de Cláusulas TIER 0
 * 
 * @description Sistema de gestión de cláusulas legales pre-aprobadas
 * con versionado, sugerencias IA y templates dinámicos.
 * 
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

import { logger } from '@/lib/observability';
import {
  ClausulaLegal,
  CategoriaClausula,
  VariableClausula
} from '../types/enterprise.types';

// ═══════════════════════════════════════════════════════════════
// CLÁUSULAS PREDEFINIDAS
// ═══════════════════════════════════════════════════════════════

const CLAUSULAS_BASE: Omit<ClausulaLegal, 'id' | 'fechaCreacion' | 'ultimaModificacion' | 'usosCount'>[] = [
  {
    codigo: 'CL-GEN-001',
    nombre: 'Objeto del Contrato',
    categoria: 'general',
    contenido: 'El presente contrato tiene por objeto regular la prestación de servicios publicitarios por parte de SILEXAR MEDIA GROUP SpA (en adelante "LA EMPRESA") al cliente {{CLIENTE_NOMBRE}} (en adelante "EL CLIENTE"), consistentes en la difusión de mensajes publicitarios a través de los medios y espacios que se detallan en el Anexo de Especificaciones.',
    contenidoHTML: '<p>El presente contrato tiene por objeto regular la prestación de servicios publicitarios por parte de <strong>SILEXAR MEDIA GROUP SpA</strong> (en adelante "LA EMPRESA") al cliente <strong>{{CLIENTE_NOMBRE}}</strong> (en adelante "EL CLIENTE"), consistentes en la difusión de mensajes publicitarios a través de los medios y espacios que se detallan en el Anexo de Especificaciones.</p>',
    variables: [
      { nombre: 'CLIENTE_NOMBRE', tipo: 'texto', requerida: true, fuenteAutomatica: 'anunciante.nombre' }
    ],
    version: 1,
    estado: 'aprobada',
    versionesAnteriores: [],
    aprobadoPor: 'Legal Corp.',
    fechaAprobacion: new Date('2024-01-15'),
    tiposContratoAplicables: ['nuevo', 'renovacion', 'programatico', 'marco_anual', 'express'],
    esObligatoria: true,
    esPredeterminada: true,
    orden: 1,
    sugerenciaIA: false,
    pesoRiesgo: 2,
    creadoPor: 'sistema',
    tags: ['obligatoria', 'general']
  },
  {
    codigo: 'CL-PAG-001',
    nombre: 'Condiciones de Pago',
    categoria: 'pago',
    contenido: 'EL CLIENTE se compromete a pagar el valor total del contrato de {{VALOR_NETO}} {{MONEDA}}, en un plazo máximo de {{DIAS_PAGO}} días desde la emisión de la factura correspondiente. El pago se realizará mediante {{FORMA_PAGO}}.',
    contenidoHTML: '<p>EL CLIENTE se compromete a pagar el valor total del contrato de <strong>{{VALOR_NETO}} {{MONEDA}}</strong>, en un plazo máximo de <strong>{{DIAS_PAGO}} días</strong> desde la emisión de la factura correspondiente. El pago se realizará mediante <strong>{{FORMA_PAGO}}</strong>.</p>',
    variables: [
      { nombre: 'VALOR_NETO', tipo: 'moneda', requerida: true, fuenteAutomatica: 'valorNeto' },
      { nombre: 'MONEDA', tipo: 'select', requerida: true, opciones: [{ valor: 'CLP', etiqueta: 'Pesos Chilenos' }, { valor: 'USD', etiqueta: 'Dólares' }, { valor: 'UF', etiqueta: 'UF' }], fuenteAutomatica: 'moneda' },
      { nombre: 'DIAS_PAGO', tipo: 'numero', requerida: true, fuenteAutomatica: 'terminosPago.diasPago' },
      { nombre: 'FORMA_PAGO', tipo: 'select', requerida: true, opciones: [{ valor: 'transferencia', etiqueta: 'Transferencia Bancaria' }, { valor: 'cheque', etiqueta: 'Cheque' }, { valor: 'tarjeta', etiqueta: 'Tarjeta de Crédito' }], valorPorDefecto: 'transferencia' }
    ],
    version: 1,
    estado: 'aprobada',
    versionesAnteriores: [],
    aprobadoPor: 'Legal Corp.',
    fechaAprobacion: new Date('2024-01-15'),
    tiposContratoAplicables: ['nuevo', 'renovacion', 'programatico', 'marco_anual', 'express'],
    esObligatoria: true,
    esPredeterminada: true,
    orden: 2,
    sugerenciaIA: false,
    pesoRiesgo: 5,
    creadoPor: 'sistema',
    tags: ['obligatoria', 'financiero']
  },
  {
    codigo: 'CL-PAG-002',
    nombre: 'Interés por Mora',
    categoria: 'pago',
    contenido: 'En caso de mora en el pago, EL CLIENTE deberá pagar un interés del {{INTERES_MORA}}% mensual sobre el monto adeudado, sin perjuicio del derecho de LA EMPRESA de suspender los servicios contratados hasta que se regularice el pago.',
    contenidoHTML: '<p>En caso de mora en el pago, EL CLIENTE deberá pagar un interés del <strong>{{INTERES_MORA}}%</strong> mensual sobre el monto adeudado, sin perjuicio del derecho de LA EMPRESA de suspender los servicios contratados hasta que se regularice el pago.</p>',
    variables: [
      { nombre: 'INTERES_MORA', tipo: 'porcentaje', requerida: true, valorPorDefecto: '1.5', validacion: '^[0-9]+(.[0-9]+)?$' }
    ],
    version: 1,
    estado: 'aprobada',
    versionesAnteriores: [],
    aprobadoPor: 'Legal Corp.',
    fechaAprobacion: new Date('2024-01-15'),
    tiposContratoAplicables: ['nuevo', 'renovacion', 'programatico', 'marco_anual'],
    esObligatoria: false,
    esPredeterminada: true,
    orden: 3,
    sugerenciaIA: true,
    condicionesSugerencia: 'anunciante.nivelRiesgo !== "bajo"',
    pesoRiesgo: 4,
    creadoPor: 'sistema',
    tags: ['financiero', 'penalizacion']
  },
  {
    codigo: 'CL-EXC-001',
    nombre: 'Exclusividad de Categoría',
    categoria: 'exclusividad',
    contenido: 'Durante la vigencia del presente contrato, LA EMPRESA se compromete a no difundir publicidad de competidores directos de EL CLIENTE en la categoría de {{CATEGORIA_EXCLUSIVA}} dentro de los espacios y horarios contratados.',
    contenidoHTML: '<p>Durante la vigencia del presente contrato, LA EMPRESA se compromete a no difundir publicidad de competidores directos de EL CLIENTE en la categoría de <strong>{{CATEGORIA_EXCLUSIVA}}</strong> dentro de los espacios y horarios contratados.</p>',
    variables: [
      { nombre: 'CATEGORIA_EXCLUSIVA', tipo: 'texto', requerida: true, descripcion: 'Categoría de producto o servicio con exclusividad' }
    ],
    version: 1,
    estado: 'aprobada',
    versionesAnteriores: [],
    aprobadoPor: 'Legal Corp.',
    fechaAprobacion: new Date('2024-01-15'),
    tiposContratoAplicables: ['nuevo', 'renovacion', 'marco_anual'],
    esObligatoria: false,
    esPredeterminada: false,
    orden: 10,
    sugerenciaIA: true,
    condicionesSugerencia: 'valorNeto > 50000000',
    pesoRiesgo: 6,
    creadoPor: 'sistema',
    tags: ['opcional', 'premium']
  },
  {
    codigo: 'CL-CON-001',
    nombre: 'Confidencialidad',
    categoria: 'confidencialidad',
    contenido: 'Las partes se comprometen a mantener estricta confidencialidad sobre toda la información comercial, técnica, financiera y de cualquier otra índole que sea intercambiada entre ellas con ocasión del presente contrato. Esta obligación se mantendrá vigente por un período de {{ANOS_CONFIDENCIALIDAD}} años contados desde la terminación del contrato.',
    contenidoHTML: '<p>Las partes se comprometen a mantener estricta confidencialidad sobre toda la información comercial, técnica, financiera y de cualquier otra índole que sea intercambiada entre ellas con ocasión del presente contrato. Esta obligación se mantendrá vigente por un período de <strong>{{ANOS_CONFIDENCIALIDAD}} años</strong> contados desde la terminación del contrato.</p>',
    variables: [
      { nombre: 'ANOS_CONFIDENCIALIDAD', tipo: 'numero', requerida: true, valorPorDefecto: '2', validacion: '^[1-9][0-9]*$' }
    ],
    version: 1,
    estado: 'aprobada',
    versionesAnteriores: [],
    aprobadoPor: 'Legal Corp.',
    fechaAprobacion: new Date('2024-01-15'),
    tiposContratoAplicables: ['nuevo', 'renovacion', 'programatico', 'marco_anual'],
    esObligatoria: false,
    esPredeterminada: true,
    orden: 15,
    sugerenciaIA: false,
    pesoRiesgo: 3,
    creadoPor: 'sistema',
    tags: ['estándar', 'legal']
  },
  {
    codigo: 'CL-TER-001',
    nombre: 'Terminación Anticipada',
    categoria: 'terminacion',
    contenido: 'Cualquiera de las partes podrá dar término anticipado al presente contrato, notificando por escrito a la otra parte con al menos {{DIAS_PREAVISO}} días de anticipación. En caso de terminación anticipada por parte de EL CLIENTE, deberá pagar una indemnización equivalente al {{PORCENTAJE_INDEMNIZACION}}% del valor no ejecutado del contrato.',
    contenidoHTML: '<p>Cualquiera de las partes podrá dar término anticipado al presente contrato, notificando por escrito a la otra parte con al menos <strong>{{DIAS_PREAVISO}} días</strong> de anticipación. En caso de terminación anticipada por parte de EL CLIENTE, deberá pagar una indemnización equivalente al <strong>{{PORCENTAJE_INDEMNIZACION}}%</strong> del valor no ejecutado del contrato.</p>',
    variables: [
      { nombre: 'DIAS_PREAVISO', tipo: 'numero', requerida: true, valorPorDefecto: '30' },
      { nombre: 'PORCENTAJE_INDEMNIZACION', tipo: 'porcentaje', requerida: true, valorPorDefecto: '50' }
    ],
    version: 1,
    estado: 'aprobada',
    versionesAnteriores: [],
    aprobadoPor: 'Legal Corp.',
    fechaAprobacion: new Date('2024-01-15'),
    tiposContratoAplicables: ['nuevo', 'renovacion', 'marco_anual'],
    esObligatoria: false,
    esPredeterminada: true,
    orden: 20,
    sugerenciaIA: true,
    condicionesSugerencia: 'true',
    pesoRiesgo: 7,
    creadoPor: 'sistema',
    tags: ['estándar', 'legal']
  },
  {
    codigo: 'CL-MAT-001',
    nombre: 'Entrega de Material Creativo',
    categoria: 'publicidad_medios',
    contenido: 'EL CLIENTE se obliga a entregar todo el material creativo necesario para la ejecución de la campaña con al menos {{DIAS_ANTICIPO}} días hábiles de anticipación a la fecha de inicio de la emisión. LA EMPRESA no será responsable por retrasos en la emisión derivados de la entrega tardía del material por parte de EL CLIENTE.',
    contenidoHTML: '<p>EL CLIENTE se obliga a entregar todo el material creativo necesario para la ejecución de la campaña con al menos <strong>{{DIAS_ANTICIPO}} días hábiles</strong> de anticipación a la fecha de inicio de la emisión. LA EMPRESA no será responsable por retrasos en la emisión derivados de la entrega tardía del material por parte de EL CLIENTE.</p>',
    variables: [
      { nombre: 'DIAS_ANTICIPO', tipo: 'numero', requerida: true, valorPorDefecto: '5' }
    ],
    version: 1,
    estado: 'aprobada',
    versionesAnteriores: [],
    aprobadoPor: 'Legal Corp.',
    fechaAprobacion: new Date('2024-01-15'),
    tiposContratoAplicables: ['nuevo', 'renovacion', 'programatico', 'marco_anual', 'express'],
    esObligatoria: true,
    esPredeterminada: true,
    orden: 5,
    sugerenciaIA: false,
    pesoRiesgo: 3,
    creadoPor: 'sistema',
    tags: ['obligatoria', 'operacional']
  },
  {
    codigo: 'CL-JUR-001',
    nombre: 'Jurisdicción y Ley Aplicable',
    categoria: 'jurisdiccion',
    contenido: 'Para todos los efectos legales derivados del presente contrato, las partes fijan su domicilio en la ciudad de {{CIUDAD_JURISDICCION}}, Chile, y se someten a la jurisdicción de sus tribunales ordinarios de justicia.',
    contenidoHTML: '<p>Para todos los efectos legales derivados del presente contrato, las partes fijan su domicilio en la ciudad de <strong>{{CIUDAD_JURISDICCION}}, Chile</strong>, y se someten a la jurisdicción de sus tribunales ordinarios de justicia.</p>',
    variables: [
      { nombre: 'CIUDAD_JURISDICCION', tipo: 'select', requerida: true, opciones: [{ valor: 'Santiago', etiqueta: 'Santiago' }, { valor: 'Valparaíso', etiqueta: 'Valparaíso' }, { valor: 'Concepción', etiqueta: 'Concepción' }], valorPorDefecto: 'Santiago' }
    ],
    version: 1,
    estado: 'aprobada',
    versionesAnteriores: [],
    aprobadoPor: 'Legal Corp.',
    fechaAprobacion: new Date('2024-01-15'),
    tiposContratoAplicables: ['nuevo', 'renovacion', 'programatico', 'marco_anual', 'express'],
    esObligatoria: true,
    esPredeterminada: true,
    orden: 99,
    sugerenciaIA: false,
    pesoRiesgo: 2,
    creadoPor: 'sistema',
    tags: ['obligatoria', 'legal']
  }
];

// ═══════════════════════════════════════════════════════════════
// ALMACENAMIENTO
// ═══════════════════════════════════════════════════════════════

const STORAGE_KEY = 'silexar_clausulas';

function initializarClausulas(): ClausulaLegal[] {
  return CLAUSULAS_BASE.map(c => ({
    ...c,
    id: crypto.randomUUID(),
    fechaCreacion: new Date(),
    ultimaModificacion: new Date(),
    usosCount: 0
  }));
}

function getStoredClausulas(): ClausulaLegal[] {
  if (typeof window === 'undefined') return initializarClausulas();
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    logger.error('[Clausulas] Error reading stored data');
  }
  
  const clausulas = initializarClausulas();
  storeClausulas(clausulas);
  return clausulas;
}

function storeClausulas(clausulas: ClausulaLegal[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clausulas));
  } catch {
    logger.error('[Clausulas] Error storing data');
  }
}

// ═══════════════════════════════════════════════════════════════
// CLASE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export class ClausulasService {
  private static instance: ClausulasService;
  private clausulas: ClausulaLegal[] = [];
  
  private constructor() {
    this.clausulas = getStoredClausulas();
  }
  
  static getInstance(): ClausulasService {
    if (!ClausulasService.instance) {
      ClausulasService.instance = new ClausulasService();
    }
    return ClausulasService.instance;
  }
  
  // ═══════════════════════════════════════════════════════════════
  // CONSULTAS
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Obtiene todas las cláusulas
   */
  obtenerTodas(): ClausulaLegal[] {
    return this.clausulas.sort((a, b) => a.orden - b.orden);
  }
  
  /**
   * Obtiene cláusula por ID
   */
  obtenerPorId(id: string): ClausulaLegal | null {
    return this.clausulas.find(c => c.id === id) || null;
  }
  
  /**
   * Obtiene cláusula por código
   */
  obtenerPorCodigo(codigo: string): ClausulaLegal | null {
    return this.clausulas.find(c => c.codigo === codigo) || null;
  }
  
  /**
   * Obtiene cláusulas por categoría
   */
  obtenerPorCategoria(categoria: CategoriaClausula): ClausulaLegal[] {
    return this.clausulas
      .filter(c => c.categoria === categoria && c.estado === 'aprobada')
      .sort((a, b) => a.orden - b.orden);
  }
  
  /**
   * Obtiene cláusulas aplicables a un tipo de contrato
   */
  obtenerParaTipoContrato(tipoContrato: string): ClausulaLegal[] {
    return this.clausulas
      .filter(c => 
        c.tiposContratoAplicables.includes(tipoContrato) && 
        c.estado === 'aprobada'
      )
      .sort((a, b) => a.orden - b.orden);
  }
  
  /**
   * Obtiene cláusulas obligatorias
   */
  obtenerObligatorias(tipoContrato: string): ClausulaLegal[] {
    return this.obtenerParaTipoContrato(tipoContrato).filter(c => c.esObligatoria);
  }
  
  /**
   * Obtiene cláusulas predeterminadas
   */
  obtenerPredeterminadas(tipoContrato: string): ClausulaLegal[] {
    return this.obtenerParaTipoContrato(tipoContrato).filter(c => c.esPredeterminada);
  }
  
  /**
   * Busca cláusulas por texto
   */
  buscar(query: string): ClausulaLegal[] {
    const queryLower = query.toLowerCase();
    return this.clausulas.filter(c =>
      c.nombre.toLowerCase().includes(queryLower) ||
      c.contenido.toLowerCase().includes(queryLower) ||
      c.tags.some(t => t.toLowerCase().includes(queryLower))
    );
  }
  
  /**
   * Obtiene categorías disponibles
   */
  obtenerCategorias(): { categoria: CategoriaClausula; count: number }[] {
    const categorias: Record<CategoriaClausula, number> = {} as Record<CategoriaClausula, number>;
    
    this.clausulas.forEach(c => {
      categorias[c.categoria] = (categorias[c.categoria] || 0) + 1;
    });
    
    return Object.entries(categorias).map(([categoria, count]) => ({
      categoria: categoria as CategoriaClausula,
      count
    }));
  }
  
  // ═══════════════════════════════════════════════════════════════
  // RENDERIZADO
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Renderiza una cláusula con sus variables
   */
  renderizar(clausulaId: string, valores: Record<string, string | number>): string {
    const clausula = this.obtenerPorId(clausulaId);
    if (!clausula) return '';
    
    let contenido = clausula.contenido;
    
    clausula.variables.forEach(variable => {
      const valor = valores[variable.nombre] ?? variable.valorPorDefecto ?? '';
      const regex = new RegExp(`{{${variable.nombre}}}`, 'g');
      contenido = contenido.replace(regex, String(valor));
    });
    
    return contenido;
  }
  
  /**
   * Renderiza en HTML
   */
  renderizarHTML(clausulaId: string, valores: Record<string, string | number>): string {
    const clausula = this.obtenerPorId(clausulaId);
    if (!clausula) return '';
    
    let contenido = clausula.contenidoHTML;
    
    clausula.variables.forEach(variable => {
      const valor = valores[variable.nombre] ?? variable.valorPorDefecto ?? '';
      const regex = new RegExp(`{{${variable.nombre}}}`, 'g');
      contenido = contenido.replace(regex, String(valor));
    });
    
    return contenido;
  }
  
  /**
   * Obtiene variables pendientes de una cláusula
   */
  obtenerVariablesPendientes(clausulaId: string, valores: Record<string, string | number>): VariableClausula[] {
    const clausula = this.obtenerPorId(clausulaId);
    if (!clausula) return [];
    
    return clausula.variables.filter(v => 
      v.requerida && 
      !v.fuenteAutomatica && 
      !(v.nombre in valores)
    );
  }
  
  // ═══════════════════════════════════════════════════════════════
  // SUGERENCIAS IA
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Sugiere cláusulas basadas en el contexto del contrato
   */
  sugerirClausulas(contexto: {
    tipoContrato: string;
    valorNeto: number;
    nivelRiesgo: string;
    anunciante?: { industria: string; historialContratos: { total: number } };
  }): { clausula: ClausulaLegal; razon: string; prioridad: number }[] {
    const sugerencias: { clausula: ClausulaLegal; razon: string; prioridad: number }[] = [];
    
    const clausulasAplicables = this.obtenerParaTipoContrato(contexto.tipoContrato)
      .filter(c => c.sugerenciaIA && c.condicionesSugerencia);
    
    clausulasAplicables.forEach(clausula => {
      try {
        // Evaluar condición de sugerencia
        const condicionCumplida = this.evaluarCondicion(
          clausula.condicionesSugerencia || 'false',
          contexto
        );
        
        if (condicionCumplida) {
          let razon = '';
          let prioridad = 5;
          
          // Determinar razón basada en el tipo de cláusula
          if (clausula.categoria === 'exclusividad') {
            razon = `Contrato de alto valor ($${contexto.valorNeto.toLocaleString()}). Recomendado para proteger inversión del cliente.`;
            prioridad = 8;
          } else if (clausula.categoria === 'pago' && clausula.codigo.includes('MORA')) {
            razon = `Cliente con nivel de riesgo ${contexto.nivelRiesgo}. Cláusula de protección financiera recomendada.`;
            prioridad = contexto.nivelRiesgo === 'alto' ? 9 : 6;
          } else if (clausula.categoria === 'terminacion') {
            razon = 'Cláusula estándar para proteger a ambas partes.';
            prioridad = 4;
          } else {
            razon = 'Sugerida por el sistema basado en contratos similares.';
            prioridad = 3;
          }
          
          sugerencias.push({ clausula, razon, prioridad });
        }
      } catch {
        // Ignorar errores de evaluación
      }
    });
    
    return sugerencias.sort((a, b) => b.prioridad - a.prioridad);
  }
  
  private evaluarCondicion(condicion: string, contexto: Record<string, unknown>): boolean {
    try {
      // WHY: Se reemplazó new Function() por evaluación segura de expresiones simples.
      // new Function() permite inyección de código arbitrario (OWASP A03).
      // Las condiciones de cláusulas siguen el patrón: "campo operador valor"
      // Ej: "montoTotal > 1000000", "tipoContrato === 'AUSPICIO'", "requiere2FA === true"
      return this.evaluarExpresionSegura(condicion, contexto);
    } catch {
      return false;
    }
  }

  /**
   * Evalúa expresiones simples de forma segura sin eval() ni new Function().
   * Soporta: ===, !==, >, <, >=, <=, &&, ||
   * El campo debe ser una clave del contexto.
   */
  private evaluarExpresionSegura(expr: string, ctx: Record<string, unknown>): boolean {
    // Normalizar espacios
    const e = expr.trim();

    // Soporte para AND / OR compuesto (split por && y ||)
    if (e.includes('&&')) {
      return e.split('&&').every(part => this.evaluarExpresionSegura(part.trim(), ctx));
    }
    if (e.includes('||')) {
      return e.split('||').some(part => this.evaluarExpresionSegura(part.trim(), ctx));
    }

    // Operadores de comparación
    const operadores = ['===', '!==', '>=', '<=', '>', '<'];
    for (const op of operadores) {
      const idx = e.indexOf(op);
      if (idx === -1) continue;
      const campo = e.slice(0, idx).trim();
      const valorStr = e.slice(idx + op.length).trim();
      const valorCtx = ctx[campo];

      // Parsear el valor literal (string, number, boolean)
      let valorLiteral: unknown;
      if (valorStr === 'true') valorLiteral = true;
      else if (valorStr === 'false') valorLiteral = false;
      else if (!isNaN(Number(valorStr))) valorLiteral = Number(valorStr);
      else if ((valorStr.startsWith("'") && valorStr.endsWith("'")) ||
               (valorStr.startsWith('"') && valorStr.endsWith('"'))) {
        valorLiteral = valorStr.slice(1, -1);
      } else {
        // El valor puede ser otra clave del contexto
        valorLiteral = ctx[valorStr] ?? valorStr;
      }

      switch (op) {
        case '===': return valorCtx === valorLiteral;
        case '!==': return valorCtx !== valorLiteral;
        case '>=':  return (valorCtx as number) >= (valorLiteral as number);
        case '<=':  return (valorCtx as number) <= (valorLiteral as number);
        case '>':   return (valorCtx as number) > (valorLiteral as number);
        case '<':   return (valorCtx as number) < (valorLiteral as number);
      }
    }

    // Si es solo un campo booleano
    if (e in ctx) return Boolean(ctx[e]);
    return false;
  }
  
  // ═══════════════════════════════════════════════════════════════
  // ANÁLISIS DE RIESGO
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Calcula el riesgo de un conjunto de cláusulas
   */
  calcularRiesgo(clausulaIds: string[]): {
    riesgoTotal: number;
    nivelRiesgo: 'bajo' | 'medio' | 'alto';
    clausulasRiesgo: { clausula: ClausulaLegal; riesgo: number }[];
    recomendaciones: string[];
  } {
    const clausulasRiesgo: { clausula: ClausulaLegal; riesgo: number }[] = [];
    let riesgoTotal = 0;
    
    clausulaIds.forEach(id => {
      const clausula = this.obtenerPorId(id);
      if (clausula) {
        clausulasRiesgo.push({ clausula, riesgo: clausula.pesoRiesgo });
        riesgoTotal += clausula.pesoRiesgo;
      }
    });
    
    const riesgoPromedio = clausulaIds.length > 0 ? riesgoTotal / clausulaIds.length : 0;
    const nivelRiesgo: 'bajo' | 'medio' | 'alto' = 
      riesgoPromedio <= 3 ? 'bajo' : 
      riesgoPromedio <= 6 ? 'medio' : 'alto';
    
    const recomendaciones: string[] = [];
    
    if (nivelRiesgo === 'alto') {
      recomendaciones.push('Revisar con departamento legal antes de enviar al cliente.');
      recomendaciones.push('Considerar incluir cláusula de garantía adicional.');
    }
    
    if (!clausulaIds.some(id => {
      const c = this.obtenerPorId(id);
      return c?.categoria === 'terminacion';
    })) {
      recomendaciones.push('Agregar cláusula de terminación anticipada.');
    }
    
    return {
      riesgoTotal,
      nivelRiesgo,
      clausulasRiesgo: clausulasRiesgo.sort((a, b) => b.riesgo - a.riesgo),
      recomendaciones
    };
  }
  
  // ═══════════════════════════════════════════════════════════════
  // CRUD (para administración)
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Crea una nueva cláusula
   */
  crear(datos: Omit<ClausulaLegal, 'id' | 'fechaCreacion' | 'ultimaModificacion' | 'usosCount'>): ClausulaLegal {
    const clausula: ClausulaLegal = {
      ...datos,
      id: crypto.randomUUID(),
      fechaCreacion: new Date(),
      ultimaModificacion: new Date(),
      usosCount: 0
    };
    
    this.clausulas.push(clausula);
    this.persistir();
    
    return clausula;
  }
  
  /**
   * Actualiza una cláusula existente
   */
  actualizar(id: string, datos: Partial<ClausulaLegal>): ClausulaLegal | null {
    const index = this.clausulas.findIndex(c => c.id === id);
    if (index === -1) return null;
    
    // Guardar versión anterior si hay cambio de contenido
    if (datos.contenido && datos.contenido !== this.clausulas[index].contenido) {
      this.clausulas[index].versionesAnteriores.push({
        version: this.clausulas[index].version,
        contenido: this.clausulas[index].contenido,
        fecha: new Date(),
        cambiadoPor: 'usuario-actual',
        motivo: 'Actualización de contenido'
      });
      datos.version = this.clausulas[index].version + 1;
    }
    
    this.clausulas[index] = {
      ...this.clausulas[index],
      ...datos,
      ultimaModificacion: new Date()
    };
    
    this.persistir();
    return this.clausulas[index];
  }
  
  /**
   * Incrementa contador de uso
   */
  registrarUso(id: string): void {
    const clausula = this.obtenerPorId(id);
    if (clausula) {
      this.actualizar(id, { usosCount: clausula.usosCount + 1 });
    }
  }
  
  private persistir(): void {
    storeClausulas(this.clausulas);
  }
}

// ═══════════════════════════════════════════════════════════════
// HOOK PARA USO EN COMPONENTES
// ═══════════════════════════════════════════════════════════════

export function useClausulas() {
  const service = ClausulasService.getInstance();
  
  return {
    // Consultas
    obtenerTodas: service.obtenerTodas.bind(service),
    obtenerPorId: service.obtenerPorId.bind(service),
    obtenerPorCategoria: service.obtenerPorCategoria.bind(service),
    obtenerParaTipoContrato: service.obtenerParaTipoContrato.bind(service),
    obtenerObligatorias: service.obtenerObligatorias.bind(service),
    obtenerPredeterminadas: service.obtenerPredeterminadas.bind(service),
    buscar: service.buscar.bind(service),
    obtenerCategorias: service.obtenerCategorias.bind(service),
    
    // Renderizado
    renderizar: service.renderizar.bind(service),
    renderizarHTML: service.renderizarHTML.bind(service),
    obtenerVariablesPendientes: service.obtenerVariablesPendientes.bind(service),
    
    // Sugerencias
    sugerirClausulas: service.sugerirClausulas.bind(service),
    
    // Análisis
    calcularRiesgo: service.calcularRiesgo.bind(service),
    
    // Uso
    registrarUso: service.registrarUso.bind(service)
  };
}

export default ClausulasService;
