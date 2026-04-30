/**
 * ?? MOBILE WIZARD � Paso 1: Resumen IA
 * 
 * Muestra el borrador generado por la IA: datos del cliente,
 * valor, fechas, descuento, l�neas de pauta pre-llenadas.
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

// ---------------------------------------------------------------
// PROPS
// ---------------------------------------------------------------

interface WizardStepResumenIAProps {
  datosExtraidos: DatosExtraidos;
  contrato: ContratoSugerido;
  onNext: () => void;
  onEditField: (campo: string, valor: string | number) => void;
}

// ---------------------------------------------------------------
// COMPONENTE
// ---------------------------------------------------------------

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

  const confianzaColor = datosExtraidos.confianzaGlobal >= 85 ? 'text-[#6888ff]' :
    datosExtraidos.confianzaGlobal >= 70 ? 'text-[#6888ff]' : 'text-[#9aa3b8]';

  const confianzaBg = datosExtraidos.confianzaGlobal >= 85 ? 'bg-[#6888ff]/5 border-[#bec8de]' :
    datosExtraidos.confianzaGlobal >= 70 ? 'bg-[#6888ff]/5 border-[#bec8de]' : 'bg-[#dfeaff] border-[#bec8de]';

  return (
    <div className="space-y-4">
      {/* CONFIANZA GLOBAL */}
      <div className={`p-3 rounded-xl border flex items-center gap-3 ${confianzaBg}`}>
        <Sparkles className={`w-5 h-5 ${confianzaColor}`} />
        <div className="flex-1">
          <p className={`text-sm font-bold ${confianzaColor}`}>
            Confianza IA: {datosExtraidos.confianzaGlobal}%
          </p>
          <p className="text-[10px] text-[#9aa3b8]">
            {datosExtraidos.camposDetectados.length} campos detectados
            {datosExtraidos.camposFaltantes.length > 0 && ` � ${datosExtraidos.camposFaltantes.length} pendientes`}
          </p>
        </div>
        {datosExtraidos.lineasClonadas && (
          <span className="px-2 py-1 bg-[#6888ff]/10 text-[#6888ff] text-[10px] font-bold rounded-full flex items-center gap-1">
            <History className="w-3 h-3" /> Historial
          </span>
        )}
      </div>

      {/* DATOS PRINCIPALES */}
      <div className="bg-[#dfeaff] rounded-2xl border border-[#bec8de30] divide-y divide-[#bec8de30] overflow-hidden shadow-sm">
        <FieldRow
          icon={<Building2 className="w-4 h-4 text-[#6888ff]" />}
          label="Cliente"
          value={contrato.cliente.nombre}
          badge={contrato.cliente.esNuevo ? 'Nuevo' : 'Existente'}
          badgeColor={contrato.cliente.esNuevo ? 'bg-[#6888ff]/10 text-[#6888ff]' : 'bg-[#6888ff]/10 text-[#6888ff]'}
          confianza={datosExtraidos.camposDetectados.find(c => c.campo === 'cliente')?.confianza}
          editing={editingField === 'cliente'}
          editValue={editValue}
          onEdit={() => startEdit('cliente', contrato.cliente.nombre)}
          onEditChange={setEditValue}
          onEditConfirm={confirmEdit}
        />
        <FieldRow
          icon={<DollarSign className="w-4 h-4 text-[#6888ff]" />}
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
          icon={<Percent className="w-4 h-4 text-[#6888ff]" />}
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
          icon={<Calendar className="w-4 h-4 text-[#6888ff]" />}
          label="Per�odo"
          value={`${formatFecha(contrato.fechaInicio)} ? ${formatFecha(contrato.fechaFin)}`}
          confianza={85}
        />
        <FieldRow
          icon={<Clock className="w-4 h-4 text-[#6888ff]" />}
          label="Pago"
          value={`${contrato.terminosPago} d�as � ${datosExtraidos.facturacion.modalidad}`}
          confianza={datosExtraidos.facturacion.confianza}
        />
      </div>

      {/* MEDIOS DETECTADOS */}
      {datosExtraidos.mediosDetectados.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-[#9aa3b8] uppercase tracking-widest px-1">Medios detectados</p>
          <div className="flex flex-wrap gap-2">
            {datosExtraidos.mediosDetectados.map(medio => (
              <span key={medio} className="px-3 py-1.5 bg-[#dfeaff] border border-[#bec8de30] rounded-full text-xs font-bold text-[#6888ff] flex items-center gap-1.5">
                {getMedioIcon(medio)}
                {medio}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* RESUMEN L�NEAS DE PAUTA */}
      {contrato.lineasPauta.length > 0 && (
        <div className="bg-[#dfeaff] rounded-xl border border-[#bec8de30] p-3">
          <p className="text-xs font-bold text-[#6888ff]">
            {contrato.lineasPauta.length} l�nea{contrato.lineasPauta.length > 1 ? 's' : ''} de pauta detectada{contrato.lineasPauta.length > 1 ? 's' : ''}
          </p>
          <p className="text-[10px] text-[#6888ff] mt-0.5">
            Total: {formatearMonto(contrato.lineasPauta.reduce((s, l) => s + l.totalNeto, 0))}
          </p>
        </div>
      )}

      {/* CAMPOS FALTANTES */}
      {datosExtraidos.camposFaltantes.length > 0 && (
        <div className="p-3 rounded-xl bg-[#6888ff]/5 border border-[#bec8de30] flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-[#6888ff] mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-bold text-[#6888ff]">Campos pendientes</p>
            <p className="text-[10px] text-[#6888ff] mt-0.5">
              {datosExtraidos.camposFaltantes.join(', ')}
            </p>
          </div>
        </div>
      )}

      {/* CAMPOS DETECTADOS EXPANDIBLE */}
      <button
        onClick={() => setExpandedFields(!expandedFields)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[#dfeaff] border border-[#bec8de30] text-xs text-[#9aa3b8]"
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

      {/* APROBACI�N */}
      {contrato.aprobacionRequerida && (
        <div className="p-3 rounded-xl bg-[#6888ff]/5 border border-[#bec8de30]">
          <p className="text-xs font-bold text-[#6888ff]">
            Requiere aprobaci�n: {contrato.nivelAprobacion}
          </p>
          {contrato.motivoAprobacion && (
            <p className="text-[10px] text-[#6888ff] mt-0.5">{contrato.motivoAprobacion}</p>
          )}
        </div>
      )}

      {/* BOT�N CONTINUAR */}
      <button
        onClick={onNext}
        className="w-full py-4 bg-[#6888ff] text-white rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-[0.97] transition-transform shadow-lg shadow-[#6888ff]/20"
      >
        Revisar L�neas de Pauta
        <ChevronDown className="w-5 h-5 rotate-[-90deg]" />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------
// SUB-COMPONENTES
// ---------------------------------------------------------------

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
        <p className="text-[10px] text-[#9aa3b8] font-medium">{label}</p>
        {editing ? (
          <div className="flex items-center gap-2 mt-0.5">
            <input
              value={editValue}
              onChange={(e) => onEditChange?.(e.target.value)}
              aria-label={label}
              className="flex-1 px-2 py-1 border border-[#bec8de] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6888ff]/50"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && onEditConfirm?.()}
            />
            <button onClick={onEditConfirm} className="p-1 bg-[#6888ff] text-white rounded-lg">
              <Check className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <p className="text-sm font-bold text-[#69738c] truncate">{value}</p>
        )}
      </div>
      {badge && (
        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${badgeColor}`}>{badge}</span>
      )}
      {confianza !== undefined && (
        <span className={`text-[10px] font-bold ${confianza >= 85 ? 'text-[#6888ff]' : confianza >= 70 ? 'text-[#6888ff]' : 'text-[#9aa3b8]'}`}>
          {confianza}%
        </span>
      )}
      {onEdit && !editing && (
        <button onClick={onEdit} className="p-1.5 rounded-lg bg-[#dfeaff] active:scale-90">
          <Edit3 className="w-3.5 h-3.5 text-[#9aa3b8]" />
        </button>
      )}
    </div>
  );
}

function DetectedField({ campo }: { campo: CampoDetectado }) {
  const bg = campo.confianza >= 85 ? 'bg-[#6888ff]/5' : campo.confianza >= 70 ? 'bg-[#6888ff]/5' : 'bg-[#dfeaff]';
  return (
    <div className={`px-3 py-2 rounded-lg ${bg} flex items-center gap-2`}>
      <span className="text-xs font-medium text-[#69738c] w-24 shrink-0">{campo.campo}</span>
      <span className="text-xs text-[#69738c] font-bold flex-1 truncate">{String(campo.valor)}</span>
      <span className={`text-[10px] font-bold ${campo.confianza >= 85 ? 'text-[#6888ff]' : 'text-[#6888ff]'}`}>
        {campo.confianza}%
      </span>
      <span className="text-[10px] text-[#9aa3b8]">{campo.fuente}</span>
    </div>
  );
}

// ---------------------------------------------------------------
// UTILIDADES
// ---------------------------------------------------------------

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
