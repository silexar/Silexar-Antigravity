/**
 * 🔮 SILEXAR PULSE - Página Predicción de Demanda
 * 
 * @description Dashboard de forecast y optimización de inventario
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import { 
  TrendingUp, BarChart3, Calendar,
  Zap, ArrowUp, ArrowDown, Sparkles,
  Target
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// DATOS MOCK
// ═══════════════════════════════════════════════════════════════

const forecastMes = {
  periodo: 'Diciembre 2025',
  ingresoBase: 85000000,
  ingresoOptimista: 102000000,
  ingresoPesimista: 68000000,
  probabilidadCumplimiento: 78,
  factoresPositivos: ['Temporada alta', 'Pipeline sólido', 'Clientes en renovación'],
  factoresRiesgo: ['Competencia activa', '2 clientes en riesgo de churn']
};

const tendencias = [
  { categoria: 'Radio FM', tendencia: 'estable', variacion: 2, prediccion: 3 },
  { categoria: 'Podcast', tendencia: 'subiendo', variacion: 15, prediccion: 20 },
  { categoria: 'Programmatic', tendencia: 'subiendo', variacion: 25, prediccion: 30 },
  { categoria: 'Patrocinios', tendencia: 'estable', variacion: -1, prediccion: 2 }
];

const oportunidades = [
  { tipo: 'renovacion', cliente: 'Empresa ABC', descripcion: 'Contrato vence en 15 días', valor: 24000000, urgencia: 'alta' },
  { tipo: 'expansion', cliente: 'Servicios XYZ', descripcion: 'Potencial de upsell', valor: 8000000, urgencia: 'media' },
  { tipo: 'reactivacion', cliente: 'Comercial DEF', descripcion: 'Sin actividad 6 meses', valor: 12000000, urgencia: 'media' }
];

const ocupacionProximos = [
  { fecha: 'Hoy', prime: 92, rotativo: 75 },
  { fecha: 'Mañana', prime: 88, rotativo: 70 },
  { fecha: '+2 días', prime: 85, rotativo: 65 },
  { fecha: '+3 días', prime: 78, rotativo: 60 },
  { fecha: '+4 días', prime: 72, rotativo: 55 },
  { fecha: '+5 días', prime: 65, rotativo: 50 },
  { fecha: '+6 días', prime: 60, rotativo: 45 }
];

const recomendaciones = [
  { tipo: 'aumentar_precio', bloque: 'Prime', razon: 'Demanda > 85%', impacto: 2500000 },
  { tipo: 'promocionar', bloque: 'Madrugada', razon: 'Ocupación < 30%', impacto: 1200000 }
];

// ═══════════════════════════════════════════════════════════════
// COMPONENTES
// ═══════════════════════════════════════════════════════════════

const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-2xl p-6 bg-gradient-to-br from-slate-50 to-slate-100 shadow-[8px_8px_16px_rgba(0,0,0,0.1),-8px_-8px_16px_rgba(255,255,255,0.9)] ${className}`}>
    {children}
  </div>
);

const TendenciaIcon = ({ tendencia }: { tendencia: string }) => {
  if (tendencia === 'subiendo') return <ArrowUp className="w-4 h-4 text-emerald-500" />;
  if (tendencia === 'bajando') return <ArrowDown className="w-4 h-4 text-red-500" />;
  return <span className="w-4 h-4 text-slate-400">→</span>;
};

// ═══════════════════════════════════════════════════════════════
// PÁGINA
// ═══════════════════════════════════════════════════════════════

export default function PrediccionDemandaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-violet-50 to-slate-100 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-violet-600 bg-clip-text text-transparent flex items-center gap-3">
            <Sparkles className="w-10 h-10 text-violet-500" />
            Predicción de Demanda IA
          </h1>
          <p className="text-slate-500 mt-2">Forecast de ingresos y optimización de inventario</p>
        </div>

        {/* Forecast principal */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-violet-500" />
              Forecast de Ingresos - {forecastMes.periodo}
            </h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              forecastMes.probabilidadCumplimiento >= 80 ? 'bg-emerald-100 text-emerald-700' :
              forecastMes.probabilidadCumplimiento >= 60 ? 'bg-amber-100 text-amber-700' :
              'bg-red-100 text-red-700'
            }`}>
              {forecastMes.probabilidadCumplimiento}% probabilidad de cumplimiento
            </span>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-red-50 rounded-xl">
              <p className="text-sm text-red-600 mb-1">Pesimista</p>
              <p className="text-3xl font-bold text-red-700">${(forecastMes.ingresoPesimista / 1000000).toFixed(0)}M</p>
            </div>
            <div className="text-center p-4 bg-violet-100 rounded-xl border-2 border-violet-400">
              <p className="text-sm text-violet-600 mb-1">Base</p>
              <p className="text-4xl font-bold text-violet-700">${(forecastMes.ingresoBase / 1000000).toFixed(0)}M</p>
            </div>
            <div className="text-center p-4 bg-emerald-50 rounded-xl">
              <p className="text-sm text-emerald-600 mb-1">Optimista</p>
              <p className="text-3xl font-bold text-emerald-700">${(forecastMes.ingresoOptimista / 1000000).toFixed(0)}M</p>
            </div>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-4 mt-6">
            <div className="p-4 bg-emerald-50 rounded-xl">
              <h4 className="font-medium text-emerald-800 mb-2">✅ Factores Positivos</h4>
              <ul className="text-sm text-emerald-700 space-y-1">
                {forecastMes.factoresPositivos.map((f, i) => <li key={`${f}-${i}`}>• {f}</li>)}
              </ul>
            </div>
            <div className="p-4 bg-red-50 rounded-xl">
              <h4 className="font-medium text-red-800 mb-2">⚠️ Factores de Riesgo</h4>
              <ul className="text-sm text-red-700 space-y-1">
                {forecastMes.factoresRiesgo.map((f, i) => <li key={`${f}-${i}`}>• {f}</li>)}
              </ul>
            </div>
          </div>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Tendencias de mercado */}
          <Card>
            <h2 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-violet-500" />
              Tendencias de Mercado
            </h2>
            <div className="space-y-4">
              {tendencias.map((t, i) => (
                <div key={`${t}-${i}`} className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div className="flex items-center gap-3">
                    <TendenciaIcon tendencia={t.tendencia} />
                    <span className="font-medium">{t.categoria}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-sm font-medium ${t.variacion >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {t.variacion >= 0 ? '+' : ''}{t.variacion}%
                    </span>
                    <span className="text-xs text-slate-400">
                      Pred 30d: {t.prediccion >= 0 ? '+' : ''}{t.prediccion}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Ocupación proyectada */}
          <Card>
            <h2 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-violet-500" />
              Ocupación Proyectada (7 días)
            </h2>
            <div className="space-y-3">
              {ocupacionProximos.map((o, i) => (
                <div key={`${o}-${i}`} className="flex items-center gap-4">
                  <span className="w-16 text-sm text-slate-500">{o.fecha}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-amber-600 w-14">Prime</span>
                      <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className={`h-full ${o.prime >= 80 ? 'bg-red-400' : o.prime >= 60 ? 'bg-amber-400' : 'bg-emerald-400'}`} style={{ width: `${o.prime}%` }} />
                      </div>
                      <span className="text-xs font-medium w-8">{o.prime}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-blue-600 w-14">Rotativo</span>
                      <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-400" style={{ width: `${o.rotativo}%` }} />
                      </div>
                      <span className="text-xs font-medium w-8">{o.rotativo}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Oportunidades detectadas */}
        <Card>
          <h2 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-violet-500" />
            Oportunidades Detectadas por IA
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {oportunidades.map((o, i) => (
              <div key={`${o}-${i}`} className={`p-4 rounded-xl border ${
                o.urgencia === 'alta' ? 'bg-red-50 border-red-200' :
                o.urgencia === 'media' ? 'bg-amber-50 border-amber-200' :
                'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium uppercase text-slate-500">{o.tipo}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    o.urgencia === 'alta' ? 'bg-red-200 text-red-700' : 'bg-amber-200 text-amber-700'
                  }`}>
                    {o.urgencia}
                  </span>
                </div>
                <p className="font-bold text-slate-800">{o.cliente}</p>
                <p className="text-sm text-slate-600 mb-2">{o.descripcion}</p>
                <p className="text-lg font-bold text-violet-600">${(o.valor / 1000000).toFixed(0)}M</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Recomendaciones de precios */}
        <Card className="border-l-4 border-violet-400 bg-violet-50">
          <h3 className="font-bold text-violet-800 flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5" />
            Recomendaciones de Optimización IA
          </h3>
          <div className="space-y-3">
            {recomendaciones.map((r, i) => (
              <div key={`${r}-${i}`} className="flex items-center justify-between p-3 bg-white rounded-lg">
                <div>
                  <p className="font-medium text-slate-800">
                    {r.tipo === 'aumentar_precio' ? '📈 Aumentar precio' : '📢 Promocionar'} - {r.bloque}
                  </p>
                  <p className="text-sm text-slate-500">{r.razon}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-emerald-600">+${(r.impacto / 1000000).toFixed(1)}M</p>
                  <p className="text-xs text-slate-400">impacto estimado</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="text-center text-slate-400 text-sm">
          <p>🔮 Predicción de Demanda IA - SILEXAR PULSE TIER 0</p>
        </div>
      </div>
    </div>
  );
}
