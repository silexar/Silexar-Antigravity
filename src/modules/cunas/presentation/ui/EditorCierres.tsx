/**
 * COMPONENT: EDITOR DE CIERRES CON SUGERENCIAS
 * 
 * Editor para cierres de programas auspicados con:
 * - Generación de sugerencias inteligentes
 * - Plantillas optimizadas
 * - Verificación de longitud
 * - Compatibilidad con tono del programa
 * 
 * Diseño neumórfico mobile-first
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { NeumorphicCard, NeumorphicButton } from './NeumorphicComponents';

interface CierreData {
    id?: string;
    nombre: string;
    texto: string;
    tipo: 'standard' | 'dramatico' | 'humoristico' | 'emotivo';
    duracionEstimada?: number;
}

interface Sugerencia {
    tipo: 'mejora' | 'alternativa' | 'complemento';
    texto: string;
    razon?: string;
}

interface EditorCierresProps {
    cierreInicial?: CierreData;
    programa?: string;
    tono?: 'formal' | 'casual' | 'divertido' | 'serio';
    onSave?: (cierre: CierreData) => void;
    onCancel?: () => void;
    readOnly?: boolean;
}

export const EditorCierres: React.FC<EditorCierresProps> = ({
    cierreInicial,
    programa,
    tono = 'formal',
    onSave,
    onCancel,
    readOnly = false,
}) => {
    const [cierre, setCierre] = useState<CierreData>(cierreInicial || {
        nombre: '',
        texto: '',
        tipo: 'standard',
    });

    const [sugerencias, setSugerencias] = useState<Sugerencia[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedSugerencia, setSelectedSugerencia] = useState<Sugerencia | null>(null);

    // Generar sugerencias basadas en el texto actual
    const generateSugerencias = useCallback(async () => {
        if (!cierre.texto.trim()) return;

        setIsGenerating(true);

        try {
            // Simular delay de generación IA
            await new Promise(resolve => setTimeout(resolve, 500));

            const newSugerencias: Sugerencia[] = [];
            const texto = cierre.texto;

            // Sugerencia: Si es muy corto
            if (texto.split(/\s+/).length < 15) {
                newSugerencias.push({
                    tipo: 'mejora',
                    texto: 'Considera agregar una frase de agradecimiento más elaborado',
                    razon: 'Los cierres efectivos suelen tener 20-30 palabras',
                });
            }

            // Sugerencia: Si no menciona el anunciante
            if (!texto.toLowerCase().includes('anunciante') && !texto.includes('[ANUNCIANTE]')) {
                newSugerencias.push({
                    tipo: 'alternativa',
                    texto: 'Agregar mención de agradecimiento al anunciante',
                });
            }

            // Sugerencia: Si es muy largo
            if (texto.split(/\s+/).length > 50) {
                newSugerencias.push({
                    tipo: 'mejora',
                    texto: 'El texto es extenso. Considera dividirlo o hacerlo más conciso',
                });
            }

            // Sugerencia basada en el tipo
            if (cierre.tipo === 'dramatico') {
                newSugerencias.push({
                    tipo: 'complemento',
                    texto: 'Para mayor impacto, considera agregar una pausa dramática [PAUSA:1s] antes del mensaje final',
                });
            }

            // Sugerencia genérica de mejora
            if (!texto.endsWith('.') && !texto.endsWith('!') && !texto.endsWith('?')) {
                newSugerencias.push({
                    tipo: 'mejora',
                    texto: 'Agregar puntuación final para mejor ritmo de locución',
                });
            }

            // Alternativas según el tono
            if (tono === 'casual') {
                newSugerencias.push({
                    tipo: 'alternativa',
                    texto: 'Para tono casual, prueba: "¡Eso ha sido todo por hoy! Nos vemos mañana con más [PROGRAMA]. Un abrazo enorme y gracias a [ANUNCIANTE] por hacer todo esto posible."',
                });
            } else if (tono === 'formal') {
                newSugerencias.push({
                    tipo: 'alternativa',
                    texto: 'Para tono formal, prueba: "Ha sido un placer compartir este espacio con ustedes. Agradecemos a [ANUNCIANTE] por su apoyo. Los esperamos mañana a la misma hora."',
                });
            }

            setSugerencias(newSugerencias);
        } catch (error) {
            console.error('Error generating suggestions:', error);
        } finally {
            setIsGenerating(false);
        }
    }, [cierre.texto, cierre.tipo, tono]);

    // Generar sugerencias cuando cambia el texto
    useEffect(() => {
        const timer = setTimeout(generateSugerencias, 800);
        return () => clearTimeout(timer);
    }, [cierre.texto]);

    const handleApplySugerencia = useCallback((sugerencia: Sugerencia) => {
        if (sugerencia.tipo === 'alternativa') {
            // Reemplazar el texto con la alternativa
            setCierre(prev => ({ ...prev, texto: sugerencia.texto }));
        } else if (sugerencia.tipo === 'complemento') {
            // Agregar al texto existente
            setCierre(prev => ({ ...prev, texto: prev.texto + ' ' + sugerencia.texto }));
        }
        setSelectedSugerencia(null);
    }, []);

    const handleSave = useCallback(() => {
        if (onSave) {
            onSave(cierre);
        }
    }, [cierre, onSave]);

    const wordCount = cierre.texto.split(/\s+/).filter(Boolean).length;
    const charCount = cierre.texto.length;
    const estimatedDuration = Math.ceil(wordCount / 3);

    return (
        <NeumorphicCard padding="lg" className="w-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    🎬 Editor de Cierres
                </h3>
                <span className="px-2 py-1 text-xs bg-secondary/10 text-secondary rounded">
                    {tono.toUpperCase()}
                </span>
            </div>

            {/* Nombre */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nombre del Cierre
                </label>
                <input
                    type="text"
                    value={cierre.nombre}
                    onChange={(e) => setCierre(prev => ({ ...prev, nombre: e.target.value }))}
                    readOnly={readOnly}
                    placeholder="Ej: Cierre Emotivo Tarde de Programas"
                    className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-primary focus:outline-none text-gray-800 dark:text-white"
                />
            </div>

            {/* Tipo */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tipo de Cierre
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {([
                        { key: 'standard', label: '📊 Estándar', emoji: '📊' },
                        { key: 'dramatico', label: '🎭 Dramático', emoji: '🎭' },
                        { key: 'humoristico', label: '😄 Humorístico', emoji: '😄' },
                        { key: 'emotivo', label: '❤️ Emotivo', emoji: '❤️' },
                    ] as const).map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => !readOnly && setCierre(prev => ({ ...prev, tipo: key }))}
                            disabled={readOnly}
                            className={`
                                p-3 rounded-xl text-sm font-medium transition
                                ${cierre.tipo === key
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}
                            `}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Texto */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Texto del Cierre
                    </label>
                    <div className="flex gap-4 text-xs text-gray-500">
                        <span>{wordCount} palabras</span>
                        <span>~{estimatedDuration}s</span>
                    </div>
                </div>
                <textarea
                    value={cierre.texto}
                    onChange={(e) => setCierre(prev => ({ ...prev, texto: e.target.value }))}
                    readOnly={readOnly}
                    placeholder="Escribe el texto del cierre..."
                    rows={5}
                    className="w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-primary focus:outline-none resize-none text-gray-800 dark:text-white font-mono"
                />
            </div>

            {/* Sugerencias */}
            {sugerencias.length > 0 && (
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            💡 Sugerencias{isGenerating && ' (generando...)'}
                        </h4>
                        <button
                            onClick={generateSugerencias}
                            disabled={isGenerating}
                            className="text-xs text-primary hover:underline"
                        >
                            🔄 Regenerar
                        </button>
                    </div>
                    <div className="space-y-2">
                        {sugerencias.map((sugerencia, idx) => (
                            <div
                                key={idx}
                                className={`
                                    p-3 rounded-xl text-sm cursor-pointer transition
                                    ${sugerencia.tipo === 'alternativa' ? 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800' : ''}
                                    ${sugerencia.tipo === 'mejora' ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' : ''}
                                    ${sugerencia.tipo === 'complemento' ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : ''}
                                    hover:shadow-md
                                `}
                                onClick={() => !readOnly && setSelectedSugerencia(selectedSugerencia?.texto === sugerencia.texto ? null : sugerencia)}
                            >
                                <div className="flex items-start gap-2">
                                    <span className="text-lg">
                                        {sugerencia.tipo === 'alternativa' ? '🔄' : sugerencia.tipo === 'mejora' ? '💎' : '➕'}
                                    </span>
                                    <div className="flex-1">
                                        <div className="text-gray-800 dark:text-white">
                                            {sugerencia.texto}
                                        </div>
                                        {sugerencia.razon && (
                                            <div className="text-xs text-gray-500 mt-1">
                                                {sugerencia.razon}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Expandable apply button */}
                                {selectedSugerencia?.texto === sugerencia.texto && !readOnly && (
                                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                        <NeumorphicButton
                                            variant="primary"
                                            size="sm"
                                            onClick={() => handleApplySugerencia(sugerencia)}
                                        >
                                            {sugerencia.tipo === 'alternativa' ? '🔄 Usar esta alternativa' : '➕ Agregar'}
                                        </NeumorphicButton>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Plantillas Rápidas */}
            {!readOnly && (
                <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        📋 Plantillas Rápidas
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <button
                            onClick={() => setCierre(prev => ({ ...prev, texto: `Gracias por acompañarnos en ${programa || 'este programa'}. Un agradecimiento especial a [ANUNCIANTE] por hacer posible este espacio. Los esperamos mañana.` }))}
                            className="p-3 text-left rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition text-sm"
                        >
                            <div className="font-medium text-gray-700 dark:text-gray-300">Cierre Clásico</div>
                            <div className="text-xs text-gray-500">Formal y agradecido</div>
                        </button>
                        <button
                            onClick={() => setCierre(prev => ({ ...prev, texto: `¡Eso es todo por hoy! [PAUSA:0.5s] Recuerden sintonizarnos mañana. Un abrazo gigante y gracias a [ANUNCIANTE] por tanto apoyo. ¡Chao!` }))}
                            className="p-3 text-left rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition text-sm"
                        >
                            <div className="font-medium text-gray-700 dark:text-gray-300">Cierre Energético</div>
                            <div className="text-xs text-gray-500">Casual y dinámico</div>
                        </button>
                        <button
                            onClick={() => setCierre(prev => ({ ...prev, texto: `[PAUSA:1s] Hoy hemos llegado al final de ${programa || 'este espacio'}. [PAUSA:0.5s] Agradecemos profundamente a [ANUNCIANTE] por creer en este proyecto. Hasta la próxima.` }))}
                            className="p-3 text-left rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition text-sm"
                        >
                            <div className="font-medium text-gray-700 dark:text-gray-300">Cierre Dramático</div>
                            <div className="text-xs text-gray-500">Con pausas dramáticas</div>
                        </button>
                        <button
                            onClick={() => setCierre(prev => ({ ...prev, texto: `Y bien, ya se nos acaba el tiempo. [PAUSA:0.3s] Gracias totales a [ANUNCIANTE] y a ustedes por estar ahí. Mañana seguimos con más. ¡Cuídense!` }))}
                            className="p-3 text-left rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition text-sm"
                        >
                            <div className="font-medium text-gray-700 dark:text-gray-300">Cierre Casual</div>
                            <div className="text-xs text-gray-500">Relajado y amigable</div>
                        </button>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            {!readOnly && (
                <div className="flex items-center justify-end gap-3">
                    <NeumorphicButton variant="secondary" onClick={onCancel}>
                        Cancelar
                    </NeumorphicButton>
                    <NeumorphicButton variant="primary" onClick={handleSave}>
                        💾 Guardar Cierre
                    </NeumorphicButton>
                </div>
            )}
        </NeumorphicCard>
    );
};

export default EditorCierres;
