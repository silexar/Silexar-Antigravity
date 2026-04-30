/**
 * 📊 SILEXAR PULSE - Custom Reports Builder TIER 0
 * 
 * @description Constructor de reportes personalizados que permite
 * a cada usuario crear sus propios dashboards y reportes.
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
  tiempo_aprobacion: 18,
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
            <p className="text-4xl font-black" style={{ color: N.text }}>
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
                  <span className="text-xs w-20 truncate" style={{ color: N.textSub }}>{item.estado || item.cliente}</span>
                  <div className="flex-1 h-4 rounded-full overflow-hidden" style={{ background: N.base, boxShadow: inset }}>
                    <div 
                      className="h-full rounded-full"
                      style={{ width: `${((item.cantidad || item.valor || 0) / max) * 100}%`, background: N.accent }}
                    />
                  </div>
                  <span className="text-xs font-bold w-16 text-right" style={{ color: N.text }}>
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
          const colores = ['#6888ff', '#a855f7', '#6888ff', '#6888ff', '#9aa3b8'];
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
                  <div key={idx} className="flex items-center gap-2 text-xs" style={{ color: N.text }}>
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
                <div key={idx} className="flex items-center justify-between py-2" style={{ borderBottom: `1px solid ${N.dark}20` }}>
                  <span className="font-bold" style={{ color: N.text }}>{item.nombre || String((item as Record<string, unknown>).estado ?? '') || String((item as Record<string, unknown>).cliente ?? '')}</span>
                  <span style={{ color: N.textSub }}>
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
            <div className="h-4 rounded-full overflow-hidden" style={{ background: N.base, boxShadow: inset }}>
              <div 
                className="h-full rounded-full"
                style={{ width: `${Math.min(valor, 100)}%`, background: '#6888ff' }}
              />
            </div>
            <p className="text-center mt-2 text-2xl font-black" style={{ color: N.text }}>{valor}%</p>
          </div>
        );
      }
    }
    return <p className="text-center py-4" style={{ color: N.textSub }}>Sin datos</p>;
  };

  return (
    <motion.div
      layout
      className={`p-4 rounded-2xl ${getTamañoGrid(widget.tamaño)}`}
      style={{ background: N.base, boxShadow: neuSm, borderTop: `3px solid ${widget.color || N.accent}` }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 cursor-grab" style={{ color: N.textSub }} />
          <h4 className="font-bold text-sm" style={{ color: N.text }}>{widget.titulo}</h4>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onEdit} className="p-1.5 rounded-xl transition-all" style={{ background: N.base, boxShadow: neuXs, color: N.textSub }}>
            <Settings className="w-4 h-4" />
          </button>
          <button onClick={onRemove} className="p-1.5 rounded-xl transition-all" style={{ background: N.base, boxShadow: neuXs, color: '#9aa3b8' }}>
            <X className="w-4 h-4" />
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
      { id: 'w-1', tipo: 'metric', titulo: 'Contratos Creados', metrica: 'contratos_creados', tamaño: 'sm', orden: 1, color: '#6888ff' },
      { id: 'w-2', tipo: 'metric', titulo: 'Valor Total', metrica: 'valor_total', tamaño: 'sm', orden: 2, color: '#6888ff' },
      { id: 'w-3', tipo: 'metric', titulo: 'Tasa Conversión', metrica: 'tasa_conversion', tamaño: 'sm', orden: 3, color: '#a855f7' },
      { id: 'w-4', tipo: 'metric', titulo: 'Vencimientos', metrica: 'vencimientos_proximos', tamaño: 'sm', orden: 4, color: '#6888ff' },
      { id: 'w-5', tipo: 'bar_chart', titulo: 'Por Estado', metrica: 'contratos_por_estado', tamaño: 'md', orden: 5, color: '#6888ff' },
      { id: 'w-6', tipo: 'pie_chart', titulo: 'Por Medio', metrica: 'contratos_por_medio', tamaño: 'md', orden: 6, color: '#a855f7' },
      { id: 'w-7', tipo: 'list', titulo: 'Top Clientes', metrica: 'top_clientes', tamaño: 'lg', orden: 7, color: '#6888ff' }
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
      color: N.accent
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
    <div className="min-h-screen p-6 lg:p-8" style={{ background: N.base }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <NeuCard className="p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl" style={{ background: N.base, boxShadow: neu }}>
                <BarChart3 className="w-8 h-8" style={{ color: N.accent }} />
              </div>
              <div>
                <input
                  type="text"
                  value={reporte.nombre}
                  onChange={e => setReporte({ ...reporte, nombre: e.target.value })}
                  aria-label="Nombre del reporte"
                  className="text-2xl font-black bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-[#6888ff]/30 rounded px-2 -ml-2"
                  style={{ color: N.text }}
                />
                <p className="text-sm" style={{ color: N.textSub }}>Constructor de reportes personalizados</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={reporte.periodo}
                onChange={e => setReporte({ ...reporte, periodo: e.target.value as ReportePersonalizado['periodo'] })}
                className="rounded-xl py-2.5 px-4 text-sm focus:outline-none cursor-pointer"
                style={{ background: N.base, boxShadow: inset, color: N.text }}
              >
                <option value="dia">Hoy</option>
                <option value="semana">Esta semana</option>
                <option value="mes">Este mes</option>
                <option value="trimestre">Este trimestre</option>
                <option value="año">Este año</option>
              </select>
              
              <NeuButton variant="secondary" className="p-2">
                <RefreshCw className="w-5 h-5" />
              </NeuButton>
              <NeuButton variant="secondary" className="p-2">
                <Share2 className="w-5 h-5" />
              </NeuButton>
              <NeuButton variant="secondary" className="p-2">
                <Download className="w-5 h-5" />
              </NeuButton>
              <NeuButton variant="primary" onClick={() => setShowAddWidget(true)}>
                <Plus className="w-5 h-5" />
                Agregar widget
              </NeuButton>
            </div>
          </div>
        </NeuCard>

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
          <NeuCard className="p-12 text-center">
            <div className="w-16 h-16 rounded-3xl mx-auto mb-4 flex items-center justify-center" style={{ background: N.base, boxShadow: inset }}>
              <BarChart3 className="w-8 h-8" style={{ color: N.textSub }} />
            </div>
            <p className="mb-4" style={{ color: N.textSub }}>No hay widgets en este reporte</p>
            <NeuButton variant="primary" onClick={() => setShowAddWidget(true)}>
              Agregar primer widget
            </NeuButton>
          </NeuCard>
        )}
      </div>

      {/* Modal agregar widget */}
      <AnimatePresence>
        {showAddWidget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50"
            style={{ background: 'rgba(104,136,255,0.08)', backdropFilter: 'blur(4px)' }}
            onClick={() => setShowAddWidget(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto rounded-3xl"
              style={{ background: N.base, boxShadow: neu }}
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-xl font-black mb-4" style={{ color: N.text }}>Agregar Widget</h3>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Tipo de widget */}
                <div>
                  <p className="text-sm font-bold mb-2" style={{ color: N.textSub }}>Tipo de visualización</p>
                  <div className="space-y-2">
                    {WIDGETS_CATALOGO.map(w => (
                      <button
                        key={w.tipo}
                        className="w-full p-3 rounded-2xl flex items-center gap-3 transition-all"
                        style={{ background: N.base, boxShadow: neuSm }}
                      >
                        <div className="p-2 rounded-xl" style={{ background: `${N.accent}18`, color: N.accent }}>
                          {w.icon}
                        </div>
                        <span className="font-bold text-sm" style={{ color: N.text }}>{w.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Métrica */}
                <div>
                  <p className="text-sm font-bold mb-2" style={{ color: N.textSub }}>Métrica a mostrar</p>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {METRICAS_CATALOGO.map(m => (
                      <button
                        key={m.id}
                        onClick={() => handleAddWidget('bar_chart', m.id)}
                        className="w-full p-3 rounded-2xl text-left transition-all"
                        style={{ background: N.base, boxShadow: neuSm }}
                      >
                        <p className="font-bold text-sm" style={{ color: N.text }}>{m.label}</p>
                        <p className="text-xs" style={{ color: N.textSub }}>{m.categoria}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <NeuButton variant="secondary" onClick={() => setShowAddWidget(false)}>
                  Cancelar
                </NeuButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
