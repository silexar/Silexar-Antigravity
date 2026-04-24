'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, Building2, FileText, Radio, Calendar, Clock, ChevronRight,
  User, Hash, CheckCircle, AlertCircle, Loader2, Music, SlidersHorizontal,
  ArrowRight, X
} from 'lucide-react';

type ModoBusqueda = 'anunciante' | 'campana' | 'spx' | 'radio';

interface Entidad { id: string; nombre: string;[key: string]: any; }
interface SpxItem {
  id: string;
  pautaId: string;
  codigo: string;
  spxCode: string | null;
  nombre: string;
  horaInicio: string;
  horaFin: string | null;
  fecha: string;
  emisoraId: string;
  emisoraNombre: string | null;
  duracionSegundos: number | null;
}

const TABS: { key: ModoBusqueda; label: string; icon: React.ElementType }[] = [
  { key: 'anunciante', label: 'Por Anunciante', icon: Building2 },
  { key: 'campana', label: 'Por Campaña', icon: FileText },
  { key: 'spx', label: 'Por SPX', icon: Hash },
  { key: 'radio', label: 'Por Radio', icon: Radio },
];

// ─── Neumorphic tokens ───
const BG = 'bg-[#dfeaff]';
const TEXT = 'text-[#69738c]';
const TEXT_LIGHT = 'text-[#9aa3b8]';
const SHADOW_OUT = 'shadow-[8px_8px_16px_#bec8de,-8px_-8px_16px_#ffffff]';
const SHADOW_IN = 'shadow-[inset_4px_4px_8px_#bec8de,inset_-4px_-4px_8px_#ffffff]';
const SHADOW_IN_SM = 'shadow-[inset_2px_2px_4px_#bec8de,inset_-2px_-2px_4px_#ffffff]';
const ACCENT = 'bg-[#6888ff]';
const ACCENT_TEXT = 'text-[#6888ff]';
const ACCENT_RING = 'ring-[#6888ff]';

