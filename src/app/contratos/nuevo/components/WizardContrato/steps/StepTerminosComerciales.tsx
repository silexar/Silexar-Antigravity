/**
 * 💰 SILEXAR PULSE - Paso 2: Términos Comerciales TIER 0
 *
 * @description Segundo paso del wizard - Análisis de riesgo Cortex-AI,
 * configuración de términos de pago y visualización de cuotas.
 *
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ChevronRight,
  FileText,
  Info,
  Receipt,
  RefreshCw,
  Shield,
  Tag,
  TrendingDown,
  TrendingUp,
  User,
  X,
  Zap,
} from "lucide-react";
import {
  CuotaFacturacion,
  formatCurrency,
  getNivelRiesgoColor,
  Moneda,
  WizardAction,
  WizardContratoState,
} from "../types/wizard.types";

// ═══════════════════════════════════════════════════════════════
// UTILIDADES
// ═══════════════════════════════════════════════════════════════

const getMonthLabel = (date: Date): string => {
  return date.toLocaleDateString("es-CL", { month: "short" }).replace(".", "").toUpperCase();
};

const getYearLabel = (date: Date): string => {
  return date.getFullYear().toString().slice(-2);
};

// Generar cuotas distribuidas por mes desde fecha inicio
const generarCuotas = (
  valorNeto: number,
  numCuotas: number,
  fechaInicio: Date | null,
): Array<{ mes: string; anio: string; valor: number; facturado: boolean }> => {
  if (!fechaInicio || numCuotas <= 0 || valorNeto <= 0) return [];
  const base = Math.floor(valorNeto / numCuotas);
  const resto = valorNeto - base * numCuotas;
  const cuotas: Array<{ mes: string; anio: string; valor: number; facturado: boolean }> = [];
  const d = new Date(fechaInicio);
  for (let i = 0; i < numCuotas; i++) {
    const mesDate = new Date(d.getFullYear(), d.getMonth() + i, 1);
    cuotas.push({
      mes: getMonthLabel(mesDate),
      anio: getYearLabel(mesDate),
      valor: i === numCuotas - 1 ? base + resto : base,
      facturado: false,
    });
  }
  return cuotas;
};

// ═══════════════════════════════════════════════════════════════
// PANEL DE ANÁLISIS CORTEX-RISK
// ═══════════════════════════════════════════════════════════════

const AnalisisCortexRisk: React.FC<{
  analisis: WizardContratoState["analisisRiesgo"];
  anunciante: WizardContratoState["anunciante"];
  isLoading: boolean;
}> = ({ analisis, anunciante, isLoading }) => {
  if (!anunciante) {
    return (
      <div className="p-3 rounded-xl bg-[#dfeaff] text-center">
        <Shield className="w-6 h-6 mx-auto mb-1 text-[#9aa3b8]" />
        <p className="text-xs text-[#9aa3b8]">
          Seleccione un anunciante para ver el análisis de riesgo
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-3 rounded-xl bg-[#6888ff15] text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <RefreshCw className="w-6 h-6 mx-auto mb-1 text-[#6888ff]" />
        </motion.div>
        <p className="text-xs text-[#6888ff] font-medium">
          Analizando riesgo crediticio...
        </p>
      </div>
    );
  }

  const data = analisis || {
    score: anunciante.scoreRiesgo ?? 750,
    maxScore: 1000,
    nivelRiesgo: anunciante.nivelRiesgo ?? "bajo",
    factoresPositivos: [
      "Historial de pagos excelente",
      "Cliente establecido",
      "Industria estable",
    ],
    factoresNegativos: [],
    recomendaciones: anunciante.terminosPreferenciales ?? {
      terminosPago: 30,
      limiteCredito: 50000000,
      descuentoMaximo: 15,
      requiereGarantia: false,
    },
    indicadores: {
      historialPagos: 100,
      tendenciaFacturacion: "estable" as const,
      industria: "estable" as const,
      contratosExitosos: anunciante.historialContratos?.exitosos ?? 0,
    },
    fechaActualizacion: new Date(),
    confianza: 95,
  };

  const recs = data.recomendaciones;

  const scorePercentage = Math.min((data.score / data.maxScore) * 100, 100);

  return (
    <div className="rounded-xl bg-[#dfeaff] shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff] overflow-hidden">
      {/* Header */}
      <div className="p-2 bg-[#6888ff] text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-[#dfeaff]/20">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Análisis Cortex-Risk</h3>
              <p className="text-[11px] text-white/80">{anunciante.nombre}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xl font-black">{data.score}</p>
            <p className="text-[11px] text-white/70">de {data.maxScore}</p>
          </div>
        </div>
      </div>

      {/* Score visual + indicadores */}
      <div className="p-2">
        <div className="relative h-1.5 bg-[#dfeaff] rounded-full overflow-hidden mb-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${scorePercentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full rounded-full bg-gradient-to-r ${getNivelRiesgoColor(data.nivelRiesgo)}`}
          />
        </div>

        <div className="grid grid-cols-4 gap-1.5 mb-2">
          {[
            { label: "Pagos Puntuales", value: `${data.indicadores.historialPagos}%` },
            {
              label: "Tendencia",
              value: (
                <span className="flex items-center justify-center gap-0.5">
                  {data.indicadores.tendenciaFacturacion === "creciente" && <TrendingUp className="w-3 h-3 text-[#6888ff]" />}
                  {data.indicadores.tendenciaFacturacion === "decreciente" && <TrendingDown className="w-3 h-3 text-[#9aa3b8]" />}
                  <span className="capitalize">{data.indicadores.tendenciaFacturacion}</span>
                </span>
              ),
            },
            { label: "Contratos OK", value: data.indicadores.contratosExitosos.toString() },
            { label: "Confianza IA", value: `${data.confianza}%` },
          ].map((item, i) => (
            <div key={i} className="text-center p-1.5 bg-[#dfeaff] rounded-lg shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff]">
              <p className="text-sm font-bold text-[#6888ff]">{item.value}</p>
              <p className="text-[10px] text-[#9aa3b8] leading-tight">{item.label}</p>
            </div>
          ))}
        </div>

        {/* Factores + Recomendaciones lado a lado */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <h4 className="text-[11px] font-semibold text-[#6888ff] flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Factores Positivos
            </h4>
            {data.factoresPositivos.map((factor, i) => (
              <div key={`${factor}-${i}`} className="flex items-center gap-1 text-[11px] text-[#69738c]">
                <span className="w-1 h-1 rounded-full bg-[#6888ff] shrink-0" />
                {factor}
              </div>
            ))}
            {data.factoresNegativos.length > 0 && (
              <>
                <h4 className="text-[11px] font-semibold text-[#9aa3b8] flex items-center gap-1 mt-1">
                  <AlertTriangle className="w-3 h-3" />
                  Factores de Riesgo
                </h4>
                {data.factoresNegativos.map((factor, i) => (
                  <div key={`neg-${factor}-${i}`} className="flex items-center gap-1 text-[11px] text-[#69738c]">
                    <span className="w-1 h-1 rounded-full bg-[#9aa3b8] shrink-0" />
                    {factor}
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Recomendaciones (movidas al lado derecho) */}
          <div className="p-2 bg-[#6888ff15] rounded-lg">
            <h4 className="text-[11px] font-semibold text-[#6888ff] mb-1.5 flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Recomendaciones
            </h4>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#9aa3b8]">Plazo máx.</span>
                <span className="font-bold text-[#6888ff]">
                  {"diasPago" in recs ? recs.diasPago : recs.terminosPago} días
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#9aa3b8]">Descuento máx.</span>
                <span className="font-bold text-[#6888ff]">{recs.descuentoMaximo}%</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#9aa3b8]">Límite crédito</span>
                <span className="font-bold text-[#6888ff]">
                  ${(recs.limiteCredito / 1000000).toFixed(0)}M
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTES DE FORMULARIO
// ═══════════════════════════════════════════════════════════════

const SelectInput: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}> = ({ label, value, onChange, options }) => (
  <div className="space-y-1">
    <label className="block text-xs font-medium text-[#69738c]">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="
        w-full rounded-xl py-2 px-3 bg-[#dfeaff]
        shadow-[inset_2px_2px_4px_#bec8de,inset_-2px_-2px_4px_#ffffff]
        border-2 border-transparent
        outline-none focus:ring-2 focus:ring-[#6888ff]/50
        text-[#69738c] text-sm
        transition-all duration-200
        appearance-none cursor-pointer
      "
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

const NumberInput: React.FC<{
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  icon?: React.ElementType;
  suffix?: string;
  readOnly?: boolean;
}> = ({ label, value, onChange, min = 0, max = 999, icon: Icon, suffix, readOnly }) => (
  <div className="space-y-1">
    <label className="block text-xs font-medium text-[#69738c]">{label}</label>
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9aa3b8]" />
      )}
      <input
        type="number"
        min={min}
        max={max}
        value={value || ""}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        readOnly={readOnly}
        aria-label={label}
        className={`
          w-full rounded-xl py-2 bg-[#dfeaff]
          shadow-[inset_2px_2px_4px_#bec8de,inset_-2px_-2px_4px_#ffffff]
          border-2 border-transparent
          outline-none focus:ring-2 focus:ring-[#6888ff]/50
          text-[#69738c] text-sm
          transition-all duration-200
          ${readOnly ? "opacity-70 cursor-default" : ""}
          ${Icon ? "pl-9" : "pl-3"} ${suffix ? "pr-10" : "pr-3"}
        `}
      />
      {suffix && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9aa3b8] text-xs">
          {suffix}
        </span>
      )}
    </div>
  </div>
);

const Toggle: React.FC<{
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}> = ({ label, description, checked, onChange }) => (
  <div className="flex items-center justify-between p-2 rounded-xl bg-[#dfeaff] shadow-[inset_2px_2px_4px_#bec8de,inset_-2px_-2px_4px_#ffffff]">
    <div>
      <p className="font-medium text-xs text-[#69738c]">{label}</p>
      {description && <p className="text-[11px] text-[#9aa3b8]">{description}</p>}
    </div>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`
        w-10 h-6 rounded-full transition-all duration-200 relative
        ${checked ? "bg-[#6888ff]" : "bg-[#dfeaff]"}
      `}
    >
      <motion.span
        className="absolute top-1 w-4 h-4 bg-[#dfeaff] rounded-full shadow-[2px_2px_4px_#bec8de,-2px_-2px_4px_#ffffff]"
        animate={{ left: checked ? "1.25rem" : "0.25rem" }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </button>
  </div>
);

// ═══════════════════════════════════════════════════════════════
// MODAL DE OPCIONES ESPECIALES
// ═══════════════════════════════════════════════════════════════

const ModalOpcionesEspeciales: React.FC<{
  open: boolean;
  onClose: () => void;
  state: WizardContratoState;
  dispatch: React.Dispatch<WizardAction>;
}> = ({ open, onClose, state, dispatch }) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#69738c]/30"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="w-full max-w-md mx-4 rounded-2xl bg-[#dfeaff] shadow-[8px_8px_16px_#bec8de,-8px_-8px_16px_#ffffff] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-[#69738c] flex items-center gap-2">
                <Info className="w-4 h-4 text-[#6888ff]" />
                Opciones Especiales
              </h3>
              <button
                onClick={onClose}
                className="p-1 rounded-lg bg-[#dfeaff] shadow-[2px_2px_4px_#bec8de,-2px_-2px_4px_#ffffff] text-[#9aa3b8] hover:text-[#69738c]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Canje */}
              <div className="space-y-2">
                <Toggle
                  label="Contrato de Canje"
                  description="Incluye servicios intercambiados"
                  checked={state.esCanje}
                  onChange={(checked) =>
                    dispatch({
                      type: "SET_CANJE",
                      payload: {
                        esCanje: checked,
                        porcentaje: checked ? state.porcentajeCanje : 0,
                      },
                    })}
                />
                {state.esCanje && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                  >
                    <NumberInput
                      label="Porcentaje de Canje"
                      value={state.porcentajeCanje}
                      onChange={(value) =>
                        dispatch({
                          type: "SET_CANJE",
                          payload: { esCanje: true, porcentaje: value },
                        })}
                      min={0}
                      max={100}
                      suffix="%"
                    />
                  </motion.div>
                )}
              </div>

              {/* Facturar comisión de agencia (solo si es agencia) */}
              {state.anunciante?.esAgencia && (
                <div className="space-y-2">
                  <Toggle
                    label="Facturar Comisión de Agencia"
                    description="Generar factura separada por comisión"
                    checked={state.facturarComisionAgencia}
                    onChange={(checked) =>
                      dispatch({
                        type: "SET_COMISION_AGENCIA",
                        payload: {
                          comision: state.comisionAgencia,
                          facturar: checked,
                        },
                      })}
                  />
                  {state.facturarComisionAgencia && (
                    <NumberInput
                      label="Porcentaje de Comisión"
                      value={state.comisionAgencia}
                      onChange={(value) =>
                        dispatch({
                          type: "SET_COMISION_AGENCIA",
                          payload: { comision: value, facturar: true },
                        })}
                      min={0}
                      max={30}
                      suffix="%"
                    />
                  )}
                </div>
              )}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-[#6888ff] text-white text-xs font-bold shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff]"
              >
                Aceptar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ═══════════════════════════════════════════════════════════════
// MODAL FACTURAR CUOTA
// ═══════════════════════════════════════════════════════════════

const ModalFacturarCuota: React.FC<{
  open: boolean;
  onClose: () => void;
  cuota: { indice: number; mes: string; anio: string; valor: number } | null;
  moneda: Moneda;
  onConfirmar: (data: {
    indice: number;
    fechaFacturacion: Date;
    numeroFactura: string;
    montoFacturado: number;
  }) => void;
}> = ({ open, onClose, cuota, moneda, onConfirmar }) => {
  const [numeroFactura, setNumeroFactura] = useState("");

  if (!cuota) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#69738c]/30"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="w-full max-w-sm mx-4 rounded-2xl bg-[#dfeaff] shadow-[8px_8px_16px_#bec8de,-8px_-8px_16px_#ffffff] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-[#69738c] flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#6888ff]" />
                Facturar Cuota
              </h3>
              <button
                onClick={onClose}
                className="p-1 rounded-lg bg-[#dfeaff] shadow-[2px_2px_4px_#bec8de,-2px_-2px_4px_#ffffff] text-[#9aa3b8] hover:text-[#69738c]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-[#6888ff15] mb-3">
              <p className="text-[11px] text-[#9aa3b8] uppercase tracking-wider">Cuota {cuota.indice + 1}</p>
              <p className="text-lg font-black text-[#6888ff]">
                {cuota.mes} '{cuota.anio}
              </p>
              <p className="text-sm font-bold text-[#69738c]">
                {formatCurrency(cuota.valor, moneda)}
              </p>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-[#69738c]">Nº Factura</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9aa3b8]" />
                  <input
                    type="text"
                    value={numeroFactura}
                    onChange={(e) => setNumeroFactura(e.target.value)}
                    placeholder="Ej: FAC-001-2026"
                    className="
                      w-full rounded-xl py-2 pl-9 pr-3 bg-[#dfeaff]
                      shadow-[inset_2px_2px_4px_#bec8de,inset_-2px_-2px_4px_#ffffff]
                      border-2 border-transparent
                      outline-none focus:ring-2 focus:ring-[#6888ff]/50
                      text-[#69738c] text-sm
                    "
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 rounded-xl bg-[#dfeaff] text-[#69738c] text-xs font-bold shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff]"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onConfirmar({
                    indice: cuota.indice,
                    fechaFacturacion: new Date(),
                    numeroFactura: numeroFactura || `FAC-${cuota.indice + 1}`,
                    montoFacturado: cuota.valor,
                  });
                  setNumeroFactura("");
                  onClose();
                }}
                className="flex-1 px-4 py-2 rounded-xl bg-[#6888ff] text-white text-xs font-bold shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff]"
              >
                Confirmar Facturación
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ═══════════════════════════════════════════════════════════════
// MODAL DETALLE FACTURA
// ═══════════════════════════════════════════════════════════════

const ModalDetalleFactura: React.FC<{
  open: boolean;
  onClose: () => void;
  cuota: CuotaFacturacion | null;
  moneda: Moneda;
}> = ({ open, onClose, cuota, moneda }) => {
  if (!cuota) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#69738c]/30"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="w-full max-w-sm mx-4 rounded-2xl bg-[#dfeaff] shadow-[8px_8px_16px_#bec8de,-8px_-8px_16px_#ffffff] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-[#69738c] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Detalle de Factura
              </h3>
              <button
                onClick={onClose}
                className="p-1 rounded-lg bg-[#dfeaff] shadow-[2px_2px_4px_#bec8de,-2px_-2px_4px_#ffffff] text-[#9aa3b8] hover:text-[#69738c]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-[#6888ff15]">
                <p className="text-[11px] text-[#9aa3b8] uppercase tracking-wider">Cuota {cuota.indice + 1}</p>
                <p className="text-lg font-black text-[#6888ff]">
                  {formatCurrency(cuota.montoFacturado ?? 0, moneda)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded-xl bg-[#dfeaff] shadow-[inset_2px_2px_4px_#bec8de,inset_-2px_-2px_4px_#ffffff]">
                  <p className="text-[10px] text-[#9aa3b8] uppercase tracking-wider">Nº Factura</p>
                  <p className="text-sm font-bold text-[#69738c]">{cuota.numeroFactura || "—"}</p>
                </div>
                <div className="p-2 rounded-xl bg-[#dfeaff] shadow-[inset_2px_2px_4px_#bec8de,inset_-2px_-2px_4px_#ffffff]">
                  <p className="text-[10px] text-[#9aa3b8] uppercase tracking-wider">Fecha Emisión</p>
                  <p className="text-sm font-bold text-[#69738c]">
                    {cuota.fechaFacturacion
                      ? new Date(cuota.fechaFacturacion).toLocaleDateString("es-CL")
                      : "—"}
                  </p>
                </div>
              </div>

              <div className="p-2 rounded-xl bg-[#dfeaff] shadow-[inset_2px_2px_4px_#bec8de,inset_-2px_-2px_4px_#ffffff]">
                <p className="text-[10px] text-[#9aa3b8] uppercase tracking-wider">Estado</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-medium text-emerald-600">Facturada</span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-[#6888ff] text-white text-xs font-bold shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff]"
              >
                Cerrar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

interface StepTerminosComercialesProps {
  state: WizardContratoState;
  dispatch: React.Dispatch<WizardAction>;
}

export const StepTerminosComerciales: React.FC<StepTerminosComercialesProps> = (
  { state, dispatch },
) => {
  const [modalOpcionesOpen, setModalOpcionesOpen] = useState(false);
  const [modalFacturarOpen, setModalFacturarOpen] = useState(false);
  const [modalDetalleOpen, setModalDetalleOpen] = useState(false);
  const [cuotaSeleccionada, setCuotaSeleccionada] = useState<{
    indice: number;
    mes: string;
    anio: string;
    valor: number;
  } | null>(null);

  // Calcular cuotas
  const cuotas = useMemo(() => {
    if (state.terminosPago.modalidad !== "cuotas") return [];
    return generarCuotas(
      state.valorNeto,
      state.terminosPago.numeroCuotas || 1,
      state.fechaInicio,
    );
  }, [state.valorNeto, state.terminosPago.modalidad, state.terminosPago.numeroCuotas, state.fechaInicio]);

  const ivaPercent = state.anunciante?.ivaPorcentaje ?? 19;
  const montoIva = Math.round(state.valorNeto * ivaPercent / 100);

  return (
    <div className="space-y-2">
      {/* Fila superior: Cortex-Risk | Datos Anunciante */}
      <div className="grid grid-cols-5 gap-2">
        {/* Análisis de riesgo (3 cols) */}
        <div className="col-span-3">
          <AnalisisCortexRisk
            analisis={state.analisisRiesgo}
            anunciante={state.anunciante}
            isLoading={state.isLoading}
          />
        </div>

        {/* Datos del anunciante (2 cols) */}
        <div className="col-span-2 rounded-xl bg-[#dfeaff] shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff] p-3 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-semibold text-[#69738c] mb-2 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-[#6888ff]" />
              Datos del Anunciante
            </h3>

            {/* Número deudor */}
            <div className="mb-2">
              <p className="text-[10px] text-[#9aa3b8] uppercase tracking-wider">Nº Deudor</p>
              <p className="text-sm font-bold text-[#6888ff]">
                {state.anunciante?.numeroDeudor || "—"}
              </p>
            </div>

            {/* Comisión Agencia flag del Step 1 */}
            <div className="mb-2">
              <p className="text-[10px] text-[#9aa3b8] uppercase tracking-wider">Comisión Agencia</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                {state.tieneComisionAgencia ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-[#6888ff]" />
                    <span className="text-xs font-medium text-[#69738c]">
                      Aplicada ({state.comisionAgencia}%)
                    </span>
                  </>
                ) : (
                  <>
                    <span className="w-4 h-4 rounded-full bg-[#dfeaff] shadow-[inset_1px_1px_2px_#bec8de,inset_-1px_-1px_2px_#ffffff]" />
                    <span className="text-xs text-[#9aa3b8]">Sin comisión</span>
                  </>
                )}
              </div>
            </div>

            {/* IVA del anunciante */}
            <div className="mb-2">
              <p className="text-[10px] text-[#9aa3b8] uppercase tracking-wider">IVA Configurado</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-sm font-bold text-[#6888ff]">{ivaPercent}%</span>
                <span className="text-[10px] text-[#9aa3b8]">(config. anunciante)</span>
              </div>
            </div>
          </div>

          {/* Badge moneda */}
          <div className="mt-2 flex items-center gap-1.5">
            <Tag className="w-3 h-3 text-[#6888ff]" />
            <span className="text-[11px] font-medium text-[#69738c]">
              Moneda: <span className="font-bold text-[#6888ff]">{state.moneda}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Términos de pago */}
      <div className="p-3 rounded-xl bg-[#dfeaff] shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff]">
        <h3 className="text-sm font-semibold text-[#69738c] mb-2 flex items-center gap-1">
          <Calendar className="w-4 h-4 text-[#6888ff]" />
          Términos de Pago
        </h3>

        <div className="grid grid-cols-4 gap-2">
          <NumberInput
            label="Días de Pago"
            value={state.terminosPago.diasPago}
            onChange={(value) =>
              dispatch({
                type: "SET_TERMINOS_PAGO",
                payload: { diasPago: value },
              })}
            min={1}
            max={90}
            icon={Calendar}
            suffix="días"
          />

          <SelectInput
            label="Modalidad"
            value={state.terminosPago.modalidad}
            onChange={(value) =>
              dispatch({
                type: "SET_TERMINOS_PAGO",
                payload: { modalidad: value as "por_campana" | "cuotas" },
              })}
            options={[
              { value: "por_campana", label: "Por campaña" },
              { value: "cuotas", label: "Cuotas" },
            ]}
          />

          <AnimatePresence>
            {state.terminosPago.modalidad === "cuotas" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="w-[85px]"
              >
                <NumberInput
                  label="Nº Cuotas"
                  value={state.terminosPago.numeroCuotas || 1}
                  onChange={(value) =>
                    dispatch({
                      type: "SET_TERMINOS_PAGO",
                      payload: { numeroCuotas: value },
                    })}
                  min={1}
                  max={12}
                  suffix="cuotas"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <SelectInput
            label="Tipo Factura"
            value={state.terminosPago.tipoFactura}
            onChange={(value) =>
              dispatch({
                type: "SET_TERMINOS_PAGO",
                payload: { tipoFactura: value as "posterior" | "adelantado" | "efectivo" },
              })}
            options={[
              { value: "posterior", label: "Posterior al servicio" },
              { value: "adelantado", label: "Adelantado" },
              { value: "efectivo", label: "Efectivo" },
            ]}
          />
        </div>

        {/* Viewer horizontal de cuotas — full width */}
        <AnimatePresence>
          {state.terminosPago.modalidad === "cuotas" && cuotas.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2"
            >
              <p className="text-[11px] text-[#9aa3b8] mb-1">Distribución de cuotas</p>
              <div className="flex gap-1">
                {cuotas.map((c, i) => {
                  const facturada = state.cuotasFacturacion.find(
                    (cf) => cf.indice === i
                  );
                  const isFacturada = !!facturada?.facturada;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => {
                        setCuotaSeleccionada({ indice: i, mes: c.mes, anio: c.anio, valor: c.valor });
                        if (isFacturada) {
                          setModalDetalleOpen(true);
                        } else {
                          setModalFacturarOpen(true);
                        }
                      }}
                      className={`
                        flex-1 min-w-0 p-1 rounded-lg text-center cursor-pointer
                        transition-all duration-200 select-none overflow-hidden
                        ${isFacturada
                          ? "bg-emerald-50 shadow-[2px_2px_4px_#bec8de,-2px_-2px_4px_#ffffff] ring-1 ring-emerald-400/40"
                          : "bg-[#dfeaff] shadow-[2px_2px_4px_#bec8de,-2px_-2px_4px_#ffffff] hover:shadow-[3px_3px_6px_#bec8de,-3px_-3px_6px_#ffffff]"
                        }
                      `}
                      title={isFacturada ? "Cuota facturada — clic para ver detalle" : "Clic para facturar"}
                    >
                      <div className="flex items-center justify-center gap-0.5 mb-0.5">
                        <span className={`text-[9px] font-black ${isFacturada ? "text-emerald-600" : "text-[#6888ff]"}`}>
                          {c.mes}
                        </span>
                        <span className="text-[8px] text-[#9aa3b8]">'{c.anio}</span>
                      </div>
                      <p className={`text-[10px] font-bold leading-tight ${isFacturada ? "text-emerald-700" : "text-[#69738c]"}`}>
                        {formatCurrency(c.valor, state.moneda)}
                      </p>
                      <div className="mt-0.5 flex items-center justify-center">
                        {isFacturada ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <span className="w-3 h-3 rounded-full bg-[#dfeaff] shadow-[inset_1px_1px_2px_#bec8de,inset_-1px_-1px_2px_#ffffff]" />
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Fila inferior: Opciones especiales + Resumen */}
      <div className="grid grid-cols-5 gap-2">
        {/* Botón Opciones Especiales */}
        <div className="col-span-2 rounded-xl bg-[#dfeaff] shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff] p-3">
          <h3 className="text-xs font-semibold text-[#69738c] mb-2 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-[#6888ff]" />
            Opciones Especiales
          </h3>
          <button
            onClick={() => setModalOpcionesOpen(true)}
            className="w-full flex items-center justify-between p-2 rounded-xl bg-[#dfeaff] shadow-[inset_2px_2px_4px_#bec8de,inset_-2px_-2px_4px_#ffffff] hover:shadow-[inset_3px_3px_6px_#bec8de,inset_-3px_-3px_6px_#ffffff] transition-all"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#6888ff]" />
              <span className="text-xs text-[#69738c]">
                {state.esCanje ? "Canje activo" : "Sin opciones activas"}
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#9aa3b8]" />
          </button>

          {state.esCanje && (
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[#6888ff]">
              <Receipt className="w-3 h-3" />
              Canje: {state.porcentajeCanje}% del valor
            </div>
          )}
        </div>

        {/* Resumen Valor Total Neto del Step 1 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="col-span-3 rounded-xl bg-[#6888ff] text-white p-3 flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-sm">Resumen del Contrato</h3>
              <p className="text-white/70 text-xs">Valores desde Paso 1</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-white/70">Valor Total Neto</p>
              <p className="text-2xl font-black">
                {formatCurrency(state.valorNeto, state.moneda)}
              </p>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-white/20 grid grid-cols-4 gap-2 text-center">
            <div>
              <p className="text-white/70 text-[10px]">Valor Bruto</p>
              <p className="font-bold text-xs">{formatCurrency(state.valorBruto, state.moneda)}</p>
            </div>
            <div>
              <p className="text-white/70 text-[10px]">Descuento</p>
              <p className="font-bold text-xs">{state.descuentoPorcentaje}%</p>
            </div>
            <div>
              <p className="text-white/70 text-[10px]">IVA ({ivaPercent}%)</p>
              <p className="font-bold text-xs">{formatCurrency(montoIva, state.moneda)}</p>
            </div>
            <div>
              <p className="text-white/70 text-[10px]">Plazo</p>
              <p className="font-bold text-xs">{state.terminosPago.diasPago} días</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modal Opciones Especiales */}
      <ModalOpcionesEspeciales
        open={modalOpcionesOpen}
        onClose={() => setModalOpcionesOpen(false)}
        state={state}
        dispatch={dispatch}
      />

      {/* Modal Facturar Cuota */}
      <ModalFacturarCuota
        open={modalFacturarOpen}
        onClose={() => setModalFacturarOpen(false)}
        cuota={cuotaSeleccionada}
        moneda={state.moneda}
        onConfirmar={(data) => {
          dispatch({
            type: "SET_CUOTA_FACTURADA",
            payload: {
              indice: data.indice,
              facturada: true,
              fechaFacturacion: data.fechaFacturacion,
              numeroFactura: data.numeroFactura,
              montoFacturado: data.montoFacturado,
            },
          });
        }}
      />

      {/* Modal Detalle Factura */}
      <ModalDetalleFactura
        open={modalDetalleOpen}
        onClose={() => setModalDetalleOpen(false)}
        cuota={cuotaSeleccionada ? (state.cuotasFacturacion.find((c) => c.indice === cuotaSeleccionada.indice) ?? null) : null}
        moneda={state.moneda}
      />
    </div>
  );
};

export default StepTerminosComerciales;
