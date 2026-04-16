/**
 * 📊 SILEXAR PULSE - Paso 3: Especificaciones TIER 0
 * 
 * @description Tercer paso del wizard - Líneas de especificación,
 * validación de inventario en tiempo real y material creativo.
 * 
 * @version 2025.3.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Radio,
  Tv,
  Globe,
  Newspaper,
  RefreshCw,
  Package,
  AlertCircle,
  Zap,
  Search,
  X
} from 'lucide-react';
import { 
  WizardContratoState, 
  WizardAction,
  EspecificacionPauta,
  ValidacionInventario,
  formatCurrency
} from '../types/wizard.types';
import PanelEspecificacionesDigitales from './PanelEspecificacionesDigitales';

// ═══════════════════════════════════════════════════════════════
// DATOS MOCK DE MEDIOS
// ═══════════════════════════════════════════════════════════════

const mediosDisponibles = [
  { id: 'med-001', nombre: 'Radio Corazón Prime', categoria: 'Radio', icono: Radio, tarifa: 450000 },
  { id: 'med-002', nombre: 'FM Dos Nacional', categoria: 'Radio', icono: Radio, tarifa: 380000 },
  { id: 'med-003', nombre: 'Canal 13 Prime', categoria: 'Televisión', icono: Tv, tarifa: 3500000 },
  { id: 'med-004', nombre: 'TVN Nocturno', categoria: 'Televisión', icono: Tv, tarifa: 2800000 },
  { id: 'med-005', nombre: 'Portal Digital Premium', categoria: 'Digital', icono: Globe, tarifa: 180000 },
  { id: 'med-006', nombre: 'El Mercurio Nacional', categoria: 'Prensa', icono: Newspaper, tarifa: 1200000 },
];

// ═══════════════════════════════════════════════════════════════
// COMPONENTE LÍNEA DE ESPECIFICACIÓN
// ═══════════════════════════════════════════════════════════════

interface LineaEspecificacionCardProps {
  linea: EspecificacionPauta;
  onUpdate: (data: Partial<EspecificacionPauta>) => void;
  onRemove: () => void;
  validacion?: ValidacionInventario;
}

const LineaEspecificacionCard: React.FC<LineaEspecificacionCardProps> = ({
  linea,
  onUpdate,
  onRemove,
  validacion
}) => {
  const medio = mediosDisponibles.find(m => m.id === linea.medioId);
  const Icon = medio?.icono || Package;
  
  const getValidacionColor = () => {
    if (!validacion) return 'bg-slate-100 border-slate-200';
    switch (validacion.estado) {
      case 'disponible': return 'bg-emerald-50 border-emerald-200';
      case 'limitado': return 'bg-amber-50 border-amber-200';
      case 'saturado': return 'bg-orange-50 border-orange-200';
      case 'no_disponible': return 'bg-red-50 border-red-200';
      default: return 'bg-slate-100 border-slate-200';
    }
  };
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className={`p-5 rounded-2xl border-2 ${getValidacionColor()} transition-colors duration-300`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-white shadow-sm">
            <Icon className="w-6 h-6 text-indigo-500" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-800">{linea.medioNombre}</h4>
            <p className="text-sm text-slate-500">{linea.productoNombre}</p>
          </div>
        </div>
        <button
          aria-label="Eliminar"
          onClick={onRemove}
          className="p-2 hover:bg-red-100 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4 text-red-400" />
        </button>
      </div>
      
      {/* Campos */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="text-xs text-slate-500 block mb-1">Fecha Inicio</label>
          <input
            type="date"
            aria-label="Fecha Inicio"
            value={linea.fechaInicio ? new Date(linea.fechaInicio).toISOString().split('T')[0] : ''}
            onChange={(e) => onUpdate({ fechaInicio: new Date(e.target.value) })}
            className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-400/50 outline-none"
          />
        </div>
        <div>
          <label className="text-xs text-slate-500 block mb-1">Fecha Fin</label>
          <input
            type="date"
            aria-label="Fecha Fin"
            value={linea.fechaFin ? new Date(linea.fechaFin).toISOString().split('T')[0] : ''}
            onChange={(e) => onUpdate({ fechaFin: new Date(e.target.value) })}
            className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-400/50 outline-none"
          />
        </div>
        <div>
          <label className="text-xs text-slate-500 block mb-1">Cantidad</label>
          <input
            type="number"
            min={1}
            aria-label="Cantidad"
            value={linea.cantidad}
            onChange={(e) => {
              const cantidad = parseInt(e.target.value) || 1;
              const totalNeto = cantidad * linea.tarifaUnitaria * (1 - (linea.descuento || 0) / 100);
              onUpdate({ cantidad, subtotal: cantidad * linea.tarifaUnitaria, totalNeto });
            }}
            className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-400/50 outline-none"
          />
        </div>
        <div>
          <label className="text-xs text-slate-500 block mb-1">Descuento %</label>
          <input
            type="number"
            aria-label="Descuento en porcentaje"
            min={0}
            max={50}
            value={linea.descuento || 0}
            onChange={(e) => {
              const descuento = parseFloat(e.target.value) || 0;
              const totalNeto = linea.cantidad * linea.tarifaUnitaria * (1 - descuento / 100);
              onUpdate({ descuento, totalNeto });
            }}
            className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-400/50 outline-none"
          />
        </div>
      </div>
      
      {/* Valores y validación */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-200/50">
        <div className="flex items-center gap-4">
          {validacion && (
            <div className="flex items-center gap-2">
              {validacion.estado === 'disponible' && (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm text-emerald-700">Disponible ({validacion.disponibilidadPorcentaje}%)</span>
                </>
              )}
              {validacion.estado === 'limitado' && (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span className="text-sm text-amber-700">Limitado ({validacion.disponibilidadPorcentaje}%)</span>
                </>
              )}
              {validacion.estado === 'saturado' && (
                <>
                  <AlertCircle className="w-4 h-4 text-orange-500" />
                  <span className="text-sm text-orange-700">Saturado</span>
                </>
              )}
              {validacion.estado === 'no_disponible' && (
                <>
                  <X className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-700">No disponible</span>
                </>
              )}
            </div>
          )}
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Total Neto</p>
          <p className="text-lg font-bold text-indigo-600">{formatCurrency(linea.totalNeto)}</p>
        </div>
      </div>
      
      {/* Conflictos */}
      {validacion?.conflictos && validacion.conflictos.length > 0 && (
        <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-100">
          <p className="text-sm font-medium text-red-700 mb-1">Conflictos detectados:</p>
          {validacion.conflictos.map((conflicto, i) => (
            <p key={`${conflicto}-${i}`} className="text-xs text-red-600">• {conflicto.descripcion}</p>
          ))}
        </div>
      )}
      
      {/* Sugerencia de horarios alternativos */}
      {validacion?.horariosSugeridos && validacion.horariosSugeridos.length > 0 && (
        <div className="mt-3 p-3 rounded-lg bg-indigo-50 border border-indigo-100">
          <p className="text-sm font-medium text-indigo-700 mb-1">💡 Horarios alternativos:</p>
          <div className="flex flex-wrap gap-2">
            {validacion.horariosSugeridos.map((h, i) => (
              <span key={`${h}-${i}`} className="px-2 py-1 text-xs bg-white rounded border border-indigo-200 text-indigo-600">
                {h.inicio} - {h.fin} ({h.disponibilidad}%)
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════════
// MODAL AGREGAR LÍNEA
// ═══════════════════════════════════════════════════════════════

interface AgregarLineaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (linea: EspecificacionPauta) => void;
  fechaInicioContrato: Date | null;
  fechaFinContrato: Date | null;
}

const AgregarLineaModal: React.FC<AgregarLineaModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  fechaInicioContrato,
  fechaFinContrato
}) => {
  const [selectedMedio, setSelectedMedio] = useState<typeof mediosDisponibles[0] | null>(null);
  const [cantidad, setCantidad] = useState(10);
  const [search, setSearch] = useState('');
  
  const filteredMedios = mediosDisponibles.filter(m =>
    m.nombre.toLowerCase().includes(search.toLowerCase()) ||
    m.categoria.toLowerCase().includes(search.toLowerCase())
  );
  
  const handleAdd = () => {
    if (!selectedMedio) return;
    
    const linea: EspecificacionPauta = {
      id: `linea-${Date.now()}`,
      medioId: selectedMedio.id,
      medioNombre: selectedMedio.nombre,
      productoId: selectedMedio.id,
      productoNombre: selectedMedio.categoria,
      fechaInicio: fechaInicioContrato || new Date(),
      fechaFin: fechaFinContrato || new Date(),
      cantidad,
      tarifaUnitaria: selectedMedio.tarifa,
      subtotal: cantidad * selectedMedio.tarifa,
      totalNeto: cantidad * selectedMedio.tarifa
    };
    
    onAdd(linea);
    onClose();
    setSelectedMedio(null);
    setCantidad(10);
  };
  
  if (!isOpen) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">Agregar Línea de Especificación</h3>
            <button aria-label="Cerrar" onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Contenido */}
        <div className="p-6">
          {/* Búsqueda */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar medio por nombre o categoría..."
              aria-label="Buscar medio por nombre o categoría"
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border-2 border-transparent focus:border-indigo-300 outline-none"
            />
          </div>
          
          {/* Lista de medios */}
          <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto mb-6">
            {filteredMedios.map((medio) => {
              const Icon = medio.icono;
              const isSelected = selectedMedio?.id === medio.id;
              
              return (
                <button
                  key={medio.id}
                  onClick={() => setSelectedMedio(medio)}
                  className={`
                    p-4 rounded-xl text-left transition-all duration-200
                    ${isSelected
                      ? 'bg-indigo-100 border-2 border-indigo-400 scale-[1.02]'
                      : 'bg-slate-50 border-2 border-transparent hover:border-slate-200'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <div>
                      <p className={`font-medium ${isSelected ? 'text-indigo-700' : 'text-slate-700'}`}>
                        {medio.nombre}
                      </p>
                      <p className="text-xs text-slate-500">{medio.categoria}</p>
                    </div>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-indigo-600">
                    {formatCurrency(medio.tarifa)}/unidad
                  </p>
                </button>
              );
            })}
          </div>
          
          {/* Cantidad */}
          {selectedMedio && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6"
            >
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Cantidad de unidades
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  min={1}
                  aria-label="Cantidad de unidades"
                  value={cantidad}
                  onChange={(e) => setCantidad(parseInt(e.target.value) || 1)}
                  className="w-32 px-4 py-3 rounded-xl bg-slate-50 border-2 border-transparent focus:border-indigo-300 outline-none text-center font-medium"
                />
                <div className="flex-1 p-4 rounded-xl bg-indigo-50">
                  <p className="text-sm text-indigo-600">Subtotal estimado</p>
                  <p className="text-2xl font-bold text-indigo-700">
                    {formatCurrency(cantidad * selectedMedio.tarifa)}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-6 bg-slate-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl font-medium text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleAdd}
            disabled={!selectedMedio}
            className={`
              px-6 py-3 rounded-xl font-medium text-white
              ${selectedMedio
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:shadow-lg'
                : 'bg-slate-300 cursor-not-allowed'
              }
              transition-all duration-200
            `}
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Agregar Línea
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

interface StepEspecificacionesProps {
  state: WizardContratoState;
  dispatch: React.Dispatch<WizardAction>;
  validarInventario: () => void;
}

export const StepEspecificaciones: React.FC<StepEspecificacionesProps> = ({
  state,
  dispatch,
  validarInventario
}) => {
  const [showModal, setShowModal] = useState(false);
  
  const totalLineas = state.lineasEspecificacion.reduce((sum, l) => sum + l.totalNeto, 0);
  const lineasConProblemas = state.lineasEspecificacion.filter(l => {
    const val = state.validacionesInventario.find(v => v.medioId === l.medioId);
    return val && val.estado !== 'disponible';
  }).length;
  
  return (
    <div className="space-y-8">
      {/* Título del paso */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100">
          <BarChart3 className="w-7 h-7 text-purple-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Especificaciones de Pauta</h2>
          <p className="text-slate-500">Configure las líneas de pauta y valide disponibilidad</p>
        </div>
      </div>
      
      {/* Barra de acciones */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-4">
          <motion.button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium shadow-lg hover:shadow-xl transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="w-5 h-5" />
            Agregar Línea
          </motion.button>
          
          <motion.button
            onClick={validarInventario}
            disabled={state.lineasEspecificacion.length === 0 || state.isLoading}
            className={`
              flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all
              ${state.lineasEspecificacion.length === 0 || state.isLoading
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-500 text-white hover:bg-emerald-600'
              }
            `}
            whileHover={state.lineasEspecificacion.length > 0 && !state.isLoading ? { scale: 1.02 } : {}}
            whileTap={state.lineasEspecificacion.length > 0 && !state.isLoading ? { scale: 0.98 } : {}}
          >
            {state.isLoading ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Zap className="w-5 h-5" />
            )}
            Validar Inventario
          </motion.button>
        </div>
        
        {/* Resumen */}
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-xs text-slate-500">Líneas</p>
            <p className="text-lg font-bold text-slate-700">{state.lineasEspecificacion.length}</p>
          </div>
          {lineasConProblemas > 0 && (
            <div className="text-right">
              <p className="text-xs text-amber-600">Con problemas</p>
              <p className="text-lg font-bold text-amber-600">{lineasConProblemas}</p>
            </div>
          )}
          <div className="text-right">
            <p className="text-xs text-slate-500">Total</p>
            <p className="text-lg font-bold text-indigo-600">{formatCurrency(totalLineas)}</p>
          </div>
        </div>
      </div>
      
      {/* Lista de líneas */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {state.lineasEspecificacion.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-12 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 text-center"
            >
              <Package className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-medium text-slate-600 mb-2">No hay líneas de especificación</h3>
              <p className="text-slate-400 mb-4">Agregue líneas para definir la pauta del contrato</p>
              <button
                onClick={() => setShowModal(true)}
                className="px-6 py-3 rounded-xl bg-indigo-100 text-indigo-600 font-medium hover:bg-indigo-200 transition-colors"
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Agregar primera línea
              </button>
            </motion.div>
          ) : (
            state.lineasEspecificacion.map((linea) => (
              <LineaEspecificacionCard
                key={linea.id}
                linea={linea}
                onUpdate={(data) => dispatch({ type: 'UPDATE_LINEA_ESPECIFICACION', payload: { id: linea.id, data } })}
                onRemove={() => dispatch({ type: 'REMOVE_LINEA_ESPECIFICACION', payload: linea.id })}
                validacion={state.validacionesInventario.find(v => v.medioId === linea.medioId)}
              />
            ))
          )}
        </AnimatePresence>
      </div>
      
      {/* Alert de material creativo */}
      {state.materialesPendientes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-2xl bg-amber-50 border border-amber-200"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-800 mb-1">Material Creativo Pendiente</h4>
              <p className="text-sm text-amber-700 mb-3">
                Se requiere material creativo para las siguientes líneas:
              </p>
              <div className="flex flex-wrap gap-2">
                {state.materialesPendientes.map((mat, i) => (
                  <span key={`${mat}-${i}`} className="px-3 py-1 rounded-lg bg-amber-100 text-amber-800 text-sm">
                    {mat}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Modal agregar línea */}
      <AnimatePresence>
        {showModal && (
          <AgregarLineaModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            onAdd={(linea) => dispatch({ type: 'ADD_LINEA_ESPECIFICACION', payload: linea })}
            fechaInicioContrato={state.fechaInicio}
            fechaFinContrato={state.fechaFin}
          />
        )}
      </AnimatePresence>

      {/* Panel de especificaciones digitales */}
      {(state.medio === 'digital' || state.medio === 'hibrido') && (
        <PanelEspecificacionesDigitales
          data={state.especificacionDigital || { plataformas: [], trackingLinks: [], moneda: 'CLP' }}
          onUpdate={(payload) => dispatch({ type: 'SET_ESPECIFICACION_DIGITAL', payload })}
        />
      )}
    </div>
  );
};

export default StepEspecificaciones;
