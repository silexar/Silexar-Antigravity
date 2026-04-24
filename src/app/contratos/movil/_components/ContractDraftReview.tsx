/**
 * ? MOBILE: Contract Draft Review
 * 
 * Pantalla de revisión del borrador auto-generado por IA.
 * Muestra campos detectados con score de confianza, permite
 * editar y confirmar en 1 click.
 * 
 * @tier TIER_0_ENTERPRISE
 * @platform MOBILE
 */

'use client';

import { useState } from 'react';
import {
  CheckCircle2, AlertTriangle, Edit3, Sparkles,
  ArrowLeft, Send, FileText, Clock, DollarSign,
  Calendar, Radio, Shield, Loader2, TrendingUp,
  User, Percent
} from 'lucide-react';
import type { ResultadoCaptura } from '../../_shared/useSmartCapture';
import { formatCurrency } from '../../_shared/useContratos';

// ---------------------------------------------------------------
// COMPONENTE PRINCIPAL
// ---------------------------------------------------------------

export function ContractDraftReview({ resultado, onBack, onConfirm }: {
  resultado: ResultadoCaptura;
  onBack: () => void;
  onConfirm: () => void;
}) {
  const { datosExtraidos, contratoSugerido, tiempoProcesamiento, requiereValidacion } = resultado;
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = async () => {
    setConfirming(true);
    await new Promise(r => setTimeout(r, 1500));
    setConfirming(false);
    setConfirmed(true);
    setTimeout(onConfirm, 2000);
  };

  if (confirmed) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-6">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center animate-bounce">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>
        <div className="text-center">
          <p className="text-xl font-black text-[#69738c]">¡Contrato Creado!</p>
          <p className="text-sm text-[#9aa3b8] mt-1">
            {requiereValidacion ? 'Enviado a cola de validación' : 'Listo para aprobación'}
          </p>
        </div>
        <div className="bg-[#dfeaff] rounded-xl px-4 py-2 flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#6888ff]" />
          <span className="text-xs font-bold text-[#6888ff]">Procesado en {tiempoProcesamiento}ms</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* HEADER */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-xl bg-[#dfeaff] border border-[#bec8de30] active:scale-90">
          <ArrowLeft className="w-5 h-5 text-[#69738c]" />
        </button>
        <div className="flex-1">
          <h2 className="text-lg font-black text-[#69738c] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#6888ff]" /> Borrador IA
          </h2>
          <p className="text-xs text-[#9aa3b8]">Revisa y confirma en 1 click</p>
        </div>
        <ConfianzaBadge value={datosExtraidos.confianzaGlobal} />
      </div>

      {/* AI CONFIDENCE BANNER */}
      <div className={`p-4 rounded-2xl flex items-center gap-3 ${
        datosExtraidos.confianzaGlobal >= 80 ? 'bg-emerald-50 border border-[#bec8de30]' :
        datosExtraidos.confianzaGlobal >= 50 ? 'bg-amber-50 border border-[#bec8de30]' :
        'bg-red-50 border border-[#bec8de30]'
      }`}>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          datosExtraidos.confianzaGlobal >= 80 ? 'bg-emerald-100 text-emerald-600' :
          datosExtraidos.confianzaGlobal >= 50 ? 'bg-amber-100 text-amber-600' :
          'bg-red-100 text-red-600'
        }`}>
          <Shield className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-[#69738c]">
            {datosExtraidos.confianzaGlobal >= 80 ? 'Alta confianza — Listo para confirmar' :
             datosExtraidos.confianzaGlobal >= 50 ? 'Confianza media — Verifica los campos marcados' :
             'Baja confianza — Requiere edición manual'}
          </p>
          <p className="text-xs text-[#9aa3b8] mt-0.5">
            {datosExtraidos.camposDetectados.length} campos detectados · {datosExtraidos.camposFaltantes.length} faltantes · {tiempoProcesamiento}ms
          </p>
        </div>
      </div>

      {/* CONTRACT CARD */}
      <div className="bg-[#dfeaff] rounded-2xl border border-[#bec8de30] shadow-sm overflow-hidden">
        <div className="bg-[#6888ff] p-4 text-white">
          <p className="text-sm font-bold text-white/70 uppercase tracking-wide">Contrato Sugerido</p>
          <p className="text-xl font-black mt-1">{contratoSugerido.titulo}</p>
        </div>

        <div className="p-4 space-y-4">
          {/* CLIENTE */}
          <FieldRow
            icon={<User className="w-4 h-4" />}
            label="Cliente"
            value={contratoSugerido.cliente.nombre}
            confianza={datosExtraidos.camposDetectados.find(c => c.campo === 'cliente')?.confianza}
            badge={contratoSugerido.cliente.esNuevo ? 'Nuevo' : 'Existente'}
            badgeColor={contratoSugerido.cliente.esNuevo ? 'text-amber-600 bg-amber-50' : 'text-emerald-600 bg-emerald-50'}
          />

          {/* VALOR */}
          <FieldRow
            icon={<DollarSign className="w-4 h-4" />}
            label="Valor Estimado"
            value={formatCurrency(contratoSugerido.valor)}
            confianza={datosExtraidos.camposDetectados.find(c => c.campo === 'valor')?.confianza}
          />

          {/* DESCUENTO */}
          {contratoSugerido.descuento > 0 && (
            <FieldRow
              icon={<Percent className="w-4 h-4" />}
              label="Descuento"
              value={`${contratoSugerido.descuento}%`}
              confianza={datosExtraidos.camposDetectados.find(c => c.campo === 'descuento')?.confianza}
            />
          )}

          {/* PERÍODO */}
          <FieldRow
            icon={<Calendar className="w-4 h-4" />}
            label="Período"
            value={`${contratoSugerido.fechaInicio} ? ${contratoSugerido.fechaFin}`}
          />

          {/* MEDIOS */}
          {contratoSugerido.medios.length > 0 && (
            <FieldRow
              icon={<Radio className="w-4 h-4" />}
              label="Medios"
              value={contratoSugerido.medios.map(m => m.tipo).join(', ')}
              confianza={datosExtraidos.camposDetectados.find(c => c.campo === 'medios')?.confianza}
            />
          )}

          {/* PAGO */}
          <FieldRow
            icon={<FileText className="w-4 h-4" />}
            label="Condiciones de Pago"
            value={datosExtraidos.condicionesPago}
            confianza={datosExtraidos.camposDetectados.find(c => c.campo === 'condicionesPago')?.confianza}
          />

          {/* MISSING FIELDS */}
          {datosExtraidos.camposFaltantes.length > 0 && (
            <div className="pt-3 border-t border-[#bec8de30]">
              <p className="text-xs font-bold text-amber-600 flex items-center gap-1 mb-2">
                <AlertTriangle className="w-3.5 h-3.5" /> Campos no detectados
              </p>
              <div className="flex gap-2 flex-wrap">
                {datosExtraidos.camposFaltantes.map(campo => (
                  <span key={campo} className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 text-[10px] font-bold">
                    {campo}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MEDIOS BREAKDOWN */}
      {contratoSugerido.medios.length > 0 && (
        <div className="bg-[#dfeaff] rounded-2xl border border-[#bec8de30] p-4">
          <p className="text-xs font-bold text-[#9aa3b8] uppercase tracking-widest mb-3">Desglose por Medio</p>
          {contratoSugerido.medios.map((medio) => (
            <div key={medio.tipo} className="flex items-center justify-between py-2 border-b border-[#bec8de30] last:border-0">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-[#6888ff]" />
                <span className="text-sm font-medium text-[#69738c]">{medio.tipo}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-[#69738c]">{formatCurrency(medio.valorUnitario)}</span>
                <ConfianzaBadge value={medio.confianza} small />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ACTIONS */}
      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 py-4 border border-[#bec8de30] rounded-2xl font-bold text-[#69738c] flex items-center justify-center gap-2 active:scale-95">
          <Edit3 className="w-5 h-5" /> Editar
        </button>
        <button
          onClick={handleConfirm}
          disabled={confirming}
          className="flex-1 py-4 bg-[#6888ff] text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 active:scale-95 disabled:opacity-50"
        >
          {confirming ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-5 h-5" /> Confirmar</>}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------
// SUB-COMPONENTS
// ---------------------------------------------------------------

function FieldRow({ icon, label, value, confianza, badge, badgeColor }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  confianza?: number;
  badge?: string;
  badgeColor?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-[#dfeaff] flex items-center justify-center text-[#9aa3b8]">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-[#9aa3b8] uppercase">{label}</p>
        <p className="text-sm font-bold text-[#69738c] truncate">{value || '—'}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {badge && (
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${badgeColor || 'bg-[#dfeaff] text-[#9aa3b8]'}`}>
            {badge}
          </span>
        )}
        {confianza !== undefined && <ConfianzaBadge value={confianza} small />}
      </div>
    </div>
  );
}

function ConfianzaBadge({ value, small }: { value: number; small?: boolean }) {
  const color = value >= 85 ? 'bg-emerald-100 text-emerald-700' :
                value >= 60 ? 'bg-amber-100 text-amber-700' :
                'bg-red-100 text-red-700';

  return (
    <span className={`font-black rounded-full flex items-center gap-0.5 ${color} ${
      small ? 'text-[9px] px-1.5 py-0.5' : 'text-xs px-2 py-1'
    }`}>
      <TrendingUp className={small ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
      {value}%
    </span>
  );
}
