/**
 * 🎯 MOBILE: Vista Pipeline
 * 
 * Funnel horizontal scrollable con etapas, montos acumulados y contratos
 * por etapa. Adaptación mobile del kanban/page.tsx.
 * 
 * @tier TIER_0_ENTERPRISE
 * @platform MOBILE
 */

'use client';

import { useState } from 'react';
import {
  TrendingUp, DollarSign, FileText, Zap,
  ChevronRight, RefreshCw, BarChart3
} from 'lucide-react';
import { useContratosDashboard, useContratosLista, formatCurrency } from '../../_shared/useContratos';

// ═══════════════════════════════════════════════════════════════
// MOCK PIPELINE DATA (augmented from dashboard)
// ═══════════════════════════════════════════════════════════════

const PIPELINE_CONTRATOS = [
  { id: '1', titulo: 'Navidad 2025', cliente: 'SuperMax', valor: 15000000, etapa: 'Prospección', urgencia: 'normal' as const, dias: 5 },
  { id: '2', titulo: 'Cuentas Premium', cliente: 'Banco Chile', valor: 85000000, etapa: 'Negociación', urgencia: 'alta' as const, dias: 12 },
  { id: '3', titulo: 'Digital Q1', cliente: 'Falabella', valor: 120000000, etapa: 'Aprobación', urgencia: 'alta' as const, dias: 3 },
  { id: '4', titulo: 'Radio Marzo', cliente: 'Cencosud', valor: 45000000, etapa: 'Firma', urgencia: 'media' as const, dias: 1 },
  { id: '5', titulo: 'Salud 2025', cliente: 'FarmaciaXYZ', valor: 25000000, etapa: 'Prospección', urgencia: 'normal' as const, dias: 8 },
  { id: '6', titulo: 'Tech Summit', cliente: 'TechCorp', valor: 95000000, etapa: 'Negociación', urgencia: 'media' as const, dias: 15 },
  { id: '7', titulo: 'Verano 2025', cliente: 'AutoMax', valor: 35000000, etapa: 'Activos', urgencia: 'normal' as const, dias: 45 },
  { id: '8', titulo: 'Anual Digital', cliente: 'Ripley', valor: 75000000, etapa: 'Activos', urgencia: 'normal' as const, dias: 120 },
];

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export function MobilePipelineView() {
  const { dashboard, loading, refresh } = useContratosDashboard();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { contratos: _apiContratos } = useContratosLista();
  const [selectedEtapa, setSelectedEtapa] = useState<string | null>(null);

  const pipeline = dashboard?.pipeline || [];
  const totalValor = pipeline.reduce((s, e) => s + e.valor, 0);
  const totalContratos = pipeline.reduce((s, e) => s + e.cantidad, 0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
        <p className="text-sm font-bold text-slate-400">Cargando pipeline...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* HEADER STATS */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 text-white shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-400" /> Pipeline Ventas
          </h3>
          <button onClick={refresh} className="p-1.5 rounded-lg bg-slate-700 active:scale-90">
            <RefreshCw className="w-3.5 h-3.5 text-slate-300" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-2xl font-black text-white">{formatCurrency(totalValor)}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Valor Total</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-emerald-400">{totalContratos}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Contratos</p>
          </div>
        </div>
      </div>

      {/* FUNNEL VISUALIZATION */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Etapas del Pipeline</p>
        {pipeline.map((etapa, i) => {
          const widthPct = totalValor > 0 ? Math.max(30, (etapa.valor / totalValor) * 100) : 50;
          const isSelected = selectedEtapa === etapa.etapa;

          return (
            <button
              key={etapa.etapa}
              onClick={() => setSelectedEtapa(isSelected ? null : etapa.etapa)}
              className={`w-full transition-all active:scale-[0.98] ${isSelected ? 'scale-[1.02]' : ''}`}
            >
              <div className={`rounded-xl p-4 border transition-all ${
                isSelected ? 'border-indigo-300 shadow-lg shadow-indigo-100' : 'border-slate-100'
              }`} style={{ backgroundColor: `${etapa.color}10` }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: etapa.color }}>
                      {i + 1}
                    </div>
                    <span className="font-bold text-slate-700 text-sm">{etapa.etapa}</span>
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <div>
                      <p className="text-sm font-bold text-slate-800">{formatCurrency(etapa.valor)}</p>
                      <p className="text-[9px] text-slate-400">{etapa.cantidad} contratos</p>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-slate-300 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                  </div>
                </div>

                {/* Bar */}
                <div className="h-2.5 bg-white/50 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${widthPct}%`, backgroundColor: etapa.color }}
                  />
                </div>
              </div>

              {/* EXPANDED: Contracts in this etapa */}
              {isSelected && (
                <div className="mt-2 space-y-2 px-2">
                  {PIPELINE_CONTRATOS.filter(c => c.etapa === etapa.etapa).map(c => (
                    <div key={c.id} className="bg-white rounded-lg p-3 border border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          c.urgencia === 'alta' ? 'bg-red-500' : c.urgencia === 'media' ? 'bg-amber-500' : 'bg-slate-300'
                        }`} />
                        <div>
                          <p className="text-xs font-bold text-slate-700">{c.cliente}</p>
                          <p className="text-[10px] text-slate-400">{c.titulo}</p>
                        </div>
                      </div>
                      <p className="text-xs font-bold text-slate-600">{formatCurrency(c.valor)}</p>
                    </div>
                  ))}
                  {PIPELINE_CONTRATOS.filter(c => c.etapa === etapa.etapa).length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-2">Sin contratos en esta etapa</p>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* CONVERSION INSIGHTS */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" /> Métricas Pipeline
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <MetricPill icon={<DollarSign className="w-4 h-4 text-emerald-500" />} label="Avg Deal" value={formatCurrency(totalContratos > 0 ? totalValor / totalContratos : 0)} />
          <MetricPill icon={<TrendingUp className="w-4 h-4 text-blue-500" />} label="Conv. Rate" value="78%" />
          <MetricPill icon={<FileText className="w-4 h-4 text-purple-500" />} label="Avg Days" value="23d" />
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENT
// ═══════════════════════════════════════════════════════════════

function MetricPill({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-slate-50 rounded-lg p-3 text-center">
      <div className="flex justify-center mb-1">{icon}</div>
      <p className="text-sm font-black text-slate-700">{value}</p>
      <p className="text-[9px] font-bold text-slate-400 uppercase">{label}</p>
    </div>
  );
}
