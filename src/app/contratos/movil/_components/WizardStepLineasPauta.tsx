/**
 * ?? MOBILE WIZARD � Paso 2: L�neas de Pauta
 * 
 * Cards interactivas para ver, editar, agregar y eliminar
 * las l�neas de pauta (emisoras) del contrato.
 * Cada card muestra: emisora, cantidad, horario, tarifa, disponibilidad.
 * 
 * @tier TIER_0_ENTERPRISE
 * @platform MOBILE
 */

'use client';

import { useState } from 'react';
import {
  Radio, Tv, Globe, Newspaper, Plus, Trash2,
  ChevronDown, Check, AlertTriangle, Clock,
  TrendingUp, Package, Edit3, X,
} from 'lucide-react';
import type { LineaPautaSugerida } from '../../_shared/useSmartCapture';

// ---------------------------------------------------------------
// PROPS
// ---------------------------------------------------------------

interface WizardStepLineasPautaProps {
  lineas: LineaPautaSugerida[];
  descuentoGlobal: number;
  fechaInicio: string;
  fechaFin: string;
  onActualizarLinea: (lineaId: string, cambios: Partial<LineaPautaSugerida>) => void;
  onAgregarLinea: (linea: LineaPautaSugerida) => void;
  onEliminarLinea: (lineaId: string) => void;
  onNext: () => void;
  onBack: () => void;
}

// ---------------------------------------------------------------
// CAT�LOGO DE EMISORAS DISPONIBLES
// ---------------------------------------------------------------

const CATALOGO_EMISORAS: {
  id: string; nombre: string; categoria: LineaPautaSugerida['categoria'];
  producto: string; tarifa: number;
}[] = [
  { id: 'med-001', nombre: 'Radio Coraz�n', categoria: 'Radio', producto: 'Radio FM', tarifa: 450000 },
  { id: 'med-002', nombre: 'FM Dos', categoria: 'Radio', producto: 'Radio FM', tarifa: 380000 },
  { id: 'med-003', nombre: 'Radio Futuro', categoria: 'Radio', producto: 'Radio FM', tarifa: 350000 },
  { id: 'med-004', nombre: 'ADN Radio', categoria: 'Radio', producto: 'Radio FM', tarifa: 520000 },
  { id: 'med-005', nombre: 'Canal 13', categoria: 'Televisión', producto: 'TV Abierta', tarifa: 2500000 },
  { id: 'med-006', nombre: 'CHV', categoria: 'Televisión', producto: 'TV Abierta', tarifa: 2200000 },
  { id: 'med-007', nombre: 'Mega', categoria: 'Televisión', producto: 'TV Abierta', tarifa: 2000000 },
  { id: 'med-008', nombre: 'Google Ads', categoria: 'Digital', producto: 'Digital SEM', tarifa: 150000 },
  { id: 'med-009', nombre: 'Meta Ads', categoria: 'Digital', producto: 'Digital Social', tarifa: 120000 },
  { id: 'med-010', nombre: 'El Mercurio', categoria: 'Prensa', producto: 'Prensa Escrita', tarifa: 800000 },
];

// ---------------------------------------------------------------
// COMPONENTE PRINCIPAL
// ---------------------------------------------------------------

