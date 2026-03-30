/**
 * ✅ SILEXAR PULSE - Paso 4: Aprobaciones TIER 0
 * 
 * @description Cuarto paso del wizard - Configuración del flujo
 * de aprobaciones multinivel automático.
 * 
 * @version 2025.3.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  Shield,
  Zap,
  ArrowRight,
  Bell,
  Settings,
  RefreshCw,
  CheckCheck
} from 'lucide-react';
import { 
  WizardContratoState, 
  WizardAction,
  NivelAprobacion,
  formatCurrency
} from '../types/wizard.types';

// ═══════════════════════════════════════════════════════════════
// COMPONENTE DE NIVEL DE APROBACIÓN
// ═══════════════════════════════════════════════════════════════

const NivelAprobacionCard: React.FC<{
  nivel: NivelAprobacion;
  esRequerido: boolean;
  titulo: string;
  descripcion: string;
}> = ({ nivel, esRequerido, titulo, descripcion }) => {
  const getNivelColor = () => {
    if (!esRequerido) return 'from-slate-200 to-slate-300';
    switch (nivel) {
      case 'automatico': return 'from-emerald-400 to-emerald-500';
      case 'supervisor': return 'from-blue-400 to-blue-500';
      case 'gerente_comercial': return 'from-purple-400 to-purple-500';
      case 'gerente_general': return 'from-orange-400 to-orange-500';
      case 'directorio': return 'from-red-400 to-red-500';
      default: return 'from-slate-400 to-slate-500';
    }
  };
  
  return (
    <div className={`
      relative flex items-center gap-3 p-4
      ${esRequerido ? 'opacity-100' : 'opacity-40'}
    `}>
      <div className={`
        w-12 h-12 rounded-xl bg-gradient-to-br ${getNivelColor()}
        flex items-center justify-center text-white shadow-lg
      `}>
        {esRequerido ? (
          <CheckCircle2 className="w-6 h-6" />
        ) : (
          <div className="w-3 h-3 rounded-full bg-white/50" />
        )}
      </div>
      <div className="flex-1">
        <h4 className={`font-medium ${esRequerido ? 'text-slate-800' : 'text-slate-400'}`}>
          {titulo}
        </h4>
        <p className={`text-sm ${esRequerido ? 'text-slate-500' : 'text-slate-300'}`}>
          {descripcion}
        </p>
      </div>
      {esRequerido && nivel !== 'automatico' && (
        <ArrowRight className="w-5 h-5 text-slate-300" />
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// VISUALIZACIÓN DEL FLUJO
// ═══════════════════════════════════════════════════════════════

const FlujoAprobacionVisual: React.FC<{
  flujo: WizardContratoState['flujoAprobacion'];
}> = ({ flujo }) => {
  if (!flujo) return null;
  
  const niveles: { nivel: NivelAprobacion; titulo: string; descripcion: string }[] = [
    { nivel: 'automatico', titulo: 'Aprobación Automática', descripcion: 'Sin intervención requerida' },
    { nivel: 'supervisor', titulo: 'Supervisor', descripcion: 'Límite 2 horas' },
    { nivel: 'gerente_comercial', titulo: 'Gerente Comercial', descripcion: 'Límite 4 horas' },
    { nivel: 'gerente_general', titulo: 'Gerente General', descripcion: 'Límite 24 horas' },
    { nivel: 'directorio', titulo: 'Directorio', descripcion: 'Límite 48 horas' },
  ];
  
  const nivelIndex = niveles.findIndex(n => n.nivel === flujo.nivelRequerido);
  
  return (
    <div className="space-y-1">
      {niveles.map((nivel, idx) => (
        <NivelAprobacionCard
          key={nivel.nivel}
          nivel={nivel.nivel}
          esRequerido={idx <= nivelIndex}
          titulo={nivel.titulo}
          descripcion={nivel.descripcion}
        />
      ))}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// LISTA DE APROBADORES
// ═══════════════════════════════════════════════════════════════

const AprobadoresList: React.FC<{
  aprobadores: WizardContratoState['flujoAprobacion'];
}> = ({ aprobadores }) => {
  if (!aprobadores || aprobadores.aprobadores.length === 0) {
    return (
      <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
        <CheckCheck className="w-12 h-12 mx-auto mb-3 text-emerald-500" />
        <h4 className="font-semibold text-emerald-800">Aprobación Automática</h4>
        <p className="text-sm text-emerald-600 mt-1">
          Este contrato no requiere aprobaciones adicionales
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {aprobadores.aprobadores.map((aprobador, idx) => (
        <motion.div
          key={aprobador.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="flex items-center justify-between p-4 rounded-xl bg-white border border-slate-200 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold">
              {aprobador.nombre.charAt(0)}
            </div>
            <div>
              <h4 className="font-medium text-slate-800">{aprobador.nombre}</h4>
              <p className="text-sm text-slate-500">{aprobador.cargo}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="flex items-center gap-1 text-sm text-slate-500">
                <Clock className="w-4 h-4" />
                <span>
                  {new Date(aprobador.tiempoLimite).toLocaleTimeString('es-CL', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
              <p className="text-xs text-slate-400">Tiempo límite</p>
            </div>
            <div className={`
              px-3 py-1.5 rounded-lg text-xs font-medium
              ${aprobador.estado === 'pendiente' ? 'bg-amber-100 text-amber-700' : ''}
              ${aprobador.estado === 'aprobado' ? 'bg-emerald-100 text-emerald-700' : ''}
              ${aprobador.estado === 'rechazado' ? 'bg-red-100 text-red-700' : ''}
            `}>
              {aprobador.estado.charAt(0).toUpperCase() + aprobador.estado.slice(1)}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// TOGGLE COMPONENTE
// ═══════════════════════════════════════════════════════════════

const Toggle: React.FC<{
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  icon?: React.ElementType;
}> = ({ label, description, checked, onChange, icon: Icon }) => (
  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.04)]">
    <div className="flex items-center gap-3">
      {Icon && <Icon className="w-5 h-5 text-indigo-500" />}
      <div>
        <p className="font-medium text-slate-700">{label}</p>
        {description && <p className="text-sm text-slate-400">{description}</p>}
      </div>
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

interface StepAprobacionesProps {
  state: WizardContratoState;
  dispatch: React.Dispatch<WizardAction>;
  calcularFlujoAprobacion: () => void;
}

export const StepAprobaciones: React.FC<StepAprobacionesProps> = ({
  state,
  dispatch,
  calcularFlujoAprobacion
}) => {
  // Calcular flujo automáticamente cuando se carga el paso
  useEffect(() => {
    if (!state.flujoAprobacion) {
      calcularFlujoAprobacion();
    }
  }, [state.flujoAprobacion, calcularFlujoAprobacion]);
  
  const getMotivoNivel = () => {
    if (!state.flujoAprobacion) return '';
    switch (state.flujoAprobacion.nivelRequerido) {
      case 'automatico':
        return 'El contrato cumple todos los criterios para aprobación automática';
      case 'supervisor':
        return 'Valor o condiciones requieren revisión de supervisor';
      case 'gerente_comercial':
        return 'Valor del contrato o descuento requiere aprobación de Gerente Comercial';
      case 'gerente_general':
        return 'Contrato de alto valor requiere aprobación de Gerente General';
      case 'directorio':
        return 'Contrato estratégico requiere aprobación del Directorio';
      default:
        return '';
    }
  };
  
  return (
    <div className="space-y-8">
      {/* Título del paso */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100">
          <CheckCircle2 className="w-7 h-7 text-amber-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Flujo de Aprobaciones</h2>
          <p className="text-slate-500">Configure el proceso de aprobación del contrato</p>
        </div>
      </div>
      
      {/* Resumen del contrato */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.04)]">
        <div className="grid grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-slate-500">Valor del Contrato</p>
            <p className="text-xl font-bold text-indigo-600">{formatCurrency(state.valorNeto)}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Descuento Aplicado</p>
            <p className="text-xl font-bold text-purple-600">{state.descuentoPorcentaje}%</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Términos de Pago</p>
            <p className="text-xl font-bold text-emerald-600">{state.terminosPago.diasPago} días</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Cliente</p>
            <p className="text-xl font-bold text-slate-700">
              {state.anunciante?.historialContratos && state.anunciante.historialContratos.total > 0 
                ? 'Recurrente' 
                : 'Nuevo'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Nivel de aprobación requerido */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white shadow-[8px_8px_24px_rgba(0,0,0,0.08),-8px_-8px_24px_rgba(255,255,255,0.9)]">
          <div className="flex items-center gap-3 mb-5">
            <Shield className="w-6 h-6 text-indigo-500" />
            <h3 className="text-lg font-semibold text-slate-800">Nivel de Aprobación</h3>
          </div>
          
          <FlujoAprobacionVisual flujo={state.flujoAprobacion} />
          
          {/* Motivo */}
          <div className="mt-4 p-3 rounded-lg bg-indigo-50 border border-indigo-100">
            <p className="text-sm text-indigo-700">
              <Zap className="w-4 h-4 inline mr-1" />
              {getMotivoNivel()}
            </p>
          </div>
          
          <button
            onClick={calcularFlujoAprobacion}
            className="mt-4 w-full py-2 text-sm text-indigo-600 font-medium hover:bg-indigo-50 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Recalcular Nivel
          </button>
        </div>
        
        {/* Aprobadores */}
        <div className="p-6 rounded-2xl bg-white shadow-[8px_8px_24px_rgba(0,0,0,0.08),-8px_-8px_24px_rgba(255,255,255,0.9)]">
          <div className="flex items-center gap-3 mb-5">
            <User className="w-6 h-6 text-purple-500" />
            <h3 className="text-lg font-semibold text-slate-800">Aprobadores Asignados</h3>
          </div>
          
          <AprobadoresList aprobadores={state.flujoAprobacion} />
        </div>
      </div>
      
      {/* Configuración de notificaciones */}
      <div className="p-6 rounded-2xl bg-white shadow-[8px_8px_24px_rgba(0,0,0,0.08),-8px_-8px_24px_rgba(255,255,255,0.9)]">
        <div className="flex items-center gap-3 mb-5">
          <Settings className="w-6 h-6 text-slate-500" />
          <h3 className="text-lg font-semibold text-slate-800">Configuración del Flujo</h3>
        </div>
        
        <div className="space-y-4">
          <Toggle
            label="Notificaciones Push"
            description="Enviar alertas a aprobadores por email y móvil"
            checked={state.notificacionesConfiguradas}
            onChange={(checked) => dispatch({ type: 'SET_NOTIFICACIONES', payload: checked })}
            icon={Bell}
          />
          
          <Toggle
            label="Escalamiento Automático"
            description="Escalar automáticamente si no hay respuesta en el tiempo límite"
            checked={state.escalamientoAutomatico}
            onChange={(checked) => dispatch({ type: 'SET_ESCALAMIENTO_AUTO', payload: checked })}
            icon={Zap}
          />
        </div>
      </div>
      
      {/* Advertencia si hay muchos niveles */}
      {state.flujoAprobacion && state.flujoAprobacion.aprobadores.length >= 3 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-2xl bg-amber-50 border border-amber-200"
        >
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-800 mb-1">Proceso de Aprobación Extenso</h4>
              <p className="text-sm text-amber-700">
                Este contrato requiere {state.flujoAprobacion.aprobadores.length} niveles de aprobación, 
                lo que podría demorar hasta {state.flujoAprobacion.aprobadores.length * 24}+ horas. 
                Considere revisar los términos si necesita una aprobación más rápida.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default StepAprobaciones;
