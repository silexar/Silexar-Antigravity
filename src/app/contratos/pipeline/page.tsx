/**
 * 📊 SILEXAR PULSE - Pipeline Kanban de Contratos TIER 0
 * 
 * @description Vista Kanban para gerentes comerciales con
 * contratos organizados por estado y métricas en tiempo real.
 * 
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Columns3,
  Clock,
  User,
  AlertTriangle,
  FileText,
  TrendingUp,
  Filter,
  Search,
  RefreshCw,
  MoreHorizontal,
  Eye,
  Edit3,
  Sparkles,
  Zap
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface ContratoPipeline {
  id: string;
  numeroContrato: string;
  anuncianteNombre: string;
  tipoContrato: string;
  valorNeto: number;
  moneda: string;
  ejecutivoNombre: string;
  fechaCreacion: Date;
  fechaLimite?: Date;
  nivelRiesgo: 'bajo' | 'medio' | 'alto' | 'critico';
  diasEnEstado: number;
  tienePendientes: boolean;
  scoreRiesgo?: number;
}

interface EstadoPipeline {
  id: string;
  nombre: string;
  color: string;
  bgColor: string;
  borderColor: string;
  iconBg: string;
  contratos: ContratoPipeline[];
  valorTotal: number;
}

// ═══════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════

const mockPipeline: EstadoPipeline[] = [
  {
    id: 'borrador',
    nombre: 'Borrador',
    color: 'text-slate-600',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
    iconBg: 'bg-slate-100',
    valorTotal: 45000000,
    contratos: [
      { id: '1', numeroContrato: 'CON-2024-00152', anuncianteNombre: 'TechCorp SpA', tipoContrato: 'NUEVO', valorNeto: 25000000, moneda: 'CLP', ejecutivoNombre: 'Ana García', fechaCreacion: new Date(), nivelRiesgo: 'bajo', diasEnEstado: 2, tienePendientes: false },
      { id: '2', numeroContrato: 'CON-2024-00153', anuncianteNombre: 'Media Plus', tipoContrato: 'NUEVO', valorNeto: 20000000, moneda: 'CLP', ejecutivoNombre: 'Carlos Mendoza', fechaCreacion: new Date(), nivelRiesgo: 'bajo', diasEnEstado: 1, tienePendientes: false }
    ]
  },
  {
    id: 'revision_interna',
    nombre: 'Revisión Interna',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    iconBg: 'bg-blue-100',
    valorTotal: 180000000,
    contratos: [
      { id: '3', numeroContrato: 'CON-2024-00145', anuncianteNombre: 'Banco Nacional S.A.', tipoContrato: 'RENOVACION', valorNeto: 180000000, moneda: 'CLP', ejecutivoNombre: 'Ana García', fechaCreacion: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), nivelRiesgo: 'medio', diasEnEstado: 3, tienePendientes: true, scoreRiesgo: 45 }
    ]
  },
  {
    id: 'aprobacion_interna',
    nombre: 'Aprobación',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    iconBg: 'bg-amber-100',
    valorTotal: 320000000,
    contratos: [
      { id: '4', numeroContrato: 'CON-2024-00140', anuncianteNombre: 'Retail Chile', tipoContrato: 'NUEVO', valorNeto: 150000000, moneda: 'CLP', ejecutivoNombre: 'Pedro Soto', fechaCreacion: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), nivelRiesgo: 'alto', diasEnEstado: 5, tienePendientes: true, scoreRiesgo: 72 },
      { id: '5', numeroContrato: 'CON-2024-00141', anuncianteNombre: 'AutoMax Ltda', tipoContrato: 'ENMIENDA', valorNeto: 85000000, moneda: 'CLP', ejecutivoNombre: 'Ana García', fechaCreacion: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), nivelRiesgo: 'bajo', diasEnEstado: 2, tienePendientes: false },
      { id: '6', numeroContrato: 'CON-2024-00142', anuncianteNombre: 'FoodCo SpA', tipoContrato: 'NUEVO', valorNeto: 85000000, moneda: 'CLP', ejecutivoNombre: 'Carlos Mendoza', fechaCreacion: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), nivelRiesgo: 'medio', diasEnEstado: 1, tienePendientes: false }
    ]
  },
  {
    id: 'firma',
    nombre: 'Firma',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    iconBg: 'bg-purple-100',
    valorTotal: 65000000,
    contratos: [
      { id: '7', numeroContrato: 'CON-2024-00138', anuncianteNombre: 'SuperMax SpA', tipoContrato: 'NUEVO', valorNeto: 65000000, moneda: 'CLP', ejecutivoNombre: 'Pedro Soto', fechaCreacion: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), nivelRiesgo: 'bajo', diasEnEstado: 2, tienePendientes: false, fechaLimite: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) }
    ]
  },
  {
    id: 'activo',
    nombre: 'Activo',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    iconBg: 'bg-emerald-100',
    valorTotal: 890000000,
    contratos: [
      { id: '8', numeroContrato: 'CON-2024-00120', anuncianteNombre: 'Telecom Chile', tipoContrato: 'RENOVACION', valorNeto: 450000000, moneda: 'CLP', ejecutivoNombre: 'Ana García', fechaCreacion: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), nivelRiesgo: 'bajo', diasEnEstado: 15, tienePendientes: false },
      { id: '9', numeroContrato: 'CON-2024-00125', anuncianteNombre: 'EnergyMax', tipoContrato: 'NUEVO', valorNeto: 280000000, moneda: 'CLP', ejecutivoNombre: 'Carlos Mendoza', fechaCreacion: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), nivelRiesgo: 'bajo', diasEnEstado: 10, tienePendientes: false },
      { id: '10', numeroContrato: 'CON-2024-00130', anuncianteNombre: 'FinanceGroup', tipoContrato: 'RENOVACION', valorNeto: 160000000, moneda: 'CLP', ejecutivoNombre: 'Pedro Soto', fechaCreacion: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), nivelRiesgo: 'bajo', diasEnEstado: 8, tienePendientes: false }
    ]
  }
];

// ═══════════════════════════════════════════════════════════════
// COMPONENTES
// ═══════════════════════════════════════════════════════════════

const formatCurrency = (value: number) => {
  if (value >= 1000000000) return `$${(value / 1000000000).toFixed(1)}B`;
  if (value >= 1000000) return `$${(value / 1000000).toFixed(0)}M`;
  return `$${value.toLocaleString()}`;
};

const RiesgoBadge: React.FC<{ nivel: string; score?: number }> = ({ nivel, score }) => {
  const config = {
    bajo: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Bajo' },
    medio: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Medio' },
    alto: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Alto' },
    critico: { bg: 'bg-red-100', text: 'text-red-700', label: 'Crítico' }
  }[nivel] || { bg: 'bg-slate-100', text: 'text-slate-700', label: nivel };

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${config.bg} ${config.text}`}>
      {score ? `${score}%` : config.label}
    </span>
  );
};

const ContratoCard: React.FC<{
  contrato: ContratoPipeline;
  onView: () => void;
  onEdit: () => void;
}> = ({ contrato, onView, onEdit }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing"
    whileHover={{ y: -2 }}
  >
    <div className="flex items-start justify-between mb-3">
      <div>
        <p className="text-xs text-slate-400 font-mono">{contrato.numeroContrato}</p>
        <h4 className="font-semibold text-slate-800 mt-0.5">{contrato.anuncianteNombre}</h4>
      </div>
      <div className="relative group">
        <button className="p-1 rounded hover:bg-slate-100 transition-colors">
          <MoreHorizontal className="w-4 h-4 text-slate-400" />
        </button>
        <div className="absolute right-0 mt-1 w-32 bg-white rounded-lg shadow-xl border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
          <button onClick={onView} className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
            <Eye className="w-4 h-4" /> Ver
          </button>
          <button onClick={onEdit} className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
            <Edit3 className="w-4 h-4" /> Editar
          </button>
        </div>
      </div>
    </div>
    
    <div className="flex items-center justify-between mb-3">
      <span className="text-lg font-bold text-indigo-600">{formatCurrency(contrato.valorNeto)}</span>
      <RiesgoBadge nivel={contrato.nivelRiesgo} score={contrato.scoreRiesgo} />
    </div>
    
    <div className="flex items-center justify-between text-xs text-slate-500">
      <div className="flex items-center gap-1">
        <User className="w-3 h-3" />
        <span>{contrato.ejecutivoNombre}</span>
      </div>
      <div className="flex items-center gap-1">
        <Clock className="w-3 h-3" />
        <span>{contrato.diasEnEstado}d</span>
      </div>
    </div>
    
    {contrato.tienePendientes && (
      <div className="mt-3 flex items-center gap-1 text-xs text-amber-600">
        <AlertTriangle className="w-3 h-3" />
        <span>Tiene pendientes</span>
      </div>
    )}
  </motion.div>
);

const ColumnaPipeline: React.FC<{
  estado: EstadoPipeline;
  onContratoView: (id: string) => void;
  onContratoEdit: (id: string) => void;
}> = ({ estado, onContratoView, onContratoEdit }) => (
  <div className={`flex-shrink-0 w-80 rounded-2xl ${estado.bgColor} border ${estado.borderColor} overflow-hidden`}>
    {/* Header */}
    <div className="p-4 border-b border-slate-200/50">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${estado.iconBg}`} />
          <h3 className={`font-semibold ${estado.color}`}>{estado.nombre}</h3>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-white text-slate-600 text-xs font-medium shadow-sm">
          {estado.contratos.length}
        </span>
      </div>
      <p className={`text-sm font-medium ${estado.color}`}>
        {formatCurrency(estado.valorTotal)}
      </p>
    </div>
    
    {/* Contratos */}
    <div className="p-3 space-y-3 max-h-[600px] overflow-y-auto">
      <AnimatePresence>
        {estado.contratos.map(contrato => (
          <ContratoCard
            key={contrato.id}
            contrato={contrato}
            onView={() => onContratoView(contrato.id)}
            onEdit={() => onContratoEdit(contrato.id)}
          />
        ))}
      </AnimatePresence>
      
      {estado.contratos.length === 0 && (
        <div className="p-8 text-center">
          <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-400">Sin contratos</p>
        </div>
      )}
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function PipelinePage() {
  const [pipeline] = useState<EstadoPipeline[]>(mockPipeline);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEjecutivo, setFiltroEjecutivo] = useState<string>('todos');
  
  const totales = useMemo(() => {
    return {
      contratos: pipeline.reduce((acc, e) => acc + e.contratos.length, 0),
      valor: pipeline.reduce((acc, e) => acc + e.valorTotal, 0),
      pendientes: pipeline.reduce((acc, e) => acc + e.contratos.filter(c => c.tienePendientes).length, 0)
    };
  }, [pipeline]);
  
  const ejecutivos = useMemo(() => {
    const set = new Set<string>();
    pipeline.forEach(e => e.contratos.forEach(c => set.add(c.ejecutivoNombre)));
    return Array.from(set);
  }, [pipeline]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-indigo-50/30">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600">
                <Columns3 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Pipeline de Contratos</h1>
                <p className="text-slate-500 text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  Vista Kanban en tiempo real
                </p>
              </div>
            </div>
            
            {/* Métricas rápidas */}
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-2xl font-bold text-indigo-600">{totales.contratos}</p>
                <p className="text-xs text-slate-500">Contratos en pipeline</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totales.valor)}</p>
                <p className="text-xs text-slate-500">Valor total</p>
              </div>
              {totales.pendientes > 0 && (
                <div className="text-right">
                  <p className="text-2xl font-bold text-amber-600">{totales.pendientes}</p>
                  <p className="text-xs text-slate-500">Con pendientes</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Filtros */}
          <div className="flex items-center gap-4 mt-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar contratos..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-400/50"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={filtroEjecutivo}
                onChange={(e) => setFiltroEjecutivo(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
              >
                <option value="todos">Todos los ejecutivos</option>
                {ejecutivos.map(ej => (
                  <option key={ej} value={ej}>{ej}</option>
                ))}
              </select>
            </div>
            
            <button className="px-4 py-2 rounded-xl bg-indigo-500 text-white font-medium flex items-center gap-2 hover:bg-indigo-600 transition-colors">
              <RefreshCw className="w-4 h-4" />
              Actualizar
            </button>
          </div>
        </div>
      </div>
      
      {/* Pipeline Kanban */}
      <div className="max-w-[1800px] mx-auto px-6 py-6">
        <div className="flex gap-4 overflow-x-auto pb-4">
          {pipeline.map(estado => (
            <ColumnaPipeline
              key={estado.id}
              estado={estado}
              onContratoView={(id) => {}}
              onContratoEdit={(id) => {}}
            />
          ))}
        </div>
      </div>
      
      {/* Footer con predicciones */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              <span className="text-sm text-slate-600">
                <strong>Predicción:</strong> 3 contratos listos para firma esta semana
              </span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              <span className="text-sm text-slate-600">
                <strong>Conversión:</strong> 78% promedio del mes
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Última actualización: hace 2 minutos</span>
          </div>
        </div>
      </div>
    </div>
  );
}
