/**
 * SILEXAR PULSE QUANTUM - TIER 0 ENTERPRISE
 * Entidad: DocumentoContrato
 * Nivel Fortune 10 - Gestión Empresarial Avanzada
 */

import { EstadoPlanPagos, EstadoPlanPagosEnum } from '../value-objects/EstadoPlanPagos';

export enum TipoDocumento {
  CONTRATO_PRINCIPAL = 'contrato_principal',
  ANEXO = 'anexo',
  ORDEN_COMPRA = 'orden_compra',
  PROPUESTA_COMERCIAL = 'propuesta_comercial',
  TERMINOS_CONDICIONES = 'terminos_condiciones',
  CLAUSULA_ADICIONAL = 'clausula_adicional',
  DOCUMENTO_LEGAL = 'documento_legal'
}

export enum EstadoFirma {
  PENDIENTE = 'pendiente',
  EN_PROCESO = 'en_proceso',
  FIRMADO_PARCIAL = 'firmado_parcial',
  FIRMADO_COMPLETO = 'firmado_completo',
  RECHAZADO = 'rechazado',
  VENCIDO = 'vencido'
}

export interface FirmanteProps {
  id: string;
  nombre: string;
  email: string;
  cargo: string;
  empresa: string;
  fechaFirma?: Date;
  ipFirma?: string;
  certificadoDigital?: string;
  observaciones?: string;
}

export interface VersionDocumentoProps {
  numero: number;
  fechaCreacion: Date;
  contenido: string;
  cambiosRealizados: string[];
  autorCambios: string;
  aprobado: boolean;
  hash: string;
}

export interface DocumentoContratoProps {
  id?: string;
  contratoId: string;
  tipo: TipoDocumento;
  nombre: string;
  descripcion?: string;
  plantillaId?: string;
  contenido: string;
  versiones: VersionDocumentoProps[];
  versionActual: number;
  firmantes: FirmanteProps[];
  estadoFirma: EstadoFirma;
  fechaCreacion: Date;
  fechaVencimiento?: Date;
  urlDocumento?: string;
  hashIntegridad: string;
  metadatos?: Record<string, unknown>;
  requiereNotarizacion: boolean;
  idioma: string;
}

export class DocumentoContrato {
  private _id: string;
  private _contratoId: string;
  private _tipo: TipoDocumento;
  private _nombre: string;
  private _descripcion?: string;
  private _plantillaId?: string;
  private _contenido: string;
  private _versiones: VersionDocumentoProps[];
  private _versionActual: number;
  private _firmantes: FirmanteProps[];
  private _estadoFirma: EstadoFirma;
  private _fechaCreacion: Date;
  private _fechaVencimiento?: Date;
  private _urlDocumento?: string;
  private _hashIntegridad: string;
  private _metadatos: Record<string, unknown>;
  private _requiereNotarizacion: boolean;
  private _idioma: string;

  // Configuraciones empresariales Fortune 10
  private static readonly DIAS_VENCIMIENTO_DEFAULT = 30;
  private static readonly MAX_VERSIONES = 50;
  private static readonly IDIOMAS_SOPORTADOS = ['es', 'en', 'pt', 'fr'];
  private static readonly TIPOS_REQUIEREN_NOTARIZACION = [
    TipoDocumento.CONTRATO_PRINCIPAL,
    TipoDocumento.DOCUMENTO_LEGAL
  ];

  constructor(props: DocumentoContratoProps) {
    this.validarPropiedades(props);

    this._id = props.id || this.generarId();
    this._contratoId = props.contratoId;
    this._tipo = props.tipo;
    this._nombre = props.nombre;
    this._descripcion = props.descripcion;
    this._plantillaId = props.plantillaId;
    this._contenido = props.contenido;
    this._versiones = props.versiones;
    this._versionActual = props.versionActual;
    this._firmantes = props.firmantes;
    this._estadoFirma = props.estadoFirma;
    this._fechaCreacion = props.fechaCreacion;
    this._fechaVencimiento = props.fechaVencimiento;
    this._urlDocumento = props.urlDocumento;
    this._hashIntegridad = props.hashIntegridad;
    this._metadatos = props.metadatos || {};
    this._requiereNotarizacion = props.requiereNotarizacion;
    this._idioma = props.idioma;
  }

