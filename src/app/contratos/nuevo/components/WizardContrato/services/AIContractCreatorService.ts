/**
 * 🤖 SILEXAR PULSE - AI Contract Creator Service TIER 0
 * 
 * @description Servicio de creación autónoma de contratos que procesa:
 * - Mensajes de WhatsApp
 * - Notas de voz / Audio
 * - Documentos adjuntos (vouchers, negociaciones)
 * - Emails
 * - Chat interno
 * 
 * Los contratos creados se ponen en cola de validación para que
 * el ejecutivo los revise antes de activarlos.
 * 
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export type OrigenSolicitud = 'WHATSAPP' | 'AUDIO' | 'DOCUMENTO' | 'EMAIL' | 'CHAT';

export type EstadoProcesamiento = 
  | 'PENDIENTE'
  | 'PROCESANDO'
  | 'ESPERANDO_VALIDACION'
  | 'VALIDADO'
  | 'RECHAZADO'
  | 'ERROR';

export interface SolicitudContratoIA {
  id: string;
  origen: OrigenSolicitud;
  origenId?: string;
  
  // Solicitante
  solicitante: {
    id?: string;
    nombre?: string;
    telefono?: string;
    email?: string;
  };
  
  // Contenido
  contenidoOriginal: string;
  archivoOriginal?: string;
  transcripcion?: string;
  
  // Datos extraídos
  datosExtraidos: DatosContratoExtraidos;
  confianzaExtraccion: number;
  camposDetectados: string[];
  camposFaltantes: string[];
  
  // Estado
  estado: EstadoProcesamiento;
  contratoGeneradoId?: string;
  
  // Validación
  validadoPor?: string;
  fechaValidacion?: Date;
  comentarioValidacion?: string;
  
  // Timestamps
  fechaCreacion: Date;
  fechaModificacion: Date;
}

export interface DatosContratoExtraidos {
  // Cliente
  clienteNombre?: string;
  clienteRut?: string;
  clienteContacto?: string;
  
  // Contrato
  tipoContrato?: string;
  valorEstimado?: number;
  moneda?: string;
  
  // Fechas
  fechaInicio?: string;
  fechaFin?: string;
  duracionMeses?: number;
  
  // Medios y especificaciones
  mediosDetectados?: string[];
  programasDetectados?: string[];
  horariosDetectados?: string[];
  
  // Comercial
  descuentoMencionado?: number;
  condicionesPago?: string;
  
  // Otros
  notasAdicionales?: string;
  urgencia?: 'baja' | 'media' | 'alta';
}

export interface ResultadoProcesamiento {
  exito: boolean;
  solicitudId: string;
  datosExtraidos: DatosContratoExtraidos;
  confianza: number;
  mensajeUsuario: string;
  contratoSugerido?: DatosContratoSugerido;
  errores?: string[];
}

export interface DatosContratoSugerido {
  cliente: {
    nombre: string;
    id?: string;
    esNuevo: boolean;
  };
  tipoContrato: string;
  fechaInicio: string;
  fechaFin: string;
  valorTotal: number;
  descuento: number;
  terminosPago: number;
  lineas: LineaSugerida[];
}

export interface LineaSugerida {
  medio: string;
  programa?: string;
  horario?: string;
  cantidad: number;
  unidad: string;
  valorUnitario: number;
  confianza: number;
}

// ═══════════════════════════════════════════════════════════════
// PATRONES DE EXTRACCIÓN (REGEX + NLP)
// ═══════════════════════════════════════════════════════════════

const PATRONES = {
  // Clientes
  cliente: /(?:cliente|anunciante|para|de)\s*[:-]?\s*([A-ZÁÉÍÓÚÑa-záéíóúñ\s]+?)(?:\s*[,.\n]|$)/i,
  rut: /\b(\d{1,2}[.\d]{0,10}-[\dkK])\b/,
  
  // Valores
  valor: /(?:valor|monto|total|inversión|presupuesto)\s*[:-]?\s*\$?\s*([\d.,]+)\s*(?:millones?|MM|M|mil|K)?/gi,
  descuento: /(?:descuento|dto|desc)\s*[:-]?\s*(\d+)\s*%/gi,
  
  // Fechas
  fecha: /(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/g,
  mesAño: /(?:enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+(\d{4})/gi,
  duracion: /(?:por|durante|plazo\s+de)\s+(\d+)\s*(?:meses?|años?)/gi,
  
  // Medios
  radio: /\b(?:radio|emisora|fm|am|dial)\b/gi,
  tv: /\b(?:tv|televisión|televisor|canal|tele)\b/gi,
  digital: /\b(?:digital|online|web|redes|facebook|instagram|youtube|tiktok|google)\b/gi,
  via_publica: /\b(?:vía\s*pública|outdoor|exterior|paleta|municipio|metro)\b/gi,
  
  // Programas
  programa: /(?:programa|espacio|noticiero)\s*[:-]?\s*["']?([^"'\n,]+)["']?/gi,
  horario: /(\d{1,2}:\d{2})\s*(?:a|-)?\s*(\d{1,2}:\d{2})?/g,
  
  // Urgencia
  urgente: /\b(?:urgente|rápido|inmediato|pronto|asap|antes\s+de)\b/gi,
  
  // Pago
  pago: /(?:pago|factura|facturación)\s*(?:a)?\s*(\d+)\s*días?/gi
};

// ═══════════════════════════════════════════════════════════════
// MOTOR DE CREACIÓN IA
// ═══════════════════════════════════════════════════════════════

class AIContractCreatorEngine {
  private static instance: AIContractCreatorEngine;
  private solicitudesEnProceso: Map<string, SolicitudContratoIA> = new Map();

  private constructor() {}

  static getInstance(): AIContractCreatorEngine {
    if (!this.instance) {
      this.instance = new AIContractCreatorEngine();
    }
    return this.instance;
  }

  // ═══════════════════════════════════════════════════════════════
  // PROCESAMIENTO DE WHATSAPP
  // ═══════════════════════════════════════════════════════════════

  async procesarMensajeWhatsApp(mensaje: {
    texto: string;
    remitente: string;
    telefono: string;
    archivosAdjuntos?: string[];
    audioUrl?: string;
  }): Promise<ResultadoProcesamiento> {
    const solicitudId = this.generarId();
    
    let contenidoCompleto = mensaje.texto;
    
    // Si hay audio, transcribirlo
    if (mensaje.audioUrl) {
      const transcripcion = await this.transcribirAudio(mensaje.audioUrl);
      contenidoCompleto += `\n\n[AUDIO TRANSCRITO]: ${transcripcion}`;
    }
    
    // Procesar archivos adjuntos
    if (mensaje.archivosAdjuntos?.length) {
      for (const archivo of mensaje.archivosAdjuntos) {
        const textoExtraido = await this.procesarDocumento(archivo);
        contenidoCompleto += `\n\n[DOCUMENTO]: ${textoExtraido}`;
      }
    }
    
    // Extraer datos
    const datosExtraidos = this.extraerDatosDeTexto(contenidoCompleto);
    const confianza = this.calcularConfianza(datosExtraidos);
    
    // Crear solicitud
    const solicitud: SolicitudContratoIA = {
      id: solicitudId,
      origen: 'WHATSAPP',
      solicitante: {
        nombre: mensaje.remitente,
        telefono: mensaje.telefono
      },
      contenidoOriginal: mensaje.texto,
      datosExtraidos,
      confianzaExtraccion: confianza,
      camposDetectados: this.getCamposDetectados(datosExtraidos),
      camposFaltantes: this.getCamposFaltantes(datosExtraidos),
      estado: 'ESPERANDO_VALIDACION',
      fechaCreacion: new Date(),
      fechaModificacion: new Date()
    };
    
    this.solicitudesEnProceso.set(solicitudId, solicitud);
    
    return {
      exito: true,
      solicitudId,
      datosExtraidos,
      confianza,
      mensajeUsuario: this.generarMensajeConfirmacion(datosExtraidos, confianza),
      contratoSugerido: this.generarContratoSugerido(datosExtraidos)
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // PROCESAMIENTO DE AUDIO/VOZ
  // ═══════════════════════════════════════════════════════════════

  async procesarAudio(audioUrl: string, solicitante: {
    id?: string;
    nombre: string;
  }): Promise<ResultadoProcesamiento> {
    const solicitudId = this.generarId();
    
    // Transcribir audio (simular Speech-to-Text)
    const transcripcion = await this.transcribirAudio(audioUrl);
    
    // Extraer datos
    const datosExtraidos = this.extraerDatosDeTexto(transcripcion);
    const confianza = this.calcularConfianza(datosExtraidos);
    
    const solicitud: SolicitudContratoIA = {
      id: solicitudId,
      origen: 'AUDIO',
      archivoOriginal: audioUrl,
      transcripcion,
      solicitante,
      contenidoOriginal: transcripcion,
      datosExtraidos,
      confianzaExtraccion: confianza,
      camposDetectados: this.getCamposDetectados(datosExtraidos),
      camposFaltantes: this.getCamposFaltantes(datosExtraidos),
      estado: 'ESPERANDO_VALIDACION',
      fechaCreacion: new Date(),
      fechaModificacion: new Date()
    };
    
    this.solicitudesEnProceso.set(solicitudId, solicitud);
    
    return {
      exito: true,
      solicitudId,
      datosExtraidos,
      confianza,
      mensajeUsuario: `✅ Audio procesado. Transcripción:\n"${transcripcion.substring(0, 200)}..."`,
      contratoSugerido: this.generarContratoSugerido(datosExtraidos)
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // PROCESAMIENTO DE DOCUMENTOS
  // ═══════════════════════════════════════════════════════════════

  async procesarDocumentoAdjunto(
    archivoUrl: string,
    tipoArchivo: string,
    solicitante: { id?: string; nombre: string }
  ): Promise<ResultadoProcesamiento> {
    const solicitudId = this.generarId();
    
    // Extraer texto del documento
    const textoExtraido = await this.procesarDocumento(archivoUrl);
    
    // Extraer datos
    const datosExtraidos = this.extraerDatosDeDocumento(textoExtraido, tipoArchivo);
    const confianza = this.calcularConfianza(datosExtraidos);
    
    const solicitud: SolicitudContratoIA = {
      id: solicitudId,
      origen: 'DOCUMENTO',
      archivoOriginal: archivoUrl,
      solicitante,
      contenidoOriginal: textoExtraido,
      datosExtraidos,
      confianzaExtraccion: confianza,
      camposDetectados: this.getCamposDetectados(datosExtraidos),
      camposFaltantes: this.getCamposFaltantes(datosExtraidos),
      estado: 'ESPERANDO_VALIDACION',
      fechaCreacion: new Date(),
      fechaModificacion: new Date()
    };
    
    this.solicitudesEnProceso.set(solicitudId, solicitud);
    
    return {
      exito: true,
      solicitudId,
      datosExtraidos,
      confianza,
      mensajeUsuario: `📄 Documento procesado. Se detectaron ${this.getCamposDetectados(datosExtraidos).length} campos.`,
      contratoSugerido: this.generarContratoSugerido(datosExtraidos)
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // EXTRACCIÓN DE DATOS (NLP)
  // ═══════════════════════════════════════════════════════════════

  private extraerDatosDeTexto(texto: string): DatosContratoExtraidos {
    const datos: DatosContratoExtraidos = {};
    
    // Extraer cliente
    const clienteMatch = texto.match(PATRONES.cliente);
    if (clienteMatch) {
      datos.clienteNombre = clienteMatch[1].trim();
    }
    
    // Extraer RUT
    const rutMatch = texto.match(PATRONES.rut);
    if (rutMatch) {
      datos.clienteRut = rutMatch[1];
    }
    
    // Extraer valor
    const valorMatches = [...texto.matchAll(PATRONES.valor)];
    if (valorMatches.length > 0) {
      const valorTexto = valorMatches[0][1].replace(/\./g, '').replace(',', '.');
      let valor = parseFloat(valorTexto);
      
      // Detectar multiplicador
      const fullMatch = valorMatches[0][0].toLowerCase();
      if (fullMatch.includes('millon') || fullMatch.includes('mm')) {
        valor *= 1000000;
      } else if (fullMatch.includes('mil') || fullMatch.includes('k')) {
        valor *= 1000;
      }
      
      datos.valorEstimado = valor;
    }
    
    // Extraer descuento
    const descuentoMatch = texto.match(PATRONES.descuento);
    if (descuentoMatch) {
      datos.descuentoMencionado = parseInt(descuentoMatch[1]);
    }
    
    // Extraer fechas
    const fechaMatches = [...texto.matchAll(PATRONES.fecha)];
    if (fechaMatches.length >= 1) {
      datos.fechaInicio = `${fechaMatches[0][3]}-${fechaMatches[0][2].padStart(2, '0')}-${fechaMatches[0][1].padStart(2, '0')}`;
      if (fechaMatches.length >= 2) {
        datos.fechaFin = `${fechaMatches[1][3]}-${fechaMatches[1][2].padStart(2, '0')}-${fechaMatches[1][1].padStart(2, '0')}`;
      }
    }
    
    // Extraer duración
    const duracionMatch = texto.match(PATRONES.duracion);
    if (duracionMatch) {
      datos.duracionMeses = parseInt(duracionMatch[1]);
      if (duracionMatch[0].toLowerCase().includes('año')) {
        datos.duracionMeses *= 12;
      }
    }
    
    // Detectar medios
    const medios: string[] = [];
    if (PATRONES.radio.test(texto)) medios.push('RADIO');
    if (PATRONES.tv.test(texto)) medios.push('TV');
    if (PATRONES.digital.test(texto)) medios.push('DIGITAL');
    if (PATRONES.via_publica.test(texto)) medios.push('VIA_PUBLICA');
    datos.mediosDetectados = medios;
    
    // Detectar programas
    const programaMatches = [...texto.matchAll(PATRONES.programa)];
    datos.programasDetectados = programaMatches.map(m => m[1].trim());
    
    // Detectar horarios
    const horarioMatches = [...texto.matchAll(PATRONES.horario)];
    datos.horariosDetectados = horarioMatches.map(m => 
      m[2] ? `${m[1]}-${m[2]}` : m[1]
    );
    
    // Detectar términos de pago
    const pagoMatch = texto.match(PATRONES.pago);
    if (pagoMatch) {
      datos.condicionesPago = `${pagoMatch[1]} días`;
    }
    
    // Detectar urgencia
    if (PATRONES.urgente.test(texto)) {
      datos.urgencia = 'alta';
    }
    
    return datos;
  }

  private extraerDatosDeDocumento(texto: string, tipoArchivo: string): DatosContratoExtraidos {
    const datos = this.extraerDatosDeTexto(texto);
    
    // Lógica adicional según tipo de documento
    if (tipoArchivo.includes('voucher') || tipoArchivo.includes('oc')) {
      datos.tipoContrato = 'ORDEN_COMPRA';
    } else if (tipoArchivo.includes('negociacion') || tipoArchivo.includes('propuesta')) {
      datos.tipoContrato = 'NUEVO';
    }
    
    return datos;
  }

  // ═══════════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════════

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async transcribirAudio(_audioUrl: string): Promise<string> {
    // Simular transcripción (aquí iría Speech-to-Text real)
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock de transcripción
    return `Hola, necesito crear un contrato para Banco Chile por 50 millones 
            para radio y televisión, desde el 1 de enero hasta el 30 de junio, 
            con descuento del 15% y pago a 45 días.`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async procesarDocumento(_archivoUrl: string): Promise<string> {
    // Simular OCR/extracción de texto
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock
    return `ORDEN DE COMPRA
            Cliente: Falabella Retail
            RUT: 90.749.000-9
            Fecha: 15/01/2025
            Valor: $120.000.000
            Medios: Radio + Digital
            Vigencia: 6 meses`;
  }

  private calcularConfianza(datos: DatosContratoExtraidos): number {
    const camposRequeridos = ['clienteNombre', 'valorEstimado'];
    const camposImportantes = ['fechaInicio', 'mediosDetectados', 'duracionMeses'];
    
    let score = 0;
    
    // Campos requeridos: 30% cada uno
    camposRequeridos.forEach(campo => {
      if (datos[campo as keyof DatosContratoExtraidos]) score += 30;
    });
    
    // Campos importantes: 10% cada uno
    camposImportantes.forEach(campo => {
      const valor = datos[campo as keyof DatosContratoExtraidos];
      if (valor && (Array.isArray(valor) ? valor.length > 0 : true)) score += 10;
    });
    
    // Bonus por campos adicionales
    if (datos.descuentoMencionado !== undefined) score += 5;
    if (datos.condicionesPago) score += 5;
    
    return Math.min(score, 100);
  }

  private getCamposDetectados(datos: DatosContratoExtraidos): string[] {
    return Object.entries(datos)
      .filter(([, valor]) => {
        if (valor === undefined || valor === null) return false;
        if (Array.isArray(valor)) return valor.length > 0;
        return true;
      })
      .map(([clave]) => clave);
  }

  private getCamposFaltantes(datos: DatosContratoExtraidos): string[] {
    const requeridos = ['clienteNombre', 'valorEstimado', 'fechaInicio', 'mediosDetectados'];
    return requeridos.filter(campo => {
      const valor = datos[campo as keyof DatosContratoExtraidos];
      if (valor === undefined || valor === null) return true;
      if (Array.isArray(valor)) return valor.length === 0;
      return false;
    });
  }

  private generarMensajeConfirmacion(datos: DatosContratoExtraidos, confianza: number): string {
    const lineas = ['📋 *Datos detectados:*\n'];
    
    if (datos.clienteNombre) lineas.push(`👤 Cliente: ${datos.clienteNombre}`);
    if (datos.valorEstimado) lineas.push(`💰 Valor: $${datos.valorEstimado.toLocaleString('es-CL')}`);
    if (datos.mediosDetectados?.length) lineas.push(`📺 Medios: ${datos.mediosDetectados.join(', ')}`);
    if (datos.fechaInicio) lineas.push(`📅 Inicio: ${datos.fechaInicio}`);
    if (datos.duracionMeses) lineas.push(`⏱️ Duración: ${datos.duracionMeses} meses`);
    if (datos.descuentoMencionado) lineas.push(`🏷️ Descuento: ${datos.descuentoMencionado}%`);
    
    lineas.push(`\n🎯 Confianza: ${confianza}%`);
    
    if (this.getCamposFaltantes(datos).length > 0) {
      lineas.push(`\n⚠️ Campos faltantes: ${this.getCamposFaltantes(datos).join(', ')}`);
    }
    
    return lineas.join('\n');
  }

  private generarContratoSugerido(datos: DatosContratoExtraidos): DatosContratoSugerido | undefined {
    if (!datos.clienteNombre || !datos.valorEstimado) return undefined;
    
    const hoy = new Date();
    const fechaInicio = datos.fechaInicio || hoy.toISOString().split('T')[0];
    const duracion = datos.duracionMeses || 12;
    const fechaFin = datos.fechaFin || new Date(
      hoy.getFullYear(),
      hoy.getMonth() + duracion,
      hoy.getDate()
    ).toISOString().split('T')[0];
    
    return {
      cliente: {
        nombre: datos.clienteNombre,
        esNuevo: true // Verificar en BD
      },
      tipoContrato: datos.tipoContrato || 'NUEVO',
      fechaInicio,
      fechaFin,
      valorTotal: datos.valorEstimado,
      descuento: datos.descuentoMencionado || 0,
      terminosPago: datos.condicionesPago ? parseInt(datos.condicionesPago) : 30,
      lineas: this.generarLineasSugeridas(datos)
    };
  }

  private generarLineasSugeridas(datos: DatosContratoExtraidos): LineaSugerida[] {
    if (!datos.mediosDetectados?.length || !datos.valorEstimado) return [];
    
    const valorPorMedio = datos.valorEstimado / datos.mediosDetectados.length;
    
    return datos.mediosDetectados.map((medio, idx) => ({
      medio,
      programa: datos.programasDetectados?.[idx] || undefined,
      horario: datos.horariosDetectados?.[idx] || undefined,
      cantidad: 1,
      unidad: 'CAMPAÑA',
      valorUnitario: valorPorMedio,
      confianza: 75
    }));
  }

  private generarId(): string {
    return `sol-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // ═══════════════════════════════════════════════════════════════
  // GESTIÓN DE COLA
  // ═══════════════════════════════════════════════════════════════

  async getSolicitudesPendientes(): Promise<SolicitudContratoIA[]> {
    return Array.from(this.solicitudesEnProceso.values())
      .filter(s => s.estado === 'ESPERANDO_VALIDACION')
      .sort((a, b) => b.fechaCreacion.getTime() - a.fechaCreacion.getTime());
  }

  async validarSolicitud(
    solicitudId: string,
    aprobado: boolean,
    validadoPor: string,
    modificaciones?: Partial<DatosContratoExtraidos>,
    comentario?: string
  ): Promise<{ exito: boolean; contratoId?: string }> {
    const solicitud = this.solicitudesEnProceso.get(solicitudId);
    if (!solicitud) {
      return { exito: false };
    }
    
    solicitud.estado = aprobado ? 'VALIDADO' : 'RECHAZADO';
    solicitud.validadoPor = validadoPor;
    solicitud.fechaValidacion = new Date();
    solicitud.comentarioValidacion = comentario;
    
    if (aprobado) {
      // Aplicar modificaciones si las hay
      if (modificaciones) {
        Object.assign(solicitud.datosExtraidos, modificaciones);
      }
      
      // Crear contrato real
      const contratoId = await this.crearContrato(solicitud);
      solicitud.contratoGeneradoId = contratoId;
      
      return { exito: true, contratoId };
    }
    
    return { exito: true };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async crearContrato(_solicitud: SolicitudContratoIA): Promise<string> {
    // Aquí iría la lógica de creación real del contrato
    return `CTR-${Date.now()}`;
  }
}

// ═══════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════

export const AIContractCreator = AIContractCreatorEngine.getInstance();

export function useAIContractCreator() {
  return AIContractCreator;
}
