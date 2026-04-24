/**
 * COMPONENT: EDITOR DE PRESENTACIONES CON VALIDACIÓN
 * 
 * Editor para presentaciones de programas auspicados con:
 * - Validación de fechas de vigencia
 * - Verificación de relación con contratos
 * - Plantillas predefinidas
 * - Preview del texto
 * 
 * Diseño neumórfico mobile-first
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { NeumorphicCard, NeumorphicButton } from './NeumorphicComponents';
import { VencimientosValidationService } from '@/modules/cunas/infrastructure/external/VencimientosValidationService';

interface PresentacionData {
    id?: string;
    nombre: string;
    texto: string;
    programa?: string;
    idioma?: 'es' | 'en' | 'bilingual';
    duracionEstimada?: number;
}

interface ValidationResult {
    isValid: boolean;
    warnings: string[];
    errors: string[];
    contractStatus?: {
        hasContract: boolean;
        contractId?: string;
        expirationDate?: Date;
        daysRemaining?: number;
    };
}

interface EditorPresentacionesProps {
    presentacionInicial?: PresentacionData;
    contratoId?: string;
    onSave?: (presentacion: PresentacionData, validation: ValidationResult) => void;
    onCancel?: () => void;
    readOnly?: boolean;
}

export const EditorPresentaciones: React.FC<EditorPresentacionesProps> = ({
    presentacionInicial,
    contratoId,
    onSave,
    onCancel,
    readOnly = false,
}) => {
    const [presentacion, setPresentacion] = useState<PresentacionData>(presentacionInicial || {
        nombre: '',
        texto: '',
        idioma: 'es',
    });

    const [validation, setValidation] = useState<ValidationResult | null>(null);
    const [isValidating, setIsValidating] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    const vencimientosService = new VencimientosValidationService();

    // Plantillas predefinidas
    const PLANTILLAS = {
        opening: {
            nombre: 'Apertura de Programa',
            texto: 'Bienvenidos a [PROGRAMA], el programa que [DESCRIPCIÓN]. Hoy tenemos [CONTENIDO] con [CONVIDADO/ESPECIAL].',
        },
        midProgram: {
            nombre: 'Patrocinio Intermedio',
            texto: 'Estás escuchando [PROGRAMA], presentado por [ANUNCIANTE]. [MENSAJE DEL ANUNCIANTE]',
        },
        closing: {
            nombre: 'Cierre de Programa',
            texto: 'Ha sido un placer estar con ustedes en [PROGRAMA]. Agradecemos a [ANUNCIANTE] por hacer posible este espacio. Los esperamos mañana.',
        },
        bilingual: {
            nombre: 'Bilingüe',
            texto: 'Welcome to [PROGRAMA]! / Bienvenidos a [PROGRAMA]! [DESCRIPCION BILINGÜE]',
        },
    };

    const validatePresentacion = useCallback(async () => {
        setIsValidating(true);

        const errors: string[] = [];
        const warnings: string[] = [];

        // Validaciones básicas
        if (!presentacion.nombre.trim()) {
            errors.push('El nombre de la presentación es requerido');
        }

        if (!presentacion.texto.trim()) {
            errors.push('El texto de la presentación es requerido');
        }

        if (presentacion.texto.length < 20) {
            warnings.push('El texto parece muy corto para una presentación');
        }

        // Validar duraciones
        if (presentacion.duracionEstimada && presentacion.duracionEstimada > 30) {
            warnings.push('La duración estimada es mayor a 30 segundos');
        }

        // Validar relación con contrato si existe
        let contractStatus;
        if (contratoId) {
            try {
                const validacion = await vencimientosService.validarCuna(
                    presentacion.id || 'new',
                    contratoId,
                    'default-tenant' // En producción vendría del contexto
                );

                contractStatus = {
                    hasContract: validacion.tieneVencimientoActivo,
                    contractId: contratoId,
                    expirationDate: validacion.fechaVencimiento || undefined,
                    daysRemaining: validacion.diasRestantes || undefined,
                };

                if (!validacion.tieneVencimientoActivo) {
                    errors.push('El contrato no tiene vencimiento activo');
                } else if (validacion.diasRestantes != null && validacion.diasRestantes <= 7) {
                    warnings.push(`El contrato vence en ${validacion.diasRestantes} días`);
                } else if (validacion.diasRestantes != null && validacion.diasRestantes <= 0) {
                    errors.push('El contrato ya está vencido');
                }
            } catch (e) {
                warnings.push('No se pudo validar el contrato');
            }
        }

        setValidation({
            isValid: errors.length === 0,
            errors,
            warnings,
            contractStatus,
        });

        setIsValidating(false);
    }, [presentacion, contratoId, vencimientosService]);

    // Validar cuando cambian los datos
    useEffect(() => {
        if (presentacion.nombre || presentacion.texto) {
            const timer = setTimeout(validatePresentacion, 500);
            return () => clearTimeout(timer);
        }
    }, [presentacion.nombre, presentacion.texto]);

    const handleTemplateSelect = useCallback((templateKey: keyof typeof PLANTILLAS) => {
        const template = PLANTILLAS[templateKey];
        setPresentacion(prev => ({
            ...prev,
            nombre: template.nombre,
            texto: template.texto,
        }));
    }, []);

    const handleSave = useCallback(() => {
        if (validation?.isValid && onSave) {
            onSave(presentacion, validation);
        }
    }, [presentacion, validation, onSave]);

    const wordCount = presentacion.texto.split(/\s+/).filter(Boolean).length;
    const charCount = presentacion.texto.length;
    const estimatedDuration = Math.ceil(wordCount / 3); // ~3 palabras por segundo para presentaciones

    return (
        <NeumorphicCard padding="lg" className="w-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    📋 Editor de Presentaciones
                </h3>
                <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded">
                    {presentacion.id ? 'Editando' : 'Nueva'}
                </span>
            </div>

            {/* Nombre */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nombre de la Presentación
                </label>
                <input
                    type="text"
                    value={presentacion.nombre}
                    onChange={(e) => setPresentacion(prev => ({ ...prev, nombre: e.target.value }))}
                    readOnly={readOnly}
                    placeholder="Ej: Apertura Programa Mañaneros"
                    className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-primary focus:outline-none text-gray-800 dark:text-white"
                />
            </div>

            {/* Programa */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Programa
                </label>
                <input
                    type="text"
                    value={presentacion.programa || ''}
                    onChange={(e) => setPresentacion(prev => ({ ...prev, programa: e.target.value }))}
                    readOnly={readOnly}
                    placeholder="Ej: Mañaneros"
                    className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-primary focus:outline-none text-gray-800 dark:text-white"
                />
            </div>

            {/* Idioma */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Idioma
                </label>
                <div className="flex gap-2">
                    {(['es', 'en', 'bilingual'] as const).map((idioma) => (
                        <button
                            key={idioma}
                            onClick={() => !readOnly && setPresentacion(prev => ({ ...prev, idioma }))}
                            disabled={readOnly}
                            className={`
                                px-4 py-2 rounded-lg text-sm font-medium transition
                                ${presentacion.idioma === idioma
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}
                            `}
                        >
                            {idioma === 'es' ? '🇨🇱 Español' : idioma === 'en' ? '🇺🇸 English' : '🔄 Bilingüe'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Plantillas */}
            {!readOnly && (
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Usar Plantilla
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {Object.entries(PLANTILLAS).map(([key, template]) => (
                            <button
                                key={key}
                                onClick={() => handleTemplateSelect(key as keyof typeof PLANTILLAS)}
                                className="p-3 text-left rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                            >
                                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {template.nombre}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Texto */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Texto de la Presentación
                    </label>
                    <div className="flex gap-4 text-xs text-gray-500">
                        <span>{wordCount} palabras</span>
                        <span>{charCount} caracteres</span>
                        <span>~{estimatedDuration}s</span>
                    </div>
                </div>
                <textarea
                    value={presentacion.texto}
                    onChange={(e) => setPresentacion(prev => ({ ...prev, texto: e.target.value }))}
                    readOnly={readOnly}
                    placeholder="Escribe el texto de la presentación..."
                    rows={6}
                    className="w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-primary focus:outline-none resize-none text-gray-800 dark:text-white font-mono"
                />
            </div>

            {/* Preview Toggle */}
            <div className="mb-4">
                <NeumorphicButton
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowPreview(!showPreview)}
                >
                    {showPreview ? '🙈 Ocultar Preview' : '👁️ Mostrar Preview'}
                </NeumorphicButton>

                {showPreview && (
                    <div className="mt-3 p-4 bg-gray-100 dark:bg-gray-800 rounded-xl">
                        <div className="text-sm font-medium text-gray-500 mb-2">Preview:</div>
                        <div className="text-gray-800 dark:text-white italic">
                            {presentacion.texto || '(Sin texto)'}
                        </div>
                    </div>
                )}
            </div>

            {/* Validation Results */}
            {validation && (
                <div className="mb-4">
                    {/* Errors */}
                    {validation.errors.length > 0 && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl mb-2">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-red-500">❌</span>
                                <span className="text-sm font-medium text-red-700 dark:text-red-400">
                                    Errores ({validation.errors.length})
                                </span>
                            </div>
                            <ul className="text-xs text-red-600 dark:text-red-400 space-y-1">
                                {validation.errors.map((error, idx) => (
                                    <li key={idx}>• {error}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Warnings */}
                    {validation.warnings.length > 0 && (
                        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl mb-2">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-yellow-500">⚠️</span>
                                <span className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
                                    Advertencias ({validation.warnings.length})
                                </span>
                            </div>
                            <ul className="text-xs text-yellow-600 dark:text-yellow-400 space-y-1">
                                {validation.warnings.map((warning, idx) => (
                                    <li key={idx}>• {warning}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Contract Status */}
                    {validation.contractStatus && (
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-blue-500">📄</span>
                                <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                                    Estado del Contrato
                                </span>
                            </div>
                            <div className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                                <div>• Contrato: {validation.contractStatus.hasContract ? '✅ Activo' : '❌ Sin contrato activo'}</div>
                                {validation.contractStatus.expirationDate && (
                                    <div>• Vence: {new Date(validation.contractStatus.expirationDate).toLocaleDateString()}</div>
                                )}
                                {validation.contractStatus.daysRemaining !== undefined && (
                                    <div>• Días restantes: {validation.contractStatus.daysRemaining}</div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Valid indicator */}
                    {validation.isValid && validation.errors.length === 0 && (
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                            <span className="text-green-500">✅ </span>
                            <span className="text-sm font-medium text-green-700 dark:text-green-400">
                                Presentación válida para guardar
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* Action Buttons */}
            {!readOnly && (
                <div className="flex items-center justify-end gap-3">
                    <NeumorphicButton variant="secondary" onClick={onCancel}>
                        Cancelar
                    </NeumorphicButton>
                    <NeumorphicButton
                        variant="primary"
                        onClick={handleSave}
                        disabled={!validation?.isValid || isValidating}
                    >
                        {isValidating ? '🔄 Validando...' : '💾 Guardar'}
                    </NeumorphicButton>
                </div>
            )}
        </NeumorphicCard>
    );
};

export default EditorPresentaciones;
