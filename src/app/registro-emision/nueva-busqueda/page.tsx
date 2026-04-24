'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
    Search, Building2, FileText, Radio, Calendar, ChevronRight, ChevronLeft,
    User, Hash, CheckCircle, AlertCircle, Loader2, Music, X, Play, Pause,
    Save, Mail, Link, ExternalLink, ArrowLeft, ArrowRight
} from 'lucide-react';
import type { FlujoState, PasoFlujo, Anunciante, Contrato, Campana, Emisora, SPXItem, RegistroResultado, HistorialEntry } from './_types';
import { useBusquedaFlow } from './_hooks/useBusquedaFlow';

// ─── Tokens de diseño ───
const N = { base: '#dfeaff', dark: '#bec8de', light: '#ffffff', accent: '#6888ff', text: '#69738c', sub: '#9aa3b8' };
const neu = `8px 8px 16px ${N.dark},-8px -8px 16px ${N.light}`;
const neuSm = `4px 4px 8px ${N.dark},-4px -4px 8px ${N.light}`;
const inset = `inset 4px 4px 8px ${N.dark},inset -4px -4px 8px ${N.light}`;

const NeuromorphicCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`rounded-2xl p-6 ${className}`} style={{ background: N.base, boxShadow: neu }}>
        {children}
    </div>
);

// ─── Stepper Component ───
const PASOS: { key: PasoFlujo; label: string; icon: React.ElementType }[] = [
    { key: 'anunciante', label: 'Anunciante', icon: Building2 },
    { key: 'contrato', label: 'Contrato', icon: FileText },
    { key: 'campana', label: 'Campaña', icon: FileText },
    { key: 'radio', label: 'Radio', icon: Radio },
    { key: 'fecha', label: 'Fecha', icon: Calendar },
    { key: 'spx', label: 'SPX', icon: Hash },
    { key: 'resultado', label: 'Resultados', icon: Music },
    { key: 'exportar', label: 'Exportar', icon: ExternalLink },
];

