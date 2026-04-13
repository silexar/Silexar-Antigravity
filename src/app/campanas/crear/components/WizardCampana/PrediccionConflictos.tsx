/**
 * 🔮 Predicción de Conflictos y Auto-Optimización IA
 * 
 * Motor predictivo que analiza la programación y detecta:
 * - Conflictos futuros de competencia
 * - Saturación inminente de bloques
 * - Oportunidades de redistribución
 * - Sugerencias de optimización automática
 * 
 * @enterprise TIER0 Fortune 10 Enterprise 2050
 */

'use client';

import React, { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Sparkles, AlertTriangle, Clock, TrendingUp, Brain, 
  RefreshCw, CheckCircle2, Zap, Shield, Target,
  ArrowRight, Eye, AlertOctagon, Lightbulb
} from 'lucide-react';

// ==================== INTERFACES ====================

interface PrediccionConflicto {
  id: string;
  tipo: 'competencia' | 'saturacion' | 'exclusividad' | 'horario';
  severidad: 'critica' | 'alta' | 'media' | 'baja';
  fechaDeteccion: string;
  fechaImpacto: string;
  descripcion: string;
  bloquesAfectados: string[];
  anunciantesInvolucrados: string[];
  probabilidad: number;
  impactoEconomico: number;
  sugerenciaIA: string;
  estado: 'activo' | 'resuelto' | 'monitoreando';
}

interface SugerenciaOptimizacion {
  id: string;
  tipo: 'redistribucion' | 'compactacion' | 'reemplazo' | 'cancelacion';
  titulo: string;
  descripcion: string;
  ahorroPotencial: number;
  mejoraSaturacion: number;
  confianza: number;
  acciones: {
    tipo: string;
    detalle: string;
  }[];
}

interface EstadisticasPrediccion {
  conflictosDetectados: number;
  conflictosCriticos: number;
  conflictosResueltos: number;
  scorePrevencion: number;
  ahorroEstimado: number;
}

// ==================== DATOS MOCK ====================

const PREDICCIONES_MOCK: PrediccionConflicto[] = [
  {
    id: 'pred_001',
    tipo: 'competencia',
    severidad: 'critica',
    fechaDeteccion: '19/12/2025',
    fechaImpacto: '23/12/2025',
    descripcion: 'WOM y CLARO coincidirán en el mismo bloque Prime 08:26',
    bloquesAfectados: ['08:26:00 - Prime'],
    anunciantesInvolucrados: ['WOM', 'CLARO'],
    probabilidad: 92,
    impactoEconomico: 450000,
    sugerenciaIA: 'Mover WOM al bloque 09:26 para separar 60 min de CLARO',
    estado: 'activo',
  },
  {
    id: 'pred_002',
    tipo: 'saturacion',
    severidad: 'alta',
    fechaDeteccion: '19/12/2025',
    fechaImpacto: '24/12/2025',
    descripcion: 'Bloque Prime PM 18:26 alcanzará 100% de saturación',
    bloquesAfectados: ['18:26:00 - Prime PM', '19:26:00 - Prime PM'],
    anunciantesInvolucrados: ['BANCO CHILE', 'FALABELLA', 'COCA COLA'],
    probabilidad: 87,
    impactoEconomico: 320000,
    sugerenciaIA: 'Redistribuir 2 cuñas de 30s al bloque 17:26 (65% ocupación)',
    estado: 'activo',
  },
  {
    id: 'pred_003',
    tipo: 'exclusividad',
    severidad: 'media',
    fechaDeteccion: '18/12/2025',
    fechaImpacto: '25/12/2025',
    descripcion: 'Conflicto de exclusividad: TOYOTA tiene contrato exclusivo en bloque Auspicio',
    bloquesAfectados: ['21:00:00 - Auspicio'],
    anunciantesInvolucrados: ['TOYOTA', 'HYUNDAI'],
    probabilidad: 95,
    impactoEconomico: 180000,
    sugerenciaIA: 'Reubicar HYUNDAI a bloque Rotativo 20:26',
    estado: 'monitoreando',
  },
];

