/**
 * 🤖 SILEXAR PULSE - Predictive Analytics Dashboard TIER 0
 * 
 * @description Dashboard de análisis predictivo con Cortex-Flow,
 * insights automáticos y recomendaciones IA.
 * Paleta oficial: base #dfeaff | dark #bec8de | light #ffffff | accent #6888ff
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
// TOKENS OFICIALES NEUMORPHISM
// ═══════════════════════════════════════════════════════════════

const N = {
  base: '#dfeaff',
  dark: '#bec8de',
  light: '#ffffff',
  accent: '#6888ff',
  text: '#69738c',
  textSub: '#9aa3b8',
};

const neu = `8px 8px 16px ${N.dark},-8px -8px 16px ${N.light}`;
const neuSm = `4px 4px 8px ${N.dark},-4px -4px 8px ${N.light}`;
const neuXs = `2px 2px 4px ${N.dark},-2px -2px 4px ${N.light}`;
const inset = `inset 4px 4px 8px ${N.dark},inset -4px -4px 8px ${N.light}`;
const insetSm = `inset 2px 2px 5px ${N.dark},inset -2px -2px 5px ${N.light}`;

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
// COMPONENTES NEUMORPHIC
// ═══════════════════════════════════════════════════════════════

function NeuCard({ children, className = '', style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`rounded-3xl ${className}`} style={{ background: N.base, boxShadow: neu, ...style }}>
      {children}
    </div>
  );
}

function NeuButton({ children, onClick, variant = 'secondary', className = '', disabled = false }: {
  children: React.ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary'; className?: string; disabled?: boolean;
}) {
  const s = variant === 'primary'
    ? { background: N.accent, color: '#fff', boxShadow: neuSm }
    : { background: N.base, color: N.text, boxShadow: neu };
  return (
    <button onClick={onClick} disabled={disabled} className={`px-4 py-2 rounded-xl font-bold transition-all duration-200 flex items-center gap-2 ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'} ${className}`} style={s}>
      {children}
    </button>
  );
}

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
          stroke={N.dark}
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
        <span className="text-xl font-black" style={{ color: N.text }}>{valor}%</span>
      </div>
    </div>
    <p className="text-sm font-bold mt-2" style={{ color: N.text }}>{label}</p>
    {sublabel && <p className="text-xs" style={{ color: N.textSub }}>{sublabel}</p>}
  </div>
);

const InsightCard: React.FC<{ insight: InsightAutomatico }> = ({ insight }) => {
  const config = {
    positivo: { bg: 'rgba(34,197,94,0.08)', border: '#6888ff40', icon: <TrendingUp className="w-4 h-4" style={{ color: '#6888ff' }} />, color: '#6888ff' },
    neutro: { bg: 'rgba(104,136,255,0.08)', border: `${N.accent}40`, icon: <Clock className="w-4 h-4" style={{ color: N.accent }} />, color: N.accent },
    advertencia: { bg: 'rgba(245,158,11,0.08)', border: '#6888ff40', icon: <AlertTriangle className="w-4 h-4" style={{ color: '#6888ff' }} />, color: '#6888ff' }
  }[insight.tipo];

  return (
    <div className="p-3 rounded-2xl" style={{ background: config.bg, border: `1px solid ${config.border}` }}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{config.icon}</div>
        <div className="flex-1">
          <p className="font-bold text-sm" style={{ color: N.text }}>{insight.cliente}</p>
          <p className="text-sm" style={{ color: N.textSub }}>{insight.prediccion}</p>
        </div>
        <div className="text-right">
          <span className="text-lg font-black" style={{ color: N.text }}>{insight.probabilidad}%</span>
          {insight.tiempoEstimado && (
            <p className="text-xs" style={{ color: N.textSub }}>{insight.tiempoEstimado}</p>
          )}
        </div>
      </div>
    </div>
  );
};

const RecomendacionCard: React.FC<{ recomendacion: RecomendacionIA }> = ({ recomendacion }) => {
  const prioridadColor = {
    alta: { bg: 'rgba(239,68,68,0.08)', text: '#9aa3b8' },
    media: { bg: 'rgba(245,158,11,0.08)', text: '#6888ff' },
    baja: { bg: 'rgba(104,136,255,0.08)', text: N.accent }
  }[recomendacion.prioridad];

  return (
    <div className="p-4 rounded-2xl" style={{ background: N.base, boxShadow: neuSm }}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl" style={{ background: N.base, boxShadow: neuXs }}>
            <Lightbulb className="w-5 h-5" style={{ color: '#6888ff' }} />
          </div>
          <span className="font-bold text-sm" style={{ color: N.text }}>{recomendacion.cliente}</span>
        </div>
        <span className="px-2 py-0.5 rounded-lg text-xs font-bold" style={{ background: prioridadColor.bg, color: prioridadColor.text, boxShadow: insetSm }}>
          {recomendacion.prioridad.toUpperCase()}
        </span>
      </div>
      <p className="text-sm mb-2" style={{ color: N.text }}>{recomendacion.accion}</p>
      <div className="flex items-center justify-between text-sm">
        <span style={{ color: N.textSub }}>{recomendacion.razon}</span>
        <span className="font-black" style={{ color: '#6888ff' }}>{recomendacion.impactoEstimado}</span>
      </div>
    </div>
  );
};

const AlertaCard: React.FC<{ alerta: AlertaCritica }> = ({ alerta }) => {
  const config = {
    critica: { bg: 'rgba(239,68,68,0.08)', border: '#9aa3b840', icon: <AlertCircle className="w-5 h-5" style={{ color: '#9aa3b8' }} />, dot: '#9aa3b8' },
    importante: { bg: 'rgba(245,158,11,0.08)', border: '#6888ff40', icon: <AlertTriangle className="w-5 h-5" style={{ color: '#6888ff' }} />, dot: '#6888ff' },
    informativa: { bg: 'rgba(104,136,255,0.08)', border: `${N.accent}40`, icon: <Bell className="w-5 h-5" style={{ color: N.accent }} />, dot: N.accent }
  }[alerta.tipo];

  return (
    <div className="p-4 rounded-2xl" style={{ background: config.bg, border: `1px solid ${config.border}` }}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{config.icon}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-bold text-sm" style={{ color: N.text }}>{alerta.titulo}</p>
            {alerta.tiempoRestante && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold animate-pulse" style={{ background: 'rgba(239,68,68,0.12)', color: '#9aa3b8' }}>
                ⏰ {alerta.tiempoRestante}
              </span>
            )}
          </div>
          {alerta.descripcion && <p className="text-sm mt-1" style={{ color: N.textSub }}>{alerta.descripcion}</p>}
          {alerta.valor && (
            <p className="text-sm font-bold mt-1" style={{ color: N.text }}>💰 Valor: {formatCurrency(alerta.valor)}</p>
          )}
        </div>
      </div>
      {alerta.acciones.length > 0 && (
        <div className="flex gap-2 mt-3 pl-8">
          {alerta.acciones.map((accion) => (
            <button
              key={accion.label}
              onClick={accion.onClick}
              className="px-3 py-1.5 rounded-xl text-sm font-bold flex items-center gap-1.5 transition-all"
              style={{ background: N.base, boxShadow: neuXs, color: N.text }}
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
    <div className="min-h-screen p-6 lg:p-8" style={{ background: N.base }}>
      <div className="max-w-[1600px] mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl" style={{ background: N.base, boxShadow: neu }}>
              <Sparkles className="w-8 h-8" style={{ color: N.accent }} />
            </div>
            <div>
              <h1 className="text-3xl font-black" style={{ color: N.text }}>🤖 Análisis Predictivo Cortex-Flow</h1>
              <p className="text-sm" style={{ color: N.textSub }}>Predicciones e insights en tiempo real</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NeuButton variant="secondary" onClick={handleRefresh} disabled={cargando}>
              <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin' : ''}`} />
              Actualizar
            </NeuButton>
            <NeuButton variant="primary">
              <BarChart3 className="w-4 h-4" />
              Análisis Completo
            </NeuButton>
          </div>
        </div>

        {/* Panel de Predicciones del Mes */}
        <NeuCard className="p-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-5" style={{ background: 'radial-gradient(circle at 80% 50%, #6888ff 0%, transparent 70%)' }} />
          <div className="relative">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 rounded-xl" style={{ background: N.base, boxShadow: neuSm }}>
                <Sparkles className="w-6 h-6" style={{ color: '#6888ff' }} />
              </div>
              <h2 className="text-xl font-black" style={{ color: N.text }}>📈 PREDICCIONES MES ACTUAL</h2>
            </div>

            <div className="grid md:grid-cols-5 gap-6">
              {/* Probabilidad Meta */}
              <div className="text-center">
                <MetricaCircular
                  valor={predicciones.probabilidadMeta}
                  label="Probabilidad Meta"
                  color={predicciones.probabilidadMeta >= 80 ? '#6888ff' : predicciones.probabilidadMeta >= 60 ? '#6888ff' : '#9aa3b8'}
                  sublabel={predicciones.probabilidadMeta >= 80 ? '✅ Alta' : '⚠️ Media'}
                />
              </div>

              {/* Valor probable */}
              <div className="flex flex-col justify-center">
                <p className="text-sm" style={{ color: N.textSub }}>Valor Probable Cierre</p>
                <p className="text-3xl font-black" style={{ color: N.text }}>{formatCurrency(predicciones.valorProbableCierre)}</p>
                <p className="text-sm" style={{ color: N.textSub }}>de {formatCurrency(predicciones.metaMensual)} meta</p>
                <div className="mt-2 h-2 rounded-full overflow-hidden" style={{ background: N.base, boxShadow: inset }}>
                  <div 
                    className="h-full rounded-full transition-all"
                    style={{ width: `${Math.min(porcentajeMeta, 100)}%`, background: '#6888ff' }}
                  />
                </div>
              </div>

              {/* Contratos en riesgo */}
              <div className="flex flex-col justify-center text-center">
                <p className="text-5xl font-black" style={{ color: '#6888ff' }}>{predicciones.contratosEnRiesgo}</p>
                <p className="text-sm" style={{ color: N.textSub }}>Contratos en Riesgo</p>
                <p className="text-xs mt-1" style={{ color: '#6888ff' }}>⚠️ Requieren atención</p>
              </div>

              {/* Renovaciones */}
              <div className="flex flex-col justify-center text-center">
                <p className="text-5xl font-black" style={{ color: N.accent }}>{predicciones.renovacionesProximas}</p>
                <p className="text-sm" style={{ color: N.textSub }}>Renovaciones Próximas</p>
                <p className="text-xs mt-1" style={{ color: N.accent }}>{predicciones.probabilidadRenovacion}% promedio</p>
              </div>

              {/* Acción rápida */}
              <div className="flex flex-col justify-center gap-2">
                <button className="px-4 py-3 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2" style={{ background: '#6888ff', boxShadow: neuSm }}>
                  <Target className="w-5 h-5" />
                  Plan de Acción
                </button>
                <button className="px-4 py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-2" style={{ background: N.base, boxShadow: neuSm, color: N.text }}>
                  <Send className="w-4 h-4" />
                  Alertar Equipo
                </button>
              </div>
            </div>
          </div>
        </NeuCard>

        {/* Grid de Insights y Recomendaciones */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Insights Automáticos */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <NeuCard className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-xl" style={{ background: N.base, boxShadow: neuXs }}>
                  <Target className="w-5 h-5" style={{ color: N.accent }} />
                </div>
                <h3 className="text-lg font-black" style={{ color: N.text }}>🎯 INSIGHTS AUTOMÁTICOS</h3>
              </div>
              <div className="space-y-3">
                {insights.map(insight => (
                  <InsightCard key={insight.id} insight={insight} />
                ))}
              </div>
            </NeuCard>
          </motion.div>

          {/* Recomendaciones IA */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <NeuCard className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-xl" style={{ background: N.base, boxShadow: neuXs }}>
                  <Lightbulb className="w-5 h-5" style={{ color: '#6888ff' }} />
                </div>
                <h3 className="text-lg font-black" style={{ color: N.text }}>💡 RECOMENDACIONES IA</h3>
              </div>
              <div className="space-y-3">
                {recomendaciones.map(rec => (
                  <RecomendacionCard key={rec.id} recomendacion={rec} />
                ))}
              </div>
            </NeuCard>
          </motion.div>
        </div>

        {/* Centro de Alertas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <NeuCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl" style={{ background: N.base, boxShadow: neuXs }}>
                  <Bell className="w-5 h-5" style={{ color: '#9aa3b8' }} />
                </div>
                <h3 className="text-lg font-black" style={{ color: N.text }}>🚨 CENTRO DE ALERTAS - REQUIEREN ACCIÓN INMEDIATA</h3>
              </div>
              <div className="flex gap-2">
                <NeuButton variant="secondary" className="text-xs">
                  <RefreshCw className="w-4 h-4" />
                  Actualizar
                </NeuButton>
                <NeuButton variant="primary" className="text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  Resolver Todas
                </NeuButton>
              </div>
            </div>

            {/* Alertas Críticas */}
            <div className="mb-6">
              <button
                onClick={() => setExpandirAlertas(prev => ({ ...prev, criticas: !prev.criticas }))}
                className="w-full flex items-center justify-between p-3 rounded-2xl mb-3"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid #9aa3b840' }}
              >
                <span className="font-bold text-sm" style={{ color: '#9aa3b8' }}>⚠️ CRÍTICAS ({alertasCriticas.length})</span>
                <ChevronDown className={`w-5 h-5 transition-transform ${expandirAlertas.criticas ? 'rotate-180' : ''}`} style={{ color: '#9aa3b8' }} />
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
                className="w-full flex items-center justify-between p-3 rounded-2xl mb-3"
                style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid #6888ff40' }}
              >
                <span className="font-bold text-sm" style={{ color: '#6888ff' }}>🟡 IMPORTANTES ({alertasImportantes.length})</span>
                <ChevronDown className={`w-5 h-5 transition-transform ${expandirAlertas.importantes ? 'rotate-180' : ''}`} style={{ color: '#6888ff' }} />
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
                      <div key={alerta.id} className="p-3 rounded-2xl flex items-center gap-3" style={{ background: 'rgba(245,158,11,0.04)', border: '1px solid #6888ff30' }}>
                        <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: '#6888ff' }} />
                        <div>
                          <p className="font-bold text-sm" style={{ color: N.text }}>{alerta.titulo}</p>
                          {alerta.descripcion && <p className="text-xs" style={{ color: N.textSub }}>{alerta.descripcion}</p>}
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
                className="w-full flex items-center justify-between p-3 rounded-2xl mb-3"
                style={{ background: 'rgba(104,136,255,0.08)', border: `1px solid ${N.accent}40` }}
              >
                <span className="font-bold text-sm" style={{ color: N.accent }}>📊 INFORMATIVAS ({alertasInformativas.length})</span>
                <ChevronDown className={`w-5 h-5 transition-transform ${expandirAlertas.informativas ? 'rotate-180' : ''}`} style={{ color: N.accent }} />
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
                      <div key={alerta.id} className="p-3 rounded-2xl flex items-center gap-3" style={{ background: 'rgba(104,136,255,0.04)', border: `1px solid ${N.accent}30` }}>
                        <Bell className="w-4 h-4 flex-shrink-0" style={{ color: N.accent }} />
                        <p className="text-sm" style={{ color: N.text }}>{alerta.titulo}</p>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </NeuCard>
        </motion.div>
      </div>
    </div>
  );
}