  static create(
    contratoId: string,
    tipo: TipoDocumento,
    nombre: string,
    contenido: string,
    firmantes: FirmanteProps[],
    opciones?: Partial<Omit<DocumentoContratoProps, 'contratoId' | 'tipo' | 'nombre' | 'contenido' | 'firmantes'>>
  ): DocumentoContrato {
    const fechaCreacion = new Date();
    const versionInicial: VersionDocumentoProps = {
      numero: 1,
      fechaCreacion,
      contenido,
      cambiosRealizados: ['Versión inicial'],
      autorCambios: 'SISTEMA',
      aprobado: false,
      hash: DocumentoContrato.calcularHash(contenido)
    };

    const fechaVencimiento = new Date();
    fechaVencimiento.setDate(fechaVencimiento.getDate() + DocumentoContrato.DIAS_VENCIMIENTO_DEFAULT);

    return new DocumentoContrato({
      contratoId,
      tipo,
      nombre,
      contenido,
      firmantes,
      versiones: [versionInicial],
      versionActual: 1,
      estadoFirma: EstadoFirma.PENDIENTE,
      fechaCreacion,
      fechaVencimiento,
      hashIntegridad: versionInicial.hash,
      requiereNotarizacion: DocumentoContrato.TIPOS_REQUIEREN_NOTARIZACION.includes(tipo),
      idioma: 'es',
      ...opciones
    });
  }

  // Getters
  get id(): string { return this._id; }
  get contratoId(): string { return this._contratoId; }
  get tipo(): TipoDocumento { return this._tipo; }
  get nombre(): string { return this._nombre; }
  get descripcion(): string | undefined { return this._descripcion; }
  get plantillaId(): string | undefined { return this._plantillaId; }
  get contenido(): string { return this._contenido; }
  get versiones(): VersionDocumentoProps[] { return [...this._versiones]; }
  get versionActual(): number { return this._versionActual; }
  get firmantes(): FirmanteProps[] { return [...this._firmantes]; }
  get estadoFirma(): EstadoFirma { return this._estadoFirma; }
  get fechaCreacion(): Date { return this._fechaCreacion; }
  get fechaVencimiento(): Date | undefined { return this._fechaVencimiento; }
  get urlDocumento(): string | undefined { return this._urlDocumento; }
  get hashIntegridad(): string { return this._hashIntegridad; }
  get metadatos(): Record<string, unknown> { return { ...this._metadatos }; }
  get requiereNotarizacion(): boolean { return this._requiereNotarizacion; }
  get idioma(): string { return this._idioma; }

  /**
   * Genera el contenido del documento usando plantillas dinámicas
   */
  generarContenido(variables: Record<string, unknown>): void {
    let contenidoGenerado = this._contenido;

    // Reemplazar variables en el contenido
    Object.entries(variables).forEach(([clave, valor]) => {
      const regex = new RegExp(`{{${clave}}}`, 'g');
      contenidoGenerado = contenidoGenerado.replace(regex, String(valor));
    });

    // Agregar metadatos de generación
    this._metadatos.fechaGeneracion = new Date().toISOString();
    this._metadatos.variablesUtilizadas = Object.keys(variables);

    this.actualizarContenido(contenidoGenerado, 'Generación automática con variables', 'SISTEMA');
  }

