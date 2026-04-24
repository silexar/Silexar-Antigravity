'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Music, Download, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';

interface ClipItem {
  materialNombre: string;
  clipUrl?: string;
  imageUrl?: string;
  esDigital?: boolean;
  horaEmision?: string;
  spxCode?: string;
}

interface ValidacionResponse {
  acceso: {
    id: string;
    linkUuid: string;
    codigoAcceso: string;
    estado: string;
    clienteEmail: string;
    clipUrl?: string;
    fechaExpiracion: string;
    usosPermitidos: number;
    usosRealizados: number;
  };
  clips: ClipItem[];
}

const BG = 'bg-[#dfeaff]';
const TEXT = 'text-[#69738c]';
const TEXT_LIGHT = 'text-[#9aa3b8]';
const SHADOW_OUT = 'shadow-[8px_8px_16px_#bec8de,-8px_-8px_16px_#ffffff]';
const SHADOW_OUT_SM = 'shadow-[6px_6px_12px_#bec8de,-6px_-6px_12px_#ffffff]';
const SHADOW_IN = 'shadow-[inset_4px_4px_8px_#bec8de,inset_-4px_-4px_8px_#ffffff]';
const SHADOW_ICON = 'shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff]';
const ACCENT = 'bg-[#6888ff]';
const ACCENT_TEXT = 'text-[#6888ff]';

export default function EvidenciaPage({ params }: { params: { linkUuid: string } }) {
  const searchParams = useSearchParams();
  const tenantId = searchParams.get('t') || '';
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ValidacionResponse | null>(null);

  const handleValidar = async () => {
    if (!codigo.trim() || !tenantId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/registro-emision/accesos/validar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigoAcceso: codigo.trim().toUpperCase(), tenantId }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.message || json.error || 'Código inválido');
        return;
      }
      setData(json.data);
    } catch {
      setError('Error de conexión. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleDescargar = async (clipUrl?: string) => {
    if (!clipUrl) return;
    window.open(clipUrl, '_blank');
  };

  return (
    <main className={`min-h-screen ${BG} flex items-center justify-center p-4 ${TEXT}`}>
      <div className="w-full max-w-md">
        <div className={`rounded-3xl ${BG} p-8 ${SHADOW_OUT}`}>
          <div className="mb-6 flex justify-center">
            <div className={`rounded-full ${BG} p-4 ${SHADOW_ICON}`}>
              <ShieldCheck className="h-8 w-8 text-emerald-600" />
            </div>
          </div>

          <h1 className="mb-2 text-center text-2xl font-bold text-slate-700">Evidencia de Emisión</h1>
          <p className={`mb-6 text-center text-sm ${TEXT_LIGHT}`}>
            Portal seguro de verificación de spots y menciones.
          </p>

          {!data ? (
            <div className="space-y-4">
              <div className={`rounded-2xl ${BG} p-1 ${SHADOW_IN}`}>
                <input
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && handleValidar()}
                  placeholder="Ingrese código de acceso"
                  className={`w-full rounded-xl bg-transparent px-4 py-3 text-center font-mono text-lg tracking-widest text-slate-700 outline-none placeholder:${TEXT_LIGHT}`}
                  maxLength={12}
                />
              </div>

              {error && (
                <div className="flex items-center justify-center gap-2 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              <button
                onClick={handleValidar}
                disabled={loading || !codigo.trim()}
                className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3 font-semibold text-white transition ${loading || !codigo.trim()
                  ? 'bg-slate-300 cursor-not-allowed opacity-60'
                  : `${ACCENT} ${SHADOW_OUT} hover:bg-[#5572ee]`
                }`}
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Validar Código'}
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              <div className={`rounded-2xl ${BG} p-4 ${SHADOW_OUT_SM}`}>
                <p className={`text-center text-sm ${TEXT_LIGHT}`}>Acceso válido para</p>
                <p className="text-center font-medium text-slate-700">{data.acceso.clienteEmail}</p>
              </div>

              <div className="space-y-3">
                {data.clips.map((clip, idx) => (
                  <div
                    key={idx}
                    className={`rounded-2xl ${BG} p-4 ${SHADOW_OUT_SM}`}
                  >
                    <div className="mb-3 flex items-center gap-3">
                      <div className={`rounded-full ${BG} p-2 ${SHADOW_ICON}`}>
                        <Music className={`h-5 w-5 ${TEXT}`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-700">{clip.materialNombre}</p>
                        {clip.horaEmision && (
                          <p className={`text-xs ${TEXT_LIGHT}`}>Hora de emisión: {clip.horaEmision}</p>
                        )}
                        {clip.spxCode && (
                          <p className={`text-xs ${TEXT_LIGHT}`}>SPX: {clip.spxCode}</p>
                        )}
                      </div>
                    </div>

                    {clip.clipUrl && (
                      <audio controls className="mb-3 w-full rounded-xl" src={clip.clipUrl} />
                    )}

                    <button
                      onClick={() => handleDescargar(clip.clipUrl)}
                      disabled={!clip.clipUrl}
                      className={`flex w-full items-center justify-center gap-2 rounded-xl py-2 text-sm font-medium text-white transition ${!clip.clipUrl
                        ? 'bg-slate-300 cursor-not-allowed opacity-50'
                        : `${ACCENT} ${SHADOW_OUT} hover:bg-[#5572ee]`
                      }`}
                    >
                      <Download className="h-4 w-4" />
                      Descargar evidencia
                    </button>
                  </div>
                ))}
              </div>

              <p className={`text-center text-xs ${TEXT_LIGHT}`}>
                Este enlace expira el {new Date(data.acceso.fechaExpiracion).toLocaleDateString()}.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
