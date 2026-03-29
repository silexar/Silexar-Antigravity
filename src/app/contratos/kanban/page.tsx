/**
 * 🎯 SILEXAR PULSE - Pipeline Kanban Dashboard TIER 0
 * 
 * @description Dashboard ejecutivo con vista Kanban interactiva,
 * drag & drop, métricas por columna y acciones rápidas.
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
  { id: 'BORRADOR', titulo: 'Borrador', icono: '📋', color: 'text-slate-600', bgColor: 'bg-slate-50', borderColor: 'border-slate-200' },
  { id: 'NEGOCIACION', titulo: 'Negociación', icono: '📝', color: 'text-amber-600', bgColor: 'bg-amber-50', borderColor: 'border-amber-200' },
  { id: 'APROBACION', titulo: 'Aprobación', icono: '⏳', color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' },
  { id: 'FIRMADO', titulo: 'Firmado', icono: '✅', color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' }
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
    critico: 'border-l-red-500 bg-red-50/50',
    urgente: 'border-l-amber-500 bg-amber-50/50',
    normal: 'border-l-slate-300 bg-white'
  }[contrato.urgencia];

  return (
    <motion.div
      layout
      whileHover={{ scale: 1.02, y: -2 }}
      className={`p-3 rounded-xl border-l-4 border border-slate-200 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-shadow ${urgenciaColor} ${isDragging ? 'opacity-50 shadow-lg' : ''}`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-slate-800 truncate">{contrato.clienteNombre}</h4>
          <p className="text-xs text-slate-500 truncate">{contrato.campana}</p>
        </div>
        <button className="p-1 rounded hover:bg-slate-100">
          <MoreHorizontal className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      <div className="flex items-center justify-between mb-2">
        <span className="text-lg font-bold text-slate-800">{formatCurrency(contrato.valor)}</span>
        <span className="text-xs text-slate-500">{contrato.ejecutivoNombre}</span>
      </div>

      {/* Acción principal */}
      <div className="flex items-center justify-between">
        {contrato.acciones[0] && (
          <button
            onClick={(e) => { e.stopPropagation(); }}
            className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 ${
              contrato.acciones[0].urgente
                ? 'bg-red-100 text-red-700 animate-pulse'
                : contrato.acciones[0].tipo === 'pagar' && contrato.acciones[0].label === 'Pagado'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-slate-100 text-slate-700'
            }`}
          >
            {contrato.urgencia === 'critico' && <AlertTriangle className="w-3 h-3" />}
            {contrato.urgencia === 'urgente' && <Clock className="w-3 h-3" />}
            {contrato.acciones[0].tipo === 'pagar' && contrato.acciones[0].label === 'Pagado' && <CheckCircle2 className="w-3 h-3" />}
            {contrato.acciones[0].tipo === 'llamar' && <Phone className="w-3 h-3" />}
            {contrato.acciones[0].label}
          </button>
        )}
        <div className="flex items-center gap-1">
          <button onClick={onView} className="p-1 rounded hover:bg-slate-100" title="Ver">
            <Eye className="w-4 h-4 text-slate-400" />
          </button>
          <button onClick={onEdit} className="p-1 rounded hover:bg-slate-100" title="Editar">
            <Edit3 className="w-4 h-4 text-slate-400" />
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
  <div className={`p-3 rounded-t-xl ${columna.bgColor} border-b ${columna.borderColor}`}>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-xl">{columna.icono}</span>
        <span className={`font-bold ${columna.color}`}>{columna.titulo}</span>
        <span className="px-2 py-0.5 rounded-full bg-white text-slate-600 text-xs font-medium">
          {cantidad}
        </span>
      </div>
      <span className="text-sm font-bold text-slate-700">{formatCurrency(valorTotal)}</span>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-indigo-50/30">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                <LayoutGrid className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">🎯 Pipeline Comercial Visual</h1>
                <p className="text-slate-500 text-sm">Tiempo real • Drag & Drop activo</p>
              </div>
            </div>
            
            {/* Métricas rápidas */}
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-xs text-slate-500">Total Pipeline</p>
                <p className="text-2xl font-bold text-indigo-600">{formatCurrency(totalGeneral.valor)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">Contratos</p>
                <p className="text-2xl font-bold text-slate-800">{totalGeneral.cantidad}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1800px] mx-auto px-6 py-3 flex items-center justify-between gap-4">
          {/* Búsqueda y filtros */}
          <div className="flex items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar cliente o contrato..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-400/50"
              />
            </div>
            <select
              value={filtroEjecutivo}
              onChange={(e) => setFiltroEjecutivo(e.target.value)}
              className="px-4 py-2 rounded-xl border border-slate-200"
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
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium flex items-center gap-2 hover:shadow-lg transition-shadow"
            >
              <Plus className="w-4 h-4" />
              Nuevo
            </button>
            <button className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-medium flex items-center gap-2 hover:bg-slate-50">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={() => router.push('/contratos/comando')}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-medium flex items-center gap-2 hover:bg-slate-50"
            >
              <BarChart3 className="w-4 h-4" />
              Métricas
            </button>
            <button className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-medium flex items-center gap-2 hover:bg-slate-50">
              <Smartphone className="w-4 h-4" />
              Móvil
            </button>
          </div>
        </div>
      </div>

      {/* Kanban Grid */}
      <div className="max-w-[1800px] mx-auto px-6 py-6">
        <div className="grid grid-cols-4 gap-4">
          {columnas.map(columna => (
            <div
              key={columna.id}
              className={`rounded-xl border ${columna.borderColor} bg-white overflow-hidden`}
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
                  <div className="py-8 text-center text-slate-400">
                    <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Sin contratos</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer con resumen */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-800 text-white py-3 px-6">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            {columnas.map(col => (
              <div key={col.id} className="flex items-center gap-2">
                <span>{col.icono}</span>
                <span className="text-slate-400">{col.titulo}:</span>
                <span className="font-bold">{formatCurrency(totalesPorColumna[col.id]?.valor || 0)}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-400">Pipeline Total:</span>
            <span className="text-2xl font-bold text-emerald-400">{formatCurrency(totalGeneral.valor)}</span>
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
