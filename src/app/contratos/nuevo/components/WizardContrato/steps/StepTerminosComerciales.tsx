/**
 * 💰 SILEXAR PULSE - Paso 2: Términos Comerciales TIER 0
 * 
 * @description Segundo paso del wizard - Análisis de riesgo Cortex-AI,
 * configuración de términos de pago y valores del contrato.
 * 
 * @version 2025.3.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  Shield,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Percent,
  CreditCard,
  Zap,
  RefreshCw,
  Info
} from 'lucide-react';
import { 
  WizardContratoState, 
  WizardAction,
  formatCurrency,
  calcularValorNeto,
  getNivelRiesgoColor,
  Moneda
} from '../types/wizard.types';

// ═══════════════════════════════════════════════════════════════
// PANEL DE ANÁLISIS CORTEX-RISK
// ═══════════════════════════════════════════════════════════════

const AnalisisCortexRisk: React.FC<{
  analisis: WizardContratoState['analisisRiesgo'];
  anunciante: WizardContratoState['anunciante'];
  isLoading: boolean;
}> = ({ analisis, anunciante, isLoading }) => {
  if (!anunciante) {
    return (
      <div className="p-8 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 text-center">
        <Shield className="w-12 h-12 mx-auto mb-3 text-slate-300" />
        <p className="text-slate-400">Seleccione un anunciante para ver el análisis de riesgo</p>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="p-8 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <RefreshCw className="w-10 h-10 mx-auto mb-3 text-indigo-500" />
        </motion.div>
        <p className="text-indigo-600 font-medium">Analizando riesgo crediticio...</p>
        <p className="text-sm text-indigo-400 mt-1">Cortex-AI procesando datos</p>
      </div>
    );
  }
  
  // Usar datos del anunciante si no hay análisis
  const data = analisis || {
    score: anunciante.scoreRiesgo,
    maxScore: 1000,
    nivelRiesgo: anunciante.nivelRiesgo,
    factoresPositivos: ['Historial de pagos excelente', 'Cliente establecido', 'Industria estable'],
    factoresNegativos: [],
    recomendaciones: anunciante.terminosPreferenciales,
    indicadores: {
      historialPagos: 100,
      tendenciaFacturacion: 'estable' as const,
      industria: 'estable' as const,
      contratosExitosos: anunciante.historialContratos.exitosos
    },
    fechaActualizacion: new Date(),
    confianza: 95
  };
  
  const scorePercentage = (data.score / data.maxScore) * 100;
  
  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 shadow-[8px_8px_24px_rgba(0,0,0,0.08),-8px_-8px_24px_rgba(255,255,255,0.9)] overflow-hidden">
      {/* Header */}
      <div className="p-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/20">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Análisis Cortex-Risk</h3>
              <p className="text-sm text-white/80">{anunciante.nombre}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-black">{data.score}</p>
            <p className="text-xs text-white/70">de {data.maxScore} puntos</p>
          </div>
        </div>
      </div>
      
      {/* Score visual */}
      <div className="p-5">
        <div className="relative h-4 bg-slate-200 rounded-full overflow-hidden mb-4">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${scorePercentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full rounded-full bg-gradient-to-r ${getNivelRiesgoColor(data.nivelRiesgo)}`}
          />
        </div>
        
        {/* Indicadores */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          <div className="text-center p-3 bg-white rounded-xl shadow-sm">
            <p className="text-lg font-bold text-emerald-600">{data.indicadores.historialPagos}%</p>
            <p className="text-xs text-slate-500">Pagos Puntuales</p>
          </div>
          <div className="text-center p-3 bg-white rounded-xl shadow-sm">
            <div className="flex items-center justify-center gap-1">
              {data.indicadores.tendenciaFacturacion === 'creciente' && <TrendingUp className="w-4 h-4 text-emerald-500" />}
              {data.indicadores.tendenciaFacturacion === 'decreciente' && <TrendingDown className="w-4 h-4 text-red-500" />}
              <p className="text-lg font-bold text-slate-700 capitalize">{data.indicadores.tendenciaFacturacion}</p>
            </div>
            <p className="text-xs text-slate-500">Tendencia</p>
          </div>
          <div className="text-center p-3 bg-white rounded-xl shadow-sm">
            <p className="text-lg font-bold text-blue-600">{data.indicadores.contratosExitosos}</p>
            <p className="text-xs text-slate-500">Contratos OK</p>
          </div>
          <div className="text-center p-3 bg-white rounded-xl shadow-sm">
            <p className="text-lg font-bold text-purple-600">{data.confianza}%</p>
            <p className="text-xs text-slate-500">Confianza IA</p>
          </div>
        </div>
        
        {/* Factores */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-emerald-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Factores Positivos
            </h4>
            {data.factoresPositivos.map((factor, i) => (
              <div key={`${factor}-${i}`} className="flex items-center gap-2 text-sm text-slate-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {factor}
              </div>
            ))}
          </div>
          {data.factoresNegativos.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-amber-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Factores de Riesgo
              </h4>
              {data.factoresNegativos.map((factor, i) => (
                <div key={`${factor}-${i}`} className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  {factor}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Recomendaciones */}
      <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-t border-indigo-100">
        <h4 className="text-sm font-semibold text-indigo-700 mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4" />
          Recomendaciones Automáticas
        </h4>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-2 bg-white rounded-lg">
            <p className="text-lg font-bold text-indigo-600">{'diasPago' in data.recomendaciones ? data.recomendaciones.diasPago : data.recomendaciones.terminosPago} días</p>
            <p className="text-xs text-slate-500">Plazo Máximo</p>
          </div>
          <div className="p-2 bg-white rounded-lg">
            <p className="text-lg font-bold text-emerald-600">{data.recomendaciones.descuentoMaximo}%</p>
            <p className="text-xs text-slate-500">Descuento Máx</p>
          </div>
          <div className="p-2 bg-white rounded-lg">
            <p className="text-lg font-bold text-purple-600">${(data.recomendaciones.limiteCredito / 1000000).toFixed(0)}M</p>
            <p className="text-xs text-slate-500">Límite Crédito</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTES DE FORMULARIO
// ═══════════════════════════════════════════════════════════════

const CurrencyInput: React.FC<{
  label: string;
  value: number;
  onChange: (value: number) => void;
  moneda: Moneda;
  required?: boolean;
}> = ({ label, value, onChange, moneda, required }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-slate-600">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
      <input
        type="number"
        value={value || ''}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        aria-label={label}
        className="
          w-full rounded-xl py-3.5 pl-12 pr-16 bg-slate-50
          shadow-[inset_4px_4px_8px_rgba(0,0,0,0.06),inset_-4px_-4px_8px_rgba(255,255,255,0.8)]
          border-2 border-transparent
          outline-none focus:ring-2 focus:ring-indigo-400/50
          text-slate-700 font-medium text-lg
          transition-all duration-200
        "
        placeholder="0"
      />
      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
        {moneda}
      </span>
    </div>
  </div>
);

const PercentageInput: React.FC<{
  label: string;
  value: number;
  onChange: (value: number) => void;
  max?: number;
}> = ({ label, value, onChange, max = 100 }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-slate-600">{label}</label>
    <div className="relative">
      <Percent className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
      <input
        type="number"
        min={0}
        max={max}
        value={value || ''}
        onChange={(e) => onChange(Math.min(parseFloat(e.target.value) || 0, max))}
        aria-label={label}
        className="
          w-full rounded-xl py-3.5 pl-12 pr-4 bg-slate-50
          shadow-[inset_4px_4px_8px_rgba(0,0,0,0.06),inset_-4px_-4px_8px_rgba(255,255,255,0.8)]
          border-2 border-transparent
          outline-none focus:ring-2 focus:ring-indigo-400/50
          text-slate-700
          transition-all duration-200
        "
        placeholder="0"
      />
    </div>
  </div>
);

const SelectInput: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}> = ({ label, value, onChange, options }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-slate-600">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="
        w-full rounded-xl py-3.5 px-4 bg-slate-50
        shadow-[inset_4px_4px_8px_rgba(0,0,0,0.06),inset_-4px_-4px_8px_rgba(255,255,255,0.8)]
        border-2 border-transparent
        outline-none focus:ring-2 focus:ring-indigo-400/50
        text-slate-700
        transition-all duration-200
        appearance-none cursor-pointer
      "
    >
      {options.map(opt => (
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
}> = ({ label, value, onChange, min = 0, max = 999, icon: Icon, suffix }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-slate-600">{label}</label>
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
      )}
      <input
        type="number"
        min={min}
        max={max}
        value={value || ''}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        aria-label={label}
        className={`
          w-full rounded-xl py-3.5 bg-slate-50
          shadow-[inset_4px_4px_8px_rgba(0,0,0,0.06),inset_-4px_-4px_8px_rgba(255,255,255,0.8)]
          border-2 border-transparent
          outline-none focus:ring-2 focus:ring-indigo-400/50
          text-slate-700
          transition-all duration-200
          ${Icon ? 'pl-12' : 'pl-4'} ${suffix ? 'pr-16' : 'pr-4'}
        `}
      />
      {suffix && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
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
  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.04)]">
    <div>
      <p className="font-medium text-slate-700">{label}</p>
      {description && <p className="text-sm text-slate-400">{description}</p>}
    </div>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`
        w-14 h-8 rounded-full transition-all duration-200 relative
        ${checked ? 'bg-gradient-to-r from-indigo-500 to-purple-600' : 'bg-slate-300'}
      `}
    >
      <motion.span 
        className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"
        animate={{ left: checked ? '1.75rem' : '0.25rem' }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </button>
  </div>
);

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

interface StepTerminosComercialesProps {
  state: WizardContratoState;
  dispatch: React.Dispatch<WizardAction>;
}

export const StepTerminosComerciales: React.FC<StepTerminosComercialesProps> = ({
  state,
  dispatch
}) => {
  // Recalcular valor neto cuando cambia bruto o descuento
  useEffect(() => {
    const valorNeto = calcularValorNeto(state.valorBruto, state.descuentoPorcentaje);
    if (valorNeto !== state.valorNeto) {
      dispatch({ type: 'SET_VALORES', payload: { bruto: state.valorBruto, descuento: state.descuentoPorcentaje } });
    }
  }, [state.valorBruto, state.descuentoPorcentaje, state.valorNeto, dispatch]);
  
  return (
    <div className="space-y-8">
      {/* Título del paso */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100">
          <DollarSign className="w-7 h-7 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Términos Comerciales</h2>
          <p className="text-slate-500">Configure valores, descuentos y condiciones de pago</p>
        </div>
      </div>
      
      {/* Panel de análisis de riesgo */}
      <AnalisisCortexRisk
        analisis={state.analisisRiesgo}
        anunciante={state.anunciante}
        isLoading={state.isLoading}
      />
      
      {/* Valores del contrato */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 shadow-[8px_8px_24px_rgba(0,0,0,0.08),-8px_-8px_24px_rgba(255,255,255,0.9)]">
        <h3 className="text-lg font-semibold text-slate-700 mb-5 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-indigo-500" />
          Valores del Contrato
        </h3>
        
        <div className="grid md:grid-cols-3 gap-6">
          <CurrencyInput
            label="Valor Bruto"
            value={state.valorBruto}
            onChange={(value) => dispatch({ type: 'SET_VALORES', payload: { bruto: value, descuento: state.descuentoPorcentaje } })}
            moneda={state.moneda}
            required
          />
          
          <PercentageInput
            label="Descuento"
            value={state.descuentoPorcentaje}
            onChange={(value) => dispatch({ type: 'SET_VALORES', payload: { bruto: state.valorBruto, descuento: value } })}
            max={state.anunciante?.terminosPreferenciales.descuentoMaximo || 30}
          />
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-600">Valor Neto</label>
            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
              <p className="text-2xl font-bold text-emerald-700">
                {formatCurrency(state.valorNeto, state.moneda)}
              </p>
              <p className="text-xs text-emerald-600">
                Ahorro: {formatCurrency(state.valorBruto - state.valorNeto, state.moneda)}
              </p>
            </div>
          </div>
        </div>
        
        {/* Selector de moneda */}
        <div className="mt-4 grid md:grid-cols-4 gap-4">
          <SelectInput
            label="Moneda"
            value={state.moneda}
            onChange={(value) => dispatch({ type: 'SET_MONEDA', payload: value as Moneda })}
            options={[
              { value: 'CLP', label: 'Peso Chileno (CLP)' },
              { value: 'USD', label: 'Dólar (USD)' },
              { value: 'UF', label: 'UF' }
            ]}
          />
        </div>
      </div>
      
      {/* Términos de pago */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 shadow-[8px_8px_24px_rgba(0,0,0,0.08),-8px_-8px_24px_rgba(255,255,255,0.9)]">
        <h3 className="text-lg font-semibold text-slate-700 mb-5 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-500" />
          Términos de Pago
        </h3>
        
        <div className="grid md:grid-cols-3 gap-6">
          <NumberInput
            label="Días de Pago"
            value={state.terminosPago.diasPago}
            onChange={(value) => dispatch({ type: 'SET_TERMINOS_PAGO', payload: { diasPago: value } })}
            min={1}
            max={90}
            icon={Calendar}
            suffix="días"
          />
          
          <SelectInput
            label="Modalidad de Facturación"
            value={state.terminosPago.modalidad}
            onChange={(value) => dispatch({ type: 'SET_TERMINOS_PAGO', payload: { modalidad: value as 'hitos' | 'cuotas' } })}
            options={[
              { value: 'cuotas', label: 'Por Cuotas' },
              { value: 'hitos', label: 'Por Hitos' }
            ]}
          />
          
          <SelectInput
            label="Tipo de Factura"
            value={state.terminosPago.tipoFactura}
            onChange={(value) => dispatch({ type: 'SET_TERMINOS_PAGO', payload: { tipoFactura: value as 'posterior' | 'adelantado' } })}
            options={[
              { value: 'posterior', label: 'Posterior al servicio' },
              { value: 'adelantado', label: 'Adelantado' }
            ]}
          />
        </div>
        
        {state.terminosPago.modalidad === 'cuotas' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4"
          >
            <NumberInput
              label="Número de Cuotas"
              value={state.terminosPago.numeroCuotas || 1}
              onChange={(value) => dispatch({ type: 'SET_TERMINOS_PAGO', payload: { numeroCuotas: value } })}
              min={1}
              max={12}
              suffix="cuotas"
            />
          </motion.div>
        )}
      </div>
      
      {/* Opciones especiales */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 shadow-[8px_8px_24px_rgba(0,0,0,0.08),-8px_-8px_24px_rgba(255,255,255,0.9)]">
        <h3 className="text-lg font-semibold text-slate-700 mb-5 flex items-center gap-2">
          <Info className="w-5 h-5 text-indigo-500" />
          Opciones Especiales
        </h3>
        
        <div className="space-y-4">
          <Toggle
            label="Contrato de Canje"
            description="Incluye servicios intercambiados"
            checked={state.esCanje}
            onChange={(checked) => dispatch({ type: 'SET_CANJE', payload: { esCanje: checked, porcentaje: checked ? state.porcentajeCanje : 0 } })}
          />
          
          {state.esCanje && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              <PercentageInput
                label="Porcentaje de Canje"
                value={state.porcentajeCanje}
                onChange={(value) => dispatch({ type: 'SET_CANJE', payload: { esCanje: true, porcentaje: value } })}
                max={100}
              />
            </motion.div>
          )}
          
          {state.anunciante?.esAgencia && (
            <>
              <Toggle
                label="Facturar Comisión de Agencia"
                description="Generar factura separada por comisión"
                checked={state.facturarComisionAgencia}
                onChange={(checked) => dispatch({ type: 'SET_COMISION_AGENCIA', payload: { comision: state.comisionAgencia, facturar: checked } })}
              />
              
              {state.facturarComisionAgencia && (
                <PercentageInput
                  label="Porcentaje de Comisión"
                  value={state.comisionAgencia}
                  onChange={(value) => dispatch({ type: 'SET_COMISION_AGENCIA', payload: { comision: value, facturar: true } })}
                  max={30}
                />
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Resumen de valores */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg">Resumen del Contrato</h3>
            <p className="text-white/70 text-sm">Valores calculados automáticamente</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-white/70">Valor Total Neto</p>
            <p className="text-4xl font-black">{formatCurrency(state.valorNeto, state.moneda)}</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-white/20 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-white/70 text-xs">Plazo Pago</p>
            <p className="font-bold">{state.terminosPago.diasPago} días</p>
          </div>
          <div>
            <p className="text-white/70 text-xs">Descuento</p>
            <p className="font-bold">{state.descuentoPorcentaje}%</p>
          </div>
          <div>
            <p className="text-white/70 text-xs">Cuotas</p>
            <p className="font-bold">{state.terminosPago.numeroCuotas || 1}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default StepTerminosComerciales;
