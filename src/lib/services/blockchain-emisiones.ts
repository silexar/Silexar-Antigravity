/**
 * ⛓️ SILEXAR PULSE - BLOCKCHAIN CERTIFICACIÓN DE EMISIONES
 * 
 * @description Registro inmutable de emisiones para auditoría:
 * - Hash criptográfico de cada emisión
 * - Cadena de bloques local
 * - Prueba verificable para clientes
 * - Exportación de certificados
 * 
 * @version 2030.0.0
 * @tier TIER_0_FORTUNE_10
 */

import * as crypto from 'crypto';
import { logger } from '@/lib/observability';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export interface EmisionRegistro {
  id: string;
  campanaId: string;
  cunaId: string;
  emisoraId: string;
  fechaEmision: Date;
  horaEmision: string;
  duracionSegundos: number;
  audioFingerprint: string;
  metodoVerificacion: 'fingerprint' | 'speech_to_text' | 'manual';
  confianza: number;
}

export interface BloqueEmision {
  index: number;
  timestamp: Date;
  emisiones: EmisionRegistro[];
  hashAnterior: string;
  hash: string;
  nonce: number;
}

export interface CertificadoEmision {
  id: string;
  campanaId: string;
  periodo: { inicio: Date; fin: Date };
  totalEmisiones: number;
  emisionesVerificadas: number;
  porcentajeVerificacion: number;
  hashRaiz: string;
  firma: string;
  fechaGeneracion: Date;
  verificable: boolean;
  urlVerificacion: string;
}

// ═══════════════════════════════════════════════════════════════
// BLOCKCHAIN ENGINE
// ═══════════════════════════════════════════════════════════════

export class BlockchainEmisiones {
  
  private static cadena: BloqueEmision[] = [];
  private static dificultad = 2; // Proof of work simplificado

  /**
   * Inicializa la cadena con bloque génesis
   */
  static inicializar(): void {
    if (this.cadena.length === 0) {
      const bloqueGenesis: BloqueEmision = {
        index: 0,
        timestamp: new Date('2025-01-01'),
        emisiones: [],
        hashAnterior: '0',
        hash: this.calcularHash(0, new Date('2025-01-01'), [], '0', 0),
        nonce: 0
      };
      this.cadena.push(bloqueGenesis);
    }
  }

  /**
   * Calcula hash SHA-256 de un bloque
   */
  private static calcularHash(
    index: number,
    timestamp: Date,
    emisiones: EmisionRegistro[],
    hashAnterior: string,
    nonce: number
  ): string {
    const data = `${index}${timestamp.toISOString()}${JSON.stringify(emisiones)}${hashAnterior}${nonce}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Mina un nuevo bloque (Proof of Work simplificado)
   */
  private static minarBloque(bloque: BloqueEmision): BloqueEmision {
    const prefijo = '0'.repeat(this.dificultad);
    let nonce = 0;
    let hash = '';
    
    do {
      nonce++;
      hash = this.calcularHash(
        bloque.index,
        bloque.timestamp,
        bloque.emisiones,
        bloque.hashAnterior,
        nonce
      );
    } while (!hash.startsWith(prefijo) && nonce < 100000);
    
    return { ...bloque, hash, nonce };
  }

  /**
   * Registra emisiones en un nuevo bloque
   */
  static registrarEmisiones(emisiones: EmisionRegistro[]): BloqueEmision {
    this.inicializar();
    
    const bloqueAnterior = this.cadena[this.cadena.length - 1];
    
    let nuevoBloque: BloqueEmision = {
      index: bloqueAnterior.index + 1,
      timestamp: new Date(),
      emisiones,
      hashAnterior: bloqueAnterior.hash,
      hash: '',
      nonce: 0
    };
    
    nuevoBloque = this.minarBloque(nuevoBloque);
    this.cadena.push(nuevoBloque);
    
    logger.info(`[BLOCKCHAIN] Bloque #${nuevoBloque.index} minado: ${nuevoBloque.hash.substring(0, 16)}...`);
    
    return nuevoBloque;
  }

