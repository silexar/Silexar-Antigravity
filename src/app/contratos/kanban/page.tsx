/**
 * 🎯 SILEXAR PULSE - Pipeline Kanban Dashboard TIER 0
 * 
 * @description Dashboard ejecutivo con vista Kanban interactiva,
 * drag & drop, métricas por columna y acciones rápidas.
 * Paleta oficial: base #dfeaff | dark #bec8de | light #ffffff | accent #6888ff
 * 
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import React, { useState, useMemo, useCallback } from 'react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  LayoutGrid,
  Plus,
  RefreshCw,
  BarChart3,
  Smartphone,
  Search,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Phone,
  MoreHorizontal,
  Edit3,
  Eye,
  Sparkles,
  Target
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

type EstadoKanban = 'BORRADOR' | 'NEGOCIACION' | 'APROBACION' | 'FIRMADO';

interface ContratoKanban {
  id: string;
  numeroContrato: string;
  clienteNombre: string;
  campana: string;
  valor: number;
  ejecutivoNombre: string;
  ejecutivoId: string;
  estado: EstadoKanban;
  urgencia: 'critico' | 'urgente' | 'normal';
  horasRestantes?: number;
  scoreRiesgo: number;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  acciones: AccionRapida[];
}

interface AccionRapida {
  tipo: 'editar' | 'llamar' | 'email' | 'aprobar' | 'firmar' | 'pagar';
  label: string;
  urgente?: boolean;
}

interface ColumnaKanban {
  id: EstadoKanban;
  titulo: string;
  icono: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

// ═══════════════════════════════════════════════════════════════
// CONFIGURACIÓN
// ═══════════════════════════════════════════════════════════════

const columnas: ColumnaKanban[] = [
  { id: 'BORRADOR', titulo: 'Borrador', icono: '📋', color: '#69738c', bgColor: 'rgba(105,115,140,0.08)', borderColor: '#bec8de' },
  { id: 'NEGOCIACION', titulo: 'Negociación', icono: '📝', color: '#6888ff', bgColor: 'rgba(245,158,11,0.08)', borderColor: '#6888ff40' },
  { id: 'APROBACION', titulo: 'Aprobación', icono: '⏳', color: '#f97316', bgColor: 'rgba(249,115,22,0.08)', borderColor: '#f9731640' },
  { id: 'FIRMADO', titulo: 'Firmado', icono: '✅', color: '#6888ff', bgColor: 'rgba(34,197,94,0.08)', borderColor: '#6888ff40' }
];

// ═══════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════

const mockContratos: ContratoKanban[] = [
  {
    id: '1', numeroContrato: 'CON-2025-00123', clienteNombre: 'SuperMax', campana: 'Navidad 2025',
    valor: 15000000, ejecutivoNombre: 'Ana G.', ejecutivoId: 'ej-001', estado: 'BORRADOR',
    urgencia: 'normal', scoreRiesgo: 750, fechaCreacion: new Date(), fechaActualizacion: new Date(),
    acciones: [{ tipo: 'editar', label: 'Editar' }]
  },
  {
    id: '2', numeroContrato: 'CON-2025-00124', clienteNombre: 'Retail Plus', campana: 'Black Friday',
    valor: 8000000, ejecutivoNombre: 'Carlos M.', ejecutivoId: 'ej-002', estado: 'BORRADOR',
    urgencia: 'normal', scoreRiesgo: 680, fechaCreacion: new Date(), fechaActualizacion: new Date(),
    acciones: [{ tipo: 'editar', label: 'Nuevo' }]
  },
  {
    id: '3', numeroContrato: 'CON-2025-00125', clienteNombre: 'Banco XYZ', campana: 'Cuentas Premium',
    valor: 85000000, ejecutivoNombre: 'Carlos M.', ejecutivoId: 'ej-002', estado: 'NEGOCIACION',
    urgencia: 'critico', horasRestantes: 2, scoreRiesgo: 920, fechaCreacion: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), fechaActualizacion: new Date(),
    acciones: [{ tipo: 'llamar', label: 'Llamar', urgente: true }]
  },
  {
    id: '4', numeroContrato: 'CON-2025-00126', clienteNombre: 'Farmacia XYZ', campana: 'Salud 2025',
    valor: 45000000, ejecutivoNombre: 'Ana G.', ejecutivoId: 'ej-001', estado: 'NEGOCIACION',
    urgencia: 'urgente', scoreRiesgo: 780, fechaCreacion: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), fechaActualizacion: new Date(),
    acciones: [{ tipo: 'llamar', label: 'Llamar' }]
  },
  {
    id: '5', numeroContrato: 'CON-2025-00127', clienteNombre: 'AutoMax', campana: 'Autos 2025',
    valor: 35000000, ejecutivoNombre: 'Roberto S.', ejecutivoId: 'ej-003', estado: 'APROBACION',
    urgencia: 'urgente', horasRestantes: 24, scoreRiesgo: 850, fechaCreacion: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), fechaActualizacion: new Date(),
    acciones: [{ tipo: 'aprobar', label: '1 día' }]
  },
  {
    id: '6', numeroContrato: 'CON-2025-00128', clienteNombre: 'TechCorp', campana: 'Tech Summit',
    valor: 95000000, ejecutivoNombre: 'Ana G.', ejecutivoId: 'ej-001', estado: 'FIRMADO',
    urgencia: 'normal', scoreRiesgo: 820, fechaCreacion: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), fechaActualizacion: new Date(),
    acciones: [{ tipo: 'pagar', label: 'Hoy', urgente: true }]
  },
  {
    id: '7', numeroContrato: 'CON-2025-00129', clienteNombre: 'Inmobiliaria', campana: 'Proyectos 2025',
    valor: 120000000, ejecutivoNombre: 'Roberto S.', ejecutivoId: 'ej-003', estado: 'FIRMADO',
    urgencia: 'normal', scoreRiesgo: 900, fechaCreacion: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), fechaActualizacion: new Date(),
    acciones: [{ tipo: 'pagar', label: 'Pagado' }]
  }
];

// ═══════════════════════════════════════════════════════════════
// COMPONENTES AUXILIARES
// ═══════════════════════════════════════════════════════════════

const formatCurrency = (value: number) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(0)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
};

const ContratoCard: React.FC<{
  contrato: ContratoKanban;
  onView: () => void;
  onEdit: () => void;
  isDragging?: boolean;
}> = ({ contrato, onView, onEdit, isDragging }) => {
  const urgenciaColor = {
    critico: { border: '#9aa3b8', bg: 'rgba(239,68,68,0.04)' },
    urgente: { border: '#6888ff', bg: 'rgba(245,158,11,0.04)' },
    normal: { border: '#bec8de', bg: 'transparent' }
  }[contrato.urgencia];

  return (
    <motion.div
      layout
      whileHover={{ scale: 1.02, y: -2 }}
      className={`p-3 rounded-2xl cursor-grab active:cursor-grabbing transition-all ${isDragging ? 'opacity-50' : ''}`}
      style={{ 
        background: N.base, 
        boxShadow: neuSm,
        borderLeft: `4px solid ${urgenciaColor.border}`
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-sm truncate" style={{ color: N.text }}>{contrato.clienteNombre}</h4>
          <p className="text-xs truncate" style={{ color: N.textSub }}>{contrato.campana}</p>
        </div>
        <button className="p-1 rounded-xl transition-all" style={{ background: N.base, boxShadow: neuXs }}>
          <MoreHorizontal className="w-4 h-4" style={{ color: N.textSub }} />
        </button>
      </div>

      <div className="flex items-center justify-between mb-2">
        <span className="text-lg font-black" style={{ color: N.text }}>{formatCurrency(contrato.valor)}</span>
        <span className="text-xs" style={{ color: N.textSub }}>{contrato.ejecutivoNombre}</span>
      </div>

      {/* Acción principal */}
      <div className="flex items-center justify-between">
        {contrato.acciones[0] && (
          <span
            className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${
              contrato.acciones[0].urgente
                ? 'animate-pulse'
                : ''
            }`}
            style={{
              background: contrato.acciones[0].urgente ? 'rgba(239,68,68,0.12)' : contrato.acciones[0].tipo === 'pagar' && contrato.acciones[0].label === 'Pagado' ? 'rgba(34,197,94,0.12)' : N.base,
              color: contrato.acciones[0].urgente ? '#9aa3b8' : contrato.acciones[0].tipo === 'pagar' && contrato.acciones[0].label === 'Pagado' ? '#6888ff' : N.text,
              boxShadow: contrato.acciones[0].urgente ? 'none' : insetSm
            }}
          >
            {contrato.urgencia === 'critico' && <AlertTriangle className="w-3 h-3" />}
            {contrato.urgencia === 'urgente' && <Clock className="w-3 h-3" />}
            {contrato.acciones[0].tipo === 'pagar' && contrato.acciones[0].label === 'Pagado' && <CheckCircle2 className="w-3 h-3" />}
            {contrato.acciones[0].tipo === 'llamar' && <Phone className="w-3 h-3" />}
            {contrato.acciones[0].label}
          </span>
        )}
        <div className="flex items-center gap-1">
          <button onClick={onView} className="p-1.5 rounded-xl transition-all hover:scale-110" style={{ background: N.base, boxShadow: neuXs }} title="Ver">
            <Eye className="w-4 h-4" style={{ color: N.accent }} />
          </button>
          <button onClick={onEdit} className="p-1.5 rounded-xl transition-all hover:scale-110" style={{ background: N.base, boxShadow: neuXs }} title="Editar">
            <Edit3 className="w-4 h-4" style={{ color: '#6888ff' }} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const ColumnaHeader: React.FC<{
  columna: ColumnaKanban;
  cantidad: number;
  valorTotal: number;
}> = ({ columna, cantidad, valorTotal }) => (
  <div className="p-3 rounded-t-2xl" style={{ background: columna.bgColor, borderBottom: `1px solid ${columna.borderColor}` }}>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-xl">{columna.icono}</span>
        <span className="font-bold text-sm" style={{ color: columna.color }}>{columna.titulo}</span>
        <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: N.base, boxShadow: neuXs, color: N.text }}>
          {cantidad}
        </span>
      </div>
      <span className="text-sm font-black" style={{ color: N.text }}>{formatCurrency(valorTotal)}</span>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function KanbanDashboard() {
  const router = useRouter();
  const [contratos, setContratos] = useState<ContratoKanban[]>(mockContratos);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEjecutivo, setFiltroEjecutivo] = useState<string>('todos');
  const [draggingId, setDraggingId] = useState<string | null>(null);

  // Agrupar contratos por estado
  const contratosPorEstado = useMemo(() => {
    const filtrados = contratos.filter(c => {
      if (busqueda) {
        const query = busqueda.toLowerCase();
        if (!c.clienteNombre.toLowerCase().includes(query) && 
            !c.numeroContrato.toLowerCase().includes(query)) return false;
      }
      if (filtroEjecutivo !== 'todos' && c.ejecutivoId !== filtroEjecutivo) return false;
      return true;
    });

    return columnas.reduce((acc, col) => {
      acc[col.id] = filtrados.filter(c => c.estado === col.id);
      return acc;
    }, {} as Record<EstadoKanban, ContratoKanban[]>);
  }, [contratos, busqueda, filtroEjecutivo]);

  // Calcular totales por columna
  const totalesPorColumna = useMemo(() => {
    return columnas.reduce((acc, col) => {
      const contratosCol = contratosPorEstado[col.id] || [];
      acc[col.id] = {
        cantidad: contratosCol.length,
        valor: contratosCol.reduce((sum, c) => sum + c.valor, 0)
      };
      return acc;
    }, {} as Record<EstadoKanban, { cantidad: number; valor: number }>);
  }, [contratosPorEstado]);

  // Total general
  const totalGeneral = useMemo(() => ({
    cantidad: contratos.length,
    valor: contratos.reduce((sum, c) => sum + c.valor, 0)
  }), [contratos]);

  const handleDragEnd = useCallback((contratoId: string, nuevoEstado: EstadoKanban) => {
    setContratos(prev => prev.map(c => 
      c.id === contratoId ? { ...c, estado: nuevoEstado } : c
    ));
    setDraggingId(null);
  }, []);

  const ejecutivosUnicos = useMemo(() => {
    const map = new Map<string, string>();
    contratos.forEach(c => map.set(c.ejecutivoId, c.ejecutivoNombre));
    return Array.from(map.entries()).map(([id, nombre]) => ({ id, nombre }));
  }, [contratos]);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: N.base }}>
      {/* Header */}
      <header className="shrink-0 px-6 py-4" style={{ background: N.base, boxShadow: neuSm }}>
        <div className="max-w-[1800px] mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl" style={{ background: N.base, boxShadow: neuSm }}>
                <LayoutGrid className="w-7 h-7" style={{ color: N.accent }} />
              </div>
              <div>
                <h1 className="text-2xl font-black" style={{ color: N.text }}>🎯 Pipeline Comercial Visual</h1>
                <p className="text-sm" style={{ color: N.textSub }}>Tiempo real • Drag & Drop activo</p>
              </div>
            </div>
            
            {/* Métricas rápidas */}
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-xs" style={{ color: N.textSub }}>Total Pipeline</p>
                <p className="text-2xl font-black" style={{ color: N.accent }}>{formatCurrency(totalGeneral.valor)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs" style={{ color: N.textSub }}>Contratos</p>
                <p className="text-2xl font-black" style={{ color: N.text }}>{totalGeneral.cantidad}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <div className="px-6 py-3" style={{ background: N.base, borderBottom: `1px solid ${N.dark}30` }}>
        <div className="max-w-[1800px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Búsqueda y filtros */}
          <div className="flex items-center gap-3 flex-1 w-full">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: N.textSub }} />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar cliente o contrato..."
                aria-label="Buscar cliente o contrato"
                className="w-full rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none"
                style={{ background: N.base, boxShadow: inset, color: N.text }}
              />
            </div>
            <select
              value={filtroEjecutivo}
              onChange={(e) => setFiltroEjecutivo(e.target.value)}
              className="rounded-xl py-2.5 px-4 text-sm focus:outline-none cursor-pointer"
              style={{ background: N.base, boxShadow: inset, color: N.text }}
            >
              <option value="todos">Todos los ejecutivos</option>
              {ejecutivosUnicos.map(ej => (
                <option key={ej.id} value={ej.id}>{ej.nombre}</option>
              ))}
            </select>
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push('/contratos/nuevo')}
              className="px-4 py-2.5 rounded-xl font-bold text-sm text-white transition-all flex items-center gap-2"
              style={{ background: N.accent, boxShadow: neuSm }}
            >
              <Plus className="w-4 h-4" />
              Nuevo
            </button>
            <button 
              className="px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2"
              style={{ background: N.base, boxShadow: neuSm, color: N.text }}
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={() => router.push('/contratos/comando')}
              className="px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2"
              style={{ background: N.base, boxShadow: neuSm, color: N.text }}
            >
              <BarChart3 className="w-4 h-4" />
              Métricas
            </button>
            <button 
              className="px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2"
              style={{ background: N.base, boxShadow: neuSm, color: N.text }}
            >
              <Smartphone className="w-4 h-4" />
              Móvil
            </button>
          </div>
        </div>
      </div>

      {/* Kanban Grid */}
      <main className="flex-1 p-6 overflow-x-auto">
        <div className="max-w-[1800px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {columnas.map(columna => (
              <div
                key={columna.id}
                className="rounded-2xl overflow-hidden"
                style={{ background: N.base, boxShadow: neu }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const contratoId = e.dataTransfer.getData('contratoId');
                  if (contratoId) {
                    handleDragEnd(contratoId, columna.id);
                  }
                }}
              >
                <ColumnaHeader
                  columna={columna}
                  cantidad={totalesPorColumna[columna.id]?.cantidad || 0}
                  valorTotal={totalesPorColumna[columna.id]?.valor || 0}
                />

                <div className="p-3 space-y-3 min-h-[400px]">
                  <AnimatePresence>
                    {contratosPorEstado[columna.id]?.map(contrato => (
                      <div
                        key={contrato.id}
                        draggable
                        onDragStart={(e) => {
                          setDraggingId(contrato.id);
                          e.dataTransfer.setData('contratoId', contrato.id);
                        }}
                        onDragEnd={() => setDraggingId(null)}
                      >
                        <ContratoCard
                          contrato={contrato}
                          onView={() => router.push(`/contratos/${contrato.id}`)}
                          onEdit={() => router.push(`/contratos/${contrato.id}/editar`)}
                          isDragging={draggingId === contrato.id}
                        />
                      </div>
                    ))}
                  </AnimatePresence>

                  {(contratosPorEstado[columna.id]?.length || 0) === 0 && (
                    <div className="py-8 text-center">
                      <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: N.base, boxShadow: inset }}>
                        <Target className="w-6 h-6" style={{ color: N.textSub }} />
                      </div>
                      <p className="text-sm" style={{ color: N.textSub }}>Sin contratos</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer con resumen */}
      <footer className="shrink-0 px-6 py-3" style={{ background: N.base, boxShadow: `0 -4px 16px ${N.dark}40` }}>
        <div className="max-w-[1800px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6 flex-wrap">
            {columnas.map(col => (
              <div key={col.id} className="flex items-center gap-2">
                <span>{col.icono}</span>
                <span className="text-xs" style={{ color: N.textSub }}>{col.titulo}:</span>
                <span className="font-bold text-sm" style={{ color: N.text }}>{formatCurrency(totalesPorColumna[col.id]?.valor || 0)}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs" style={{ color: N.textSub }}>Pipeline Total:</span>
            <span className="text-2xl font-black" style={{ color: '#6888ff' }}>{formatCurrency(totalGeneral.valor)}</span>
            <Sparkles className="w-5 h-5" style={{ color: '#6888ff' }} />
          </div>
        </div>
      </footer>
    </div>
  );
}
