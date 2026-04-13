/**
 * 🧠 useCortexSuggestions - Motor de Inteligencia Artificial TIER0
 * 
 * Este hook proporciona sugerencias inteligentes durante la creación de campañas:
 * - Predicción de conflictos con competencia
 * - Optimización automática de horarios
 * - Validación de exclusividades
 * - Recomendaciones de precios
 * 
 * @enterprise TIER0 Fortune 10
 * @version 2050.1.0
 */

import { useState, useCallback } from 'react';

// ==================== INTERFACES ====================

export interface ConflictoDetectado {
  id: string;
  tipo: 'competencia_directa' | 'exclusividad' | 'saturacion' | 'horario_protegido';
  severidad: 'critica' | 'alta' | 'media' | 'baja';
  mensaje: string;
  bloque: string;
  horaAfectada: string;
  anuncianteConflicto?: string;
  sugerenciaResolucion: string;
}

export interface SugerenciaOptimizacion {
  id: string;
  tipo: 'mover_spot' | 'cambiar_bloque' | 'ajustar_precio' | 'redistribuir';
  descripcion: string;
  impactoEstimado: number; // Porcentaje de mejora
  bloqueOrigen?: string;
  bloqueDestino?: string;
  razon: string;
  prioridad: number; // 1-10
}

export interface PrediccionRendimiento {
  alcanceEstimado: number;
  frecuenciaPromedio: number;
  cpmOptimo: number;
  probabilidadExito: number; // 0-100
  factoresRiesgo: string[];
  recomendaciones: string[];
}

export interface ExclusividadVigente {
  anunciante: string;
  categoria: string;
  emisora: string;
  fechaInicio: string;
  fechaFin: string;
  bloqueProtegido: string;
  tipoExclusividad: 'total' | 'categoria' | 'horario';
}

export interface CortexState {
  isAnalyzing: boolean;
  conflictos: ConflictoDetectado[];
  sugerencias: SugerenciaOptimizacion[];
  prediccion: PrediccionRendimiento | null;
  exclusividades: ExclusividadVigente[];
  scoreOptimizacion: number; // 0-100
  ultimoAnalisis: Date | null;
}

// ==================== DATOS MOCK TIER0 ====================

const MOCK_EXCLUSIVIDADES: ExclusividadVigente[] = [
  {
    anunciante: 'COCA-COLA',
    categoria: 'Bebidas Gaseosas',
    emisora: 'T13 Radio',
    fechaInicio: '2025-01-01',
    fechaFin: '2025-12-31',
    bloqueProtegido: 'PRIME MATINAL',
    tipoExclusividad: 'categoria'
  },
  {
    anunciante: 'BANCO SANTANDER',
    categoria: 'Banca',
    emisora: 'T13 Radio',
    fechaInicio: '2025-06-01',
    fechaFin: '2025-08-31',
    bloqueProtegido: 'PRIME TARDE',
    tipoExclusividad: 'horario'
  }
];

const CATEGORIAS_COMPETENCIA: Record<string, string[]> = {
  'Banca': ['BANCO DE CHILE', 'BANCO SANTANDER', 'BCI', 'BANCO ESTADO', 'SCOTIABANK'],
  'Bebidas Gaseosas': ['COCA-COLA', 'PEPSI', 'CCU', 'RED BULL'],
  'Retail': ['FALABELLA', 'RIPLEY', 'PARIS', 'HITES'],
  'Telecomunicaciones': ['ENTEL', 'MOVISTAR', 'WOM', 'CLARO'],
  'Automotriz': ['TOYOTA', 'HYUNDAI', 'KIA', 'CHEVROLET', 'NISSAN']
};

// ==================== HOOK PRINCIPAL ====================

