/**
 * 📎 SILEXAR PULSE - Documentation Ingestion Service TIER 0
 * 
 * @description Servicio de ingesta de documentación de negociación con:
 * - Drag & Drop desde Gmail/Outlook
 * - Email forwarding desde móvil
 * - WhatsApp forwarding
 * - Upload directo
 * - Procesamiento automático con IA
 * 
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export type OrigenDocumento = 
  | 'DRAG_DROP'
  | 'EMAIL_FORWARD'
  | 'WHATSAPP'
  | 'UPLOAD'
  | 'GMAIL_API'
  | 'OUTLOOK_API'
  | 'SCANNER';

export type TipoDocumento = 
  | 'EMAIL'
  | 'ADJUNTO'
  | 'COTIZACION'
  | 'ORDEN_COMPRA'
  | 'VOUCHER'
  | 'BRIEF'
  | 'PROPUESTA'
  | 'CONTRATO_ANTERIOR'
  | 'ACTA_REUNION'
  | 'MENSAJE_CHAT'
  | 'OTRO';

export type EstadoProcesamiento = 
  | 'PENDIENTE'
  | 'PROCESANDO'
  | 'PROCESADO'
  | 'ERROR'
  | 'REQUIERE_REVISION';

export interface DocumentoNegociacion {
  id: string;
  contratoId?: string;
  
  // Origen
  origen: OrigenDocumento;
  origenDetalle?: string; // ej: "Gmail - juan@empresa.cl"
  
  // Información del documento
  tipo: TipoDocumento;
  nombreArchivo: string;
  tipoMime: string;
  tamaño: number;
  
  // Almacenamiento
  storageUrl: string;
  thumbnailUrl?: string;
  
  // Contenido extraído
  contenidoTexto?: string;
  metadatos: MetadatosDocumento;
  
  // Email específico
  emailData?: EmailData;
  
  // Procesamiento IA
  estadoProcesamiento: EstadoProcesamiento;
  datosExtraidos?: DatosExtraidosDocumento;
  confianzaExtraccion?: number;
  
  // Control
  subidoPor: string;
  fechaSubida: Date;
  fechaModificacion: Date;
  activo: boolean;
}

export interface EmailData {
  de: string;
  para: string[];
  cc?: string[];
  asunto: string;
  fecha: Date;
  cuerpoTexto: string;
  cuerpoHtml?: string;
  adjuntos: AdjuntoEmail[];
  hiloId?: string;
  messageId?: string;
}

export interface AdjuntoEmail {
  nombre: string;
  tipoMime: string;
  tamaño: number;
  url: string;
}

export interface MetadatosDocumento {
  autor?: string;
  fechaCreacion?: Date;
  fechaModificacion?: Date;
  paginas?: number;
  idioma?: string;
  [key: string]: unknown;
}

export interface DatosExtraidosDocumento {
  // Cliente
  clienteNombre?: string;
  clienteRut?: string;
  clienteContacto?: string;
  clienteEmail?: string;
  
  // Comercial
  valorMencionado?: number;
  descuentoMencionado?: number;
  condicionesPago?: string;
  
  // Fechas
  fechasMencionadas?: string[];
  
  // Medios
  mediosMencionados?: string[];
  programasMencionados?: string[];
  
  // Compromisos
  compromisos?: string[];
  acuerdos?: string[];
  
  // Keywords
  palabrasClave?: string[];
}

export interface ConfiguracionEmail {
  direccionRecepcion: string; // ej: docs-ctr123@silexar.cl
  activo: boolean;
  fechaCreacion: Date;
  fechaExpiracion?: Date;
}

// ═══════════════════════════════════════════════════════════════
// CONFIGURACIÓN DE EMAILS DE INGESTA
// ═══════════════════════════════════════════════════════════════

class EmailIngestConfig {
  private static instance: EmailIngestConfig;
  private configs: Map<string, ConfiguracionEmail> = new Map();

  private constructor() {}

  static getInstance(): EmailIngestConfig {
    if (!this.instance) {
      this.instance = new EmailIngestConfig();
    }
    return this.instance;
  }

  /**
   * Genera una dirección única de email para un contrato
   */
  generarDireccionContrato(contratoId: string): ConfiguracionEmail {
    const direccion = `docs-${contratoId.substring(0, 8)}@ingest.silexar.cl`;
    
    const config: ConfiguracionEmail = {
      direccionRecepcion: direccion,
      activo: true,
      fechaCreacion: new Date(),
      fechaExpiracion: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 días
    };
    
    this.configs.set(contratoId, config);
    return config;
  }

  /**
   * Obtiene la configuración de email para un contrato
   */
  getConfigContrato(contratoId: string): ConfiguracionEmail | undefined {
    return this.configs.get(contratoId);
  }

  /**
   * Procesa un email recibido
   */
  async procesarEmailRecibido(email: EmailData): Promise<DocumentoNegociacion[]> {
    // Extraer contratoId del email destino
    const contratoId = this.extraerContratoIdDeEmail(email.para[0]);
    if (!contratoId) return [];

    const documentos: DocumentoNegociacion[] = [];

    // Crear documento para el email principal
    const docEmail: DocumentoNegociacion = {
      id: `doc-${Date.now()}-email`,
      contratoId,
      origen: 'EMAIL_FORWARD',
      origenDetalle: email.de,
      tipo: 'EMAIL',
      nombreArchivo: `Email - ${email.asunto}`,
      tipoMime: 'message/rfc822',
      tamaño: email.cuerpoTexto.length,
      storageUrl: '',
      contenidoTexto: email.cuerpoTexto,
      metadatos: {
        autor: email.de,
        fechaCreacion: email.fecha
      },
      emailData: email,
      estadoProcesamiento: 'PENDIENTE',
      subidoPor: 'SISTEMA',
      fechaSubida: new Date(),
      fechaModificacion: new Date(),
      activo: true
    };

    documentos.push(docEmail);

    // Procesar adjuntos
    for (const adjunto of email.adjuntos) {
      const docAdjunto: DocumentoNegociacion = {
        id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        contratoId,
        origen: 'EMAIL_FORWARD',
        origenDetalle: `Adjunto de ${email.de}`,
        tipo: this.detectarTipoDocumento(adjunto.nombre),
        nombreArchivo: adjunto.nombre,
        tipoMime: adjunto.tipoMime,
        tamaño: adjunto.tamaño,
        storageUrl: adjunto.url,
        metadatos: {},
        estadoProcesamiento: 'PENDIENTE',
        subidoPor: 'SISTEMA',
        fechaSubida: new Date(),
        fechaModificacion: new Date(),
        activo: true
      };

      documentos.push(docAdjunto);
    }

    return documentos;
  }

  private extraerContratoIdDeEmail(email: string): string | null {
    const match = email.match(/docs-(\w+)@/);
    return match ? match[1] : null;
  }

  private detectarTipoDocumento(nombre: string): TipoDocumento {
    const nombreLower = nombre.toLowerCase();
    if (nombreLower.includes('cotizacion') || nombreLower.includes('quote')) return 'COTIZACION';
    if (nombreLower.includes('oc') || nombreLower.includes('orden')) return 'ORDEN_COMPRA';
    if (nombreLower.includes('voucher')) return 'VOUCHER';
    if (nombreLower.includes('brief')) return 'BRIEF';
    if (nombreLower.includes('propuesta')) return 'PROPUESTA';
    if (nombreLower.includes('contrato')) return 'CONTRATO_ANTERIOR';
    if (nombreLower.includes('acta') || nombreLower.includes('minuta')) return 'ACTA_REUNION';
    return 'ADJUNTO';
  }
}