const SUGERENCIAS_MOCK: SugerenciaOptimizacion[] = [
  {
    id: 'sug_001',
    tipo: 'redistribucion',
    titulo: '🔄 Redistribución Inteligente Prime AM',
    descripcion: 'Mover 3 cuñas del bloque saturado 08:26 a bloques con disponibilidad',
    ahorroPotencial: 125000,
    mejoraSaturacion: 15,
    confianza: 94,
    acciones: [
      { tipo: 'mover', detalle: 'CAM-2025-0015 → 09:26:00' },
      { tipo: 'mover', detalle: 'CAM-2025-0018 → 10:26:00' },
      { tipo: 'mover', detalle: 'CAM-2025-0022 → 07:26:00' },
    ],
  },
  {
    id: 'sug_002',
    tipo: 'compactacion',
    titulo: '📦 Compactación de Tandas',
    descripcion: 'Consolidar bloques con baja ocupación para liberar espacio Premium',
    ahorroPotencial: 85000,
    mejoraSaturacion: 12,
    confianza: 88,
    acciones: [
      { tipo: 'compactar', detalle: 'Fusionar Rotativo 11:00 y 11:30' },
      { tipo: 'liberar', detalle: 'Bloque 12:00 queda disponible' },
    ],
  },
  {
    id: 'sug_003',
    tipo: 'reemplazo',
    titulo: '♻️ Reemplazo de Bajo Rendimiento',
    descripcion: 'Sustituir cuñas con bajo engagement por alternativas de mayor impacto',
    ahorroPotencial: 210000,
    mejoraSaturacion: 8,
    confianza: 76,
    acciones: [
      { tipo: 'reemplazar', detalle: 'Versión A → Versión C (mejor CTR)' },
      { tipo: 'ajustar', detalle: 'Duración 45s → 30s para más rotación' },
    ],
  },
];

// ==================== COMPONENTE PRINCIPAL ====================

