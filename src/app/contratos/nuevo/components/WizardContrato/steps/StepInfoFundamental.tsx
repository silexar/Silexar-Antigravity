/**
 * 📋 SILEXAR PULSE - Paso 1: Información Fundamental TIER 0
 * 
 * @description Primer paso del wizard - Datos básicos del contrato,
 * selección de anunciante con inteligencia y productos.
 * 
 * @version 2025.3.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Search,
  Package,
  Calendar,
  User,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Shield,
  Plus,
  X,
  Sparkles,
  Info,
  Star,
  Briefcase,
  Radio
} from 'lucide-react';
import { 
  WizardContratoState, 
  WizardAction, 
  TipoContrato,
  MedioContrato,
  AnuncianteSeleccionado,
  ProductoContrato
} from '../types/wizard.types';

// ═══════════════════════════════════════════════════════════════
// COMPONENTES NEUROMÓRFICOS BASE
// ═══════════════════════════════════════════════════════════════

const NeuromorphicInput: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ElementType;
  error?: string;
  required?: boolean;
  type?: 'text' | 'date' | 'number';
  className?: string;
}> = ({ label, value, onChange, placeholder, icon: Icon, error, required, type = 'text', className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    <label className="block text-sm font-medium text-slate-600">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={label}
        className={`
          w-full rounded-xl py-3.5 bg-slate-50
          shadow-[inset_4px_4px_8px_rgba(0,0,0,0.06),inset_-4px_-4px_8px_rgba(255,255,255,0.8)]
          border-2 ${error ? 'border-red-400' : 'border-transparent'}
          outline-none focus:ring-2 focus:ring-indigo-400/50
          text-slate-700 placeholder-slate-400
          transition-all duration-200
          ${Icon ? 'pl-12 pr-4' : 'px-4'}
        `}
      />
    </div>
    {error && (
      <motion.p 
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-sm text-red-500 flex items-center gap-1"
      >
        <AlertCircle className="w-3.5 h-3.5" />
        {error}
      </motion.p>
    )}
  </div>
);

const NeuromorphicTextarea: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}> = ({ label, value, onChange, placeholder, rows = 3 }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-slate-600">{label}</label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="
        w-full rounded-xl py-3.5 px-4 bg-slate-50
        shadow-[inset_4px_4px_8px_rgba(0,0,0,0.06),inset_-4px_-4px_8px_rgba(255,255,255,0.8)]
        border-2 border-transparent
        outline-none focus:ring-2 focus:ring-indigo-400/50
        text-slate-700 placeholder-slate-400
        transition-all duration-200 resize-none
      "
    />
  </div>
);

// ═══════════════════════════════════════════════════════════════
// SELECTOR DE TIPO DE CONTRATO
// ═══════════════════════════════════════════════════════════════

const tiposContrato: { tipo: TipoContrato; titulo: string; descripcion: string; icono: React.ElementType; color: string }[] = [
  { tipo: 'nuevo', titulo: 'Nuevo Contrato', descripcion: 'Cliente nuevo o campaña nueva', icono: Plus, color: 'from-indigo-400 to-indigo-600' },
  { tipo: 'renovacion', titulo: 'Renovación', descripcion: 'Basado en contrato existente', icono: TrendingUp, color: 'from-emerald-400 to-emerald-600' },
  { tipo: 'programatico', titulo: 'Programático', descripcion: 'Campañas de alto volumen', icono: Sparkles, color: 'from-purple-400 to-purple-600' },
  { tipo: 'marco_anual', titulo: 'Marco Anual', descripcion: 'Cliente corporativo recurrente', icono: Briefcase, color: 'from-amber-400 to-amber-600' },
  { tipo: 'express', titulo: 'Express', descripcion: 'Creación rápida móvil', icono: Star, color: 'from-rose-400 to-rose-600' }
];

const TipoContratoSelector: React.FC<{
  selected: TipoContrato;
  onSelect: (tipo: TipoContrato) => void;
}> = ({ selected, onSelect }) => (
  <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
    {tiposContrato.map(({ tipo, titulo, descripcion, icono: Icon, color }) => (
      <motion.button
        key={tipo}
        onClick={() => onSelect(tipo)}
        className={`
          relative p-4 rounded-2xl text-left transition-all duration-300
          ${selected === tipo
            ? `bg-gradient-to-br ${color} text-white shadow-lg`
            : 'bg-slate-50 hover:bg-slate-100 shadow-[4px_4px_12px_rgba(0,0,0,0.08),-4px_-4px_12px_rgba(255,255,255,0.9)]'
          }
        `}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
      >
        <Icon className={`w-6 h-6 mb-2 ${selected === tipo ? 'text-white' : 'text-slate-500'}`} />
        <h4 className={`font-semibold text-sm ${selected === tipo ? 'text-white' : 'text-slate-700'}`}>
          {titulo}
        </h4>
        <p className={`text-xs mt-1 ${selected === tipo ? 'text-white/80' : 'text-slate-400'}`}>
          {descripcion}
        </p>
        {selected === tipo && (
          <motion.div
            layoutId="tipoIndicator"
            className="absolute top-2 right-2"
          >
            <CheckCircle2 className="w-5 h-5 text-white" />
          </motion.div>
        )}
      </motion.button>
    ))}
  </div>
);

// ═══════════════════════════════════════════════════════════════
// SELECTOR DE MEDIO
// ═══════════════════════════════════════════════════════════════

const mediosContrato: { id: MedioContrato; label: string; desc: string; icono: React.ElementType; color: string }[] = [
  { id: 'fm', label: 'Radio FM', desc: 'Contrato tradicional de radio', icono: Radio, color: 'from-blue-400 to-blue-600' },
  { id: 'digital', label: 'Digital', desc: 'Campañas 100% digitales', icono: Sparkles, color: 'from-purple-400 to-purple-600' },
  { id: 'hibrido', label: 'Híbrido', desc: 'Radio + Digital combinado', icono: Briefcase, color: 'from-emerald-400 to-emerald-600' }
];

const MedioSelector: React.FC<{
  selected: MedioContrato;
  onSelect: (medio: MedioContrato) => void;
}> = ({ selected, onSelect }) => (
  <div className="grid grid-cols-3 gap-3">
    {mediosContrato.map(({ id, label, desc, icono: Icon, color }) => (
      <motion.button
        key={id}
        onClick={() => onSelect(id)}
        className={`
          relative p-4 rounded-2xl text-left transition-all duration-300
          ${selected === id
            ? `bg-gradient-to-br ${color} text-white shadow-lg`
            : 'bg-slate-50 hover:bg-slate-100 shadow-[4px_4px_12px_rgba(0,0,0,0.08),-4px_-4px_12px_rgba(255,255,255,0.9)]'
          }
        `}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
      >
        <Icon className={`w-6 h-6 mb-2 ${selected === id ? 'text-white' : 'text-slate-500'}`} />
        <h4 className={`font-semibold text-sm ${selected === id ? 'text-white' : 'text-slate-700'}`}>
          {label}
        </h4>
        <p className={`text-xs mt-1 ${selected === id ? 'text-white/80' : 'text-slate-400'}`}>
          {desc}
        </p>
        {selected === id && (
          <motion.div className="absolute top-2 right-2">
            <CheckCircle2 className="w-5 h-5 text-white" />
          </motion.div>
        )}
      </motion.button>
    ))}
  </div>
);

// ═══════════════════════════════════════════════════════════════
// SELECTOR DE ANUNCIANTE
// ═══════════════════════════════════════════════════════════════

// Mock data para anunciantes
const mockAnunciantes: AnuncianteSeleccionado[] = [
  {
    id: 'anun-001',
    nombre: 'SuperMax SpA',
    rut: '76.123.456-7',
    scoreRiesgo: 850,
    nivelRiesgo: 'bajo',
    terminosPreferenciales: { diasPago: 30, limiteCredito: 50000000, descuentoMaximo: 15 },
    historialContratos: { total: 12, exitosos: 12, valorHistorico: 450000000 },
    ejecutivoAsignado: { id: 'ej-001', nombre: 'Ana García', email: 'ana.garcia@silexar.com' },
    industria: 'Retail',
    esAgencia: false
  },
  {
    id: 'anun-002',
    nombre: 'Banco Nacional S.A.',
    rut: '97.654.321-K',
    scoreRiesgo: 920,
    nivelRiesgo: 'bajo',
    terminosPreferenciales: { diasPago: 45, limiteCredito: 200000000, descuentoMaximo: 20 },
    historialContratos: { total: 25, exitosos: 25, valorHistorico: 1200000000 },
    ejecutivoAsignado: { id: 'ej-002', nombre: 'Carlos Mendoza', email: 'carlos.mendoza@silexar.com' },
    industria: 'Banca',
    esAgencia: false
  },
  {
    id: 'anun-003',
    nombre: 'TechStart SpA',
    rut: '76.987.654-3',
    scoreRiesgo: 620,
    nivelRiesgo: 'medio',
    terminosPreferenciales: { diasPago: 15, limiteCredito: 10000000, descuentoMaximo: 10 },
    historialContratos: { total: 2, exitosos: 2, valorHistorico: 15000000 },
    industria: 'Tecnología',
    esAgencia: false
  },
  {
    id: 'anun-004',
    nombre: 'AutoMax Chile S.A.',
    rut: '96.555.444-2',
    scoreRiesgo: 780,
    nivelRiesgo: 'bajo',
    terminosPreferenciales: { diasPago: 30, limiteCredito: 80000000, descuentoMaximo: 18 },
    historialContratos: { total: 8, exitosos: 7, valorHistorico: 320000000 },
    ejecutivoAsignado: { id: 'ej-003', nombre: 'Roberto Silva', email: 'roberto.silva@silexar.com' },
    industria: 'Automotriz',
    esAgencia: false
  }
];

const SelectorAnunciante: React.FC<{
  selected: AnuncianteSeleccionado | null;
  onSelect: (anunciante: AnuncianteSeleccionado | null) => void;
}> = ({ selected, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const anunciantes = mockAnunciantes;
  
  const filteredAnunciantes = anunciantes.filter(a =>
    a.nombre.toLowerCase().includes(search.toLowerCase()) ||
    a.rut.includes(search)
  );
  
  const getRiesgoColor = (nivel: string) => {
    switch (nivel) {
      case 'bajo': return 'from-emerald-400 to-emerald-500';
      case 'medio': return 'from-amber-400 to-amber-500';
      case 'alto': return 'from-orange-400 to-orange-500';
      case 'critico': return 'from-red-400 to-red-500';
      default: return 'from-slate-400 to-slate-500';
    }
  };
  
  return (
    <div className="relative">
      <label className="block text-sm font-medium text-slate-600 mb-2">
        Anunciante <span className="text-red-500">*</span>
      </label>
      
      {/* Botón selector */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full p-4 rounded-2xl text-left transition-all duration-300
          ${selected
            ? 'bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200'
            : 'bg-slate-50 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.06),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] border-2 border-transparent'
          }
        `}
        whileHover={{ scale: 1.005 }}
      >
        {selected ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                {selected.nombre.charAt(0)}
              </div>
              <div>
                <h4 className="font-semibold text-slate-800">{selected.nombre}</h4>
                <p className="text-sm text-slate-500">RUT: {selected.rut} • {selected.industria}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={`px-3 py-1.5 rounded-lg bg-gradient-to-r ${getRiesgoColor(selected.nivelRiesgo)} text-white text-xs font-medium flex items-center gap-1`}>
                <Shield className="w-3 h-3" />
                Score: {selected.scoreRiesgo}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(null);
                }}
                aria-label="Cerrar"
                className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-slate-400">
            <Search className="w-5 h-5" />
            <span>Buscar anunciante por nombre o RUT...</span>
          </div>
        )}
      </motion.button>
      
      {/* Dropdown de búsqueda */}
      <AnimatePresence>
        {isOpen && !selected && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
          >
            {/* Campo de búsqueda */}
            <div className="p-3 border-b border-slate-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar anunciante..."
                  aria-label="Buscar anunciante"
                  autoFocus
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-indigo-400/50 text-slate-700"
                />
              </div>
            </div>
            
            {/* Lista de resultados */}
            <div className="max-h-80 overflow-y-auto">
              {filteredAnunciantes.length === 0 ? (
                <div className="p-6 text-center text-slate-400">
                  <Building2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No se encontraron anunciantes</p>
                </div>
              ) : (
                filteredAnunciantes.map((anunciante) => (
                  <motion.button
                    key={anunciante.id}
                    onClick={() => {
                      onSelect(anunciante);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className="w-full p-4 hover:bg-indigo-50 transition-colors flex items-center justify-between text-left border-b border-slate-50 last:border-0"
                    whileHover={{ x: 4 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getRiesgoColor(anunciante.nivelRiesgo)} flex items-center justify-center text-white font-semibold`}>
                        {anunciante.nombre.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-800">{anunciante.nombre}</h4>
                        <p className="text-xs text-slate-500">
                          {anunciante.rut} • {anunciante.industria} • {anunciante.historialContratos.total} contratos
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xs font-medium px-2 py-1 rounded bg-gradient-to-r ${getRiesgoColor(anunciante.nivelRiesgo)} text-white`}>
                        {anunciante.scoreRiesgo}
                      </div>
                    </div>
                  </motion.button>
                ))
              )}
            </div>
            
            {/* Footer */}
            <div className="p-3 border-t border-slate-100 bg-slate-50">
              <button className="w-full py-2 text-sm text-indigo-600 font-medium hover:bg-indigo-100 rounded-lg transition-colors flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" />
                Crear nuevo anunciante
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Panel de información del anunciante seleccionado */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100"
          >
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                <p className="text-2xl font-bold text-indigo-600">{selected.historialContratos.total}</p>
                <p className="text-xs text-slate-500">Contratos Totales</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                <p className="text-2xl font-bold text-emerald-600">{selected.historialContratos.exitosos}</p>
                <p className="text-xs text-slate-500">Exitosos</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                <p className="text-2xl font-bold text-purple-600">
                  ${(selected.historialContratos.valorHistorico / 1000000).toFixed(0)}M
                </p>
                <p className="text-xs text-slate-500">Valor Histórico</p>
              </div>
            </div>
            {selected.ejecutivoAsignado && (
              <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                <User className="w-4 h-4" />
                <span>Ejecutivo asignado: <strong>{selected.ejecutivoAsignado.nombre}</strong></span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// SELECTOR DE PRODUCTOS
// ═══════════════════════════════════════════════════════════════

const mockProductos: ProductoContrato[] = [
  { id: 'prod-001', nombre: 'Radio Prime', categoria: 'Radio', tarifaBase: 500000, descripcion: 'Horario prime 7-9 AM', unidad: 'cuña', disponibilidad: 'disponible' },
  { id: 'prod-002', nombre: 'TV Abierta Nacional', categoria: 'Televisión', tarifaBase: 2500000, descripcion: 'Franja prime televisiva', unidad: 'spot', disponibilidad: 'limitado' },
  { id: 'prod-003', nombre: 'Digital Banner Premium', categoria: 'Digital', tarifaBase: 150000, descripcion: 'Banner 970x250', unidad: 'CPM', disponibilidad: 'disponible' },
  { id: 'prod-004', nombre: 'Prensa Dominical', categoria: 'Prensa', tarifaBase: 800000, descripcion: 'Página completa color', unidad: 'publicación', disponibilidad: 'disponible' },
];

const SelectorProductos: React.FC<{
  selected: ProductoContrato[];
  onAdd: (producto: ProductoContrato) => void;
  onRemove: (id: string) => void;
}> = ({ selected, onAdd, onRemove }) => {
  const [showSelector, setShowSelector] = useState(false);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-slate-600">
          Productos del Contrato
        </label>
        <motion.button
          onClick={() => setShowSelector(!showSelector)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-50 text-indigo-600 font-medium text-sm hover:bg-indigo-100 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="w-4 h-4" />
          Agregar Producto
        </motion.button>
      </div>
      
      {/* Productos seleccionados */}
      {selected.length > 0 ? (
        <div className="space-y-2">
          {selected.map((producto) => (
            <motion.div
              key={producto.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100"
            >
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-indigo-500" />
                <div>
                  <h4 className="font-medium text-slate-700">{producto.nombre}</h4>
                  <p className="text-xs text-slate-500">{producto.categoria} • ${producto.tarifaBase.toLocaleString()}/{producto.unidad}</p>
                </div>
              </div>
              <button
                aria-label="Eliminar"
                onClick={() => onRemove(producto.id)}
                className="p-2 hover:bg-red-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-red-400" />
              </button>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="p-6 rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 text-center">
          <Package className="w-10 h-10 mx-auto mb-2 text-slate-300" />
          <p className="text-slate-400 text-sm">No hay productos seleccionados</p>
        </div>
      )}
      
      {/* Modal de selección */}
      <AnimatePresence>
        {showSelector && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl bg-white border border-slate-200 shadow-lg overflow-hidden"
          >
            <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <span className="font-medium text-slate-700">Seleccionar Productos</span>
              <button aria-label="Cerrar" onClick={() => setShowSelector(false)} className="p-1 hover:bg-slate-200 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-2 max-h-60 overflow-y-auto">
              {mockProductos.filter(p => !selected.find(s => s.id === p.id)).map((producto) => (
                <button
                  key={producto.id}
                  onClick={() => {
                    onAdd(producto);
                    setShowSelector(false);
                  }}
                  className="w-full p-3 hover:bg-indigo-50 rounded-lg transition-colors flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      producto.disponibilidad === 'disponible' ? 'bg-emerald-500' :
                      producto.disponibilidad === 'limitado' ? 'bg-amber-500' : 'bg-red-500'
                    }`} />
                    <div>
                      <h4 className="font-medium text-slate-700">{producto.nombre}</h4>
                      <p className="text-xs text-slate-500">{producto.categoria}</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-indigo-600">
                    ${producto.tarifaBase.toLocaleString()}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// SELECTOR DE PROPIEDADES (CLAVE PARA INTEGRACIÓN)
