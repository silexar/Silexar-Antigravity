/**
 * 📊 MOBILE: Vista Analytics
 * 
 * Dashboard predictivo compacto con KPIs, meta del mes, insights IA,
 * y recomendaciones priorizadas. Adaptación de analytics/page.tsx.
 * 
 * @tier TIER_0_ENTERPRISE
 * @platform MOBILE
 */

'use client';

import { useState } from 'react';
import {
  TrendingUp, TrendingDown, Target, Brain,
  DollarSign, FileText, AlertTriangle, CheckCircle2,
  Zap, Phone, Mail, ChevronRight
} from 'lucide-react';
import { useContratosDashboard, formatCurrency } from '../../_shared/useContratos';
import type { PrediccionIA, RecomendacionIA } from '../../_shared/types';

// ═══════════════════════════════════════════════════════════════
// MOCK ANALYTICS DATA
// ═══════════════════════════════════════════════════════════════

const MOCK_PREDICCIONES: PrediccionIA[] = [
  { id: 'i1', cliente: 'TechCorp', prediccion: 'Alta probabilidad de cierre esta semana', probabilidad: 92, tipo: 'positivo' },
  { id: 'i2', cliente: 'Banco Chile', prediccion: 'Posible solicitud de extensión de plazo', probabilidad: 78, tipo: 'neutro' },
  { id: 'i3', cliente: 'AutoMax', prediccion: 'Solicitará descuento adicional', probabilidad: 85, tipo: 'advertencia' },
  { id: 'i4', cliente: 'Falabella', prediccion: 'Renovación anticipada detectada', probabilidad: 88, tipo: 'positivo' },
];

