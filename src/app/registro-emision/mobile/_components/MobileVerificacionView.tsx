/**
 * 🔍 MOBILE: Vista de Verificación
 * 
 * Flujo de verificación touch-first: buscar → seleccionar fecha → materiales → procesar → resultados.
 * Replica VerificationWizard + RealTimeProcessor + ResultsView en formato mobile.
 * 
 * @tier TIER_0_ENTERPRISE
 * @platform MOBILE
 */

'use client';

import { useState } from 'react';
import {
  Search, Calendar, ChevronRight,
  Play, Loader2, CheckCircle, XCircle,
  ArrowLeft, Target, Radio,
  FileText, Share2, RotateCcw
} from 'lucide-react';
import type { ResultadoVerificacion } from '../../_shared/types';
import { useVerificacion } from '../../_shared/useRegistroEmision';

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export function MobileVerificacionView() {
  const {
    step, searchQuery, materials, results, progress, processing,
    searchCampana, selectDate, toggleMaterial, startVerification, reset, setStep,
  } = useVerificacion();

  // ─── PASO 0: BÚSQUEDA ─────────────────────────────────────
  if (step === 0 || step === 1) {
    return (
      <div className="space-y-5">
        {/* SEARCH BAR */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-500" /> Buscar Campaña
          </h3>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => searchCampana(e.target.value)}
              placeholder="Nombre de cliente o campaña..."
              aria-label="Buscar campaña"
              className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-bold focus:ring-2 focus:ring-indigo-400 outline-none text-base"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          </div>
        </div>

        {/* MOCK RESULTS */}
        {searchQuery.length >= 2 && (
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Resultados</p>
            {[
              { id: 'c1', name: 'Coca-Cola Navidad 2024', client: 'Coca-Cola Chile' },
              { id: 'c2', name: 'Banco Chile Q4 Premium', client: 'Banco Chile' },
              { id: 'c3', name: 'Falabella Black Friday', client: 'Falabella' },
            ].filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.client.toLowerCase().includes(searchQuery.toLowerCase()) || searchQuery.length >= 2)
            .map(campaign => (
              <button
                key={campaign.id}
                onClick={() => selectDate('2024-12-14')}
                className="w-full bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex items-center justify-between active:scale-[0.98] transition-transform"
              >
                <div className="text-left">
                  <p className="font-bold text-slate-800 text-sm">{campaign.name}</p>
                  <p className="text-xs text-slate-500">{campaign.client}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300" />
              </button>
            ))}
          </div>
        )}

        {/* RECENT QUICK ACCESS */}
        {searchQuery.length < 2 && (
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Recientes</p>
            {[
              { name: 'Campaña Navidad Premium', date: '15 Dic', found: '8/10' },
              { name: 'Black Friday Especial', date: '14 Dic', found: '5/5' },
              { name: 'Banco XYZ Q4', date: '13 Dic', found: '2/4' },
            ].map((item, i) => (
              <button
                key={`${item}-${i}`}
                onClick={() => selectDate('2024-12-14')}
                className="w-full bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex items-center justify-between active:scale-[0.98] transition-transform"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-slate-700 text-sm">{item.name}</p>
                    <p className="text-xs text-slate-400">{item.date} · {item.found}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ─── PASO 2: SELECCIÓN MATERIALES ──────────────────────────
  if (step === 2) {
    const selectedCount = materials.filter(m => m.selected).length;
    return (
      <div className="space-y-5">
        <button onClick={() => setStep(1)} className="flex items-center gap-2 text-sm text-slate-500 font-bold">
          <ArrowLeft className="w-4 h-4" /> Volver
        </button>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500" /> Materiales del Día
            </h3>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
              {selectedCount}/{materials.length}
            </span>
          </div>

          <div className="space-y-2">
            {materials.map(m => (
              <button
                key={m.id}
                onClick={() => toggleMaterial(m.id)}
                className={`w-full p-3.5 rounded-xl border flex items-center gap-3 transition-all active:scale-[0.98] ${
                  m.selected 
                    ? 'border-indigo-200 bg-indigo-50/50' 
                    : 'border-slate-100 bg-white'
                }`}
              >
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                  m.selected ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-300'
                }`}>
                  {m.selected && <CheckCircle className="w-4 h-4" />}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-bold text-slate-700 text-sm">{m.nombre}</p>
                  <p className="text-xs text-slate-400">
                    {m.spxCode} · {m.horaProgramada} · {m.duracion}s
                  </p>
                </div>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                  m.tipo === 'audio_pregrabado' ? 'bg-purple-100 text-purple-600' :
                  m.tipo === 'mencion_vivo' ? 'bg-emerald-100 text-emerald-600' :
                  'bg-blue-100 text-blue-600'
                }`}>{m.tipo.replace('_', ' ')}</span>
              </button>
            ))}
          </div>
        </div>

        {/* LAUNCH BUTTON */}
        <button
          onClick={startVerification}
          disabled={selectedCount === 0}
          className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-indigo-200 active:scale-[0.97] transition-transform disabled:opacity-50"
        >
          <Play className="w-5 h-5" /> Verificar {selectedCount} Materiales
        </button>
      </div>
    );
  }

  // ─── PASO 3: PROCESANDO ────────────────────────────────────
  if (step === 3 && processing) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-8">
        {/* Animated Ring */}
        <div className="relative w-32 h-32">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="#e2e8f0" strokeWidth="8" />
            <circle
              cx="50" cy="50" r="42" fill="none"
              stroke="url(#grad)" strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${progress * 2.64} ${264 - progress * 2.64}`}
              className="transition-all duration-300"
            />
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-slate-800">{progress}%</span>
          </div>
        </div>

        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
            <p className="font-bold text-slate-700">Cortex-Sense Analizando...</p>
          </div>
          <p className="text-sm text-slate-500">
            {progress < 30 ? 'Iniciando fingerprint de audio...' :
             progress < 60 ? 'Comparando patrones en base de datos...' :
             progress < 90 ? 'Verificando coincidencias...' :
             'Generando certificación...'}
          </p>
        </div>

        {/* Hardware Stats */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
          {[
            { label: 'CPU', value: `${65 + Math.floor(progress / 5)}%`, color: 'text-cyan-500' },
            { label: 'RAM', value: '4.2 GB', color: 'text-purple-500' },
            { label: 'I/O', value: `${120 + progress}MB/s`, color: 'text-emerald-500' },
            { label: 'NET', value: '↓ 24Mbps', color: 'text-blue-500' },
          ].map((hw, i) => (
            <div key={`${hw}-${i}`} className="bg-slate-800/90 rounded-xl p-3 text-center">
              <p className={`text-xs font-bold ${hw.color}`}>{hw.label}</p>
              <p className="text-sm font-mono font-bold text-white">{hw.value}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── PASO 4: RESULTADOS ────────────────────────────────────
  if (step === 4) {
    const found = results.filter(r => r.encontrado);
    const notFound = results.filter(r => !r.encontrado);
    const accuracy = found.length > 0
      ? Math.round(found.reduce((s, r) => s + (r.accuracy || 0), 0) / found.length)
      : 0;

    return (
      <div className="space-y-5">
        {/* SUMMARY HEADER */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 text-white shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <Radio className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm">Resultado de Verificación</h3>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-black text-emerald-400">{found.length}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Encontrados</p>
            </div>
            <div>
              <p className="text-2xl font-black text-red-400">{notFound.length}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase">No Encontr.</p>
            </div>
            <div>
              <p className="text-2xl font-black text-blue-400">{accuracy}%</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Precisión</p>
            </div>
          </div>
        </div>

        {/* FOUND ITEMS */}
        {found.length > 0 && (
          <div>
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-3 px-1 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> Encontrados ({found.length})
            </p>
            <div className="space-y-2">
              {found.map(r => (
                <ResultCard key={r.materialId} result={r} variant="found" />
              ))}
            </div>
          </div>
        )}

        {/* NOT FOUND ITEMS */}
        {notFound.length > 0 && (
          <div>
            <p className="text-xs font-bold text-red-600 uppercase tracking-widest mb-3 px-1 flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5" /> No Encontrados ({notFound.length})
            </p>
            <div className="space-y-2">
              {notFound.map(r => (
                <ResultCard key={r.materialId} result={r} variant="missing" />
              ))}
            </div>
          </div>
        )}

        {/* ACTIONS */}
        <div className="grid grid-cols-2 gap-3">
          <button className="py-3 bg-indigo-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform text-sm">
            <FileText className="w-4 h-4" /> Exportar PDF
          </button>
          <button className="py-3 bg-purple-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform text-sm">
            <Share2 className="w-4 h-4" /> Compartir
          </button>
        </div>

        <button
          onClick={reset}
          className="w-full py-3 bg-slate-100 text-slate-600 font-bold rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <RotateCcw className="w-4 h-4" /> Nueva Verificación
        </button>
      </div>
    );
  }

  return null;
}

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENT: ResultCard
// ═══════════════════════════════════════════════════════════════

function ResultCard({ result, variant }: { result: ResultadoVerificacion; variant: 'found' | 'missing' }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <button
      onClick={() => setExpanded(!expanded)}
      className={`w-full text-left rounded-xl border p-4 transition-all active:scale-[0.98] ${
        variant === 'found' ? 'bg-emerald-50/50 border-emerald-100' : 'bg-red-50/50 border-red-100'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            variant === 'found' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
          }`}>
            {variant === 'found' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          </div>
          <div>
            <p className="font-bold text-slate-800 text-sm">{result.nombreMaterial}</p>
            <p className="text-xs text-slate-500">{result.horaEmision || 'Sin hora'} · {result.emisora || 'N/A'}</p>
          </div>
        </div>
        {result.accuracy && (
          <span className={`text-sm font-bold ${
            result.accuracy >= 90 ? 'text-emerald-600' : result.accuracy >= 80 ? 'text-blue-600' : 'text-amber-600'
          }`}>{result.accuracy}%</span>
        )}
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-slate-200/50 space-y-2">
          <DetailRow label="Tipo" value={result.tipoMaterial} />
          {result.horaEmision && <DetailRow label="Hora Emisión" value={result.horaEmision} />}
          {result.horaFin && <DetailRow label="Hora Fin" value={result.horaFin} />}
          {result.emisora && <DetailRow label="Emisora" value={result.emisora} />}
          {result.posibleCausa && <DetailRow label="Causa" value={result.posibleCausa} />}
        </div>
      )}
    </button>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-xs">
      <span className="text-slate-400">{label}</span>
      <span className="font-bold text-slate-600">{value}</span>
    </div>
  );
}