export default function RegistroEmisionDashboard() {
  const router = useRouter();
  const [modo, setModo] = useState<ModoBusqueda>('anunciante');
  const [loading, setLoading] = useState(false);

  // ── Jerarquía de selección ──
  const [anuncianteSel, setAnuncianteSel] = useState<Entidad | null>(null);
  const [contratoSel, setContratoSel] = useState<Entidad | null>(null);
  const [campanaSel, setCampanaSel] = useState<Entidad | null>(null);
  const [fechaSel, setFechaSel] = useState<string>('');
  const [spxSeleccionados, setSpxSeleccionados] = useState<SpxItem[]>([]);
  const [toleranciaMinutos, setToleranciaMinutos] = useState(10);

  // ── Listas de resultados ──
  const [anunciantes, setAnunciantes] = useState<Entidad[]>([]);
  const [contratos, setContratos] = useState<Entidad[]>([]);
  const [campanas, setCampanas] = useState<Entidad[]>([]);
  const [spxList, setSpxList] = useState<SpxItem[]>([]);
  const [emisoras, setEmisoras] = useState<Entidad[]>([]);

  // ── Inputs de búsqueda directa ──
  const [qAnunciante, setQAnunciante] = useState('');
  const [qCampana, setQCampana] = useState('');
  const [qSpx, setQSpx] = useState('');
  const [qEmisora, setQEmisora] = useState('');

  // ── Modal Nueva Búsqueda ──
  const [showNuevaBusquedaModal, setShowNuevaBusquedaModal] = useState(false);

  // ── Historial de búsquedas ──
  interface HistorialBusqueda {
    id: string;
    anunciante: string;
    campana: string;
    spxCode: string;
    fecha: string;
    hora: string;
    resultado: 'encontrado' | 'no_encontrado' | 'pendiente';
  }
  const [historialBusquedas, setHistorialBusquedas] = useState<HistorialBusqueda[]>([]);

  // Cargar historial desde localStorage al iniciar
  useEffect(() => {
    const saved = localStorage.getItem('registro-emision-historial');
    if (saved) {
      try {
        setHistorialBusquedas(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading historial:', e);
      }
    }
  }, []);

  // Guardar historial en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('registro-emision-historial', JSON.stringify(historialBusquedas));
  }, [historialBusquedas]);

  // Función para agregar al historial
  const agregarAlHistorial = (anunciante: string, campana: string, spxCode: string, resultado: HistorialBusqueda['resultado']) => {
    const nuevaEntrada: HistorialBusqueda = {
      id: Date.now().toString(),
      anunciante,
      campana,
      spxCode,
      fecha: new Date().toLocaleDateString('es-CL'),
      hora: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
      resultado
    };
    setHistorialBusquedas(prev => [nuevaEntrada, ...prev].slice(0, 20)); // Máximo 20 registros
  };

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Cargar emisoras una vez
  useEffect(() => {
    fetch('/api/emisoras')
      .then(r => r.json())
      .then(j => setEmisoras(j.data || []))
      .catch(() => setEmisoras([]));
  }, []);

  // ── Autocompletar Anunciante ──
  const buscarAnunciantes = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q.trim()) { setAnunciantes([]); return; }
    debounceRef.current = setTimeout(() => {
      fetch(`/api/anunciantes?search=${encodeURIComponent(q)}&limit=10`)
        .then(r => r.json())
        .then(j => setAnunciantes(j.data || []))
        .catch(() => setAnunciantes([]));
    }, 300);
  }, []);

  useEffect(() => { buscarAnunciantes(qAnunciante); }, [qAnunciante, buscarAnunciantes]);

  // ── Cargar contratos al seleccionar anunciante ──
  useEffect(() => {
    if (!anuncianteSel) { setContratos([]); return; }
    fetch(`/api/contratos?anuncianteId=${anuncianteSel.id}&estado=activo&limit=50`)
      .then(r => r.json())
      .then(j => setContratos(j.data?.contratos || []))
      .catch(() => setContratos([]));
  }, [anuncianteSel]);

  // ── Cargar campañas al seleccionar contrato ──
  useEffect(() => {
    if (!contratoSel) { setCampanas([]); return; }
    fetch(`/api/campanas?contratoId=${contratoSel.id}&estado=en_aire&limit=50`)
      .then(r => r.json())
      .then(j => setCampanas(j.data || []))
      .catch(() => setCampanas([]));
  }, [contratoSel]);

  // ── Cargar SPX al seleccionar campaña + fecha ──
  useEffect(() => {
    if (!campanaSel || !fechaSel) { setSpxList([]); return; }
    setLoading(true);
    fetch(`/api/registro-emision/buscar/spx?campanaId=${campanaSel.id}&fecha=${fechaSel}`)
      .then(r => r.json())
      .then(j => setSpxList(j.data || []))
      .catch(() => setSpxList([]))
      .finally(() => setLoading(false));
  }, [campanaSel, fechaSel]);

  // ── Búsqueda por campaña directa ──
  const buscarCampanaDirecta = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q.trim()) { setCampanas([]); return; }
    debounceRef.current = setTimeout(() => {
      fetch(`/api/campanas?search=${encodeURIComponent(q)}&limit=10`)
        .then(r => r.json())
        .then(j => {
          const list = j.data || [];
          setCampanas(list);
        })
        .catch(() => setCampanas([]));
    }, 300);
  }, []);

  useEffect(() => { if (modo === 'campana') buscarCampanaDirecta(qCampana); }, [qCampana, modo, buscarCampanaDirecta]);

  // ── Búsqueda por SPX directa ──
  const buscarSpxDirecta = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q.trim()) { setSpxList([]); return; }
    debounceRef.current = setTimeout(() => {
      fetch(`/api/registro-emision/buscar/spx?codigo=${encodeURIComponent(q)}`)
        .then(r => r.json())
        .then(j => {
          const list = j.data || [];
          setSpxList(list);
          if (list.length === 1) {
            const s = list[0];
            setCampanaSel({ id: s.campanaId || '', nombre: s.campanaNombre || '' });
            setFechaSel(s.fecha);
            setSpxSeleccionados([s]);
          }
        })
        .catch(() => setSpxList([]));
    }, 300);
  }, []);

  useEffect(() => { if (modo === 'spx') buscarSpxDirecta(qSpx); }, [qSpx, modo, buscarSpxDirecta]);

  // ── Búsqueda por Radio + Fecha ──
  useEffect(() => {
    if (modo !== 'radio' || !qEmisora || !fechaSel) { setSpxList([]); return; }
    setLoading(true);
    fetch(`/api/registro-emision/buscar/spx?emisoraId=${qEmisora}&fecha=${fechaSel}`)
      .then(r => r.json())
      .then(j => setSpxList(j.data || []))
      .catch(() => setSpxList([]))
      .finally(() => setLoading(false));
  }, [modo, qEmisora, fechaSel]);

  const toggleSpx = (spx: SpxItem) => {
    setSpxSeleccionados(prev =>
      prev.find(s => s.pautaId === spx.pautaId)
        ? prev.filter(s => s.pautaId !== spx.pautaId)
        : [...prev, spx]
    );
  };

  const calcularRango = (spx: SpxItem) => {
    const [h, m] = spx.horaInicio.split(':').map(Number);
    const totalMin = h * 60 + m;
    const inicioMin = Math.max(0, totalMin - toleranciaMinutos);
    const finMin = totalMin + toleranciaMinutos;
    const fmt = (t: number) => `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}:00`;
    return { inicio: fmt(inicioMin), fin: fmt(finMin) };
  };

  const iniciarVerificacion = () => {
    if (!campanaSel || spxSeleccionados.length === 0) return;
    const rangos = spxSeleccionados.map(calcularRango);
    const horaInicioGlobal = rangos.reduce((min, r) => r.inicio < min ? r.inicio : min, '23:59:59');
    const horaFinGlobal = rangos.reduce((max, r) => r.fin > max ? r.fin : max, '00:00:00');

    const params = new URLSearchParams({
      campanaId: campanaSel.id,
      fechaBusqueda: fechaSel,
      horaInicio: horaInicioGlobal,
      horaFin: horaFinGlobal,
      emisorasIds: [...new Set(spxSeleccionados.map(s => s.emisoraId))].join(','),
      materialesIds: spxSeleccionados.map(s => s.id).join(','),
      tolerancia: String(toleranciaMinutos),
    });
    router.push(`/registro-emision/wizard?${params.toString()}`);
  };

  const resetTodo = () => {
    console.log('[RegistroEmision] Nueva búsqueda clicked - resetting form');
    setAnuncianteSel(null);
    setContratoSel(null);
    setCampanaSel(null);
    setFechaSel('');
    setSpxSeleccionados([]);
    setSpxList([]);
    setQAnunciante('');
    setQCampana('');
    setQSpx('');
    setQEmisora('');
  };

  // ─── RENDER ───
  return (
    <main className={`min-h-screen ${BG} ${TEXT} p-4 md:p-8`}>
      <div className="mx-auto max-w-6xl space-y-6">

        {/* Header */}
        <div className={`rounded-3xl ${BG} p-6 ${SHADOW_OUT}`}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-wide text-slate-700">Registro de Emisión</h1>
              <p className="mt-1 text-sm text-[#9aa3b8]">Verificación inteligente de spots y menciones</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/registro-emision/nueva-busqueda')}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${ACCENT} text-white ${SHADOW_OUT} hover:bg-[#5572ee]`}
              >
                Nueva Búsqueda
              </button>
              <button
                onClick={resetTodo}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${BG} ${SHADOW_OUT} hover:shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff]`}
              >
                Borrar Registros
              </button>
            </div>
          </div>
        </div>

        {/* Tabs de modo */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {TABS.map(t => {
            const Icon = t.icon;
            const active = modo === t.key;
            return (
              <button
                key={t.key}
                onClick={() => { setModo(t.key); resetTodo(); }}
                className={`flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold transition-all ${active
                  ? `${ACCENT} text-white ${SHADOW_OUT}`
                  : `${BG} ${SHADOW_OUT} hover:shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff]`
                  }`}
              >
                <Icon className="h-4 w-4" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Panel de búsqueda según modo */}
        <div className={`rounded-3xl ${BG} p-6 ${SHADOW_OUT}`}>
          {modo === 'anunciante' && (
            <div className="space-y-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-700">
                <Building2 className="h-5 w-5" /> Buscar por Anunciante
              </h2>
              <div className={`relative rounded-xl ${SHADOW_IN}`}>
                <Search className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9aa3b8]`} />
                <input
                  value={qAnunciante}
                  onChange={e => { setQAnunciante(e.target.value); setAnuncianteSel(null); }}
                  placeholder="Escriba el nombre del anunciante..."
                  className={`w-full rounded-xl bg-transparent py-3 pl-10 pr-4 text-sm outline-none placeholder:text-[#9aa3b8]`}
                />
              </div>
              {!anuncianteSel && anunciantes.length > 0 && (
                <div className="grid gap-2 sm:grid-cols-2">
                  {anunciantes.map(a => (
                    <button
                      key={a.id}
                      onClick={() => { setAnuncianteSel(a); setQAnunciante(a.nombreRazonSocial || a.nombre); }}
                      className={`flex items-center gap-3 rounded-xl ${BG} p-3 text-left ${SHADOW_OUT} hover:ring-2 ${ACCENT_RING}`}
                    >
                      <User className="h-4 w-4 text-[#6888ff]" />
                      <div>
                        <p className="text-sm font-medium">{a.nombreRazonSocial || a.nombre}</p>
                        <p className="text-xs text-[#9aa3b8]">{a.rut || a.codigo}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {modo === 'campana' && (
            <div className="space-y-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-700">
                <FileText className="h-5 w-5" /> Buscar por Campaña
              </h2>
              <div className={`relative rounded-xl ${SHADOW_IN}`}>
                <Search className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9aa3b8]`} />
                <input
                  value={qCampana}
                  onChange={e => { setQCampana(e.target.value); setCampanaSel(null); }}
                  placeholder="Número o nombre de campaña..."
                  className={`w-full rounded-xl bg-transparent py-3 pl-10 pr-4 text-sm outline-none placeholder:text-[#9aa3b8]`}
                />
              </div>
            </div>
          )}

          {modo === 'spx' && (
            <div className="space-y-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-700">
                <Hash className="h-5 w-5" /> Buscar por Código SPX
              </h2>
              <div className={`relative rounded-xl ${SHADOW_IN}`}>
                <Search className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9aa3b8]`} />
                <input
                  value={qSpx}
                  onChange={e => { setQSpx(e.target.value); setSpxSeleccionados([]); }}
                  placeholder="Ej: SPX-0001"
                  className={`w-full rounded-xl bg-transparent py-3 pl-10 pr-4 text-sm outline-none placeholder:text-[#9aa3b8]`}
                />
              </div>
            </div>
          )}

          {modo === 'radio' && (
            <div className="space-y-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-700">
                <Radio className="h-5 w-5" /> Buscar por Radio y Fecha
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <select
                  value={qEmisora}
                  onChange={e => setQEmisora(e.target.value)}
                  className={`rounded-xl ${BG} p-3 text-sm ${SHADOW_IN} outline-none`}
                >
                  <option value="">Seleccione emisora</option>
                  {emisoras.map(e => (
                    <option key={e.id} value={e.id}>{e.nombre}</option>
                  ))}
                </select>
                <input
                  type="date"
                  value={fechaSel}
                  onChange={e => setFechaSel(e.target.value)}
                  className={`rounded-xl ${BG} p-3 text-sm ${SHADOW_IN} outline-none`}
                />
              </div>
            </div>
          )}
        </div>

        {/* Resultados jerárquicos */}
        <div className="grid gap-4 lg:grid-cols-2">

          {/* Columna izquierda: selección jerárquica */}
          <div className="space-y-4">

            {/* Contratos */}
            {anuncianteSel && !contratoSel && (
              <div className={`rounded-3xl ${BG} p-5 ${SHADOW_OUT}`}>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <FileText className="h-4 w-4" /> Contratos vigentes de {anuncianteSel.nombreRazonSocial || anuncianteSel.nombre}
                </h3>
                <div className="space-y-2">
                  {contratos.length === 0 && <p className="text-xs text-[#9aa3b8]">No hay contratos activos.</p>}
                  {contratos.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setContratoSel(c)}
                      className={`w-full rounded-xl ${BG} p-3 text-left ${SHADOW_OUT} hover:ring-2 ${ACCENT_RING}`}
                    >
                      <p className="text-sm font-medium">{c.numeroContrato || c.titulo}</p>
                      <p className="text-xs text-[#9aa3b8]">{c.clienteNombre} · {c.estado}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Campañas */}
            {contratoSel && !campanaSel && (
              <div className={`rounded-3xl ${BG} p-5 ${SHADOW_OUT}`}>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <FileText className="h-4 w-4" /> Campañas vigentes del contrato
                </h3>
                <div className="space-y-2">
                  {campanas.length === 0 && <p className="text-xs text-[#9aa3b8]">No hay campañas activas.</p>}
                  {campanas.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setCampanaSel(c)}
                      className={`w-full rounded-xl ${BG} p-3 text-left ${SHADOW_OUT} hover:ring-2 ${ACCENT_RING}`}
                    >
                      <p className="text-sm font-medium">{c.codigo} — {c.nombre}</p>
                      <p className="text-xs text-[#9aa3b8]">{c.anuncianteNombre} · {c.estado}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Selector de fecha para campaña seleccionada */}
            {campanaSel && !fechaSel && (
              <div className={`rounded-3xl ${BG} p-5 ${SHADOW_OUT}`}>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Calendar className="h-4 w-4" /> Seleccione fecha de búsqueda
                </h3>
                <input
                  type="date"
                  value={fechaSel}
                  onChange={e => setFechaSel(e.target.value)}
                  className={`w-full rounded-xl ${BG} p-3 text-sm ${SHADOW_IN} outline-none`}
                />
              </div>
            )}

            {/* Lista SPX */}
            {fechaSel && spxList.length > 0 && (
              <div className={`rounded-3xl ${BG} p-5 ${SHADOW_OUT}`}>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Music className="h-4 w-4" /> SPX codes disponibles ({spxList.length})
                </h3>
                <div className="space-y-2 max-h-80 overflow-auto">
                  {spxList.map(spx => {
                    const sel = spxSeleccionados.find(s => s.pautaId === spx.pautaId);
                    return (
                      <button
                        key={spx.pautaId}
                        onClick={() => toggleSpx(spx)}
                        className={`w-full rounded-xl p-3 text-left transition-all ${sel
                          ? `${ACCENT} text-white ${SHADOW_OUT}`
                          : `${BG} ${SHADOW_OUT} hover:shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff]`
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className={`text-sm font-medium ${sel ? 'text-white' : ''}`}>
                              {spx.spxCode || spx.codigo} — {spx.nombre}
                            </p>
                            <p className={`text-xs ${sel ? 'text-white/80' : TEXT_LIGHT}`}>
                              {spx.emisoraNombre} · {spx.horaInicio} · {spx.duracionSegundos}s
                            </p>
                          </div>
                          {sel && <CheckCircle className="h-5 w-5" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {fechaSel && !loading && spxList.length === 0 && (
              <div className={`rounded-3xl ${BG} p-5 ${SHADOW_OUT} flex items-center gap-3 text-amber-600`}>
                <AlertCircle className="h-5 w-5" />
                <p className="text-sm">No se encontraron SPX codes para la fecha seleccionada.</p>
              </div>
            )}

            {loading && (
              <div className={`rounded-3xl ${BG} p-8 ${SHADOW_OUT} flex justify-center`}>
                <Loader2 className="h-8 w-8 animate-spin text-[#6888ff]" />
              </div>
            )}
          </div>

          {/* Columna derecha: resumen y acción */}
          <div className="space-y-4">
            <div className={`rounded-3xl ${BG} p-6 ${SHADOW_OUT} sticky top-4`}>
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-700">
                <SlidersHorizontal className="h-5 w-5" /> Resumen de búsqueda
              </h3>

              <div className="space-y-3">
                <ResumenRow label="Anunciante" value={anuncianteSel?.nombreRazonSocial || anuncianteSel?.nombre || '—'} />
                <ResumenRow label="Contrato" value={contratoSel?.numeroContrato || contratoSel?.titulo || '—'} />
                <ResumenRow label="Campaña" value={campanaSel ? `${campanaSel.codigo} — ${campanaSel.nombre}` : '—'} />
                <ResumenRow label="Fecha" value={fechaSel || '—'} />
                <ResumenRow label="SPX seleccionados" value={spxSeleccionados.length ? `${spxSeleccionados.length} item(s)` : '—'} />

                {spxSeleccionados.length > 0 && (
                  <div className={`rounded-xl p-3 ${SHADOW_IN}`}>
                    <p className="mb-2 text-xs font-semibold text-[#9aa3b8]">RANGOS DE BÚSQUEDA (±{toleranciaMinutos} min)</p>
                    <div className="space-y-1">
                      {spxSeleccionados.map(spx => {
                        const r = calcularRango(spx);
                        return (
                          <div key={spx.pautaId} className="flex justify-between text-xs">
                            <span>{spx.spxCode || spx.codigo}</span>
                            <span className="font-mono">{r.inicio} → {r.fin}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Tolerancia */}
                <div className={`rounded-xl p-3 ${SHADOW_IN}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#9aa3b8]">TOLERANCIA DE BÚSQUEDA</span>
                    <span className="text-sm font-bold text-[#6888ff]">{toleranciaMinutos} min</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={30}
                    value={toleranciaMinutos}
                    onChange={e => setToleranciaMinutos(Number(e.target.value))}
                    className="mt-2 w-full accent-[#6888ff]"
                  />
                </div>
              </div>

              <button
                onClick={iniciarVerificacion}
                disabled={!campanaSel || spxSeleccionados.length === 0}
                className={`mt-6 flex w-full items-center justify-center gap-2 rounded-2xl py-3 font-bold text-white transition-all ${spxSeleccionados.length > 0 && campanaSel
                  ? `${ACCENT} ${SHADOW_OUT} hover:bg-[#5572ee]`
                  : 'bg-slate-300 cursor-not-allowed'
                  }`}
              >
                <ArrowRight className="h-5 w-5" />
                Iniciar Verificación
              </button>

              <p className="mt-3 text-center text-xs text-[#9aa3b8]">
                El sistema buscará en los registros de aire dentro de los rangos calculados.
              </p>
            </div>
          </div>
        </div>

        {/* ── HISTORIAL DE BÚSQUEDAS ── */}
        {historialBusquedas.length > 0 && (
          <div className={`rounded-3xl ${BG} p-6 ${SHADOW_OUT}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                <Clock className="h-5 w-5 text-[#6888ff]" />
                Historial de Búsquedas
              </h2>
              <button
                onClick={() => setHistorialBusquedas([])}
                className="text-xs text-slate-400 hover:text-red-500 transition-colors"
              >
                Limpiar historial
              </button>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {historialBusquedas.map(item => (
                <div key={item.id} className={`rounded-xl p-4 bg-[#dfeaff] shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff] flex items-center justify-between`}>
                  <div className="flex items-center gap-4">
                    {item.resultado === 'encontrado' && (
                      <div className="p-2 rounded-lg bg-emerald-100">
                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                      </div>
                    )}
                    {item.resultado === 'no_encontrado' && (
                      <div className="p-2 rounded-lg bg-red-100">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                      </div>
                    )}
                    {item.resultado === 'pendiente' && (
                      <div className="p-2 rounded-lg bg-amber-100">
                        <Clock className="h-5 w-5 text-amber-600" />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-slate-700">{item.anunciante}</p>
                      <p className="text-xs text-slate-500">{item.campana} • SPX: {item.spxCode}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-slate-500">{item.fecha}</p>
                    <p className="text-xs text-slate-400">{item.hora}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── MODAL NUEVA BÚSQUEDA ── */}
      {showNuevaBusquedaModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowNuevaBusquedaModal(false)} />
          <div className={`relative ${BG} rounded-3xl p-6 w-full max-w-lg ${SHADOW_OUT}`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-700">Nueva Búsqueda Rápida</h2>
              <button
                onClick={() => setShowNuevaBusquedaModal(false)}
                className="p-2 rounded-full hover:bg-white/50 transition-colors"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Anunciante</label>
                <div className={`relative rounded-xl shadow-[inset_4px_4px_8px_#bec8de,inset_-4px_-4px_8px_#ffffff]`}>
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9aa3b8]" />
                  <input
                    type="text"
                    placeholder="Nombre del anunciante..."
                    className={`w-full rounded-xl bg-transparent py-3 pl-10 pr-4 text-sm outline-none placeholder:text-[#9aa3b8]`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Código SPX</label>
                <div className={`relative rounded-xl shadow-[inset_4px_4px_8px_#bec8de,inset_-4px_-4px_8px_#ffffff]`}>
                  <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9aa3b8]" />
                  <input
                    type="text"
                    placeholder="Ej: SPX-12345"
                    className={`w-full rounded-xl bg-transparent py-3 pl-10 pr-4 text-sm outline-none placeholder:text-[#9aa3b8]`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Fecha de búsqueda</label>
                <div className={`relative rounded-xl shadow-[inset_4px_4px_8px_#bec8de,inset_-4px_-4px_8px_#ffffff]`}>
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9aa3b8]" />
                  <input
                    type="date"
                    className={`w-full rounded-xl bg-transparent py-3 pl-10 pr-4 text-sm outline-none`}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowNuevaBusquedaModal(false)}
                className={`flex-1 rounded-xl py-3 font-semibold text-slate-600 ${BG} shadow-[8px_8px_16px_#bec8de,-8px_-8px_16px_#ffffff] hover:shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff]`}
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  agregarAlHistorial('Anunciante Demo', 'Campaña Demo', 'SPX-123', 'pendiente');
                  setShowNuevaBusquedaModal(false);
                }}
                className={`flex-1 rounded-xl py-3 font-semibold text-white ${ACCENT} shadow-[8px_8px_16px_#bec8de,-8px_-8px_16px_#ffffff] hover:bg-[#5572ee]`}
              >
                Buscar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function ResumenRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-[#bec8de]/30 pb-2">
      <span className="text-xs font-semibold text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-700">{value}</span>
    </div>
  );
}
