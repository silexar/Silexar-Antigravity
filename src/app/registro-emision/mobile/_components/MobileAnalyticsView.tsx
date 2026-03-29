/**
 * 📊 MOBILE: Vista de Analytics
 * 
 * Dashboard compacto con KPIs, tendencias y métricas clave del módulo de emisión.
 * Versión mobile del ExpertAnalyticsDashboard.
 * 
 * @tier TIER_0_ENTERPRISE
 * @platform MOBILE
 */

'use client';

import { useState } from 'react';
import {
  BarChart3, TrendingUp, TrendingDown,
  Radio, CheckCircle, XCircle, Clock,
  Target, Award, Zap, Shield
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════

const PERIODS = [
  { id: 'hoy', label: 'Hoy' },
  { id: 'semana', label: 'Semana' },
  { id: 'mes', label: 'Mes' },
  { id: 'trimestre', label: 'Trimestre' },
] as const;

const MOCK_ANALYTICS = {
  hoy: {
    totalVerificaciones: 42,
    tasaEmision: 94.5,
    confianzaPromedio: 91.2,
    tiempoPromedio: '38s',
    encontrados: 39,
    noEncontrados: 3,
    certificados: 36,
    alertas: 2,
    trendEmision: 2.4,
    trendConfianza: 1.8,
    trendTiempo: -5.2,
    topClientes: [
      { nombre: 'Coca-Cola Chile', verificaciones: 12, tasa: 100 },
      { nombre: 'Banco Chile', verificaciones: 8, tasa: 87.5 },
      { nombre: 'Falabella', verificaciones: 7, tasa: 100 },
      { nombre: 'Entel', verificaciones: 6, tasa: 83.3 },
      { nombre: 'LATAM Airlines', verificaciones: 5, tasa: 100 },
    ],
    distribucionMetodos: [
      { metodo: 'Fingerprint', count: 24, pct: 57 },
      { metodo: 'Shazam', count: 10, pct: 24 },
      { metodo: 'Manual', count: 5, pct: 12 },
      { metodo: 'Speech-to-Text', count: 3, pct: 7 },
    ],
  },
  semana: {
    totalVerificaciones: 287,
    tasaEmision: 92.3,
    confianzaPromedio: 89.7,
    tiempoPromedio: '41s',
    encontrados: 265,
    noEncontrados: 22,
    certificados: 248,
    alertas: 8,
    trendEmision: 1.1,
    trendConfianza: -0.3,
    trendTiempo: 2.1,
    topClientes: [
      { nombre: 'Coca-Cola Chile', verificaciones: 78, tasa: 96 },
      { nombre: 'Banco Chile', verificaciones: 52, tasa: 90 },
      { nombre: 'Falabella', verificaciones: 44, tasa: 93 },
      { nombre: 'Entel', verificaciones: 38, tasa: 87 },
      { nombre: 'LATAM Airlines', verificaciones: 31, tasa: 94 },
    ],
    distribucionMetodos: [
      { metodo: 'Fingerprint', count: 164, pct: 57 },
      { metodo: 'Shazam', count: 69, pct: 24 },
      { metodo: 'Manual', count: 34, pct: 12 },
      { metodo: 'Speech-to-Text', count: 20, pct: 7 },
    ],
  },
  mes: {
    totalVerificaciones: 1243,
    tasaEmision: 93.8,
    confianzaPromedio: 90.5,
    tiempoPromedio: '39s',
    encontrados: 1166,
    noEncontrados: 77,
    certificados: 1098,
    alertas: 31,
    trendEmision: 3.2,
    trendConfianza: 2.1,
    trendTiempo: -8.4,
    topClientes: [
      { nombre: 'Coca-Cola Chile', verificaciones: 312, tasa: 97 },
      { nombre: 'Banco Chile', verificaciones: 234, tasa: 91 },
      { nombre: 'Falabella', verificaciones: 198, tasa: 95 },
      { nombre: 'Entel', verificaciones: 167, tasa: 89 },
      { nombre: 'LATAM Airlines', verificaciones: 132, tasa: 96 },
    ],
    distribucionMetodos: [
      { metodo: 'Fingerprint', count: 709, pct: 57 },
      { metodo: 'Shazam', count: 298, pct: 24 },
      { metodo: 'Manual', count: 149, pct: 12 },
      { metodo: 'Speech-to-Text', count: 87, pct: 7 },
    ],
  },
  trimestre: {
    totalVerificaciones: 3891,
    tasaEmision: 94.1,
    confianzaPromedio: 91.0,
    tiempoPromedio: '37s',
    encontrados: 3662,
    noEncontrados: 229,
    certificados: 3498,
    alertas: 87,
    trendEmision: 4.8,
    trendConfianza: 3.5,
    trendTiempo: -12.1,
    topClientes: [
      { nombre: 'Coca-Cola Chile', verificaciones: 978, tasa: 98 },
      { nombre: 'Banco Chile', verificaciones: 734, tasa: 92 },
      { nombre: 'Falabella', verificaciones: 621, tasa: 96 },
      { nombre: 'Entel', verificaciones: 512, tasa: 90 },
      { nombre: 'LATAM Airlines', verificaciones: 423, tasa: 97 },
    ],
    distribucionMetodos: [
      { metodo: 'Fingerprint', count: 2218, pct: 57 },
      { metodo: 'Shazam', count: 934, pct: 24 },
      { metodo: 'Manual', count: 467, pct: 12 },
      { metodo: 'Speech-to-Text', count: 272, pct: 7 },
    ],
  },
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export function MobileAnalyticsView() {
  const [period, setPeriod] = useState<'hoy' | 'semana' | 'mes' | 'trimestre'>('hoy');
  const data = MOCK_ANALYTICS[period];

  return (
    <div className="space-y-5">
      {/* PERIOD SELECTOR */}
      <div className="flex gap-2 bg-white rounded-2xl p-1.5 shadow-sm border border-slate-100">
        {PERIODS.map(p => (
          <button
            key={p.id}
            onClick={() => setPeriod(p.id)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
              period === p.id
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                : 'text-slate-500'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* MAIN KPIs */}
      <div className="grid grid-cols-2 gap-3">
        <KPICard
          icon={<Radio className="w-5 h-5" />}
          label="Verificaciones"
          value={data.totalVerificaciones.toLocaleString()}
          trend={data.trendEmision}
          color="indigo"
        />
        <KPICard
          icon={<Target className="w-5 h-5" />}
          label="Tasa Emisión"
          value={`${data.tasaEmision}%`}
          trend={data.trendEmision}
          color="emerald"
        />
        <KPICard
          icon={<Shield className="w-5 h-5" />}
          label="Confianza"
          value={`${data.confianzaPromedio}%`}
          trend={data.trendConfianza}
          color="blue"
        />
        <KPICard
          icon={<Zap className="w-5 h-5" />}
          label="Tiempo Prom."
          value={data.tiempoPromedio}
          trend={data.trendTiempo}
          color="purple"
        />
      </div>

      {/* STATUS BREAKDOWN */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-indigo-500" /> Desglose
        </h3>
        <div className="space-y-3">
          <BreakdownRow icon={<CheckCircle className="w-4 h-4 text-emerald-500" />} label="Encontrados" value={data.encontrados} total={data.totalVerificaciones} color="emerald" />
          <BreakdownRow icon={<XCircle className="w-4 h-4 text-red-500" />} label="No Encontrados" value={data.noEncontrados} total={data.totalVerificaciones} color="red" />
          <BreakdownRow icon={<Award className="w-4 h-4 text-purple-500" />} label="Certificados" value={data.certificados} total={data.totalVerificaciones} color="purple" />
          <BreakdownRow icon={<Clock className="w-4 h-4 text-amber-500" />} label="Alertas" value={data.alertas} total={data.totalVerificaciones} color="amber" />
        </div>
      </div>

      {/* TOP CLIENTS */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">🏆 Top Clientes</h3>
        <div className="space-y-3">
          {data.topClientes.map((cliente, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                  i === 0 ? 'bg-amber-100 text-amber-600' :
                  i === 1 ? 'bg-slate-200 text-slate-600' :
                  i === 2 ? 'bg-orange-100 text-orange-600' :
                  'bg-slate-50 text-slate-400'
                }`}>{i + 1}</span>
                <div>
                  <p className="text-sm font-bold text-slate-700">{cliente.nombre}</p>
                  <p className="text-[10px] text-slate-400">{cliente.verificaciones} verificaciones</p>
                </div>
              </div>
              <span className={`text-sm font-bold ${
                cliente.tasa >= 95 ? 'text-emerald-600' : cliente.tasa >= 85 ? 'text-blue-600' : 'text-amber-600'
              }`}>{cliente.tasa}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* METHODS DISTRIBUTION */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">🔬 Métodos de Verificación</h3>
        <div className="space-y-3">
          {data.distribucionMetodos.map((m, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-600">{m.metodo}</span>
                <span className="text-xs text-slate-400">{m.count} ({m.pct}%)</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    i === 0 ? 'bg-purple-500' : i === 1 ? 'bg-cyan-500' : i === 2 ? 'bg-slate-400' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${m.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════

interface KPICardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: number;
  color: 'indigo' | 'emerald' | 'blue' | 'purple';
}

function KPICard({ icon, label, value, trend, color }: KPICardProps) {
  const colorClasses = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
  };
  const iconBg = {
    indigo: 'bg-indigo-100',
    emerald: 'bg-emerald-100',
    blue: 'bg-blue-100',
    purple: 'bg-purple-100',
  };

  return (
    <div className={`rounded-2xl p-4 ${colorClasses[color]} border border-opacity-20`}>
      <div className={`w-10 h-10 rounded-xl ${iconBg[color]} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="text-2xl font-black">{value}</p>
      <div className="flex items-center justify-between mt-1">
        <span className="text-[10px] font-bold uppercase opacity-70">{label}</span>
        <span className={`text-[10px] font-bold flex items-center gap-0.5 ${trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
          {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(trend)}%
        </span>
      </div>
    </div>
  );
}

interface BreakdownRowProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  total: number;
  color: 'emerald' | 'red' | 'purple' | 'amber';
}

function BreakdownRow({ icon, label, value, total, color }: BreakdownRowProps) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  const barColor = {
    emerald: 'bg-emerald-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
    amber: 'bg-amber-500',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-xs font-bold text-slate-600">{label}</span>
        </div>
        <span className="text-xs font-bold text-slate-800">{value.toLocaleString()} <span className="text-slate-400">({pct}%)</span></span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${barColor[color]}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
