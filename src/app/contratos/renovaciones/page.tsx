/**
 * 🔮 SILEXAR PULSE - Renewals Dashboard TIER 0
 * 
 * @description Dashboard de renovaciones con motor predictivo,
 * análisis de factores y acciones automáticas.
 * 
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import React, { useState, useMemo } from 'react';
import { formatCurrency } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Calendar,
  Phone,
  Mail,
  ChevronDown,
  Target,
  Send,
  FileText,
  AlertCircle,
  XCircle,
  Brain
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

type NivelProbabilidad = 'ALTA' | 'MEDIA' | 'BAJA' | 'CRITICA';

interface ContratoRenovacion {
  id: string;
  clienteNombre: string;
  fechaVencimiento: Date;
  valorActual: number;
  probabilidadRenovacion: number;
  nivelProbabilidad: NivelProbabilidad;
  accionRecomendada: string;
  factores: { nombre: string; valor: number; impacto: 'positivo' | 'negativo' | 'neutro' }[];
}

// ═══════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════

const mockContratos: ContratoRenovacion[] = [
  {
    id: '1', clienteNombre: 'SuperMax', fechaVencimiento: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    valorActual: 125000000, probabilidadRenovacion: 92, nivelProbabilidad: 'ALTA',
    accionRecomendada: 'Contactar 7 días antes con oferta mejorada',
    factores: [
      { nombre: 'Performance Campaña', valor: 95, impacto: 'positivo' },
      { nombre: 'Satisfacción (NPS)', valor: 85, impacto: 'positivo' },
      { nombre: 'Historial', valor: 100, impacto: 'positivo' }
    ]
  },
  {
    id: '2', clienteNombre: 'Banco XYZ', fechaVencimiento: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    valorActual: 85000000, probabilidadRenovacion: 88, nivelProbabilidad: 'ALTA',
    accionRecomendada: 'Proponer extensión anual con descuento 5%',
    factores: [
      { nombre: 'Performance Campaña', valor: 88, impacto: 'positivo' },
      { nombre: 'Competencia', valor: 50, impacto: 'neutro' }
    ]
  },
  {
    id: '3', clienteNombre: 'AutoMax', fechaVencimiento: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
    valorActual: 45000000, probabilidadRenovacion: 65, nivelProbabilidad: 'MEDIA',
    accionRecomendada: 'Reunión presencial + análisis de competencia',
    factores: [
      { nombre: 'Performance', valor: 70, impacto: 'neutro' },
      { nombre: 'Competencia', valor: 70, impacto: 'negativo' }
    ]
  },
  {
    id: '4', clienteNombre: 'TechCorp', fechaVencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    valorActual: 95000000, probabilidadRenovacion: 35, nivelProbabilidad: 'CRITICA',
    accionRecomendada: 'Intervención gerencial + oferta defensiva',
    factores: [
      { nombre: 'Performance', valor: 55, impacto: 'negativo' },
      { nombre: 'NPS', valor: 50, impacto: 'negativo' },
      { nombre: 'Competencia', valor: 90, impacto: 'negativo' }
    ]
  }
];

const factoresIA = [
  'Performance de campaña actual',
  'Satisfacción del cliente (NPS)',
  'Actividad de competencia',
  'Ciclo presupuestario del cliente',
  'Historial de renovaciones similar',
  'Cambios en el equipo del cliente'
];

// ═══════════════════════════════════════════════════════════════
// COMPONENTES AUXILIARES
// ═══════════════════════════════════════════════════════════════

const formatDias = (fecha: Date) => {
  const dias = Math.ceil((fecha.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return dias;
};

const ContratoRenovacionCard: React.FC<{
  contrato: ContratoRenovacion;
  expandido: boolean;
  onToggle: () => void;
}> = ({ contrato, expandido, onToggle }) => {
  const nivelConfig = {
    ALTA: { bg: 'bg-green-50', border: 'border-green-200', icon: <CheckCircle2 className="w-5 h-5 text-green-500" />, label: '✅ Alta Probabilidad' },
    MEDIA: { bg: 'bg-amber-50', border: 'border-amber-200', icon: <AlertTriangle className="w-5 h-5 text-amber-500" />, label: '⚠️ Riesgo Medio' },
    BAJA: { bg: 'bg-orange-50', border: 'border-orange-200', icon: <AlertCircle className="w-5 h-5 text-orange-500" />, label: '🟠 Riesgo Alto' },
    CRITICA: { bg: 'bg-red-50', border: 'border-red-200', icon: <XCircle className="w-5 h-5 text-red-500" />, label: '❌ Riesgo Crítico' }
  }[contrato.nivelProbabilidad];

  const diasRestantes = formatDias(contrato.fechaVencimiento);

  return (
    <motion.div layout className={`rounded-xl border-2 overflow-hidden ${nivelConfig.bg} ${nivelConfig.border}`}>
      <button onClick={onToggle} className="w-full p-4 text-left">
        <div className="flex items-start gap-4">
          {nivelConfig.icon}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-bold text-slate-800">{contrato.clienteNombre}</h4>
              <span className="text-sm text-slate-500">• Vence: {diasRestantes} días</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="font-bold text-slate-700">Prob: {contrato.probabilidadRenovacion}%</span>
              <span className="text-slate-600">Valor: {formatCurrency(contrato.valorActual)}</span>
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${expandido ? 'rotate-180' : ''}`} />
        </div>
        <div className="mt-2 flex items-center gap-2">
          <Target className="w-4 h-4 text-indigo-500" />
          <span className="text-sm text-indigo-700 font-medium">🎯 Acción: {contrato.accionRecomendada}</span>
        </div>
      </button>

      <AnimatePresence>
        {expandido && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-slate-200 p-4 bg-white"
          >
            {/* Factores */}
            <div className="mb-4">
              <p className="text-sm font-semibold text-slate-700 mb-2">Factores analizados:</p>
              <div className="space-y-2">
                {contrato.factores.map((f, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">{f.nombre}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            f.impacto === 'positivo' ? 'bg-green-500' :
                            f.impacto === 'negativo' ? 'bg-red-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${f.valor}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-slate-700 w-10">{f.valor}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Acciones */}
            <div className="flex gap-2">
              <button className="flex-1 py-2 rounded-lg bg-indigo-100 text-indigo-700 font-medium flex items-center justify-center gap-1 text-sm">
                <Phone className="w-4 h-4" />
                Contactar
              </button>
              <button className="flex-1 py-2 rounded-lg bg-purple-100 text-purple-700 font-medium flex items-center justify-center gap-1 text-sm">
                <FileText className="w-4 h-4" />
                Propuesta
              </button>
              <button className="flex-1 py-2 rounded-lg bg-green-100 text-green-700 font-medium flex items-center justify-center gap-1 text-sm">
                <Mail className="w-4 h-4" />
                Email
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function RenovacionesDashboard() {
  const [contratos] = useState<ContratoRenovacion[]>(mockContratos);
  const [contratoExpandido, setContratoExpandido] = useState<string | null>(null);

  const contratosAgrupados = useMemo(() => ({
    ALTA: contratos.filter(c => c.nivelProbabilidad === 'ALTA'),
    MEDIA: contratos.filter(c => c.nivelProbabilidad === 'MEDIA'),
    BAJA: contratos.filter(c => c.nivelProbabilidad === 'BAJA'),
    CRITICA: contratos.filter(c => c.nivelProbabilidad === 'CRITICA')
  }), [contratos]);

  const valorTotal = contratos.reduce((acc, c) => acc + c.valorActual, 0);
  const valorEnRiesgo = contratos.filter(c => c.probabilidadRenovacion < 70).reduce((acc, c) => acc + c.valorActual, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-purple-50/30">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-[1400px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg">
                <RefreshCw className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">🔮 Motor Predictivo de Renovaciones</h1>
                <p className="text-slate-500 text-sm">Cortex-Flow • Análisis en tiempo real</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 rounded-xl bg-indigo-100 text-indigo-700 font-medium flex items-center gap-2">
                <Target className="w-4 h-4" />
                Generar Plan Acción
              </button>
              <button className="px-4 py-2 rounded-xl bg-purple-100 text-purple-700 font-medium flex items-center gap-2">
                <Send className="w-4 h-4" />
                Alertar Ejecutivos
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-6">
        {/* Métricas */}
        <div className="grid md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-indigo-500" />
              <span className="text-sm text-slate-600">Próximos a vencer (30d)</span>
            </div>
            <p className="text-3xl font-bold text-slate-800">{contratos.length}</p>
          </div>
          <div className="p-4 rounded-xl bg-white border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              <span className="text-sm text-slate-600">Valor Total</span>
            </div>
            <p className="text-3xl font-bold text-slate-800">{formatCurrency(valorTotal)}</p>
          </div>
          <div className="p-4 rounded-xl bg-white border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span className="text-sm text-slate-600">Valor en Riesgo</span>
            </div>
            <p className="text-3xl font-bold text-amber-600">{formatCurrency(valorEnRiesgo)}</p>
          </div>
          <div className="p-4 rounded-xl bg-white border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              <span className="text-sm text-slate-600">Tasa Renovación Histórica</span>
            </div>
            <p className="text-3xl font-bold text-emerald-600">78%</p>
          </div>
        </div>

        {/* Panel de Análisis */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 text-white">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-6 h-6 text-amber-400" />
            <h2 className="text-lg font-bold">🤖 FACTORES ANALIZADOS POR IA</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            {factoresIA.map((factor, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-white/10">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span className="text-sm">{factor}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Contratos por nivel */}
        <div className="space-y-6">
          {/* Alta Probabilidad */}
          {contratosAgrupados.ALTA.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-green-700 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                ✅ ALTA PROBABILIDAD RENOVACIÓN (85%+)
              </h3>
              <div className="space-y-3">
                {contratosAgrupados.ALTA.map(contrato => (
                  <ContratoRenovacionCard
                    key={contrato.id}
                    contrato={contrato}
                    expandido={contratoExpandido === contrato.id}
                    onToggle={() => setContratoExpandido(contratoExpandido === contrato.id ? null : contrato.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Riesgo Medio */}
          {contratosAgrupados.MEDIA.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-amber-700 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                ⚠️ RIESGO MEDIO (50-70%)
              </h3>
              <div className="space-y-3">
                {contratosAgrupados.MEDIA.map(contrato => (
                  <ContratoRenovacionCard
                    key={contrato.id}
                    contrato={contrato}
                    expandido={contratoExpandido === contrato.id}
                    onToggle={() => setContratoExpandido(contratoExpandido === contrato.id ? null : contrato.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Riesgo Alto/Crítico */}
          {(contratosAgrupados.BAJA.length > 0 || contratosAgrupados.CRITICA.length > 0) && (
            <div>
              <h3 className="text-lg font-bold text-red-700 mb-3 flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                ❌ RIESGO ALTO/CRÍTICO (&lt;50%)
              </h3>
              <div className="space-y-3">
                {[...contratosAgrupados.BAJA, ...contratosAgrupados.CRITICA].map(contrato => (
                  <ContratoRenovacionCard
                    key={contrato.id}
                    contrato={contrato}
                    expandido={contratoExpandido === contrato.id}
                    onToggle={() => setContratoExpandido(contratoExpandido === contrato.id ? null : contrato.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