export function WizardStepLineasPauta({
  lineas, descuentoGlobal, fechaInicio, fechaFin,
  onActualizarLinea, onAgregarLinea, onEliminarLinea,
  onNext, onBack,
}: WizardStepLineasPautaProps) {
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const totalNeto = lineas.reduce((s, l) => s + l.totalNeto, 0);
  const totalBruto = lineas.reduce((s, l) => s + l.subtotal, 0);

  const handleAddEmisora = (emisora: typeof CATALOGO_EMISORAS[0]) => {
    const cantidad = 10;
    const subtotal = emisora.tarifa * cantidad;
    const totalNeto = subtotal * (1 - descuentoGlobal / 100);

    const nuevaLinea: LineaPautaSugerida = {
      id: `lp-${emisora.id}-${Date.now()}`,
      medioId: emisora.id,
      medioNombre: emisora.nombre,
      categoria: emisora.categoria,
      productoNombre: emisora.producto,
      cantidad,
      tarifaUnitaria: emisora.tarifa,
      descuento: descuentoGlobal,
      subtotal,
      totalNeto,
      fechaInicio,
      fechaFin,
      confianza: 100,
      fuenteDeteccion: 'manual',
      disponibilidad: { estado: 'disponible', porcentaje: 80 },
    };

    onAgregarLinea(nuevaLinea);
    setShowAddSheet(false);
  };

  const handleCantidadChange = (lineaId: string, linea: LineaPautaSugerida, nuevaCantidad: number) => {
    if (nuevaCantidad < 1) return;
    const subtotal = linea.tarifaUnitaria * nuevaCantidad;
    const total = subtotal * (1 - linea.descuento / 100);
    onActualizarLinea(lineaId, { cantidad: nuevaCantidad, subtotal, totalNeto: total });
  };

  // IDs de emisoras ya agregadas
  const emisorasEnUso = new Set(lineas.map(l => l.medioId));

  return (
    <div className="space-y-4">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-[#9aa3b8] uppercase tracking-widest">L�neas de Pauta</p>
          <p className="text-xs text-[#9aa3b8]">{lineas.length} l�nea{lineas.length !== 1 ? 's' : ''} configurada{lineas.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setShowAddSheet(true)}
          className="px-3 py-2 bg-[#6888ff] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" /> Agregar
        </button>
      </div>

      {/* CARDS DE L�NEAS */}
      {lineas.length === 0 ? (
        <div className="text-center py-8">
          <Package className="w-12 h-12 text-[#9aa3b8] mx-auto" />
          <p className="mt-3 text-sm font-bold text-[#9aa3b8]">Sin l�neas de pauta</p>
          <p className="text-xs text-[#9aa3b8] mt-1">Agrega emisoras para completar el contrato</p>
          <button
            onClick={() => setShowAddSheet(true)}
            className="mt-4 px-6 py-3 bg-[#6888ff] text-white rounded-xl text-sm font-bold active:scale-95"
          >
            <Plus className="w-4 h-4 inline mr-1" /> Agregar emisora
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {lineas.map(linea => (
            <LineaCard
              key={linea.id}
              linea={linea}
              editing={editingId === linea.id}
              onToggleEdit={() => setEditingId(editingId === linea.id ? null : linea.id)}
              onCantidadChange={(c) => handleCantidadChange(linea.id, linea, c)}
              onDelete={() => onEliminarLinea(linea.id)}
            />
          ))}
        </div>
      )}

      {/* TOTAL */}
      {lineas.length > 0 && (
        <div className="bg-[#6888ff] rounded-2xl p-4 text-white">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#9aa3b8]">Subtotal bruto</span>
            <span className="text-sm font-mono">{formatMonto(totalBruto)}</span>
          </div>
          {descuentoGlobal > 0 && (
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-[#9aa3b8]">Descuento ({descuentoGlobal}%)</span>
              <span className="text-sm font-mono text-red-400">-{formatMonto(totalBruto - totalNeto)}</span>
            </div>
          )}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#bec8de]">
            <span className="text-sm font-bold">Total Neto</span>
            <span className="text-lg font-black font-mono">{formatMonto(totalNeto)}</span>
          </div>
        </div>
      )}

      {/* NAVEGACI�N */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3.5 border border-[#bec8de30] text-[#69738c] rounded-2xl font-bold text-sm active:scale-[0.97]"
        >
          Volver
        </button>
        <button
          onClick={onNext}
          disabled={lineas.length === 0}
          className="flex-[2] py-3.5 bg-[#6888ff] text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.97] disabled:opacity-50 shadow-lg shadow-[#6888ff]/20"
        >
          Confirmar y Enviar
          <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
        </button>
      </div>

      {/* SHEET AGREGAR EMISORA */}
      {showAddSheet && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end" onClick={() => setShowAddSheet(false)}>
          <div className="bg-[#dfeaff] w-full rounded-t-3xl p-5 max-h-[70vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-[#69738c]">Agregar Emisora</h3>
              <button onClick={() => setShowAddSheet(false)} className="p-2 rounded-xl bg-[#dfeaff] active:scale-90">
                <X className="w-5 h-5 text-[#9aa3b8]" />
              </button>
            </div>

            <div className="space-y-2">
              {CATALOGO_EMISORAS.filter(e => !emisorasEnUso.has(e.id)).map(emisora => (
                <button
                  key={emisora.id}
                  onClick={() => handleAddEmisora(emisora)}
                  className="w-full p-4 bg-[#dfeaff] border border-[#bec8de30] rounded-2xl flex items-center gap-3 active:scale-[0.97] transition-transform"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getCategoriaColor(emisora.categoria)}`}>
                    {getCategoriaIcon(emisora.categoria)}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-bold text-sm text-[#69738c]">{emisora.nombre}</p>
                    <p className="text-[10px] text-[#9aa3b8]">{emisora.producto}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-[#69738c]">{formatMonto(emisora.tarifa)}</p>
                    <p className="text-[10px] text-[#9aa3b8]">/unidad</p>
                  </div>
                </button>
              ))}

              {CATALOGO_EMISORAS.filter(e => !emisorasEnUso.has(e.id)).length === 0 && (
                <p className="text-center py-6 text-sm text-[#9aa3b8]">Todas las emisoras ya est�n agregadas</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------
// CARD DE L�NEA DE PAUTA
// ---------------------------------------------------------------

function LineaCard({ linea, editing, onToggleEdit, onCantidadChange, onDelete }: {
  linea: LineaPautaSugerida;
  editing: boolean;
  onToggleEdit: () => void;
  onCantidadChange: (cantidad: number) => void;
  onDelete: () => void;
}) {
  const disponibilidadConfig = getDisponibilidadConfig(linea.disponibilidad?.estado);

  return (
    <div className="bg-[#dfeaff] rounded-2xl border border-[#bec8de30] overflow-hidden shadow-sm">
      {/* HEADER */}
      <div className="px-4 py-3 flex items-center gap-3 border-b border-[#bec8de30]">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${getCategoriaColor(linea.categoria)}`}>
          {getCategoriaIcon(linea.categoria)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-[#69738c] truncate">{linea.medioNombre}</p>
          <p className="text-[10px] text-[#9aa3b8]">{linea.productoNombre}</p>
        </div>
        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
          linea.fuenteDeteccion === 'manual' ? 'bg-blue-100 text-blue-700' :
          linea.fuenteDeteccion === 'historial_cliente' ? 'bg-purple-100 text-purple-700' :
          'bg-emerald-100 text-emerald-700'
        }`}>
          {linea.fuenteDeteccion === 'ia_voz' ? 'IA Voz' :
           linea.fuenteDeteccion === 'ia_texto' ? 'IA Texto' :
           linea.fuenteDeteccion === 'historial_cliente' ? 'Historial' : 'Manual'}
        </span>
        <button onClick={onToggleEdit} className="p-1.5 rounded-lg bg-[#dfeaff] active:scale-90">
          <Edit3 className="w-3.5 h-3.5 text-[#9aa3b8]" />
        </button>
      </div>

      {/* DETALLES */}
      <div className="px-4 py-3 grid grid-cols-3 gap-3">
        <div>
          <p className="text-[10px] text-[#9aa3b8]">Cantidad</p>
          {editing ? (
            <div className="flex items-center gap-1 mt-0.5">
              <button
                onClick={() => onCantidadChange(linea.cantidad - 1)}
                className="w-6 h-6 rounded-md bg-[#dfeaff] text-[#69738c] text-xs font-bold flex items-center justify-center"
              >-</button>
              <span className="text-sm font-black text-[#69738c] w-8 text-center">{linea.cantidad}</span>
              <button
                onClick={() => onCantidadChange(linea.cantidad + 1)}
                className="w-6 h-6 rounded-md bg-[#6888ff] text-white text-xs font-bold flex items-center justify-center"
              >+</button>
            </div>
          ) : (
            <p className="text-sm font-black text-[#69738c]">{linea.cantidad} frases</p>
          )}
        </div>
        <div>
          <p className="text-[10px] text-[#9aa3b8]">Tarifa</p>
          <p className="text-sm font-bold text-[#69738c]">{formatMonto(linea.tarifaUnitaria)}</p>
        </div>
        <div>
          <p className="text-[10px] text-[#9aa3b8]">Total Neto</p>
          <p className="text-sm font-black text-emerald-600">{formatMonto(linea.totalNeto)}</p>
        </div>
      </div>

      {/* HORARIO + DISPONIBILIDAD */}
      <div className="px-4 py-2 bg-[#dfeaff] flex items-center gap-4 text-[10px]">
        {linea.horarioInicio && (
          <span className="flex items-center gap-1 text-[#9aa3b8]">
            <Clock className="w-3 h-3" /> {linea.horarioInicio} - {linea.horarioFin}
          </span>
        )}
        {linea.disponibilidad && (
          <span className={`flex items-center gap-1 font-bold ${disponibilidadConfig.color}`}>
            {disponibilidadConfig.icon}
            {disponibilidadConfig.label} ({linea.disponibilidad.porcentaje}%)
          </span>
        )}
        {linea.duracionSpot && (
          <span className="text-[#9aa3b8]">{linea.duracionSpot}s</span>
        )}
      </div>

      {/* ACCIONES EDICI�N */}
      {editing && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-100 flex justify-end">
          <button onClick={onDelete} className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 active:scale-95">
            <Trash2 className="w-3 h-3" /> Eliminar
          </button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------
// UTILIDADES
// ---------------------------------------------------------------

function formatMonto(valor: number): string {
  if (valor >= 1000000) return `$${(valor / 1000000).toFixed(1)}M`;
  if (valor >= 1000) return `$${(valor / 1000).toFixed(0)}K`;
  return `$${valor.toLocaleString('es-CL')}`;
}

function getCategoriaIcon(cat: LineaPautaSugerida['categoria']) {
  switch (cat) {
    case 'Radio': return <Radio className="w-4 h-4 text-white" />;
    case 'Televisión': return <Tv className="w-4 h-4 text-white" />;
    case 'Digital': return <Globe className="w-4 h-4 text-white" />;
    case 'Prensa': return <Newspaper className="w-4 h-4 text-white" />;
  }
}

function getCategoriaColor(cat: LineaPautaSugerida['categoria']) {
  switch (cat) {
    case 'Radio': return 'bg-gradient-to-br from-red-500 to-pink-500';
    case 'Televisión': return 'bg-[#6888ff]';
    case 'Digital': return 'bg-gradient-to-br from-emerald-500 to-teal-500';
    case 'Prensa': return 'bg-gradient-to-br from-amber-500 to-orange-500';
  }
}

function getDisponibilidadConfig(estado?: string) {
  switch (estado) {
    case 'disponible': return { label: 'Disponible', color: 'text-emerald-600', icon: <Check className="w-3 h-3" /> };
    case 'limitado': return { label: 'Limitado', color: 'text-amber-600', icon: <TrendingUp className="w-3 h-3" /> };
    case 'saturado': return { label: 'Saturado', color: 'text-orange-600', icon: <AlertTriangle className="w-3 h-3" /> };
    case 'no_disponible': return { label: 'No disponible', color: 'text-red-600', icon: <AlertTriangle className="w-3 h-3" /> };
    default: return { label: 'Sin datos', color: 'text-[#9aa3b8]', icon: null };
  }
}
