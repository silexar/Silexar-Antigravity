/**
 * 📄 SILEXAR PULSE - Generador de Archivos de Pauta
 * 
 * @description Servicio para generar archivos de exportación de pauta
 * en múltiples formatos (CSV, Dalet, XML, TXT, Excel)
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export type FormatoExportacion = 'csv' | 'dalet' | 'xml' | 'txt' | 'excel' | 'json';

export interface SpotPauta {
  orden: number;
  codigo: string;
  nombre: string;
  anunciante: string;
  producto?: string;
  duracion: number;
  archivo?: string;
  campana?: string;
  version?: string;
}

export interface TandaPauta {
  codigo: string;
  emisora: string;
  emisoraCodigo: string;
  fecha: string;
  horaInicio: string;
  horaFin?: string;
  duracionTotal: number;
  spots: SpotPauta[];
}

export interface ExportacionConfig {
  formato: FormatoExportacion;
  emisora: string;
  emisoraCodigo: string;
  fecha: string;
  tandas: TandaPauta[];
  incluirEncabezados?: boolean;
  separador?: string;
  encoding?: string;
}

export interface ResultadoExportacion {
  success: boolean;
  formato: FormatoExportacion;
  contenido: string;
  nombreArchivo: string;
  mimeType: string;
  tamanioBytes: number;
}

// ═══════════════════════════════════════════════════════════════
// CLASE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export class GeneradorPauta {
  
  /**
   * Genera archivo de pauta en el formato especificado
   */
  static generar(config: ExportacionConfig): ResultadoExportacion {
    switch (config.formato) {
      case 'csv':
        return this.generarCSV(config);
      case 'dalet':
        return this.generarDalet(config);
      case 'xml':
        return this.generarXML(config);
      case 'txt':
        return this.generarTXT(config);
      case 'json':
        return this.generarJSON(config);
      default:
        return this.generarCSV(config);
    }
  }

  /**
   * Formato CSV estándar
   */
  private static generarCSV(config: ExportacionConfig): ResultadoExportacion {
    const sep = config.separador || ';';
    const lineas: string[] = [];
    
    // Encabezado
    if (config.incluirEncabezados !== false) {
      lineas.push([
        'EMISORA',
        'FECHA',
        'TANDA',
        'HORA_INICIO',
        'ORDEN',
        'CODIGO_CUNA',
        'NOMBRE',
        'ANUNCIANTE',
        'DURACION',
        'ARCHIVO'
      ].join(sep));
    }

    // Datos
    for (const tanda of config.tandas) {
      for (const spot of tanda.spots) {
        lineas.push([
          config.emisora,
          tanda.fecha,
          tanda.codigo,
          tanda.horaInicio,
          spot.orden.toString(),
          spot.codigo,
          `"${spot.nombre}"`,
          `"${spot.anunciante}"`,
          spot.duracion.toString(),
          spot.archivo || ''
        ].join(sep));
      }
    }

    const contenido = lineas.join('\r\n');
    const nombreArchivo = `pauta_${config.emisoraCodigo}_${config.fecha}.csv`;

    return {
      success: true,
      formato: 'csv',
      contenido,
      nombreArchivo,
      mimeType: 'text/csv',
      tamanioBytes: new Blob([contenido]).size
    };
  }

  /**
   * Formato Dalet (sistema de automatización radial)
   */
  private static generarDalet(config: ExportacionConfig): ResultadoExportacion {
    const lineas: string[] = [];
    
    // Header Dalet
    lineas.push(`@DALET_PLAYLIST`);
    lineas.push(`@VERSION=2.0`);
    lineas.push(`@EMISORA=${config.emisora}`);
    lineas.push(`@FECHA=${config.fecha}`);
    lineas.push(`@GENERADO=${new Date().toISOString()}`);
    lineas.push('');

    for (const tanda of config.tandas) {
      lineas.push(`[TANDA:${tanda.codigo}]`);
      lineas.push(`HORA_INICIO=${tanda.horaInicio}`);
      lineas.push(`DURACION_TOTAL=${tanda.duracionTotal}`);
      lineas.push('');
      
      for (const spot of tanda.spots) {
        lineas.push(`  [SPOT:${spot.orden}]`);
        lineas.push(`  CODIGO=${spot.codigo}`);
        lineas.push(`  TITULO=${spot.nombre}`);
        lineas.push(`  CLIENTE=${spot.anunciante}`);
        lineas.push(`  DURACION=${spot.duracion}`);
        lineas.push(`  ARCHIVO=${spot.archivo || 'N/A'}`);
        lineas.push(`  CAMPANA=${spot.campana || 'N/A'}`);
        lineas.push('');
      }
      lineas.push(`[/TANDA]`);
      lineas.push('');
    }

    lineas.push(`@END_PLAYLIST`);

    const contenido = lineas.join('\r\n');
    const nombreArchivo = `pauta_${config.emisoraCodigo}_${config.fecha}.dalet`;

    return {
      success: true,
      formato: 'dalet',
      contenido,
      nombreArchivo,
      mimeType: 'text/plain',
      tamanioBytes: new Blob([contenido]).size
    };
  }

  /**
   * Formato XML estándar
   */
  private static generarXML(config: ExportacionConfig): ResultadoExportacion {
    const lineas: string[] = [];
    
    lineas.push('<?xml version="1.0" encoding="UTF-8"?>');
    lineas.push('<pauta>');
    lineas.push(`  <emisora codigo="${config.emisoraCodigo}">${config.emisora}</emisora>`);
    lineas.push(`  <fecha>${config.fecha}</fecha>`);
    lineas.push(`  <generado>${new Date().toISOString()}</generado>`);
    lineas.push('  <tandas>');

    for (const tanda of config.tandas) {
      lineas.push(`    <tanda codigo="${tanda.codigo}">`);
      lineas.push(`      <hora_inicio>${tanda.horaInicio}</hora_inicio>`);
      lineas.push(`      <duracion_total>${tanda.duracionTotal}</duracion_total>`);
      lineas.push('      <spots>');
      
      for (const spot of tanda.spots) {
        lineas.push(`        <spot orden="${spot.orden}">`);
        lineas.push(`          <codigo>${spot.codigo}</codigo>`);
        lineas.push(`          <nombre><![CDATA[${spot.nombre}]]></nombre>`);
        lineas.push(`          <anunciante><![CDATA[${spot.anunciante}]]></anunciante>`);
        lineas.push(`          <duracion>${spot.duracion}</duracion>`);
        lineas.push(`          <archivo>${spot.archivo || ''}</archivo>`);
        lineas.push('        </spot>');
      }
      
      lineas.push('      </spots>');
      lineas.push('    </tanda>');
    }

    lineas.push('  </tandas>');
    lineas.push('</pauta>');

    const contenido = lineas.join('\r\n');
    const nombreArchivo = `pauta_${config.emisoraCodigo}_${config.fecha}.xml`;

    return {
      success: true,
      formato: 'xml',
      contenido,
      nombreArchivo,
      mimeType: 'application/xml',
      tamanioBytes: new Blob([contenido]).size
    };
  }

  /**
   * Formato TXT simple (para impresión)
   */
  private static generarTXT(config: ExportacionConfig): ResultadoExportacion {
    const lineas: string[] = [];
    const ancho = 80;
    const separador = '='.repeat(ancho);
    
    lineas.push(separador);
    lineas.push(`PAUTA DE EMISIÓN - ${config.emisora}`);
    lineas.push(`Fecha: ${config.fecha}`);
    lineas.push(`Generado: ${new Date().toLocaleString('es-CL')}`);
    lineas.push(separador);
    lineas.push('');

    for (const tanda of config.tandas) {
      lineas.push(`TANDA: ${tanda.codigo} - ${tanda.horaInicio}`);
      lineas.push('-'.repeat(ancho));
      lineas.push(`${'#'.padEnd(4)}${'CÓDIGO'.padEnd(15)}${'SPOT'.padEnd(35)}${'DUR'.padEnd(6)}ANUNCIANTE`);
      lineas.push('-'.repeat(ancho));
      
      for (const spot of tanda.spots) {
        const nombre = spot.nombre.length > 33 ? spot.nombre.substring(0, 30) + '...' : spot.nombre;
        lineas.push(
          `${spot.orden.toString().padEnd(4)}` +
          `${spot.codigo.padEnd(15)}` +
          `${nombre.padEnd(35)}` +
          `${(spot.duracion + 's').padEnd(6)}` +
          `${spot.anunciante}`
        );
      }
      
      lineas.push('');
      lineas.push(`Duración total: ${tanda.duracionTotal} segundos | Spots: ${tanda.spots.length}`);
      lineas.push('');
    }

    lineas.push(separador);
    lineas.push('FIN DE PAUTA');
    lineas.push(separador);

    const contenido = lineas.join('\r\n');
    const nombreArchivo = `pauta_${config.emisoraCodigo}_${config.fecha}.txt`;

    return {
      success: true,
      formato: 'txt',
      contenido,
      nombreArchivo,
      mimeType: 'text/plain',
      tamanioBytes: new Blob([contenido]).size
    };
  }

  /**
   * Formato JSON (para integraciones API)
   */
  private static generarJSON(config: ExportacionConfig): ResultadoExportacion {
    const data = {
      metadata: {
        emisora: config.emisora,
        emisoraCodigo: config.emisoraCodigo,
        fecha: config.fecha,
        generado: new Date().toISOString(),
        totalTandas: config.tandas.length,
        totalSpots: config.tandas.reduce((sum, t) => sum + t.spots.length, 0)
      },
      tandas: config.tandas
    };

    const contenido = JSON.stringify(data, null, 2);
    const nombreArchivo = `pauta_${config.emisoraCodigo}_${config.fecha}.json`;

    return {
      success: true,
      formato: 'json',
      contenido,
      nombreArchivo,
      mimeType: 'application/json',
      tamanioBytes: new Blob([contenido]).size
    };
  }

  /**
   * Obtiene extensión de archivo según formato
   */
  static getExtension(formato: FormatoExportacion): string {
    const extensiones: Record<FormatoExportacion, string> = {
      csv: '.csv',
      dalet: '.dalet',
      xml: '.xml',
      txt: '.txt',
      excel: '.xlsx',
      json: '.json'
    };
    return extensiones[formato] || '.txt';
  }

  /**
   * Obtiene MIME type según formato
   */
  static getMimeType(formato: FormatoExportacion): string {
    const mimes: Record<FormatoExportacion, string> = {
      csv: 'text/csv',
      dalet: 'text/plain',
      xml: 'application/xml',
      txt: 'text/plain',
      excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      json: 'application/json'
    };
    return mimes[formato] || 'text/plain';
  }
}

export default GeneradorPauta;
