/**
 * 🧠 MOBILE WIZARD — Paso 1: Resumen IA
 * 
 * Muestra el borrador generado por la IA: datos del cliente,
 * valor, fechas, descuento, líneas de pauta pre-llenadas.
 * El ejecutivo puede editar antes de continuar.
 * 
 * @tier TIER_0_ENTERPRISE
 * @platform MOBILE
 */

'use client';

import { useState } from 'react';
import {
  Sparkles, Edit3, Check, AlertTriangle,
  Building2, DollarSign, Calendar, Percent,
  Clock, Radio, Tv, Globe, Newspaper,
  ChevronDown, ChevronUp, History,
} from 'lucide-react';
import type { ContratoSugerido, DatosExtraidos, CampoDetectado } from '../../_shared/useSmartCapture';

// ═══════════════════════════════════════════════════════════════
// PROPS
// ═══════════════════════════════════════════════════════════════

interface WizardStepResumenIAProps {
  datosExtraidos: DatosExtraidos;
  contrato: ContratoSugerido;
  onNext: () => void;
  onEditField: (campo: string, valor: string | number) => void;
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTE
// ═══════════════════════════════════════════════════════════════

export function WizardStepResumenIA({ datosExtraidos, contrato, onNext, onEditField }: WizardStepResumenIAProps) {
  const [expandedFields, setExpandedFields] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const startEdit = (campo: string, valorActual: string | number) => {
    setEditingField(campo);
    setEditValue(String(valorActual));
  };

  const confirmEdit = () => {
    if (editingField && editValue) {
      onEditField(editingField, editValue);
      setEditingField(null);
      setEditValue('');
    }
  };

  const confianzaColor = datosExtraidos.confianzaGlobal >= 85 ? 'text-emerald-600' :
    datosExtraidos.confianzaGlobal >= 70 ? 'text-amber-600' : 'text-red-600';

  const confianzaBg = datosExtraidos.confianzaGlobal >= 85 ? 'bg-emerald-50 border-emerald-200' :
    datosExtraidos.confianzaGlobal >= 70 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200';

  return (
    <div className="space-y-4">
      {/* CONFIANZA GLOBAL */}
      <div className={`p-3 rounded-xl border flex items-center gap-3 ${confianzaBg}`}>
        <Sparkles className={`w-5 h-5 ${confianzaColor}`} />
        <div className="flex-1">
          <p className={`text-sm font-bold ${confianzaColor}`}>
            Confianza IA: {datosExtraidos.confianzaGlobal}%
          </p>
          <p className="text-[10px] text-slate-500">
            {datosExtraidos.camposDetectados.length} campos detectados
            {datosExtraidos.camposFaltantes.length > 0 && ` · ${datosExtraidos.camposFaltantes.length} pendientes`}
          </p>
        </div>
        {datosExtraidos.lineasClonadas && (
          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full flex items-center gap-1">
            <History className="w-3 h-3" /> Historial
          </span>
        )}
      </div>

      {/* DATOS PRINCIPALES */}
      <div className="bg-white rounded-2xl border border-slate-100 divide-y divide-slate-50 overflow-hidden shadow-sm">
        <FieldRow
          icon={<Building2 className="w-4 h-4 text-indigo-500" />}
          label="Cliente"
          value={contrato.cliente.nombre}
          badge={contrato.cliente.esNuevo ? 'Nuevo' : 'Existente'}
          badgeColor={contrato.cliente.esNuevo ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}
          confianza={datosExtraidos.camposDetectados.find(c => c.campo === 'cliente')?.confianza}
          editing={editingField === 'cliente'}
          editValue={editValue}
          onEdit={() => startEdit('cliente', contrato.cliente.nombre)}
          onEditChange={setEditValue}
          onEditConfirm={confirmEdit}
        />
        <FieldRow
          icon={<DollarSign className="w-4 h-4 text-emerald-500" />}
          label="Valor"
          value={formatearMonto(contrato.valor)}
          confianza={datosExtraidos.camposDetectados.find(c => c.campo === 'valor')?.confianza}
          editing={editingField === 'valor'}
          editValue={editValue}
          onEdit={() => startEdit('valor', String(contrato.valor / 1000000))}
          onEditChange={setEditValue}
          onEditConfirm={confirmEdit}
        />
        <FieldRow
          icon={<Percent className="w-4 h-4 text-orange-500" />}
          label="Descuento"
          value={`${contrato.descuento}%`}
          confianza={datosExtraidos.camposDetectados.find(c => c.campo === 'descuento')?.confianza}
          editing={editingField === 'descuento'}
          editValue={editValue}
          onEdit={() => startEdit('descuento', contrato.descuento)}
          onEditChange={setEditValue}
          onEditConfirm={confirmEdit}
        />
        <FieldRow
          icon={<Calendar className="w-4 h-4 text-blue-500" />}
          label="Período"
          value={`${formatFecha(contrato.fechaInicio)} → ${formatFecha(contrato.fechaFin)}`}
          confianza={85}
        />
        <FieldRow
          icon={<Clock className="w-4 h-4 text-purple-500" />}
          label="Pago"
          value={`${contrato.terminosPago} días · ${datosExtraidos.facturacion.modalidad}`}
          confianza={datosExtraidos.facturacion.confianza}
        />
      </div>

      {/* MEDIOS DETECTADOS */}
      {datosExtraidos.mediosDetectados.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Medios detectados</p>
          <div className="flex flex-wrap gap-2">
            {datosExtraidos.mediosDetectados.map(medio => (
              <span key={medio} className="px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full text-xs font-bold text-indigo-700 flex items-center gap-1.5">
                {getMedioIcon(medio)}
                {medio}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* RESUMEN LÍNEAS DE PAUTA */}
      {contrato.lineasPauta.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-100 p-3">
          <p className="text-xs font-bold text-indigo-700">
            {contrato.lineasPauta.length} línea{contrato.lineasPauta.length > 1 ? 's' : ''} de pauta detectada{contrato.lineasPauta.length > 1 ? 's' : ''}
          </p>
          <p className="text-[10px] text-indigo-500 mt-0.5">
            Total: {formatearMonto(contrato.lineasPauta.reduce((s, l) => s + l.totalNeto, 0))}
          </p>
        </div>
      )}

      {/* CAMPOS FALTANTES */}
      {datosExtraidos.camposFaltantes.length > 0 && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-bold text-amber-700">Campos pendientes</p>
            <p className="text-[10px] text-amber-600 mt-0.5">
              {datosExtraidos.camposFaltantes.join(', ')}
            </p>
          </div>
        </div>
      )}

      {/* CAMPOS DETECTADOS EXPANDIBLE */}
      <button
        onClick={() => setExpandedFields(!expandedFields)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-500"
      >
        <span>Ver detalle de campos detectados ({datosExtraidos.camposDetectados.length})</span>
        {expandedFields ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {expandedFields && (
        <div className="space-y-1">
          {datosExtraidos.camposDetectados.map((campo) => (
            <DetectedField key={campo.campo} campo={campo} />
          ))}
        </div>
      )}

      {/* APROBACIÓN */}
      {contrato.aprobacionRequerida && (
        <div className="p-3 rounded-xl bg-purple-50 border border-purple-200">
          <p className="text-xs font-bold text-purple-700">
            Requiere aprobación: {contrato.nivelAprobacion}
          </p>
          {contrato.motivoAprobacion && (
            <p className="text-[10px] text-purple-500 mt-0.5">{contrato.motivoAprobacion}</p>
          )}
        </div>
      )}

      {/* BOTÓN CONTINUAR */}
      <button
        onClick={onNext}
        className="w-full py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-[0.97] transition-transform shadow-lg shadow-indigo-200"
      >
        Revisar Líneas de Pauta
        <ChevronDown className="w-5 h-5 rotate-[-90deg]" />
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENTES
// ═══════════════════════════════════════════════════════════════

function FieldRow({ icon, label, value, badge, badgeColor, confianza, editing, editValue, onEdit, onEditChange, onEditConfirm }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  badge?: string;
  badgeColor?: string;
  confianza?: number;
  editing?: boolean;
  editValue?: string;
  onEdit?: () => void;
  onEditChange?: (v: string) => void;
  onEditConfirm?: () => void;
}) {
  return (
    <div className="px-4 py-3 flex items-center gap-3">
      {icon}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-slate-400 font-medium">{label}</p>
        {editing ? (
          <div className="flex items-center gap-2 mt-0.5">
            <input
              value={editValue}
              onChange={(e) => onEditChange?.(e.target.value)}
              aria-label={label}
              className="flex-1 px-2 py-1 border border-indigo-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && onEditConfirm?.()}
            />
            <button onClick={onEditConfirm} className="p-1 bg-indigo-500 text-white rounded-lg">
              <Check className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <p className="text-sm font-bold text-slate-800 truncate">{value}</p>
        )}
      </div>
      {badge && (
        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${badgeColor}`}>{badge}</span>
      )}
      {confianza !== undefined && (
        <span className={`text-[10px] font-bold ${confianza >= 85 ? 'text-emerald-500' : confianza >= 70 ? 'text-amber-500' : 'text-red-500'}`}>
          {confianza}%
        </span>
      )}
      {onEdit && !editing && (
        <button onClick={onEdit} className="p-1.5 rounded-lg bg-slate-100 active:scale-90">
          <Edit3 className="w-3.5 h-3.5 text-slate-400" />
        </button>
      )}
    </div>
  );
}

function DetectedField({ campo }: { campo: CampoDetectado }) {
  const bg = campo.confianza >= 85 ? 'bg-emerald-50' : campo.confianza >= 70 ? 'bg-amber-50' : 'bg-red-50';
  return (
    <div className={`px-3 py-2 rounded-lg ${bg} flex items-center gap-2`}>
      <span className="text-xs font-medium text-slate-600 w-24 shrink-0">{campo.campo}</span>
      <span className="text-xs text-slate-800 font-bold flex-1 truncate">{String(campo.valor)}</span>
      <span className={`text-[10px] font-bold ${campo.confianza >= 85 ? 'text-emerald-600' : 'text-amber-600'}`}>
        {campo.confianza}%
      </span>
      <span className="text-[10px] text-slate-400">{campo.fuente}</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// UTILIDADES
// ═══════════════════════════════════════════════════════════════

function formatearMonto(valor: number): string {
  if (valor >= 1000000) return `$${(valor / 1000000).toFixed(1)}M`;
  if (valor >= 1000) return `$${(valor / 1000).toFixed(0)}K`;
  return `$${valor.toLocaleString('es-CL')}`;
}

function formatFecha(fecha: string): string {
  if (!fecha) return '-';
  const d = new Date(fecha + 'T00:00:00');
  return d.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' });
}

function getMedioIcon(medio: string) {
  const m = medio.toLowerCase();
  if (m.includes('radio')) return <Radio className="w-3 h-3" />;
  if (m.includes('tv') || m.includes('tele')) return <Tv className="w-3 h-3" />;
  if (m.includes('digital') || m.includes('redes')) return <Globe className="w-3 h-3" />;
  if (m.includes('prensa')) return <Newspaper className="w-3 h-3" />;
  return null;
}
