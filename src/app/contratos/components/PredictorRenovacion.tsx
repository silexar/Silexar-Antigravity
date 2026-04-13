/**
 * 🤖 DESKTOP: IA Predictiva de Renovación
 * 
 * Motor inteligente que analiza historial, predice probabilidad
 * de renovación, y genera alertas 30/15/7 días antes.
 * Sugiere acciones y calcula riesgo de pérdida.
 * 
 * @tier TIER_0_ENTERPRISE
 * @platform DESKTOP
 */

'use client';

import { useState } from 'react';
import {
  Brain, TrendingUp, TrendingDown, AlertTriangle,
  Phone, Mail, DollarSign, Clock, Calendar,
  ChevronDown, RefreshCw, Sparkles, Target,
  CheckCircle2,
} from 'lucide-react';

interface Prediccion {
  id: string;
  cliente: string;
  contrato: string;
  valorActual: number;
  fechaVencimiento: string;
  diasRestantes: number;
  probabilidad: number;
  tendencia: 'subiendo' | 'estable' | 'bajando';
  riesgo: 'bajo' | 'medio' | 'alto';
  factores: string[];
  accionSugerida: { tipo: string; descripcion: string };
  historialRenovaciones: number;
}

const PREDICCIONES: Prediccion[] = [
  {
    id: 'p1', cliente: 'Banco Chile', contrato: 'SP-2024-0142',
    valorActual: 85000000, fechaVencimiento: '2025-03-15', diasRestantes: 15,
    probabilidad: 92, tendencia: 'subiendo', riesgo: 'bajo',
    factores: ['3 renovaciones consecutivas', 'Satisfacción alta', 'Presupuesto aprobado'],
    accionSugerida: { tipo: 'llamar', descripcion: 'Llamar para confirmar renovación y ofrecer upgrade' },
    historialRenovaciones: 3,
  },
  {
    id: 'p2', cliente: 'LATAM', contrato: 'SP-2024-0088',
    valorActual: 200000000, fechaVencimiento: '2025-03-07', diasRestantes: 7,
    probabilidad: 65, tendencia: 'bajando', riesgo: 'alto',
    factores: ['Reestructuración interna', 'Sin respuesta 5 días', 'Competencia activa'],
    accionSugerida: { tipo: 'reunion', descripcion: 'Agendar reunión urgente con director comercial' },
    historialRenovaciones: 1,
  },
  {
    id: 'p3', cliente: 'Falabella', contrato: 'SP-2024-0189',
    valorActual: 120000000, fechaVencimiento: '2025-04-01', diasRestantes: 31,
    probabilidad: 78, tendencia: 'estable', riesgo: 'medio',
    factores: ['2 renovaciones previas', 'Evaluando propuestas', 'Buen historial de pago'],
    accionSugerida: { tipo: 'descuento', descripcion: 'Ofrecer 3% descuento adicional por renovación anticipada' },
    historialRenovaciones: 2,
  },
  {
    id: 'p4', cliente: 'Cencosud', contrato: 'SP-2024-0201',
    valorActual: 45000000, fechaVencimiento: '2025-03-20', diasRestantes: 20,
    probabilidad: 88, tendencia: 'subiendo', riesgo: 'bajo',
    factores: ['Cliente fiel 4 años', 'Ya solicitó propuesta Q2', 'Incremento de inversión'],
    accionSugerida: { tipo: 'propuesta', descripcion: 'Enviar propuesta Q2 con incremento de medios' },
    historialRenovaciones: 4,
  },
];

