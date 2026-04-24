/**
 * ? MOBILE WIZARD � Paso 3: Confirmar y Enviar
 * 
 * Pantalla final del wizard express. Muestra un resumen
 * compacto del contrato, valida inventario, y permite
 * al ejecutivo crear el contrato con un toque.
 * 
 * @tier TIER_0_ENTERPRISE
 * @platform MOBILE
 */

'use client';

import { useState } from 'react';
import {
  CheckCircle2, Loader2, AlertTriangle,
  Building2, DollarSign, Calendar, FileText,
  Radio, Tv, Globe, Newspaper, Shield,
  Send, ArrowLeft, Sparkles, PartyPopper,
  ExternalLink, Copy, Check,
} from 'lucide-react';
import type { ContratoSugerido, ResultadoConfirmacion, LineaPautaSugerida } from '../../_shared/useSmartCapture';

// ---------------------------------------------------------------
// PROPS
// ---------------------------------------------------------------

interface WizardStepConfirmarProps {
  contrato: ContratoSugerido;
  confirming: boolean;
  confirmacion: ResultadoConfirmacion | null;
  error: string | null;
  onConfirmar: () => void;
  onBack: () => void;
  onClose: () => void;
}

// ---------------------------------------------------------------
// COMPONENTE
// ---------------------------------------------------------------