  /**
   * Verifica integridad de la cadena
   */
  static verificarIntegridad(): { valida: boolean; errores: string[] } {
    const errores: string[] = [];
    
    for (let i = 1; i < this.cadena.length; i++) {
      const bloque = this.cadena[i];
      const bloqueAnterior = this.cadena[i - 1];
      
      // Verificar hash del bloque
      const hashEsperado = this.calcularHash(
        bloque.index,
        bloque.timestamp,
        bloque.emisiones,
        bloque.hashAnterior,
        bloque.nonce
      );
      
      if (bloque.hash !== hashEsperado) {
        errores.push(`Bloque ${i}: Hash inválido`);
      }
      
      // Verificar enlace con bloque anterior
      if (bloque.hashAnterior !== bloqueAnterior.hash) {
        errores.push(`Bloque ${i}: Hash anterior no coincide`);
      }
    }
    
    return { valida: errores.length === 0, errores };
  }

  /**
   * Genera certificado verificable de campaña
   */
  static generarCertificado(
    campanaId: string,
    fechaInicio: Date,
    fechaFin: Date
  ): CertificadoEmision {
    this.inicializar();
    
    // Recolectar emisiones de la campaña
    let totalEmisiones = 0;
    let emisionesVerificadas = 0;
    const hashesEmisiones: string[] = [];
    
    for (const bloque of this.cadena) {
      for (const emision of bloque.emisiones) {
        if (emision.campanaId === campanaId &&
            emision.fechaEmision >= fechaInicio &&
            emision.fechaEmision <= fechaFin) {
          totalEmisiones++;
          if (emision.confianza >= 90) emisionesVerificadas++;
          hashesEmisiones.push(bloque.hash);
        }
      }
    }
    
    // Calcular hash raíz (Merkle root simplificado)
    const hashRaiz = crypto.createHash('sha256')
      .update(hashesEmisiones.join(''))
      .digest('hex');
    
    // Firmar certificado
    const dataCertificado = `${campanaId}${fechaInicio.toISOString()}${fechaFin.toISOString()}${totalEmisiones}${hashRaiz}`;
    const firma = crypto.createHash('sha256').update(dataCertificado + 'SILEXAR_SECRET').digest('hex');
    
    const certificadoId = `CERT-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    return {
      id: certificadoId,
      campanaId,
      periodo: { inicio: fechaInicio, fin: fechaFin },
      totalEmisiones,
      emisionesVerificadas,
      porcentajeVerificacion: totalEmisiones > 0 ? Math.round((emisionesVerificadas / totalEmisiones) * 100) : 0,
      hashRaiz,
      firma,
      fechaGeneracion: new Date(),
      verificable: true,
      urlVerificacion: `https://verify.silexar.com/cert/${certificadoId}`
    };
  }

  /**
   * Verifica un certificado existente
   */
  static verificarCertificado(certificado: CertificadoEmision): {
    valido: boolean;
    detalles: string;
  } {
    const dataCertificado = `${certificado.campanaId}${certificado.periodo.inicio.toISOString()}${certificado.periodo.fin.toISOString()}${certificado.totalEmisiones}${certificado.hashRaiz}`;
    const firmaEsperada = crypto.createHash('sha256').update(dataCertificado + 'SILEXAR_SECRET').digest('hex');
    
    if (certificado.firma === firmaEsperada) {
      return { valido: true, detalles: 'Certificado auténtico y no alterado' };
    }
    
    return { valido: false, detalles: 'Firma del certificado no coincide' };
  }

  /**
   * Obtiene estadísticas de la blockchain
   */
  static obtenerEstadisticas(): {
    totalBloques: number;
    totalEmisiones: number;
    ultimoBloque: Date;
    hashUltimoBloque: string;
    integridadVerificada: boolean;
  } {
    this.inicializar();
    
    const totalEmisiones = this.cadena.reduce((sum, b) => sum + b.emisiones.length, 0);
    const ultimoBloque = this.cadena[this.cadena.length - 1];
    
    return {
      totalBloques: this.cadena.length,
      totalEmisiones,
      ultimoBloque: ultimoBloque.timestamp,
      hashUltimoBloque: ultimoBloque.hash,
      integridadVerificada: this.verificarIntegridad().valida
    };
  }

  /**
   * Exporta la cadena para auditoría externa
   */
  static exportarCadena(): string {
    return JSON.stringify(this.cadena, null, 2);
  }
}

export default BlockchainEmisiones;
