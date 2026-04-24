/**
 * SpeechTimingAnalysisService
 * Servicio para análisis de texto de locución y cálculo de tiempos
 * Analiza velocidad, complejidad, elementos especiales y genera sugerencias
 */

import { Result } from '@/modules/shared/domain/Result';

export interface TimingAnalysisResult {
    // Métricas básicas
    wordCount: number;
    characterCount: number;
    syllableCount: number;

    // Tiempos calculados
    baseWPM: number; // Velocidad base estándar
    adjustedWPM: number; // Velocidad ajustada por complejidad
    estimatedSeconds: number;
    timeRange: { min: number; max: number };

    // Análisis de complejidad
    complexityLevel: 'low' | 'medium' | 'high';
    complexityFactors: {
        numbersCount: number;
        brandNamesCount: number;
        foreignWordsCount: number;
        acronymsCount: number;
        punctuationCount: number;
    };

    // Elementos especiales detectados
    specialElements: {
        emphasis: number;
        pauses: number;
        spelling: number;
        pronunciation: number;
    };

    // Elementos especiales con detalle
    elementsDetail: Array<{
        type: 'emphasis' | 'pause' | 'spelling' | 'pronunciation';
        text: string;
        estimatedTime: number;
        position: number;
    }>;

    // Sugerencias
    suggestions: string[];
    optimalSpeed: 'slow' | 'normal' | 'fast';
}

export interface TextToSpeechOptions {
    voice?: string;
    speed?: number;
    pitch?: number;
    volume?: number;
    emotion?: 'enthusiastic' | 'serious' | 'friendly' | 'professional';
    ssmlEnabled?: boolean;
}

export class SpeechTimingAnalysisService {
    // Palabras por minuto estándar para radio comercial
    private readonly BASE_WPM = 150;

    // Ajustes por complejidad
    private readonly COMPLEXITY_PENALTIES = {
        numbers: 15, // Por cada 3+ números
        brandNames: 10, // Por cada 2+ nombres de marca
        foreignWords: 20, // Por palabra extranjera
        acronyms: 10, // Por cada 2+ acrónimos
    };

    // Tiempos adicionales por elemento especial (segundos)
    private readonly ELEMENT_TIMES = {
        emphasis: 0.5,
        pause: 1.0,
        spelling: 3.0, // Por cada caracter deletreado
        pronunciation: 0.5,
    };

    // Marcas de elementos especiales en texto
    private readonly MARKERS = {
        emphasisStart: /\[ÉNFASIS\]/gi,
        emphasisEnd: /\[\/ÉNFASIS\]/gi,
        pause: /\[PAUSA:(\d+(?:\.\d+)?)s?\]/gi,
        spellingStart: /\[DELETREO\]/gi,
        spellingEnd: /\[\/DELETREO\]/gi,
        pronunciationStart: /\[PRONUNCIAR\]/gi,
        pronunciationEnd: /\[\/PRONUNCIAR\]/gi,
    };

