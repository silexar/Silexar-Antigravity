/**
 * 🧠 SILEXAR PULSE - Hook de Análisis de Guiones de Radio TIER 0
 * 
 * Motor de análisis lingüístico para estimación de tiempos y complejidad
 * de locución comercial.
 * 
 * @version 2050.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { useState, useCallback, useEffect } from 'react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export interface ScriptAnalysis {
  wordCount: number;
  characterCount: number;
  syllableCount: number;
  
  // Métricas de tiempo
  baseWPM: number;
  adjustedWPM: number;
  estimatedSeconds: number;
  timeRange: {
    min: number;
    max: number;
  };
  
  // Complejidad
  complexityScore: number; // 0-100
  complexityLevel: 'baja' | 'media' | 'alta' | 'muy_alta';
  
  // Elementos especiales detectados
  elements: {
    pauses: number;
    emphasis: number;
    spelling: number;
    numbers: number;
    brands: number;
    acronyms: number;
    punctuation: number;
  };
  
  // Feedback
  suggestions: string[];
}

export interface ScriptAnalysisOptions {
  targetWPM?: number; // Velocidad objetivo (default 150 para radio)
  brandNames?: string[]; // Nombres de marca a detectar para énfasis
}

// ═══════════════════════════════════════════════════════════════
// UTILIDADES LINGÜÍSTICAS (Simplificadas para demo)
// ═══════════════════════════════════════════════════════════════

const countSyllables = (text: string): number => {
  // Aproximación heurística para español
  // 1. Limpiar texto
  const clean = text.toLowerCase().replace(/[^a-zñáéíóúü\s]/g, '');
  if (!clean) return 0;
  
  // 2. Contar vocales (aproximación muy básica pero funcional para estimación)
  // En una imp. real usaríamos un silabeador completo
  const vowels = clean.match(/[aeiouáéíóúü]/g);
  return vowels ? vowels.length : 0;
};

// ═══════════════════════════════════════════════════════════════
// HOOK PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export function useScriptAnalysis(
  initialText: string = '', 
  options: ScriptAnalysisOptions = {}
) {
  const [text, setText] = useState(initialText);
  const [analysis, setAnalysis] = useState<ScriptAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { targetWPM = 150, brandNames = [] } = options;

  // Función de análisis core
  const analyzeText = useCallback((currentText: string) => {
    setIsAnalyzing(true);
    
    // 1. Limpieza y Normalización
    // Remover etiquetas para conteo de palabras base
    const cleanText = currentText.replace(/\[.*?\]/g, ' ').trim();
    if (!cleanText) {
      setAnalysis(null);
      setIsAnalyzing(false);
      return;
    }

    const words = cleanText.split(/\s+/).filter(Boolean);
    const syllables = countSyllables(cleanText);
    
    // 2. Detección de Elementos Especiales (en texto original)
    const specialElements = {
      emphasis: (currentText.match(/\[ÉNFASIS\]/gi) || []).length,
      pauses: (currentText.match(/\[PAUSA:.*?\]/gi) || []).length, // Ej: [PAUSA:1s]
      spelling: (currentText.match(/\[DELETREO\]/gi) || []).length,
      numbers: (cleanText.match(/\d+/g) || []).length,
      brands: 0,
      acronyms: (cleanText.match(/[A-Z]{2,}/g) || []).length,
      punctuation: (cleanText.match(/[.!?;,:]/g) || []).length
    };

    // Detectar marcas
    if (brandNames.length > 0) {
      const brandRegex = new RegExp(brandNames.join('|'), 'gi');
      specialElements.brands = (cleanText.match(brandRegex) || []).length;
    }

    // 3. Extracción de duración de pausas explícitas
    let explicitPauseSeconds = 0;
    const pauseMatches = currentText.match(/\[PAUSA:(\d+(?:\.\d+)?)s?\]/gi);
    if (pauseMatches) {
      pauseMatches.forEach(match => {
        const seconds = parseFloat(match.replace(/[^0-9.]/g, ''));
        if (!isNaN(seconds)) explicitPauseSeconds += seconds;
      });
    }

    // 4. Cálculo de Velocidad Ajustada (WPM)
    let adjustedWPM = targetWPM;
    
    // Penalizaciones por complejidad (según requerimientos Enterprise)
    if (specialElements.numbers > 3) adjustedWPM -= 15; // >3 números baja 15 WPM
    if (specialElements.brands > 2) adjustedWPM -= 10; // >2 marcas baja 10 WPM
    if (specialElements.acronyms > 1) adjustedWPM -= 10; // >1 siglas baja 10 WPM
    
    // Penalización por palabras largas (heurística adicional)
    if (syllables / words.length > 3.5) adjustedWPM -= 5;
    
    // 5. Estimación de Tiempo
    // Tiempo base de lectura
    const baseReadingTime = (words.length / adjustedWPM) * 60;
    
    // Tiempo adicional por efectos
    let effectsTime = 0;
    effectsTime += specialElements.emphasis * 0.5; // 0.5s extra por énfasis
    effectsTime += specialElements.spelling * 3;   // 3.0s extra por deletreo
    effectsTime += explicitPauseSeconds;
    
    const totalEstimatedSeconds = baseReadingTime + effectsTime;
    
    // 6. Nivel de Complejidad
    let complexityScore = 50; // Base
    complexityScore += specialElements.numbers * 5;
    complexityScore += specialElements.spelling * 15;
    complexityScore += specialElements.acronyms * 8;
    complexityScore += (syllables / words.length > 3) ? 10 : 0;
    if (adjustedWPM < 130) complexityScore += 10;
    
    let complexityLevel: ScriptAnalysis['complexityLevel'] = 'media';
    if (complexityScore < 40) complexityLevel = 'baja';
    else if (complexityScore > 70) complexityLevel = 'alta';
    else if (complexityScore > 85) complexityLevel = 'muy_alta';

    // 7. Generación de Sugerencias
    const suggestions: string[] = [];
    
    if (adjustedWPM > 165) suggestions.push("El texto es muy denso, considera simplificar frases.");
    if (specialElements.numbers > 3 && specialElements.pauses === 0) suggestions.push("Muchos números detectados. Considera añadir [PAUSA] entre cifras.");
    if (totalEstimatedSeconds > 30 && totalEstimatedSeconds < 35) suggestions.push("Estás cerca del límite de 30s. Reduce 5-8 palabras.");
    if (brandNames.length > 0 && specialElements.brands === 0) suggestions.push("No has mencionado la marca. Añade el nombre del anunciante.");
    if (specialElements.acronyms > 2) suggestions.push("Exceso de siglas puede dificultar la lectura fluida.");
    
    // Resultado final
    setAnalysis({
      wordCount: words.length,
      characterCount: currentText.length,
      syllableCount: syllables,
      baseWPM: targetWPM,
      adjustedWPM: Math.round(adjustedWPM),
      estimatedSeconds: Math.ceil(totalEstimatedSeconds),
      timeRange: {
        min: Math.floor(totalEstimatedSeconds * 0.85), // -15% variación
        max: Math.ceil(totalEstimatedSeconds * 1.15)   // +15% variación
      },
      complexityScore: Math.min(100, Math.max(0, complexityScore)),
      complexityLevel,
      elements: specialElements,
      suggestions
    });
    
    setIsAnalyzing(false);
  }, [targetWPM, brandNames]);

  // Debounce para análisis automático al escribir
  useEffect(() => {
    const timer = setTimeout(() => {
      analyzeText(text);
    }, 500); // 500ms debounce
    
    return () => clearTimeout(timer);
  }, [text, analyzeText]);

  // Acciones para insertar etiquetas
  const insertTag = useCallback((tag: string, param?: string) => {
    let tagText = '';
    switch (tag) {
      case 'PAUSA':
        tagText = ` [PAUSA:${param || '1'}s] `;
        break;
      case 'ENFASIS':
        tagText = ` [ÉNFASIS]texto[/ÉNFASIS] `;
        break;
      case 'DELETREO':
        tagText = ` [DELETREO]texto[/DELETREO] `;
        break;
    }
    
    // Nota: La inserción real en la posición del cursor se maneja en el componente visual
    // Aquí solo actualizamos el estado si se usa directante, pero lo normal es que el
    // componente editor maneje la inserción y llame a setText.
    return tagText;
  }, []);

  return {
    text,
    setText,
    analysis,
    isAnalyzing,
    analyzeText,
    insertTag
  };
}

export default useScriptAnalysis;
