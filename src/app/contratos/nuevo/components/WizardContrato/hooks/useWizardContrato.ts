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

import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { logger } from "@/lib/observability";
import {
  AnuncianteSeleccionado,
  calcularValorNeto,
  determinarNivelAprobacion,
  EspecificacionDigitalData,
  FlujoProbacion,
  getInitialWizardState,
  TipoContrato,
  WIZARD_STEPS,
  WizardAction,
  WizardContratoState,
  WizardStep,
} from "../types/wizard.types";

const STORAGE_KEY = "pulse_wizard_contrato_draft";
const BROADCAST_CHANNEL = "pulse_wizard_sync";

function serializeState(state: WizardContratoState): string {
  return JSON.stringify(state, (key, value) => {
    if (value instanceof Date) return { __type: "Date", value: value.toISOString() };
    return value;
  });
}

function deserializeState(json: string): WizardContratoState {
  const parsed = JSON.parse(json, (key, value) => {
    if (value && typeof value === "object" && value.__type === "Date") return new Date(value.value);
    return value;
  });
  // Fix legacy dates stored as plain strings
  if (parsed.fechaInicio && typeof parsed.fechaInicio === "string") {
    parsed.fechaInicio = new Date(parsed.fechaInicio);
    if (isNaN(parsed.fechaInicio.getTime())) parsed.fechaInicio = null;
  }
  if (parsed.fechaFin && typeof parsed.fechaFin === "string") {
    parsed.fechaFin = new Date(parsed.fechaFin);
    if (isNaN(parsed.fechaFin.getTime())) parsed.fechaFin = null;
  }
  // Migrate legacy modalidad values
  if (parsed.terminosPago?.modalidad === "hitos") {
    parsed.terminosPago = { ...parsed.terminosPago, modalidad: "por_campana" };
  }
  // Migrate legacy tipoFactura if needed
  if (parsed.terminosPago && !parsed.terminosPago.ivaPorcentaje) {
    parsed.terminosPago.ivaPorcentaje = 19;
  }
  // Merge with initial state to ensure all fields exist
  return { ...getInitialWizardState(), ...parsed, isLoading: false, isSaving: false, errors: {} };
}

function loadDraftState(): WizardContratoState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return deserializeState(raw);
  } catch { return null; }
}

function saveDraftState(state: WizardContratoState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, serializeState(state));
  } catch { /* storage full */ }
}

// ═══════════════════════════════════════════════════════════════
// REDUCER
// ═══════════════════════════════════════════════════════════════