// ═══════════════════════════════════════════════════════════════

const mockPropiedadesMaestras = [
  { tipoCodigo: 'TIPO_CREATIVIDAD', valorCodigoRef: '01_SPOT_RADIO', nombre: 'Spot de Radio', categoria: 'Creatividad' },
  { tipoCodigo: 'TIPO_CREATIVIDAD', valorCodigoRef: '02_JINGLE', nombre: 'Jingle Corporativo', categoria: 'Creatividad' },
  { tipoCodigo: 'TIPO_CREATIVIDAD', valorCodigoRef: '03_MENCION_VIVO', nombre: 'Mención en Vivo', categoria: 'Creatividad' },
  { tipoCodigo: 'TIPO_CREATIVIDAD', valorCodigoRef: 'INVALIDO_SIMULADO', nombre: 'Campaña Fantasma (Genera Error)', categoria: 'Creatividad' },
  { tipoCodigo: 'SEGMENTO_COMERCIAL', valorCodigoRef: 'SEG_GOLD', nombre: 'Segmento GOLD', categoria: 'Segmentación' },
  { tipoCodigo: 'SEGMENTO_COMERCIAL', valorCodigoRef: 'SEG_BRONZE', nombre: 'Segmento BRONZE', categoria: 'Segmentación' },
  { tipoCodigo: 'PRIORIDAD_OPERATIVA', valorCodigoRef: 'PRIO_ALTA', nombre: 'Prioridad ALTA', categoria: 'Operativa' }
];

