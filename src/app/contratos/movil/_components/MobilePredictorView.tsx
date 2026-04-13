/**
 * 🤖 MOBILE: IA Predictiva de Renovación
 * 
 * Cards de predicción con probabilidad, tendencia,
 * acciones sugeridas, y alertas inteligentes.
 * 
 * @tier TIER_0_ENTERPRISE
 * @platform MOBILE
 */

'use client';

import { useState } from 'react';
import {
  Brain, TrendingUp, TrendingDown, AlertTriangle,
  Phone, RefreshCw, Sparkles,
  ChevronDown, Target, DollarSign,
  CheckCircle2,
} from 'lucide-react';

interface Pred {
  id: string;
  cliente: string;
  contrato: string;
  valor: number;
  dias: number;
  prob: number;
  tend: 'up' | 'stable' | 'down';
  riesgo: 'bajo' | 'medio' | 'alto';
  factores: string[];
  accion: string;
}

const DATA: Pred[] = [
  { id: 'p1', cliente: 'Banco Chile', contrato: 'SP-2024-0142', valor: 85e6, dias: 15, prob: 92, tend: 'up', riesgo: 'bajo', factores: ['3 renovaciones', 'Satisfacción alta'], accion: 'Llamar para confirmar' },
  { id: 'p2', cliente: 'LATAM', contrato: 'SP-2024-0088', valor: 200e6, dias: 7, prob: 65, tend: 'down', riesgo: 'alto', factores: ['Sin respuesta 5 días', 'Competencia activa'], accion: 'Reunión urgente' },
  { id: 'p3', cliente: 'Falabella', contrato: 'SP-2024-0189', valor: 120e6, dias: 31, prob: 78, tend: 'stable', riesgo: 'medio', factores: ['Evaluando propuestas', 'Buen historial'], accion: 'Ofrecer 3% extra' },
  { id: 'p4', cliente: 'Cencosud', contrato: 'SP-2024-0201', valor: 45e6, dias: 20, prob: 88, tend: 'up', riesgo: 'bajo', factores: ['Cliente 4 años', 'Ya pidió propuesta'], accion: 'Enviar propuesta Q2' },
];

export function MobilePredictorView() {
  const [expanded, setExpanded] = useState<string | null>(null);

  const total = DATA.reduce((s, p) => s + p.valor, 0);
  const avgProb = Math.round(DATA.reduce((s, p) => s + p.prob, 0) / DATA.length);
  const riesgoAlto = DATA.filter(p => p.riesgo === 'alto').length;

  return (
    <div className="space-y-4">
      {/* HEADER */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-slate-800">Predictor IA</h3>
          <p className="text-xs text-slate-500">{DATA.length} contratos por vencer</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-emerald-500 rounded-xl p-3 text-white text-center">
          <Target className="w-4 h-4 mx-auto text-emerald-200" />
          <p className="text-lg font-black mt-0.5">{avgProb}%</p>
          <p className="text-[9px] text-emerald-200">Promedio</p>
        </div>
        <div className="bg-indigo-500 rounded-xl p-3 text-white text-center">
          <DollarSign className="w-4 h-4 mx-auto text-indigo-200" />
          <p className="text-lg font-black mt-0.5">${(total / 1e6).toFixed(0)}M</p>
          <p className="text-[9px] text-indigo-200">En juego</p>
        </div>
        <div className="bg-red-500 rounded-xl p-3 text-white text-center">
          <AlertTriangle className="w-4 h-4 mx-auto text-red-200" />
          <p className="text-lg font-black mt-0.5">{riesgoAlto}</p>
          <p className="text-[9px] text-red-200">Riesgo alto</p>
        </div>
      </div>

      {/* CARDS */}
      <div className="space-y-2">
        {DATA.map(p => {
          const isExp = expanded === p.id;
          return (
            <div key={p.id} className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm">
              <button onClick={() => setExpanded(isExp ? null : p.id)}
                className="w-full px-3 py-3 flex items-center gap-3 text-left">
                {/* PROB */}
                <div className="relative w-10 h-10 shrink-0">
                  <svg className="w-10 h-10 -rotate-90" viewBox="0 0 40 40">
                    <circle cx="20" cy="20" r="16" stroke="#e2e8f0" strokeWidth="3" fill="none" />
                    <circle cx="20" cy="20" r="16" strokeWidth="3" fill="none" strokeLinecap="round"
                      stroke={p.prob >= 80 ? '#10b981' : p.prob >= 60 ? '#f59e0b' : '#ef4444'}
                      strokeDasharray={`${p.prob * 1.005} 100.5`} />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black">{p.prob}%</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-slate-800 truncate">{p.cliente}</p>
                    <span className={`px-1.5 py-0.5 text-[8px] font-bold rounded-full ${
                      p.riesgo === 'bajo' ? 'bg-emerald-100 text-emerald-600' :
                      p.riesgo === 'medio' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'
                    }`}>{p.riesgo}</span>
                  </div>
                  <p className="text-[10px] text-slate-400">${(p.valor / 1e6).toFixed(0)}M · {p.dias}d</p>
                </div>

                {p.tend === 'up' && <TrendingUp className="w-4 h-4 text-emerald-500" />}
                {p.tend === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
                {p.tend === 'stable' && <span className="text-xs text-slate-400">→</span>}
                <ChevronDown className={`w-3 h-3 text-slate-300 transition ${isExp ? 'rotate-180' : ''}`} />
              </button>

              {isExp && (
                <div className="px-3 pb-3 space-y-2 border-t border-slate-50 pt-2">
                  {p.factores.map((f) => (
                    <div key={f} className="flex items-center gap-1.5 text-[10px] text-slate-600">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" /> {f}
                    </div>
                  ))}
                  <div className="p-2 rounded-lg bg-violet-50 border border-violet-100">
                    <p className="text-[10px] text-violet-700 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> <strong>IA:</strong> {p.accion}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-[10px] font-bold active:scale-95 flex items-center justify-center gap-1">
                      <Phone className="w-3 h-3" /> Contactar
                    </button>
                    <button className="flex-1 py-2 bg-emerald-600 text-white rounded-lg text-[10px] font-bold active:scale-95 flex items-center justify-center gap-1">
                      <RefreshCw className="w-3 h-3" /> Renovar
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