  /**
   * Envía el documento para firma digital
   */
  async enviarParaFirma(
    servicioFirma: 'docusign' | 'adobe_sign' | 'custom',
    configuracion?: Record<string, unknown>
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      if (this._estadoFirma !== EstadoFirma.PENDIENTE) {
        throw new Error('El documento no está en estado pendiente para firma');
      }

      // Validar que todos los firmantes tengan email
      const firmantesSinEmail = this._firmantes.filter(f => !f.email);
      if (firmantesSinEmail.length > 0) {
        throw new Error('Todos los firmantes deben tener email configurado');
      }

      // Simular envío al servicio de firma (en producción sería una llamada real)
      const urlFirma = await this.simularEnvioServicioFirma(servicioFirma, configuracion);

      this._estadoFirma = EstadoFirma.EN_PROCESO;
      this._urlDocumento = urlFirma;
      this._metadatos.servicioFirma = servicioFirma;
      this._metadatos.fechaEnvioFirma = new Date().toISOString();

      return { success: true, url: urlFirma };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
    }
  }

  /**
   * Verifica si todas las firmas están completas
   */
  verificarFirmasCompletas(): boolean {
    const firmantesPendientes = this._firmantes.filter(f => !f.fechaFirma);
    const todasFirmasCompletas = firmantesPendientes.length === 0;

    if (todasFirmasCompletas && this._estadoFirma !== EstadoFirma.FIRMADO_COMPLETO) {
      this._estadoFirma = EstadoFirma.FIRMADO_COMPLETO;
      this._metadatos.fechaFirmaCompleta = new Date().toISOString();
    }

    return todasFirmasCompletas;
  }

  /**
   * Registra la firma de un firmante
   */
  registrarFirma(
    firmanteId: string,
    ipFirma: string,
    certificadoDigital?: string,
    observaciones?: string
  ): void {
    const firmante = this._firmantes.find(f => f.id === firmanteId);
    if (!firmante) {
      throw new Error('Firmante no encontrado');
    }

    if (firmante.fechaFirma) {
      throw new Error('El firmante ya ha firmado el documento');
    }

    firmante.fechaFirma = new Date();
    firmante.ipFirma = ipFirma;
    firmante.certificadoDigital = certificadoDigital;
    firmante.observaciones = observaciones;

    // Actualizar estado del documento
    const firmantesFirmados = this._firmantes.filter(f => f.fechaFirma).length;
    const totalFirmantes = this._firmantes.length;

    if (firmantesFirmados === totalFirmantes) {
      this._estadoFirma = EstadoFirma.FIRMADO_COMPLETO;
    } else if (firmantesFirmados > 0) {
      this._estadoFirma = EstadoFirma.FIRMADO_PARCIAL;
    }

    this._metadatos.ultimaFirma = {
      firmante: firmante.nombre,
      fecha: firmante.fechaFirma.toISOString(),
      progreso: `${firmantesFirmados}/${totalFirmantes}`
    };
  }

  /**
   * Actualiza el contenido del documento creando una nueva versión
   */
  actualizarContenido(
    nuevoContenido: string,
    descripcionCambios: string,
    autorCambios: string
  ): void {
    if (this._versiones.length >= DocumentoContrato.MAX_VERSIONES) {
      throw new Error(`Se ha alcanzado el límite máximo de ${DocumentoContrato.MAX_VERSIONES} versiones`);
    }

    const nuevaVersion: VersionDocumentoProps = {
      numero: this._versionActual + 1,
      fechaCreacion: new Date(),
      contenido: nuevoContenido,
      cambiosRealizados: [descripcionCambios],
      autorCambios,
      aprobado: false,
      hash: DocumentoContrato.calcularHash(nuevoContenido)
    };

    this._versiones.push(nuevaVersion);
    this._versionActual = nuevaVersion.numero;
    this._contenido = nuevoContenido;
    this._hashIntegridad = nuevaVersion.hash;

    // Resetear estado de firma si había firmas previas
    if (this._estadoFirma !== EstadoFirma.PENDIENTE) {
      this._estadoFirma = EstadoFirma.PENDIENTE;
      this._firmantes.forEach(f => {
        f.fechaFirma = undefined;
        f.ipFirma = undefined;
        f.certificadoDigital = undefined;
      });
    }
  }

  /**
   * Exporta el documento a PDF
   */
  async exportarAPDF(
    configuracion?: {
      incluirFirmas?: boolean;
      incluirMetadatos?: boolean;
      watermark?: string;
      protegido?: boolean;
      password?: string;
    }
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      // Simular generación de PDF (en producción sería una llamada real)
      const urlPDF = await this.simularGeneracionPDF(configuracion);

      this._metadatos.ultimaExportacionPDF = {
        fecha: new Date().toISOString(),
        configuracion,
        url: urlPDF
      };

      return { success: true, url: urlPDF };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Error en generación PDF' };
    }
  }

  /**
   * Verifica la integridad del documento
   */
  verificarIntegridad(): boolean {
    const hashActual = DocumentoContrato.calcularHash(this._contenido);
    return hashActual === this._hashIntegridad;
  }

  /**
   * Obtiene el historial de cambios
   */
  getHistorialCambios(): Array<{
    version: number;
    fecha: Date;
    autor: string;
    cambios: string[];
    aprobado: boolean;
  }> {
    return this._versiones.map(v => ({
      version: v.numero,
      fecha: v.fechaCreacion,
      autor: v.autorCambios,
      cambios: v.cambiosRealizados,
      aprobado: v.aprobado
    }));
  }

  /**
   * Verifica si el documento está próximo a vencer
   */
  estaProximoAVencer(diasAnticipacion: number = 7): boolean {
    if (!this._fechaVencimiento) return false;
    
    const ahora = new Date();
    const diasHastaVencimiento = Math.floor(
      (this._fechaVencimiento.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    return diasHastaVencimiento <= diasAnticipacion && diasHastaVencimiento > 0;
  }

  /**
   * Extiende la fecha de vencimiento
   */
  extenderVencimiento(diasExtension: number, motivo: string): void {
    if (!this._fechaVencimiento) {
      throw new Error('El documento no tiene fecha de vencimiento configurada');
    }

    const nuevaFecha = new Date(this._fechaVencimiento);
    nuevaFecha.setDate(nuevaFecha.getDate() + diasExtension);

    this._fechaVencimiento = nuevaFecha;
    this._metadatos.extensionesVencimiento = this._metadatos.extensionesVencimiento || [];
    this._metadatos.extensionesVencimiento.push({
      fecha: new Date().toISOString(),
      diasExtendidos: diasExtension,
      motivo,
      nuevaFechaVencimiento: nuevaFecha.toISOString()
    });
  }

  /**
   * Métodos privados de utilidad
   */
  private async simularEnvioServicioFirma(
    servicio: string,
    configuracion?: Record<string, unknown>
  ): Promise<string> {
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const baseUrl = (configuracion?.baseUrl as string | undefined) || 'https://firma-service.com';
    return `${baseUrl}/documento/${this._id}/firmar`;
  }

  private async simularGeneracionPDF(configuracion?: { incluirFirmas?: boolean; incluirMetadatos?: boolean; watermark?: string; protegido?: boolean; password?: string }): Promise<string> {
    // Simular delay de generación
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return `https://storage.silexar.com/documentos/${this._id}/v${this._versionActual}.pdf`;
  }

  private static calcularHash(contenido: string): string {
    // Implementación simplificada - en producción usar crypto real
    let hash = 0;
    for (let i = 0; i < contenido.length; i++) {
      const char = contenido.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }

  private validarPropiedades(props: DocumentoContratoProps): void {
    if (!props.contratoId) {
      throw new Error('El ID del contrato es requerido');
    }

    if (!props.nombre || props.nombre.trim().length === 0) {
      throw new Error('El nombre del documento es requerido');
    }

    if (!props.contenido || props.contenido.trim().length === 0) {
      throw new Error('El contenido del documento es requerido');
    }

    if (!props.firmantes || props.firmantes.length === 0) {
      throw new Error('Debe haber al menos un firmante');
    }

    if (props.idioma && !DocumentoContrato.IDIOMAS_SOPORTADOS.includes(props.idioma)) {
      throw new Error(`Idioma no soportado: ${props.idioma}`);
    }

    if (props.versiones.length === 0) {
      throw new Error('Debe haber al menos una versión del documento');
    }
  }

  private generarId(): string {
    return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  equals(other: DocumentoContrato): boolean {
    return this._id === other._id;
  }

  toString(): string {
    return `${this._nombre} (${this._tipo}) - v${this._versionActual}`;
  }

  toSnapshot(): Record<string, unknown> {
    return {
      id: this._id,
      contratoId: this._contratoId,
      tipo: this._tipo,
      nombre: this._nombre,
      descripcion: this._descripcion,
      plantillaId: this._plantillaId,
      contenido: this._contenido,
      versiones: this._versiones.map(v => ({
        ...v,
        fechaCreacion: v.fechaCreacion.toISOString()
      })),
      versionActual: this._versionActual,
      firmantes: this._firmantes.map(f => ({
        ...f,
        fechaFirma: f.fechaFirma?.toISOString()
      })),
      estadoFirma: this._estadoFirma,
      fechaCreacion: this._fechaCreacion.toISOString(),
      fechaVencimiento: this._fechaVencimiento?.toISOString(),
      urlDocumento: this._urlDocumento,
      hashIntegridad: this._hashIntegridad,
      metadatos: this._metadatos,
      requiereNotarizacion: this._requiereNotarizacion,
      idioma: this._idioma
    };
  }
}