function wizardReducer(
  state: WizardContratoState,
  action: WizardAction,
): WizardContratoState {
  const now = new Date();

  switch (action.type) {
    // Navegación
    case "SET_STEP":
      return { ...state, currentStep: action.payload };

    case "COMPLETE_STEP":
      if (state.completedSteps.includes(action.payload)) {
        return state;
      }
      return {
        ...state,
        completedSteps: [...state.completedSteps, action.payload].sort((a, b) =>
          a - b
        ),
      };

    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    case "SET_SAVING":
      return { ...state, isSaving: action.payload };

    case "SET_ERRORS":
      return { ...state, errors: action.payload };

    case "CLEAR_ERROR": {
      const { [action.payload]: _, ...remainingErrors } = state.errors;
      void _; // Mark as intentionally unused
      return { ...state, errors: remainingErrors };
    }

    // Paso 1: Información Fundamental
    case "SET_NUMERO_CONTRATO":
      return {
        ...state,
        numeroContrato: action.payload,
        ultimaModificacion: now,
      };

    case "SET_TIPO_CONTRATO":
      return {
        ...state,
        tipoContrato: action.payload,
        ultimaModificacion: now,
      };

    case "SET_MEDIO":
      return { ...state, medio: action.payload, ultimaModificacion: now };

    case "SET_ANUNCIANTE":
      return {
        ...state,
        anunciante: action.payload,
        // Auto-asignar ejecutivo si viene del anunciante
        ejecutivoAsignado: action.payload?.ejecutivoAsignado ||
          state.ejecutivoAsignado,
        ultimaModificacion: now,
      };

    case "ADD_PRODUCTO":
      if (state.productosPrincipales.find((p) => p.id === action.payload.id)) {
        return state;
      }
      return {
        ...state,
        productosPrincipales: [...state.productosPrincipales, action.payload],
        ultimaModificacion: now,
      };

    case "REMOVE_PRODUCTO":
      return {
        ...state,
        productosPrincipales: state.productosPrincipales.filter((p) =>
          p.id !== action.payload
        ),
        ultimaModificacion: now,
      };

    case "SET_CAMPANA":
      return { ...state, campana: action.payload, ultimaModificacion: now };

    case "SET_DESCRIPCION":
      return { ...state, descripcion: action.payload, ultimaModificacion: now };

    case "SET_FECHAS":
      return {
        ...state,
        fechaInicio: action.payload.inicio,
        fechaFin: action.payload.fin,
        ultimaModificacion: now,
      };

    case "SET_EJECUTIVO":
      return {
        ...state,
        ejecutivoAsignado: action.payload,
        ultimaModificacion: now,
      };

    case "SET_PROPIEDADES":
      return {
        ...state,
        propiedadesSeleccionadas: action.payload,
        ultimaModificacion: now,
      };

    // Paso 2: Términos Comerciales
    case "SET_ANALISIS_RIESGO":
      return {
        ...state,
        analisisRiesgo: action.payload,
        ultimaModificacion: now,
      };

    case "SET_TERMINOS_PAGO":
      return {
        ...state,
        terminosPago: { ...state.terminosPago, ...action.payload },
        ultimaModificacion: now,
      };

    case "SET_VALORES": {
      // Commission is percentage-based: valorNeto = valorBruto * (1 - comision/100)
      // Special case: if bruto=0 (user clearing), preserve current valorNeto
      const comision = state.tieneComisionAgencia ? (state.comisionAgencia || 0) : 0;
      const factor = comision > 0 ? (1 - comision / 100) : 1;
      // Only recalculate valorNeto if bruto > 0, otherwise keep current valorNeto
      const valorNeto = action.payload.bruto > 0
        ? Math.round(action.payload.bruto * factor)
        : state.valorNeto;
      return {
        ...state,
        valorBruto: action.payload.bruto,
        descuentoPorcentaje: action.payload.descuento,
        valorNeto,
        ultimaModificacion: now,
      };
    }

    case "SET_MONEDA":
      return { ...state, moneda: action.payload, ultimaModificacion: now };

    case "SET_CANJE":
      return {
        ...state,
        esCanje: action.payload.esCanje,
        porcentajeCanje: action.payload.porcentaje,
        ultimaModificacion: now,
      };

    case "SET_COMISION_AGENCIA": {
      // Commission is percentage-based
      // If comision > 0: recalculate valorNeto from current valorBruto
      // If comision = 0 (clearing): preserve valorNeto, clear valorBruto
      const factor = action.payload.comision > 0 ? (1 - action.payload.comision / 100) : 1;
      const valorNeto = action.payload.comision > 0
        ? Math.round(state.valorBruto * factor)
        : state.valorNeto;
      const valorBruto = action.payload.comision > 0 ? state.valorBruto : 0;
      return {
        ...state,
        comisionAgencia: action.payload.comision,
        facturarComisionAgencia: action.payload.facturar,
        valorNeto,
        valorBruto,
        ultimaModificacion: now,
      };
    }

    case "SET_TIENE_COMISION": {
      // When toggling ON: preserve both valorNeto and valorBruto as-is
      // When toggling OFF: preserve valorNeto, clear valorBruto and commission
      if (action.payload) {
        // Turning ON - keep valorNeto and valorBruto, just enable commission
        return {
          ...state,
          tieneComisionAgencia: true,
          ultimaModificacion: now,
        };
      } else {
        // Turning OFF - keep valorNeto, clear valorBruto and commission
        return {
          ...state,
          tieneComisionAgencia: false,
          comisionAgencia: 0,
          valorBruto: 0,
          valorNeto: state.valorNeto,
          ultimaModificacion: now,
        };
      }
    }

    case "SET_AGENCIA_MEDIOS":
      return {
        ...state,
        agenciaMediosId: action.payload,
        ultimaModificacion: now,
      };

    case "SET_AGENCIA_CREATIVA":
      return {
        ...state,
        agenciaCreativaId: action.payload,
        ultimaModificacion: now,
      };

    case "SET_VALOR_NETO_MANUAL": {
      // When commission is active (percentage): valorBruto = valorNeto / (1 - comision/100)
      // When commission is NOT active: clear valorBruto, preserve valorNeto
      const comision = state.tieneComisionAgencia ? (state.comisionAgencia || 0) : 0;

      if (comision > 0) {
        const factor = 1 - comision / 100;
        const bruto = Math.round(action.payload / factor);
        return {
          ...state,
          valorNeto: action.payload,
          valorBruto: bruto,
          ultimaModificacion: now,
        };
      } else {
        // Commission not active - preserve valorNeto, clear valorBruto
        return {
          ...state,
          valorNeto: action.payload,
          valorBruto: 0,
          ultimaModificacion: now,
        };
      }
    }

    case "SET_CUOTA_FACTURADA": {
      const existentes = state.cuotasFacturacion || [];
      const filtradas = existentes.filter((c) => c.indice !== action.payload.indice);
      return {
        ...state,
        cuotasFacturacion: [...filtradas, action.payload],
        ultimaModificacion: now,
      };
    }

    // Paso 3: Especificaciones
    case "ADD_LINEA_ESPECIFICACION":
      return {
        ...state,
        lineasEspecificacion: [...state.lineasEspecificacion, action.payload],
        ultimaModificacion: now,
      };

    case "UPDATE_LINEA_ESPECIFICACION":
      return {
        ...state,
        lineasEspecificacion: state.lineasEspecificacion.map((l) =>
          l.id === action.payload.id ? { ...l, ...action.payload.data } : l
        ),
        ultimaModificacion: now,
      };

    case "REMOVE_LINEA_ESPECIFICACION":
      return {
        ...state,
        lineasEspecificacion: state.lineasEspecificacion.filter((l) =>
          l.id !== action.payload
        ),
        ultimaModificacion: now,
      };

    case "SET_VALIDACIONES_INVENTARIO":
      return {
        ...state,
        validacionesInventario: action.payload,
        ultimaModificacion: now,
      };

    case "SET_MATERIALES_PENDIENTES":
      return {
        ...state,
        materialesPendientes: action.payload,
        ultimaModificacion: now,
      };

    case "SET_ESPECIFICACION_DIGITAL":
      return {
        ...state,
        especificacionDigital: {
          ...state.especificacionDigital,
          ...action.payload,
        } as EspecificacionDigitalData,
        ultimaModificacion: now,
      };

    case "CONFIGURAR_LINEA": {
      const { id, emisoraId, emisoraNombre, paqueteId, paqueteNombre, tipoPauta, tarifaUnitaria } = action.payload;
      const lineas = state.lineasEspecificacion.map((l) =>
        l.id === id
          ? {
            ...l,
            emisoraId,
            emisoraNombre,
            paqueteId,
            paqueteNombre,
            tipoPauta,
            tarifaUnitaria,
            totalNeto: tarifaUnitaria,
          }
          : l
      );
      return { ...state, lineasEspecificacion: lineas, ultimaModificacion: now };
    }

    case "SET_GRILLA_SEMANAL": {
      const lineas = state.lineasEspecificacion.map((l) => {
        if (l.id !== action.payload.id) return l;
        const cantidadTotal = action.payload.grilla.reduce((sum, d) => sum + (d.activo ? d.cantidad : 0), 0);
        const totalNeto = Math.round(l.tarifaUnitaria * cantidadTotal * (1 - (l.descuento || 0) / 100));
        return { ...l, grillaSemanal: action.payload.grilla, totalNeto };
      });
      return { ...state, lineasEspecificacion: lineas, ultimaModificacion: now };
    }

    case "SET_FECHAS_ESPECIFICACION": {
      const { id, fechaInicio, fechaFin, cantidad } = action.payload;
      const lineas = state.lineasEspecificacion.map((l) => {
        if (l.id !== id) return l;
        let cantidadTotal = cantidad || 0;
        if (fechaInicio && fechaFin && cantidadTotal === 0) {
          const dias = Math.max(1, Math.ceil((fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24)));
          cantidadTotal = dias;
        }
        const totalNeto = Math.round(l.tarifaUnitaria * cantidadTotal * (1 - (l.descuento || 0) / 100));
        return { ...l, fechaInicio, fechaFin, cantidad: cantidadTotal, totalNeto };
      });
      return { ...state, lineasEspecificacion: lineas, ultimaModificacion: now };
    }

    case "CALCULAR_TOTAL_ESPECIFICACION": {
      const { id, descuento } = action.payload;
      const lineas = state.lineasEspecificacion.map((l) => {
        if (l.id !== id) return l;
        let cantidadTotal = 0;
        if (l.tipoPauta === "auspicios") {
          cantidadTotal = l.cantidad || 0;
        } else {
          cantidadTotal = l.grillaSemanal?.reduce((sum, d) => sum + (d.activo ? d.cantidad : 0), 0) || 0;
        }
        const dto = descuento !== undefined ? descuento : (l.descuento || 0);
        const totalNeto = Math.round(l.tarifaUnitaria * cantidadTotal * (1 - dto / 100));
        return { ...l, descuento: dto, totalNeto };
      });
      return { ...state, lineasEspecificacion: lineas, ultimaModificacion: now };
    }

    // Paso 4: Aprobaciones
    case "SET_FLUJO_APROBACION":
      return {
        ...state,
        flujoAprobacion: action.payload,
        ultimaModificacion: now,
      };

    case "UPDATE_APROBADOR":
      if (!state.flujoAprobacion) return state;
      return {
        ...state,
        flujoAprobacion: {
          ...state.flujoAprobacion,
          aprobadores: state.flujoAprobacion.aprobadores.map((a) =>
            a.id === action.payload.id
              ? { ...a, estado: action.payload.estado }
              : a
          ),
        },
        ultimaModificacion: now,
      };

    case "SET_NOTIFICACIONES":
      return {
        ...state,
        notificacionesConfiguradas: action.payload,
        ultimaModificacion: now,
      };

    case "SET_ESCALAMIENTO_AUTO":
      return {
        ...state,
        escalamientoAutomatico: action.payload,
        ultimaModificacion: now,
      };

    // Paso 5: Documentación
    case "ADD_DOCUMENTO":
      return {
        ...state,
        documentos: [...state.documentos, action.payload],
        ultimaModificacion: now,
      };

    case "UPDATE_DOCUMENTO":
      return {
        ...state,
        documentos: state.documentos.map((d) =>
          d.id === action.payload.id ? { ...d, ...action.payload.data } : d
        ),
        ultimaModificacion: now,
      };

    case "SET_FIRMA_DIGITAL":
      return {
        ...state,
        firmaDigitalHabilitada: action.payload,
        ultimaModificacion: now,
      };

    case "SET_URL_FIRMA":
      return { ...state, urlFirma: action.payload, ultimaModificacion: now };

    // Paso 6: Anti-Fraude
    case "SET_CONFIGURACION_ANTI_FRAUDE":
      return {
        ...state,
        configuracionAntiFraude: action.payload,
        ultimaModificacion: now,
      };

    case "ADD_EVIDENCIA_NEGOCIACION":
      return {
        ...state,
        configuracionAntiFraude: {
          ...state.configuracionAntiFraude,
          evidenciasSubidas: [
            ...state.configuracionAntiFraude.evidenciasSubidas,
            action.payload,
          ],
          ultimaModificacion: now,
        },
        ultimaModificacion: now,
      };

    case "REMOVE_EVIDENCIA_NEGOCIACION":
      return {
        ...state,
        configuracionAntiFraude: {
          ...state.configuracionAntiFraude,
          evidenciasSubidas: state.configuracionAntiFraude.evidenciasSubidas
            .filter((e) => e.id !== action.payload),
          ultimaModificacion: now,
        },
        ultimaModificacion: now,
      };

    case "VALIDAR_EVIDENCIA":
      return {
        ...state,
        configuracionAntiFraude: {
          ...state.configuracionAntiFraude,
          evidenciasSubidas: state.configuracionAntiFraude.evidenciasSubidas
            .map((e) =>
              e.id === action.payload.id
                ? {
                  ...e,
                  validado: true,
                  validadoPor: action.payload.validadoPor,
                }
                : e
            ),
          ultimaModificacion: now,
        },
        ultimaModificacion: now,
      };

    case "SET_ESTADO_ANTI_FRAUDE":
      return {
        ...state,
        configuracionAntiFraude: {
          ...state.configuracionAntiFraude,
          estado: action.payload,
          puedeCargarCampanas: action.payload === "operativo",
          ultimaModificacion: now,
        },
        ultimaModificacion: now,
      };

    case "RESET_WIZARD":
      if (typeof window !== "undefined") {
        localStorage.removeItem(STORAGE_KEY);
        const bc = new BroadcastChannel(BROADCAST_CHANNEL);
        bc.postMessage({ type: "WIZARD_CLEAR" });
        bc.close();
      }
      return getInitialWizardState();

    case "HYDRATE_STATE":
      return { ...state, ...action.payload, isLoading: false, isSaving: false, errors: {} };

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
  const draftRef = useRef<WizardContratoState | null>(null);
  if (draftRef.current === null) {
    draftRef.current = loadDraftState();
  }

  const [state, dispatch] = useReducer(wizardReducer, draftRef.current || getInitialWizardState());

  // Sincronización cross-window via BroadcastChannel
  const bcRef = useRef<BroadcastChannel | null>(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const bc = new BroadcastChannel(BROADCAST_CHANNEL);
    bcRef.current = bc;
    bc.onmessage = (ev) => {
      if (ev.data?.type === "WIZARD_UPDATE") {
        const updated = deserializeState(ev.data.payload);
        dispatch({ type: "HYDRATE_STATE", payload: updated });
      }
      if (ev.data?.type === "WIZARD_CLEAR") {
        dispatch({ type: "RESET_WIZARD" });
      }
    };
    return () => bc.close();
  }, []);

  // Persistir en localStorage y notificar otras ventanas
  useEffect(() => {
    saveDraftState(state);
    if (bcRef.current) {
      bcRef.current.postMessage({ type: "WIZARD_UPDATE", payload: serializeState(state) });
    }
  }, [state]);

  // Inicializar con valores opcionales
  useEffect(() => {
    if (options.tipoInicial) {
      dispatch({ type: "SET_TIPO_CONTRATO", payload: options.tipoInicial });
    }
    if (options.anuncianteInicial) {
      dispatch({ type: "SET_ANUNCIANTE", payload: options.anuncianteInicial });
    }
  }, [options.tipoInicial, options.anuncianteInicial]);

  // Generar número de contrato automáticamente
  useEffect(() => {
    if (!state.numeroContrato) {
      const year = new Date().getFullYear();
      const sequence = Math.floor(Math.random() * 99999).toString().padStart(
        5,
        "0",
      );
      dispatch({
        type: "SET_NUMERO_CONTRATO",
        payload: `CON-${year}-${sequence}`,
      });
    }
  }, [state.numeroContrato]);

  // ═══════════════════════════════════════════════════════════════
  // NAVEGACIÓN
  // ═══════════════════════════════════════════════════════════════

  const goToStep = useCallback((step: WizardStep) => {
    // Solo permitir ir a pasos ya completados o el siguiente
    const maxAllowedStep = Math.max(...state.completedSteps, 1) + 1;
    if (step <= maxAllowedStep) {
      dispatch({ type: "SET_STEP", payload: step });
    }
  }, [state.completedSteps]);

  const nextStep = useCallback(() => {
    const currentConfig = WIZARD_STEPS.find((s) => s.id === state.currentStep);
    if (!currentConfig) return;

    const validation = currentConfig.validacion(state);
    if (!validation.isValid) {
      const errorMap: Record<string, string> = {};
      validation.errors.forEach((err, idx) => {
        errorMap[`step${state.currentStep}_error${idx}`] = err;
      });
      dispatch({ type: "SET_ERRORS", payload: errorMap });
      return false;
    }

    // Marcar paso como completado y avanzar
    dispatch({ type: "COMPLETE_STEP", payload: state.currentStep });
    if (state.currentStep < 5) {
      dispatch({
        type: "SET_STEP",
        payload: (state.currentStep + 1) as WizardStep,
      });
    }
    return true;
  }, [state]);

  const prevStep = useCallback(() => {
    if (state.currentStep > 1) {
      dispatch({
        type: "SET_STEP",
        payload: (state.currentStep - 1) as WizardStep,
      });
    }
  }, [state.currentStep]);

  // ═══════════════════════════════════════════════════════════════
  // VALIDACIÓN
  // ═══════════════════════════════════════════════════════════════

  const validateCurrentStep = useCallback(() => {
    const currentConfig = WIZARD_STEPS.find((s) => s.id === state.currentStep);
    if (!currentConfig) return { isValid: true, errors: [] };
    return currentConfig.validacion(state);
  }, [state]);

  const isStepComplete = useCallback((step: WizardStep) => {
    return state.completedSteps.includes(step);
  }, [state.completedSteps]);

  const canProceed = useMemo(() => {
    const currentConfig = WIZARD_STEPS.find((s) => s.id === state.currentStep);
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
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const response = await fetch(
        `/api/contratos/analisis-riesgo?anuncianteId=${anuncianteId}`,
      );
      const data = await response.json();
      if (data.success) {
        dispatch({ type: "SET_ANALISIS_RIESGO", payload: data.data });
      }
    } catch (error) {
      logger.error(
        "Error cargando análisis de riesgo",
        error instanceof Error ? error : undefined,
      );
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  const setAnunciante = useCallback(
    (anunciante: AnuncianteSeleccionado | null) => {
      dispatch({ type: "SET_ANUNCIANTE", payload: anunciante });
      // Auto-cargar análisis de riesgo cuando se selecciona anunciante
      if (anunciante) {
        cargarAnalisisRiesgo(anunciante.id);
      }
    },
    [cargarAnalisisRiesgo],
  );

  const validarInventario = useCallback(async () => {
    if (state.lineasEspecificacion.length === 0) return;

    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const response = await fetch("/api/contratos/validar-inventario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lineas: state.lineasEspecificacion }),
      });
      const data = await response.json();
      if (data.success) {
        dispatch({ type: "SET_VALIDACIONES_INVENTARIO", payload: data.data });
      }
    } catch (error) {
      logger.error(
        "Error validando inventario",
        error instanceof Error ? error : undefined,
      );
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [state.lineasEspecificacion]);

  const calcularFlujoAprobacion = useCallback(() => {
    const nivelRequerido = determinarNivelAprobacion(
      state.valorNeto,
      state.descuentoPorcentaje,
      state.terminosPago.diasPago,
      !state.anunciante?.historialContratos ||
      state.anunciante.historialContratos.total === 0,
    );

    // Simular aprobadores según nivel
    const aprobadores = generarAprobadoresPorNivel(nivelRequerido);

    const flujo: FlujoProbacion = {
      nivelRequerido,
      aprobadores,
      valorContrato: state.valorNeto,
      porcentajeDescuento: state.descuentoPorcentaje,
      terminosPago: state.terminosPago.diasPago,
      esNuevoCliente: !state.anunciante?.historialContratos ||
        state.anunciante.historialContratos.total === 0,
      tieneExclusividad: false,
    };

    dispatch({ type: "SET_FLUJO_APROBACION", payload: flujo });
  }, [
    state.valorNeto,
    state.descuentoPorcentaje,
    state.terminosPago.diasPago,
    state.anunciante,
  ]);

  const guardarContrato = useCallback(async () => {
    dispatch({ type: "SET_SAVING", payload: true });
    try {
      const contratoData = {
        numeroContrato: state.numeroContrato,
        tipoContrato: state.tipoContrato,
        medio: state.medio,
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
        propiedadesSeleccionadas: state.propiedadesSeleccionadas,
      };

      const response = await fetch("/api/contratos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contratoData),
      });

      const data = await response.json();

      if (data.success) {
        const contratoId = data.data.id;
        const especDigital = state.especificacionDigital;
        const tieneDatosDigitales = especDigital &&
          (
            (especDigital.plataformas && especDigital.plataformas.length > 0) ||
            (especDigital.presupuestoDigital &&
              especDigital.presupuestoDigital > 0) ||
            (especDigital.notas && especDigital.notas.trim().length > 0)
          );

        if (tieneDatosDigitales) {
          try {
            await fetch("/api/digital/especificaciones", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ contratoId, ...especDigital }),
            });
          } catch {
            // No bloquear el flujo si falla
          }
        }

        options.onSaveSuccess?.(contratoId);
        return { success: true, id: contratoId };
      } else {
        options.onSaveError?.(data.error);
        return { success: false, error: data.error };
      }
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : "Error desconocido";
      options.onSaveError?.(message);
      return { success: false, error: message };
    } finally {
      dispatch({ type: "SET_SAVING", payload: false });
    }
  }, [state, options]);

  const resetWizard = useCallback(() => {
    dispatch({ type: "RESET_WIZARD" });
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
    resetWizard,
  };
}

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

