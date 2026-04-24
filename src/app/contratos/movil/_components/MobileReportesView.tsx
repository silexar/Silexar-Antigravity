/**
 * ?? MOBILE: Reportes Builder View
 * 
 * Builder de reportes simplificado para mobile.
 * Paridad con desktop: contratos/reportes/page.tsx
 * 
 * @tier TIER_0_ENTERPRISE
 * @platform MOBILE
 */

'use client';

import { useState } from 'react';
import {
  BarChart3, PieChart, TrendingUp, Calendar,
  Download, Eye, Plus, Clock, Star
} from 'lucide-react';

interface ReportePlantilla {
  id: string;
  nombre: string;
  descripcion: string;
  tipo: 'kpi' | 'pipeline' | 'tendencia' | 'comparativo';
  favorito: boolean;
  ultimoUso?: string;
}

const PLANTILLAS: ReportePlantilla[] = [
  { id: 'rpt-1', nombre: 'Resumen Ejecutivo', descripcion: 'KPIs principales y métricas clave', tipo: 'kpi', favorito: true, ultimoUso: '2025-02-26' },
  { id: 'rpt-2', nombre: 'Pipeline por Etapa', descripcion: 'Distribución y valor por etapa', tipo: 'pipeline', favorito: true, ultimoUso: '2025-02-25' },
  { id: 'rpt-3', nombre: 'Tendencia Mensual', descripcion: 'Evolución de contratos por mes', tipo: 'tendencia', favorito: false, ultimoUso: '2025-02-20' },
  { id: 'rpt-4', nombre: 'Comparativo YoY', descripcion: 'Comparación año anterior', tipo: 'comparativo', favorito: false },
  { id: 'rpt-5', nombre: 'Top Clientes', descripcion: 'Ranking por valor de contrato', tipo: 'kpi', favorito: true, ultimoUso: '2025-02-24' },
  { id: 'rpt-6', nombre: 'Análisis de Cobranza', descripcion: 'Estado de cuentas y aging', tipo: 'kpi', favorito: false },
];

const tipoConfig: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  kpi: { icon: <BarChart3 className="w-5 h-5" />, color: 'text-[#6888ff]', bg: 'bg-[#dfeaff]' },
  pipeline: { icon: <PieChart className="w-5 h-5" />, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  tendencia: { icon: <TrendingUp className="w-5 h-5" />, color: 'text-blue-600', bg: 'bg-blue-100' },
  comparativo: { icon: <Calendar className="w-5 h-5" />, color: 'text-amber-600', bg: 'bg-amber-100' },
};

export function MobileReportesView() {
  const [tab, setTab] = useState<'plantillas' | 'recientes' | 'favoritos'>('plantillas');

  const filtered = tab === 'favoritos' ? PLANTILLAS.filter(p => p.favorito)
    : tab === 'recientes' ? PLANTILLAS.filter(p => p.ultimoUso).sort((a, b) => (b.ultimoUso || '').localeCompare(a.ultimoUso || ''))
    : PLANTILLAS;

  return (
    <div className="space-y-5">
      {/* HEADER */}
      <div className="bg-[#6888ff] rounded-2xl p-5 text-white shadow-xl">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="w-5 h-5 text-purple-200" />
          <p className="text-xs font-bold text-purple-200 uppercase tracking-widest">Reportes</p>
        </div>
        <p className="text-lg font-black">{PLANTILLAS.length} plantillas</p>
        <p className="text-xs text-purple-200 mt-1">Genera reportes personalizados desde tu móvil</p>
      </div>

      {/* TABS */}
      <div className="flex gap-2">
        {(['plantillas', 'recientes', 'favoritos'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              tab === t ? 'bg-purple-600 text-white' : 'bg-[#dfeaff] text-[#9aa3b8] border border-[#bec8de30]'
            }`}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* LIST */}
      <div className="space-y-3">
        {filtered.map(plantilla => {
          const config = tipoConfig[plantilla.tipo];
          return (
            <button key={plantilla.id} className="w-full bg-[#dfeaff] rounded-xl border border-[#bec8de30] p-4 flex items-center gap-3 active:scale-[0.98]">
              <div className={`w-11 h-11 rounded-xl ${config?.bg} ${config?.color} flex items-center justify-center`}>
                {config?.icon}
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="flex items-center gap-1">
                  <p className="font-bold text-[#69738c] text-sm">{plantilla.nombre}</p>
                  {plantilla.favorito && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
                </div>
                <p className="text-[10px] text-[#9aa3b8] truncate">{plantilla.descripcion}</p>
                {plantilla.ultimoUso && (
                  <p className="text-[9px] text-[#9aa3b8] flex items-center gap-0.5 mt-0.5"><Clock className="w-2.5 h-2.5" /> {plantilla.ultimoUso}</p>
                )}
              </div>
              <div className="flex gap-1.5 shrink-0">
                <div className="p-2 rounded-lg bg-[#dfeaff]"><Eye className="w-4 h-4 text-[#9aa3b8]" /></div>
                <div className="p-2 rounded-lg bg-[#dfeaff]"><Download className="w-4 h-4 text-[#6888ff]" /></div>
              </div>
            </button>
          );
        })}
      </div>

      {/* NEW REPORT */}
      <button className="w-full py-3 border-2 border-dashed border-purple-300 rounded-xl text-purple-600 font-bold flex items-center justify-center gap-2 active:scale-95">
        <Plus className="w-5 h-5" /> Crear Reporte Personalizado
      </button>
    </div>
  );
}