// ═══════════════════════════════════════════════════════════════
// MOTOR PRINCIPAL DE INGESTA
// ═══════════════════════════════════════════════════════════════

class DocumentationIngestionEngine {
  private static instance: DocumentationIngestionEngine;
  private documentos: Map<string, DocumentoNegociacion[]> = new Map();
  private emailConfig = EmailIngestConfig.getInstance();

  private constructor() {}

  static getInstance(): DocumentationIngestionEngine {
    if (!this.instance) {
      this.instance = new DocumentationIngestionEngine();
    }
    return this.instance;
  }

  // ═══════════════════════════════════════════════════════════════
  // DRAG & DROP
  // ═══════════════════════════════════════════════════════════════

  /**
   * Procesa archivos arrastrados (drag & drop)
   * Soporta: archivos, emails (.eml), mensajes de Gmail
   */
  async procesarDragDrop(
    files: File[],
    contratoId: string,
    usuario: string
  ): Promise<DocumentoNegociacion[]> {
    const documentos: DocumentoNegociacion[] = [];

    for (const file of files) {
      const doc = await this.procesarArchivo(file, contratoId, usuario, 'DRAG_DROP');
      documentos.push(doc);
    }

    // Guardar en memoria (en producción: persistir en BD)
    const existing = this.documentos.get(contratoId) || [];
    this.documentos.set(contratoId, [...existing, ...documentos]);

    return documentos;
  }

