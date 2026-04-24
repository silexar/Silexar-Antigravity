'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Radio, Calendar, Clock, Search, CheckCircle, Loader2, Music, ShieldCheck, Scissors } from 'lucide-react';
import WaveformEditor from './_components/WaveformEditor';

interface Emisora { id: string; nombre: string; }
interface Campana { id: string; nombre: string; }
interface Material { id: string; nombre: string; tipo: 'audio_pregrabado' | 'mencion_vivo'; url?: string; }
interface RegistroAire { id: string; emisoraId: string; fechaEmision: string; urlArchivo: string; estado: string; }

const BG = 'bg-[#dfeaff]';
const TEXT = 'text-[#69738c]';
const TEXT_LIGHT = 'text-[#9aa3b8]';
const SHADOW_OUT = 'shadow-[8px_8px_16px_#bec8de,-8px_-8px_16px_#ffffff]';
const SHADOW_OUT_SM = 'shadow-[6px_6px_12px_#bec8de,-6px_-6px_12px_#ffffff]';
const SHADOW_IN = 'shadow-[inset_4px_4px_8px_#bec8de,inset_-4px_-4px_8px_#ffffff]';
const ACCENT = 'bg-[#6888ff]';
const ACCENT_TEXT = 'text-[#6888ff]';
const ACCENT_RING = 'ring-[#6888ff]';

function WizardInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Query params para pre-rellenado
  const qpCampanaId = searchParams.get('campanaId') || '';
  const qpFecha = searchParams.get('fechaBusqueda') || '';
  const qpHoraInicio = searchParams.get('horaInicio') || '';
  const qpHoraFin = searchParams.get('horaFin') || '';
  const qpEmisoras = searchParams.get('emisorasIds') || '';
  const qpMateriales = searchParams.get('materialesIds') || '';
  const qpTolerancia = searchParams.get('tolerancia') || '';
  const skipToExec = searchParams.get('ejecutar') === '1';

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [emisoras, setEmisoras] = useState<Emisora[]>([]);
  const [campanas, setCampanas] = useState<Campana[]>([]);
  const [materiales, setMateriales] = useState<Material[]>([]);
  const [registrosAire, setRegistrosAire] = useState<RegistroAire[]>([]);

  const [form, setForm] = useState({
    campanaId: qpCampanaId,
    fechaBusqueda: qpFecha,
    horaInicio: qpHoraInicio || '06:00:00',
    horaFin: qpHoraFin || '23:59:59',
    emisorasIds: qpEmisoras ? qpEmisoras.split(',') : [] as string[],
    registrosAireIds: [] as string[],
    materialesIds: qpMateriales ? qpMateriales.split(',') : [] as string[],
  });

  const [verificacionId, setVerificacionId] = useState<string | null>(null);
  const [resultado, setResultado] = useState<any | null>(null);
  const [trims, setTrims] = useState<Record<string, { inicio: number; fin: number }>>({});
  const [aprobandoClipId, setAprobandoClipId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/emisoras').then(r => r.json()).catch(() => ({ data: [] })),
      fetch('/api/campanas').then(r => r.json()).catch(() => ({ data: [] })),
    ]).then(([e, c]) => {
      setEmisoras(e.data || []);
      setCampanas(c.data || []);
    });
  }, []);

  useEffect(() => {
    if (!form.fechaBusqueda || form.emisorasIds.length === 0) return;
    fetch(`/api/registro-emision/registros-aire?emisoraId=${form.emisorasIds[0]}&estado=procesado&pagina=0&tamano=10`)
      .then(r => r.json())
      .then(j => setRegistrosAire(j.data || []))
      .catch(() => setRegistrosAire([]));
  }, [form.fechaBusqueda, form.emisorasIds]);

  useEffect(() => {
    if (!form.campanaId) { setMateriales([]); return; }
    fetch(`/api/campanas/${form.campanaId}/materiales`)
      .then(r => r.json())
      .then(j => setMateriales(j.data || []))
      .catch(() => setMateriales([]));
  }, [form.campanaId]);

  // Auto-skip: si vienen query params completos, pre-rellenar y saltar pasos
  const [shouldAutoCreate, setShouldAutoCreate] = useState(skipToExec);

  useEffect(() => {
    if (shouldAutoCreate && form.campanaId && form.fechaBusqueda && form.emisorasIds.length > 0 && form.materialesIds.length > 0) {
      // Si los materiales ya están cargados, auto-crear
      if (materiales.length > 0 && materiales.some(m => form.materialesIds.includes(m.id))) {
        setShouldAutoCreate(false);
        crearVerificacion(true);
      } else if (!form.campanaId) {
        // No hay campaña, no podemos auto-crear
        setShouldAutoCreate(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldAutoCreate, materiales.length]);

  const crearVerificacion = async (autoExecute = false) => {
    setLoading(true);
    try {
      const res = await fetch('/api/registro-emision/verificaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          tiposMaterial: materiales.filter(m => form.materialesIds.includes(m.id)).map(m => m.tipo),
        }),
      });
      const json = await res.json();
      if (json.success) {
        setVerificacionId(json.data.id);
        if (autoExecute) {
          setStep(4);
          setTimeout(() => ejecutarVerificacion(json.data.id), 100);
        } else {
          setStep(4);
        }
      }
    } finally {
      if (!autoExecute) setLoading(false);
    }
  };

  const ejecutarVerificacion = async (forcedId?: string) => {
    const vid = forcedId || verificacionId;
    if (!vid) return;
    setLoading(true);
    try {
      const mats = materiales.filter(m => form.materialesIds.includes(m.id)).map(m => ({
        id: m.id,
        nombre: m.nombre,
        tipo: m.tipo,
        url: m.url,
      }));
      const res = await fetch(`/api/registro-emision/verificaciones/${vid}/ejecutar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ materiales: mats }),
      });
      const json = await res.json();
      if (json.success) {
        setResultado(json.data);
        setStep(5);
      }
    } finally {
      setLoading(false);
    }
  };

  const toggle = (arr: string[], val: string) =>
    arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];

  const StepIndicator = () => (
    <div className="mb-6 flex items-center justify-between">
      {[1, 2, 3, 4, 5].map(s => (
        <div key={s} className="flex flex-1 items-center">
          <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
            s === step ? `${ACCENT} text-white ${SHADOW_OUT}` :
            s < step ? 'bg-emerald-500 text-white' :
            `${BG} ${TEXT_LIGHT} ${SHADOW_OUT_SM}`
          }`}>
            {s < step ? <CheckCircle className="h-4 w-4" /> : s}
          </div>
          {s < 5 && <div className={`mx-1 h-1 flex-1 rounded-full ${s < step ? 'bg-emerald-400' : 'bg-[#bec8de]/40'}`} />}
        </div>
      ))}
    </div>
  );

  return (
    <main className={`min-h-screen ${BG} p-4 md:p-8 ${TEXT}`}>
      <div className="mx-auto max-w-3xl">
        <div className={`mb-6 rounded-3xl ${BG} p-6 ${SHADOW_OUT}`}>
          <h1 className="text-xl font-bold text-slate-700 md:text-2xl">Nueva Verificación de Emisión</h1>
          <p className={`mt-1 text-sm ${TEXT_LIGHT}`}>Paso {step} de 5</p>
          <StepIndicator />
        </div>

        {step === 1 && (
          <div className={`space-y-4 rounded-3xl ${BG} p-6 ${SHADOW_OUT}`}>
            <h2 className="flex items-center gap-2 font-semibold text-slate-700"><Calendar className="h-5 w-5" /> Fecha y horario</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <div className={`rounded-2xl ${BG} p-1 ${SHADOW_IN}`}>
                <input type="date" value={form.fechaBusqueda} onChange={e => setForm({ ...form, fechaBusqueda: e.target.value })} className="w-full rounded-xl bg-transparent px-3 py-2 text-sm outline-none" />
              </div>
              <div className={`rounded-2xl ${BG} p-1 ${SHADOW_IN}`}>
                <input type="time" step={1} value={form.horaInicio} onChange={e => setForm({ ...form, horaInicio: e.target.value })} className="w-full rounded-xl bg-transparent px-3 py-2 text-sm outline-none" />
              </div>
              <div className={`rounded-2xl ${BG} p-1 ${SHADOW_IN}`}>
                <input type="time" step={1} value={form.horaFin} onChange={e => setForm({ ...form, horaFin: e.target.value })} className="w-full rounded-xl bg-transparent px-3 py-2 text-sm outline-none" />
              </div>
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={!form.fechaBusqueda}
              className={`w-full rounded-2xl py-3 font-semibold text-white transition ${!form.fechaBusqueda ? 'bg-slate-300 cursor-not-allowed opacity-50' : `${ACCENT} ${SHADOW_OUT} hover:bg-[#5572ee]`}`}
            >
              Continuar
            </button>
          </div>
        )}

        {step === 2 && (
          <div className={`space-y-4 rounded-3xl ${BG} p-6 ${SHADOW_OUT}`}>
            <h2 className="flex items-center gap-2 font-semibold text-slate-700"><Radio className="h-5 w-5" /> Emisoras y registros de aire</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {emisoras.map(e => (
                <label key={e.id} className={`flex cursor-pointer items-center gap-3 rounded-2xl p-3 ${SHADOW_OUT_SM} ${form.emisorasIds.includes(e.id) ? `ring-2 ${ACCENT_RING}` : ''}`}>
                  <input type="checkbox" checked={form.emisorasIds.includes(e.id)} onChange={() => setForm({ ...form, emisorasIds: toggle(form.emisorasIds, e.id) })} className="h-4 w-4 accent-[#6888ff]" />
                  <span className="text-sm text-slate-700">{e.nombre}</span>
                </label>
              ))}
            </div>
            {registrosAire.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-700">Registros de aire disponibles</p>
                {registrosAire.map(r => (
                  <label key={r.id} className={`flex cursor-pointer items-center gap-3 rounded-xl p-3 ${SHADOW_OUT_SM} ${form.registrosAireIds.includes(r.id) ? `ring-2 ${ACCENT_RING}` : ''}`}>
                    <input type="checkbox" checked={form.registrosAireIds.includes(r.id)} onChange={() => setForm({ ...form, registrosAireIds: toggle(form.registrosAireIds, r.id) })} className="h-4 w-4 accent-[#6888ff]" />
                    <div className="text-xs text-slate-600">
                      <p>{r.fechaEmision} — {r.urlArchivo.split('/').pop()}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className={`flex-1 rounded-2xl py-3 font-semibold text-slate-700 ${BG} ${SHADOW_OUT} hover:shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff]`}>Volver</button>
              <button
                onClick={() => setStep(3)}
                disabled={form.emisorasIds.length === 0}
                className={`flex-1 rounded-2xl py-3 font-semibold text-white transition ${form.emisorasIds.length === 0 ? 'bg-slate-300 cursor-not-allowed opacity-50' : `${ACCENT} ${SHADOW_OUT} hover:bg-[#5572ee]`}`}
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className={`space-y-4 rounded-3xl ${BG} p-6 ${SHADOW_OUT}`}>
            <h2 className="flex items-center gap-2 font-semibold text-slate-700"><Music className="h-5 w-5" /> Campaña y materiales</h2>
            <select value={form.campanaId} onChange={e => setForm({ ...form, campanaId: e.target.value })} className={`w-full rounded-2xl ${BG} p-3 ${SHADOW_IN} outline-none`}>
              <option value="">Seleccione campaña</option>
              {campanas.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
            <div className="grid gap-3 sm:grid-cols-2">
              {materiales.map(m => (
                <label key={m.id} className={`flex cursor-pointer items-center gap-3 rounded-2xl p-3 ${SHADOW_OUT_SM} ${form.materialesIds.includes(m.id) ? `ring-2 ${ACCENT_RING}` : ''}`}>
                  <input type="checkbox" checked={form.materialesIds.includes(m.id)} onChange={() => setForm({ ...form, materialesIds: toggle(form.materialesIds, m.id) })} className="h-4 w-4 accent-[#6888ff]" />
                  <span className="text-sm text-slate-700">{m.nombre} <span className={`text-xs ${TEXT_LIGHT}`}>({m.tipo})</span></span>
                </label>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className={`flex-1 rounded-2xl py-3 font-semibold text-slate-700 ${BG} ${SHADOW_OUT} hover:shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff]`}>Volver</button>
              <button
                onClick={() => crearVerificacion()}
                disabled={!form.campanaId || form.materialesIds.length === 0 || loading}
                className={`flex-1 rounded-2xl py-3 font-semibold text-white transition ${!form.campanaId || form.materialesIds.length === 0 || loading ? 'bg-slate-300 cursor-not-allowed opacity-50' : `${ACCENT} ${SHADOW_OUT} hover:bg-[#5572ee]`}`}
              >
                {loading ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : 'Crear verificación'}
              </button>
            </div>
          </div>
        )}

        {step === 4 && verificacionId && (
          <div className={`space-y-4 rounded-3xl ${BG} p-6 ${SHADOW_OUT}`}>
            <h2 className="flex items-center gap-2 font-semibold text-slate-700"><Search className="h-5 w-5" /> Ejecutar búsqueda</h2>
            <p className={`text-sm ${TEXT_LIGHT}`}>La verificación está lista. Ejecute el análisis de audio para detectar los materiales en los registros de aire seleccionados.</p>
            <button
              onClick={() => ejecutarVerificacion()}
              disabled={loading}
              className={`w-full rounded-2xl py-3 font-semibold text-white transition ${loading ? 'bg-slate-300 cursor-not-allowed opacity-50' : `${ACCENT} ${SHADOW_OUT} hover:bg-[#5572ee]`}`}
            >
              {loading ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : 'Ejecutar Shazam Militar'}
            </button>
          </div>
        )}

        {step === 5 && resultado && (
          <div className="space-y-4">
            <div className={`rounded-3xl ${BG} p-6 ${SHADOW_OUT}`}>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
                <h2 className="font-semibold text-slate-700">Verificación completada</h2>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className={`rounded-2xl ${BG} p-4 text-center ${SHADOW_OUT_SM}`}>
                  <p className="text-2xl font-bold text-emerald-600">{resultado.materialesEncontrados}</p>
                  <p className={`text-xs ${TEXT_LIGHT}`}>Encontrados</p>
                </div>
                <div className={`rounded-2xl ${BG} p-4 text-center ${SHADOW_OUT_SM}`}>
                  <p className="text-2xl font-bold text-rose-600">{resultado.materialesNoEncontrados}</p>
                  <p className={`text-xs ${TEXT_LIGHT}`}>No encontrados</p>
                </div>
                <div className={`rounded-2xl ${BG} p-4 text-center ${SHADOW_OUT_SM}`}>
                  <p className="text-2xl font-bold text-slate-700">{resultado.accuracyPromedio}%</p>
                  <p className={`text-xs ${TEXT_LIGHT}`}>Precisión</p>
                </div>
              </div>
            </div>

            {resultado.resultadosDetalle?.filter((r: any) => r.encontrado).map((res: any) => (
              <div key={res.materialId} className={`rounded-3xl ${BG} p-6 ${SHADOW_OUT}`}>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-700">{res.materialNombre}</h3>
                    <p className={`text-xs ${TEXT_LIGHT}`}>Hora detectada: {res.horaDetectada} · Confianza: {res.confidence}%</p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">Encontrado</span>
                </div>

                <WaveformEditor
                  duracionTotalSegundos={res.duracionSegundos || 30}
                  onTrimChange={(inicio, fin) => {
                    setTrims(prev => ({ ...prev, [res.materialId]: { inicio, fin } }));
                  }}
                />

                <button
                  onClick={async () => {
                    setAprobandoClipId(res.materialId);
                    try {
                      const trim = trims[res.materialId] || { inicio: 0, fin: res.duracionSegundos || 30 };
                      const clipRes = await fetch('/api/registro-emision/clips', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          verificacionId,
                          urlArchivo: res.clipUrl || `/uploads/clips/${res.materialId}.mp3`,
                          duracionSegundos: trim.fin - trim.inicio,
                          formato: 'mp3',
                          horaInicioClip: `${String(Math.floor(trim.inicio / 60)).padStart(2, '0')}:${String(trim.inicio % 60).padStart(2, '0')}:00`,
                          horaFinClip: `${String(Math.floor(trim.fin / 60)).padStart(2, '0')}:${String(trim.fin % 60).padStart(2, '0')}:00`,
                          hashSha256: 'stub_hash_' + Math.random().toString(36).slice(2),
                          fechaExpiracion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                        }),
                      });
                      const clipJson = await clipRes.json();
                      if (clipJson.success) {
                        await fetch(`/api/registro-emision/clips/${clipJson.data.id}/aprobar`, { method: 'POST' });
                        alert(`Clip aprobado y certificado generado para ${res.materialNombre}`);
                      }
                    } finally {
                      setAprobandoClipId(null);
                    }
                  }}
                  disabled={aprobandoClipId === res.materialId}
                  className={`mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-3 font-semibold text-white transition ${aprobandoClipId === res.materialId ? 'bg-slate-300 cursor-not-allowed opacity-50' : `${ACCENT} ${SHADOW_OUT} hover:bg-[#5572ee]`}`}
                >
                  {aprobandoClipId === res.materialId ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Scissors className="h-4 w-4" /> Aprobar clip y generar certificado
                    </>
                  )}
                </button>
              </div>
            ))}

            {resultado.resultadosDetalle?.filter((r: any) => !r.encontrado).map((res: any) => (
              <div key={res.materialId} className="flex items-center gap-3 rounded-2xl bg-rose-50 p-4 text-sm text-rose-700">
                <Music className="h-4 w-4" />
                <span><strong>{res.materialNombre}</strong> no fue encontrado en los registros de aire.</span>
              </div>
            ))}

            <button
              onClick={() => router.push('/registro-emision')}
              className={`w-full rounded-2xl py-3 font-semibold text-white ${ACCENT} ${SHADOW_OUT} hover:bg-[#5572ee]`}
            >
              Volver al dashboard
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

export default function WizardVerificacionPage() {
  return (
    <Suspense fallback={
      <main className={`flex min-h-screen items-center justify-center ${BG} ${TEXT}`}>
        <Loader2 className="h-10 w-10 animate-spin" />
      </main>
    }>
      <WizardInner />
    </Suspense>
  );
}