function Stepper({ pasoActual }: { pasoActual: PasoFlujo }) {
    const idxActual = PASOS.findIndex(p => p.key === pasoActual);

    return (
        <div className="flex items-center justify-center gap-1 overflow-x-auto py-2">
            {PASOS.map((paso, idx) => {
                const Icon = paso.icon;
                const isCompleted = idx < idxActual;
                const isCurrent = idx === idxActual;

                return (
                    <div key={paso.key} className="flex items-center">
                        {idx > 0 && (
                            <div className="w-4 h-px mx-1" style={{ background: isCompleted ? N.accent : `${N.dark}50` }} />
                        )}
                        <button
                            disabled
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all`}
                            style={
                                isCurrent
                                    ? { background: N.accent, color: '#fff', boxShadow: neuSm }
                                    : isCompleted
                                        ? { background: `${N.accent}20`, color: N.accent }
                                        : { background: N.base, color: N.sub, boxShadow: inset }
                            }
                        >
                            {isCompleted ? (
                                <CheckCircle className="w-3 h-3" />
                            ) : (
                                <Icon className="w-3 h-3" />
                            )}
                            <span className="hidden sm:inline">{paso.label}</span>
                        </button>
                    </div>
                );
            })}
        </div>
    );
}

// ─── Step 1: Autocomplete Anunciante ───
function StepAnunciante({
    onSelect,
}: {
    onSelect: (a: Anunciante) => void;
}) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Anunciante[]>([]);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState<Anunciante | null>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    const buscar = useCallback((q: string) => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (!q.trim()) { setResults([]); return; }
        setLoading(true);
        debounceRef.current = setTimeout(() => {
            fetch(`/api/registro-emision/autocomplete/anunciantes?search=${encodeURIComponent(q)}&limit=10`)
                .then(r => r.json())
                .then(j => { setResults(j.data || []); setLoading(false); })
                .catch(() => setLoading(false));
        }, 300);
    }, []);

    const handleSelect = (anunciante: Anunciante) => {
        setSelected(anunciante);
        onSelect(anunciante);
    };

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-bold" style={{ color: N.text }}>Seleccionar Anunciante</h2>
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={e => { setQuery(e.target.value); buscar(e.target.value); }}
                    placeholder="Buscar anunciante..."
                    className="w-full px-4 py-3 rounded-xl text-sm"
                    style={{ background: N.base, color: N.text, boxShadow: inset, border: 'none', outline: 'none' }}
                />
                {loading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 className="h-4 w-4 animate-spin" style={{ color: N.accent }} />
                    </div>
                )}
            </div>
            {results.length > 0 && (
                <div className="rounded-xl overflow-hidden" style={{ boxShadow: neu }}>
                    {results.map(a => (
                        <button
                            key={a.id}
                            onClick={() => handleSelect(a)}
                            className="w-full px-4 py-3 text-left flex items-center gap-3 transition-all hover:scale-[1.01]"
                            style={{ background: N.base, borderBottom: `1px solid ${N.dark}30` }}
                        >
                            <Building2 className="w-4 h-4" style={{ color: N.accent }} />
                            <div>
                                <p className="font-medium text-sm" style={{ color: N.text }}>{a.nombre}</p>
                                <p className="text-xs" style={{ color: N.sub }}>ID: {a.id}</p>
                            </div>
                        </button>
                    ))}
                </div>
            )}
            {selected && (
                <div className="mt-4 p-4 rounded-xl flex items-center gap-3" style={{ background: `${N.accent}15` }}>
                    <CheckCircle className="w-5 h-5" style={{ color: N.accent }} />
                    <span className="text-sm font-medium" style={{ color: N.accent }}>Seleccionado: {selected.nombre}</span>
                </div>
            )}
        </div>
    );
}

// ─── Step 2: Selector Contrato ───
function StepContrato({
    anuncianteId,
    onSelect,
}: {
    anuncianteId: string;
    onSelect: (c: Contrato) => void;
}) {
    const [contratos, setContratos] = useState<Contrato[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/registro-emision/autocomplete/contratos?anuncianteId=${anuncianteId}&year=${new Date().getFullYear()}`)
            .then(r => r.json())
            .then(j => { setContratos(j.data || []); setLoading(false); })
            .catch(() => setLoading(false));
    }, [anuncianteId]);

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-bold" style={{ color: N.text }}>Seleccionar Contrato</h2>
            {loading ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" style={{ color: N.accent }} />
                </div>
            ) : contratos.length === 0 ? (
                <p className="text-center py-8 text-sm" style={{ color: N.sub }}>No hay contratos disponibles</p>
            ) : (
                <div className="rounded-xl overflow-hidden" style={{ boxShadow: neu }}>
                    {contratos.map(c => (
                        <button
                            key={c.id}
                            onClick={() => onSelect(c)}
                            className="w-full px-4 py-3 text-left flex items-center gap-3 transition-all hover:scale-[1.01]"
                            style={{ background: N.base, borderBottom: `1px solid ${N.dark}30` }}
                        >
                            <FileText className="w-4 h-4" style={{ color: N.accent }} />
                            <div>
                                <p className="font-medium text-sm" style={{ color: N.text }}>{c.titulo}</p>
                                <p className="text-xs" style={{ color: N.sub }}>{c.numero} - {c.estado}</p>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Step 3: Selector Campaña ───
function StepCampana({
    contratoId,
    onSelect,
}: {
    contratoId: string;
    onSelect: (c: Campana) => void;
}) {
    const [campanas, setCampanas] = useState<Campana[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/registro-emision/autocomplete/campanas?contratoId=${contratoId}`)
            .then(r => r.json())
            .then(j => { setCampanas(j.data || []); setLoading(false); })
            .catch(() => setLoading(false));
    }, [contratoId]);

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-bold" style={{ color: N.text }}>Seleccionar Campaña</h2>
            {loading ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" style={{ color: N.accent }} />
                </div>
            ) : campanas.length === 0 ? (
                <p className="text-center py-8 text-sm" style={{ color: N.sub }}>No hay campañas disponibles</p>
            ) : (
                <div className="rounded-xl overflow-hidden" style={{ boxShadow: neu }}>
                    {campanas.map(c => (
                        <button
                            key={c.id}
                            onClick={() => onSelect(c)}
                            className="w-full px-4 py-3 text-left flex items-center gap-3 transition-all hover:scale-[1.01]"
                            style={{ background: N.base, borderBottom: `1px solid ${N.dark}30` }}
                        >
                            <FileText className="w-4 h-4" style={{ color: N.accent }} />
                            <div>
                                <p className="font-medium text-sm" style={{ color: N.text }}>{c.nombre}</p>
                                <p className="text-xs" style={{ color: N.sub }}>{c.codigo}</p>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Step 4: Filtro Radio (opcional) ───
function StepRadio({
    campanaId,
    onSelect,
    onSkip,
}: {
    campanaId: string;
    onSelect: (emisoras: Emisora[]) => void;
    onSkip: () => void;
}) {
    const [emisoras, setEmisoras] = useState<Emisora[]>([]);
    const [seleccionadas, setSeleccionadas] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/registro-emision/autocomplete/emisoras?campanaId=${campanaId}`)
            .then(r => r.json())
            .then(j => { setEmisoras(j.data || []); setLoading(false); })
            .catch(() => setLoading(false));
    }, [campanaId]);

    const toggle = (id: string) => {
        setSeleccionadas(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleNext = () => {
        const selected = emisoras.filter(e => seleccionadas.has(e.id));
        onSelect(selected.length > 0 ? selected : []);
    };

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-bold" style={{ color: N.text }}>Filtrar por Emisora (Opcional)</h2>
            {loading ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" style={{ color: N.accent }} />
                </div>
            ) : emisoras.length === 0 ? (
                <p className="text-center py-8 text-sm" style={{ color: N.sub }}>No hay emisoras disponibles</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {emisoras.map(e => (
                        <button
                            key={e.id}
                            onClick={() => toggle(e.id)}
                            className="px-4 py-3 rounded-xl text-left flex items-center gap-3 transition-all"
                            style={{
                                background: seleccionadas.has(e.id) ? `${N.accent}20` : N.base,
                                boxShadow: seleccionadas.has(e.id) ? `inset 2px 2px 4px ${N.dark},inset -2px -2px 4px ${N.light}` : neu,
                                border: seleccionadas.has(e.id) ? `2px solid ${N.accent}` : '2px solid transparent',
                            }}
                        >
                            <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: seleccionadas.has(e.id) ? N.accent : N.dark }}>
                                {seleccionadas.has(e.id) && <CheckCircle className="w-3 h-3 text-white" />}
                            </div>
                            <div>
                                <p className="font-medium text-sm" style={{ color: N.text }}>{e.nombre}</p>
                                <p className="text-xs" style={{ color: N.sub }}>{e.frecuencia}</p>
                            </div>
                        </button>
                    ))}
                </div>
            )}
            <div className="flex gap-3 pt-4">
                <button
                    onClick={onSkip}
                    className="flex-1 px-4 py-3 rounded-xl font-medium text-sm transition-all hover:scale-[1.02]"
                    style={{ background: N.base, color: N.sub, boxShadow: neu }}
                >
                    Saltar (Todas)
                </button>
                <button
                    onClick={handleNext}
                    className="flex-1 px-4 py-3 rounded-xl font-medium text-sm text-white transition-all hover:scale-[1.02]"
                    style={{ background: N.accent, boxShadow: neuSm }}
                >
                    Continuar {seleccionadas.size > 0 ? `(${seleccionadas.size} seleccionadas)` : ''}
                </button>
            </div>
        </div>
    );
}

// ─── Step 5: Selector Fecha ───
function StepFecha({
    onNext,
}: {
    onNext: (fecha: string) => void;
}) {
    const [selectedDate, setSelectedDate] = useState('');
    const today = new Date().toISOString().split('T')[0];
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    const dateObj = selectedDate ? new Date(selectedDate + 'T00:00:00') : new Date();
    const dayName = days[dateObj.getDay()];
    const dayNum = dateObj.getDate();
    const monthName = months[dateObj.getMonth()];
    const year = dateObj.getFullYear();

    const navigateDay = (delta: number) => {
        const d = new Date(dateObj);
        d.setDate(d.getDate() + delta);
        setSelectedDate(d.toISOString().split('T')[0]);
    };

    const handleSubmit = () => {
        if (selectedDate) onNext(selectedDate);
    };

    return (
        <div className="space-y-6">
            <h2 className="text-lg font-bold text-center" style={{ color: N.text }}>Seleccionar Fecha</h2>
            <div className="flex items-center justify-center gap-4">
                <button onClick={() => navigateDay(-1)} className="p-2 rounded-xl" style={{ background: N.base, boxShadow: neuSm }}>
                    <ChevronLeft className="w-5 h-5" style={{ color: N.text }} />
                </button>
                <div className="text-center">
                    <p className="text-3xl font-bold" style={{ color: N.accent }}>{dayNum}</p>
                    <p className="text-lg font-semibold" style={{ color: N.text }}>{dayName}</p>
                    <p className="text-sm" style={{ color: N.sub }}>{monthName} {year}</p>
                </div>
                <button onClick={() => navigateDay(1)} className="p-2 rounded-xl" style={{ background: N.base, boxShadow: neuSm }}>
                    <ChevronRight className="w-5 h-5" style={{ color: N.text }} />
                </button>
            </div>
            <input
                type="date"
                value={selectedDate || today}
                onChange={e => setSelectedDate(e.target.value)}
                max={today}
                className="w-full px-4 py-3 rounded-xl text-center"
                style={{ background: N.base, color: N.text, boxShadow: inset, border: 'none' }}
            />
            <div className="flex gap-3 pt-2">
                <button
                    onClick={() => setSelectedDate(today)}
                    className="flex-1 px-4 py-3 rounded-xl font-medium text-sm"
                    style={{ background: `${N.accent}20`, color: N.accent }}
                >
                    Hoy
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={!selectedDate}
                    className="flex-1 px-4 py-3 rounded-xl font-medium text-sm text-white disabled:opacity-50"
                    style={{ background: N.accent, boxShadow: neuSm }}
                >
                    Confirmar
                </button>
            </div>
        </div>
    );
}

// ─── Step 6: Multi-select SPX ───
function StepSPX({
    spxList,
    seleccionados,
    loading,
    onToggle,
    onEjecutar,
}: {
    spxList: SPXItem[];
    seleccionados: Set<string>;
    loading: boolean;
    onToggle: (id: string) => void;
    onEjecutar: () => void;
}) {

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-bold" style={{ color: N.text }}>Seleccionar SPX</h2>
            {loading ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" style={{ color: N.accent }} />
                </div>
            ) : spxList.length === 0 ? (
                <p className="text-center py-8 text-sm" style={{ color: N.sub }}>No hay SPX disponibles para esta fecha</p>
            ) : (
                <div className="rounded-xl overflow-hidden" style={{ boxShadow: neu }}>
                    {spxList.map(spx => (
                        <button
                            key={spx.id}
                            onClick={() => onToggle(spx.id)}
                            className="w-full px-4 py-3 text-left flex items-center gap-3 transition-all"
                            style={{
                                background: seleccionados.has(spx.id) ? `${N.accent}15` : N.base,
                                borderBottom: `1px solid ${N.dark}30`,
                            }}
                        >
                            <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: seleccionados.has(spx.id) ? N.accent : N.dark }}>
                                {seleccionados.has(spx.id) && <CheckCircle className="w-3 h-3 text-white" />}
                            </div>
                            <div className="flex-1">
                                <p className="font-mono font-medium text-sm" style={{ color: N.text }}>{spx.codigo}</p>
                                <p className="text-xs" style={{ color: N.sub }}>{spx.hora} - {spx.duracion}s</p>
                            </div>
                            <span className="text-xs px-2 py-1 rounded-full" style={{ background: `${N.accent}20`, color: N.accent }}>
                                {spx.tipo}
                            </span>
                        </button>
                    ))}
                </div>
            )}
            <button
                onClick={onEjecutar}
                disabled={seleccionados.size === 0}
                className="w-full px-4 py-3 rounded-xl font-semibold text-white text-sm disabled:opacity-50 transition-all hover:scale-[1.01]"
                style={{ background: N.accent, boxShadow: neuSm }}
            >
                {loading ? 'Buscando...' : `Ejecutar Búsqueda (${seleccionados.size} SPX)`}
            </button>
        </div>
    );
}