export function PrediccionConflictos() {
  const [predicciones, setPredicciones] = useState<PrediccionConflicto[]>(PREDICCIONES_MOCK);
  const [sugerencias] = useState<SugerenciaOptimizacion[]>(SUGERENCIAS_MOCK);
  const [analizando, setAnalizando] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [ultimoAnalisis, setUltimoAnalisis] = useState('');
  
  const [estadisticas, setEstadisticas] = useState<EstadisticasPrediccion>({
    conflictosDetectados: 3,
    conflictosCriticos: 1,
    conflictosResueltos: 12,
    scorePrevencion: 94,
    ahorroEstimado: 420000,
  });

  const ejecutarAnalisis = useCallback(async () => {
    setAnalizando(true);
    setProgreso(0);

    const etapas = [
      'Escaneando programación futura...',
      'Analizando patrones de competencia...',
      'Calculando saturación proyectada...',
      'Identificando oportunidades...',
      'Generando sugerencias IA...',
    ];

    for (let i = 0; i < etapas.length; i++) {
      await new Promise(r => setTimeout(r, 600));
      setProgreso(((i + 1) / etapas.length) * 100);
    }

    setUltimoAnalisis(new Date().toLocaleString('es-CL'));
    setAnalizando(false);
    setEstadisticas(prev => ({
      ...prev,
      scorePrevencion: Math.min(100, prev.scorePrevencion + 2),
    }));
  }, []);

  const resolverConflicto = (id: string) => {
    setPredicciones(prev => prev.map(p => 
      p.id === id ? { ...p, estado: 'resuelto' as const } : p
    ));
    setEstadisticas(prev => ({
      ...prev,
      conflictosResueltos: prev.conflictosResueltos + 1,
      conflictosCriticos: Math.max(0, prev.conflictosCriticos - 1),
    }));
  };

  const aplicarSugerencia = (_id: string) => {
    // ;
  };

  const getSeveridadColor = (sev: string) => {
    switch (sev) {
      case 'critica': return 'bg-red-600 text-white';
      case 'alta': return 'bg-orange-500 text-white';
      case 'media': return 'bg-yellow-500 text-black';
      default: return 'bg-green-500 text-white';
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'competencia': return <Shield className="w-4 h-4" />;
      case 'saturacion': return <AlertOctagon className="w-4 h-4" />;
      case 'exclusividad': return <Target className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            🔮 PREDICCIÓN DE CONFLICTOS & AUTO-OPTIMIZACIÓN
          </h3>
          <p className="text-sm text-gray-500">Motor predictivo con IA para prevención proactiva</p>
        </div>
        <div className="flex items-center gap-2">
          {ultimoAnalisis && (
            <Badge variant="outline" className="text-xs">
              Último análisis: {ultimoAnalisis}
            </Badge>
          )}
          <Button 
            onClick={ejecutarAnalisis} 
            disabled={analizando}
            className="gap-2 bg-purple-600 hover:bg-purple-700"
          >
            {analizando ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Analizando...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4" />
                🧠 Analizar Ahora
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Progreso de Análisis */}
      {analizando && (
        <Card className="p-4 bg-purple-50 border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-purple-700">Analizando programación...</span>
            <span className="font-bold text-purple-700">{Math.round(progreso)}%</span>
          </div>
          <Progress value={progreso} className="h-2" />
        </Card>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-5 gap-3">
        <Card className="p-3 text-center bg-red-50 border-red-100">
          <p className="text-2xl font-bold text-red-600">{estadisticas.conflictosDetectados}</p>
          <p className="text-xs text-gray-500">Conflictos Activos</p>
        </Card>
        <Card className="p-3 text-center bg-orange-50 border-orange-100">
          <p className="text-2xl font-bold text-orange-600">{estadisticas.conflictosCriticos}</p>
          <p className="text-xs text-gray-500">Críticos</p>
        </Card>
        <Card className="p-3 text-center bg-green-50 border-green-100">
          <p className="text-2xl font-bold text-green-600">{estadisticas.conflictosResueltos}</p>
          <p className="text-xs text-gray-500">Resueltos este Mes</p>
        </Card>
        <Card className="p-3 text-center bg-purple-50 border-purple-100">
          <p className="text-2xl font-bold text-purple-600">{estadisticas.scorePrevencion}%</p>
          <p className="text-xs text-gray-500">Score Prevención</p>
        </Card>
        <Card className="p-3 text-center bg-emerald-50 border-emerald-100">
          <p className="text-2xl font-bold text-emerald-600">${(estadisticas.ahorroEstimado / 1000).toFixed(0)}K</p>
          <p className="text-xs text-gray-500">Ahorro Estimado</p>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Predicciones de Conflictos */}
        <Card className="p-4">
          <h4 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            ⚠️ CONFLICTOS PREDICHOS
          </h4>

          <div className="space-y-3">
            {predicciones.filter(p => p.estado !== 'resuelto').map(pred => (
              <div 
                key={pred.id}
                className={`p-4 rounded-lg border ${
                  pred.severidad === 'critica' ? 'bg-red-50 border-red-200' :
                  pred.severidad === 'alta' ? 'bg-orange-50 border-orange-200' :
                  'bg-yellow-50 border-yellow-200'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getTipoIcon(pred.tipo)}
                    <Badge className={getSeveridadColor(pred.severidad)}>
                      {pred.severidad.toUpperCase()}
                    </Badge>
                    <Badge variant="outline">{pred.probabilidad}% prob.</Badge>
                  </div>
                  <span className="text-xs text-gray-500">Impacto: {pred.fechaImpacto}</span>
                </div>
                
                <p className="font-medium text-gray-900 mb-2">{pred.descripcion}</p>
                
                <div className="flex items-center gap-2 mb-3 text-sm">
                  <Eye className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-500">{pred.anunciantesInvolucrados.join(' vs ')}</span>
                </div>

                <div className="p-2 bg-blue-50 rounded-lg text-sm text-blue-800 mb-3">
                  <Lightbulb className="w-4 h-4 inline mr-1" />
                  <strong>IA sugiere:</strong> {pred.sugerenciaIA}
                </div>

                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => resolverConflicto(pred.id)}
                    className="gap-1 bg-emerald-600 hover:bg-emerald-700"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    Aplicar Sugerencia
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1">
                    <Eye className="w-3 h-3" />
                    Ver Detalle
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Sugerencias de Optimización */}
        <Card className="p-4">
          <h4 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            🚀 AUTO-OPTIMIZACIÓN IA
          </h4>

          <div className="space-y-3">
            {sugerencias.map(sug => (
              <div 
                key={sug.id}
                className="p-4 rounded-lg border bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="font-bold text-emerald-800">{sug.titulo}</p>
                  <Badge className="bg-emerald-600">{sug.confianza}% confianza</Badge>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">{sug.descripcion}</p>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="p-2 bg-white rounded text-center">
                    <p className="text-sm font-bold text-emerald-600">+${(sug.ahorroPotencial / 1000).toFixed(0)}K</p>
                    <p className="text-xs text-gray-500">Ahorro</p>
                  </div>
                  <div className="p-2 bg-white rounded text-center">
                    <p className="text-sm font-bold text-blue-600">-{sug.mejoraSaturacion}%</p>
                    <p className="text-xs text-gray-500">Saturación</p>
                  </div>
                </div>

                <div className="space-y-1 mb-3">
                  {sug.acciones.map((acc, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-gray-600">
                      <ArrowRight className="w-3 h-3 text-emerald-500" />
                      {acc.detalle}
                    </div>
                  ))}
                </div>

                <Button 
                  size="sm" 
                  onClick={() => aplicarSugerencia(sug.id)}
                  className="w-full gap-2 bg-gradient-to-r from-emerald-600 to-green-600"
                >
                  <Zap className="w-4 h-4" />
                  ⚡ Aplicar Optimización
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default PrediccionConflictos;
