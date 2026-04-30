/**
 * 🚀 SILEXAR PULSE - Smart Workspace TIER 0
 * 
 * @description Workspace inteligente con widgets personalizables,
 * operaciones en lote, atajos de productividad y AI insights.
 * Paleta oficial: base #dfeaff | dark #bec8de | light #ffffff | accent #6888ff
 * 
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import React, { useState } from 'react';
import { formatCurrency } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layout,
  Plus,
  X,
  Settings,
  Maximize2,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  BarChart3,
  Brain,
  Zap,
  Target,
  Filter,
  Download,
  Copy,
  Mail,
  Phone,
  CheckSquare,
  Square,
  MoreHorizontal,
  Sparkles
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

interface Widget {
  id: string;
  tipo: 'metricas' | 'alertas' | 'pipeline' | 'tareas' | 'ai-insights' | 'calendario' | 'acciones-rapidas';
  titulo: string;
  tamaño: 'pequeño' | 'mediano' | 'grande';
  visible: boolean;
  orden: number;
}

interface ContratoSeleccionado {
  id: string;
  numero: string;
  cliente: string;
  valor: number;
  estado: string;
}

interface MetricaRapida {
  label: string;
  valor: string | number;
  cambio: number;
  icono: React.ReactNode;
  color: string;
}

// ═══════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════

const mockContratos: ContratoSeleccionado[] = [
  { id: 'c-001', numero: 'CTR-2025-0142', cliente: 'Banco Chile', valor: 85000000, estado: 'PENDIENTE_APROBACION' },
  { id: 'c-002', numero: 'CTR-2025-0143', cliente: 'Falabella', valor: 120000000, estado: 'EN_REVISION' },
  { id: 'c-003', numero: 'CTR-2025-0144', cliente: 'Ripley', valor: 45000000, estado: 'BORRADOR' },
  { id: 'c-004', numero: 'CTR-2025-0145', cliente: 'Cencosud', valor: 200000000, estado: 'APROBADO' },
  { id: 'c-005', numero: 'CTR-2025-0146', cliente: 'LATAM', valor: 350000000, estado: 'PENDIENTE_FIRMA' },
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
// WIDGET: MÉTRICAS RÁPIDAS
// ═══════════════════════════════════════════════════════════════

const MetricasWidget: React.FC = () => {
  const metricas: MetricaRapida[] = [
    { label: 'Contratos Hoy', valor: 8, cambio: 25, icono: <FileText className="w-5 h-5" style={{ color: N.accent }} />, color: N.accent },
    { label: 'Valor Pipeline', valor: '$2.4B', cambio: 12, icono: <DollarSign className="w-5 h-5" style={{ color: '#6888ff' }} />, color: '#6888ff' },
    { label: 'Tasa Cierre', valor: '68%', cambio: -3, icono: <Target className="w-5 h-5" style={{ color: '#a855f7' }} />, color: '#a855f7' },
    { label: 'Pendientes', valor: 12, cambio: 0, icono: <Clock className="w-5 h-5" style={{ color: '#6888ff' }} />, color: '#6888ff' },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 p-5">
      {metricas.map((m, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: idx * 0.1 }}
          className="p-4 rounded-2xl"
          style={{ background: N.base, boxShadow: inset }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl" style={{ background: N.base, boxShadow: neuXs }}>{m.icono}</div>
            <div>
              <p className="text-xs" style={{ color: N.textSub }}>{m.label}</p>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black" style={{ color: N.text }}>{m.valor}</span>
                {m.cambio !== 0 && (
                  <span className="flex items-center text-xs" style={{ color: m.cambio > 0 ? '#6888ff' : '#9aa3b8' }}>
                    {m.cambio > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {Math.abs(m.cambio)}%
                  </span>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// WIDGET: AI INSIGHTS
// ═══════════════════════════════════════════════════════════════

const AIInsightsWidget: React.FC = () => {
  const insights = [
    {
      tipo: 'oportunidad',
      titulo: 'Oportunidad de Upsell',
      descripcion: 'Banco Chile incrementó 40% su inversión en competencia. Momento ideal para propuesta.',
      accion: 'Generar propuesta',
      icono: <Target className="w-5 h-5" style={{ color: '#6888ff' }} />
    },
    {
      tipo: 'alerta',
      titulo: 'Renovación en Riesgo',
      descripcion: 'Contrato Falabella tiene 32% probabilidad de no renovar según engagement.',
      accion: 'Ver análisis',
      icono: <AlertCircle className="w-5 h-5" style={{ color: '#9aa3b8' }} />
    },
    {
      tipo: 'prediccion',
      titulo: 'Predicción de Cierre',
      descripcion: 'LATAM tiene 89% probabilidad de firmar esta semana basado en historial.',
      accion: 'Preparar firma',
      icono: <Brain className="w-5 h-5" style={{ color: '#a855f7' }} />
    }
  ];

  return (
    <div className="p-5 space-y-4">
      {insights.map((insight, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.15 }}
          className="p-4 rounded-2xl"
          style={{ background: N.base, boxShadow: inset }}
        >
          <div className="flex items-start gap-3">
            <div className="mt-1">{insight.icono}</div>
            <div className="flex-1">
              <h4 className="font-bold text-sm" style={{ color: N.text }}>{insight.titulo}</h4>
              <p className="text-xs mt-1" style={{ color: N.textSub }}>{insight.descripcion}</p>
              <NeuButton variant="primary" className="px-3 py-1.5 text-xs mt-3">
                <Zap className="w-3 h-3" />
                {insight.accion}
              </NeuButton>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// WIDGET: ACCIONES RÁPIDAS
// ═══════════════════════════════════════════════════════════════

const AccionesRapidasWidget: React.FC = () => {
  const acciones = [
    { label: 'Nuevo Contrato', icono: <Plus className="w-5 h-5" />, color: '#6888ff' },
    { label: 'Aprobar Pendientes', icono: <CheckCircle className="w-5 h-5" />, color: N.accent },
    { label: 'Enviar Propuesta', icono: <Mail className="w-5 h-5" />, color: '#a855f7' },
    { label: 'Llamar Cliente', icono: <Phone className="w-5 h-5" />, color: '#6888ff' },
    { label: 'Ver Analytics', icono: <BarChart3 className="w-5 h-5" />, color: '#06b6d4' },
    { label: 'Exportar Datos', icono: <Download className="w-5 h-5" />, color: N.textSub },
  ];

  return (
    <div className="p-5 grid grid-cols-3 gap-3">
      {acciones.map((accion, idx) => (
        <motion.button
          key={idx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-4 rounded-2xl flex flex-col items-center gap-2 cursor-pointer"
          style={{ background: N.base, boxShadow: inset }}
        >
          <div className="p-3 rounded-xl text-white" style={{ background: accion.color, boxShadow: neuXs }}>
            {accion.icono}
          </div>
          <span className="text-xs font-bold text-center" style={{ color: N.text }}>{accion.label}</span>
        </motion.button>
      ))}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// BATCH OPERATIONS PANEL
// ═══════════════════════════════════════════════════════════════

const BatchOperationsPanel: React.FC<{
  selectedCount: number;
  onAction: (action: string) => void;
  onClearSelection: () => void;
}> = ({ selectedCount, onAction, onClearSelection }) => {
  if (selectedCount === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 px-6 py-4 rounded-3xl"
      style={{ background: N.base, boxShadow: neu }}
    >
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white" style={{ background: N.accent, boxShadow: neuSm }}>
            {selectedCount}
          </div>
          <span className="font-bold text-sm" style={{ color: N.text }}>seleccionados</span>
        </div>

        <div className="h-8 w-px" style={{ background: N.dark }} />

        <div className="flex items-center gap-2">
          <NeuButton variant="primary" className="px-4 py-2 text-xs" onClick={() => onAction('aprobar')}>
            <CheckCircle className="w-4 h-4" />
            Aprobar Todos
          </NeuButton>
          <NeuButton variant="secondary" className="px-4 py-2 text-xs" onClick={() => onAction('exportar')}>
            <Download className="w-4 h-4" />
            Exportar
          </NeuButton>
          <NeuButton variant="secondary" className="px-4 py-2 text-xs" onClick={() => onAction('email')}>
            <Mail className="w-4 h-4" />
            Enviar Email
          </NeuButton>
          <NeuButton variant="secondary" className="px-4 py-2 text-xs" onClick={() => onAction('duplicar')}>
            <Copy className="w-4 h-4" />
            Duplicar
          </NeuButton>
        </div>

        <button
          onClick={onClearSelection}
          className="p-2 rounded-xl transition-all"
          style={{ background: N.base, boxShadow: neuXs, color: N.textSub }}
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════════
// CONTRATOS LIST CON SELECCIÓN MÚLTIPLE
// ═══════════════════════════════════════════════════════════════

const ContratosListWidget: React.FC<{
  onSelectionChange: (selected: string[]) => void;
}> = ({ onSelectionChange }) => {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelected(newSelected);
    onSelectionChange(Array.from(newSelected));
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelected(new Set());
      onSelectionChange([]);
    } else {
      const allIds = mockContratos.map(c => c.id);
      setSelected(new Set(allIds));
      onSelectionChange(allIds);
    }
    setSelectAll(!selectAll);
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'APROBADO': return { bg: 'rgba(34,197,94,0.12)', text: '#6888ff' };
      case 'PENDIENTE_APROBACION': return { bg: 'rgba(245,158,11,0.12)', text: '#6888ff' };
      case 'PENDIENTE_FIRMA': return { bg: 'rgba(104,136,255,0.12)', text: N.accent };
      case 'EN_REVISION': return { bg: 'rgba(168,85,247,0.12)', text: '#a855f7' };
      default: return { bg: 'rgba(154,163,184,0.12)', text: N.textSub };
    }
  };

  return (
    <div className="p-5">
      {/* Header con select all */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={toggleSelectAll}
          className="flex items-center gap-2 text-sm font-bold transition-all"
          style={{ color: N.text }}
        >
          {selectAll ? (
            <CheckSquare className="w-5 h-5" style={{ color: N.accent }} />
          ) : (
            <Square className="w-5 h-5" style={{ color: N.textSub }} />
          )}
          Seleccionar todo
        </button>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-xl" style={{ background: N.base, boxShadow: neuXs, color: N.textSub }}>
            <Filter className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-xl" style={{ background: N.base, boxShadow: neuXs, color: N.textSub }}>
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Lista */}
      <div className="space-y-2">
        {mockContratos.map((contrato, idx) => {
          const estado = getEstadoColor(contrato.estado);
          return (
            <motion.div
              key={contrato.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-4 rounded-2xl flex items-center gap-4 cursor-pointer transition-all"
              style={{ 
                background: N.base, 
                boxShadow: selected.has(contrato.id) ? inset : neuSm,
                border: selected.has(contrato.id) ? `2px solid ${N.accent}` : '2px solid transparent'
              }}
              onClick={() => toggleSelect(contrato.id)}
            >
              <button
                onClick={(e) => { e.stopPropagation(); toggleSelect(contrato.id); }}
                className="p-1 rounded-lg"
                style={{ background: N.base, boxShadow: neuXs }}
              >
                {selected.has(contrato.id) ? (
                  <CheckSquare className="w-5 h-5" style={{ color: N.accent }} />
                ) : (
                  <Square className="w-5 h-5" style={{ color: N.textSub }} />
                )}
              </button>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm" style={{ color: N.text }}>{contrato.numero}</span>
                  <span className="px-2 py-0.5 rounded-lg text-xs font-bold" style={{ background: estado.bg, color: estado.text, boxShadow: insetSm }}>
                    {contrato.estado.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="text-sm" style={{ color: N.textSub }}>{contrato.cliente}</p>
              </div>

              <div className="text-right">
                <p className="font-bold text-sm" style={{ color: N.text }}>{formatCurrency(contrato.valor)}</p>
              </div>

              <button className="p-2 rounded-xl" style={{ background: N.base, boxShadow: neuXs, color: N.textSub }}>
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL: SMART WORKSPACE
// ═══════════════════════════════════════════════════════════════

export default function SmartWorkspace() {
  const [selectedContratos, setSelectedContratos] = useState<string[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [widgets, _setWidgets] = useState<Widget[]>([
    { id: 'metricas', tipo: 'metricas', titulo: '📊 Métricas Rápidas', tamaño: 'mediano', visible: true, orden: 0 },
    { id: 'ai-insights', tipo: 'ai-insights', titulo: '🧠 AI Insights', tamaño: 'mediano', visible: true, orden: 1 },
    { id: 'acciones', tipo: 'acciones-rapidas', titulo: '⚡ Acciones Rápidas', tamaño: 'mediano', visible: true, orden: 2 },
  ]);

  const handleBatchAction = (action: string) => {
    void action;
    setSelectedContratos([]);
  };

  const renderWidget = (widget: Widget) => {
    switch (widget.tipo) {
      case 'metricas':
        return <MetricasWidget />;
      case 'ai-insights':
        return <AIInsightsWidget />;
      case 'acciones-rapidas':
        return <AccionesRapidasWidget />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen p-6 lg:p-8" style={{ background: N.base }}>
      {/* Header */}
      <div className="max-w-[1600px] mx-auto mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl" style={{ background: N.base, boxShadow: neu }}>
              <Layout className="w-7 h-7" style={{ color: N.accent }} />
            </div>
            <div>
              <h1 className="text-2xl font-black flex items-center gap-2" style={{ color: N.text }}>
                🚀 Smart Workspace
                <span className="px-2 py-0.5 rounded-full text-xs font-bold text-white" style={{ background: N.accent, boxShadow: neuSm }}>
                  AI Powered
                </span>
              </h1>
              <p className="text-sm" style={{ color: N.textSub }}>Tu espacio de trabajo inteligente y personalizable</p>
            </div>
          </div>

          <div className="flex gap-3">
            <NeuButton variant="secondary">
              <Settings className="w-4 h-4" />
              Personalizar
            </NeuButton>
            <NeuButton variant="primary">
              <Plus className="w-4 h-4" />
              Agregar Widget
            </NeuButton>
          </div>
        </div>
      </div>

      {/* Grid de Widgets */}
      <div className="max-w-[1600px] mx-auto">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Widgets superiores */}
          {widgets.filter(w => w.visible).map((widget, idx) => (
            <motion.div
              key={widget.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <NeuCard>
                <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${N.dark}30` }}>
                  <h3 className="font-bold text-sm" style={{ color: N.text }}>{widget.titulo}</h3>
                  <div className="flex items-center gap-1">
                    <button className="p-1.5 rounded-xl transition-all" style={{ background: N.base, boxShadow: neuXs, color: N.textSub }}>
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 rounded-xl transition-all" style={{ background: N.base, boxShadow: neuXs, color: N.textSub }}>
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {renderWidget(widget)}
              </NeuCard>
            </motion.div>
          ))}
        </div>

        {/* Lista de contratos con selección múltiple */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <NeuCard>
            <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${N.dark}30` }}>
              <h3 className="font-bold text-sm flex items-center gap-2" style={{ color: N.text }}>
                📋 Mis Contratos
                <span className="px-2 py-0.5 rounded-lg text-xs font-bold" style={{ background: `${N.accent}18`, color: N.accent, boxShadow: insetSm }}>
                  {mockContratos.length}
                </span>
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs flex items-center gap-1" style={{ color: N.textSub }}>
                  <Sparkles className="w-3 h-3" style={{ color: N.accent }} />
                  Ordenado por IA según prioridad
                </span>
              </div>
            </div>
            <ContratosListWidget onSelectionChange={setSelectedContratos} />
          </NeuCard>
        </motion.div>
      </div>

      {/* Panel de operaciones en lote */}
      <AnimatePresence>
        <BatchOperationsPanel
          selectedCount={selectedContratos.length}
          onAction={handleBatchAction}
          onClearSelection={() => setSelectedContratos([])}
        />
      </AnimatePresence>
    </div>
  );
}
