/**
 * 🚀 SILEXAR PULSE - Smart Workspace TIER 0
 * 
 * @description Workspace inteligente con widgets personalizables,
 * operaciones en lote, atajos de productividad y AI insights.
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
// ESTILOS NEUROMORPHIC
// ═══════════════════════════════════════════════════════════════

const neuro = {
  widget: `
    bg-gradient-to-br from-slate-50 to-slate-100
    rounded-3xl
    shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff]
    border border-slate-200/50
    overflow-hidden
  `,
  widgetHeader: `
    px-5 py-4
    border-b border-slate-200/50
    flex items-center justify-between
  `,
  inset: `
    bg-gradient-to-br from-slate-100 to-slate-50
    rounded-xl
    shadow-[inset_3px_3px_6px_#d1d5db,inset_-3px_-3px_6px_#ffffff]
  `,
  btnPrimary: `
    bg-gradient-to-br from-indigo-500 to-purple-600
    text-white font-semibold rounded-xl
    shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]
    hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]
    transition-all duration-200
  `,
  btnSecondary: `
    bg-gradient-to-br from-slate-50 to-slate-100
    text-slate-700 font-medium rounded-xl
    shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]
    hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]
    transition-all duration-200
  `,
  badge: `
    px-3 py-1 rounded-lg
    shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]
    text-xs font-medium
  `,
  checkbox: `
    w-5 h-5 rounded-lg
    shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]
    border-none cursor-pointer
    transition-all duration-200
  `
};

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
// WIDGET: MÉTRICAS RÁPIDAS
// ═══════════════════════════════════════════════════════════════

const MetricasWidget: React.FC = () => {
  const metricas: MetricaRapida[] = [
    { label: 'Contratos Hoy', valor: 8, cambio: 25, icono: <FileText className="w-5 h-5" />, color: 'text-blue-600' },
    { label: 'Valor Pipeline', valor: '$2.4B', cambio: 12, icono: <DollarSign className="w-5 h-5" />, color: 'text-green-600' },
    { label: 'Tasa Cierre', valor: '68%', cambio: -3, icono: <Target className="w-5 h-5" />, color: 'text-purple-600' },
    { label: 'Pendientes', valor: 12, cambio: 0, icono: <Clock className="w-5 h-5" />, color: 'text-amber-600' },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 p-5">
      {metricas.map((m, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: idx * 0.1 }}
          className={`${neuro.inset} p-4`}
        >
          <div className="flex items-center gap-3">
            <div className={m.color}>{m.icono}</div>
            <div>
              <p className="text-xs text-slate-500">{m.label}</p>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-slate-800">{m.valor}</span>
                {m.cambio !== 0 && (
                  <span className={`flex items-center text-xs ${m.cambio > 0 ? 'text-green-600' : 'text-red-600'}`}>
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
      icono: <Target className="w-5 h-5 text-green-500" />
    },
    {
      tipo: 'alerta',
      titulo: 'Renovación en Riesgo',
      descripcion: 'Contrato Falabella tiene 32% probabilidad de no renovar según engagement.',
      accion: 'Ver análisis',
      icono: <AlertCircle className="w-5 h-5 text-red-500" />
    },
    {
      tipo: 'prediccion',
      titulo: 'Predicción de Cierre',
      descripcion: 'LATAM tiene 89% probabilidad de firmar esta semana basado en historial.',
      accion: 'Preparar firma',
      icono: <Brain className="w-5 h-5 text-purple-500" />
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
          className={`${neuro.inset} p-4`}
        >
          <div className="flex items-start gap-3">
            <div className="mt-1">{insight.icono}</div>
            <div className="flex-1">
              <h4 className="font-semibold text-slate-800 text-sm">{insight.titulo}</h4>
              <p className="text-xs text-slate-500 mt-1">{insight.descripcion}</p>
              <button className={`${neuro.btnPrimary} px-3 py-1.5 text-xs mt-3 flex items-center gap-1`}>
                <Zap className="w-3 h-3" />
                {insight.accion}
              </button>
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
    { label: 'Nuevo Contrato', icono: <Plus className="w-5 h-5" />, color: 'from-green-400 to-emerald-500' },
    { label: 'Aprobar Pendientes', icono: <CheckCircle className="w-5 h-5" />, color: 'from-blue-400 to-cyan-500' },
    { label: 'Enviar Propuesta', icono: <Mail className="w-5 h-5" />, color: 'from-purple-400 to-pink-500' },
    { label: 'Llamar Cliente', icono: <Phone className="w-5 h-5" />, color: 'from-amber-400 to-orange-500' },
    { label: 'Ver Analytics', icono: <BarChart3 className="w-5 h-5" />, color: 'from-indigo-400 to-violet-500' },
    { label: 'Exportar Datos', icono: <Download className="w-5 h-5" />, color: 'from-slate-400 to-zinc-500' },
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
          className={`${neuro.inset} p-4 flex flex-col items-center gap-2 cursor-pointer hover:shadow-lg transition-all`}
        >
          <div className={`p-3 rounded-xl bg-gradient-to-br ${accion.color} text-white`}>
            {accion.icono}
          </div>
          <span className="text-xs font-medium text-slate-600 text-center">{accion.label}</span>
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
      className={`
        fixed bottom-6 left-1/2 -translate-x-1/2 z-40
        ${neuro.widget} px-6 py-4
        flex items-center gap-6
      `}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold">
          {selectedCount}
        </div>
        <span className="font-medium text-slate-700">seleccionados</span>
      </div>

      <div className="h-8 w-px bg-slate-200" />

      <div className="flex items-center gap-2">
        <button
          onClick={() => onAction('aprobar')}
          className={`${neuro.btnPrimary} px-4 py-2 text-sm flex items-center gap-2`}
        >
          <CheckCircle className="w-4 h-4" />
          Aprobar Todos
        </button>
        <button
          onClick={() => onAction('exportar')}
          className={`${neuro.btnSecondary} px-4 py-2 text-sm flex items-center gap-2`}
        >
          <Download className="w-4 h-4" />
          Exportar
        </button>
        <button
          onClick={() => onAction('email')}
          className={`${neuro.btnSecondary} px-4 py-2 text-sm flex items-center gap-2`}
        >
          <Mail className="w-4 h-4" />
          Enviar Email
        </button>
        <button
          onClick={() => onAction('duplicar')}
          className={`${neuro.btnSecondary} px-4 py-2 text-sm flex items-center gap-2`}
        >
          <Copy className="w-4 h-4" />
          Duplicar
        </button>
      </div>

      <button
        onClick={onClearSelection}
        className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all"
      >
        <X className="w-5 h-5" />
      </button>
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
      case 'APROBADO': return 'bg-green-100 text-green-700';
      case 'PENDIENTE_APROBACION': return 'bg-amber-100 text-amber-700';
      case 'PENDIENTE_FIRMA': return 'bg-blue-100 text-blue-700';
      case 'EN_REVISION': return 'bg-purple-100 text-purple-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="p-5">
      {/* Header con select all */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={toggleSelectAll}
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800"
        >
          {selectAll ? (
            <CheckSquare className="w-5 h-5 text-indigo-600" />
          ) : (
            <Square className="w-5 h-5" />
          )}
          Seleccionar todo
        </button>
        <div className="flex items-center gap-2">
          <button className={`${neuro.btnSecondary} p-2`}>
            <Filter className="w-4 h-4" />
          </button>
          <button className={`${neuro.btnSecondary} p-2`}>
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Lista */}
      <div className="space-y-2">
        {mockContratos.map((contrato, idx) => (
          <motion.div
            key={contrato.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`
              ${neuro.inset} p-4 flex items-center gap-4
              ${selected.has(contrato.id) ? 'ring-2 ring-indigo-400 ring-offset-2' : ''}
              cursor-pointer hover:shadow-md transition-all
            `}
            onClick={() => toggleSelect(contrato.id)}
          >
            <button
              onClick={(e) => { e.stopPropagation(); toggleSelect(contrato.id); }}
              className={neuro.checkbox}
            >
              {selected.has(contrato.id) ? (
                <CheckSquare className="w-5 h-5 text-indigo-600" />
              ) : (
                <Square className="w-5 h-5 text-slate-400" />
              )}
            </button>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-800">{contrato.numero}</span>
                <span className={`${neuro.badge} ${getEstadoColor(contrato.estado)} text-xs`}>
                  {contrato.estado.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="text-sm text-slate-500">{contrato.cliente}</p>
            </div>

            <div className="text-right">
              <p className="font-bold text-slate-800">{formatCurrency(contrato.valor)}</p>
            </div>

            <button className="p-2 rounded-xl hover:bg-slate-200/50 text-slate-400">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
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
    ;
    // Aquí iría la lógica real de cada acción
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
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 p-6">
      {/* Header */}
      <div className="max-w-[1600px] mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-2xl ${neuro.widget}`}>
              <Layout className="w-7 h-7 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                🚀 Smart Workspace
                <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-medium">
                  AI Powered
                </span>
              </h1>
              <p className="text-slate-500 text-sm">Tu espacio de trabajo inteligente y personalizable</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button className={`${neuro.btnSecondary} px-4 py-2 flex items-center gap-2`}>
              <Settings className="w-4 h-4" />
              Personalizar
            </button>
            <button className={`${neuro.btnPrimary} px-4 py-2 flex items-center gap-2`}>
              <Plus className="w-4 h-4" />
              Agregar Widget
            </button>
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
              className={neuro.widget}
            >
              <div className={neuro.widgetHeader}>
                <h3 className="font-bold text-slate-800">{widget.titulo}</h3>
                <div className="flex items-center gap-1">
                  <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {renderWidget(widget)}
            </motion.div>
          ))}
        </div>

        {/* Lista de contratos con selección múltiple */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`${neuro.widget} mt-6`}
        >
          <div className={neuro.widgetHeader}>
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              📋 Mis Contratos
              <span className={`${neuro.badge} bg-indigo-100 text-indigo-700`}>
                {mockContratos.length}
              </span>
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Ordenado por IA según prioridad
              </span>
            </div>
          </div>
          <ContratosListWidget onSelectionChange={setSelectedContratos} />
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
