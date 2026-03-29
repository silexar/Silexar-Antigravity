/**
 * 📊 SILEXAR PULSE - Custom Reports Builder TIER 0
 * 
 * @description Constructor de reportes personalizados que permite
 * a cada usuario crear sus propios dashboards y reportes.
 * 
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Table,
  FileText,
  Download,
  Plus,
  X,
  GripVertical,
  Settings,
  RefreshCw,
  Share2
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

type TipoWidget = 
  | 'metric'
  | 'bar_chart'
  | 'pie_chart'
  | 'line_chart'
  | 'table'
  | 'list'
  | 'calendar'
  | 'progress';

type MetricaDisponible = 
  | 'contratos_creados'
  | 'contratos_aprobados'
  | 'valor_total'
  | 'valor_promedio'
  | 'descuento_promedio'
  | 'tiempo_aprobacion'
  | 'tasa_conversion'
  | 'contratos_por_estado'
  | 'contratos_por_cliente'
  | 'contratos_por_medio'
  | 'vencimientos_proximos'
  | 'top_clientes';

interface Widget {
  id: string;
  tipo: TipoWidget;
  titulo: string;
  metrica: MetricaDisponible;
  tamaño: 'sm' | 'md' | 'lg' | 'xl';
  orden: number;
  configuracion?: Record<string, unknown>;
  color?: string;
}

interface ReportePersonalizado {
  id: string;
  nombre: string;
  descripcion?: string;
  widgets: Widget[];
  filtros: FiltroReporte[];
  periodo: 'dia' | 'semana' | 'mes' | 'trimestre' | 'año' | 'custom';
  fechaInicio?: Date;
  fechaFin?: Date;
  compartido: boolean;
  creadorId: string;
  creadorNombre: string;
  fechaCreacion: Date;
  ultimaModificacion: Date;
}

interface FiltroReporte {
  campo: string;
  operador: 'eq' | 'neq' | 'gt' | 'lt' | 'contains' | 'in';
  valor: unknown;
}

// ═══════════════════════════════════════════════════════════════
// ESTILOS NEUROMORPHIC
// ═══════════════════════════════════════════════════════════════

const neuro = {
  panel: `
    bg-gradient-to-br from-slate-50 to-slate-100
    rounded-3xl
    shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff]
    border border-slate-200/50
  `,
  card: `
    bg-gradient-to-br from-white to-slate-50
    rounded-2xl
    shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]
    border border-slate-200/30
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
  `
};

// ═══════════════════════════════════════════════════════════════
// WIDGETS DISPONIBLES
// ═══════════════════════════════════════════════════════════════

const WIDGETS_CATALOGO: { tipo: TipoWidget; label: string; icon: React.ReactNode }[] = [
  { tipo: 'metric', label: 'Métrica', icon: <TrendingUp className="w-5 h-5" /> },
  { tipo: 'bar_chart', label: 'Barras', icon: <BarChart3 className="w-5 h-5" /> },
  { tipo: 'pie_chart', label: 'Torta', icon: <PieChart className="w-5 h-5" /> },
  { tipo: 'line_chart', label: 'Líneas', icon: <TrendingUp className="w-5 h-5" /> },
  { tipo: 'table', label: 'Tabla', icon: <Table className="w-5 h-5" /> },
  { tipo: 'list', label: 'Lista', icon: <FileText className="w-5 h-5" /> },
  { tipo: 'progress', label: 'Progreso', icon: <BarChart3 className="w-5 h-5" /> }
];

const METRICAS_CATALOGO: { id: MetricaDisponible; label: string; categoria: string }[] = [
  { id: 'contratos_creados', label: 'Contratos creados', categoria: 'Volumen' },
  { id: 'contratos_aprobados', label: 'Contratos aprobados', categoria: 'Volumen' },
  { id: 'valor_total', label: 'Valor total gestionado', categoria: 'Financiero' },
  { id: 'valor_promedio', label: 'Valor promedio', categoria: 'Financiero' },
  { id: 'descuento_promedio', label: 'Descuento promedio', categoria: 'Financiero' },
  { id: 'tiempo_aprobacion', label: 'Tiempo de aprobación', categoria: 'Eficiencia' },
  { id: 'tasa_conversion', label: 'Tasa de conversión', categoria: 'Eficiencia' },
  { id: 'contratos_por_estado', label: 'Por estado', categoria: 'Distribución' },
  { id: 'contratos_por_cliente', label: 'Por cliente', categoria: 'Distribución' },
  { id: 'contratos_por_medio', label: 'Por medio', categoria: 'Distribución' },
  { id: 'vencimientos_proximos', label: 'Vencimientos próximos', categoria: 'Alertas' },
  { id: 'top_clientes', label: 'Top clientes', categoria: 'Ranking' }
];

// ═══════════════════════════════════════════════════════════════
// MOCK DATA PARA WIDGETS
// ═══════════════════════════════════════════════════════════════

const mockDatos: Record<MetricaDisponible, unknown> = {
  contratos_creados: 156,
  contratos_aprobados: 134,
  valor_total: 8500000000,
  valor_promedio: 54487179,
  descuento_promedio: 12.5,
  tiempo_aprobacion: 18, // horas
  tasa_conversion: 86,
  contratos_por_estado: [
    { estado: 'Borrador', cantidad: 12 },
    { estado: 'En revisión', cantidad: 8 },
    { estado: 'Aprobado', cantidad: 45 },
    { estado: 'Activo', cantidad: 78 },
    { estado: 'Finalizado', cantidad: 13 }
  ],
  contratos_por_cliente: [
    { cliente: 'Banco Chile', valor: 1200000000 },
    { cliente: 'Falabella', valor: 950000000 },
    { cliente: 'Cencosud', valor: 800000000 },
    { cliente: 'Ripley', valor: 650000000 },
    { cliente: 'Paris', valor: 500000000 }
  ],
  contratos_por_medio: [
    { medio: 'Radio FM', porcentaje: 35 },
    { medio: 'Digital', porcentaje: 30 },
    { medio: 'TV', porcentaje: 20 },
    { medio: 'Prensa', porcentaje: 10 },
    { medio: 'Otros', porcentaje: 5 }
  ],
  vencimientos_proximos: 8,
  top_clientes: [
    { nombre: 'Banco Chile', contratos: 23, valor: 1200000000 },
    { nombre: 'Falabella', contratos: 18, valor: 950000000 },
    { nombre: 'Cencosud', contratos: 15, valor: 800000000 }
  ]
};

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

const formatCurrency = (value: number) => {
  if (value >= 1000000000) return `$${(value / 1000000000).toFixed(1)}B`;
  if (value >= 1000000) return `$${(value / 1000000).toFixed(0)}M`;
  return `$${(value / 1000).toFixed(0)}K`;
};

const getTamañoGrid = (tamaño: Widget['tamaño']) => {
  switch (tamaño) {
    case 'sm': return 'col-span-1';
    case 'md': return 'col-span-2';
    case 'lg': return 'col-span-3';
    case 'xl': return 'col-span-4';
    default: return 'col-span-1';
  }
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTE WIDGET
// ═══════════════════════════════════════════════════════════════

const WidgetRender: React.FC<{
  widget: Widget;
  onRemove: () => void;
  onEdit: () => void;
}> = ({ widget, onRemove, onEdit }) => {
  const datos = mockDatos[widget.metrica];

  const renderContent = () => {
    switch (widget.tipo) {
      case 'metric':
        return (
          <div className="text-center py-6">
            <p className="text-4xl font-bold text-slate-800">
              {typeof datos === 'number' 
                ? widget.metrica.includes('valor') 
                  ? formatCurrency(datos)
                  : widget.metrica.includes('tiempo')
                    ? `${datos}h`
                    : widget.metrica.includes('porcentaje') || widget.metrica.includes('tasa') || widget.metrica.includes('descuento')
                      ? `${datos}%`
                      : datos
                : String(datos)}
            </p>
          </div>
        );

      case 'bar_chart':
        if (Array.isArray(datos)) {
          const max = Math.max(...(datos as { cantidad?: number; valor?: number }[]).map(d => d.cantidad || d.valor || 0));
          return (
            <div className="space-y-2 py-2">
              {(datos as { estado?: string; cliente?: string; cantidad?: number; valor?: number }[]).slice(0, 5).map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 w-20 truncate">{item.estado || item.cliente}</span>
                  <div className="flex-1 h-4 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                      style={{ width: `${((item.cantidad || item.valor || 0) / max) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 w-16 text-right">
                    {item.cantidad || (item.valor ? formatCurrency(item.valor) : '')}
                  </span>
                </div>
              ))}
            </div>
          );
        }
        break;

      case 'pie_chart':
        if (Array.isArray(datos)) {
          const colores = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#f472b6'];
          return (
            <div className="flex items-center gap-4 py-2">
              <div className="relative w-24 h-24">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  {(datos as { medio: string; porcentaje: number }[]).reduce((acc, item, idx) => {
                    const offset = acc.offset;
                    acc.elements.push(
                      <circle
                        key={idx}
                        cx="18" cy="18" r="15.915"
                        fill="none"
                        stroke={colores[idx % colores.length]}
                        strokeWidth="3"
                        strokeDasharray={`${item.porcentaje} ${100 - item.porcentaje}`}
                        strokeDashoffset={-offset}
                      />
                    );
                    acc.offset += item.porcentaje;
                    return acc;
                  }, { elements: [] as React.ReactNode[], offset: 0 }).elements}
                </svg>
              </div>
              <div className="space-y-1">
                {(datos as { medio: string; porcentaje: number }[]).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: colores[idx % colores.length] }} />
                    <span>{item.medio}: {item.porcentaje}%</span>
                  </div>
                ))}
              </div>
            </div>
          );
        }
        break;

      case 'list':
      case 'table':
        if (Array.isArray(datos)) {
          return (
            <div className="text-xs">
              {(datos as { nombre: string; contratos?: number; valor?: number }[]).slice(0, 5).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <span className="font-medium">{item.nombre || String((item as Record<string, unknown>).estado ?? '') || String((item as Record<string, unknown>).cliente ?? '')}</span>
                  <span className="text-slate-500">
                    {item.contratos ? `${item.contratos} contratos` : ''}
                    {item.valor ? formatCurrency(item.valor) : ''}
                    {(item as Record<string, unknown>).cantidad ? String((item as Record<string, unknown>).cantidad) : ''}
                  </span>
                </div>
              ))}
            </div>
          );
        }
        break;

      case 'progress': {
        const valor = typeof datos === 'number' ? datos : 0;
        return (
          <div className="py-4">
            <div className="h-4 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                style={{ width: `${Math.min(valor, 100)}%` }}
              />
            </div>
            <p className="text-center mt-2 text-2xl font-bold text-slate-800">{valor}%</p>
          </div>
        );
      }
    }
    return <p className="text-slate-400 text-sm text-center py-4">Sin datos</p>;
  };

  return (
    <motion.div
      layout
      className={`${neuro.card} p-4 ${getTamañoGrid(widget.tamaño)}`}
      style={{ borderTop: `3px solid ${widget.color || '#6366f1'}` }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-slate-300 cursor-grab" />
          <h4 className="font-semibold text-sm text-slate-800">{widget.titulo}</h4>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onEdit} className="p-1 hover:bg-slate-100 rounded">
            <Settings className="w-4 h-4 text-slate-400" />
          </button>
          <button onClick={onRemove} className="p-1 hover:bg-red-100 rounded">
            <X className="w-4 h-4 text-slate-400 hover:text-red-500" />
          </button>
        </div>
      </div>
      {renderContent()}
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function ReportsBuilderPage() {
  const [reporte, setReporte] = useState<ReportePersonalizado>({
    id: 'rep-001',
    nombre: 'Mi Reporte Semanal',
    widgets: [
      { id: 'w-1', tipo: 'metric', titulo: 'Contratos Creados', metrica: 'contratos_creados', tamaño: 'sm', orden: 1, color: '#6366f1' },
      { id: 'w-2', tipo: 'metric', titulo: 'Valor Total', metrica: 'valor_total', tamaño: 'sm', orden: 2, color: '#22c55e' },
      { id: 'w-3', tipo: 'metric', titulo: 'Tasa Conversión', metrica: 'tasa_conversion', tamaño: 'sm', orden: 3, color: '#8b5cf6' },
      { id: 'w-4', tipo: 'metric', titulo: 'Vencimientos', metrica: 'vencimientos_proximos', tamaño: 'sm', orden: 4, color: '#f59e0b' },
      { id: 'w-5', tipo: 'bar_chart', titulo: 'Por Estado', metrica: 'contratos_por_estado', tamaño: 'md', orden: 5, color: '#6366f1' },
      { id: 'w-6', tipo: 'pie_chart', titulo: 'Por Medio', metrica: 'contratos_por_medio', tamaño: 'md', orden: 6, color: '#8b5cf6' },
      { id: 'w-7', tipo: 'list', titulo: 'Top Clientes', metrica: 'top_clientes', tamaño: 'lg', orden: 7, color: '#22c55e' }
    ],
    filtros: [],
    periodo: 'semana',
    compartido: false,
    creadorId: 'user-demo',
    creadorNombre: 'Carlos Mendoza',
    fechaCreacion: new Date(),
    ultimaModificacion: new Date()
  });
  
  const [showAddWidget, setShowAddWidget] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_editando, setEditando] = useState(false);

  const handleAddWidget = (tipo: TipoWidget, metrica: MetricaDisponible) => {
    const nuevoWidget: Widget = {
      id: `w-${Date.now()}`,
      tipo,
      titulo: METRICAS_CATALOGO.find(m => m.id === metrica)?.label || 'Nuevo Widget',
      metrica,
      tamaño: tipo === 'metric' ? 'sm' : 'md',
      orden: reporte.widgets.length + 1,
      color: '#6366f1'
    };
    setReporte({
      ...reporte,
      widgets: [...reporte.widgets, nuevoWidget]
    });
    setShowAddWidget(false);
  };

  const handleRemoveWidget = (widgetId: string) => {
    setReporte({
      ...reporte,
      widgets: reporte.widgets.filter(w => w.id !== widgetId)
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`${neuro.panel} p-6 mb-6`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div>
                <input
                  type="text"
                  value={reporte.nombre}
                  onChange={e => setReporte({ ...reporte, nombre: e.target.value })}
                  className="text-2xl font-bold text-slate-800 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded px-2 -ml-2"
                />
                <p className="text-slate-500">Constructor de reportes personalizados</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={reporte.periodo}
                onChange={e => setReporte({ ...reporte, periodo: e.target.value as ReportePersonalizado['periodo'] })}
                className={`${neuro.btnSecondary} px-4 py-2`}
              >
                <option value="dia">Hoy</option>
                <option value="semana">Esta semana</option>
                <option value="mes">Este mes</option>
                <option value="trimestre">Este trimestre</option>
                <option value="año">Este año</option>
              </select>
              
              <button className={`${neuro.btnSecondary} p-2`} title="Refrescar">
                <RefreshCw className="w-5 h-5" />
              </button>
              <button className={`${neuro.btnSecondary} p-2`} title="Compartir">
                <Share2 className="w-5 h-5" />
              </button>
              <button className={`${neuro.btnSecondary} p-2`} title="Exportar">
                <Download className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setShowAddWidget(true)}
                className={`${neuro.btnPrimary} px-4 py-2 flex items-center gap-2`}
              >
                <Plus className="w-5 h-5" />
                Agregar widget
              </button>
            </div>
          </div>
        </div>

        {/* Grid de widgets */}
        <div className="grid grid-cols-4 gap-6">
          <AnimatePresence>
            {reporte.widgets.map(widget => (
              <WidgetRender
                key={widget.id}
                widget={widget}
                onRemove={() => handleRemoveWidget(widget.id)}
                onEdit={() => setEditando(true)}
              />
            ))}
          </AnimatePresence>
        </div>

        {reporte.widgets.length === 0 && (
          <div className={`${neuro.card} p-12 text-center`}>
            <BarChart3 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 mb-4">No hay widgets en este reporte</p>
            <button 
              onClick={() => setShowAddWidget(true)}
              className={`${neuro.btnPrimary} px-6 py-3`}
            >
              Agregar primer widget
            </button>
          </div>
        )}
      </div>

      {/* Modal agregar widget */}
      <AnimatePresence>
        {showAddWidget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowAddWidget(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className={`${neuro.panel} p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto`}
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-slate-800 mb-4">Agregar Widget</h3>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Tipo de widget */}
                <div>
                  <p className="text-sm font-semibold text-slate-600 mb-2">Tipo de visualización</p>
                  <div className="space-y-2">
                    {WIDGETS_CATALOGO.map(w => (
                      <button
                        key={w.tipo}
                        className={`${neuro.card} w-full p-3 flex items-center gap-3 hover:ring-2 hover:ring-indigo-400`}
                      >
                        <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                          {w.icon}
                        </div>
                        <span className="font-medium">{w.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Métrica */}
                <div>
                  <p className="text-sm font-semibold text-slate-600 mb-2">Métrica a mostrar</p>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {METRICAS_CATALOGO.map(m => (
                      <button
                        key={m.id}
                        onClick={() => handleAddWidget('bar_chart', m.id)}
                        className={`${neuro.card} w-full p-3 text-left hover:ring-2 hover:ring-indigo-400`}
                      >
                        <p className="font-medium text-slate-800">{m.label}</p>
                        <p className="text-xs text-slate-500">{m.categoria}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowAddWidget(false)}
                  className={`${neuro.btnSecondary} px-4 py-2`}
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