    /**
     * Analiza texto de locución y calcula tiempos estimados
     */
    analyzeTextForSpeech(text: string): Result<TimingAnalysisResult> {
        try {
            // Limpiar y normalizar texto (remover marcadores para análisis)
            const cleanText = text
                .replace(/\[ÉNFASIS\]/gi, '')
                .replace(/\[\/ÉNFASIS\]/gi, '')
                .replace(/\[PAUSA:\d+(?:\.\d+)?s?\]/gi, ' ')
                .replace(/\[DELETREO\]/gi, '')
                .replace(/\[\/DELETREO\]/gi, '')
                .replace(/\[PRONUNCIAR\]/gi, '')
                .replace(/\[\/PRONUNCIAR\]/gi, ' ')
                .replace(/[.?;,]/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();

            // Análisis básico
            const words = cleanText.split(/\s+/).filter(Boolean);
            const wordCount = words.length;
            const characterCount = cleanText.length;

            // Contar sílabas (aproximación)
            const syllableCount = this.countSyllables(cleanText);

            // Detectar elementos especiales
            const specialElements = this.detectSpecialElements(text);

            // Calcular complejidad
            const complexityFactors = this.analyzeComplexity(text);

            // Calcular velocidad ajustada
            let adjustedWPM = this.BASE_WPM;

            if (complexityFactors.numbersCount > 3) adjustedWPM -= this.COMPLEXITY_PENALTIES.numbers;
            if (complexityFactors.brandNamesCount > 2) adjustedWPM -= this.COMPLEXITY_PENALTIES.brandNames;
            if (complexityFactors.foreignWordsCount > 0) adjustedWPM -= this.COMPLEXITY_PENALTIES.foreignWords;
            if (complexityFactors.acronymsCount > 1) adjustedWPM -= this.COMPLEXITY_PENALTIES.acronyms;

            adjustedWPM = Math.max(100, adjustedWPM); // Mínimo 100 WPM

            // Calcular tiempo base de lectura
            const baseReadingTime = (wordCount / adjustedWPM) * 60;

            // Calcular tiempo adicional por elementos especiales
            let additionalTime = 0;
            additionalTime += specialElements.emphasis * this.ELEMENT_TIMES.emphasis;
            additionalTime += specialElements.pauses * this.ELEMENT_TIMES.pause;
            additionalTime += specialElements.spelling * this.ELEMENT_TIMES.spelling;
            additionalTime += specialElements.pronunciation * this.ELEMENT_TIMES.pronunciation;

            // Tiempo total estimado
            const totalTime = baseReadingTime + additionalTime;

            // Rango de variación (±15% para variabilidad humana)
            const minTime = Math.ceil(totalTime * 0.85);
            const maxTime = Math.ceil(totalTime * 1.15);

            // Determinar nivel de complejidad
            const complexityScore =
                (complexityFactors.numbersCount > 3 ? 2 : 0) +
                (complexityFactors.brandNamesCount > 2 ? 1 : 0) +
                (complexityFactors.foreignWordsCount > 0 ? 2 : 0) +
                (complexityFactors.acronymsCount > 1 ? 1 : 0) +
                (complexityFactors.punctuationCount > 10 ? 1 : 0);

            let complexityLevel: 'low' | 'medium' | 'high' = 'low';
            if (complexityScore >= 5) complexityLevel = 'high';
            else if (complexityScore >= 2) complexityLevel = 'medium';

            // Generar sugerencias
            const suggestions = this.generateSuggestions(text, complexityFactors, adjustedWPM);

            // Determinar velocidad óptima
            let optimalSpeed: 'slow' | 'normal' | 'fast' = 'normal';
            if (complexityLevel === 'high') optimalSpeed = 'slow';
            else if (wordCount <= 20 && complexityLevel === 'low') optimalSpeed = 'fast';

            return Result.ok({
                wordCount,
                characterCount,
                syllableCount,
                baseWPM: this.BASE_WPM,
                adjustedWPM: Math.round(adjustedWPM),
                estimatedSeconds: Math.ceil(totalTime),
                timeRange: { min: minTime, max: maxTime },
                complexityLevel,
                complexityFactors,
                specialElements,
                elementsDetail: this.getElementsDetail(text),
                suggestions,
                optimalSpeed,
            });
        } catch (error) {
            return Result.fail(error instanceof Error ? error.message : 'Error analizanding texto');
        }
    }

    /**
     * Cuenta sílabas aproximadas en el texto
     */
    private countSyllables(text: string): number {
        // Implementación simplificada - en producción usaría algoritmo más sofisticado
        const words = text.split(/\s+/).filter(Boolean);
        let totalSyllables = 0;

        for (const word of words) {
            // Contar vocales como aproximación de sílabas
            const vowels = (word.match(/[aeiouáéíóúü]/gi) || []).length;
            totalSyllables += Math.max(1, Math.ceil(vowels / 2));
        }

        return totalSyllables;
    }

    /**
     * Detecta elementos especiales en el texto
     */
    private detectSpecialElements(text: string): {
        emphasis: number;
        pauses: number;
        spelling: number;
        pronunciation: number;
    } {
        const emphasisMatches = text.match(/\[ÉNFASIS\]/gi) || [];
        const pauseMatches = text.match(/\[PAUSA:\d+(?:\.\d+)?s?\]/gi) || [];
        const spellingMatches = text.match(/\[DELETREO\]/gi) || [];
        const pronunciationMatches = text.match(/\[PRONUNCIAR\]/gi) || [];

        return {
            emphasis: emphasisMatches.length,
            pauses: pauseMatches.length,
            spelling: spellingMatches.length,
            pronunciation: pronunciationMatches.length,
        };
    }

    /**
     * Obtiene detalle de los elementos especiales
     */
    private getElementsDetail(text: string): Array<{
        type: 'emphasis' | 'pause' | 'spelling' | 'pronunciation';
        text: string;
        estimatedTime: number;
        position: number;
    }> {
        const elements: Array<{
            type: 'emphasis' | 'pause' | 'spelling' | 'pronunciation';
            text: string;
            estimatedTime: number;
            position: number;
        }> = [];

        // Detectar énfasis
        let emphasisMatch;
        const emphasisRegex = /\[ÉNFASIS\](.*?)\[\/ÉNFASIS\]/gi;
        while ((emphasisMatch = emphasisRegex.exec(text)) !== null) {
            elements.push({
                type: 'emphasis',
                text: emphasisMatch[1],
                estimatedTime: this.ELEMENT_TIMES.emphasis,
                position: emphasisMatch.index,
            });
        }

        // Detectar pausas
        let pauseMatch;
        const pauseRegex = /\[PAUSA:(\d+(?:\.\d+)?)\]/gi;
        while ((pauseMatch = pauseRegex.exec(text)) !== null) {
            elements.push({
                type: 'pause',
                text: `Pausa ${pauseMatch[1]}s`,
                estimatedTime: parseFloat(pauseMatch[1]),
                position: pauseMatch.index,
            });
        }

        // Detectar deletreo
        let spellingMatch;
        const spellingRegex = /\[DELETREO\](.*?)\[\/DELETREO\]/gi;
        while ((spellingMatch = spellingRegex.exec(text)) !== null) {
            elements.push({
                type: 'spelling',
                text: spellingMatch[1],
                estimatedTime: spellingMatch[1].length * 0.3 + this.ELEMENT_TIMES.spelling,
                position: spellingMatch.index,
            });
        }

        // Detectar pronunciación
        let pronunciationMatch;
        const pronunciationRegex = /\[PRONUNCIAR\](.*?)\[\/PRONUNCIAR\]/gi;
        while ((pronunciationMatch = pronunciationRegex.exec(text)) !== null) {
            elements.push({
                type: 'pronunciation',
                text: pronunciationMatch[1],
                estimatedTime: this.ELEMENT_TIMES.pronunciation,
                position: pronunciationMatch.index,
            });
        }

        return elements.sort((a, b) => a.position - b.position);
    }

    /**
     * Analiza complejidad del texto
     */
    private analyzeComplexity(text: string): {
        numbersCount: number;
        brandNamesCount: number;
        foreignWordsCount: number;
        acronymsCount: number;
        punctuationCount: number;
    } {
        const numbers = text.match(/\d+/g) || [];
        const foreignWords = text.match(/\b(king|queen|week|weekend|street|avenue|office|department|computer|internet|email|web|web site|shopping|cart|check out|cancel|download|upload|login|logout|user|password|account|software|hardware|download|online|offline)\b/gi) || [];
        const acronyms = text.match(/\b[A-Z]{2,}\b/g) || [];
        const punctuation = text.match(/[.!?;,:]/g) || [];

        return {
            numbersCount: numbers.length,
            brandNamesCount: 0, // En producción usaría IA o base de datos
            foreignWordsCount: foreignWords.length,
            acronymsCount: acronyms.length,
            punctuationCount: punctuation.length,
        };
    }

    /**
     * Genera sugerencias para mejorar la locución
     */
    private generateSuggestions(
        text: string,
        complexityFactors: { numbersCount: number; brandNamesCount: number; foreignWordsCount: number; acronymsCount: number },
        adjustedWPM: number
    ): string[] {
        const suggestions: string[] = [];

        if (complexityFactors.numbersCount > 3) {
            suggestions.push('Considera simplificar los números o gruparlos para mejor comprensión');
        }

        if (complexityFactors.foreignWordsCount > 0) {
            suggestions.push('Las palabras en inglés requieren más tiempo - considera traducirlas o deletrearlas');
        }

        if (complexityFactors.acronymsCount > 1) {
            suggestions.push('Los acrónimos son difíciles de pronunciar - considera expandir los más importantes');
        }

        if (adjustedWPM < 130) {
            suggestions.push('Velocidad reducida recomendada debido a la complejidad del texto');
        }

        if (!text.includes('[')) {
            suggestions.push('Añade pausas estratégicas con [PAUSA:X] para mejor ritmo');
            suggestions.push('Usa [ÉNFASIS] para destacar palabras clave');
        }

        return suggestions;
    }

    /**
     * Verifica si el texto es apropiado para locución
     */
    validateTextForSpeech(text: string): Result<{
        valid: boolean;
        issues: string[];
        recommendations: string[];
    }> {
        const issues: string[] = [];
        const recommendations: string[] = [];

        if (text.length < 10) {
            issues.push('Texto demasiado corto');
        }

        if (text.length > 2000) {
            issues.push('Texto demasiado largo - considera dividirlo');
        }

        const analysis = this.analyzeTextForSpeech(text);
        if (Result.isOk(analysis)) {
            const result = analysis.data;

            if (result.estimatedSeconds > 120) {
                issues.push('Duración estimada exceeds 2 minutos');
            }

            if (result.estimatedSeconds < 5) {
                issues.push('Duración estimada muy corta');
            }

            if (result.complexityLevel === 'high') {
                recommendations.push('Texto complejo detectado - considera simplificar o ralentizar');
            }

            if (result.specialElements.emphasis === 0) {
                recommendations.push('Sin énfasis detectado - añade [ÉNFASIS] para destacar puntos clave');
            }
        }

        return Result.ok({
            valid: issues.length === 0,
            issues,
            recommendations,
        });
    }

    /**
     * Formatea texto con marcadores SSML para síntesis de voz
     */
    formatTextForSSML(text: string): string {
        // Convertir marcadores personalizados a SSML
        return text
            // Énfasis
            .replace(/\[ÉNFASIS\](.*?)\[\/ÉNFASIS\]/g, '<emphasis level="strong">$1</emphasis>')
            // Pausas
            .replace(/\[PAUSA:(\d+(?:\.\d+)?)\]/g, '<break time="$1 seconds"/>')
            // Pronunciación
            .replace(/\[PRONUNCIAR\](.*?)\[\/PRONUNCIAR\]/g, '<phoneme alphabet="x-ipa" ph="$1">placeholder</phoneme>')
            // Envolver en speak
            .replace(/^(?!<speak>)/, '<speak>')
            .replace(/(?<!<\/speak>)$/, '</speak>');
    }
}

// Singleton instance
export const speechTimingAnalysisService = new SpeechTimingAnalysisService();
