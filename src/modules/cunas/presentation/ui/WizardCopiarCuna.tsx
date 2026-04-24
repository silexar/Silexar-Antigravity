/**
 * COMPONENT: WIZARD COPIAR CUÑA
 * 
 * Wizard para copiar una cuña existente con opciones de:
 * - Selección de elementos a copiar (audio, texto, metadata)
 * - Modificación de datos para la nueva cuña
 * - Cambio de anunciante/contrato
 * - Creación de nueva cuña basada en existente
 * 
 * Diseño neumórfico mobile-first
 */

'use client';

import React, { useState, useCallback } from 'react';
import { NeumorphicCard, NeumorphicButton } from './NeumorphicComponents';

interface CunaOriginal {
    id: string;
    codigo: string;
    nombre: string;
    tipo: string;
    estado: string;
    texto?: string;
    pathAudio?: string;
    duracionSegundos?: number;
    anuncianteId?: string;
    contratoId?: string;
    observaciones?: string;
}

interface CopiarCunaData {
    copiarAudio: boolean;
    copiarTexto: boolean;
    copiarMetadata: boolean;
    nuevoNombre: string;
    nuevoAnuncianteId?: string;
    nuevoContratoId?: string;
}

interface WizardCopiarCunaProps {
    cunaOriginal: CunaOriginal;
    onComplete?: (nuevaCunaId: string) => void;
    onCancel?: () => void;
}

