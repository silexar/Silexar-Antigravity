/**
 * COMPONENT: EDITOR DE MENCIONES CON ANÁLISIS IA
 * 
 * Editor de texto para menciones (locuciones) con análisis automático:
 * - Análisis de velocidad de locución (WPM)
 * - Detección de palabras complejas
 * - Identificación de marcas y números
 * - Marcadores de énfasis y pausa
 * - Sugerencias de optimización
 * - Preview de texto a voz
 * 
 * Diseño neumórfico mobile-first
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { NeumorphicCard, NeumorphicButton } from './NeumorphicComponents';
import { Result } from '@/modules/shared/domain/Result';
import { SpeechTimingAnalysisService } from '@/modules/cunas/infrastructure/external/SpeechTimingAnalysisService';

interface MencionAnalysis {
    palabras: number;
    wpmEstimado: number;
    duracionEstimada: number;
    complejidad: 'baja' | 'media' | 'alta';
    factoresComplejidad: string[];
    sugerencias: string[];
    textoProcesado: string;
}

interface Marker {
    inicio: number;
    fin: number;
    tipo: 'enfasis' | 'pausa' | 'nombre_marca' | 'numero' | 'cita';
    texto: string;
}

interface EditorMencionesIAProps {
    textoInicial?: string;
    tipo?: 'mencion' | 'auspicio' | 'cierre';
    onSave?: (texto: string, analysis: MencionAnalysis) => void;
    onCancel?: () => void;
    readOnly?: boolean;
}

export const EditorMencionesIA: React.FC<EditorMencionesIAProps> = ({
    textoInicial = '',
    tipo = 'mencion',
    onSave,
    onCancel,
    readOnly = false,
}) => {
    const [texto, setTexto] = useState(textoInicial);
    const [analysis, setAnalysis] = useState<MencionAnalysis | null>(null);
    const [markers, setMarkers] = useState<Marker[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [selectedRange, setSelectedRange] = useState<{ start: number; end: number } | null>(null);

    const speechService = new SpeechTimingAnalysisService();

    // Análisis automático cuando cambia el texto
    useEffect(() => {
        if (texto.trim()) {
            analyzeText();
        }
    }, [texto]);

    const analyzeText = useCallback(async () => {
        if (!texto.trim()) return;

        setIsAnalyzing(true);

        try {
            // Simular delay de análisis IA
            await new Promise(resolve => setTimeout(resolve, 300));

            const result = speechService.analyzeTextForSpeech(texto);

            if (Result.isOk(result) && result.data) {
                const r = result.data;
                setAnalysis({
                    palabras: r.wordCount,
                    wpmEstimado: r.adjustedWPM,
                    duracionEstimada: r.estimatedSeconds,
                    complejidad: (r.complexityLevel === 'low' ? 'baja' : r.complexityLevel === 'high' ? 'alta' : 'media'),
                    factoresComplejidad: [
                        r.complexityFactors.numbersCount > 0 ? `${r.complexityFactors.numbersCount} números` : null,
                        r.complexityFactors.brandNamesCount > 0 ? `${r.complexityFactors.brandNamesCount} nombres de marca` : null,
                        r.complexityFactors.foreignWordsCount > 0 ? `${r.complexityFactors.foreignWordsCount} palabras extranjeras` : null,
                    ].filter(Boolean) as string[],
                    sugerencias: r.suggestions,
                    textoProcesado: texto,
                });

                // Detectar marcadores especiales
                detectMarkers(texto);
            }
        } catch (error) {
            console.error('Error analyzing text:', error);
        } finally {
            setIsAnalyzing(false);
        }
    }, [texto, speechService]);

    const detectMarkers = (text: string) => {
        const foundMarkers: Marker[] = [];

        // Detectar énfasis [ENFATIZAR]...[/ENFATIZAR]
        const enfasisRegex = /\[ENFATIZAR\](.*?)\[\/ENFATIZAR\]/g;
        let match;
        while ((match = enfasisRegex.exec(text)) !== null) {
            foundMarkers.push({
                inicio: match.index,
                fin: match.index + match[0].length,
                tipo: 'enfasis',
                texto: match[1],
            });
        }

        // Detectar pausas [PAUSA:Xs]
        const pausaRegex = /\[PAUSA:(\d+(?:\.\d+)?)s?\]/g;
        while ((match = pausaRegex.exec(text)) !== null) {
            foundMarkers.push({
                inicio: match.index,
                fin: match.index + match[0].length,
                tipo: 'pausa',
                texto: match[1] + 's',
            });
        }

        // Detectar nombres de marca en MAYÚSCULAS
        const marcaRegex = /\b[A-Z]{3,}\b/g;
        while ((match = marcaRegex.exec(text)) !== null) {
            // Filtrar palabras comunes que no son marcas
            if (!['EL', 'LA', 'LOS', 'LAS', 'UNA', 'UNOS', 'CON', 'POR', 'PARA', 'DEL'].includes(match[0])) {
                foundMarkers.push({
                    inicio: match.index,
                    fin: match.index + match[0].length,
                    tipo: 'nombre_marca',
                    texto: match[0],
                });
            }
        }

        // Detectar números
        const numeroRegex = /\d+([.,]\d+)?/g;
        while ((match = numeroRegex.exec(text)) !== null) {
            foundMarkers.push({
                inicio: match.index,
                fin: match.index + match[0].length,
                tipo: 'numero',
                texto: match[0],
            });
        }

        setMarkers(foundMarkers);
    };

    const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newText = e.target.value;
        setTexto(newText);
    }, []);

    const insertEmphasis = useCallback(() => {
        if (selectedRange) {
            const before = texto.substring(0, selectedRange.start);
            const selected = texto.substring(selectedRange.start, selectedRange.end);
            const after = texto.substring(selectedRange.end);
            setTexto(`${before}[ENFATIZAR]${selected}[/ENFATIZAR]${after}`);
            setSelectedRange(null);
        }
    }, [texto, selectedRange]);

    const insertPause = useCallback((seconds: number = 1) => {
        const insertPos = selectedRange ? selectedRange.end : texto.length;
        const before = texto.substring(0, insertPos);
        const after = texto.substring(insertPos);
        setTexto(`${before}[PAUSA:${seconds}s]${after}`);
    }, [texto, selectedRange]);

    const handleSave = useCallback(() => {
        if (onSave && analysis) {
            onSave(texto, analysis);
        }
    }, [texto, analysis, onSave]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        // Atajos de teclado
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'b':
                    e.preventDefault();
                    insertEmphasis();
                    break;
                case 'p':
                    e.preventDefault();
                    insertPause();
                    break;
                case 'Enter':
                    e.preventDefault();
                    analyzeText();
                    break;
            }
        }
    }, [insertEmphasis, insertPause, analyzeText]);

    const getComplexityColor = (complejidad: string) => {
        switch (complejidad) {
            case 'baja': return 'text-green-500 bg-green-100 dark:bg-green-900';
            case 'media': return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900';
            case 'alta': return 'text-red-500 bg-red-100 dark:bg-red-900';
            default: return 'text-gray-500 bg-gray-100';
        }
    };

    return (
        <NeumorphicCard padding="lg" className="w-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                        🎤 Editor de Menciones
                    </h3>
                    <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded">
                        {tipo.toUpperCase()}
                    </span>
                </div>
                {isAnalyzing && (
                    <span className="text-sm text-primary animate-pulse">
                        🔄 Analizando...
                    </span>
                )}
            </div>

            {/* Text Editor */}
            <div className="mb-4">
                <textarea
                    value={texto}
                    onChange={handleTextChange}
                    onKeyDown={handleKeyDown}
                    onSelect={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        setSelectedRange({
                            start: target.selectionStart,
                            end: target.selectionEnd,
                        });
                    }}
                    readOnly={readOnly}
                    placeholder="Escribe o pega el texto de la mención aquí..."
                    className={`
                        w-full h-64 p-4 rounded-xl
                        bg-gray-50 dark:bg-gray-800
                        border-2 border-gray-200 dark:border-gray-700
                        focus:border-primary focus:outline-none
                        resize-none text-gray-800 dark:text-white
                        font-mono text-sm leading-relaxed
                        transition-colors
                    `}
                />

                {/* Quick Actions Toolbar */}
                {!readOnly && (
                    <div className="flex flex-wrap gap-2 mt-2">
                        <NeumorphicButton
                            variant="secondary"
                            size="sm"
                            onClick={insertEmphasis}
                            disabled={!selectedRange}
                        >
                            [ENFATIZAR]
                        </NeumorphicButton>

                        <NeumorphicButton
                            variant="secondary"
                            size="sm"
                            onClick={() => insertPause(0.5)}
                        >
                            ⏸️ 0.5s
                        </NeumorphicButton>

                        <NeumorphicButton
                            variant="secondary"
                            size="sm"
                            onClick={() => insertPause(1)}
                        >
                            ⏸️ 1s
                        </NeumorphicButton>

                        <NeumorphicButton
                            variant="secondary"
                            size="sm"
                            onClick={() => insertPause(2)}
                        >
                            ⏸️ 2s
                        </NeumorphicButton>

                        <NeumorphicButton
                            variant="secondary"
                            size="sm"
                            onClick={analyzeText}
                        >
                            🔄 Analizar
                        </NeumorphicButton>
                    </div>
                )}
            </div>

            {/* Analysis Results */}
            {analysis && (
                <>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-center">
                            <div className="text-2xl font-bold text-primary">{analysis.palabras}</div>
                            <div className="text-xs text-gray-500">Palabras</div>
                        </div>
                        <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-center">
                            <div className="text-2xl font-bold text-green-500">{analysis.wpmEstimado}</div>
                            <div className="text-xs text-gray-500">WPM</div>
                        </div>
                        <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-center">
                            <div className="text-2xl font-bold text-blue-500">{analysis.duracionEstimada}s</div>
                            <div className="text-xs text-gray-500">Duración</div>
                        </div>
                    </div>

                    {/* Complexity Badge */}
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Complejidad:</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getComplexityColor(analysis.complejidad)}`}>
                            {analysis.complejidad.toUpperCase()}
                        </span>
                    </div>

                    {/* Complexity Factors */}
                    {analysis.factoresComplejidad.length > 0 && (
                        <div className="mb-4">
                            <h4 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                                ⚠️ Factores de Complejidad
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {analysis.factoresComplejidad.map((factor, idx) => (
                                    <span
                                        key={idx}
                                        className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded text-xs"
                                    >
                                        {factor}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Suggestions */}
                    {analysis.sugerencias.length > 0 && (
                        <div className="mb-4">
                            <h4 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                                💡 Sugerencias
                            </h4>
                            <ul className="space-y-1">
                                {analysis.sugerencias.map((sugerencia, idx) => (
                                    <li
                                        key={idx}
                                        className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
                                    >
                                        <span className="text-primary">•</span>
                                        {sugerencia}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Markers Preview */}
                    {markers.length > 0 && (
                        <div className="mb-4">
                            <h4 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                                🏷️ Elementos Detectados
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {markers.map((marker, idx) => (
                                    <span
                                        key={idx}
                                        className={`
                                            px-2 py-1 rounded text-xs
                                            ${marker.tipo === 'enfasis' ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300' : ''}
                                            ${marker.tipo === 'pausa' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : ''}
                                            ${marker.tipo === 'nombre_marca' ? 'bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300' : ''}
                                            ${marker.tipo === 'numero' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' : ''}
                                        `}
                                    >
                                        {marker.tipo === 'pausa' ? `⏸️ ${marker.texto}` : marker.texto}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Processed Text Preview */}
                    {analysis.textoProcesado !== texto && (
                        <div className="mb-4">
                            <h4 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                                📝 Texto Normalizado
                            </h4>
                            <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl">
                                <pre className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap font-mono">
                                    {analysis.textoProcesado}
                                </pre>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* WPM Reference Guide */}
            <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-xl">
                <h4 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    📊 Guía de Velocidad (WPM)
                </h4>
                <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                        <div className="font-medium text-green-500">120-140</div>
                        <div className="text-gray-500">Lento/Formal</div>
                    </div>
                    <div className="text-center">
                        <div className="font-medium text-blue-500">140-160</div>
                        <div className="text-gray-500">Normal</div>
                    </div>
                    <div className="text-center">
                        <div className="font-medium text-purple-500">160-180</div>
                        <div className="text-gray-500">Rápido</div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            {!readOnly && (
                <div className="flex items-center justify-end gap-3">
                    <NeumorphicButton variant="secondary" onClick={onCancel}>
                        Cancelar
                    </NeumorphicButton>
                    <NeumorphicButton variant="primary" onClick={handleSave}>
                        💾 Guardar
                    </NeumorphicButton>
                </div>
            )}

            {/* Keyboard Shortcuts Help */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <details className="text-xs text-gray-500">
                    <summary className="cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
                        ⌨️ Atajos de teclado
                    </summary>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                        <span><kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">Ctrl+B</kbd> Enfatizar selección</span>
                        <span><kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">Ctrl+P</kbd> Insertar pausa</span>
                        <span><kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">Ctrl+Enter</kbd> Analizar texto</span>
                    </div>
                </details>
            </div>
        </NeumorphicCard>
    );
};

export default EditorMencionesIA;