function generarAprobadoresPorNivel(nivel: string) {
  const aprobadoresBase = [
    {
      id: "sup_001",
      nombre: "María Silva",
      email: "maria.silva@silexar.com",
      cargo: "Supervisora Comercial",
      nivel: "supervisor" as const,
      estado: "pendiente" as const,
      tiempoLimite: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 horas
    },
    {
      id: "ger_001",
      nombre: "Carlos Mendoza",
      email: "carlos.mendoza@silexar.com",
      cargo: "Gerente Comercial",
      nivel: "gerente_comercial" as const,
      estado: "pendiente" as const,
      tiempoLimite: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 horas
    },
    {
      id: "ggen_001",
      nombre: "Roberto Torres",
      email: "roberto.torres@silexar.com",
      cargo: "Gerente General",
      nivel: "gerente_general" as const,
      estado: "pendiente" as const,
      tiempoLimite: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
    },
    {
      id: "dir_001",
      nombre: "Directorio",
      email: "directorio@silexar.com",
      cargo: "Directorio",
      nivel: "directorio" as const,
      estado: "pendiente" as const,
      tiempoLimite: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 horas
    },
  ];

  switch (nivel) {
    case "automatico":
      return [];
    case "supervisor":
      return aprobadoresBase.slice(0, 1);
    case "gerente_comercial":
      return aprobadoresBase.slice(0, 2);
    case "gerente_general":
      return aprobadoresBase.slice(0, 3);
    case "directorio":
      return aprobadoresBase;
    default:
      return [];
  }
}

export default useWizardContrato;
