/**
 * 🎯 SILEXAR PULSE - Hook useWizardContrato TIER 0
 * 
 * @description Hook de gestión de estado para el wizard de creación de contratos.
 * Implementa reducer pattern con persistencia, validación automática y sincronización.
 * 
 * @version 2025.3.0
 * @tier TIER_0_FORTUNE_10
 * @futureProof 2050+
 */

import { useReducer, useCallback, useEffect, useMemo } from 'react';
import { logger } from '@/lib/observability';
import {
  WizardContratoState,
  WizardAction,
  WizardStep,
  getInitialWizardState,
  WIZARD_STEPS,
  calcularValorNeto,
  determinarNivelAprobacion,
  TipoContrato,
  AnuncianteSeleccionado,
  FlujoProbacion
} from '../types/wizard.types';

// ═══════════════════════════════════════════════════════════════
// REDUCER
// ═══════════════════════════════════════════════════════════════

function wizardReducer(state: WizardContratoState, action: WizardAction): WizardContratoState {
  const now = new Date();
  
  switch (action.type) {
    // Navegación
    case 'SET_STEP':
      return { ...state, currentStep: action.payload };
      
    case 'COMPLETE_STEP':
      if (state.completedSteps.includes(action.payload)) {
        return state;
      }
      return { 
        ...state, 
        completedSteps: [...state.completedSteps, action.payload].sort((a, b) => a - b)
      };
      
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
      
    case 'SET_SAVING':
      return { ...state, isSaving: action.payload };
      
    case 'SET_ERRORS':
      return { ...state, errors: action.payload };
      
    case 'CLEAR_ERROR': {
      const { [action.payload]: _, ...remainingErrors } = state.errors;
      void _; // Mark as intentionally unused
      return { ...state, errors: remainingErrors };
    }
      
    // Paso 1: Información Fundamental
    case 'SET_NUMERO_CONTRATO':
      return { ...state, numeroContrato: action.payload, ultimaModificacion: now };
      
    case 'SET_TIPO_CONTRATO':
      return { ...state, tipoContrato: action.payload, ultimaModificacion: now };
      
    case 'SET_ANUNCIANTE':
      return { 
        ...state, 
        anunciante: action.payload,
        // Auto-asignar ejecutivo si viene del anunciante
        ejecutivoAsignado: action.payload?.ejecutivoAsignado || state.ejecutivoAsignado,
        ultimaModificacion: now 
      };
      
    case 'ADD_PRODUCTO':
      if (state.productosPrincipales.find(p => p.id === action.payload.id)) {
        return state;
      }
      return { 
        ...state, 
        productosPrincipales: [...state.productosPrincipales, action.payload],
        ultimaModificacion: now 
      };
      
    case 'REMOVE_PRODUCTO':
      return { 
        ...state, 
        productosPrincipales: state.productosPrincipales.filter(p => p.id !== action.payload),
        ultimaModificacion: now 
      };
      
    case 'SET_CAMPANA':
      return { ...state, campana: action.payload, ultimaModificacion: now };
      
    case 'SET_DESCRIPCION':
      return { ...state, descripcion: action.payload, ultimaModificacion: now };
      
    case 'SET_FECHAS':
      return { 
        ...state, 
        fechaInicio: action.payload.inicio, 
        fechaFin: action.payload.fin,
        ultimaModificacion: now 
      };
      
    case 'SET_EJECUTIVO':
      return { ...state, ejecutivoAsignado: action.payload, ultimaModificacion: now };
      
    case 'SET_PROPIEDADES':
      return { 
        ...state, 
        propiedadesSeleccionadas: action.payload,
        ultimaModificacion: now 
      };
      
    // Paso 2: Términos Comerciales
    case 'SET_ANALISIS_RIESGO':
      return { ...state, analisisRiesgo: action.payload, ultimaModificacion: now };
      
    case 'SET_TERMINOS_PAGO':
      return { 
        ...state, 
        terminosPago: { ...state.terminosPago, ...action.payload },
        ultimaModificacion: now 
      };
      
    case 'SET_VALORES': {
      const valorNeto = calcularValorNeto(action.payload.bruto, action.payload.descuento);
      return { 
        ...state, 
        valorBruto: action.payload.bruto,
        descuentoPorcentaje: action.payload.descuento,
        valorNeto,
        ultimaModificacion: now 
      };
    }
      
    case 'SET_MONEDA':
      return { ...state, moneda: action.payload, ultimaModificacion: now };
      
    case 'SET_CANJE':
      return { 
        ...state, 
        esCanje: action.payload.esCanje, 
        porcentajeCanje: action.payload.porcentaje,
        ultimaModificacion: now 
      };
      
    case 'SET_COMISION_AGENCIA':
      return { 
        ...state, 
        comisionAgencia: action.payload.comision,
        facturarComisionAgencia: action.payload.facturar,
        ultimaModificacion: now 
      };
      
    // Paso 3: Especificaciones
    case 'ADD_LINEA_ESPECIFICACION':
      return { 
        ...state, 
        lineasEspecificacion: [...state.lineasEspecificacion, action.payload],
        ultimaModificacion: now 
      };
      
    case 'UPDATE_LINEA_ESPECIFICACION':
      return { 
        ...state, 
        lineasEspecificacion: state.lineasEspecificacion.map(l => 
          l.id === action.payload.id ? { ...l, ...action.payload.data } : l
        ),
        ultimaModificacion: now 
      };
      
    case 'REMOVE_LINEA_ESPECIFICACION':
      return { 
        ...state, 
        lineasEspecificacion: state.lineasEspecificacion.filter(l => l.id !== action.payload),
        ultimaModificacion: now 
      };
      
    case 'SET_VALIDACIONES_INVENTARIO':
      return { ...state, validacionesInventario: action.payload, ultimaModificacion: now };
      
    case 'SET_MATERIALES_PENDIENTES':
      return { ...state, materialesPendientes: action.payload, ultimaModificacion: now };
      
    // Paso 4: Aprobaciones
    case 'SET_FLUJO_APROBACION':
      return { ...state, flujoAprobacion: action.payload, ultimaModificacion: now };
      
    case 'UPDATE_APROBADOR':
      if (!state.flujoAprobacion) return state;
      return { 
        ...state, 
        flujoAprobacion: {
          ...state.flujoAprobacion,
          aprobadores: state.flujoAprobacion.aprobadores.map(a =>
            a.id === action.payload.id ? { ...a, estado: action.payload.estado } : a
          )
        },
        ultimaModificacion: now 
      };
      
    case 'SET_NOTIFICACIONES':
      return { ...state, notificacionesConfiguradas: action.payload, ultimaModificacion: now };
      
    case 'SET_ESCALAMIENTO_AUTO':
      return { ...state, escalamientoAutomatico: action.payload, ultimaModificacion: now };
      
    // Paso 5: Documentación
    case 'ADD_DOCUMENTO':
      return { 
        ...state, 
        documentos: [...state.documentos, action.payload],
        ultimaModificacion: now 
      };
      
    case 'UPDATE_DOCUMENTO':
      return { 
        ...state, 
        documentos: state.documentos.map(d => 
          d.id === action.payload.id ? { ...d, ...action.payload.data } : d
        ),
        ultimaModificacion: now 
      };
      
    case 'SET_FIRMA_DIGITAL':
      return { ...state, firmaDigitalHabilitada: action.payload, ultimaModificacion: now };
      
    case 'SET_URL_FIRMA':
      return { ...state, urlFirma: action.payload, ultimaModificacion: now };
    
    // Paso 6: Anti-Fraude
    case 'SET_CONFIGURACION_ANTI_FRAUDE':
      return { 
        ...state, 
        configuracionAntiFraude: action.payload,
        ultimaModificacion: now 
      };
      
    case 'ADD_EVIDENCIA_NEGOCIACION':
      return { 
        ...state, 
        configuracionAntiFraude: {
          ...state.configuracionAntiFraude,
          evidenciasSubidas: [...state.configuracionAntiFraude.evidenciasSubidas, action.payload],
          ultimaModificacion: now
        },
        ultimaModificacion: now 
      };
      
    case 'REMOVE_EVIDENCIA_NEGOCIACION':
      return { 
        ...state, 
        configuracionAntiFraude: {
          ...state.configuracionAntiFraude,
          evidenciasSubidas: state.configuracionAntiFraude.evidenciasSubidas.filter(e => e.id !== action.payload),
          ultimaModificacion: now
        },
        ultimaModificacion: now 
      };
      
    case 'VALIDAR_EVIDENCIA':
      return { 
        ...state, 
        configuracionAntiFraude: {
          ...state.configuracionAntiFraude,
          evidenciasSubidas: state.configuracionAntiFraude.evidenciasSubidas.map(e => 
            e.id === action.payload.id 
              ? { ...e, validado: true, validadoPor: action.payload.validadoPor }
              : e
          ),
          ultimaModificacion: now
        },
        ultimaModificacion: now 
      };
      
    case 'SET_ESTADO_ANTI_FRAUDE':
      return { 
        ...state, 
        configuracionAntiFraude: {
          ...state.configuracionAntiFraude,
          estado: action.payload,
          puedeCargarCampanas: action.payload === 'operativo',
          ultimaModificacion: now
        },
        ultimaModificacion: now 
      };
      
    case 'RESET_WIZARD':
      return getInitialWizardState();
      
    default:
      return state;
  }
}