// ─── Step 7: Mostrar Resultados ───
function StepResultados({
    resultados,
    spxSeleccionados,
    onExportar,
}: {
    resultados: RegistroResultado[];
    spxSeleccionados: SPXItem[];
    onExportar: () => void;
}) {
    const encontrados = resultados.filter(r => r.encontrado);
    const noEncontrados = resultados.filter(r => !r.encontrado);

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-lg font-bold" style={{ color: N.text }}>Resultados de la Búsqueda</h2>
                <p className="text-sm mt-1" style={{ color: N.sub }}>
                    {encontrados.length} de {resultados.length} SPX encontrados (±10 min)
                </p>
            </div>
            <div className="space-y-3">
                {encontrados.map(r => (
                    <div key={r.id} className="p-4 rounded-xl" style={{ background: N.base, boxShadow: neu }}>
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="font-mono font-bold" style={{ color: N.accent }}>{r.codigo}</p>
                                <p className="text-sm mt-1" style={{ color: N.text }}>{r.nombre}</p>
                                <p className="text-xs mt-1" style={{ color: N.sub }}>{r.fecha} {r.hora} - Duración: {r.duracion}s</p>
                            </div>
                            <div className="text-right">
                                <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full" style={{ background: '#10b98120', color: '#10b981' }}>
                                    <CheckCircle className="w-3 h-3" /> Encontrado
                                </span>
                            </div>
                        </div>
                        <div className="mt-3 h-12 rounded-lg flex items-center justify-center" style={{ background: `${N.dark}30` }}>
                            <Music className="w-5 h-5 mr-2" style={{ color: N.sub }} />
                            <span className="text-xs" style={{ color: N.sub }}>Waveform Visualizer</span>
                        </div>
                    </div>
                ))}
                {noEncontrados.map(r => (
                    <div key={r.id} className="p-4 rounded-xl opacity-60" style={{ background: N.base, boxShadow: inset }}>
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="font-mono font-bold" style={{ color: N.sub }}>{r.codigo}</p>
                                <p className="text-sm mt-1" style={{ color: N.text }}>{r.nombre}</p>
                                <p className="text-xs mt-1" style={{ color: N.sub }}>{r.fecha} {r.hora}</p>
                            </div>
                            <span className="text-xs px-2 py-1 rounded-full" style={{ background: '#ef444420', color: '#ef4444' }}>
                                No encontrado
                            </span>
                        </div>
                    </div>
                ))}
            </div>
            {encontrados.length > 0 && (
                <button
                    onClick={onExportar}
                    className="w-full px-4 py-3 rounded-xl font-semibold text-white text-sm transition-all hover:scale-[1.01]"
                    style={{ background: N.accent, boxShadow: neuSm }}
                >
                    Continuar a Exportación
                </button>
            )}
        </div>
    );
}

