/**
 * 📊 SILEXAR PULSE - Pipeline Kanban de Contratos TIER 0
 * 
 * @description Vista Kanban para gerentes comerciales con
 * contratos organizados por estado y métricas en tiempo real.
 * Paleta oficial: base #dfeaff | dark #bec8de | light #ffffff | accent #6888ff
 * 
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import React, { useState, useMemo } from 'react';
import { formatCurrency } from '@/lib/utils';
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
    color: '#69738c',
    bgColor: 'rgba(105,115,140,0.08)',
    borderColor: '#bec8de',
    iconBg: '#bec8de',
    valorTotal: 45000000,
    contratos: [
      { id: '1', numeroContrato: 'CON-2024-00152', anuncianteNombre: 'TechCorp SpA', tipoContrato: 'NUEVO', valorNeto: 25000000, moneda: 'CLP', ejecutivoNombre: 'Ana García', fechaCreacion: new Date(), nivelRiesgo: 'bajo', diasEnEstado: 2, tienePendientes: false },
      { id: '2', numeroContrato: 'CON-2024-00153', anuncianteNombre: 'Media Plus', tipoContrato: 'NUEVO', valorNeto: 20000000, moneda: 'CLP', ejecutivoNombre: 'Carlos Mendoza', fechaCreacion: new Date(), nivelRiesgo: 'bajo', diasEnEstado: 1, tienePendientes: false }
    ]
  },
  {
    id: 'revision_interna',
    nombre: 'Revisión Interna',
    color: '#3b82f6',
    bgColor: 'rgba(59,130,246,0.08)',
    borderColor: '#3b82f640',
    iconBg: '#93c5fd',
    valorTotal: 180000000,
    contratos: [
      { id: '3', numeroContrato: 'CON-2024-00145', anuncianteNombre: 'Banco Nacional S.A.', tipoContrato: 'RENOVACION', valorNeto: 180000000, moneda: 'CLP', ejecutivoNombre: 'Ana García', fechaCreacion: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), nivelRiesgo: 'medio', diasEnEstado: 3, tienePendientes: true, scoreRiesgo: 45 }
    ]
  },
  {
    id: 'aprobacion_interna',
    nombre: 'Aprobación',
    color: '#f59e0b',
    bgColor: 'rgba(245,158,11,0.08)',
    borderColor: '#f59e0b40',
    iconBg: '#fde68a',
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
    color: '#a855f7',
    bgColor: 'rgba(168,85,247,0.08)',
    borderColor: '#a855f740',
    iconBg: '#d8b4fe',
    valorTotal: 65000000,
    contratos: [
      { id: '7', numeroContrato: 'CON-2024-00138', anuncianteNombre: 'SuperMax SpA', tipoContrato: 'NUEVO', valorNeto: 65000000, moneda: 'CLP', ejecutivoNombre: 'Pedro Soto', fechaCreacion: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), nivelRiesgo: 'bajo', diasEnEstado: 2, tienePendientes: false, fechaLimite: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) }
    ]
  },
  {
    id: 'activo',
    nombre: 'Activo',
    color: '#22c55e',
    bgColor: 'rgba(34,197,94,0.08)',
    borderColor: '#22c55e40',
    iconBg: '#86efac',
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

const RiesgoBadge: React.FC<{ nivel: string; score?: number }> = ({ nivel, score }) => {
  const config = {
    bajo: { bg: 'rgba(34,197,94,0.12)', text: '#22c55e', label: 'Bajo' },
    medio: { bg: 'rgba(104,136,255,0.12)', text: '#6888ff', label: 'Medio' },
    alto: { bg: 'rgba(245,158,11,0.12)', text: '#f59e0b', label: 'Alto' },
    critico: { bg: 'rgba(239,68,68,0.12)', text: '#ef4444', label: 'Crítico' }
  }[nivel] || { bg: 'rgba(154,163,184,0.12)', text: N.textSub, label: nivel };

  return (
    <span className="px-2 py-0.5 rounded-lg text-xs font-bold" style={{ background: config.bg, color: config.text, boxShadow: insetSm }}>
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
    className="p-4 rounded-2xl cursor-grab active:cursor-grabbing"
    style={{ background: N.base, boxShadow: neuSm }}
    whileHover={{ y: -2 }}
  >
    <div className="flex items-start justify-between mb-3">
      <div>
        <p className="text-xs font-mono font-bold" style={{ color: N.accent }}>{contrato.numeroContrato}</p>
        <h4 className="font-bold text-sm mt-0.5" style={{ color: N.text }}>{contrato.anuncianteNombre}</h4>
      </div>
      <div className="relative group">
        <button className="p-1.5 rounded-xl transition-all" style={{ background: N.base, boxShadow: neuXs }}>
          <MoreHorizontal className="w-4 h-4" style={{ color: N.textSub }} />
        </button>
        <div className="absolute right-0 mt-1 w-32 rounded-xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10" style={{ background: N.base, boxShadow: neu }}>
          <button onClick={onView} className="w-full px-3 py-2 text-left text-sm font-bold flex items-center gap-2 transition-all hover:bg-[#6888ff]/10" style={{ color: N.text }}>
            <Eye className="w-4 h-4" /> Ver
          </button>
          <button onClick={onEdit} className="w-full px-3 py-2 text-left text-sm font-bold flex items-center gap-2 transition-all hover:bg-[#6888ff]/10" style={{ color: N.text }}>
            <Edit3 className="w-4 h-4" /> Editar
          </button>
        </div>
      </div>
    </div>
    
    <div className="flex items-center justify-between mb-3">
      <span className="text-lg font-black" style={{ color: N.accent }}>{formatCurrency(contrato.valorNeto)}</span>
      <RiesgoBadge nivel={contrato.nivelRiesgo} score={contrato.scoreRiesgo} />
    </div>
    
    <div className="flex items-center justify-between text-xs" style={{ color: N.textSub }}>
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
      <div className="mt-3 flex items-center gap-1 text-xs font-bold" style={{ color: '#f59e0b' }}>
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
  <div className="flex-shrink-0 w-80 rounded-2xl overflow-hidden" style={{ background: N.base, boxShadow: neu }}>
    {/* Header */}
    <div className="p-4" style={{ background: estado.bgColor, borderBottom: `1px solid ${estado.borderColor}` }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ background: estado.iconBg }} />
          <h3 className="font-bold text-sm" style={{ color: estado.color }}>{estado.nombre}</h3>
        </div>
        <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: N.base, boxShadow: neuXs, color: N.text }}>
          {estado.contratos.length}
        </span>
      </div>
      <p className="text-sm font-black" style={{ color: N.text }}>
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
          <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: N.base, boxShadow: inset }}>
            <FileText className="w-6 h-6" style={{ color: N.textSub }} />
          </div>
          <p className="text-sm" style={{ color: N.textSub }}>Sin contratos</p>
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
    <div className="min-h-screen flex flex-col" style={{ background: N.base }}>
      {/* Header */}
      <header className="shrink-0 px-6 py-4" style={{ background: N.base, boxShadow: neuSm }}>
        <div className="max-w-[1800px] mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl" style={{ background: N.base, boxShadow: neuSm }}>
                <Columns3 className="w-7 h-7" style={{ color: N.accent }} />
              </div>
              <div>
                <h1 className="text-2xl font-black" style={{ color: N.text }}>Pipeline de Contratos</h1>
                <p className="text-sm flex items-center gap-2" style={{ color: N.textSub }}>
                  <Sparkles className="w-4 h-4" style={{ color: N.accent }} />
                  Vista Kanban en tiempo real
                </p>
              </div>
            </div>
            
            {/* Métricas rápidas */}
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-2xl font-black" style={{ color: N.accent }}>{totales.contratos}</p>
                <p className="text-xs" style={{ color: N.textSub }}>Contratos en pipeline</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black" style={{ color: '#22c55e' }}>{formatCurrency(totales.valor)}</p>
                <p className="text-xs" style={{ color: N.textSub }}>Valor total</p>
              </div>
              {totales.pendientes > 0 && (
                <div className="text-right">
                  <p className="text-2xl font-black" style={{ color: '#f59e0b' }}>{totales.pendientes}</p>
                  <p className="text-xs" style={{ color: N.textSub }}>Con pendientes</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Filtros */}
          <div className="flex flex-col lg:flex-row items-center gap-4 mt-4">
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: N.textSub }} />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar contratos..."
                aria-label="Buscar contratos"
                className="w-full rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none"
                style={{ background: N.base, boxShadow: inset, color: N.text }}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" style={{ color: N.textSub }} />
              <select
                value={filtroEjecutivo}
                onChange={(e) => setFiltroEjecutivo(e.target.value)}
                className="rounded-xl py-2.5 px-4 text-sm focus:outline-none cursor-pointer"
                style={{ background: N.base, boxShadow: inset, color: N.text }}
              >
                <option value="todos">Todos los ejecutivos</option>
                {ejecutivos.map(ej => (
                  <option key={ej} value={ej}>{ej}</option>
                ))}
              </select>
            </div>
            
            <button 
              className="px-4 py-2.5 rounded-xl font-bold text-sm text-white transition-all flex items-center gap-2"
              style={{ background: N.accent, boxShadow: neuSm }}
            >
              <RefreshCw className="w-4 h-4" />
              Actualizar
            </button>
          </div>
        </div>
      </header>
      
      {/* Pipeline Kanban */}
      <main className="flex-1 p-6 overflow-x-auto">
        <div className="max-w-[1800px] mx-auto">
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
      </main>
      
      {/* Footer con predicciones */}
      <footer className="shrink-0 px-6 py-3" style={{ background: N.base, boxShadow: `0 -4px 16px ${N.dark}40` }}>
        <div className="max-w-[1800px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5" style={{ color: '#f59e0b' }} />
              <span className="text-sm" style={{ color: N.text }}>
                <strong>Predicción:</strong> 3 contratos listos para firma esta semana
              </span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" style={{ color: '#22c55e' }} />
              <span className="text-sm" style={{ color: N.text }}>
                <strong>Conversión:</strong> 78% promedio del mes
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm" style={{ color: N.textSub }}>
            <span>Última actualización: hace 2 minutos</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
