/**
 * 🎯 SILEXAR PULSE - Hook de Detección de Contexto de Creación
 * 
 * Detecta automáticamente el contexto desde el cual se está creando
 * una nueva cuña para auto-llenar datos y sugerir el tipo correcto.
 * 
 * @version 2050.1.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import { useSearchParams } from 'next/navigation';
import { useMemo, useCallback } from 'react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export type OrigenCreacion = 'scratch' | 'contrato' | 'vencimientos' | 'inbox' | 'campana';
export type TipoCunaSugerido = 'audio' | 'mencion' | 'presentacion' | 'cierre' | 'promo_ida' | 'jingle';

export interface ContextoContrato {
  contratoId: string;
  numeroContrato: string;
  anuncianteId: string;
  anuncianteNombre: string;
  productoId?: string;
  productoNombre?: string;
  fechaInicioVigencia?: string;
  fechaFinVigencia?: string;
}

export interface ContextoVencimientos {
  vencimientosId: string;
  anuncianteId: string;
  anuncianteNombre: string;
  programaId?: string;
  programaNombre?: string;
  fechaVencimientos: string;
  tipoMaterialFaltante: 'presentacion' | 'cierre' | 'audio';
}

export interface ContextoInbox {
  inboxId: string;
  anuncianteDetectadoId?: string;
  anuncianteDetectadoNombre?: string;
  confianzaDeteccion?: number;
  audioUrl?: string;
  asunto?: string;
}

export interface ContextoCampana {
  campanaId: string;
  campanaNombre: string;
  anuncianteId: string;
  anuncianteNombre: string;
}

export interface CreacionContextData {
  origen: OrigenCreacion;
  tipoSugerido: TipoCunaSugerido;
  datosPreLlenados: {
    anuncianteId?: string;
    anuncianteNombre?: string;
    productoId?: string;
    productoNombre?: string;
    programaId?: string;
    programaNombre?: string;
    fechaInicioVigencia?: string;
    fechaFinVigencia?: string;
    audioUrl?: string;
    nombre?: string;
  };
  mensajeContexto?: string;
  alertaContexto?: string;
  contextoContrato?: ContextoContrato;
  contextoVencimientos?: ContextoVencimientos;
  contextoInbox?: ContextoInbox;
  contextoCampana?: ContextoCampana;
}

// ═══════════════════════════════════════════════════════════════
// STORAGE KEYS
// ═══════════════════════════════════════════════════════════════

const STORAGE_KEYS = {
  CONTRATO: 'silexar_cuna_contexto_contrato',
  VENCIMIENTOS: 'silexar_cuna_contexto_vencimientos',
  INBOX: 'silexar_cuna_contexto_inbox',
  CAMPANA: 'silexar_cuna_contexto_campana'
};

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

const getStoredContext = <T>(key: string): T | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = sessionStorage.getItem(key);
    if (!stored) return null;
    
    const parsed = JSON.parse(stored);
    // Limpiar después de usar
    sessionStorage.removeItem(key);
    return parsed as T;
  } catch {
    return null;
  }
};

// ═══════════════════════════════════════════════════════════════
// HOOK PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export function useCreationContext(): CreacionContextData {
  const searchParams = useSearchParams();
  
  const contextData = useMemo((): CreacionContextData => {
    // 1. Verificar parámetros de URL
    const fromParam = searchParams?.get('from');
    const anuncianteId = searchParams?.get('anuncianteId');
    const anuncianteNombre = searchParams?.get('anuncianteNombre');
    const productoId = searchParams?.get('productoId');
    const productoNombre = searchParams?.get('productoNombre');
    const programaId = searchParams?.get('programaId');
    const programaNombre = searchParams?.get('programaNombre');
    const tipoParam = searchParams?.get('tipo') as TipoCunaSugerido | null;
    const contratoId = searchParams?.get('contratoId');
    const vencimientosId = searchParams?.get('vencimientosId');
    const inboxId = searchParams?.get('inboxId');
    const campanaId = searchParams?.get('campanaId');
    
    // 2. Contexto desde CONTRATO
    if (fromParam === 'contrato' || contratoId) {
      const storedContrato = getStoredContext<ContextoContrato>(STORAGE_KEYS.CONTRATO);
      
      return {
        origen: 'contrato',
        tipoSugerido: tipoParam || 'audio', // La mayoría son audios desde contrato
        datosPreLlenados: {
          anuncianteId: anuncianteId || storedContrato?.anuncianteId,
          anuncianteNombre: anuncianteNombre || storedContrato?.anuncianteNombre,
          productoId: productoId || storedContrato?.productoId,
          productoNombre: productoNombre || storedContrato?.productoNombre,
          fechaInicioVigencia: storedContrato?.fechaInicioVigencia,
          fechaFinVigencia: storedContrato?.fechaFinVigencia
        },
        mensajeContexto: storedContrato 
          ? `📄 Creando material para contrato ${storedContrato.numeroContrato}`
          : '📄 Creando desde contrato',
        contextoContrato: storedContrato || undefined
      };
    }
    
    // 3. Contexto desde VENCIMIENTOS
    if (fromParam === 'vencimientos' || vencimientosId) {
      const storedVencimientos = getStoredContext<ContextoVencimientos>(STORAGE_KEYS.VENCIMIENTOS);
      
      const tipoFaltante = storedVencimientos?.tipoMaterialFaltante || 'presentacion';
      
      return {
        origen: 'vencimientos',
        tipoSugerido: tipoParam || tipoFaltante,
        datosPreLlenados: {
          anuncianteId: anuncianteId || storedVencimientos?.anuncianteId,
          anuncianteNombre: anuncianteNombre || storedVencimientos?.anuncianteNombre,
          programaId: programaId || storedVencimientos?.programaId,
          programaNombre: programaNombre || storedVencimientos?.programaNombre
        },
        mensajeContexto: storedVencimientos 
          ? `⏰ Creando ${tipoFaltante} para "${storedVencimientos.programaNombre}"`
          : '⏰ Creando desde alertas de vencimientos',
        alertaContexto: storedVencimientos 
          ? `⚠️ Este programa vence el ${new Date(storedVencimientos.fechaVencimientos).toLocaleDateString('es-CL')}`
          : undefined,
        contextoVencimientos: storedVencimientos || undefined
      };
    }
    
    // 4. Contexto desde INBOX
    if (fromParam === 'inbox' || inboxId) {
      const storedInbox = getStoredContext<ContextoInbox>(STORAGE_KEYS.INBOX);
      
      return {
        origen: 'inbox',
        tipoSugerido: 'audio', // Desde inbox siempre es audio
        datosPreLlenados: {
          anuncianteId: anuncianteId || storedInbox?.anuncianteDetectadoId,
          anuncianteNombre: anuncianteNombre || storedInbox?.anuncianteDetectadoNombre,
          audioUrl: storedInbox?.audioUrl,
          nombre: storedInbox?.asunto
        },
        mensajeContexto: storedInbox?.anuncianteDetectadoNombre
          ? `📥 Material de ${storedInbox.anuncianteDetectadoNombre} (${storedInbox.confianzaDeteccion}% match)`
          : '📥 Creando desde inbox',
        contextoInbox: storedInbox || undefined
      };
    }
    
    // 5. Contexto desde CAMPAÑA
    if (fromParam === 'campana' || campanaId) {
      const storedCampana = getStoredContext<ContextoCampana>(STORAGE_KEYS.CAMPANA);
      
      return {
        origen: 'campana',
        tipoSugerido: tipoParam || 'audio',
        datosPreLlenados: {
          anuncianteId: anuncianteId || storedCampana?.anuncianteId,
          anuncianteNombre: anuncianteNombre || storedCampana?.anuncianteNombre
        },
        mensajeContexto: storedCampana 
          ? `📢 Material para campaña "${storedCampana.campanaNombre}"`
          : '📢 Creando desde campaña',
        contextoCampana: storedCampana || undefined
      };
    }
    
    // 6. Creación desde cero (scratch)
    return {
      origen: 'scratch',
      tipoSugerido: tipoParam || 'audio', // Audio es el más común
      datosPreLlenados: {
        anuncianteId: anuncianteId || undefined,
        anuncianteNombre: anuncianteNombre || undefined,
        productoId: productoId || undefined,
        productoNombre: productoNombre || undefined
      }
    };
  }, [searchParams]);
  
  return contextData;
}

// ═══════════════════════════════════════════════════════════════
// FUNCIONES AUXILIARES PARA GUARDAR CONTEXTO
// ═══════════════════════════════════════════════════════════════

export function setContratoContext(data: ContextoContrato): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(STORAGE_KEYS.CONTRATO, JSON.stringify(data));
  }
}

export function setVencimientosContext(data: ContextoVencimientos): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(STORAGE_KEYS.VENCIMIENTOS, JSON.stringify(data));
  }
}

export function setInboxContext(data: ContextoInbox): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(STORAGE_KEYS.INBOX, JSON.stringify(data));
  }
}

export function setCampanaContext(data: ContextoCampana): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(STORAGE_KEYS.CAMPANA, JSON.stringify(data));
  }
}

// ═══════════════════════════════════════════════════════════════
// FUNCIÓN PARA NAVEGAR CON CONTEXTO
// ═══════════════════════════════════════════════════════════════

export function buildCreacionUrl(
  baseUrl: string = '/cunas/nuevo',
  params: {
    from?: OrigenCreacion;
    anuncianteId?: string;
    anuncianteNombre?: string;
    productoId?: string;
    productoNombre?: string;
    programaId?: string;
    programaNombre?: string;
    tipo?: TipoCunaSugerido;
    contratoId?: string;
    vencimientosId?: string;
    inboxId?: string;
    campanaId?: string;
  }
): string {
  const url = new URL(baseUrl, 'http://placeholder');
  
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    }
  });
  
  return `${baseUrl}?${url.searchParams.toString()}`;
}

export default useCreationContext;