// ═══════════════════════════════════════════════════════════════
// HOOK PRINCIPAL
// ═══════════════════════════════════════════════════════════════

interface UseWizardContratoOptions {
  contratoId?: string;
  tipoInicial?: TipoContrato;
  anuncianteInicial?: AnuncianteSeleccionado;
  onSaveSuccess?: (contratoId: string) => void;
  onSaveError?: (error: string) => void;
}

export function useWizardContrato(options: UseWizardContratoOptions = {}) {
  const [state, dispatch] = useReducer(wizardReducer, getInitialWizardState());
  
  // Inicializar con valores opcionales
  useEffect(() => {
    if (options.tipoInicial) {
      dispatch({ type: 'SET_TIPO_CONTRATO', payload: options.tipoInicial });
    }
    if (options.anuncianteInicial) {
      dispatch({ type: 'SET_ANUNCIANTE', payload: options.anuncianteInicial });
    }
  }, [options.tipoInicial, options.anuncianteInicial]);
  
  // Generar número de contrato automáticamente
  useEffect(() => {
    if (!state.numeroContrato) {
      const year = new Date().getFullYear();
      const sequence = Math.floor(Math.random() * 99999).toString().padStart(5, '0');
      dispatch({ type: 'SET_NUMERO_CONTRATO', payload: `CON-${year}-${sequence}` });
    }
  }, [state.numeroContrato]);
  
  // ═══════════════════════════════════════════════════════════════
  // NAVEGACIÓN
  // ═══════════════════════════════════════════════════════════════
  
  const goToStep = useCallback((step: WizardStep) => {
    // Solo permitir ir a pasos ya completados o el siguiente
    const maxAllowedStep = Math.max(...state.completedSteps, 1) + 1;
    if (step <= maxAllowedStep) {
      dispatch({ type: 'SET_STEP', payload: step });
    }
  }, [state.completedSteps]);
  
  const nextStep = useCallback(() => {
    const currentConfig = WIZARD_STEPS.find(s => s.id === state.currentStep);
    if (!currentConfig) return;
    
    const validation = currentConfig.validacion(state);
    if (!validation.isValid) {
      const errorMap: Record<string, string> = {};
      validation.errors.forEach((err, idx) => {
        errorMap[`step${state.currentStep}_error${idx}`] = err;
      });
      dispatch({ type: 'SET_ERRORS', payload: errorMap });
      return false;
    }
    
    // Marcar paso como completado y avanzar
    dispatch({ type: 'COMPLETE_STEP', payload: state.currentStep });
    if (state.currentStep < 5) {
      dispatch({ type: 'SET_STEP', payload: (state.currentStep + 1) as WizardStep });
    }
    return true;
  }, [state]);
  
  const prevStep = useCallback(() => {
    if (state.currentStep > 1) {
      dispatch({ type: 'SET_STEP', payload: (state.currentStep - 1) as WizardStep });
    }
  }, [state.currentStep]);
  
  // ═══════════════════════════════════════════════════════════════
  // VALIDACIÓN
  // ═══════════════════════════════════════════════════════════════
  
  const validateCurrentStep = useCallback(() => {
    const currentConfig = WIZARD_STEPS.find(s => s.id === state.currentStep);
    if (!currentConfig) return { isValid: true, errors: [] };
    return currentConfig.validacion(state);
  }, [state]);
  
  const isStepComplete = useCallback((step: WizardStep) => {
    return state.completedSteps.includes(step);
  }, [state.completedSteps]);
  
  const canProceed = useMemo(() => {
    const currentConfig = WIZARD_STEPS.find(s => s.id === state.currentStep);
    if (!currentConfig) return false;
    return currentConfig.validacion(state).isValid;
  }, [state]);
  
  const progreso = useMemo(() => {
    return (state.completedSteps.length / 5) * 100;
  }, [state.completedSteps.length]);
  
  // ═══════════════════════════════════════════════════════════════
  // ACCIONES ESPECÍFICAS
  // ═══════════════════════════════════════════════════════════════
  
  const cargarAnalisisRiesgo = useCallback(async (anuncianteId: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await fetch(`/api/contratos/analisis-riesgo?anuncianteId=${anuncianteId}`);
      const data = await response.json();
      if (data.success) {
        dispatch({ type: 'SET_ANALISIS_RIESGO', payload: data.data });
      }
    } catch (error) {
      logger.error('Error cargando análisis de riesgo', error instanceof Error ? error : undefined);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);
  
  const setAnunciante = useCallback((anunciante: AnuncianteSeleccionado | null) => {
    dispatch({ type: 'SET_ANUNCIANTE', payload: anunciante });
    // Auto-cargar análisis de riesgo cuando se selecciona anunciante
    if (anunciante) {
      cargarAnalisisRiesgo(anunciante.id);
    }
  }, [cargarAnalisisRiesgo]);
  
  const validarInventario = useCallback(async () => {
    if (state.lineasEspecificacion.length === 0) return;
    
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await fetch('/api/contratos/validar-inventario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lineas: state.lineasEspecificacion })
      });
      const data = await response.json();
      if (data.success) {
        dispatch({ type: 'SET_VALIDACIONES_INVENTARIO', payload: data.data });
      }
    } catch (error) {
      logger.error('Error validando inventario', error instanceof Error ? error : undefined);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.lineasEspecificacion]);
  
  const calcularFlujoAprobacion = useCallback(() => {
    const nivelRequerido = determinarNivelAprobacion(
      state.valorNeto,
      state.descuentoPorcentaje,
      state.terminosPago.diasPago,
      !state.anunciante?.historialContratos || state.anunciante.historialContratos.total === 0
    );
    
    // Simular aprobadores según nivel
    const aprobadores = generarAprobadoresPorNivel(nivelRequerido);
    
    const flujo: FlujoProbacion = {
      nivelRequerido,
      aprobadores,
      valorContrato: state.valorNeto,
      porcentajeDescuento: state.descuentoPorcentaje,
      terminosPago: state.terminosPago.diasPago,
      esNuevoCliente: !state.anunciante?.historialContratos || state.anunciante.historialContratos.total === 0,
      tieneExclusividad: false
    };
    
    dispatch({ type: 'SET_FLUJO_APROBACION', payload: flujo });
  }, [state.valorNeto, state.descuentoPorcentaje, state.terminosPago.diasPago, state.anunciante]);
  
  const guardarContrato = useCallback(async () => {
    dispatch({ type: 'SET_SAVING', payload: true });
    try {
      const contratoData = {
        numeroContrato: state.numeroContrato,
        tipoContrato: state.tipoContrato,
        anuncianteId: state.anunciante?.id,
        campana: state.campana,
        descripcion: state.descripcion,
        fechaInicio: state.fechaInicio?.toISOString(),
        fechaFin: state.fechaFin?.toISOString(),
        valorBruto: state.valorBruto,
        descuentoPorcentaje: state.descuentoPorcentaje,
        valorNeto: state.valorNeto,
        moneda: state.moneda,
        terminosPago: state.terminosPago,
        esCanje: state.esCanje,
        porcentajeCanje: state.porcentajeCanje,
        lineasEspecificacion: state.lineasEspecificacion,
        flujoAprobacion: state.flujoAprobacion,
        firmaDigitalHabilitada: state.firmaDigitalHabilitada,
        propiedadesSeleccionadas: state.propiedadesSeleccionadas
      };
      
      const response = await fetch('/api/contratos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contratoData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        options.onSaveSuccess?.(data.data.id);
        return { success: true, id: data.data.id };
      } else {
        options.onSaveError?.(data.error);
        return { success: false, error: data.error };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      options.onSaveError?.(message);
      return { success: false, error: message };
    } finally {
      dispatch({ type: 'SET_SAVING', payload: false });
    }
  }, [state, options]);
  
  const resetWizard = useCallback(() => {
    dispatch({ type: 'RESET_WIZARD' });
  }, []);
  
  // ═══════════════════════════════════════════════════════════════
  // RETURN
  // ═══════════════════════════════════════════════════════════════
  
  return {
    // Estado
    state,
    currentStep: state.currentStep,
    isLoading: state.isLoading,
    isSaving: state.isSaving,
    errors: state.errors,
    progreso,
    canProceed,
    
    // Navegación
    goToStep,
    nextStep,
    prevStep,
    
    // Validación
    validateCurrentStep,
    isStepComplete,
    
    // Acciones
    dispatch,
    setAnunciante,
    cargarAnalisisRiesgo,
    validarInventario,
    calcularFlujoAprobacion,
    guardarContrato,
    resetWizard
  };
}

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

function generarAprobadoresPorNivel(nivel: string) {
  const aprobadoresBase = [
    {
      id: 'sup_001',
      nombre: 'María Silva',
      email: 'maria.silva@silexar.com',
      cargo: 'Supervisora Comercial',
      nivel: 'supervisor' as const,
      estado: 'pendiente' as const,
      tiempoLimite: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 horas
    },
    {
      id: 'ger_001',
      nombre: 'Carlos Mendoza',
      email: 'carlos.mendoza@silexar.com',
      cargo: 'Gerente Comercial',
      nivel: 'gerente_comercial' as const,
      estado: 'pendiente' as const,
      tiempoLimite: new Date(Date.now() + 4 * 60 * 60 * 1000) // 4 horas
    },
    {
      id: 'ggen_001',
      nombre: 'Roberto Torres',
      email: 'roberto.torres@silexar.com',
      cargo: 'Gerente General',
      nivel: 'gerente_general' as const,
      estado: 'pendiente' as const,
      tiempoLimite: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas
    },
    {
      id: 'dir_001',
      nombre: 'Directorio',
      email: 'directorio@silexar.com',
      cargo: 'Directorio',
      nivel: 'directorio' as const,
      estado: 'pendiente' as const,
      tiempoLimite: new Date(Date.now() + 48 * 60 * 60 * 1000) // 48 horas
    }
  ];
  
  switch (nivel) {
    case 'automatico':
      return [];
    case 'supervisor':
      return aprobadoresBase.slice(0, 1);
    case 'gerente_comercial':
      return aprobadoresBase.slice(0, 2);
    case 'gerente_general':
      return aprobadoresBase.slice(0, 3);
    case 'directorio':
      return aprobadoresBase;
    default:
      return [];
  }
}

export default useWizardContrato;
