/**
 * 📊 SILEXAR PULSE - Página de Informes IA
 * 
 * @description Centro de informes con análisis predictivo y gráficos
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  Download,
  RefreshCw,
  DollarSign,
  Target,
  Radio,
  Brain,
  Sparkles,
  ChevronDown,
  FileText
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface MetricaClave {
  nombre: string;
  valor: number;
  unidad: string;
  tendencia: 'up' | 'down' | 'stable';
  cambio: number;
  prediccion?: number;
}

interface SeccionInforme {
  titulo: string;
  descripcion?: string;
  metricas?: MetricaClave[];
  grafico?: { tipo: string; datos: { etiqueta: string; valor: number; color?: string }[] };
  tabla?: { encabezados: string[]; filas: (string | number)[][] };
  insight?: string;
}

interface Informe {
  id: string;
  tipo: string;
  titulo: string;
  periodo: string;
  fechaGeneracion: string;
  secciones: SeccionInforme[];
  resumenEjecutivo: string;
  recomendaciones: string[];
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTES
// ═══════════════════════════════════════════════════════════════

const NeuromorphicCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-2xl p-6 bg-gradient-to-br from-slate-50 to-slate-100 shadow-[8px_8px_16px_rgba(0,0,0,0.1),-8px_-8px_16px_rgba(255,255,255,0.9)] ${className}`}>
    {children}
  </div>
);

const TendenciaIcon = ({ tendencia }: { tendencia: 'up' | 'down' | 'stable' }) => {
  if (tendencia === 'up') return <TrendingUp className="w-4 h-4 text-emerald-500" />;
  if (tendencia === 'down') return <TrendingDown className="w-4 h-4 text-red-500" />;
  return <Minus className="w-4 h-4 text-slate-400" />;
};

const BarraGrafico = ({ datos, maxValor }: { datos: { etiqueta: string; valor: number; color?: string }[]; maxValor: number }) => (
  <div className="space-y-3">
    {datos.map((d, i) => (
      <div key={`${d}-${i}`}>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-slate-600">{d.etiqueta}</span>
          <span className="font-bold text-slate-800">{typeof d.valor === 'number' && d.valor > 1000 ? `$${(d.valor / 1000000).toFixed(1)}M` : `${d.valor}%`}</span>
        </div>
        <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-500"
            style={{ 
              width: `${(d.valor / maxValor) * 100}%`,
              background: d.color || `linear-gradient(to right, #6366F1, #8B5CF6)`
            }}
          />
        </div>
      </div>
    ))}
  </div>
);

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function InformesPage() {
  const [informe, setInforme] = useState<Informe | null>(null);
  const [loading, setLoading] = useState(true);
  const [tipoInforme, setTipoInforme] = useState('resumen_ejecutivo');
  const [periodo, setPeriodo] = useState('mensual');

  const TIPOS_INFORME = [
    { id: 'resumen_ejecutivo', nombre: 'Resumen Ejecutivo', icon: BarChart3 },
    { id: 'rendimiento_campanas', nombre: 'Rendimiento Campañas', icon: Target },
    { id: 'cumplimiento_pauta', nombre: 'Cumplimiento Pauta', icon: Radio },
    { id: 'analisis_financiero', nombre: 'Análisis Financiero', icon: DollarSign },
    { id: 'proyeccion_ventas', nombre: 'Proyección Ventas IA', icon: Brain }
  ];

  const PERIODOS = [
    { id: 'semanal', nombre: 'Semanal' },
    { id: 'mensual', nombre: 'Mensual' },
    { id: 'trimestral', nombre: 'Trimestral' },
    { id: 'anual', nombre: 'Anual' }
  ];

  const fetchInforme = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/informes?tipo=${tipoInforme}&periodo=${periodo}`);
      const data = await response.json();
      if (data.success) {
        setInforme(data.data);
      }
    } catch (error) {
      /* */;
    } finally {
      setLoading(false);
    }
  }, [tipoInforme, periodo]);

  useEffect(() => { fetchInforme(); }, [fetchInforme]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-violet-50 to-slate-100 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-violet-600 bg-clip-text text-transparent flex items-center gap-3">
              <BarChart3 className="w-10 h-10 text-violet-500" />
              Informes IA
            </h1>
            <p className="text-slate-500 mt-2">Análisis inteligente y proyecciones predictivas</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Selector de período */}
            <div className="relative">
              <select 
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
                className="appearance-none bg-white rounded-xl px-4 py-2 pr-10 shadow-md font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-300"
              >
                {PERIODOS.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
            
            <button onClick={fetchInforme} className="p-3 bg-white rounded-xl shadow-md hover:bg-violet-50 text-violet-500">
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            
            <button className="px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-medium flex items-center gap-2 shadow-lg">
              <Download className="w-4 h-4" /> Exportar PDF
            </button>
          </div>
        </div>

        {/* Selector de tipo */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {TIPOS_INFORME.map((t) => (
            <button
              key={t.id}
              onClick={() => setTipoInforme(t.id)}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all ${
                tipoInforme === t.id 
                  ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg' 
                  : 'bg-white text-slate-600 hover:bg-violet-50'
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.nombre}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20">
            <Sparkles className="w-16 h-16 text-violet-400 mx-auto animate-pulse" />
            <p className="mt-4 text-slate-500">Generando informe con IA...</p>
          </div>
        ) : informe ? (
          <div className="space-y-6">
            {/* Encabezado del informe */}
            <NeuromorphicCard>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">{informe.titulo}</h2>
                  <p className="text-slate-500">{informe.periodo}</p>
                </div>
                <div className="flex items-center gap-2 text-violet-500">
                  <Brain className="w-5 h-5" />
                  <span className="text-sm font-medium">Generado por IA</span>
                </div>
              </div>
              <p className="text-slate-600 leading-relaxed">{informe.resumenEjecutivo}</p>
            </NeuromorphicCard>

            {/* Secciones del informe */}
            {informe.secciones.map((seccion, i) => (
              <NeuromorphicCard key={`${seccion}-${i}`}>
                <h3 className="text-lg font-bold text-slate-800 mb-4">{seccion.titulo}</h3>
                
                {/* Métricas */}
                {seccion.metricas && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {seccion.metricas.map((m, j) => (
                      <div key={j} className="p-4 bg-white rounded-xl">
                        <p className="text-xs text-slate-500 mb-1">{m.nombre}</p>
                        <p className="text-2xl font-bold text-slate-800">
                          {m.unidad === 'CLP' ? `$${(m.valor / 1000000).toFixed(1)}M` : 
                           m.unidad === '%' ? `${m.valor}%` : m.valor.toLocaleString()}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <TendenciaIcon tendencia={m.tendencia} />
                          <span className={`text-xs ${m.cambio >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {m.cambio >= 0 ? '+' : ''}{m.cambio}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Gráfico */}
                {seccion.grafico && (
                  <div className="mb-6">
                    <BarraGrafico 
                      datos={seccion.grafico.datos} 
                      maxValor={Math.max(...seccion.grafico.datos.map(d => d.valor))}
                    />
                  </div>
                )}

                {/* Tabla */}
                {seccion.tabla && (
                  <div className="overflow-x-auto mb-6">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200">
                          {seccion.tabla.encabezados.map((h, j) => (
                            <th key={j} className="text-left py-2 px-3 font-medium text-slate-600">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {seccion.tabla.filas.map((fila, j) => (
                          <tr key={j} className="border-b border-slate-100">
                            {fila.map((celda, k) => (
                              <td key={k} className="py-2 px-3 text-slate-700">{celda}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Insight IA */}
                {seccion.insight && (
                  <div className="p-4 bg-violet-50 rounded-xl border border-violet-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-violet-500" />
                      <span className="text-sm font-medium text-violet-700">Análisis IA</span>
                    </div>
                    <p className="text-sm text-violet-900">{seccion.insight}</p>
                  </div>
                )}
              </NeuromorphicCard>
            ))}

            {/* Recomendaciones */}
            {informe.recomendaciones.length > 0 && (
              <NeuromorphicCard>
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-violet-500" />
                  Recomendaciones IA
                </h3>
                <ul className="space-y-3">
                  {informe.recomendaciones.map((rec, i) => (
                    <li key={`${rec}-${i}`} className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {i + 1}
                      </span>
                      <p className="text-slate-700">{rec}</p>
                    </li>
                  ))}
                </ul>
              </NeuromorphicCard>
            )}
          </div>
        ) : (
          <div className="text-center py-20">
            <FileText className="w-16 h-16 text-slate-300 mx-auto" />
            <p className="mt-4 text-slate-500">No hay datos disponibles</p>
          </div>
        )}

        <div className="text-center text-slate-400 text-sm">
          <p>📊 Informes IA - SILEXAR PULSE TIER 0</p>
        </div>
      </div>
    </div>
  );
}
