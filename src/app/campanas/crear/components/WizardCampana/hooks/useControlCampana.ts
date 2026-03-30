/**
 * 🔒 SILEXAR PULSE - Hook useControlCampana TIER 0
 * 
 * @description Hook para gestionar validaciones de planificación
 * y control de modificación de campañas en el frontend.
 * 
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  CampanaControlService,
  CampanaParaValidacion,
  ResultadoValidacionPlanificacion,
  ResultadoValidacionModificacion,
  UsuarioActual,
  NivelPermiso
} from '@/modules/campanas/presentation/services/CampanaControlService';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export interface AlertaCampana {
  tipo: 'error' | 'warning' | 'info' | 'success';
  titulo: string;
  mensaje: string;
  accion?: string;
  onAccion?: () => void;
}

export interface ControlCampanaState {
  validacionPlanificacion: ResultadoValidacionPlanificacion | null;
  validacionModificacion: ResultadoValidacionModificacion | null;
  alertas: AlertaCampana[];
  cargando: boolean;
  error: string | null;
}

// ═══════════════════════════════════════════════════════════════
// MOCK DE USUARIO ACTUAL
// ═══════════════════════════════════════════════════════════════

const getMockUsuario = (): UsuarioActual => ({
  id: 'usr_mock_001',
  nombre: 'Usuario Programador',
  nivel: 'programador' // Cambiar para probar diferentes niveles
});

// ═══════════════════════════════════════════════════════════════
// HOOK PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export function useControlCampana(usuario?: UsuarioActual) {
  const [state, setState] = useState<ControlCampanaState>({
    validacionPlanificacion: null,
    validacionModificacion: null,
    alertas: [],
    cargando: false,
    error: null
  });
  
  const usuarioActual = usuario || getMockUsuario();
  
  /**
   * Valida si se puede planificar la campaña
   */
  const validarPlanificacion = useCallback(async (
    campana: CampanaParaValidacion
  ): Promise<ResultadoValidacionPlanificacion> => {
    setState(prev => ({ ...prev, cargando: true, error: null }));
    
    try {
      // Obtener especificaciones del contrato
      const especificaciones = campana.contratoId
        ? await CampanaControlService.obtenerEspecificacionesContrato(campana.contratoId)
        : [];
      
      const resultado = await CampanaControlService.validarEspecificacionesParaPlanificar(
        campana,
        especificaciones
      );
      
      // Generar alertas
      const alertas: AlertaCampana[] = [];
      
      if (!resultado.puedePlanificar) {
        alertas.push({
          tipo: 'error',
          titulo: '❌ No se puede planificar',
          mensaje: resultado.errores[0] || 'Hay emisoras sin especificaciones en el contrato',
          accion: resultado.accionRequerida
        });
        
        // Agregar alerta por cada emisora sin especificación
        for (const emisora of resultado.emisorasSinEspecificacion) {
          alertas.push({
            tipo: 'warning',
            titulo: `📻 Emisora sin especificación`,
            mensaje: `"${emisora}" no está incluida en las especificaciones del contrato`
          });
        }
      }
      
      setState(prev => ({
        ...prev,
        validacionPlanificacion: resultado,
        alertas,
        cargando: false
      }));
      
      return resultado;
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido';
      setState(prev => ({
        ...prev,
        cargando: false,
        error: mensaje
      }));
      
      return {
        puedePlanificar: false,
        errores: [mensaje],
        advertencias: [],
        emisorasSinEspecificacion: []
      };
    }
  }, []);
  
  /**
   * Valida si se puede modificar la campaña
   */
  const validarModificacion = useCallback((
    campana: CampanaParaValidacion
  ): ResultadoValidacionModificacion => {
    const resultado = CampanaControlService.validarModificacionCampana(
      campana,
      usuarioActual
    );
    
    // Generar alertas
    const alertas: AlertaCampana[] = [];
    
    if (!resultado.puedeModificar) {
      alertas.push({
        tipo: 'error',
        titulo: '🔒 Campaña bloqueada',
        mensaje: resultado.razon || 'No puede modificar esta campaña',
        accion: resultado.accionRequerida
      });
    }
    
    setState(prev => ({
      ...prev,
      validacionModificacion: resultado,
      alertas
    }));
    
    return resultado;
  }, [usuarioActual]);
  
  /**
   * Intenta desbloquear una campaña (solo usuarios autorizados)
   */
  const solicitarDesbloqueo = useCallback(async (
    campana: CampanaParaValidacion,
    motivo: string
  ): Promise<{ exito: boolean; mensaje: string }> => {
    setState(prev => ({ ...prev, cargando: true }));
    
    const resultado = CampanaControlService.desbloquearCampana(
      campana,
      usuarioActual,
      motivo
    );
    
    const alertas: AlertaCampana[] = [];
    
    if (resultado.exito) {
      alertas.push({
        tipo: 'success',
        titulo: '✅ Desbloqueado',
        mensaje: resultado.mensaje
      });
    } else {
      alertas.push({
        tipo: 'error',
        titulo: '❌ Error',
        mensaje: resultado.mensaje
      });
    }
    
    setState(prev => ({
      ...prev,
      alertas,
      cargando: false
    }));
    
    return resultado;
  }, [usuarioActual]);
  
  /**
   * Limpia las alertas
   */
  const limpiarAlertas = useCallback(() => {
    setState(prev => ({ ...prev, alertas: [] }));
  }, []);
  
  // Permisos del usuario
  const permisos = useMemo(() => ({
    puedeDesbloquear: CampanaControlService.puedeAprobarDesbloqueo(usuarioActual),
    esAdmin: usuarioActual.nivel === 'admin',
    esJefatura: usuarioActual.nivel === 'jefatura',
    esSupervisorFacturacion: usuarioActual.nivel === 'supervisor_facturacion',
    nivelActual: usuarioActual.nivel as NivelPermiso
  }), [usuarioActual]);
  
  return {
    // Estado
    ...state,
    
    // Acciones
    validarPlanificacion,
    validarModificacion,
    solicitarDesbloqueo,
    limpiarAlertas,
    
    // Permisos
    permisos,
    usuarioActual
  };
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTE DE ALERTA (Helper)
// ═══════════════════════════════════════════════════════════════

export const obtenerColorAlerta = (tipo: AlertaCampana['tipo']): string => {
  const colores = {
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800'
  };
  return colores[tipo];
};

export const obtenerIconoAlerta = (tipo: AlertaCampana['tipo']): string => {
  const iconos = {
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
    success: '✅'
  };
  return iconos[tipo];
};
