/**
 * ⚡ SILEXAR PULSE - Smart Contract Capture API TIER 0
 * 
 * @description API endpoint que procesa múltiples tipos de input
 * (voz, texto, WhatsApp, email, foto) y genera borradores de contrato
 * automáticos con líneas de emisora completas, facturación y aprobaciones.
 * 
 * @version 2025.6.0
 * @tier TIER_0_FORTUNE_10
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/observability';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiServerError, getUserContext } from '@/lib/api/response';
import { auditLogger } from '@/lib/security/audit-logger';
import { withTenantContext } from '@/lib/db/tenant-context';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface SmartCaptureRequest {
  metodo: 'voice' | 'text' | 'whatsapp' | 'email' | 'quick' | 'photo';
  ejecutivoId: string;
  datos: {
    audioBase64?: string;
    transcripcion?: string;
    texto?: string;
    remitente?: string;
    telefono?: string;
    asunto?: string;
    cuerpo?: string;
    adjuntos?: string[];
    clienteNombre?: string;
    producto?: string;
    valorEstimado?: number;
    periodoInicio?: string;
    periodoFin?: string;
    notas?: string;
    imagenBase64?: string;
  };
}

interface CampoDetectado {
  campo: string;
  valor: string | number;
  confianza: number;
  fuente: string;
}

interface LineaPautaSugerida {
  id: string;
  medioId: string;
  medioNombre: string;
  categoria: 'Radio' | 'Televisión' | 'Digital' | 'Prensa';
  productoNombre: string;
  cantidad: number;
  tarifaUnitaria: number;
  descuento: number;
  subtotal: number;
  totalNeto: number;
  fechaInicio: string;
  fechaFin: string;
  horarioInicio?: string;
  horarioFin?: string;
  duracionSpot?: number;
  confianza: number;
  fuenteDeteccion: 'ia_voz' | 'ia_texto' | 'historial_cliente' | 'manual';
  disponibilidad?: {
    estado: 'disponible' | 'limitado' | 'saturado' | 'no_disponible';
    porcentaje: number;
  };
}

interface CondicionesFacturacion {
  modalidad: 'mensual' | 'quincenal' | 'anticipada' | 'al_termino' | 'por_cuotas';
  tipoFactura: 'factura' | 'boleta' | 'nota_credito';
  diasPago: number;
  numeroCuotas?: number;
  requiereGarantia: boolean;
  montoGarantia?: number;
  descuentoProntoPago?: number;
  confianza: number;
}

interface DatosExtraidos {
  clienteNombre: string;
  clienteId?: string;
  esClienteNuevo: boolean;
  tipoContrato: string;
  valorEstimado: number;
  moneda: string;
  fechaInicio: string;
  fechaFin: string;
  duracionMeses: number;
  mediosDetectados: string[];
  lineasPauta: LineaPautaSugerida[];
  descuento: number;
  condicionesPago: string;
  facturacion: CondicionesFacturacion;
  urgencia: 'baja' | 'media' | 'alta';
  notasAdicionales: string;
  confianzaGlobal: number;
  camposDetectados: CampoDetectado[];
  camposFaltantes: string[];
  contratoAnteriorId?: string;
  lineasClonadas: boolean;
}

interface ContratoSugerido {
  titulo: string;
  cliente: { nombre: string; id?: string; esNuevo: boolean };
  valor: number;
  descuento: number;
  fechaInicio: string;
  fechaFin: string;
  terminosPago: number;
  medios: MedioSugerido[];
  lineasPauta: LineaPautaSugerida[];
  facturacion: CondicionesFacturacion;
  aprobacionRequerida: boolean;
  nivelAprobacion: 'ejecutivo' | 'jefatura' | 'gerencia' | 'directorio';
  motivoAprobacion?: string;
}

interface MedioSugerido {
  tipo: string;
  programa?: string;
  cantidad: number;
  valorUnitario: number;
  confianza: number;
}

interface SmartCaptureResponse {
  success: boolean;
  borradorId: string;
  datosExtraidos: DatosExtraidos;
  contratoSugerido: ContratoSugerido;
  tiempoProcesamiento: number;
  metodo: string;
  requiereValidacion: boolean;
}

interface ConfirmarRequest {
  borradorId: string;
  contratoFinal: ContratoSugerido;
  ejecutivoId: string;
  accion: 'confirmar';
}

// ═══════════════════════════════════════════════════════════════
// BASE DE DATOS MOCK: EMISORAS / MEDIOS
// ═══════════════════════════════════════════════════════════════

interface EmistoraDB {
  id: string;
  nombre: string;
  aliases: string[];
  categoria: 'Radio' | 'Televisión' | 'Digital' | 'Prensa';
  producto: string;
  tarifaBase: number;
  horarios: {
    nombre: string;
    inicio: string;
    fin: string;
    multiplicador: number;
  }[];
  ocupacion: number; // 0-100% saturation
}

const EMISORAS_DB: EmistoraDB[] = [
  {
    id: 'med-001', nombre: 'Radio Corazón', aliases: ['corazon', 'corazón', 'radio corazón'],
    categoria: 'Radio', producto: 'Radio FM',
    tarifaBase: 450000,
    horarios: [
      { nombre: 'Prime', inicio: '06:00', fin: '10:00', multiplicador: 1.5 },
      { nombre: 'Mediodía', inicio: '10:00', fin: '14:00', multiplicador: 1.2 },
      { nombre: 'Tarde', inicio: '14:00', fin: '19:00', multiplicador: 1.0 },
      { nombre: 'Nocturno', inicio: '19:00', fin: '00:00', multiplicador: 0.8 },
    ],
    ocupacion: 72,
  },
  {
    id: 'med-002', nombre: 'FM Dos', aliases: ['fm dos', 'fm2', 'fmdos'],
    categoria: 'Radio', producto: 'Radio FM',
    tarifaBase: 380000,
    horarios: [
      { nombre: 'Prime', inicio: '06:00', fin: '10:00', multiplicador: 1.4 },
      { nombre: 'Mediodía', inicio: '10:00', fin: '14:00', multiplicador: 1.1 },
      { nombre: 'Tarde', inicio: '14:00', fin: '19:00', multiplicador: 1.0 },
      { nombre: 'Nocturno', inicio: '19:00', fin: '00:00', multiplicador: 0.7 },
    ],
    ocupacion: 58,
  },
  {
    id: 'med-003', nombre: 'Radio Futuro', aliases: ['futuro', 'radio futuro'],
    categoria: 'Radio', producto: 'Radio FM',
    tarifaBase: 350000,
    horarios: [
      { nombre: 'Prime', inicio: '06:00', fin: '10:00', multiplicador: 1.3 },
      { nombre: 'Mediodía', inicio: '10:00', fin: '14:00', multiplicador: 1.0 },
      { nombre: 'Tarde', inicio: '14:00', fin: '19:00', multiplicador: 0.9 },
      { nombre: 'Nocturno', inicio: '19:00', fin: '00:00', multiplicador: 0.7 },
    ],
    ocupacion: 45,
  },
  {
    id: 'med-004', nombre: 'ADN Radio', aliases: ['adn', 'radio adn'],
    categoria: 'Radio', producto: 'Radio FM',
    tarifaBase: 520000,
    horarios: [
      { nombre: 'Prime', inicio: '06:00', fin: '10:00', multiplicador: 1.6 },
      { nombre: 'Mediodía', inicio: '10:00', fin: '14:00', multiplicador: 1.3 },
      { nombre: 'Tarde', inicio: '14:00', fin: '19:00', multiplicador: 1.0 },
      { nombre: 'Nocturno', inicio: '19:00', fin: '00:00', multiplicador: 0.8 },
    ],
    ocupacion: 85,
  },
  {
    id: 'med-005', nombre: 'Canal 13', aliases: ['canal 13', 'canal13', 'c13', 'trece'],
    categoria: 'Televisión', producto: 'TV Abierta',
    tarifaBase: 2500000,
    horarios: [
      { nombre: 'Matinal', inicio: '07:00', fin: '12:00', multiplicador: 1.2 },
      { nombre: 'Mediodía', inicio: '12:00', fin: '15:00', multiplicador: 1.0 },
      { nombre: 'Tarde', inicio: '15:00', fin: '20:00', multiplicador: 1.3 },
      { nombre: 'Estelar', inicio: '20:00', fin: '00:00', multiplicador: 2.0 },
    ],
    ocupacion: 90,
  },
  {
    id: 'med-006', nombre: 'CHV', aliases: ['chv', 'chilevision', 'chilevisión'],
    categoria: 'Televisión', producto: 'TV Abierta',
    tarifaBase: 2200000,
    horarios: [
      { nombre: 'Matinal', inicio: '07:00', fin: '12:00', multiplicador: 1.1 },
      { nombre: 'Mediodía', inicio: '12:00', fin: '15:00', multiplicador: 1.0 },
      { nombre: 'Tarde', inicio: '15:00', fin: '20:00', multiplicador: 1.2 },
      { nombre: 'Estelar', inicio: '20:00', fin: '00:00', multiplicador: 1.8 },
    ],
    ocupacion: 78,
  },
  {
    id: 'med-007', nombre: 'Mega', aliases: ['mega', 'megamedia'],
    categoria: 'Televisión', producto: 'TV Abierta',
    tarifaBase: 2000000,
    horarios: [
      { nombre: 'Matinal', inicio: '07:00', fin: '12:00', multiplicador: 1.0 },
      { nombre: 'Mediodía', inicio: '12:00', fin: '15:00', multiplicador: 0.9 },
      { nombre: 'Tarde', inicio: '15:00', fin: '20:00', multiplicador: 1.1 },
      { nombre: 'Estelar', inicio: '20:00', fin: '00:00', multiplicador: 1.7 },
    ],
    ocupacion: 65,
  },
  {
    id: 'med-008', nombre: 'Google Ads', aliases: ['google', 'google ads', 'sem', 'adwords'],
    categoria: 'Digital', producto: 'Digital SEM',
    tarifaBase: 150000,
    horarios: [
      { nombre: '24/7', inicio: '00:00', fin: '23:59', multiplicador: 1.0 },
    ],
    ocupacion: 30,
  },
  {
    id: 'med-009', nombre: 'Meta Ads', aliases: ['facebook', 'instagram', 'meta', 'meta ads'],
    categoria: 'Digital', producto: 'Digital Social',
    tarifaBase: 120000,
    horarios: [
      { nombre: '24/7', inicio: '00:00', fin: '23:59', multiplicador: 1.0 },
    ],
    ocupacion: 25,
  },
  {
    id: 'med-010', nombre: 'El Mercurio', aliases: ['mercurio', 'el mercurio', 'emol'],
    categoria: 'Prensa', producto: 'Prensa Escrita',
    tarifaBase: 800000,
    horarios: [
      { nombre: 'Diario', inicio: '00:00', fin: '23:59', multiplicador: 1.0 },
    ],
    ocupacion: 40,
  },
];

// ═══════════════════════════════════════════════════════════════
// BASE DE DATOS MOCK: CLIENTES
// ═══════════════════════════════════════════════════════════════

interface ClienteDB {
  id: string;
  nombre: string;
  ultimoValor: number;
  mediosPreferidos: string[];
  descuentoHistorico: number;
  diasPago: number;
  modalidadFacturacion: 'mensual' | 'quincenal' | 'anticipada' | 'al_termino' | 'por_cuotas';
  contratoAnteriorId?: string;
  lineasAnteriores?: { medioId: string; cantidad: number; horario: string }[];
}

const CLIENTES_DB: ClienteDB[] = [
  {
    id: 'cli-001', nombre: 'Banco Chile',
    ultimoValor: 85000000, mediosPreferidos: ['Radio', 'TV', 'Digital'],
    descuentoHistorico: 15, diasPago: 45, modalidadFacturacion: 'mensual',
    contratoAnteriorId: 'ctr-prev-001',
    lineasAnteriores: [
      { medioId: 'med-001', cantidad: 30, horario: 'Prime' },
      { medioId: 'med-002', cantidad: 20, horario: 'Nocturno' },
      { medioId: 'med-005', cantidad: 5, horario: 'Estelar' },
    ],
  },
  {
    id: 'cli-002', nombre: 'Falabella',
    ultimoValor: 120000000, mediosPreferidos: ['TV', 'Digital', 'Prensa'],
    descuentoHistorico: 18, diasPago: 45, modalidadFacturacion: 'mensual',
    contratoAnteriorId: 'ctr-prev-002',
    lineasAnteriores: [
      { medioId: 'med-005', cantidad: 10, horario: 'Estelar' },
      { medioId: 'med-008', cantidad: 1, horario: '24/7' },
      { medioId: 'med-009', cantidad: 1, horario: '24/7' },
    ],
  },
  {
    id: 'cli-003', nombre: 'Cencosud',
    ultimoValor: 45000000, mediosPreferidos: ['Radio'],
    descuentoHistorico: 10, diasPago: 30, modalidadFacturacion: 'quincenal',
    contratoAnteriorId: 'ctr-prev-003',
    lineasAnteriores: [
      { medioId: 'med-001', cantidad: 25, horario: 'Mediodía' },
      { medioId: 'med-003', cantidad: 15, horario: 'Prime' },
    ],
  },
  {
    id: 'cli-004', nombre: 'TechCorp',
    ultimoValor: 95000000, mediosPreferidos: ['Digital', 'TV'],
    descuentoHistorico: 12, diasPago: 30, modalidadFacturacion: 'mensual',
  },
  {
    id: 'cli-005', nombre: 'SuperMax',
    ultimoValor: 35000000, mediosPreferidos: ['Radio', 'Vía Pública'],
    descuentoHistorico: 8, diasPago: 30, modalidadFacturacion: 'al_termino',
  },
  {
    id: 'cli-006', nombre: 'Ripley',
    ultimoValor: 75000000, mediosPreferidos: ['TV', 'Digital'],
    descuentoHistorico: 14, diasPago: 60, modalidadFacturacion: 'mensual',
    contratoAnteriorId: 'ctr-prev-006',
    lineasAnteriores: [
      { medioId: 'med-006', cantidad: 8, horario: 'Estelar' },
      { medioId: 'med-009', cantidad: 1, horario: '24/7' },
    ],
  },
  {
    id: 'cli-007', nombre: 'LATAM',
    ultimoValor: 200000000, mediosPreferidos: ['TV', 'Radio', 'Digital', 'Prensa'],
    descuentoHistorico: 20, diasPago: 45, modalidadFacturacion: 'por_cuotas',
    contratoAnteriorId: 'ctr-prev-007',
    lineasAnteriores: [
      { medioId: 'med-005', cantidad: 15, horario: 'Estelar' },
      { medioId: 'med-001', cantidad: 40, horario: 'Prime' },
      { medioId: 'med-004', cantidad: 30, horario: 'Mediodía' },
      { medioId: 'med-008', cantidad: 1, horario: '24/7' },
      { medioId: 'med-010', cantidad: 4, horario: 'Diario' },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════
// PATRONES NLP (expandidos con emisoras)
// ═══════════════════════════════════════════════════════════════

const PATRONES = {
  cliente: /(?:cliente|anunciante|para|con|de)\s*[:-]?\s*([A-ZÁÉÍÓÚÑa-záéíóúñ\s]+?)(?:\s*[,.\n]|$)/i,
  valor: /\$?\s*(\d+(?:[.,]\d+)?)\s*(?:millones?|palos?|M|MM)/gi,
  fecha: /(?:desde|inicio|a partir|para)\s*(\w+\s*(?:\d{4})?)/gi,
  medios: /(radio|tv|televisión|digital|redes|prensa|vía pública|pantallas|display)/gi,
  descuento: /(?:descuento|dto|dscto)\s*(?:de|del)?\s*(\d+)\s*%/gi,
  pago: /(?:pago|factura)\s*(?:a)?\s*(\d+)\s*días?/gi,
  urgente: /\b(?:urgente|rápido|hoy|inmediato|asap)\b/gi,
  // Patrones de emisora: detectar nombre + cantidad + unidad
  lineaEmisora: /(?:(?:radio\s+)?(\w[\wáéíóúñ\s]*?))\s+(\d+)\s*(?:frases?|spots?|cuñas?|avisos?|menciones?)/gi,
  // Horarios textuales
  horario: /(?:horario|franja)\s*(?:de\s+)?(?:la\s+)?(prime|matinal|mediodía|mediodia|tarde|nocturno|estelar|noche)/gi,
  // Duración de spot
  duracion: /(\d+)\s*(?:segundos?|seg|s)/gi,
  // Facturación
  facturacionModo: /(?:factur(?:ar|ación))\s*(?:de\s+forma\s+)?(mensual|quincenal|anticipad[ao]|al\s+termino|por\s+cuotas?)/gi,
};

// ═══════════════════════════════════════════════════════════════
// STORAGE (borradores en memoria)
// ═══════════════════════════════════════════════════════════════

const borradores: Map<string, SmartCaptureResponse> = new Map();
const contratosCreados: Map<string, { id: string; numero: string; estado: string; borradorId: string }> = new Map();

// ═══════════════════════════════════════════════════════════════
// POST: Procesar captura
// ═══════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  const inicio = Date.now();

  try {
    const body: SmartCaptureRequest = await request.json();
    const { metodo, datos } = body;

    let textoAProcesar = '';

    switch (metodo) {
      case 'voice':
        textoAProcesar = datos.transcripcion || simularTranscripcion(datos.audioBase64);
        break;
      case 'text':
      case 'whatsapp':
        textoAProcesar = datos.texto || '';
        break;
      case 'email':
        textoAProcesar = `${datos.asunto || ''} ${datos.cuerpo || ''}`;
        break;
      case 'photo':
        textoAProcesar = simularOCR(datos.imagenBase64);
        break;
      case 'quick':
        return handleQuickCapture(datos, inicio);
      default:
        return NextResponse.json({ success: false, error: 'Método no válido' }, { status: 400 });
    }

    // 1. Extraer datos con NLP
    const datosExtraidos = extraerDatos(textoAProcesar, metodo);

    // 2. Buscar cliente en DB y enriquecer
    const clienteDB = buscarCliente(datosExtraidos.clienteNombre);
    if (clienteDB) {
      enriquecerConHistorial(datosExtraidos, clienteDB, metodo);
    }

    // 3. Detectar líneas de emisora del texto
    const lineasDetectadas = detectarLineasEmisora(textoAProcesar, metodo, datosExtraidos);
    datosExtraidos.lineasPauta = lineasDetectadas;

    // 4. Si no se detectaron líneas pero hay historial, clonar
    if (lineasDetectadas.length === 0 && clienteDB?.lineasAnteriores) {
      const lineasClonadas = clonarLineasDelHistorial(clienteDB, datosExtraidos);
      datosExtraidos.lineasPauta = lineasClonadas;
      datosExtraidos.lineasClonadas = true;
      datosExtraidos.contratoAnteriorId = clienteDB.contratoAnteriorId;
    }

    // 5. Calcular valor total desde líneas
    if (datosExtraidos.lineasPauta.length > 0 && datosExtraidos.valorEstimado === 0) {
      datosExtraidos.valorEstimado = datosExtraidos.lineasPauta.reduce((sum, l) => sum + l.totalNeto, 0);
    }

    // 6. Generar facturación
    datosExtraidos.facturacion = generarCondicionesFacturacion(textoAProcesar, clienteDB, datosExtraidos);

    // 7. Generar contrato sugerido completo
    const contratoSugerido = generarContratoSugerido(datosExtraidos);
    const borradorId = `draft-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    const response: SmartCaptureResponse = {
      success: true,
      borradorId,
      datosExtraidos,
      contratoSugerido,
      tiempoProcesamiento: Date.now() - inicio,
      metodo,
      requiereValidacion: datosExtraidos.confianzaGlobal < 80,
    };

    borradores.set(borradorId, response);

    return NextResponse.json(response);
  } catch (error) {
    logger.error('[Smart Capture] Error:', error instanceof Error ? error : undefined, { module: 'smart-capture' });
    return NextResponse.json({ success: false, error: 'Error procesando captura' }, { status: 500 });
  }
}

// ═══════════════════════════════════════════════════════════════
// PUT: Confirmar borrador → Crear contrato
// ═══════════════════════════════════════════════════════════════

export async function PUT(request: NextRequest) {
  try {
    const body: ConfirmarRequest = await request.json();
    const { borradorId, contratoFinal } = body;

    // Verificar que el borrador existe
    const borrador = borradores.get(borradorId);
    if (!borrador) {
      return NextResponse.json({ success: false, error: 'Borrador no encontrado' }, { status: 404 });
    }

    // Simular la creación del contrato
    const contratoId = `ctr-${Date.now()}`;
    const numero = `SP-${new Date().getFullYear()}-${String(contratosCreados.size + 1).padStart(4, '0')}`;

    // Determinar estado según aprobación
    const estado = contratoFinal.aprobacionRequerida ? 'pendiente_aprobacion' : 'activo';

    // Generar aprobadores si es necesario
    const aprobadores = contratoFinal.aprobacionRequerida
      ? generarAprobadores(contratoFinal.nivelAprobacion)
      : undefined;

    contratosCreados.set(contratoId, { id: contratoId, numero, estado, borradorId });

    // Limpiar borrador
    borradores.delete(borradorId);

    return NextResponse.json({
      success: true,
      contratoId,
      numero,
      estado,
      aprobadores,
      pdfUrl: `/api/contratos/${contratoId}/pdf`,
      mensaje: estado === 'pendiente_aprobacion'
        ? `Contrato ${numero} creado y enviado para aprobación a ${aprobadores?.map(a => a.nombre).join(', ')}`
        : `Contrato ${numero} creado exitosamente y activado`,
    });
  } catch (error) {
    logger.error('[Smart Capture] Error confirmando:', error instanceof Error ? error : undefined, { module: 'smart-capture' });
    return NextResponse.json({ success: false, error: 'Error creando contrato' }, { status: 500 });
  }
}

// ═══════════════════════════════════════════════════════════════
// GET: Listar borradores / queue
// ═══════════════════════════════════════════════════════════════

export async function GET() {
  const lista = Array.from(borradores.entries()).map(([id, b]) => ({
    id,
    cliente: b.contratoSugerido.cliente.nombre,
    valor: b.contratoSugerido.valor,
    metodo: b.metodo,
    confianza: b.datosExtraidos.confianzaGlobal,
    requiereValidacion: b.requiereValidacion,
    timestamp: id.split('-')[1],
    lineasPauta: b.contratoSugerido.lineasPauta.length,
  }));

  return NextResponse.json({
    success: true,
    data: lista,
    total: lista.length,
    timestamp: new Date().toISOString(),
  });
}

// ═══════════════════════════════════════════════════════════════
// PROCESADORES — SIMULACIÓN (en producción: APIs externas)
// ═══════════════════════════════════════════════════════════════

function simularTranscripcion(audioBase64?: string): string {
  if (!audioBase64) return '';
  // Producción: Whisper API / Google Speech-to-Text
  return 'Cerré con Banco Chile, campaña de Radio Corazón 20 frases en horario prime, FM Dos 15 frases nocturno, y Canal 13 5 spots de 30 segundos en estelar, 85 millones, descuento del 15 por ciento, pago a 45 días, facturación mensual';
}

function simularOCR(imagenBase64?: string): string {
  if (!imagenBase64) return '';
  // Producción: Google Vision API / Tesseract
  return 'Propuesta comercial\nCliente: SuperMax\nMedio: Radio Corazón 10 frases Prime, ADN Radio 8 frases Mediodía\nMonto: $35.000.000\nPeríodo: Marzo 2025\nPago: 30 días';
}

// ═══════════════════════════════════════════════════════════════
// NLP: DETECCIÓN DE EMISORAS Y LÍNEAS DE PAUTA
// ═══════════════════════════════════════════════════════════════

function detectarLineasEmisora(
  texto: string,
  metodo: string,
  datosBase: DatosExtraidos
): LineaPautaSugerida[] {
  const lineas: LineaPautaSugerida[] = [];
  const textoLower = texto.toLowerCase();

  // Buscar cada emisora por nombre/alias en el texto
  for (const emisora of EMISORAS_DB) {
    const foundAlias = emisora.aliases.find(alias => textoLower.includes(alias));
    if (!foundAlias) continue;

    // Buscar cantidad de frases/spots cerca del nombre
    const cantidad = detectarCantidadCerca(textoLower, foundAlias);
    if (cantidad === 0) continue;

    // Detectar horario mencionado cerca del nombre
    const horarioDetectado = detectarHorarioCerca(textoLower, foundAlias, emisora);

    // Detectar duración de spot
    const duracion = detectarDuracionSpot(textoLower, foundAlias);

    // Calcular tarifa con multiplicador de horario
    const multiplicador = horarioDetectado?.multiplicador || 1.0;
    const tarifa = emisora.tarifaBase * multiplicador;
    const descuento = datosBase.descuento || 0;
    const subtotal = tarifa * cantidad;
    const totalNeto = subtotal * (1 - descuento / 100);

    // Simular disponibilidad
    const disponibilidad = simularDisponibilidad(emisora.ocupacion, cantidad);

    const fuenteDeteccion = (metodo === 'voice' ? 'ia_voz' : 'ia_texto') as 'ia_voz' | 'ia_texto';

    lineas.push({
      id: `lp-${emisora.id}-${Date.now()}-${Math.random().toString(36).slice(2, 4)}`,
      medioId: emisora.id,
      medioNombre: emisora.nombre,
      categoria: emisora.categoria,
      productoNombre: emisora.producto,
      cantidad,
      tarifaUnitaria: tarifa,
      descuento,
      subtotal,
      totalNeto,
      fechaInicio: datosBase.fechaInicio,
      fechaFin: datosBase.fechaFin,
      horarioInicio: horarioDetectado?.inicio,
      horarioFin: horarioDetectado?.fin,
      duracionSpot: duracion || (emisora.categoria === 'Televisión' ? 30 : undefined),
      confianza: calcularConfianzaLinea(cantidad > 0, !!horarioDetectado, !!duracion),
      fuenteDeteccion,
      disponibilidad,
    });
  }

  return lineas;
}

function detectarCantidadCerca(texto: string, alias: string): number {
  // Buscar patrones como "Radio Corazón 20 frases" o "20 frases Radio Corazón"
  const aliasEscaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Patrón 1: [emisora] [N] [unidad]
  const patternAfter = new RegExp(`${aliasEscaped}\\s+(\\d+)\\s*(?:frases?|spots?|cuñas?|avisos?|menciones?)`, 'i');
  const matchAfter = texto.match(patternAfter);
  if (matchAfter) return parseInt(matchAfter[1]);

  // Patrón 2: [N] [unidad] [en|de] [emisora]
  const patternBefore = new RegExp(`(\\d+)\\s*(?:frases?|spots?|cuñas?|avisos?|menciones?)\\s*(?:en|de)?\\s*${aliasEscaped}`, 'i');
  const matchBefore = texto.match(patternBefore);
  if (matchBefore) return parseInt(matchBefore[1]);

  return 0;
}

function detectarHorarioCerca(
  texto: string,
  alias: string,
  emisora: EmistoraDB
): { nombre: string; inicio: string; fin: string; multiplicador: number } | null {
  // Buscar nombres de horario cerca de la emisora
  const aliasPos = texto.indexOf(alias);
  if (aliasPos === -1) return null;

  // Tomar 100 caracteres alrededor de la emisora
  const ventana = texto.substring(Math.max(0, aliasPos - 30), aliasPos + alias.length + 70);

  const horariosKeywords: Record<string, string> = {
    'prime': 'Prime',
    'matinal': 'Matinal',
    'mediodía': 'Mediodía',
    'mediodia': 'Mediodía',
    'tarde': 'Tarde',
    'nocturno': 'Nocturno',
    'noche': 'Nocturno',
    'estelar': 'Estelar',
    'diario': 'Diario',
  };

  for (const [keyword, nombre] of Object.entries(horariosKeywords)) {
    if (ventana.includes(keyword)) {
      const horarioEncontrado = emisora.horarios.find(h => h.nombre === nombre);
      if (horarioEncontrado) return horarioEncontrado;
    }
  }

  // Sin horario detectado → usar el primero (default)
  return null;
}

function detectarDuracionSpot(texto: string, alias: string): number | undefined {
  const aliasPos = texto.indexOf(alias);
  if (aliasPos === -1) return undefined;

  const ventana = texto.substring(aliasPos, Math.min(texto.length, aliasPos + alias.length + 80));
  const match = ventana.match(/(\d+)\s*(?:segundos?|seg|s)\b/i);
  return match ? parseInt(match[1]) : undefined;
}

function calcularConfianzaLinea(
  cantidadDetectada: boolean,
  horarioDetectado: boolean,
  duracionDetectada: boolean
): number {
  let confianza = 60; // base
  if (cantidadDetectada) confianza += 20;
  if (horarioDetectado) confianza += 12;
  if (duracionDetectada) confianza += 8;
  return Math.min(confianza, 100);
}

function simularDisponibilidad(
  ocupacion: number,
  cantidad: number
): { estado: 'disponible' | 'limitado' | 'saturado' | 'no_disponible'; porcentaje: number } {
  const impacto = cantidad * 0.5;
  const proyectado = ocupacion + impacto;

  if (proyectado > 95) return { estado: 'no_disponible', porcentaje: 100 - ocupacion };
  if (proyectado > 85) return { estado: 'saturado', porcentaje: 100 - ocupacion };
  if (proyectado > 70) return { estado: 'limitado', porcentaje: 100 - ocupacion };
  return { estado: 'disponible', porcentaje: 100 - ocupacion };
}

// ═══════════════════════════════════════════════════════════════
// AUTO-FILL: CLONAR LÍNEAS DEL HISTORIAL
// ═══════════════════════════════════════════════════════════════

function clonarLineasDelHistorial(
  cliente: ClienteDB,
  datosBase: DatosExtraidos
): LineaPautaSugerida[] {
  if (!cliente.lineasAnteriores) return [];

  return cliente.lineasAnteriores.map((lineaAnterior) => {
    const emisora = EMISORAS_DB.find(e => e.id === lineaAnterior.medioId);
    if (!emisora) return null;

    const horario = emisora.horarios.find(h => h.nombre === lineaAnterior.horario) || emisora.horarios[0];
    const tarifa = emisora.tarifaBase * horario.multiplicador;
    const descuento = cliente.descuentoHistorico;
    const subtotal = tarifa * lineaAnterior.cantidad;
    const totalNeto = subtotal * (1 - descuento / 100);

    return {
      id: `lp-clone-${emisora.id}-${Date.now()}-${Math.random().toString(36).slice(2, 4)}`,
      medioId: emisora.id,
      medioNombre: emisora.nombre,
      categoria: emisora.categoria,
      productoNombre: emisora.producto,
      cantidad: lineaAnterior.cantidad,
      tarifaUnitaria: tarifa,
      descuento,
      subtotal,
      totalNeto,
      fechaInicio: datosBase.fechaInicio,
      fechaFin: datosBase.fechaFin,
      horarioInicio: horario.inicio,
      horarioFin: horario.fin,
      confianza: 75,
      fuenteDeteccion: 'historial_cliente' as const,
      disponibilidad: simularDisponibilidad(emisora.ocupacion, lineaAnterior.cantidad),
    } as LineaPautaSugerida;
  }).filter((l): l is LineaPautaSugerida => l !== null);
}

// ═══════════════════════════════════════════════════════════════
// GENERACIÓN DE FACTURACIÓN
// ═══════════════════════════════════════════════════════════════

function generarCondicionesFacturacion(
  texto: string,
  cliente: ClienteDB | null,
  datos: DatosExtraidos
): CondicionesFacturacion {
  // Detectar modalidad del texto
  let modalidad: CondicionesFacturacion['modalidad'] = 'mensual';
  const factMatch = texto.match(PATRONES.facturacionModo);
  if (factMatch) {
    const detectado = factMatch[0].toLowerCase();
    if (detectado.includes('quincenal')) modalidad = 'quincenal';
    else if (detectado.includes('anticipad')) modalidad = 'anticipada';
    else if (detectado.includes('termino')) modalidad = 'al_termino';
    else if (detectado.includes('cuota')) modalidad = 'por_cuotas';
  } else if (cliente) {
    modalidad = cliente.modalidadFacturacion;
  }

  const diasPago = datos.condicionesPago ? parseInt(datos.condicionesPago) || 30 : (cliente?.diasPago || 30);
  const valor = datos.valorEstimado;

  return {
    modalidad,
    tipoFactura: 'factura',
    diasPago,
    numeroCuotas: modalidad === 'por_cuotas' ? Math.ceil(datos.duracionMeses) : undefined,
    requiereGarantia: valor > 100000000,
    montoGarantia: valor > 100000000 ? Math.round(valor * 0.1) : undefined,
    descuentoProntoPago: diasPago >= 30 ? 2 : undefined,
    confianza: cliente ? 90 : (factMatch ? 85 : 70),
  };
}

// ═══════════════════════════════════════════════════════════════
// EXTRAER DATOS BASE (NLP)
// ═══════════════════════════════════════════════════════════════

function extraerDatos(texto: string, metodo: string): DatosExtraidos {
  const campos: CampoDetectado[] = [];
  const faltantes: string[] = [];

  // Cliente
  const clienteMatch = texto.match(PATRONES.cliente);
  const clienteNombre = clienteMatch ? clienteMatch[1].trim() : '';
  if (clienteNombre) campos.push({ campo: 'cliente', valor: clienteNombre, confianza: 85, fuente: metodo });
  else faltantes.push('cliente');

  // Valor
  const valorMatch = texto.match(PATRONES.valor);
  let valorEstimado = 0;
  if (valorMatch) {
    const num = parseFloat(valorMatch[0].replace(/[^\d.,]/g, '').replace(',', '.'));
    valorEstimado = num * 1000000;
    campos.push({ campo: 'valor', valor: valorEstimado, confianza: 90, fuente: metodo });
  } else faltantes.push('valor');

  // Medios
  const mediosMatch = texto.match(PATRONES.medios) || [];
  const mediosDetectados = [...new Set(mediosMatch.map(m => m.charAt(0).toUpperCase() + m.slice(1).toLowerCase()))];
  if (mediosDetectados.length > 0) campos.push({ campo: 'medios', valor: mediosDetectados.join(', '), confianza: 88, fuente: metodo });

  // Descuento
  const descuentoMatch = texto.match(PATRONES.descuento);
  const descuento = descuentoMatch ? parseInt(descuentoMatch[1]) : 0;
  if (descuento > 0) campos.push({ campo: 'descuento', valor: descuento, confianza: 92, fuente: metodo });

  // Pago
  const pagoMatch = texto.match(PATRONES.pago);
  const pago = pagoMatch ? `${pagoMatch[1]} días` : '';
  if (pago) campos.push({ campo: 'condicionesPago', valor: pago, confianza: 90, fuente: metodo });

  // Urgencia
  const urgenciaMatch = texto.match(PATRONES.urgente);
  const urgencia: 'baja' | 'media' | 'alta' = urgenciaMatch ? 'alta' : 'media';

  // Fechas
  const now = new Date();
  const mesActual = now.getMonth();
  const fechaInicio = new Date(now.getFullYear(), mesActual + 1, 1).toISOString().split('T')[0];
  const fechaFin = new Date(now.getFullYear(), mesActual + 3, 0).toISOString().split('T')[0];

  const confianzaGlobal = campos.length > 0 ? Math.round(campos.reduce((s, c) => s + c.confianza, 0) / campos.length) : 0;

  return {
    clienteNombre,
    esClienteNuevo: true,
    tipoContrato: mediosDetectados.length > 1 ? 'Multimedia' : mediosDetectados[0] || 'General',
    valorEstimado,
    moneda: 'CLP',
    fechaInicio,
    fechaFin,
    duracionMeses: 2,
    mediosDetectados,
    lineasPauta: [], // se llena después
    descuento,
    condicionesPago: pago || '30 días',
    facturacion: {
      modalidad: 'mensual',
      tipoFactura: 'factura',
      diasPago: 30,
      requiereGarantia: false,
      confianza: 50,
    },
    urgencia,
    notasAdicionales: texto.substring(0, 200),
    confianzaGlobal,
    camposDetectados: campos,
    camposFaltantes: faltantes,
    lineasClonadas: false,
  };
}

// ═══════════════════════════════════════════════════════════════
// BÚSQUEDA DE CLIENTE + ENRIQUECIMIENTO
// ═══════════════════════════════════════════════════════════════

function buscarCliente(nombre: string): ClienteDB | null {
  if (!nombre) return null;
  const n = nombre.toLowerCase();
  return CLIENTES_DB.find(c => c.nombre.toLowerCase().includes(n) || n.includes(c.nombre.toLowerCase())) || null;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function enriquecerConHistorial(datos: DatosExtraidos, cliente: ClienteDB, _metodo: string): void {
  datos.clienteId = cliente.id;
  datos.esClienteNuevo = false;

  if (!datos.valorEstimado) {
    datos.valorEstimado = cliente.ultimoValor;
    datos.camposDetectados.push({ campo: 'valor', valor: cliente.ultimoValor, confianza: 75, fuente: 'historial' });
  }
  if (!datos.descuento) {
    datos.descuento = cliente.descuentoHistorico;
    datos.camposDetectados.push({ campo: 'descuento', valor: cliente.descuentoHistorico, confianza: 80, fuente: 'historial' });
  }
  if (datos.mediosDetectados.length === 0) {
    datos.mediosDetectados = cliente.mediosPreferidos;
    datos.camposDetectados.push({ campo: 'medios', valor: cliente.mediosPreferidos.join(', '), confianza: 70, fuente: 'historial' });
  }
  datos.condicionesPago = `${cliente.diasPago} días`;

  // Recalcular confianza
  if (datos.camposDetectados.length > 0) {
    datos.confianzaGlobal = Math.round(
      datos.camposDetectados.reduce((s, c) => s + c.confianza, 0) / datos.camposDetectados.length
    );
  }

  // Eliminar campos faltantes que ahora están cubiertos
  const camposCubiertos = datos.camposDetectados.map(c => c.campo);
  datos.camposFaltantes = datos.camposFaltantes.filter(f => !camposCubiertos.includes(f));
}

// ═══════════════════════════════════════════════════════════════
// GENERAR CONTRATO SUGERIDO COMPLETO
// ═══════════════════════════════════════════════════════════════

function generarContratoSugerido(datos: DatosExtraidos): ContratoSugerido {
  const terminosPago = datos.condicionesPago ? parseInt(datos.condicionesPago) || 30 : 30;

  // Nivel de aprobación según monto
  const { aprobacionRequerida, nivelAprobacion, motivoAprobacion } = determinarAprobacion(datos);

  return {
    titulo: `${datos.tipoContrato} - ${datos.clienteNombre || 'Nuevo Cliente'}`,
    cliente: {
      nombre: datos.clienteNombre || 'Sin identificar',
      id: datos.clienteId,
      esNuevo: datos.esClienteNuevo,
    },
    valor: datos.valorEstimado,
    descuento: datos.descuento,
    fechaInicio: datos.fechaInicio,
    fechaFin: datos.fechaFin,
    terminosPago,
    medios: datos.mediosDetectados.map(medio => ({
      tipo: medio,
      cantidad: 1,
      valorUnitario: datos.valorEstimado / Math.max(datos.mediosDetectados.length, 1),
      confianza: datos.camposDetectados.find(c => c.campo === 'medios')?.confianza || 70,
    })),
    lineasPauta: datos.lineasPauta,
    facturacion: datos.facturacion,
    aprobacionRequerida,
    nivelAprobacion,
    motivoAprobacion,
  };
}

function determinarAprobacion(datos: DatosExtraidos): {
  aprobacionRequerida: boolean;
  nivelAprobacion: 'ejecutivo' | 'jefatura' | 'gerencia' | 'directorio';
  motivoAprobacion?: string;
} {
  const valor = datos.valorEstimado;
  const descuento = datos.descuento;

  // Directorio: > 150M o descuento > 25%
  if (valor > 150000000 || descuento > 25) {
    return {
      aprobacionRequerida: true,
      nivelAprobacion: 'directorio',
      motivoAprobacion: valor > 150000000
        ? `Monto superior a $150M (${formatearMonto(valor)})`
        : `Descuento superior al 25% (${descuento}%)`,
    };
  }
  // Gerencia: > 80M o descuento > 18%
  if (valor > 80000000 || descuento > 18) {
    return {
      aprobacionRequerida: true,
      nivelAprobacion: 'gerencia',
      motivoAprobacion: valor > 80000000
        ? `Monto superior a $80M (${formatearMonto(valor)})`
        : `Descuento superior al 18% (${descuento}%)`,
    };
  }
  // Jefatura: > 30M o descuento > 10%
  if (valor > 30000000 || descuento > 10) {
    return {
      aprobacionRequerida: true,
      nivelAprobacion: 'jefatura',
      motivoAprobacion: valor > 30000000
        ? `Monto superior a $30M (${formatearMonto(valor)})`
        : `Descuento superior al 10% (${descuento}%)`,
    };
  }
  // Ejecutivo aprueba directo
  return { aprobacionRequerida: false, nivelAprobacion: 'ejecutivo' };
}

function formatearMonto(valor: number): string {
  if (valor >= 1000000) return `$${Math.round(valor / 1000000)}M`;
  if (valor >= 1000) return `$${Math.round(valor / 1000)}K`;
  return `$${valor}`;
}

function generarAprobadores(nivel: string): { nombre: string; email: string; nivel: string }[] {
  const aprobadoresPorNivel: Record<string, { nombre: string; email: string; nivel: string }[]> = {
    jefatura: [
      { nombre: 'Carlos Mendoza', email: 'cmendoza@silexar.cl', nivel: 'Jefe Comercial' },
    ],
    gerencia: [
      { nombre: 'Carlos Mendoza', email: 'cmendoza@silexar.cl', nivel: 'Jefe Comercial' },
      { nombre: 'Patricia Vergara', email: 'pvergara@silexar.cl', nivel: 'Gerente de Ventas' },
    ],
    directorio: [
      { nombre: 'Carlos Mendoza', email: 'cmendoza@silexar.cl', nivel: 'Jefe Comercial' },
      { nombre: 'Patricia Vergara', email: 'pvergara@silexar.cl', nivel: 'Gerente de Ventas' },
      { nombre: 'Roberto Salas', email: 'rsalas@silexar.cl', nivel: 'Director General' },
    ],
  };
  return aprobadoresPorNivel[nivel] || [];
}

// ═══════════════════════════════════════════════════════════════
// QUICK CAPTURE
// ═══════════════════════════════════════════════════════════════

function handleQuickCapture(datos: SmartCaptureRequest['datos'], inicio: number) {
  const clienteDB = datos.clienteNombre ? buscarCliente(datos.clienteNombre) : null;

  const fechaInicio = datos.periodoInicio || new Date().toISOString().split('T')[0];
  const fechaFin = datos.periodoFin || '';

  // Generar líneas desde historial del cliente
  let lineasPauta: LineaPautaSugerida[] = [];
  let lineasClonadas = false;

  if (clienteDB?.lineasAnteriores) {
    lineasPauta = clonarLineasDelHistorial(clienteDB, {
      fechaInicio,
      fechaFin,
      descuento: clienteDB.descuentoHistorico,
    } as DatosExtraidos);
    lineasClonadas = true;
  }

  const facturacion: CondicionesFacturacion = {
    modalidad: clienteDB?.modalidadFacturacion || 'mensual',
    tipoFactura: 'factura',
    diasPago: clienteDB?.diasPago || 30,
    requiereGarantia: (datos.valorEstimado || clienteDB?.ultimoValor || 0) > 100000000,
    confianza: clienteDB ? 90 : 60,
  };

  const datosExtraidos: DatosExtraidos = {
    clienteNombre: datos.clienteNombre || '',
    clienteId: clienteDB?.id,
    esClienteNuevo: !clienteDB,
    tipoContrato: 'Quick',
    valorEstimado: datos.valorEstimado || clienteDB?.ultimoValor || 0,
    moneda: 'CLP',
    fechaInicio,
    fechaFin,
    duracionMeses: 1,
    mediosDetectados: clienteDB?.mediosPreferidos || [],
    lineasPauta,
    descuento: clienteDB?.descuentoHistorico || 0,
    condicionesPago: clienteDB ? `${clienteDB.diasPago} días` : '30 días',
    facturacion,
    urgencia: 'media',
    notasAdicionales: datos.notas || '',
    confianzaGlobal: clienteDB ? 92 : 60,
    camposDetectados: [
      { campo: 'cliente', valor: datos.clienteNombre || '', confianza: 95, fuente: 'quick' },
      { campo: 'valor', valor: datos.valorEstimado || 0, confianza: 90, fuente: 'quick' },
    ],
    camposFaltantes: [],
    contratoAnteriorId: clienteDB?.contratoAnteriorId,
    lineasClonadas,
  };

  const contratoSugerido = generarContratoSugerido(datosExtraidos);
  const borradorId = `draft-${Date.now()}-quick`;

  const response: SmartCaptureResponse = {
    success: true,
    borradorId,
    datosExtraidos,
    contratoSugerido,
    tiempoProcesamiento: Date.now() - inicio,
    metodo: 'quick',
    requiereValidacion: !clienteDB,
  };

  borradores.set(borradorId, response);
  return NextResponse.json(response);
}
