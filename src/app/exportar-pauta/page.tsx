/**
 * 📤 SILEXAR PULSE - Página de Exportación de Pauta
 * 
 * @description Centro de exportación y generación de archivos de pauta
 * para envío a emisoras con múltiples formatos
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  FileDown, 
  Calendar, 
  Radio,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  FileText,
  FileCode,
  FileJson,
  Download,
  Eye,
  CheckCircle,
  Clock,
  Music,
  Send,
  Copy
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface FormatoInfo {
  id: string;
  nombre: string;
  descripcion: string;
  extension: string;
  icon: React.ElementType;
  color: string;
}

interface PreviewData {
  formato: string;
  nombreArchivo: string;
  mimeType: string;
  tamanioBytes: number;
  tandasIncluidas: number;
  spotsIncluidos: number;
  preview: string;
}

// ═══════════════════════════════════════════════════════════════
// DATOS
// ═══════════════════════════════════════════════════════════════

const FORMATOS: FormatoInfo[] = [
  { id: 'csv', nombre: 'CSV', descripcion: 'Formato estándar compatible con Excel', extension: '.csv', icon: FileText, color: 'from-emerald-400 to-emerald-500' },
  { id: 'dalet', nombre: 'Dalet', descripcion: 'Sistema de automatización radial', extension: '.dalet', icon: Radio, color: 'from-blue-400 to-blue-500' },
  { id: 'xml', nombre: 'XML', descripcion: 'Formato estructurado para sistemas', extension: '.xml', icon: FileCode, color: 'from-orange-400 to-orange-500' },
  { id: 'txt', nombre: 'TXT', descripcion: 'Formato legible para impresión', extension: '.txt', icon: FileText, color: 'from-slate-400 to-slate-500' },
  { id: 'json', nombre: 'JSON', descripcion: 'Formato para integraciones API', extension: '.json', icon: FileJson, color: 'from-purple-400 to-purple-500' }
];

const EMISORAS = [
  { codigo: 'COOP', nombre: 'Radio Cooperativa' },
  { codigo: 'ADN', nombre: 'Radio ADN' },
  { codigo: 'BIO', nombre: 'Radio Biobío' },
  { codigo: 'INF', nombre: 'Radio Infinita' },
  { codigo: 'CON', nombre: 'Radio Concierto' }
];

// ═══════════════════════════════════════════════════════════════
// COMPONENTES NEUROMÓRFICOS
// ═══════════════════════════════════════════════════════════════

const NeuromorphicCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-2xl p-6 bg-gradient-to-br from-slate-50 to-slate-100 shadow-[8px_8px_16px_rgba(0,0,0,0.1),-8px_-8px_16px_rgba(255,255,255,0.9)] ${className}`}>
    {children}
  </div>
);

const NeuromorphicButton = ({ children, onClick, variant = 'secondary', disabled = false, className = '' }: { 
  children: React.ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary' | 'success'; disabled?: boolean; className?: string;
}) => {
  const variants = {
    primary: 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-[4px_4px_12px_rgba(99,102,241,0.4)]',
    secondary: 'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 shadow-[4px_4px_12px_rgba(0,0,0,0.1)]',
    success: 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-[4px_4px_12px_rgba(16,185,129,0.4)]'
  };
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function ExportarPautaPage() {
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [emisora, setEmisora] = useState('COOP');
  const [formatoSeleccionado, setFormatoSeleccionado] = useState('csv');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [generando, setGenerando] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const cambiarFecha = (dias: number) => {
    const nuevaFecha = new Date(fecha);
    nuevaFecha.setDate(nuevaFecha.getDate() + dias);
    setFecha(nuevaFecha.toISOString().split('T')[0]);
  };

  const cargarPreview = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/exportar-pauta?formato=${formatoSeleccionado}&fecha=${fecha}&emisora=${emisora}`);
      const data = await response.json();
      if (data.success) {
        setPreview(data.data);
      }
    } catch (error) {
      /* console.error('Error:', error) */;
    } finally {
      setLoading(false);
    }
  }, [formatoSeleccionado, fecha, emisora]);

  useEffect(() => { cargarPreview(); }, [cargarPreview]);

  const descargarArchivo = async () => {
    setGenerando(true);
    try {
      const response = await fetch(`/api/exportar-pauta?formato=${formatoSeleccionado}&fecha=${fecha}&emisora=${emisora}&download=true`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = preview?.nombreArchivo || `pauta_${emisora}_${fecha}.${formatoSeleccionado}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      /* console.error('Error:', error) */;
    } finally {
      setGenerando(false);
    }
  };

  const copiarContenido = () => {
    if (preview?.preview) {
      navigator.clipboard.writeText(preview.preview);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  };

  const emisoraInfo = EMISORAS.find(e => e.codigo === emisora);
  const formatoInfo = FORMATOS.find(f => f.id === formatoSeleccionado);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50 to-slate-100 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-indigo-600 bg-clip-text text-transparent flex items-center gap-3">
              <FileDown className="w-10 h-10 text-indigo-500" />
              Exportar Pauta
            </h1>
            <p className="text-slate-500 mt-2">Generador de archivos para emisoras</p>
          </div>
          
          {/* Selector de fecha */}
          <div className="flex items-center gap-2 bg-white rounded-xl p-2 shadow-md">
            <button onClick={() => cambiarFecha(-1)} className="p-2 rounded-lg hover:bg-slate-100">
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div className="px-4 py-2 font-medium text-slate-800">
              {new Date(fecha).toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' })}
            </div>
            <button onClick={() => cambiarFecha(1)} className="p-2 rounded-lg hover:bg-slate-100">
              <ChevronRight className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Panel de configuración */}
          <div className="space-y-6">
            {/* Selector de emisora */}
            <NeuromorphicCard>
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Radio className="w-5 h-5 text-indigo-500" />
                Emisora
              </h2>
              <div className="space-y-2">
                {EMISORAS.map((e) => (
                  <button
                    key={e.codigo}
                    onClick={() => setEmisora(e.codigo)}
                    className={`w-full p-3 rounded-xl text-left transition-all ${
                      emisora === e.codigo 
                        ? 'bg-indigo-50 border-2 border-indigo-300' 
                        : 'bg-white border border-slate-100 hover:border-indigo-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-3 h-3 rounded-full ${emisora === e.codigo ? 'bg-indigo-500' : 'bg-slate-300'}`} />
                      <div>
                        <p className="font-medium text-sm text-slate-800">{e.nombre}</p>
                        <p className="text-xs text-slate-400">{e.codigo}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </NeuromorphicCard>

            {/* Selector de formato */}
            <NeuromorphicCard>
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-500" />
                Formato
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {FORMATOS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFormatoSeleccionado(f.id)}
                    className={`p-3 rounded-xl text-center transition-all ${
                      formatoSeleccionado === f.id 
                        ? 'bg-indigo-50 border-2 border-indigo-300' 
                        : 'bg-white border border-slate-100 hover:border-indigo-200'
                    }`}
                  >
                    <div className={`w-8 h-8 mx-auto mb-1 rounded-lg flex items-center justify-center bg-gradient-to-br ${f.color}`}>
                      <f.icon className="w-4 h-4 text-white" />
                    </div>
                    <p className="font-bold text-sm text-slate-800">{f.nombre}</p>
                    <p className="text-xs text-slate-400">{f.extension}</p>
                  </button>
                ))}
              </div>
            </NeuromorphicCard>
          </div>

          {/* Panel de preview */}
          <div className="lg:col-span-2">
            <NeuromorphicCard className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-indigo-500" />
                  Vista Previa
                </h2>
                <div className="flex items-center gap-2">
                  <button onClick={cargarPreview} className="p-2 rounded-lg hover:bg-indigo-50 text-indigo-500">
                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                  <button onClick={copiarContenido} className="p-2 rounded-lg hover:bg-indigo-50 text-indigo-500">
                    {copiado ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Info del archivo */}
              {preview && (
                <div className="flex items-center gap-4 mb-4 p-3 bg-indigo-50 rounded-xl">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br ${formatoInfo?.color || 'from-slate-400 to-slate-500'}`}>
                    {formatoInfo && <formatoInfo.icon className="w-5 h-5 text-white" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-800">{preview.nombreArchivo}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{preview.tandasIncluidas} tandas</span>
                      <span className="flex items-center gap-1"><Music className="w-3 h-3" />{preview.spotsIncluidos} spots</span>
                      <span>{(preview.tamanioBytes / 1024).toFixed(1)} KB</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Contenido preview */}
              <div className="flex-1 bg-slate-900 rounded-xl p-4 overflow-auto font-mono text-sm text-slate-300">
                {loading ? (
                  <div className="text-center py-8"><RefreshCw className="w-8 h-8 animate-spin text-indigo-400 mx-auto" /></div>
                ) : preview?.preview ? (
                  <pre className="whitespace-pre-wrap">{preview.preview}</pre>
                ) : (
                  <p className="text-slate-500 text-center py-8">Sin datos para mostrar</p>
                )}
              </div>

              {/* Botones de acción */}
              <div className="flex items-center justify-end gap-3 mt-4">
                <NeuromorphicButton variant="secondary">
                  <Send className="w-4 h-4" /> Enviar por Email
                </NeuromorphicButton>
                <NeuromorphicButton variant="success" onClick={descargarArchivo} disabled={generando || !preview}>
                  {generando ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  Descargar Archivo
                </NeuromorphicButton>
              </div>
            </NeuromorphicCard>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-slate-400 text-sm">
          <p>📤 Exportador de Pauta - SILEXAR PULSE TIER 0</p>
        </div>
      </div>
    </div>
  );
}