  /**
   * Procesa datos de Gmail API (quando usuario arrastra email)
   */
  async procesarGmailDragData(
    gmailData: {
      messageId: string;
      threadId: string;
      subject: string;
      from: string;
      to: string[];
      date: string;
      body: string;
      attachments?: { filename: string; mimeType: string; data: string }[];
    },
    contratoId: string,
    usuario: string
  ): Promise<DocumentoNegociacion[]> {
    const documentos: DocumentoNegociacion[] = [];

    // Crear documento del email
    const emailDoc: DocumentoNegociacion = {
      id: `doc-gmail-${Date.now()}`,
      contratoId,
      origen: 'GMAIL_API',
      origenDetalle: gmailData.from,
      tipo: 'EMAIL',
      nombreArchivo: `Email - ${gmailData.subject}`,
      tipoMime: 'message/rfc822',
      tamaño: gmailData.body.length,
      storageUrl: '',
      contenidoTexto: gmailData.body,
      metadatos: {
        autor: gmailData.from,
        fechaCreacion: new Date(gmailData.date)
      },
      emailData: {
        de: gmailData.from,
        para: gmailData.to,
        asunto: gmailData.subject,
        fecha: new Date(gmailData.date),
        cuerpoTexto: gmailData.body,
        hiloId: gmailData.threadId,
        messageId: gmailData.messageId,
        adjuntos: []
      },
      estadoProcesamiento: 'PENDIENTE',
      subidoPor: usuario,
      fechaSubida: new Date(),
      fechaModificacion: new Date(),
      activo: true
    };

    documentos.push(emailDoc);

    // Procesar adjuntos de Gmail
    if (gmailData.attachments) {
      for (const att of gmailData.attachments) {
        const adjDoc = await this.procesarAdjuntoBase64(
          att.data,
          att.filename,
          att.mimeType,
          contratoId,
          usuario,
          'GMAIL_API'
        );
        documentos.push(adjDoc);
      }
    }

    // Procesar con IA
    await this.procesarConIA(documentos);

    // Guardar
    const existing = this.documentos.get(contratoId) || [];
    this.documentos.set(contratoId, [...existing, ...documentos]);

    return documentos;
  }

  // ═══════════════════════════════════════════════════════════════
  // EMAIL FORWARDING
  // ═══════════════════════════════════════════════════════════════

  /**
   * Obtiene o crea dirección de email para forwarding
   */
  getIngestEmailAddress(contratoId: string): string {
    let config = this.emailConfig.getConfigContrato(contratoId);
    if (!config) {
      config = this.emailConfig.generarDireccionContrato(contratoId);
    }
    return config.direccionRecepcion;
  }

