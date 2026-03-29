/**
 * 📤 MOBILE: Export Bottom Sheet
 * 
 * Bottom sheet para exportar resultados en múltiples formatos.
 * Replica ExportOptionsModal + ExportSuccessModal en patrón mobile-native.
 * 
 * @tier TIER_0_ENTERPRISE
 * @platform MOBILE
 */

'use client';

import { useState } from 'react';
import {
  X, Download, Mail, Smartphone, FileText,
  CheckCircle2, Shield, Loader2, Share2
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// INTERFACES
// ═══════════════════════════════════════════════════════════════

interface MobileExportSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

type ExportFormat = 'pdf' | 'csv' | 'email' | 'whatsapp';

interface FormatOption {
  id: ExportFormat;
  label: string;
  desc: string;
  icon: React.ElementType;
  color: string;
}

const FORMATS: FormatOption[] = [
  { id: 'pdf', label: 'PDF Ejecutivo', desc: 'Reporte con gráficos y certificación', icon: FileText, color: 'bg-red-500' },
  { id: 'csv', label: 'CSV / Excel', desc: 'Datos crudos para análisis', icon: Download, color: 'bg-emerald-500' },
  { id: 'email', label: 'Email Directo', desc: 'Enviar reporte al anunciante', icon: Mail, color: 'bg-blue-500' },
  { id: 'whatsapp', label: 'WhatsApp', desc: 'Compartir link seguro', icon: Smartphone, color: 'bg-green-500' },
];

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export function MobileExportSheet({ isOpen, onClose }: MobileExportSheetProps) {
  const [selected, setSelected] = useState<ExportFormat>('pdf');
  const [includeClips, setIncludeClips] = useState(true);
  const [includeBlockchain, setIncludeBlockchain] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    // Simulate export
    await new Promise(r => setTimeout(r, 2000));
    setExporting(false);
    setSuccess(true);
  };

  const handleClose = () => {
    setSuccess(false);
    setExporting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* BACKDROP */}
      <div
        className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* SHEET */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom duration-300">
        {/* HANDLE */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
        </div>

        {/* HEADER */}
        <div className="flex items-center justify-between px-5 pb-4">
          <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <Share2 className="w-5 h-5 text-indigo-500" />
            {success ? 'Exportación Exitosa' : 'Exportar Resultados'}
          </h2>
          <button onClick={handleClose} className="p-2 rounded-full bg-slate-100 active:scale-90">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* SUCCESS STATE */}
        {success ? (
          <div className="px-5 pb-10 pt-4">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-lg">Exportación Completada</p>
                <p className="text-sm text-slate-500 mt-1">
                  {selected === 'pdf' ? 'PDF generado y descargado' :
                   selected === 'csv' ? 'CSV descargado exitosamente' :
                   selected === 'email' ? 'Email enviado al anunciante' :
                   'Link compartido por WhatsApp'}
                </p>
              </div>

              {/* SUMMARY */}
              <div className="w-full bg-slate-50 rounded-xl p-4 space-y-2 text-left">
                <SummaryRow label="Formato" value={FORMATS.find(f => f.id === selected)?.label || ''} />
                <SummaryRow label="Registros" value="6 emisiones" />
                <SummaryRow label="Blockchain" value={includeBlockchain ? 'Certificado incluido' : 'No incluido'} />
                <SummaryRow label="Timestamp" value={new Date().toLocaleTimeString('es-CL')} />
              </div>

              <button
                onClick={handleClose}
                className="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-xl active:scale-95 transition-transform shadow-lg"
              >
                Cerrar
              </button>
            </div>
          </div>
        ) : (
          <div className="px-5 pb-10 space-y-5">
            {/* FORMAT SELECTION */}
            <div className="space-y-2">
              {FORMATS.map(fmt => {
                const Icon = fmt.icon;
                return (
                  <button
                    key={fmt.id}
                    onClick={() => setSelected(fmt.id)}
                    className={`w-full p-4 rounded-xl border flex items-center gap-4 transition-all active:scale-[0.98] ${
                      selected === fmt.id
                        ? 'border-indigo-200 bg-indigo-50/50 shadow-sm'
                        : 'border-slate-100 bg-white'
                    }`}
                  >
                    <div className={`w-11 h-11 rounded-xl ${fmt.color} flex items-center justify-center text-white shadow-md`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-bold text-slate-800 text-sm">{fmt.label}</p>
                      <p className="text-xs text-slate-500">{fmt.desc}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selected === fmt.id ? 'border-indigo-500 bg-indigo-500' : 'border-slate-300'
                    }`}>
                      {selected === fmt.id && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* OPTIONS */}
            <div className="space-y-3">
              <ToggleOption
                label="Incluir clips de audio"
                checked={includeClips}
                onChange={setIncludeClips}
              />
              <ToggleOption
                label="Certificación Blockchain"
                checked={includeBlockchain}
                onChange={setIncludeBlockchain}
                icon={<Shield className="w-4 h-4 text-emerald-500" />}
              />
            </div>

            {/* EXPORT BUTTON */}
            <button
              onClick={handleExport}
              disabled={exporting}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-indigo-200 active:scale-[0.97] transition-transform disabled:opacity-70"
            >
              {exporting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Exportando...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Exportar {FORMATS.find(f => f.id === selected)?.label}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════

function ToggleOption({ label, checked, onChange, icon }: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  icon?: React.ReactNode;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="w-full flex items-center justify-between p-3 bg-slate-50 rounded-xl active:scale-[0.98]"
    >
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm font-bold text-slate-600">{label}</span>
      </div>
      <div className={`w-10 h-6 rounded-full transition-colors ${checked ? 'bg-indigo-500' : 'bg-slate-300'}`}>
        <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform mt-0.5 ${
          checked ? 'translate-x-4.5 ml-0.5' : 'translate-x-0.5'
        }`} />
      </div>
    </button>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-slate-400">{label}</span>
      <span className="font-bold text-slate-700">{value}</span>
    </div>
  );
}