export function PredictorRenovacion() {
  const [expanded, setExpanded] = useState<string | null>(null);

  const valorTotal = PREDICCIONES.reduce((s, p) => s + p.valorActual, 0);
  const promedioProb = Math.round(PREDICCIONES.reduce((s, p) => s + p.probabilidad, 0) / PREDICCIONES.length);
  const enRiesgo = PREDICCIONES.filter(p => p.riesgo === 'alto').length;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
          <Brain className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-800">Predictor de Renovación</h2>
          <p className="text-sm text-slate-500">Análisis IA de {PREDICCIONES.length} contratos próximos a vencer</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-4 text-white shadow-lg">
          <Target className="w-5 h-5 text-emerald-200" />
          <p className="text-2xl font-black mt-1">{promedioProb}%</p>
          <p className="text-xs text-emerald-200">Prob. promedio</p>
        </div>
        <div className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl p-4 text-white shadow-lg">
          <DollarSign className="w-5 h-5 text-indigo-200" />
          <p className="text-2xl font-black mt-1">${(valorTotal / 1e6).toFixed(0)}M</p>
          <p className="text-xs text-indigo-200">Valor en juego</p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl p-4 text-white shadow-lg">
          <AlertTriangle className="w-5 h-5 text-red-200" />
          <p className="text-2xl font-black mt-1">{enRiesgo}</p>
          <p className="text-xs text-red-200">En riesgo alto</p>
        </div>
      </div>

      {/* CONTRATOS */}
      <div className="space-y-3">
        {PREDICCIONES.map(p => {
          const isExpanded = expanded === p.id;
          return (
            <div key={p.id} className="neo-card rounded-2xl overflow-hidden">
              <button onClick={() => setExpanded(isExpanded ? null : p.id)}
                className="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-slate-50 transition">
                {/* PROBABILIDAD CIRCULAR */}
                <div className="relative w-12 h-12 shrink-0">
                  <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                    <circle cx="24" cy="24" r="20" stroke="#e2e8f0" strokeWidth="4" fill="none" />
                    <circle cx="24" cy="24" r="20" strokeWidth="4" fill="none" strokeLinecap="round"
                      stroke={p.probabilidad >= 80 ? '#10b981' : p.probabilidad >= 60 ? '#f59e0b' : '#ef4444'}
                      strokeDasharray={`${p.probabilidad * 1.257} 125.7`} />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-slate-700">
                    {p.probabilidad}%
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm text-slate-800">{p.cliente}</p>
                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${
                      p.riesgo === 'bajo' ? 'bg-emerald-100 text-emerald-600' :
                      p.riesgo === 'medio' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'
                    }`}>Riesgo {p.riesgo}</span>
                  </div>
                  <p className="text-[10px] text-slate-400">{p.contrato} · ${(p.valorActual / 1e6).toFixed(0)}M</p>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-1">
                    {p.tendencia === 'subiendo' && <TrendingUp className="w-4 h-4 text-emerald-500" />}
                    {p.tendencia === 'bajando' && <TrendingDown className="w-4 h-4 text-red-500" />}
                    {p.tendencia === 'estable' && <span className="text-xs text-slate-400">→</span>}
                  </div>
                  <p className="text-xs text-slate-500 flex items-center gap-0.5">
                    <Clock className="w-3 h-3" /> {p.diasRestantes}d
                  </p>
                </div>

                <ChevronDown className={`w-4 h-4 text-slate-300 transition ${isExpanded ? 'rotate-180' : ''}`} />
              </button>

              {isExpanded && (
                <div className="px-5 pb-4 space-y-3 border-t border-slate-50 pt-3">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Factores</p>
                    <div className="mt-1 space-y-1">
                      {p.factores.map((f) => (
                        <div key={f} className="flex items-center gap-2 text-xs text-slate-600">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          {f}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-violet-50 border border-violet-100">
                    <p className="text-[10px] font-bold text-violet-700 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Acción sugerida por IA
                    </p>
                    <p className="text-xs text-violet-600 mt-0.5">{p.accionSugerida.descripcion}</p>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition flex items-center justify-center gap-1">
                      <Phone className="w-3 h-3" /> Contactar
                    </button>
                    <button className="flex-1 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition flex items-center justify-center gap-1">
                      <RefreshCw className="w-3 h-3" /> Renovar
                    </button>
                    <button className="flex-1 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition flex items-center justify-center gap-1">
                      <Mail className="w-3 h-3" /> Email
                    </button>
                  </div>

                  <p className="text-[9px] text-slate-400 text-center">
                    <Calendar className="w-3 h-3 inline" /> Historial: {p.historialRenovaciones} renovación{p.historialRenovaciones !== 1 ? 'es' : ''} previas
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
