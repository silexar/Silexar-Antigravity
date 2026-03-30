/**
 * 🤖 SILEXAR PULSE - Predictive Analytics Dashboard TIER 0
 * 
 * @description Dashboard de análisis predictivo con Cortex-Flow,
 * insights automáticos y recomendaciones IA.
 * 
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  TrendingUp,
  Target,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
  RefreshCw,
  ChevronDown,
  BarChart3,
  Bell,
  Lightbulb,
  FileText,
  AlertCircle,
  Send
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface PrediccionesMes {
  probabilidadMeta: number;
  valorProbableCierre: number;
  metaMensual: number;
  contratosEnRiesgo: number;
  renovacionesProximas: number;
  probabilidadRenovacion: number;
}

interface InsightAutomatico {
  id: string;
  cliente: string;
  prediccion: string;
  probabilidad: number;
  tipo: 'positivo' | 'neutro' | 'advertencia';
  tiempoEstimado?: string;
}

interface RecomendacionIA {
  id: string;
  accion: string;
  cliente: string;
  prioridad: 'alta' | 'media' | 'baja';
  impactoEstimado: string;
  razon: string;
}

interface AlertaCritica {
  id: string;
  tipo: 'critica' | 'importante' | 'informativa';
  titulo: string;
  descripcion: string;
  responsable?: string;
  valor?: number;
  acciones: { icono: React.ReactNode; label: string; onClick: () => void }[];
  tiempoRestante?: string;
}

// ═══════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════

const mockPredicciones: PrediccionesMes = {
  probabilidadMeta: 87,
  valorProbableCierre: 1050000000,
  metaMensual: 1200000000,
  contratosEnRiesgo: 3,
  renovacionesProximas: 8,
  probabilidadRenovacion: 75
};

const mockInsights: InsightAutomatico[] = [
  { id: 'i-1', cliente: 'Banco XYZ', prediccion: '92% probabilidad firma en 24h', probabilidad: 92, tipo: 'positivo', tiempoEstimado: '24h' },
  { id: 'i-2', cliente: 'SuperMax', prediccion: 'Retrasará decisión 3-5 días (patrón histórico)', probabilidad: 78, tipo: 'neutro', tiempoEstimado: '3-5 días' },
  { id: 'i-3', cliente: 'AutoMax', prediccion: 'Solicitará descuento adicional', probabilidad: 78, tipo: 'advertencia' }
];

const mockRecomendaciones: RecomendacionIA[] = [
  { id: 'r-1', accion: 'Contactar HOY para acelerar firma', cliente: 'TechCorp', prioridad: 'alta', impactoEstimado: '+$95M', razon: 'Cliente activo, alta probabilidad cierre' },
  { id: 'r-2', accion: 'Preparar contra-oferta (descuento 12%)', cliente: 'AutoMax', prioridad: 'alta', impactoEstimado: '+$35M', razon: 'Predicción de solicitud de descuento' },
  { id: 'r-3', accion: 'Iniciar proceso renovación (vence en 30 días)', cliente: 'FarmaciaXYZ', prioridad: 'media', impactoEstimado: '+$45M', razon: 'Renovación automática próxima' }
];

const mockAlertasCriticas: AlertaCritica[] = [
  {
    id: 'a-1', tipo: 'critica', titulo: 'Banco XYZ: Aprobación vence en 2 horas',
    descripcion: 'Esperando: María Silva (Gerente)', responsable: 'María Silva', valor: 85000000,
    tiempoRestante: '2h',
    acciones: [
      { icono: <Phone className="w-4 h-4" />, label: 'Llamar', onClick: () => {} },
      { icono: <Mail className="w-4 h-4" />, label: 'Recordar', onClick: () => {} }
    ]
  },
  {
    id: 'a-2', tipo: 'critica', titulo: 'AutoMax: Cliente solicita cambios mayores',
    descripcion: 'Ejecutivo: Roberto Silva', responsable: 'Roberto Silva',
    acciones: [
      { icono: <FileText className="w-4 h-4" />, label: 'Revisar', onClick: () => {} },
      { icono: <Phone className="w-4 h-4" />, label: 'Negociar', onClick: () => {} }
    ]
  }
];

const mockAlertasImportantes: AlertaCritica[] = [
  { id: 'a-3', tipo: 'importante', titulo: 'TechCorp: Pendiente firma digital desde hace 24h', descripcion: 'Documento enviado sin respuesta', acciones: [] },
  { id: 'a-4', tipo: 'importante', titulo: 'SuperMax: Inventario reservado vence mañana', descripcion: 'Radio Corazón Prime - Reserva expira', acciones: [] },
  { id: 'a-5', tipo: 'importante', titulo: 'FarmaciaXYZ: Proceso renovación debe iniciarse', descripcion: 'Contrato vence en 30 días', acciones: [] },
  { id: 'a-6', tipo: 'importante', titulo: 'RetailPlus: Material creativo faltante bloquea aprobación', descripcion: 'Cuña de 30s pendiente de producción', acciones: [] },
  { id: 'a-7', tipo: 'importante', titulo: 'InmobiliariaABC: Términos de pago requieren validación', descripcion: 'Crédito 60 días requiere aprobación especial', acciones: [] }
];

const mockAlertasInformativas: AlertaCritica[] = [
  { id: 'a-8', tipo: 'informativa', titulo: '3 contratos próximos a vencer en 7 días', descripcion: '', acciones: [] },
  { id: 'a-9', tipo: 'informativa', titulo: '2 ejecutivos superaron meta mensual', descripcion: '', acciones: [] },
  { id: 'a-10', tipo: 'informativa', titulo: '5 renovaciones automáticas procesadas exitosamente', descripcion: '', acciones: [] }
];

// ═══════════════════════════════════════════════════════════════
// COMPONENTES AUXILIARES
// ═══════════════════════════════════════════════════════════════

const formatCurrency = (value: number) => {
  if (value >= 1000000000) return `$${(value / 1000000000).toFixed(2)}B`;
  if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
};

const MetricaCircular: React.FC<{
  valor: number;
  label: string;
  color: string;
  sublabel?: string;
}> = ({ valor, label, color, sublabel }) => (
  <div className="flex flex-col items-center">
    <div className="relative w-20 h-20">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
        <path
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="3"
        />
        <path
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeDasharray={`${valor}, 100`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-slate-800">{valor}%</span>
      </div>
    </div>
    <p className="text-sm font-medium text-slate-700 mt-2">{label}</p>
    {sublabel && <p className="text-xs text-slate-500">{sublabel}</p>}
  </div>
);

const InsightCard: React.FC<{ insight: InsightAutomatico }> = ({ insight }) => {
  const config = {
    positivo: { bg: 'bg-green-50', border: 'border-green-200', icon: <TrendingUp className="w-4 h-4 text-green-500" /> },
    neutro: { bg: 'bg-blue-50', border: 'border-blue-200', icon: <Clock className="w-4 h-4 text-blue-500" /> },
    advertencia: { bg: 'bg-amber-50', border: 'border-amber-200', icon: <AlertTriangle className="w-4 h-4 text-amber-500" /> }
  }[insight.tipo];

  return (
    <div className={`p-3 rounded-xl border ${config.bg} ${config.border}`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{config.icon}</div>
        <div className="flex-1">
          <p className="font-semibold text-slate-800">{insight.cliente}</p>
          <p className="text-sm text-slate-600">{insight.prediccion}</p>
        </div>
        <div className="text-right">
          <span className="text-lg font-bold text-slate-800">{insight.probabilidad}%</span>
          {insight.tiempoEstimado && (
            <p className="text-xs text-slate-500">{insight.tiempoEstimado}</p>
          )}
        </div>
      </div>
    </div>
  );
};

const RecomendacionCard: React.FC<{ recomendacion: RecomendacionIA }> = ({ recomendacion }) => {
  const prioridadColor = {
    alta: 'bg-red-100 text-red-700 border-red-200',
    media: 'bg-amber-100 text-amber-700 border-amber-200',
    baja: 'bg-blue-100 text-blue-700 border-blue-200'
  }[recomendacion.prioridad];

  return (
    <div className="p-4 rounded-xl bg-white border border-slate-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          <span className="font-bold text-slate-800">{recomendacion.cliente}</span>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${prioridadColor}`}>
          {recomendacion.prioridad.toUpperCase()}
        </span>
      </div>
      <p className="text-slate-700 mb-2">{recomendacion.accion}</p>
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-500">{recomendacion.razon}</span>
        <span className="font-bold text-emerald-600">{recomendacion.impactoEstimado}</span>
      </div>
    </div>
  );
};

const AlertaCard: React.FC<{ alerta: AlertaCritica }> = ({ alerta }) => {
  const config = {
    critica: { bg: 'bg-red-50', border: 'border-red-300', icon: <AlertCircle className="w-5 h-5 text-red-500" />, dot: 'bg-red-500' },
    importante: { bg: 'bg-amber-50', border: 'border-amber-200', icon: <AlertTriangle className="w-5 h-5 text-amber-500" />, dot: 'bg-amber-500' },
    informativa: { bg: 'bg-blue-50', border: 'border-blue-200', icon: <Bell className="w-5 h-5 text-blue-500" />, dot: 'bg-blue-500' }
  }[alerta.tipo];

  return (
    <div className={`p-4 rounded-xl border-2 ${config.bg} ${config.border}`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{config.icon}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-bold text-slate-800">{alerta.titulo}</p>
            {alerta.tiempoRestante && (
              <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-bold animate-pulse">
                ⏰ {alerta.tiempoRestante}
              </span>
            )}
          </div>
          {alerta.descripcion && <p className="text-sm text-slate-600 mt-1">{alerta.descripcion}</p>}
          {alerta.valor && (
            <p className="text-sm font-semibold text-slate-700 mt-1">💰 Valor: {formatCurrency(alerta.valor)}</p>
          )}
        </div>
      </div>
      {alerta.acciones.length > 0 && (
        <div className="flex gap-2 mt-3 pl-8">
          {alerta.acciones.map((accion, idx) => (
            <button
              key={idx}
              onClick={accion.onClick}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-sm font-medium text-slate-700 flex items-center gap-1.5 hover:bg-slate-50"
            >
              {accion.icono}
              {accion.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function PredictiveAnalyticsDashboard() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _router = useRouter();
  const [predicciones] = useState<PrediccionesMes>(mockPredicciones);
  const [insights] = useState<InsightAutomatico[]>(mockInsights);
  const [recomendaciones] = useState<RecomendacionIA[]>(mockRecomendaciones);
  const [alertasCriticas] = useState<AlertaCritica[]>(mockAlertasCriticas);
  const [alertasImportantes] = useState<AlertaCritica[]>(mockAlertasImportantes);
  const [alertasInformativas] = useState<AlertaCritica[]>(mockAlertasInformativas);
  const [cargando, setCargando] = useState(false);
  const [expandirAlertas, setExpandirAlertas] = useState<Record<string, boolean>>({
    criticas: true,
    importantes: true,
    informativas: false
  });

  const handleRefresh = () => {
    setCargando(true);
    setTimeout(() => setCargando(false), 1500);
  };

  const porcentajeMeta = (predicciones.valorProbableCierre / predicciones.metaMensual) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-indigo-50/30">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">🤖 Análisis Predictivo Cortex-Flow</h1>
                <p className="text-slate-500 text-sm">Predicciones e insights en tiempo real</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={cargando}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-medium flex items-center gap-2 hover:bg-slate-50"
              >
                <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin' : ''}`} />
                Actualizar
              </button>
              <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium flex items-center gap-2 hover:shadow-lg">
                <BarChart3 className="w-4 h-4" />
                Análisis Completo
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 py-6 space-y-6">
        {/* Panel de Predicciones del Mes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 text-white"
        >
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-6 h-6 text-amber-400" />
            <h2 className="text-xl font-bold">📈 PREDICCIONES MES ACTUAL</h2>
          </div>

          <div className="grid md:grid-cols-5 gap-6">
            {/* Probabilidad Meta */}
            <div className="text-center">
              <MetricaCircular
                valor={predicciones.probabilidadMeta}
                label="Probabilidad Meta"
                color={predicciones.probabilidadMeta >= 80 ? '#22c55e' : predicciones.probabilidadMeta >= 60 ? '#f59e0b' : '#ef4444'}
                sublabel={predicciones.probabilidadMeta >= 80 ? '✅ Alta' : '⚠️ Media'}
              />
            </div>

            {/* Valor probable */}
            <div className="flex flex-col justify-center">
              <p className="text-slate-400 text-sm">Valor Probable Cierre</p>
              <p className="text-3xl font-bold">{formatCurrency(predicciones.valorProbableCierre)}</p>
              <p className="text-sm text-slate-400">de {formatCurrency(predicciones.metaMensual)} meta</p>
              <div className="mt-2 w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-400 to-green-500 rounded-full"
                  style={{ width: `${Math.min(porcentajeMeta, 100)}%` }}
                />
              </div>
            </div>

            {/* Contratos en riesgo */}
            <div className="flex flex-col justify-center text-center">
              <p className="text-5xl font-bold text-amber-400">{predicciones.contratosEnRiesgo}</p>
              <p className="text-sm text-slate-400">Contratos en Riesgo</p>
              <p className="text-xs text-amber-300 mt-1">⚠️ Requieren atención</p>
            </div>

            {/* Renovaciones */}
            <div className="flex flex-col justify-center text-center">
              <p className="text-5xl font-bold text-blue-400">{predicciones.renovacionesProximas}</p>
              <p className="text-sm text-slate-400">Renovaciones Próximas</p>
              <p className="text-xs text-blue-300 mt-1">{predicciones.probabilidadRenovacion}% promedio</p>
            </div>

            {/* Acción rápida */}
            <div className="flex flex-col justify-center">
              <button className="px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-shadow">
                <Target className="w-5 h-5" />
                Plan de Acción
              </button>
              <button className="mt-2 px-4 py-2 rounded-xl bg-white/10 text-white font-medium flex items-center justify-center gap-2 hover:bg-white/20">
                <Send className="w-4 h-4" />
                Alertar Equipo
              </button>
            </div>
          </div>
        </motion.div>

        {/* Grid de Insights y Recomendaciones */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Insights Automáticos */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-2xl bg-white border border-slate-200"
          >
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-indigo-500" />
              <h3 className="text-lg font-bold text-slate-800">🎯 INSIGHTS AUTOMÁTICOS</h3>
            </div>
            <div className="space-y-3">
              {insights.map(insight => (
                <InsightCard key={insight.id} insight={insight} />
              ))}
            </div>
          </motion.div>

          {/* Recomendaciones IA */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-2xl bg-white border border-slate-200"
          >
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              <h3 className="text-lg font-bold text-slate-800">💡 RECOMENDACIONES IA</h3>
            </div>
            <div className="space-y-3">
              {recomendaciones.map(rec => (
                <RecomendacionCard key={rec.id} recomendacion={rec} />
              ))}
            </div>
          </motion.div>
        </div>

        {/* Centro de Alertas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-2xl bg-white border border-slate-200"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-red-500" />
              <h3 className="text-lg font-bold text-slate-800">🚨 CENTRO DE ALERTAS - REQUIEREN ACCIÓN INMEDIATA</h3>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium flex items-center gap-1 hover:bg-slate-200">
                <RefreshCw className="w-4 h-4" />
                Actualizar
              </button>
              <button className="px-3 py-1.5 rounded-lg bg-indigo-100 text-indigo-700 text-sm font-medium flex items-center gap-1 hover:bg-indigo-200">
                <CheckCircle2 className="w-4 h-4" />
                Resolver Todas
              </button>
            </div>
          </div>

          {/* Alertas Críticas */}
          <div className="mb-6">
            <button
              onClick={() => setExpandirAlertas(prev => ({ ...prev, criticas: !prev.criticas }))}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-red-100 border border-red-200 mb-3"
            >
              <span className="font-bold text-red-700">⚠️ CRÍTICAS ({alertasCriticas.length})</span>
              <ChevronDown className={`w-5 h-5 text-red-500 transition-transform ${expandirAlertas.criticas ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {expandirAlertas.criticas && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3"
                >
                  {alertasCriticas.map(alerta => (
                    <AlertaCard key={alerta.id} alerta={alerta} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Alertas Importantes */}
          <div className="mb-6">
            <button
              onClick={() => setExpandirAlertas(prev => ({ ...prev, importantes: !prev.importantes }))}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-amber-100 border border-amber-200 mb-3"
            >
              <span className="font-bold text-amber-700">🟡 IMPORTANTES ({alertasImportantes.length})</span>
              <ChevronDown className={`w-5 h-5 text-amber-500 transition-transform ${expandirAlertas.importantes ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {expandirAlertas.importantes && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  {alertasImportantes.map(alerta => (
                    <div key={alerta.id} className="p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-center gap-3">
                      <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-slate-800">{alerta.titulo}</p>
                        {alerta.descripcion && <p className="text-sm text-slate-500">{alerta.descripcion}</p>}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Alertas Informativas */}
          <div>
            <button
              onClick={() => setExpandirAlertas(prev => ({ ...prev, informativas: !prev.informativas }))}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-blue-100 border border-blue-200 mb-3"
            >
              <span className="font-bold text-blue-700">📊 INFORMATIVAS ({alertasInformativas.length})</span>
              <ChevronDown className={`w-5 h-5 text-blue-500 transition-transform ${expandirAlertas.informativas ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {expandirAlertas.informativas && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  {alertasInformativas.map(alerta => (
                    <div key={alerta.id} className="p-3 rounded-lg bg-blue-50 border border-blue-200 flex items-center gap-3">
                      <Bell className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <p className="text-slate-700">{alerta.titulo}</p>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