export const WizardCopiarCuna: React.FC<WizardCopiarCunaProps> = ({
    cunaOriginal,
    onComplete,
    onCancel,
}) => {
    const [step, setStep] = useState(1);
    const [isCopying, setIsCopying] = useState(false);
    const [data, setData] = useState<CopiarCunaData>({
        copiarAudio: true,
        copiarTexto: true,
        copiarMetadata: false,
        nuevoNombre: `Copia de ${cunaOriginal.nombre}`,
    });

    const totalSteps = 3;

    const handleNext = useCallback(() => {
        if (step < totalSteps) {
            setStep(step + 1);
        }
    }, [step]);

    const handleBack = useCallback(() => {
        if (step > 1) {
            setStep(step - 1);
        }
    }, [step]);

    const handleCopy = useCallback(async () => {
        setIsCopying(true);

        try {
            // Simular llamada a API
            await new Promise(resolve => setTimeout(resolve, 1500));

            // En producción, aquí se haría la llamada real
            const nuevaCunaId = `cuna-copy-${Date.now()}`;

            onComplete?.(nuevaCunaId);
        } catch (error) {
            console.error('Error copying cuna:', error);
        } finally {
            setIsCopying(false);
        }
    }, [data, onComplete]);

    return (
        <NeumorphicCard padding="lg" className="w-full max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                        📋 Copiar Cuña
                    </h3>
                    <span className="text-sm text-gray-500">
                        Paso {step} de {totalSteps}
                    </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${(step / totalSteps) * 100}%` }}
                    />
                </div>
            </div>

            {/* Original Info */}
            <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-xl">
                <div className="text-xs text-gray-500 mb-1">Copiando desde:</div>
                <div className="font-medium text-gray-800 dark:text-white">
                    {cunaOriginal.nombre}
                </div>
                <div className="text-sm text-gray-500">
                    {cunaOriginal.codigo} • {cunaOriginal.tipo}
                </div>
            </div>

            {/* Step 1: Select what to copy */}
            {step === 1 && (
                <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
                        ¿Qué elementos deseas copiar?
                    </h4>

                    <label className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                        <input
                            type="checkbox"
                            checked={data.copiarAudio}
                            onChange={(e) => setData(prev => ({ ...prev, copiarAudio: e.target.checked }))}
                            className="mt-1 w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <div>
                            <div className="font-medium text-gray-800 dark:text-white">
                                🎵 Audio
                            </div>
                            <div className="text-sm text-gray-500">
                                Copiar archivo de audio ({cunaOriginal.duracionSegundos}s)
                            </div>
                        </div>
                    </label>

                    <label className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                        <input
                            type="checkbox"
                            checked={data.copiarTexto}
                            onChange={(e) => setData(prev => ({ ...prev, copiarTexto: e.target.checked }))}
                            className="mt-1 w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <div>
                            <div className="font-medium text-gray-800 dark:text-white">
                                📝 Texto/Guion
                            </div>
                            <div className="text-sm text-gray-500">
                                Copiar texto de locución
                            </div>
                        </div>
                    </label>

                    <label className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                        <input
                            type="checkbox"
                            checked={data.copiarMetadata}
                            onChange={(e) => setData(prev => ({ ...prev, copiarMetadata: e.target.checked }))}
                            className="mt-1 w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <div>
                            <div className="font-medium text-gray-800 dark:text-white">
                                📋 Metadatos
                            </div>
                            <div className="text-sm text-gray-500">
                                Copiar duración, formato, observaciones
                            </div>
                        </div>
                    </label>
                </div>
            )}

            {/* Step 2: New details */}
            {step === 2 && (
                <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
                        Define los nuevos datos
                    </h4>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Nombre de la nueva cuña *
                        </label>
                        <input
                            type="text"
                            value={data.nuevoNombre}
                            onChange={(e) => setData(prev => ({ ...prev, nuevoNombre: e.target.value }))}
                            placeholder="Nombre para la nueva cuña"
                            className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-primary focus:outline-none text-gray-800 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Nuevo Anunciante
                        </label>
                        <select
                            value={data.nuevoAnuncianteId || ''}
                            onChange={(e) => setData(prev => ({ ...prev, nuevoAnuncianteId: e.target.value || undefined }))}
                            className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-primary focus:outline-none text-gray-800 dark:text-white"
                        >
                            <option value="">Mantener anunciante original</option>
                            <option value="new">+ Seleccionar nuevo...</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Nuevo Contrato
                        </label>
                        <select
                            value={data.nuevoContratoId || ''}
                            onChange={(e) => setData(prev => ({ ...prev, nuevoContratoId: e.target.value || undefined }))}
                            className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-primary focus:outline-none text-gray-800 dark:text-white"
                        >
                            <option value="">Mantener contrato original</option>
                            <option value="new">+ Seleccionar nuevo...</option>
                        </select>
                    </div>
                </div>
            )}

            {/* Step 3: Confirmation */}
            {step === 3 && (
                <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
                        Confirma la copia
                    </h4>

                    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-xl space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Nombre:</span>
                            <span className="font-medium text-gray-800 dark:text-white">{data.nuevoNombre}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Audio:</span>
                            <span className={data.copiarAudio ? 'text-green-500' : 'text-gray-400'}>
                                {data.copiarAudio ? '✅ Sí' : '❌ No'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Texto:</span>
                            <span className={data.copiarTexto ? 'text-green-500' : 'text-gray-400'}>
                                {data.copiarTexto ? '✅ Sí' : '❌ No'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Metadatos:</span>
                            <span className={data.copiarMetadata ? 'text-green-500' : 'text-gray-400'}>
                                {data.copiarMetadata ? '✅ Sí' : '❌ No'}
                            </span>
                        </div>
                    </div>

                    <div className="p-4 bg-primary/10 rounded-xl text-sm text-gray-600 dark:text-gray-400">
                        ⚠️ La nueva cuña se creará en estado <strong>borrador</strong> y requerirá aprobación antes de poder ser exportada.
                    </div>
                </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
                <NeumorphicButton
                    variant="secondary"
                    onClick={step === 1 ? onCancel : handleBack}
                >
                    {step === 1 ? 'Cancelar' : '← Volver'}
                </NeumorphicButton>

                {step < totalSteps ? (
                    <NeumorphicButton
                        variant="primary"
                        onClick={handleNext}
                        disabled={
                            (step === 1 && !data.copiarAudio && !data.copiarTexto && !data.copiarMetadata) ||
                            (step === 2 && !data.nuevoNombre.trim())
                        }
                    >
                        Continuar →
                    </NeumorphicButton>
                ) : (
                    <NeumorphicButton
                        variant="primary"
                        onClick={handleCopy}
                        disabled={isCopying}
                    >
                        {isCopying ? '🔄 Copiando...' : '✅ Confirmar Copia'}
                    </NeumorphicButton>
                )}
            </div>
        </NeumorphicCard>
    );
};

export default WizardCopiarCuna;