export function WizardStepConfirmar({
  contrato, confirming, confirmacion, error,
  onConfirmar, onBack, onClose,
}: WizardStepConfirmarProps) {
  const [copiedNum, setCopiedNum] = useState(false);

  const totalLineas = contrato.lineasPauta.reduce((s, l) => s + l.totalNeto, 0);
  const hayConflictos = contrato.lineasPauta.some(l =>
    l.disponibilidad?.estado === 'no_disponible' || l.disponibilidad?.estado === 'saturado'
  );

  const copyNumero = () => {
    if (confirmacion?.numero) {
      navigator.clipboard.writeText(confirmacion.numero);
      setCopiedNum(true);
      setTimeout(() => setCopiedNum(false), 2000);
    }
  };

  // -- PANTALLA DE �XITO --
  if (confirmacion) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-2xl shadow-emerald-200">
          <PartyPopper className="w-10 h-10 text-white" />
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-xl font-black text-[#69738c]">Contrato Creado</h2>
          <p className="text-sm text-[#9aa3b8]">{confirmacion.mensaje}</p>
        </div>

        {/* N�MERO */}
        <div className="bg-[#dfeaff] border border-[#bec8de30] rounded-2xl p-4 w-full text-center">
          <p className="text-[10px] text-[#9aa3b8] uppercase font-bold tracking-widest">N�mero de contrato</p>
          <div className="flex items-center justify-center gap-2 mt-1">
            <p className="text-2xl font-mono font-black text-[#6888ff]">{confirmacion.numero}</p>
            <button onClick={copyNumero} className="p-1.5 rounded-lg bg-[#dfeaff] active:scale-90">
              {copiedNum ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-[#6888ff]" />}
            </button>
          </div>
        </div>

        {/* ESTADO */}
        <div className={`w-full p-3 rounded-xl flex items-center gap-3 ${
          confirmacion.estado === 'activo' ? 'bg-emerald-50 border border-[#bec8de30]' :
          'bg-amber-50 border border-[#bec8de30]'
        }`}>
          {confirmacion.estado === 'activo' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          ) : (
            <Shield className="w-5 h-5 text-amber-600" />
          )}
          <div>
            <p className={`text-sm font-bold ${
              confirmacion.estado === 'activo' ? 'text-emerald-700' : 'text-amber-700'
            }`}>
              {confirmacion.estado === 'activo' ? 'Contrato activo' : 'Pendiente de aprobaci�n'}
            </p>
            {confirmacion.aprobadores && (
              <p className="text-[10px] text-[#9aa3b8] mt-0.5">
                Enviado a: {confirmacion.aprobadores.map(a => a.nombre).join(', ')}
              </p>
            )}
          </div>
        </div>

        {/* ACCIONES */}
        <div className="w-full space-y-3">
          {confirmacion.pdfUrl && (
            <button className="w-full py-3 border border-[#bec8de30] text-[#6888ff] rounded-2xl font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.97]">
              <FileText className="w-4 h-4" /> Ver PDF
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
          <button
            onClick={onClose}
            className="w-full py-4 bg-[#6888ff] text-white rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-[0.97] shadow-lg shadow-[#6888ff]/20"
          >
            <Sparkles className="w-5 h-5" /> Listo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* HEADER */}
      <div className="text-center space-y-1">
        <div className="w-14 h-14 rounded-2xl bg-[#6888ff] flex items-center justify-center mx-auto shadow-lg shadow-[#6888ff]/20">
          <Send className="w-7 h-7 text-white" />
        </div>
        <h3 className="font-black text-lg text-[#69738c] mt-3">Confirmar Contrato</h3>
        <p className="text-xs text-[#9aa3b8]">Revisa el resumen antes de crear</p>
      </div>

      {/* RESUMEN COMPACTO */}
      <div className="bg-[#dfeaff] rounded-2xl border border-[#bec8de30] overflow-hidden shadow-sm divide-y divide-[#bec8de30]">
        <SummaryRow icon={<Building2 className="w-4 h-4 text-[#6888ff]" />} label="Cliente" value={contrato.cliente.nombre} />
        <SummaryRow icon={<DollarSign className="w-4 h-4 text-emerald-500" />} label="Valor total" value={formatMonto(totalLineas || contrato.valor)} bold />
        <SummaryRow icon={<Calendar className="w-4 h-4 text-blue-500" />} label="Per�odo" value={`${formatFecha(contrato.fechaInicio)} ? ${formatFecha(contrato.fechaFin)}`} />
        <SummaryRow icon={<FileText className="w-4 h-4 text-purple-500" />} label="Facturaci�n" value={`${contrato.facturacion.modalidad} � ${contrato.terminosPago} d�as`} />
      </div>

      {/* L�NEAS DE PAUTA */}
      <div className="space-y-2">
        <p className="text-[10px] font-bold text-[#9aa3b8] uppercase tracking-widest px-1">
          {contrato.lineasPauta.length} l�nea{contrato.lineasPauta.length !== 1 ? 's' : ''} de pauta
        </p>
        {contrato.lineasPauta.map(linea => (
          <LineaResumen key={linea.id} linea={linea} />
        ))}
      </div>

      {/* ALERTAS */}
      {hayConflictos && (
        <div className="p-3 rounded-xl bg-amber-50 border border-[#bec8de30] flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-bold text-amber-700">Conflictos de inventario</p>
            <p className="text-[10px] text-amber-600">Algunas l�neas tienen disponibilidad limitada. El contrato se crear� pero puede requerir ajustes.</p>
          </div>
        </div>
      )}

      {/* APROBACI�N */}
      {contrato.aprobacionRequerida && (
        <div className="p-3 rounded-xl bg-purple-50 border border-[#bec8de30] flex items-start gap-2">
          <Shield className="w-4 h-4 text-purple-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-bold text-purple-700">Requiere aprobaci�n: {contrato.nivelAprobacion}</p>
            {contrato.motivoAprobacion && (
              <p className="text-[10px] text-purple-500 mt-0.5">{contrato.motivoAprobacion}</p>
            )}
          </div>
        </div>
      )}

      {/* ERROR */}
      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-[#bec8de30] flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <p className="text-xs text-red-600 font-medium">{error}</p>
        </div>
      )}

      {/* BOTONES */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          disabled={confirming}
          className="flex-1 py-3.5 border border-[#bec8de30] text-[#69738c] rounded-2xl font-bold text-sm flex items-center justify-center gap-1 active:scale-[0.97] disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" /> Volver
        </button>
        <button
          onClick={onConfirmar}
          disabled={confirming}
          className="flex-[2] py-3.5 bg-[#6888ff] text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.97] disabled:opacity-70 shadow-lg shadow-emerald-200"
        >
          {confirming ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Creando contrato...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" /> Crear Contrato
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------
// SUB-COMPONENTES
// ---------------------------------------------------------------

function SummaryRow({ icon, label, value, bold }: {
  icon: React.ReactNode; label: string; value: string; bold?: boolean;
}) {
  return (
    <div className="px-4 py-3 flex items-center gap-3">
      {icon}
      <span className="text-xs text-[#9aa3b8] w-20">{label}</span>
      <span className={`text-sm flex-1 text-right ${bold ? 'font-black text-emerald-600' : 'font-bold text-[#69738c]'}`}>
        {value}
      </span>
    </div>
  );
}

function LineaResumen({ linea }: { linea: LineaPautaSugerida }) {
  const disponibilidadOk = linea.disponibilidad?.estado === 'disponible' || linea.disponibilidad?.estado === 'limitado';

  return (
    <div className="px-3 py-2 rounded-xl bg-[#dfeaff] border border-[#bec8de30] flex items-center gap-3">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getCategoriaColor(linea.categoria)}`}>
        {getCategoriaIcon(linea.categoria)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-[#69738c] truncate">{linea.medioNombre}</p>
        <p className="text-[10px] text-[#9aa3b8]">{linea.cantidad} frases{linea.horarioInicio ? ` � ${linea.horarioInicio}-${linea.horarioFin}` : ''}</p>
      </div>
      <div className="text-right">
        <p className="text-xs font-bold text-[#69738c]">{formatMonto(linea.totalNeto)}</p>
        {!disponibilidadOk && (
          <span className="text-[9px] text-amber-600 font-bold">Revisar</span>
        )}
      </div>
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

function formatFecha(fecha: string): string {
  if (!fecha) return '-';
  const d = new Date(fecha + 'T00:00:00');
  return d.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' });
}

function getCategoriaIcon(cat: LineaPautaSugerida['categoria']) {
  switch (cat) {
    case 'Radio': return <Radio className="w-3.5 h-3.5 text-white" />;
    case 'Televisión': return <Tv className="w-3.5 h-3.5 text-white" />;
    case 'Digital': return <Globe className="w-3.5 h-3.5 text-white" />;
    case 'Prensa': return <Newspaper className="w-3.5 h-3.5 text-white" />;
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