const SelectorPropiedades: React.FC<{
  selected: Array<{ tipoCodigo: string, valorCodigoRef: string, nombre: string, categoria?: string }>;
  onUpdate: (propiedades: Array<{ tipoCodigo: string, valorCodigoRef: string, nombre: string, categoria?: string }>) => void;
  error?: string;
}> = ({ selected, onUpdate, error }) => {
  const [showSelector, setShowSelector] = useState(false);
  
  const handleToggle = (prop: { tipoCodigo: string; valorCodigoRef: string; nombre: string; categoria?: string }) => {
    const isSelected = selected.some(s => s.valorCodigoRef === prop.valorCodigoRef);
    if (isSelected) {
      onUpdate(selected.filter(s => s.valorCodigoRef !== prop.valorCodigoRef));
    } else {
      onUpdate([...selected, { tipoCodigo: prop.tipoCodigo, valorCodigoRef: prop.valorCodigoRef, nombre: prop.nombre, categoria: prop.categoria }]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-slate-600">
          Clasificación Maestra (Propiedades) <span className="text-red-500">*</span>
        </label>
        <motion.button
          onClick={() => setShowSelector(!showSelector)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-50 text-indigo-600 font-medium text-sm hover:bg-indigo-100 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="w-4 h-4" />
          Añadir Clasificación
        </motion.button>
      </div>

      {error && (
        <motion.p 
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-500 flex items-center gap-1"
        >
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </motion.p>
      )}

      {selected.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {selected.map((prop) => (
            <motion.div
              key={prop.valorCodigoRef}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg text-indigo-700 font-medium text-sm border border-indigo-200"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {prop.nombre}
              <button aria-label="Eliminar" onClick={() => handleToggle(prop)} className="hover:text-red-500 ml-1">
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-slate-50 border-2 border-dashed border-red-200 text-center">
          <p className="text-red-400 text-sm">Validación cruzada obligatoria: Seleccione al menos una propiedad maestra para continuar.</p>
        </div>
      )}

      <AnimatePresence>
        {showSelector && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl bg-white border border-slate-200 shadow-lg overflow-hidden mt-2 p-2 grid grid-cols-2 gap-2"
          >
            {mockPropiedadesMaestras.map((prop) => {
              const isActive = selected.some(s => s.valorCodigoRef === prop.valorCodigoRef);
              return (
                <button
                  key={prop.valorCodigoRef}
                  onClick={() => handleToggle(prop)}
                  className={`p-3 rounded-lg text-left transition-colors flex items-center justify-between border ${isActive ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100'}`}
                >
                  <div>
                    <span className="block font-medium text-sm">{prop.nombre}</span>
                    <span className="block text-xs opacity-70">{prop.categoria}</span>
                  </div>
                  {isActive && <CheckCircle2 className="w-4 h-4 text-indigo-500" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL DEL PASO
// ═══════════════════════════════════════════════════════════════

interface StepInfoFundamentalProps {
  state: WizardContratoState;
  dispatch: React.Dispatch<WizardAction>;
  setAnunciante: (anunciante: AnuncianteSeleccionado | null) => void;
}

export const StepInfoFundamental: React.FC<StepInfoFundamentalProps> = ({
  state,
  dispatch,
  setAnunciante
}) => {
  return (
    <div className="space-y-8">
      {/* Título del paso */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100">
          <Building2 className="w-7 h-7 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Información Fundamental</h2>
          <p className="text-slate-500">Configure los datos básicos del contrato y seleccione el cliente</p>
        </div>
      </div>
      
      {/* Tipo de contrato */}
      <div>
        <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <Info className="w-5 h-5 text-indigo-500" />
          Tipo de Contrato
        </h3>
        <TipoContratoSelector
          selected={state.tipoContrato}
          onSelect={(tipo) => dispatch({ type: 'SET_TIPO_CONTRATO', payload: tipo })}
        />
      </div>

      {/* Medio */}
      <div>
        <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <Radio className="w-5 h-5 text-indigo-500" />
          Medio del Contrato
        </h3>
        <MedioSelector
          selected={state.medio}
          onSelect={(medio) => dispatch({ type: 'SET_MEDIO', payload: medio })}
        />
      </div>
      
      {/* Selector de anunciante */}
      <SelectorAnunciante
        selected={state.anunciante}
        onSelect={setAnunciante}
      />
      
      {/* Información de la campaña */}
      <div className="grid md:grid-cols-2 gap-6">
        <NeuromorphicInput
          label="Nombre de Campaña"
          value={state.campana}
          onChange={(value) => dispatch({ type: 'SET_CAMPANA', payload: value })}
          placeholder="Ej: Campaña Navidad 2025"
          icon={Sparkles}
          required
          error={state.errors['step1_error0']}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <NeuromorphicInput
            label="Fecha Inicio"
            type="date"
            value={state.fechaInicio ? state.fechaInicio.toISOString().split('T')[0] : ''}
            onChange={(value) => dispatch({ 
              type: 'SET_FECHAS', 
              payload: { 
                inicio: value ? new Date(value) : null, 
                fin: state.fechaFin 
              }
            })}
            icon={Calendar}
            required
            error={state.errors['step1_error1'] || state.errors['step1_error2']}
          />
          <NeuromorphicInput
            label="Fecha Fin"
            type="date"
            value={state.fechaFin ? state.fechaFin.toISOString().split('T')[0] : ''}
            onChange={(value) => dispatch({ 
              type: 'SET_FECHAS', 
              payload: { 
                inicio: state.fechaInicio, 
                fin: value ? new Date(value) : null 
              }
            })}
            icon={Calendar}
            required
            error={state.errors['step1_error3']}
          />
        </div>
      </div>
      
      <NeuromorphicTextarea
        label="Descripción del Contrato"
        value={state.descripcion}
        onChange={(value) => dispatch({ type: 'SET_DESCRIPCION', payload: value })}
        placeholder="Describa el objetivo principal de esta campaña publicitaria..."
        rows={3}
      />
      
      {/* Propiedades Maestras - Integración Cruzada TIER 0 */}
      <SelectorPropiedades
        selected={state.propiedadesSeleccionadas || []}
        onUpdate={(props) => dispatch({ type: 'SET_PROPIEDADES', payload: props })}
        error={
          Object.keys(state.errors).some(k => state.errors[k].includes('propiedad maestra')) 
            ? 'Debe clasificar el contrato con al menos una propiedad maestra (ej. Tipo de Creatividad).' 
            : undefined
        }
      />
      
      {/* Productos */}
      <SelectorProductos
        selected={state.productosPrincipales}
        onAdd={(producto) => dispatch({ type: 'ADD_PRODUCTO', payload: producto })}
        onRemove={(id) => dispatch({ type: 'REMOVE_PRODUCTO', payload: id })}
      />
      
      {/* Info de ejecutivo asignado */}
      {state.ejecutivoAsignado && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-100"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm text-emerald-700">Ejecutivo asignado automáticamente</p>
            <p className="font-semibold text-emerald-800">{state.ejecutivoAsignado.nombre}</p>
          </div>
          <CheckCircle2 className="w-5 h-5 text-emerald-500 ml-auto" />
        </motion.div>
      )}
    </div>
  );
};

export default StepInfoFundamental;