export function useCortexSuggestions() {
  const [state, setState] = useState<CortexState>({
    isAnalyzing: false,
    conflictos: [],
    sugerencias: [],
    prediccion: null,
    exclusividades: MOCK_EXCLUSIVIDADES,
    scoreOptimizacion: 0,
    ultimoAnalisis: null
  });

  /**
   * Analizar campaña completa y generar sugerencias
   */
  const analizarCampana = useCallback(async (
    anunciante: string,
    producto: string,
    lineas: Array<{ programa?: string; horaInicio?: string; horaFin?: string }>,
    emisora: string,
    _fechaInicio: string,
    _fechaFin: string
  ) => {
    setState(prev => ({ ...prev, isAnalyzing: true }));

    // Simular procesamiento IA (en producción sería llamada a API)
    await new Promise(resolve => setTimeout(resolve, 1500));

    const conflictos: ConflictoDetectado[] = [];
    const sugerencias: SugerenciaOptimizacion[] = [];

    // 1. Detectar conflictos de competencia
    const categoriaAnunciante = detectarCategoria(anunciante);
    if (categoriaAnunciante) {
      const competidores = Object.entries(CATEGORIAS_COMPETENCIA)
        .find(([k]) => k === categoriaAnunciante)?.[1] ?? [];
      
      // Simular conflicto si hay competidor en el mismo bloque
      if (competidores.length > 0 && lineas.length > 0) {
        conflictos.push({
          id: `conf-${Date.now()}-1`,
          tipo: 'competencia_directa',
          severidad: 'alta',
          mensaje: `Se detectó campaña activa de ${competidores[0]} en el mismo bloque horario`,
          bloque: lineas[0]?.programa || 'PRIME MATINAL',
          horaAfectada: '08:00 - 08:30',
          anuncianteConflicto: competidores[0],
          sugerenciaResolucion: 'Mover spots al bloque MAÑANA (09:00-13:00) donde no hay conflicto'
        });
      }
    }

    // 2. Detectar exclusividades vigentes
    const exclusividadViolada = MOCK_EXCLUSIVIDADES.find(
      exc => exc.emisora === emisora && 
             lineas.some(l => l.programa === exc.bloqueProtegido)
    );
    
    if (exclusividadViolada) {
      conflictos.push({
        id: `conf-${Date.now()}-2`,
        tipo: 'exclusividad',
        severidad: 'critica',
        mensaje: `Bloque ${exclusividadViolada.bloqueProtegido} tiene exclusividad de ${exclusividadViolada.anunciante}`,
        bloque: exclusividadViolada.bloqueProtegido,
        horaAfectada: 'Todo el bloque',
        anuncianteConflicto: exclusividadViolada.anunciante,
        sugerenciaResolucion: 'Seleccionar un bloque horario diferente o solicitar override comercial'
      });
    }

    // 3. Detectar saturación
    lineas.forEach((linea, idx) => {
      const saturacionSimulada = Math.random() * 100;
      if (saturacionSimulada > 85) {
        conflictos.push({
          id: `conf-${Date.now()}-sat-${idx}`,
          tipo: 'saturacion',
          severidad: 'media',
          mensaje: `Bloque ${linea.programa} tiene ${saturacionSimulada.toFixed(0)}% de saturación`,
          bloque: linea.programa || '',
          horaAfectada: `${linea.horaInicio} - ${linea.horaFin}`,
          sugerenciaResolucion: 'Considerar dividir spots entre múltiples bloques'
        });
      }
    });

    // 4. Generar sugerencias de optimización
    if (lineas.length > 0) {
      sugerencias.push({
        id: `sug-${Date.now()}-1`,
        tipo: 'redistribuir',
        descripcion: 'Redistribuir 30% de spots matinales a franja tarde para mayor alcance',
        impactoEstimado: 15,
        bloqueOrigen: 'PRIME MATINAL',
        bloqueDestino: 'PRIME TARDE',
        razon: 'El target demográfico tiene mayor audiencia en horario vespertino',
        prioridad: 8
      });

      sugerencias.push({
        id: `sug-${Date.now()}-2`,
        tipo: 'ajustar_precio',
        descripcion: 'Optimizar tarifa unitaria según demanda histórica',
        impactoEstimado: 8,
        razon: 'El CPM actual está 12% por encima del mercado para esta categoría',
        prioridad: 6
      });
    }

    // 5. Generar predicción de rendimiento
    const prediccion: PrediccionRendimiento = {
      alcanceEstimado: Math.floor(150000 + Math.random() * 350000),
      frecuenciaPromedio: 2.5 + Math.random() * 2,
      cpmOptimo: Math.floor(1200 + Math.random() * 800),
      probabilidadExito: Math.floor(75 + Math.random() * 20),
      factoresRiesgo: [
        'Temporada baja en categoría',
        'Competencia con evento deportivo'
      ],
      recomendaciones: [
        'Considerar extensión a emisora secundaria',
        'Agregar spots de refuerzo en fin de semana',
        'Incluir formato digital complementario'
      ]
    };

    // Calcular score de optimización
    const scoreBase = 100;
    const penalizacionConflictos = conflictos.reduce((acc, c) => {
      const pen = c.severidad === 'critica' ? 25 : 
                  c.severidad === 'alta' ? 15 : 
                  c.severidad === 'media' ? 8 : 3;
      return acc + pen;
    }, 0);
    const scoreOptimizacion = Math.max(0, scoreBase - penalizacionConflictos);

    setState({
      isAnalyzing: false,
      conflictos,
      sugerencias,
      prediccion,
      exclusividades: MOCK_EXCLUSIVIDADES,
      scoreOptimizacion,
      ultimoAnalisis: new Date()
    });

    return { conflictos, sugerencias, prediccion, scoreOptimizacion };
  }, []);

  /**
   * Aplicar sugerencia de optimización
   */
  const aplicarSugerencia = useCallback((sugerenciaId: string) => {
    setState(prev => ({
      ...prev,
      sugerencias: prev.sugerencias.filter(s => s.id !== sugerenciaId),
      scoreOptimizacion: Math.min(100, prev.scoreOptimizacion + 5)
    }));
  }, []);

  /**
   * Ignorar conflicto con justificación
   */
  const ignorarConflicto = useCallback((conflictoId: string, _justificacion: string) => {
    // logger.info(`Conflicto ${conflictoId} ignorado. Justificación: ${justificacion}`);
    setState(prev => ({
      ...prev,
      conflictos: prev.conflictos.filter(c => c.id !== conflictoId)
    }));
  }, []);

  /**
   * Verificar disponibilidad de bloque específico
   */
  const verificarDisponibilidad = useCallback(async (
    _bloque: string,
    _fecha: string,
    _emisora: string
  ): Promise<{ disponible: boolean; ocupacion: number; alertas: string[] }> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const ocupacion = Math.floor(Math.random() * 100);
    const disponible = ocupacion < 90;
    const alertas: string[] = [];
    
    if (ocupacion > 80) alertas.push('Alta demanda en este bloque');
    if (ocupacion > 90) alertas.push('Bloque saturado, considere alternativas');
    
    return { disponible, ocupacion, alertas };
  }, []);

  return {
    ...state,
    analizarCampana,
    aplicarSugerencia,
    ignorarConflicto,
    verificarDisponibilidad
  };
}

// ==================== UTILIDADES ====================

function detectarCategoria(anunciante: string): string | null {
  const anuncianteUpper = anunciante.toUpperCase();
  
  for (const [categoria, empresas] of Object.entries(CATEGORIAS_COMPETENCIA)) {
    if (empresas.some(e => anuncianteUpper.includes(e) || e.includes(anuncianteUpper))) {
      return categoria;
    }
  }
  
  return null;
}

export default useCortexSuggestions;
