'use client';

/**
 * 📊 SILEXAR PULSE - PERFORMANCE PREDICTION WIDGET
 * 
 * Widget de predicción de rendimiento que analiza los assets digitales
 * y muestra métricas predictivas de CTR, Viewability, y Engagement
 * en tiempo real durante la configuración de la cuña.
 * 
 * @version 2050.X.0
 * @tier TIER_X_SINGULARITY
 */

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Eye, MousePointer, AlertTriangle, 
  Sparkles, Brain, Target,
  ChevronRight, RefreshCw, Lightbulb, Zap
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export interface PredictionData {
  clickRatePredicho: number;
  viewabilityPredicha: number;
  completionRatePredicho: number;
  attentionRetainmentScore: number;
  segundoCaidaAtencion: number;
  perfilEmocional: {
    energia: number;
    valencia: number;
  };
  sugerencias: Array<{
    id: string;
    tipo: 'CRITICA' | 'IMPORTANTE' | 'SUGERENCIA';
    categoria: string;
    mensaje: string;
    impactoEstimado: number;
  }>;
  scoreGeneral: number;
  clasificacion: 'EXCELENTE' | 'BUENO' | 'REGULAR' | 'NECESITA_MEJORAS' | 'CRITICO';
}

interface PerformancePredictionWidgetProps {
  assetId?: string;
  isAnalyzing?: boolean;
  prediction?: PredictionData | null;
  onRequestAnalysis?: () => void;
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export const PerformancePredictionWidget: React.FC<PerformancePredictionWidgetProps> = ({
  isAnalyzing = false,
  prediction = null,
  onRequestAnalysis
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);

  // Animar el score cuando llega
  useEffect(() => {
    if (prediction?.scoreGeneral) {
      const target = prediction.scoreGeneral;
      const duration = 1500;
      const steps = 60;
      const increment = target / steps;
      let current = 0;
      
      const interval = setInterval(() => {
        current += increment;
        if (current >= target) {
          setAnimatedScore(target);
          clearInterval(interval);
        } else {
          setAnimatedScore(Math.round(current));
        }
      }, duration / steps);
      
      return () => clearInterval(interval);
    }
  }, [prediction?.scoreGeneral]);

  // ─── HELPERS ─────────────────────────────────────────────────

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 60) return 'text-amber-500';
    return 'text-red-500';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'from-emerald-500 to-teal-500';
    if (score >= 60) return 'from-amber-500 to-orange-500';
    return 'from-red-500 to-rose-500';
  };

  const getClassificationBadge = (classification: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      'EXCELENTE': { bg: 'bg-emerald-100', text: 'text-emerald-700', label: '🏆 Excelente' },
      'BUENO': { bg: 'bg-blue-100', text: 'text-blue-700', label: '✓ Bueno' },
      'REGULAR': { bg: 'bg-amber-100', text: 'text-amber-700', label: '⚡ Regular' },
      'NECESITA_MEJORAS': { bg: 'bg-orange-100', text: 'text-orange-700', label: '⚠️ Necesita mejoras' },
      'CRITICO': { bg: 'bg-red-100', text: 'text-red-700', label: '🚨 Crítico' }
    };
    return badges[classification] || badges['REGULAR'];
  };

  const getSuggestionIcon = (tipo: string) => {
    if (tipo === 'CRITICA') return <AlertTriangle className="w-4 h-4 text-red-500" />;
    if (tipo === 'IMPORTANTE') return <Zap className="w-4 h-4 text-amber-500" />;
    return <Lightbulb className="w-4 h-4 text-blue-500" />;
  };

  // ─── RENDER: NO DATA ─────────────────────────────────────────

  if (!prediction && !isAnalyzing) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl flex items-center justify-center">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">Predicción de Rendimiento</h3>
          <p className="text-sm text-slate-500 mb-6 max-w-xs mx-auto">
            Analiza tus assets con IA para predecir el CTR, engagement y 
            recibir sugerencias de optimización.
          </p>
          <button
            onClick={onRequestAnalysis}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 
                       text-white font-medium rounded-xl hover:shadow-lg transition-all"
          >
            <Sparkles className="w-5 h-5" />
            Analizar con IA
          </button>
        </div>
      </div>
    );
  }

  // ─── RENDER: ANALYZING ─────────────────────────────────────────

  if (isAnalyzing) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl flex items-center justify-center animate-pulse">
            <RefreshCw className="w-8 h-8 text-white animate-spin" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">Analizando...</h3>
          <p className="text-sm text-slate-500">
            La IA está evaluando tu contenido
          </p>
          
          {/* Progress steps */}
          <div className="mt-6 space-y-2 max-w-xs mx-auto text-left">
            {['Procesando contenido', 'Analizando engagement', 'Calculando predicciones'].map((step, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                <div className="w-4 h-4 bg-violet-500 rounded-full animate-pulse" 
                     style={{ animationDelay: `${idx * 200}ms` }} />
                <span className="text-slate-600">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── RENDER: WITH DATA ─────────────────────────────────────────

  const badge = getClassificationBadge(prediction!.clasificacion);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {/* Header with Score */}
      <div className={`p-6 bg-gradient-to-r ${getScoreGradient(prediction!.scoreGeneral)} text-white`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-5 h-5" />
              <span className="text-sm font-medium text-white/80">Predicción de Rendimiento</span>
            </div>
            <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${badge.bg} ${badge.text}`}>
              {badge.label}
            </div>
          </div>
          
          {/* Animated Score Circle */}
          <div className="relative w-24 h-24">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="white"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${(animatedScore / 100) * 251.2} 251.2`}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold">{animatedScore}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="p-6 grid grid-cols-3 gap-4">
        {/* CTR */}
        <div className="text-center p-4 bg-slate-50 rounded-xl">
          <MousePointer className="w-5 h-5 mx-auto mb-2 text-blue-500" />
          <div className={`text-2xl font-bold ${getScoreColor(prediction!.clickRatePredicho * 20)}`}>
            {prediction!.clickRatePredicho.toFixed(2)}%
          </div>
          <div className="text-xs text-slate-500">CTR Predicho</div>
        </div>

        {/* Viewability */}
        <div className="text-center p-4 bg-slate-50 rounded-xl">
          <Eye className="w-5 h-5 mx-auto mb-2 text-emerald-500" />
          <div className={`text-2xl font-bold ${getScoreColor(prediction!.viewabilityPredicha)}`}>
            {prediction!.viewabilityPredicha}%
          </div>
          <div className="text-xs text-slate-500">Viewability</div>
        </div>

        {/* Completion */}
        <div className="text-center p-4 bg-slate-50 rounded-xl">
          <TrendingUp className="w-5 h-5 mx-auto mb-2 text-violet-500" />
          <div className={`text-2xl font-bold ${getScoreColor(prediction!.completionRatePredicho)}`}>
            {prediction!.completionRatePredicho}%
          </div>
          <div className="text-xs text-slate-500">Completion</div>
        </div>
      </div>

      {/* Attention Analysis */}
      <div className="px-6 pb-4">
        <div className="p-4 bg-gradient-to-r from-violet-50 to-indigo-50 rounded-xl">
          <div className="flex items-center gap-3 mb-3">
            <Brain className="w-5 h-5 text-violet-600" />
            <span className="font-medium text-slate-800">Análisis de Atención</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-600">Score de Retención</div>
              <div className="text-xl font-bold text-violet-700">
                {prediction!.attentionRetainmentScore.toFixed(1)}/10
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-600">Caída de atención</div>
              <div className="text-xl font-bold text-amber-600">
                {prediction!.segundoCaidaAtencion}s
              </div>
            </div>
          </div>
          
          {/* Attention Timeline */}
          <div className="mt-4 h-8 bg-white rounded-lg overflow-hidden flex">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full transition-all"
              style={{ width: `${(prediction!.segundoCaidaAtencion / 30) * 100}%` }}
            />
            <div 
              className="bg-gradient-to-r from-amber-400 to-amber-300 h-full transition-all"
              style={{ width: `${((30 - prediction!.segundoCaidaAtencion) / 30) * 50}%` }}
            />
            <div 
              className="bg-gradient-to-r from-red-400 to-red-300 h-full flex-1"
            />
          </div>
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>0s</span>
            <span className="text-amber-600">↓ {prediction!.segundoCaidaAtencion}s</span>
            <span>30s</span>
          </div>
        </div>
      </div>

      {/* Suggestions */}
      {prediction!.sugerencias.length > 0 && (
        <div className="px-6 pb-6">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              <span className="font-medium text-slate-800">
                {prediction!.sugerencias.length} Sugerencia{prediction!.sugerencias.length > 1 ? 's' : ''} de Optimización
              </span>
            </div>
            <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${showDetails ? 'rotate-90' : ''}`} />
          </button>

          {showDetails && (
            <div className="mt-3 space-y-2">
              {prediction!.sugerencias.map(sug => (
                <div 
                  key={sug.id}
                  className={`p-4 rounded-xl border ${
                    sug.tipo === 'CRITICA' ? 'bg-red-50 border-red-200' :
                    sug.tipo === 'IMPORTANTE' ? 'bg-amber-50 border-amber-200' :
                    'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {getSuggestionIcon(sug.tipo)}
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-800">{sug.mensaje}</div>
                      <div className="text-xs text-slate-500 mt-1">
                        Impacto estimado: +{sug.impactoEstimado}% rendimiento
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PerformancePredictionWidget;
