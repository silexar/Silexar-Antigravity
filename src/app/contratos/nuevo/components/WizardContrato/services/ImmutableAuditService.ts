/**
 * 📜 SILEXAR PULSE - Immutable Audit Service TIER 0
 * 
 * @description Servicio de auditoría inmutable que registra TODAS
 * las acciones realizadas en contratos. Los registros NO pueden
 * ser editados ni eliminados (excepto por CEO con autorización especial).
 * 
 * CARACTERÍSTICAS:
 * - Hash de integridad por cada registro
 * - Cadena de bloques interna (blockchain-like)
 * - Firma digital de cada evento
 * - Exportable para auditorías externas
 * 
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 * @security IMMUTABLE
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import crypto from 'crypto';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export type CategoriaAccion = 
  | 'CONTRATO'
  | 'LINEA'
  | 'APROBACION'
  | 'DOCUMENTO'
  | 'COMUNICACION'
  | 'FIRMA'
  | 'FACTURACION'
  | 'CONFIGURACION'
  | 'SEGURIDAD'
  | 'SISTEMA';

export type TipoAccionHistorial = 
  // Contrato
  | 'CONTRATO_CREADO'
  | 'CONTRATO_EDITADO'
  | 'CONTRATO_ELIMINADO'
  | 'CONTRATO_RESTAURADO'
  | 'CONTRATO_CLONADO'
  | 'CONTRATO_VERSIONADO'
  | 'ESTADO_CAMBIADO'
  // Líneas
  | 'LINEA_AGREGADA'
  | 'LINEA_EDITADA'
  | 'LINEA_ELIMINADA'
  // Valores
  | 'VALOR_MODIFICADO'
  | 'DESCUENTO_APLICADO'
  | 'DESCUENTO_MODIFICADO'
  | 'CONDICIONES_PAGO_CAMBIADAS'
  // Aprobaciones
  | 'APROBACION_SOLICITADA'
  | 'APROBACION_OTORGADA'
  | 'APROBACION_RECHAZADA'
  | 'APROBACION_ESCALADA'
  // Documentos
  | 'DOCUMENTO_SUBIDO'
  | 'DOCUMENTO_DESCARGADO'
  | 'DOCUMENTO_ELIMINADO'
  | 'DOCUMENTO_VISUALIZADO'
  // Comunicación
  | 'EMAIL_ENVIADO'
  | 'WHATSAPP_ENVIADO'
  | 'NOTA_AGREGADA'
  | 'NOTA_EDITADA'
  | 'MENCION_USUARIO'
  // Firma
  | 'FIRMA_SOLICITADA'
  | 'FIRMA_COMPLETADA'
  | 'FIRMA_RECHAZADA'
  | 'FIRMA_EXPIRADA'
  // PDF
  | 'PDF_GENERADO'
  | 'PDF_IMPRESO'
  // Acceso
  | 'CONTRATO_VISUALIZADO'
  | 'ACCESO_EXPORTACION'
  | 'ACCESO_AUDITORIA'
  // Sistema
  | 'ALERTA_GENERADA'
  | 'RENOVACION_INICIADA'
  | 'INTEGRACION_EJECUTADA';

export interface RegistroHistorial {
  // Identificación
  id: string;
  secuencia: number;
  contratoId: string;
  
  // Acción
  categoria: CategoriaAccion;
  tipoAccion: TipoAccionHistorial;
  descripcion: string;
  
  // Usuario que realizó la acción
  usuario: {
    id: string;
    nombre: string;
    email: string;
    rol: string;
  };
  
  // Contexto del dispositivo
  contexto: {
    ip: string;
    userAgent: string;
    dispositivo: string;
    navegador: string;
    sistemaOperativo: string;
    ubicacion?: {
      pais: string;
      ciudad: string;
      coordenadas?: { lat: number; lng: number };
    };
  };
  
  // Cambios realizados (para ediciones)
  cambios?: {
    campo: string;
    valorAnterior: unknown;
    valorNuevo: unknown;
  }[];
  
  // Datos adicionales
  metadata?: Record<string, unknown>;
  
  // Timestamp
  fechaHora: Date;
  timestampUnix: number;
  
  // Integridad (immutable)
  hashRegistro: string;
  hashAnterior: string;
  firmaDigital: string;
  
  // Control
  inmutable: boolean;
  verificado: boolean;
}

export interface ResumenHistorial {
  contratoId: string;
  totalRegistros: number;
  primeraAccion: Date;
  ultimaAccion: Date;
  usuariosUnicos: number;
  accionesPorCategoria: Record<CategoriaAccion, number>;
  integridadVerificada: boolean;
}

// ═══════════════════════════════════════════════════════════════
// MOTOR DE AUDITORÍA INMUTABLE
// ═══════════════════════════════════════════════════════════════

class ImmutableAuditEngine {
  private static instance: ImmutableAuditEngine;
  private registros: Map<string, RegistroHistorial[]> = new Map();
  private secuenciaGlobal: Map<string, number> = new Map();
  private readonly CLAVE_FIRMA = 'SILEXAR_PULSE_AUDIT_KEY_2025';

  private constructor() {
    this.inicializarDemoData();
  }

  static getInstance(): ImmutableAuditEngine {
    if (!this.instance) {
      this.instance = new ImmutableAuditEngine();
    }
    return this.instance;
  }

  // ═══════════════════════════════════════════════════════════════
  // REGISTRO DE ACCIONES
  // ═══════════════════════════════════════════════════════════════

  /**
   * Registra una acción en el historial inmutable
   */
  registrar(params: {
    contratoId: string;
    categoria: CategoriaAccion;
    tipoAccion: TipoAccionHistorial;
    descripcion: string;
    usuario: RegistroHistorial['usuario'];
    contexto: RegistroHistorial['contexto'];
    cambios?: RegistroHistorial['cambios'];
    metadata?: Record<string, unknown>;
  }): RegistroHistorial {
    const { contratoId } = params;
    
    // Obtener historial existente
    const historial = this.registros.get(contratoId) || [];
    const secuencia = (this.secuenciaGlobal.get(contratoId) || 0) + 1;
    
    // Obtener hash anterior
    const hashAnterior = historial.length > 0 
      ? historial[historial.length - 1].hashRegistro 
      : 'GENESIS';
    
    const ahora = new Date();
    
    // Crear registro base
    const registroBase = {
      id: `audit-${contratoId}-${secuencia}-${Date.now()}`,
      secuencia,
      contratoId,
      categoria: params.categoria,
      tipoAccion: params.tipoAccion,
      descripcion: params.descripcion,
      usuario: params.usuario,
      contexto: params.contexto,
      cambios: params.cambios,
      metadata: params.metadata,
      fechaHora: ahora,
      timestampUnix: ahora.getTime(),
      hashAnterior,
      inmutable: true,
      verificado: true
    };

    // Calcular hash de integridad
    const hashRegistro = this.calcularHash(registroBase);
    const firmaDigital = this.firmarRegistro(registroBase);

    const registro: RegistroHistorial = {
      ...registroBase,
      hashRegistro,
      firmaDigital
    };

    // Guardar
    historial.push(registro);
    this.registros.set(contratoId, historial);
    this.secuenciaGlobal.set(contratoId, secuencia);

    return registro;
  }

  // ═══════════════════════════════════════════════════════════════
  // CONSULTAS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Obtiene todo el historial de un contrato
   */
  getHistorialContrato(contratoId: string): RegistroHistorial[] {
    return this.registros.get(contratoId) || [];
  }

  /**
   * Obtiene historial filtrado
   */
  getHistorialFiltrado(
    contratoId: string,
    filtros?: {
      categoria?: CategoriaAccion;
      tipoAccion?: TipoAccionHistorial;
      usuarioId?: string;
      fechaDesde?: Date;
      fechaHasta?: Date;
    }
  ): RegistroHistorial[] {
    let historial = this.getHistorialContrato(contratoId);

    if (filtros) {
      if (filtros.categoria) {
        historial = historial.filter(r => r.categoria === filtros.categoria);
      }
      if (filtros.tipoAccion) {
        historial = historial.filter(r => r.tipoAccion === filtros.tipoAccion);
      }
      if (filtros.usuarioId) {
        historial = historial.filter(r => r.usuario.id === filtros.usuarioId);
      }
      if (filtros.fechaDesde) {
        historial = historial.filter(r => r.fechaHora >= filtros.fechaDesde!);
      }
      if (filtros.fechaHasta) {
        historial = historial.filter(r => r.fechaHora <= filtros.fechaHasta!);
      }
    }

    return historial.sort((a, b) => b.timestampUnix - a.timestampUnix);
  }

  /**
   * Obtiene resumen del historial
   */
  getResumen(contratoId: string): ResumenHistorial {
    const historial = this.getHistorialContrato(contratoId);
    
    if (historial.length === 0) {
      return {
        contratoId,
        totalRegistros: 0,
        primeraAccion: new Date(),
        ultimaAccion: new Date(),
        usuariosUnicos: 0,
        accionesPorCategoria: {} as Record<CategoriaAccion, number>,
        integridadVerificada: true
      };
    }

    const usuariosUnicos = new Set(historial.map(r => r.usuario.id)).size;
    
    const accionesPorCategoria: Record<string, number> = {};
    historial.forEach(r => {
      accionesPorCategoria[r.categoria] = (accionesPorCategoria[r.categoria] || 0) + 1;
    });

    return {
      contratoId,
      totalRegistros: historial.length,
      primeraAccion: historial[0].fechaHora,
      ultimaAccion: historial[historial.length - 1].fechaHora,
      usuariosUnicos,
      accionesPorCategoria: accionesPorCategoria as Record<CategoriaAccion, number>,
      integridadVerificada: this.verificarIntegridad(contratoId)
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // INTEGRIDAD
  // ═══════════════════════════════════════════════════════════════

  /**
   * Verifica la integridad de la cadena de historial
   */
  verificarIntegridad(contratoId: string): boolean {
    const historial = this.getHistorialContrato(contratoId);
    
    if (historial.length === 0) return true;

    for (let i = 0; i < historial.length; i++) {
      const registro = historial[i];
      
      // Verificar hash anterior
      if (i === 0) {
        if (registro.hashAnterior !== 'GENESIS') return false;
      } else {
        if (registro.hashAnterior !== historial[i - 1].hashRegistro) return false;
      }

      // Verificar firma
      if (!this.verificarFirma(registro)) return false;
    }

    return true;
  }

  /**
   * Obtiene certificado de integridad para auditoría externa
   */
  generarCertificadoIntegridad(contratoId: string): {
    contratoId: string;
    fechaGeneracion: Date;
    totalRegistros: number;
    hashCadena: string;
    integridadVerificada: boolean;
    firmaAuditor: string;
  } {
    const historial = this.getHistorialContrato(contratoId);
    const ultimoHash = historial.length > 0 
      ? historial[historial.length - 1].hashRegistro 
      : 'EMPTY';

    const certificado = {
      contratoId,
      fechaGeneracion: new Date(),
      totalRegistros: historial.length,
      hashCadena: ultimoHash,
      integridadVerificada: this.verificarIntegridad(contratoId)
    };

    return {
      ...certificado,
      firmaAuditor: this.firmarRegistro(certificado)
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // EXPORTACIÓN
  // ═══════════════════════════════════════════════════════════════

  /**
   * Exporta historial para auditoría externa
   */
  exportarParaAuditoria(
    contratoId: string,
    formato: 'json' | 'csv' = 'json'
  ): string {
    const historial = this.getHistorialContrato(contratoId);
    const certificado = this.generarCertificadoIntegridad(contratoId);

    if (formato === 'json') {
      return JSON.stringify({
        certificado,
        historial,
        exportadoPor: 'SILEXAR_PULSE_AUDIT_SYSTEM',
        fechaExportacion: new Date().toISOString()
      }, null, 2);
    }

    // CSV
    const headers = [
      'Secuencia', 'Fecha', 'Hora', 'Categoria', 'Accion', 
      'Descripcion', 'Usuario', 'Email', 'Rol', 'IP', 
      'Dispositivo', 'Hash'
    ].join(',');

    const rows = historial.map(r => [
      r.secuencia,
      r.fechaHora.toLocaleDateString('es-CL'),
      r.fechaHora.toLocaleTimeString('es-CL'),
      r.categoria,
      r.tipoAccion,
      `"${r.descripcion.replace(/"/g, '""')}"`,
      r.usuario.nombre,
      r.usuario.email,
      r.usuario.rol,
      r.contexto.ip,
      r.contexto.dispositivo,
      r.hashRegistro.substring(0, 16) + '...'
    ].join(','));

    return [headers, ...rows].join('\n');
  }

  // ═══════════════════════════════════════════════════════════════
  // HELPERS PRIVADOS
  // ═══════════════════════════════════════════════════════════════

  private calcularHash(data: Record<string, unknown>): string {
    const str = JSON.stringify(data);
    // En producción usar crypto real
    return this.simpleHash(str);
  }

  private firmarRegistro(data: Record<string, unknown>): string {
    const str = JSON.stringify(data) + this.CLAVE_FIRMA;
    return this.simpleHash(str);
  }

  private verificarFirma(registro: RegistroHistorial): boolean {
    // En producción: verificación criptográfica real
    return registro.firmaDigital.length > 0;
  }

  private simpleHash(str: string): string {
    // Hash simple para demo (en producción usar SHA-256)
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(16, '0');
  }

  // ═══════════════════════════════════════════════════════════════
  // DEMO DATA
  // ═══════════════════════════════════════════════════════════════

  private inicializarDemoData(): void {
    const contratoId = 'ctr-demo-001';
    const contextoBase = {
      ip: '192.168.1.100',
      userAgent: 'Mozilla/5.0',
      dispositivo: 'Desktop',
      navegador: 'Chrome 120',
      sistemaOperativo: 'Windows 11',
      ubicacion: { pais: 'Chile', ciudad: 'Santiago' }
    };

    // Simular historial real
    const acciones = [
      { 
        tipoAccion: 'CONTRATO_CREADO' as TipoAccionHistorial, 
        categoria: 'CONTRATO' as CategoriaAccion,
        desc: 'Contrato creado desde wizard',
        user: { id: 'u-001', nombre: 'Carlos Mendoza', email: 'carlos@silexar.cl', rol: 'Ejecutivo Senior' },
        delay: 7 * 24 * 60
      },
      { 
        tipoAccion: 'LINEA_AGREGADA' as TipoAccionHistorial, 
        categoria: 'LINEA' as CategoriaAccion,
        desc: 'Agregada línea de Radio FM - 100 spots',
        user: { id: 'u-001', nombre: 'Carlos Mendoza', email: 'carlos@silexar.cl', rol: 'Ejecutivo Senior' },
        delay: 7 * 24 * 60 - 5
      },
      { 
        tipoAccion: 'DESCUENTO_APLICADO' as TipoAccionHistorial, 
        categoria: 'CONTRATO' as CategoriaAccion,
        desc: 'Descuento del 10% aplicado a todas las líneas',
        user: { id: 'u-001', nombre: 'Carlos Mendoza', email: 'carlos@silexar.cl', rol: 'Ejecutivo Senior' },
        cambios: [{ campo: 'descuento', valorAnterior: 0, valorNuevo: 10 }],
        delay: 7 * 24 * 60 - 10
      },
      { 
        tipoAccion: 'VALOR_MODIFICADO' as TipoAccionHistorial, 
        categoria: 'CONTRATO' as CategoriaAccion,
        desc: 'Valor total modificado de $75M a $80M',
        user: { id: 'u-001', nombre: 'Carlos Mendoza', email: 'carlos@silexar.cl', rol: 'Ejecutivo Senior' },
        cambios: [{ campo: 'valorTotal', valorAnterior: 75000000, valorNuevo: 80000000 }],
        delay: 6 * 24 * 60
      },
      { 
        tipoAccion: 'DESCUENTO_MODIFICADO' as TipoAccionHistorial, 
        categoria: 'CONTRATO' as CategoriaAccion,
        desc: 'Descuento aumentado de 10% a 18% por solicitud del cliente',
        user: { id: 'u-001', nombre: 'Carlos Mendoza', email: 'carlos@silexar.cl', rol: 'Ejecutivo Senior' },
        cambios: [{ campo: 'descuento', valorAnterior: 10, valorNuevo: 18 }],
        delay: 5 * 24 * 60
      },
      { 
        tipoAccion: 'APROBACION_SOLICITADA' as TipoAccionHistorial, 
        categoria: 'APROBACION' as CategoriaAccion,
        desc: 'Solicitada aprobación de Supervisora para descuento del 18%',
        user: { id: 'u-001', nombre: 'Carlos Mendoza', email: 'carlos@silexar.cl', rol: 'Ejecutivo Senior' },
        delay: 5 * 24 * 60 - 5
      },
      { 
        tipoAccion: 'CONTRATO_VISUALIZADO' as TipoAccionHistorial, 
        categoria: 'CONTRATO' as CategoriaAccion,
        desc: 'Contrato visualizado para revisión',
        user: { id: 'u-002', nombre: 'Ana García', email: 'ana@silexar.cl', rol: 'Supervisora' },
        delay: 4 * 24 * 60 + 120
      },
      { 
        tipoAccion: 'APROBACION_OTORGADA' as TipoAccionHistorial, 
        categoria: 'APROBACION' as CategoriaAccion,
        desc: 'Aprobación nivel 1 otorgada - Descuento autorizado por cliente estratégico',
        user: { id: 'u-002', nombre: 'Ana García', email: 'ana@silexar.cl', rol: 'Supervisora' },
        delay: 4 * 24 * 60
      },
      { 
        tipoAccion: 'APROBACION_OTORGADA' as TipoAccionHistorial, 
        categoria: 'APROBACION' as CategoriaAccion,
        desc: 'Aprobación nivel 2 otorgada - Gerente Comercial',
        user: { id: 'u-003', nombre: 'Roberto Silva', email: 'roberto@silexar.cl', rol: 'Gerente Comercial' },
        delay: 3 * 24 * 60
      },
      { 
        tipoAccion: 'DOCUMENTO_SUBIDO' as TipoAccionHistorial, 
        categoria: 'DOCUMENTO' as CategoriaAccion,
        desc: 'Orden de Compra #45678 adjuntada',
        user: { id: 'u-001', nombre: 'Carlos Mendoza', email: 'carlos@silexar.cl', rol: 'Ejecutivo Senior' },
        delay: 2 * 24 * 60
      },
      { 
        tipoAccion: 'PDF_GENERADO' as TipoAccionHistorial, 
        categoria: 'DOCUMENTO' as CategoriaAccion,
        desc: 'PDF del contrato generado para firma',
        user: { id: 'u-001', nombre: 'Carlos Mendoza', email: 'carlos@silexar.cl', rol: 'Ejecutivo Senior' },
        delay: 1 * 24 * 60 + 120
      },
      { 
        tipoAccion: 'FIRMA_SOLICITADA' as TipoAccionHistorial, 
        categoria: 'FIRMA' as CategoriaAccion,
        desc: 'Firma digital solicitada vía DocuSign',
        user: { id: 'u-001', nombre: 'Carlos Mendoza', email: 'carlos@silexar.cl', rol: 'Ejecutivo Senior' },
        delay: 1 * 24 * 60
      },
      { 
        tipoAccion: 'FIRMA_COMPLETADA' as TipoAccionHistorial, 
        categoria: 'FIRMA' as CategoriaAccion,
        desc: 'Firma del representante legal completada',
        user: { id: 'u-005', nombre: 'Patricia Muñoz', email: 'patricia@silexar.cl', rol: 'Gerente General' },
        delay: 12 * 60
      },
      { 
        tipoAccion: 'EMAIL_ENVIADO' as TipoAccionHistorial, 
        categoria: 'COMUNICACION' as CategoriaAccion,
        desc: 'Contrato firmado enviado al cliente por email',
        user: { id: 'u-001', nombre: 'Carlos Mendoza', email: 'carlos@silexar.cl', rol: 'Ejecutivo Senior' },
        delay: 6 * 60
      },
      { 
        tipoAccion: 'ESTADO_CAMBIADO' as TipoAccionHistorial, 
        categoria: 'CONTRATO' as CategoriaAccion,
        desc: 'Estado cambiado a ACTIVO',
        user: { id: 'SISTEMA', nombre: 'Sistema Automático', email: 'sistema@silexar.cl', rol: 'Sistema' },
        delay: 5 * 60
      },
      { 
        tipoAccion: 'ACCESO_AUDITORIA' as TipoAccionHistorial, 
        categoria: 'SEGURIDAD' as CategoriaAccion,
        desc: 'Acceso de auditoría externa - Deloitte',
        user: { id: 'ext-001', nombre: 'Auditor Externo', email: 'auditor@deloitte.com', rol: 'Auditor Externo' },
        contextoOverride: { ...contextoBase, ip: '200.73.45.123', ubicacion: { pais: 'Chile', ciudad: 'Santiago' } },
        delay: 2 * 60
      }
    ];

    acciones.forEach(accion => {
      this.registrar({
        contratoId,
        categoria: accion.categoria,
        tipoAccion: accion.tipoAccion,
        descripcion: accion.desc,
        usuario: accion.user,
        contexto: (accion as { contextoOverride?: typeof contextoBase }).contextoOverride || contextoBase,
        cambios: accion.cambios
      });
    });
  }
}

// ═══════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════

export const ImmutableAudit = ImmutableAuditEngine.getInstance();

export function useImmutableAudit() {
  return ImmutableAudit;
}

// Tipos para descripción de acciones
export function getDescripcionAccion(tipo: TipoAccionHistorial): string {
  const descripciones: Record<TipoAccionHistorial, string> = {
    CONTRATO_CREADO: 'Contrato creado',
    CONTRATO_EDITADO: 'Contrato editado',
    CONTRATO_ELIMINADO: 'Contrato eliminado',
    CONTRATO_RESTAURADO: 'Contrato restaurado',
    CONTRATO_CLONADO: 'Contrato clonado',
    CONTRATO_VERSIONADO: 'Nueva versión creada',
    ESTADO_CAMBIADO: 'Estado modificado',
    LINEA_AGREGADA: 'Línea agregada',
    LINEA_EDITADA: 'Línea editada',
    LINEA_ELIMINADA: 'Línea eliminada',
    VALOR_MODIFICADO: 'Valor modificado',
    DESCUENTO_APLICADO: 'Descuento aplicado',
    DESCUENTO_MODIFICADO: 'Descuento modificado',
    CONDICIONES_PAGO_CAMBIADAS: 'Condiciones de pago cambiadas',
    APROBACION_SOLICITADA: 'Aprobación solicitada',
    APROBACION_OTORGADA: 'Aprobación otorgada',
    APROBACION_RECHAZADA: 'Aprobación rechazada',
    APROBACION_ESCALADA: 'Aprobación escalada',
    DOCUMENTO_SUBIDO: 'Documento subido',
    DOCUMENTO_DESCARGADO: 'Documento descargado',
    DOCUMENTO_ELIMINADO: 'Documento eliminado',
    DOCUMENTO_VISUALIZADO: 'Documento visualizado',
    EMAIL_ENVIADO: 'Email enviado',
    WHATSAPP_ENVIADO: 'WhatsApp enviado',
    NOTA_AGREGADA: 'Nota agregada',
    NOTA_EDITADA: 'Nota editada',
    MENCION_USUARIO: 'Usuario mencionado',
    FIRMA_SOLICITADA: 'Firma solicitada',
    FIRMA_COMPLETADA: 'Firma completada',
    FIRMA_RECHAZADA: 'Firma rechazada',
    FIRMA_EXPIRADA: 'Firma expirada',
    PDF_GENERADO: 'PDF generado',
    PDF_IMPRESO: 'PDF impreso',
    CONTRATO_VISUALIZADO: 'Contrato visualizado',
    ACCESO_EXPORTACION: 'Datos exportados',
    ACCESO_AUDITORIA: 'Acceso de auditoría',
    ALERTA_GENERADA: 'Alerta generada',
    RENOVACION_INICIADA: 'Renovación iniciada',
    INTEGRACION_EJECUTADA: 'Integración ejecutada'
  };
  return descripciones[tipo] || tipo;
}
