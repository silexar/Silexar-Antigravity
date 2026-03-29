/**
 * 📡 SILEXAR PULSE - Servicio de Registro de Emisión
 * 
 * @description Servicio para registro y verificación de emisiones
 * con integración a fingerprinting y speech-to-text
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export type MetodoDeteccion = 'manual' | 'shazam' | 'fingerprint' | 'automatico' | 'speech_to_text';

export interface RegistroEmision {
  id: string;
  spotTandaId: string;
  cunaId: string;
  emisoraId: string;
  
  // Tiempo
  fechaHoraProgramada: Date;
  fechaHoraEmision?: Date;
  
  // Estado
  emitido: boolean;
  confirmado: boolean;
  
  // Detección
  metodoDeteccion?: MetodoDeteccion;
  confianza?: number; // 0-100
  
  // Fingerprint
  fingerprint?: string;
  
  // Notas
  observaciones?: string;
}

export interface ResultadoVerificacion {
  success: boolean;
  spotTandaId: string;
  metodo: MetodoDeteccion;
  confianza: number;
  horaDeteccion: Date;
  duracionDetectada?: number;
  fingerprintMatch?: boolean;
}

export interface ResumenEmision {
  fecha: string;
  emisora: string;
  spotsProgramados: number;
  spotsEmitidos: number;
  spotsConfirmados: number;
  spotsNoEmitidos: number;
  porcentajeCumplimiento: number;
}

// ═══════════════════════════════════════════════════════════════
// CLASE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export class ServicioEmision {

  /**
   * Registra la emisión de un spot de forma manual
   */
  static registrarEmisionManual(
    spotTandaId: string,
    horaReal?: string,
    observaciones?: string
  ): RegistroEmision {
    return {
      id: `reg-${Date.now()}`,
      spotTandaId,
      cunaId: '',
      emisoraId: '',
      fechaHoraProgramada: new Date(),
      fechaHoraEmision: horaReal ? new Date(`1970-01-01T${horaReal}:00`) : new Date(),
      emitido: true,
      confirmado: true,
      metodoDeteccion: 'manual',
      confianza: 100,
      observaciones
    };
  }

  /**
   * Simula verificación por fingerprint
   */
  static verificarPorFingerprint(
    spotTandaId: string,
    audioBuffer: ArrayBuffer
  ): ResultadoVerificacion {
    // En producción esto haría matching real de fingerprints
    const confianza = Math.floor(Math.random() * 30) + 70; // 70-100
    
    return {
      success: confianza >= 80,
      spotTandaId,
      metodo: 'fingerprint',
      confianza,
      horaDeteccion: new Date(),
      duracionDetectada: 30,
      fingerprintMatch: confianza >= 80
    };
  }

  /**
   * Simula verificación por speech-to-text (menciones)
   */
  static verificarPorSpeechToText(
    spotTandaId: string,
    textoTranscrito: string,
    palabrasClave: string[]
  ): ResultadoVerificacion {
    // Buscar palabras clave en el texto transcrito
    const textoLower = textoTranscrito.toLowerCase();
    const coincidencias = palabrasClave.filter(p => textoLower.includes(p.toLowerCase()));
    const confianza = Math.round((coincidencias.length / palabrasClave.length) * 100);
    
    return {
      success: confianza >= 60,
      spotTandaId,
      metodo: 'speech_to_text',
      confianza,
      horaDeteccion: new Date()
    };
  }

  /**
   * Calcula resumen de emisión del día
   */
  static calcularResumen(
    fecha: string,
    emisora: string,
    registros: RegistroEmision[]
  ): ResumenEmision {
    const spotsProgramados = registros.length;
    const spotsEmitidos = registros.filter(r => r.emitido).length;
    const spotsConfirmados = registros.filter(r => r.confirmado).length;
    const spotsNoEmitidos = spotsProgramados - spotsEmitidos;

    return {
      fecha,
      emisora,
      spotsProgramados,
      spotsEmitidos,
      spotsConfirmados,
      spotsNoEmitidos,
      porcentajeCumplimiento: spotsProgramados > 0 
        ? Math.round((spotsEmitidos / spotsProgramados) * 100 * 10) / 10
        : 0
    };
  }

  /**
   * Genera reporte de discrepancias
   */
  static generarReporteDiscrepancias(registros: RegistroEmision[]): {
    totalDiscrepancias: number;
    noEmitidos: RegistroEmision[];
    bajaConfianza: RegistroEmision[];
    sinConfirmar: RegistroEmision[];
  } {
    return {
      totalDiscrepancias: registros.filter(r => !r.emitido || !r.confirmado || (r.confianza && r.confianza < 80)).length,
      noEmitidos: registros.filter(r => !r.emitido),
      bajaConfianza: registros.filter(r => r.confianza && r.confianza < 80 && r.confianza > 0),
      sinConfirmar: registros.filter(r => r.emitido && !r.confirmado)
    };
  }

  /**
   * Obtiene umbrales de confianza por método
   */
  static getUmbralConfianza(metodo: MetodoDeteccion): number {
    const umbrales: Record<MetodoDeteccion, number> = {
      manual: 100,
      shazam: 85,
      fingerprint: 80,
      automatico: 75,
      speech_to_text: 60
    };
    return umbrales[metodo] || 80;
  }
}

export default ServicioEmision;