// ─── Step 8: Exportación ───
function StepExportar({
    onGuardarCesta,
    onGenerarLink,
    onCerrar,
}: {
    onGuardarCesta: () => void;
    onGenerarLink: () => void;
    onCerrar: () => void;
}) {
    return (
        <div className="space-y-6">
            <h2 className="text-lg font-bold text-center" style={{ color: N.text }}>Exportar Resultados</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                    onClick={onGuardarCesta}
                    className="p-6 rounded-xl flex flex-col items-center gap-3 transition-all hover:scale-[1.02]"
                    style={{ background: N.base, boxShadow: neu }}
                >
                    <div className="p-3 rounded-full" style={{ background: `${N.accent}20` }}>
                        <Save className="w-6 h-6" style={{ color: N.accent }} />
                    </div>
                    <span className="font-medium text-sm" style={{ color: N.text }}>Guardar en Cesta</span>
                    <span className="text-xs text-center" style={{ color: N.sub }}>Añadir a la cesta de evidencia</span>
                </button>
                <button
                    onClick={onGenerarLink}
                    className="p-6 rounded-xl flex flex-col items-center gap-3 transition-all hover:scale-[1.02]"
                    style={{ background: N.base, boxShadow: neu }}
                >
                    <div className="p-3 rounded-full" style={{ background: `${N.accent}20` }}>
                        <Link className="w-6 h-6" style={{ color: N.accent }} />
                    </div>
                    <span className="font-medium text-sm" style={{ color: N.text }}>Generar Link</span>
                    <span className="text-xs text-center" style={{ color: N.sub }}>Crear enlace público seguro</span>
                </button>
            </div>
            <button
                onClick={onCerrar}
                className="w-full px-4 py-3 rounded-xl font-medium text-sm"
                style={{ background: N.base, color: N.sub, boxShadow: neu }}
            >
                Cerrar y Volver al Dashboard
            </button>
        </div>
    );
}

