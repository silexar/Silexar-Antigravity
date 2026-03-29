/**
 * 🔄 SILEXAR PULSE - Conciliación Automática IA
 * 
 * @description Motor de conciliación automática entre pauta programada
 * y emisiones reales. Detecta discrepancias y genera ajustes.
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export interface SpotProgramado {
  id: string;
  campanaId: string;
  campanaNombre: string;
  anuncianteNombre: string;
  cunaId: string;
  cunaCodigo: string;
  emisoraId: string;
  emisoraNombre: string;
  fechaProgramada: Date;
  horaProgramada: string;
  duracionSegundos: number;
  bloqueHorario: string;
}

export interface EmisionDetectada {
  id: string;
  emisoraId: string;
  fechaEmision: Date;
  horaEmision: string;
  duracionDetectada: number;
  metodoDeteccion: 'fingerprint' | 'speech_to_text' | 'manual' | 'automatico';
  confianzaDeteccion: number; // 0-100
  audioHash?: string;
  spotMatcheado?: string;
}

export interface ResultadoConciliacion {
  spotId: string;
  estado: 'ok' | 'no_emitido' | 'emitido_diferente' | 'sin_match' | 'duplicado';
  emisionId?: string;
  diferencias?: {
    tipo: string;
    esperado: string | number;
    detectado: string | number;
  }[];
  confianzaMatch: number;
  requiereRevision: boolean;
  accionSugerida?: string;
}

export interface ResumenConciliacion {
  fecha: Date;
  emisoraId: string;
  emisoraNombre: string;
  totalProgramados: number;
  emitidosOk: number;
  noEmitidos: number;
  conDiferencias: number;
  duplicados: number;
  sinMatch: number;
  porcentajeCumplimiento: number;
  valorAfectado: number;
  alertasCriticas: string[];
  resultados: ResultadoConciliacion[];
}

export interface AjustePropuesto {
  tipo: 'bonificacion' | 'reemision' | 'descuento' | 'factura_ajuste';
  spotId: string;
  campanaId: string;
  motivo: string;
  valorOriginal: number;
  valorAjuste: number;
  aprobado: boolean;
}

// ═══════════════════════════════════════════════════════════════
// SERVICIO CONCILIACIÓN IA
// ═══════════════════════════════════════════════════════════════

export class ConciliacionAutomaticaIA {

  /**
   * Ejecuta conciliación automática para una fecha y emisora
   */
  static async ejecutarConciliacion(
    emisoraId: string,
    fecha: Date
  ): Promise<ResumenConciliacion> {
    
    // Mock: Spots programados
    const programados: SpotProgramado[] = [
      { id: 'sp-001', campanaId: 'cam-001', campanaNombre: 'Navidad 2025', anuncianteNombre: 'Empresa ABC', cunaId: 'cuna-001', cunaCodigo: 'ABC-NAV-30', emisoraId, emisoraNombre: 'Radio Ejemplo FM', fechaProgramada: fecha, horaProgramada: '08:15', duracionSegundos: 30, bloqueHorario: 'Mañana' },
      { id: 'sp-002', campanaId: 'cam-001', campanaNombre: 'Navidad 2025', anuncianteNombre: 'Empresa ABC', cunaId: 'cuna-001', cunaCodigo: 'ABC-NAV-30', emisoraId, emisoraNombre: 'Radio Ejemplo FM', fechaProgramada: fecha, horaProgramada: '12:30', duracionSegundos: 30, bloqueHorario: 'Mediodía' },
      { id: 'sp-003', campanaId: 'cam-002', campanaNombre: 'Verano XYZ', anuncianteNombre: 'Servicios XYZ', cunaId: 'cuna-002', cunaCodigo: 'XYZ-VER-20', emisoraId, emisoraNombre: 'Radio Ejemplo FM', fechaProgramada: fecha, horaProgramada: '18:45', duracionSegundos: 20, bloqueHorario: 'Prime' },
      { id: 'sp-004', campanaId: 'cam-003', campanaNombre: 'Promoción DEF', anuncianteNombre: 'Comercial DEF', cunaId: 'cuna-003', cunaCodigo: 'DEF-PRO-15', emisoraId, emisoraNombre: 'Radio Ejemplo FM', fechaProgramada: fecha, horaProgramada: '20:00', duracionSegundos: 15, bloqueHorario: 'Prime' },
      { id: 'sp-005', campanaId: 'cam-001', campanaNombre: 'Navidad 2025', anuncianteNombre: 'Empresa ABC', cunaId: 'cuna-001', cunaCodigo: 'ABC-NAV-30', emisoraId, emisoraNombre: 'Radio Ejemplo FM', fechaProgramada: fecha, horaProgramada: '22:15', duracionSegundos: 30, bloqueHorario: 'Nocturno' }
    ];
    
    // Mock: Emisiones detectadas
    const emisiones: EmisionDetectada[] = [
      { id: 'em-001', emisoraId, fechaEmision: fecha, horaEmision: '08:17', duracionDetectada: 30, metodoDeteccion: 'fingerprint', confianzaDeteccion: 98, spotMatcheado: 'sp-001' },
      { id: 'em-002', emisoraId, fechaEmision: fecha, horaEmision: '12:32', duracionDetectada: 30, metodoDeteccion: 'fingerprint', confianzaDeteccion: 95, spotMatcheado: 'sp-002' },
      { id: 'em-003', emisoraId, fechaEmision: fecha, horaEmision: '18:48', duracionDetectada: 18, metodoDeteccion: 'fingerprint', confianzaDeteccion: 87, spotMatcheado: 'sp-003' },
      // sp-004 NO EMITIDO
      { id: 'em-004', emisoraId, fechaEmision: fecha, horaEmision: '22:18', duracionDetectada: 30, metodoDeteccion: 'fingerprint', confianzaDeteccion: 96, spotMatcheado: 'sp-005' }
    ];
    
    // Ejecutar matching
    const resultados = this.matchearEmisiones(programados, emisiones);
    
    // Calcular resumen
    const emitidosOk = resultados.filter(r => r.estado === 'ok').length;
    const noEmitidos = resultados.filter(r => r.estado === 'no_emitido').length;
    const conDiferencias = resultados.filter(r => r.estado === 'emitido_diferente').length;
    const duplicados = resultados.filter(r => r.estado === 'duplicado').length;
    const sinMatch = resultados.filter(r => r.estado === 'sin_match').length;
    
    const alertas: string[] = [];
    if (noEmitidos > 0) alertas.push(`⚠️ ${noEmitidos} spots NO emitidos`);
    if (conDiferencias > 0) alertas.push(`⚡ ${conDiferencias} spots con diferencias`);
    
    return {
      fecha,
      emisoraId,
      emisoraNombre: 'Radio Ejemplo FM',
      totalProgramados: programados.length,
      emitidosOk,
      noEmitidos,
      conDiferencias,
      duplicados,
      sinMatch,
      porcentajeCumplimiento: Math.round((emitidosOk / programados.length) * 100),
      valorAfectado: noEmitidos * 45000, // Valor promedio
      alertasCriticas: alertas,
      resultados
    };
  }

  /**
   * Algoritmo de matching entre programado y emitido
   */
  private static matchearEmisiones(
    programados: SpotProgramado[],
    emisiones: EmisionDetectada[]
  ): ResultadoConciliacion[] {
    
    const resultados: ResultadoConciliacion[] = [];
    const emisionesUsadas = new Set<string>();
    
    for (const spot of programados) {
      // Buscar emisión que matchee
      const emision = emisiones.find(e => 
        e.spotMatcheado === spot.id && !emisionesUsadas.has(e.id)
      );
      
      if (!emision) {
        // No emitido
        resultados.push({
          spotId: spot.id,
          estado: 'no_emitido',
          confianzaMatch: 0,
          requiereRevision: true,
          accionSugerida: 'Programar reemisión o bonificar'
        });
        continue;
      }
      
      emisionesUsadas.add(emision.id);
      
      // Verificar diferencias
      const diferencias: ResultadoConciliacion['diferencias'] = [];
      
      // Diferencia de hora (tolerancia 5 min)
      const horaProg = this.horaAMinutos(spot.horaProgramada);
      const horaEmit = this.horaAMinutos(emision.horaEmision);
      if (Math.abs(horaProg - horaEmit) > 5) {
        diferencias.push({
          tipo: 'hora',
          esperado: spot.horaProgramada,
          detectado: emision.horaEmision
        });
      }
      
      // Diferencia de duración (tolerancia 2 seg)
      if (Math.abs(spot.duracionSegundos - emision.duracionDetectada) > 2) {
        diferencias.push({
          tipo: 'duracion',
          esperado: spot.duracionSegundos,
          detectado: emision.duracionDetectada
        });
      }
      
      if (diferencias.length > 0) {
        resultados.push({
          spotId: spot.id,
          estado: 'emitido_diferente',
          emisionId: emision.id,
          diferencias,
          confianzaMatch: emision.confianzaDeteccion,
          requiereRevision: diferencias.some(d => d.tipo === 'duracion'),
          accionSugerida: 'Revisar y aprobar o solicitar ajuste'
        });
      } else {
        resultados.push({
          spotId: spot.id,
          estado: 'ok',
          emisionId: emision.id,
          confianzaMatch: emision.confianzaDeteccion,
          requiereRevision: false
        });
      }
    }
    
    return resultados;
  }

  /**
   * Genera propuestas de ajuste automáticas
   */
  static generarAjustes(resumen: ResumenConciliacion): AjustePropuesto[] {
    const ajustes: AjustePropuesto[] = [];
    
    for (const resultado of resumen.resultados) {
      if (resultado.estado === 'no_emitido') {
        ajustes.push({
          tipo: 'bonificacion',
          spotId: resultado.spotId,
          campanaId: '', // Se llenaría con datos reales
          motivo: 'Spot no emitido según conciliación automática',
          valorOriginal: 45000,
          valorAjuste: -45000,
          aprobado: false
        });
      }
      
      if (resultado.estado === 'emitido_diferente' && resultado.diferencias?.some(d => d.tipo === 'duracion')) {
        const difDuracion = resultado.diferencias.find(d => d.tipo === 'duracion');
        if (difDuracion) {
          const esperado = difDuracion.esperado as number;
          const detectado = difDuracion.detectado as number;
          const diferenciaPct = ((esperado - detectado) / esperado) * 100;
          
          if (diferenciaPct > 10) {
            ajustes.push({
              tipo: 'descuento',
              spotId: resultado.spotId,
              campanaId: '',
              motivo: `Duración ${detectado}s vs ${esperado}s programados`,
              valorOriginal: 45000,
              valorAjuste: Math.round(-45000 * (diferenciaPct / 100)),
              aprobado: false
            });
          }
        }
      }
    }
    
    return ajustes;
  }

  /**
   * Ejecuta conciliación masiva del mes
   */
  static async conciliarMes(
    emisoraId: string,
    anio: number,
    mes: number
  ): Promise<{
    diasProcesados: number;
    totalProgramados: number;
    totalEmitidosOk: number;
    totalNoEmitidos: number;
    porcentajeCumplimiento: number;
    valorAfectado: number;
    resumenDiario: { fecha: string; cumplimiento: number }[];
  }> {
    // Simular procesamiento de cada día
    const diasEnMes = new Date(anio, mes, 0).getDate();
    let totalProg = 0;
    let totalOk = 0;
    let totalNo = 0;
    const resumenDiario: { fecha: string; cumplimiento: number }[] = [];
    
    for (let dia = 1; dia <= diasEnMes; dia++) {
      const fecha = new Date(anio, mes - 1, dia);
      const resumen = await this.ejecutarConciliacion(emisoraId, fecha);
      
      totalProg += resumen.totalProgramados;
      totalOk += resumen.emitidosOk;
      totalNo += resumen.noEmitidos;
      
      resumenDiario.push({
        fecha: fecha.toISOString().split('T')[0],
        cumplimiento: resumen.porcentajeCumplimiento
      });
    }
    
    return {
      diasProcesados: diasEnMes,
      totalProgramados: totalProg,
      totalEmitidosOk: totalOk,
      totalNoEmitidos: totalNo,
      porcentajeCumplimiento: Math.round((totalOk / totalProg) * 100),
      valorAfectado: totalNo * 45000,
      resumenDiario
    };
  }

  /**
   * Helper: Convierte hora HH:MM a minutos
   */
  private static horaAMinutos(hora: string): number {
    const [h, m] = hora.split(':').map(Number);
    return h * 60 + m;
  }

  /**
   * Genera reporte de conciliación para cliente
   */
  static generarReporteCliente(
    campanaId: string,
    fechaInicio: Date,
    fechaFin: Date
  ): {
    campanaId: string;
    periodo: string;
    totalSpots: number;
    emitidosOk: number;
    pendientes: number;
    ajustesAplicados: number;
    cumplimiento: number;
    detalle: { fecha: string; programados: number; emitidos: number }[];
  } {
    // Mock report
    return {
      campanaId,
      periodo: `${fechaInicio.toLocaleDateString()} - ${fechaFin.toLocaleDateString()}`,
      totalSpots: 150,
      emitidosOk: 142,
      pendientes: 8,
      ajustesAplicados: 6,
      cumplimiento: 95,
      detalle: [
        { fecha: '2025-12-01', programados: 10, emitidos: 10 },
        { fecha: '2025-12-02', programados: 10, emitidos: 9 },
        { fecha: '2025-12-03', programados: 10, emitidos: 10 }
      ]
    };
  }
}

export default ConciliacionAutomaticaIA;