  /**
   * Genera instrucciones para el usuario móvil
   */
  getInstruccionesMovil(contratoId: string): {
    email: string;
    whatsapp: string;
    instrucciones: string[];
  } {
    const emailIngesta = this.getIngestEmailAddress(contratoId);
    
    return {
      email: emailIngesta,
      whatsapp: '+56 9 8765 4321', // Número de ingesta WhatsApp
      instrucciones: [
        `📧 **Por Email:** Reenvía el correo de negociación a ${emailIngesta}`,
        `📱 **Por WhatsApp:** Envía capturas o PDFs al número de Silexar mencionando el contrato`,
        `📎 **Adjuntos:** Todos los archivos adjuntos se procesarán automáticamente`,
        `🤖 **IA:** El sistema extraerá automáticamente datos relevantes`
      ]
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // PROCESAMIENTO
  // ═══════════════════════════════════════════════════════════════

  private async procesarArchivo(
    file: File,
    contratoId: string,
    usuario: string,
    origen: OrigenDocumento
  ): Promise<DocumentoNegociacion> {
    // Leer contenido si es texto
    let contenidoTexto: string | undefined;
    if (file.type.includes('text') || file.type.includes('eml')) {
      contenidoTexto = await file.text();
    }

    const doc: DocumentoNegociacion = {
      id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      contratoId,
      origen,
      tipo: this.detectarTipo(file.name, file.type),
      nombreArchivo: file.name,
      tipoMime: file.type,
      tamaño: file.size,
      storageUrl: URL.createObjectURL(file), // En producción: subir a GCS
      contenidoTexto,
      metadatos: {
        fechaCreacion: new Date(file.lastModified)
      },
      estadoProcesamiento: 'PENDIENTE',
      subidoPor: usuario,
      fechaSubida: new Date(),
      fechaModificacion: new Date(),
      activo: true
    };

    // Procesar con IA asíncronamente
    this.procesarConIA([doc]);

    return doc;
  }

  private async procesarAdjuntoBase64(
    base64Data: string,
    filename: string,
    mimeType: string,
    contratoId: string,
    usuario: string,
    origen: OrigenDocumento
  ): Promise<DocumentoNegociacion> {
    const buffer = atob(base64Data);
    
    const doc: DocumentoNegociacion = {
      id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      contratoId,
      origen,
      origenDetalle: 'Adjunto de email',
      tipo: this.detectarTipo(filename, mimeType),
      nombreArchivo: filename,
      tipoMime: mimeType,
      tamaño: buffer.length,
      storageUrl: '', // En producción: subir a GCS
      metadatos: {},
      estadoProcesamiento: 'PENDIENTE',
      subidoPor: usuario,
      fechaSubida: new Date(),
      fechaModificacion: new Date(),
      activo: true
    };

    return doc;
  }

  private detectarTipo(nombre: string, mime: string): TipoDocumento {
    const nombreLower = nombre.toLowerCase();
    
    if (mime.includes('message') || nombreLower.endsWith('.eml')) return 'EMAIL';
    if (nombreLower.includes('cotizacion') || nombreLower.includes('quote')) return 'COTIZACION';
    if (nombreLower.includes('oc') || nombreLower.includes('orden')) return 'ORDEN_COMPRA';
    if (nombreLower.includes('voucher')) return 'VOUCHER';
    if (nombreLower.includes('brief')) return 'BRIEF';
    if (nombreLower.includes('propuesta')) return 'PROPUESTA';
    if (nombreLower.includes('contrato')) return 'CONTRATO_ANTERIOR';
    if (nombreLower.includes('acta') || nombreLower.includes('minuta')) return 'ACTA_REUNION';
    
    return 'ADJUNTO';
  }

  private async procesarConIA(documentos: DocumentoNegociacion[]): Promise<void> {
    for (const doc of documentos) {
      doc.estadoProcesamiento = 'PROCESANDO';
      
      try {
        // Simular procesamiento IA
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (doc.contenidoTexto) {
          doc.datosExtraidos = this.extraerDatosDeTexto(doc.contenidoTexto);
          doc.confianzaExtraccion = this.calcularConfianza(doc.datosExtraidos);
        }
        
        doc.estadoProcesamiento = 'PROCESADO';
      } catch {
        doc.estadoProcesamiento = 'ERROR';
      }
    }
  }

  private extraerDatosDeTexto(texto: string): DatosExtraidosDocumento {
    const datos: DatosExtraidosDocumento = {};
    
    // Extraer valores monetarios
    const valorMatch = texto.match(/\$\s*([\d.,]+)\s*(millones?|MM|M)?/gi);
    if (valorMatch) {
      let valor = parseFloat(valorMatch[0].replace(/[^\d.,]/g, '').replace(',', '.'));
      if (valorMatch[0].toLowerCase().includes('millon') || valorMatch[0].includes('MM')) {
        valor *= 1000000;
      }
      datos.valorMencionado = valor;
    }
    
    // Extraer descuentos
    const descMatch = texto.match(/(\d+)\s*%\s*(?:descuento|dto|discount)/gi);
    if (descMatch) {
      datos.descuentoMencionado = parseInt(descMatch[0]);
    }
    
    // Extraer medios
    const medios: string[] = [];
    if (/\b(radio|emisora|fm)\b/i.test(texto)) medios.push('RADIO');
    if (/\b(tv|televisión|canal)\b/i.test(texto)) medios.push('TV');
    if (/\b(digital|online|web|redes)\b/i.test(texto)) medios.push('DIGITAL');
    if (/\b(vía pública|outdoor)\b/i.test(texto)) medios.push('VIA_PUBLICA');
    datos.mediosMencionados = medios;
    
    // Extraer fechas
    const fechas = texto.match(/\b(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})\b/g);
    if (fechas) {
      datos.fechasMencionadas = fechas;
    }
    
    // Extraer compromisos (frases con "acordamos", "comprometemos", etc)
    const compromisos = texto.match(/(?:acordamos|comprometemos|confirmo|queda acordado)[^.]+\./gi);
    if (compromisos) {
      datos.compromisos = compromisos.map(c => c.trim());
    }
    
    return datos;
  }

  private calcularConfianza(datos: DatosExtraidosDocumento): number {
    let score = 50; // Base
    
    if (datos.valorMencionado) score += 15;
    if (datos.mediosMencionados?.length) score += 10;
    if (datos.fechasMencionadas?.length) score += 10;
    if (datos.compromisos?.length) score += 15;
    
    return Math.min(score, 100);
  }

  // ═══════════════════════════════════════════════════════════════
  // CONSULTAS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Obtiene todos los documentos de un contrato
   */
  getDocumentosContrato(contratoId: string): DocumentoNegociacion[] {
    return this.documentos.get(contratoId) || [];
  }

  /**
   * Obtiene resumen de documentación
   */
  getResumenDocumentacion(contratoId: string): {
    total: number;
    porTipo: Record<TipoDocumento, number>;
    porOrigen: Record<OrigenDocumento, number>;
    datosExtraidos: DatosExtraidosDocumento;
    confianzaPromedio: number;
  } {
    const docs = this.getDocumentosContrato(contratoId);
    
    const porTipo: Record<string, number> = {};
    const porOrigen: Record<string, number> = {};
    let totalConfianza = 0;
    let countConfianza = 0;
    const datosConsolidados: DatosExtraidosDocumento = {
      mediosMencionados: [],
      fechasMencionadas: [],
      compromisos: []
    };

    docs.forEach(doc => {
      porTipo[doc.tipo] = (porTipo[doc.tipo] || 0) + 1;
      porOrigen[doc.origen] = (porOrigen[doc.origen] || 0) + 1;
      
      if (doc.confianzaExtraccion) {
        totalConfianza += doc.confianzaExtraccion;
        countConfianza++;
      }
      
      if (doc.datosExtraidos) {
        if (doc.datosExtraidos.valorMencionado && !datosConsolidados.valorMencionado) {
          datosConsolidados.valorMencionado = doc.datosExtraidos.valorMencionado;
        }
        if (doc.datosExtraidos.mediosMencionados) {
          datosConsolidados.mediosMencionados?.push(...doc.datosExtraidos.mediosMencionados);
        }
        if (doc.datosExtraidos.compromisos) {
          datosConsolidados.compromisos?.push(...doc.datosExtraidos.compromisos);
        }
      }
    });

    // Deduplicar medios
    if (datosConsolidados.mediosMencionados) {
      datosConsolidados.mediosMencionados = [...new Set(datosConsolidados.mediosMencionados)];
    }

    return {
      total: docs.length,
      porTipo: porTipo as Record<TipoDocumento, number>,
      porOrigen: porOrigen as Record<OrigenDocumento, number>,
      datosExtraidos: datosConsolidados,
      confianzaPromedio: countConfianza > 0 ? totalConfianza / countConfianza : 0
    };
  }

  /**
   * Elimina un documento
   */
  eliminarDocumento(contratoId: string, documentoId: string): boolean {
    const docs = this.documentos.get(contratoId);
    if (!docs) return false;
    
    const filtered = docs.filter(d => d.id !== documentoId);
    this.documentos.set(contratoId, filtered);
    return filtered.length < docs.length;
  }
}

// ═══════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════

export const DocumentationIngestion = DocumentationIngestionEngine.getInstance();

export function useDocumentationIngestion() {
  return DocumentationIngestion;
}

// Types are already exported inline above