const MOCK_RECOMENDACIONES: RecomendacionIA[] = [
  { id: 'r1', accion: 'Contactar HOY para acelerar firma', cliente: 'TechCorp', prioridad: 'alta', impactoEstimado: '+$95M', razon: 'Cliente activo, alta probabilidad cierre' },
  { id: 'r2', accion: 'Preparar propuesta de renovación', cliente: 'Banco Chile', prioridad: 'alta', impactoEstimado: '+$85M', razon: 'Contrato vence en 45 días' },
  { id: 'r3', accion: 'Agendar llamada de seguimiento', cliente: 'SuperMax', prioridad: 'media', impactoEstimado: '+$15M', razon: 'Sin actividad hace 7 días' },
  { id: 'r4', accion: 'Enviar material de upselling', cliente: 'Cencosud', prioridad: 'baja', impactoEstimado: '+$20M', razon: 'Oportunidad de cross-sell detectada' },
];

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export function MobileAnalyticsView() {
  const { dashboard } = useContratosDashboard();
  const [activeSection, setActiveSection] = useState<'insights' | 'recomendaciones'>('insights');

  const kpis = dashboard?.kpis;
  const metaPct = kpis ? Math.round((kpis.metaCompletada / kpis.metaMes) * 100) : 0;

  return (
    <div className="space-y-5">
      {/* META DEL MES */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-5 text-white shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-indigo-200 uppercase tracking-widest flex items-center gap-2">
            <Target className="w-4 h-4" /> Meta del Mes
          </h3>
          <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-full">{metaPct}%</span>
        </div>

        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="text-3xl font-black">{formatCurrency(kpis?.metaCompletada || 0)}</p>
            <p className="text-xs text-indigo-200">de {formatCurrency(kpis?.metaMes || 0)}</p>
          </div>
          <div className="flex items-center gap-1 text-emerald-300">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-bold">+12%</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-3 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-300 rounded-full transition-all duration-700"
            style={{ width: `${metaPct}%` }}
          />
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 gap-3">
        <KPICard
          icon={<FileText className="w-5 h-5" />}
          label="Activos"
          value={String(kpis?.contratosActivos || 0)}
          trend={5}
          color="indigo"
        />
        <KPICard
          icon={<DollarSign className="w-5 h-5" />}
          label="Cartera"
          value={formatCurrency(kpis?.valorCartera || 0)}
          trend={8}
          color="emerald"
        />
        <KPICard
          icon={<CheckCircle2 className="w-5 h-5" />}
          label="Pendientes"
          value={String(kpis?.accionesPendientes || 0)}
          trend={-3}
          color="amber"
        />
        <KPICard
          icon={<AlertTriangle className="w-5 h-5" />}
          label="Alertas"
          value={String(kpis?.alertasUrgentes || 0)}
          trend={-1}
          color="red"
        />
      </div>

      {/* SECTION TOGGLE */}
      <div className="flex gap-2 bg-white rounded-2xl p-1.5 shadow-sm border border-slate-100">
        <button
          onClick={() => setActiveSection('insights')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5 ${
            activeSection === 'insights'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
              : 'text-slate-500'
          }`}
        >
          <Brain className="w-4 h-4" /> Insights IA
        </button>
        <button
          onClick={() => setActiveSection('recomendaciones')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5 ${
            activeSection === 'recomendaciones'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
              : 'text-slate-500'
          }`}
        >
          <Zap className="w-4 h-4" /> Recomendaciones
        </button>
      </div>

      {/* INSIGHTS */}
      {activeSection === 'insights' && (
        <div className="space-y-3">
          {MOCK_PREDICCIONES.map(insight => (
            <div
              key={insight.id}
              className={`bg-white rounded-xl border p-4 flex items-start gap-3 ${
                insight.tipo === 'positivo' ? 'border-emerald-100' :
                insight.tipo === 'advertencia' ? 'border-amber-100' : 'border-slate-100'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                insight.tipo === 'positivo' ? 'bg-emerald-100 text-emerald-600' :
                insight.tipo === 'advertencia' ? 'bg-amber-100 text-amber-600' :
                'bg-blue-100 text-blue-600'
              }`}>
                <Brain className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-800 text-sm">{insight.cliente}</p>
                <p className="text-xs text-slate-500 mt-0.5">{insight.prediccion}</p>
              </div>
              <div className={`text-right shrink-0 ${
                insight.probabilidad >= 85 ? 'text-emerald-600' : 'text-amber-600'
              }`}>
                <p className="text-sm font-bold">{insight.probabilidad}%</p>
                <p className="text-[9px] text-slate-400">prob.</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* RECOMENDACIONES */}
      {activeSection === 'recomendaciones' && (
        <div className="space-y-3">
          {MOCK_RECOMENDACIONES.map(rec => (
            <div key={rec.id} className="bg-white rounded-xl border border-slate-100 p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    rec.prioridad === 'alta' ? 'bg-red-500' :
                    rec.prioridad === 'media' ? 'bg-amber-500' : 'bg-slate-300'
                  }`} />
                  <p className="font-bold text-slate-800 text-sm">{rec.cliente}</p>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {rec.impactoEstimado}
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium mb-2">{rec.accion}</p>
              <p className="text-[10px] text-slate-400 italic">{rec.razon}</p>

              {rec.prioridad === 'alta' && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                  <button className="flex-1 py-2 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold flex items-center justify-center gap-1 active:scale-95">
                    <Phone className="w-3.5 h-3.5" /> Llamar
                  </button>
                  <button className="flex-1 py-2 bg-amber-100 text-amber-700 rounded-lg text-xs font-bold flex items-center justify-center gap-1 active:scale-95">
                    <Mail className="w-3.5 h-3.5" /> Email
                  </button>
                  <button className="flex-1 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold flex items-center justify-center gap-1 active:scale-95">
                    <ChevronRight className="w-3.5 h-3.5" /> Abrir
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENT: KPICard
// ═══════════════════════════════════════════════════════════════

function KPICard({ icon, label, value, trend, color }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: number;
  color: 'indigo' | 'emerald' | 'amber' | 'red';
}) {
  const colorClasses = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
  };
  const iconBg = {
    indigo: 'bg-indigo-100',
    emerald: 'bg-emerald-100',
    amber: 'bg-amber-100',
    red: 'bg-red-100',
  };

  return (
    <div className={`rounded-2xl p-4 ${colorClasses[color]}`}>
      <div className={`w-10 h-10 rounded-xl ${iconBg[color]} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="text-xl font-black">{value}</p>
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
