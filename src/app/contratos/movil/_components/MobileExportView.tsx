/**
 * ?? MOBILE: Export View
 * 
 * Exportar reportes y datos en PDF/CSV/Excel.
 * Paridad con desktop: contratos/exportaciones/page.tsx
 * 
 * @tier TIER_0_ENTERPRISE
 * @platform MOBILE
 */

'use client';

import { useState } from 'react';
import {
  Download, FileText, Table2, FileSpreadsheet,
  CheckCircle2, Loader2, Share2
} from 'lucide-react';

type FormatoExport = 'pdf' | 'csv' | 'excel';
type TipoReporte = 'contratos' | 'pipeline' | 'cobranza' | 'facturacion' | 'analytics';

const TIPOS: { id: TipoReporte; label: string; desc: string }[] = [
  { id: 'contratos', label: 'Contratos', desc: 'Lista completa de contratos' },
  { id: 'pipeline', label: 'Pipeline', desc: 'Estado del pipeline comercial' },
  { id: 'cobranza', label: 'Cobranza', desc: 'Cuentas pendientes y vencidas' },
  { id: 'facturacion', label: 'Facturación', desc: 'Facturas emitidas y pagadas' },
  { id: 'analytics', label: 'Analytics', desc: 'Métricas y tendencias' },
];

const FORMATOS: { id: FormatoExport; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: 'pdf', label: 'PDF', icon: <FileText className="w-5 h-5" />, desc: 'Documento formal' },
  { id: 'csv', label: 'CSV', icon: <Table2 className="w-5 h-5" />, desc: 'Datos tabulares' },
  { id: 'excel', label: 'Excel', icon: <FileSpreadsheet className="w-5 h-5" />, desc: 'Hoja de cálculo' },
];

export function MobileExportView() {
  const [tipo, setTipo] = useState<TipoReporte>('contratos');
  const [formato, setFormato] = useState<FormatoExport>('pdf');
  const [exportando, setExportando] = useState(false);
  const [completado, setCompletado] = useState(false);

  const handleExport = () => {
    setExportando(true);
    setCompletado(false);
    setTimeout(() => {
      setExportando(false);
      setCompletado(true);
    }, 2000);
  };

  return (
    <div className="space-y-5">
      {/* HEADER */}
      <div className="bg-[#6888ff] rounded-2xl p-5 text-white shadow-xl">
        <div className="flex items-center gap-2 mb-2">
          <Download className="w-5 h-5 text-[#9aa3b8]" />
          <p className="text-xs font-bold text-[#9aa3b8] uppercase tracking-widest">Exportaciones</p>
        </div>
        <p className="text-sm text-[#9aa3b8]">Genera reportes y datos del módulo contratos en el formato que necesites.</p>
      </div>

      {/* TIPO */}
      <div>
        <p className="text-xs font-bold text-[#9aa3b8] uppercase tracking-widest mb-3 px-1">¿Qué exportar?</p>
        <div className="space-y-2">
          {TIPOS.map(t => (
            <button key={t.id} onClick={() => setTipo(t.id)}
              className={`w-full p-3 rounded-xl border flex items-center gap-3 transition-all ${
                tipo === t.id ? 'bg-[#dfeaff] border-[#6888ff]/50 ring-1 ring-[#6888ff]/20' : 'bg-[#dfeaff] border-[#bec8de30]'
              }`}>
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                tipo === t.id ? 'border-[#6888ff]' : 'border-[#bec8de]'
              }`}>
                {tipo === t.id && <div className="w-2 h-2 rounded-full bg-[#6888ff]" />}
              </div>
              <div className="text-left">
                <p className="font-bold text-sm text-[#69738c]">{t.label}</p>
                <p className="text-[10px] text-[#9aa3b8]">{t.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* FORMATO */}
      <div>
        <p className="text-xs font-bold text-[#9aa3b8] uppercase tracking-widest mb-3 px-1">Formato</p>
        <div className="grid grid-cols-3 gap-2">
          {FORMATOS.map(f => (
            <button key={f.id} onClick={() => setFormato(f.id)}
              className={`p-3 rounded-xl border text-center transition-all ${
                formato === f.id ? 'bg-[#dfeaff] border-[#6888ff]/50 ring-1 ring-[#6888ff]/20' : 'bg-[#dfeaff] border-[#bec8de30]'
              }`}>
              <div className={`mx-auto mb-1 ${formato === f.id ? 'text-[#6888ff]' : 'text-[#9aa3b8]'}`}>{f.icon}</div>
              <p className={`text-xs font-bold ${formato === f.id ? 'text-[#6888ff]' : 'text-[#69738c]'}`}>{f.label}</p>
              <p className="text-[9px] text-[#9aa3b8]">{f.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* EXPORT BUTTON */}
      <button onClick={handleExport} disabled={exportando}
        className="w-full py-4 bg-[#6888ff] rounded-2xl text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#6888ff]/20 active:scale-95 disabled:opacity-50">
        {exportando ? (
          <><Loader2 className="w-5 h-5 animate-spin" /> Generando...</>
        ) : completado ? (
          <><CheckCircle2 className="w-5 h-5" /> ¡Exportado!</>
        ) : (
          <><Download className="w-5 h-5" /> Exportar {tipo.charAt(0).toUpperCase() + tipo.slice(1)} en {formato.toUpperCase()}</>
        )}
      </button>

      {/* SUCCESS */}
      {completado && (
        <div className="bg-emerald-50 border border-[#bec8de30] rounded-xl p-4 flex items-center gap-3">
          <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          <div className="flex-1">
            <p className="font-bold text-emerald-700 text-sm">Archivo generado</p>
            <p className="text-xs text-emerald-600">reporte-{tipo}-{new Date().toISOString().split('T')[0]}.{formato}</p>
          </div>
          <button className="p-2 rounded-lg bg-emerald-100 active:scale-90"><Share2 className="w-4 h-4 text-emerald-700" /></button>
        </div>
      )}
    </div>
  );
}