// ─── Main Page Component ───
export default function NuevaBusquedaPage() {
    const router = useRouter();
    const {
        state,
        avanzar,
        retroceder,
        seleccionarAnunciante,
        seleccionarContrato,
        seleccionarCampana,
        seleccionarEmisoras,
        seleccionarSPX,
        saltarRadio,
        seleccionarFecha,
        ejecutarBusqueda,
        irAExportar,
        resetFlow,
    } = useBusquedaFlow();

    // SPX selection state (managed in page, not hook)
    const [spxList, setSpxList] = useState<SPXItem[]>([]);
    const [spxSeleccionados, setSpxSeleccionados] = useState<Set<string>>(new Set());
    const [spxLoading, setSpxLoading] = useState(false);

    // Fetch SPX data when reaching spx step
    useEffect(() => {
        if (state.paso === 'spx' && state.campana && state.fecha) {
            setSpxLoading(true);
            const params = new URLSearchParams({
                campanaId: state.campana.id,
                fecha: state.fecha,
            });
            if (state.emisorasSeleccionadas.length > 0) {
                params.set('emisoras', state.emisorasSeleccionadas.map(e => e.id).join(','));
            }
            fetch(`/api/registro-emision/buscar/spx?${params.toString()}`)
                .then(r => r.json())
                .then(j => { setSpxList(j.data || []); setSpxLoading(false); })
                .catch(() => setSpxLoading(false));
        }
    }, [state.paso, state.campana, state.fecha, state.emisorasSeleccionadas]);

    const toggleSPX = (id: string) => {
        setSpxSeleccionados(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleEjecutarSPX = () => {
        if (spxSeleccionados.size > 0) {
            const selected = spxList.filter(s => spxSeleccionados.has(s.id));
            seleccionarSPX(selected);
            ejecutarBusqueda();
        }
    };

    const canGoBack = state.paso !== 'anunciante';

    const isPopup = typeof window !== 'undefined' && window.opener !== null;

    const handleCerrar = () => {
        if (isPopup) {
            window.close();
        } else {
            router.push('/registro-emision');
        }
    };

    const handleOpenPopup = () => {
        window.open('/registro-emision/nueva-busqueda', '_blank', 'width=1200,height=800');
    };

    const handleGuardarCesta = () => {
        const basketItems = JSON.parse(localStorage.getItem('evidence-basket') || '[]');
        state.resultados.filter(r => r.encontrado).forEach(r => {
            basketItems.push({
                id: r.id,
                tipo: r.tipo,
                nombre: r.nombre,
                codigo: r.codigo,
                fecha: r.fecha,
                hora: r.hora,
                duracion: r.duracion,
                url: r.archivoUrl,
                addDate: new Date().toISOString(),
            });
        });
        localStorage.setItem('evidence-basket', JSON.stringify(basketItems));
        alert('Guardado en la cesta de evidencia');
    };

    const handleGenerarLink = async () => {
        if (!state.resultados.length) return;
        try {
            const resp = await fetch('/api/registro-emision/secure-link', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    materialIds: state.resultados.filter(r => r.encontrado).map(r => r.id),
                }),
            });
            const json = await resp.json();
            if (json.data) {
                const link = json.data;
                const url = `${window.location.origin}/registro-emision/escuchar/${link.codigo}`;
                await navigator.clipboard.writeText(url);
                alert(`Link copiado: ${url}`);
            }
        } catch {
            alert('Error al generar link');
        }
    };

    return (
        <div className="min-h-screen flex flex-col" style={{ background: N.base }}>
            {/* Header */}
            <div className="border-b" style={{ borderColor: `${N.dark}30`, background: N.base }}>
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => canGoBack ? retroceder() : router.push('/registro-emision')}
                            className="p-2 rounded-xl transition-all hover:scale-105"
                            style={{ background: N.base, boxShadow: neuSm }}
                        >
                            <ArrowLeft className="w-5 h-5" style={{ color: N.text }} />
                        </button>
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-xl" style={{ background: N.base, boxShadow: neuSm }}>
                                <Search className="w-5 h-5" style={{ color: N.accent }} />
                            </div>
                            <h1 className="text-base sm:text-lg font-bold" style={{ color: N.text }}>Nueva Búsqueda</h1>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2">
                            {!isPopup && (
                                <button
                                    onClick={handleOpenPopup}
                                    className="p-2 rounded-xl transition-all hover:scale-105"
                                    style={{ background: N.base, boxShadow: neuSm }}
                                    title="Abrir en ventana"
                                >
                                    <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: N.accent }} />
                                </button>
                            )}
                            <button
                                onClick={handleCerrar}
                                className="p-2 rounded-xl transition-all hover:scale-105"
                                style={{ background: N.base, boxShadow: neuSm }}
                                title={isPopup ? "Cerrar ventana" : "Cerrar"}
                            >
                                <X className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: N.sub }} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stepper */}
            <div className="px-4 sm:px-6 py-3" style={{ background: N.base }}>
                <div className="max-w-5xl mx-auto rounded-xl p-3 sm:p-4" style={{ boxShadow: neu }}>
                    <Stepper pasoActual={state.paso} />
                </div>
            </div>

            {/* Error message */}
            {state.error && (
                <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-4">
                    <div className="rounded-xl p-4 flex items-center gap-3" style={{ background: '#fef3c7', borderColor: '#f59e0b' }}>
                        <AlertCircle className="h-5 w-5" style={{ color: '#f59e0b' }} />
                        <p className="text-sm" style={{ color: '#92400e' }}>{state.error}</p>
                    </div>
                </div>
            )}

            {/* Content */}
            <div className="flex-1 px-4 sm:px-6 pb-8">
                <div className="max-w-5xl mx-auto">
                    <NeuromorphicCard className="p-4 sm:p-6 md:p-8">
                        {state.loading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="h-10 w-10 animate-spin" style={{ color: N.accent }} />
                            </div>
                        ) : (
                            <>
                                {state.paso === 'anunciante' && (
                                    <StepAnunciante
                                        onSelect={seleccionarAnunciante}
                                    />
                                )}

                                {state.paso === 'contrato' && state.anunciante && (
                                    <StepContrato
                                        anuncianteId={state.anunciante.id}
                                        onSelect={(c) => { seleccionarContrato(c); }}
                                    />
                                )}

                                {state.paso === 'campana' && state.contrato && (
                                    <StepCampana
                                        contratoId={state.contrato.id}
                                        onSelect={(c) => { seleccionarCampana(c); }}
                                    />
                                )}

                                {state.paso === 'radio' && state.campana && (
                                    <StepRadio
                                        campanaId={state.campana.id}
                                        onSelect={seleccionarEmisoras}
                                        onSkip={saltarRadio}
                                    />
                                )}

                                {state.paso === 'fecha' && state.campana && (
                                    <StepFecha
                                        onNext={seleccionarFecha}
                                    />
                                )}

                                {state.paso === 'spx' && state.campana && state.fecha && (
                                    <StepSPX
                                        spxList={spxList}
                                        seleccionados={spxSeleccionados}
                                        loading={spxLoading}
                                        onToggle={toggleSPX}
                                        onEjecutar={handleEjecutarSPX}
                                    />
                                )}

                                {state.paso === 'resultado' && (
                                    <StepResultados
                                        resultados={state.resultados}
                                        spxSeleccionados={state.spxSeleccionados}
                                        onExportar={irAExportar}
                                    />
                                )}

                                {state.paso === 'exportar' && (
                                    <StepExportar
                                        onGuardarCesta={handleGuardarCesta}
                                        onGenerarLink={handleGenerarLink}
                                        onCerrar={handleCerrar}
                                    />
                                )}
                            </>
                        )}
                    </NeuromorphicCard>
                </div>
            </div>
        </div>
    );
}