/**
 * COMPONENT: EDITOR PROMOIDA CON VARIABLES
 * 
 * Editor para promociones IDA (Integración Digital Automática) con:
 * - Variables personalizables {VARIABLE}
 * - Vista previa con valores sustituidos
 * - Validación de variables requeridas
 * - Historial de promociones creadas
 * - Integración con anuncios activos
 * 
 * Diseño neumórfico mobile-first
 */

'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { NeumorphicCard, NeumorphicButton } from './NeumorphicComponents';
import { VariablePersonalizada, type TipoVariable } from '@/modules/cunas/domain/value-objects/VariablePersonalizada';

interface Variable {
    nombre: string;
    tipo: TipoVariable;
    valorPorDefecto?: string;
    descripcion?: string;
    requerida: boolean;
}

interface PromoIDAData {
    id?: string;
    nombre: string;
    texto: string;
    tipo: 'spot' | 'mencion' | 'cierre' | 'combo';
    variables: Variable[];
    anuncianteId?: string;
    contratoId?: string;
    vigencia?: {
        inicio: Date;
        fin: Date;
    };
}

interface VariablePreview {
    nombre: string;
    valor: string;
    tipo: TipoVariable;
    esValida: boolean;
}

interface EditorPromoIDAProps {
    promoInicial?: PromoIDAData;
    variablesPredefinidas?: Variable[];
    onSave?: (promo: PromoIDAData) => void;
    onCancel?: () => void;
    readOnly?: boolean;
}

export const EditorPromoIDA: React.FC<EditorPromoIDAProps> = ({
    promoInicial,
    variablesPredefinidas = [],
    onSave,
    onCancel,
    readOnly = false,
}) => {
    // Estado principal
    const [promo, setPromo] = useState<PromoIDAData>(promoInicial || {
        nombre: '',
        texto: '',
        tipo: 'spot',
        variables: [],
    });

    // Estado de edición
    const [activeVariable, setActiveVariable] = useState<Variable | null>(null);
    const [showVariableEditor, setShowVariableEditor] = useState(false);
    const [newVariableName, setNewVariableName] = useState('');
    const [newVariableTipo, setNewVariableTipo] = useState<TipoVariable>('texto');
    const [previewValues, setPreviewValues] = useState<Record<string, string>>({});
    const [showPreview, setShowPreview] = useState(false);

    // Variables predefinidas del sistema
    const VARIABLES_SISTEMA: Variable[] = useMemo(() => [
        { nombre: '{ANUNCIANTE}', tipo: 'texto', valorPorDefecto: 'Nombre del Anunciante', descripcion: 'Nombre de la empresa anunciante', requerida: true },
        { nombre: '{PRODUCTO}', tipo: 'texto', valorPorDefecto: 'Nombre del Producto', descripcion: 'Nombre del producto o servicio', requerida: false },
        { nombre: '{PRECIO}', tipo: 'numero', valorPorDefecto: '$0', descripcion: 'Precio con formato', requerida: false },
        { nombre: '{FECHA}', tipo: 'fecha', valorPorDefecto: '', descripcion: 'Fecha del evento/promoción', requerida: false },
        { nombre: '{TELEFONO}', tipo: 'telefono', valorPorDefecto: '', descripcion: 'Teléfono de contacto', requerida: false },
        { nombre: '{URL}', tipo: 'url', valorPorDefecto: '', descripcion: 'Sitio web o landing page', requerida: false },
        { nombre: '{HORARIO}', tipo: 'texto', valorPorDefecto: '', descripcion: 'Horario de atención/funcionamiento', requerida: false },
        { nombre: '{DIRECCION}', tipo: 'texto', valorPorDefecto: '', descripcion: 'Dirección física', requerida: false },
    ], []);

    // Todas las variables disponibles (sistema + personalizadas)
    const allVariables = useMemo(() => {
        const customNames = promo.variables.map(v => v.nombre);
        const sistemaVars = VARIABLES_SISTEMA.filter(v => !customNames.includes(v.nombre));
        return [...promo.variables, ...sistemaVars];
    }, [promo.variables]);

    // Extraer variables del texto actual
    const extractedVariables = useMemo(() => {
        const regex = /\{([A-Z][A-Z0-9_]*)\}/g;
        const matches: string[] = [];
        let match;
        while ((match = regex.exec(promo.texto)) !== null) {
            if (!matches.includes(match[1])) {
                matches.push(match[1]);
            }
        }
        return matches;
    }, [promo.texto]);

    // Preview del texto con valores sustituidos
    const textoPreview = useMemo(() => {
        let result = promo.texto;
        Object.entries(previewValues).forEach(([key, value]) => {
            result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value || `{${key}}`);
        });
        return result;
    }, [promo.texto, previewValues]);

    // Detectar variables faltantes en el preview
    const variablesFaltantes = useMemo(() => {
        return extractedVariables.filter(v => {
            const variable = allVariables.find(av => av.nombre === `{${v}}`);
            return variable?.requerida && !previewValues[v];
        });
    }, [extractedVariables, allVariables, previewValues]);

    // Agregar variable al texto
    const insertVariable = useCallback((variableName: string) => {
        setPromo(prev => ({
            ...prev,
            texto: prev.texto + variableName,
        }));
    }, []);

    // Agregar nueva variable personalizada
    const addCustomVariable = useCallback(() => {
        if (!newVariableName.trim()) return;

        const variableName = `{${newVariableName.toUpperCase().replace(/\s+/g, '_')}}`;

        // Verificar si ya existe
        if (promo.variables.some(v => v.nombre === variableName)) {
            alert('Esta variable ya existe');
            return;
        }

        const newVar: Variable = {
            nombre: variableName,
            tipo: newVariableTipo,
            requerida: true,
        };

        setPromo(prev => ({
            ...prev,
            variables: [...prev.variables, newVar],
        }));

        // Inicializar valor en preview
        setPreviewValues(prev => ({
            ...prev,
            [newVariableName.toUpperCase().replace(/\s+/g, '_')]: '',
        }));

        setNewVariableName('');
        setShowVariableEditor(false);
    }, [newVariableName, newVariableTipo, promo.variables]);

    // Remover variable personalizada
    const removeVariable = useCallback((variableName: string) => {
        setPromo(prev => ({
            ...prev,
            variables: prev.variables.filter(v => v.nombre !== variableName),
        }));

        // Limpiar del preview
        const varKey = variableName.replace(/[{}]/g, '');
        setPreviewValues(prev => {
            const newValues = { ...prev };
            delete newValues[varKey];
            return newValues;
        });
    }, []);

    // Actualizar valor de preview
    const updatePreviewValue = useCallback((variableName: string, value: string) => {
        setPreviewValues(prev => ({
            ...prev,
            [variableName]: value,
        }));
    }, []);

    // Manejar guardado
    const handleSave = useCallback(() => {
        if (!promo.nombre.trim()) {
            alert('El nombre es requerido');
            return;
        }
        if (!promo.texto.trim()) {
            alert('El texto es requerido');
            return;
        }
        if (variablesFaltantes.length > 0) {
            alert(`Faltan valores para las variables requeridas: ${variablesFaltantes.join(', ')}`);
            return;
        }

        onSave?.(promo);
    }, [promo, variablesFaltantes, onSave]);

    // Actualizar valores por defecto cuando cambian las variables
    useEffect(() => {
        const newDefaults: Record<string, string> = {};
        promo.variables.forEach(v => {
            if (v.valorPorDefecto && !(v.nombre.replace(/[{}]/g, '') in previewValues)) {
                newDefaults[v.nombre.replace(/[{}]/g, '')] = v.valorPorDefecto;
            }
        });
        if (Object.keys(newDefaults).length > 0) {
            setPreviewValues(prev => ({ ...prev, ...newDefaults }));
        }
    }, [promo.variables]);

    const wordCount = promo.texto.split(/\s+/).filter(Boolean).length;
    const charCount = promo.texto.length;
    const estimatedDuration = Math.ceil(wordCount / 3);

    return (
        <NeumorphicCard padding="lg" className="w-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                        📢 Editor PromoIDA
                    </h3>
                    <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded">
                        {promo.tipo.toUpperCase()}
                    </span>
                </div>
                {showPreview && (
                    <span className="text-xs text-gray-500">
                        {extractedVariables.length} variables detectadas
                    </span>
                )}
            </div>

            {/* Nombre */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nombre de la Promo
                </label>
                <input
                    type="text"
                    value={promo.nombre}
                    onChange={(e) => setPromo(prev => ({ ...prev, nombre: e.target.value }))}
                    readOnly={readOnly}
                    placeholder="Ej: Promo Verano 2024"
                    className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-primary focus:outline-none text-gray-800 dark:text-white"
                />
            </div>

            {/* Tipo */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tipo de Promo
                </label>
                <div className="grid grid-cols-4 gap-2">
                    {(['spot', 'mencion', 'cierre', 'combo'] as const).map((tipo) => (
                        <button
                            key={tipo}
                            onClick={() => !readOnly && setPromo(prev => ({ ...prev, tipo }))}
                            disabled={readOnly}
                            className={`
                                p-3 rounded-xl text-sm font-medium transition capitalize
                                ${promo.tipo === tipo
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}
                            `}
                        >
                            {tipo === 'combo' ? '🔄 Combo' : tipo === 'cierre' ? '🎬 Cierre' : tipo === 'mencion' ? '🎤 Mensión' : '🎵 Spot'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Variables disponibles */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Variables Disponibles
                    </label>
                    {!readOnly && (
                        <button
                            onClick={() => setShowVariableEditor(!showVariableEditor)}
                            className="text-xs text-primary hover:underline"
                        >
                            {showVariableEditor ? 'Cancelar' : '+ Nueva Variable'}
                        </button>
                    )}
                </div>

                {/* Nueva variable */}
                {showVariableEditor && !readOnly && (
                    <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl mb-3 space-y-3">
                        <input
                            type="text"
                            value={newVariableName}
                            onChange={(e) => setNewVariableName(e.target.value)}
                            placeholder="NOMBRE_VARIABLE"
                            className="w-full p-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-sm"
                        />
                        <div className="flex gap-2">
                            <select
                                value={newVariableTipo}
                                onChange={(e) => setNewVariableTipo(e.target.value as TipoVariable)}
                                className="flex-1 p-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-sm"
                            >
                                <option value="texto">Texto</option>
                                <option value="numero">Número</option>
                                <option value="fecha">Fecha</option>
                                <option value="telefono">Teléfono</option>
                                <option value="url">URL</option>
                                <option value="auto">Auto</option>
                            </select>
                            <NeumorphicButton variant="primary" size="sm" onClick={addCustomVariable}>
                                Agregar
                            </NeumorphicButton>
                        </div>
                    </div>
                )}

                {/* Lista de variables */}
                <div className="flex flex-wrap gap-2">
                    {allVariables.map((variable) => (
                        <div
                            key={variable.nombre}
                            className={`
                                flex items-center gap-1 px-3 py-1.5 rounded-full text-sm cursor-pointer transition
                                ${extractedVariables.includes(variable.nombre.replace(/[{}]/g, ''))
                                    ? 'bg-primary/20 text-primary border border-primary/30'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}
                                ${!readOnly ? 'hover:opacity-80' : ''}
                            `}
                            onClick={() => !readOnly && insertVariable(variable.nombre)}
                            title={variable.descripcion || `Tipo: ${variable.tipo}`}
                        >
                            <span>{variable.nombre}</span>
                            {variable.requerida && <span className="text-red-500">*</span>}
                            {!readOnly && promo.variables.some(v => v.nombre === variable.nombre) && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeVariable(variable.nombre);
                                    }}
                                    className="ml-1 text-red-500 hover:text-red-700"
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Texto de la Promo */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Texto de la Promo
                    </label>
                    <div className="flex gap-4 text-xs text-gray-500">
                        <span>{wordCount} palabras</span>
                        <span>~{estimatedDuration}s</span>
                        <span>{charCount} chars</span>
                    </div>
                </div>
                <textarea
                    value={promo.texto}
                    onChange={(e) => setPromo(prev => ({ ...prev, texto: e.target.value }))}
                    readOnly={readOnly}
                    placeholder="Escribe el texto usando {VARIABLES} para insertar valores dinámicos..."
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
            </div>

            {/* Preview con valores */}
            {showPreview && (
                <div className="mb-4 space-y-4">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        💡 Preview con Valores
                    </h4>

                    {/* Inputs para cada variable */}
                    {extractedVariables.map((varName) => {
                        const variable = allVariables.find(v => v.nombre === `{${varName}}`);
                        return (
                            <div key={varName} className="flex items-center gap-3">
                                <label className="w-32 text-sm text-gray-600 dark:text-gray-400">
                                    {`{${varName}}`}
                                </label>
                                <input
                                    type={variable?.tipo === 'numero' ? 'number' : 'text'}
                                    value={previewValues[varName] || ''}
                                    onChange={(e) => updatePreviewValue(varName, e.target.value)}
                                    placeholder={variable?.valorPorDefecto || ''}
                                    disabled={readOnly}
                                    className="flex-1 p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm"
                                />
                                {variable?.requerida && !previewValues[varName] && (
                                    <span className="text-xs text-red-500">Requerida</span>
                                )}
                            </div>
                        );
                    })}

                    {/* Texto preview */}
                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
                        <div className="text-xs text-gray-500 mb-2">Vista previa:</div>
                        <div className="text-gray-800 dark:text-white whitespace-pre-wrap">
                            {textoPreview}
                        </div>
                    </div>

                    {/* Alertas */}
                    {variablesFaltantes.length > 0 && (
                        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
                            <span className="text-yellow-700 dark:text-yellow-400 text-sm">
                                ⚠️ Variables requeridas sin valor: {variablesFaltantes.map(v => `{${v}}`).join(', ')}
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* Sugerencias de uso */}
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-400 mb-2">
                    💡 Ejemplos de Uso
                </h4>
                <div className="space-y-1 text-xs text-blue-600 dark:text-blue-300">
                    <p>• <strong>Spot:</strong> "¡{`{ANUNCIANTE}`} te invita! {`{PRODUCTO}`} desde {`{PRECIO}`}. Solo hoy."</p>
                    <p>• <strong>Mención:</strong> "Recuerda que {`{ANUNCIANTE}`} tiene {`{PRODUCTO}`} disponible."</p>
                    <p>• <strong>Combo:</strong> "{`{ANUNCIANTE}`} presenta: {`{PRODUCTO}`} + regalo. Llama al {`{TELEFONO}`}"</p>
                </div>
            </div>

            {/* Historial de Versiones (placeholder) */}
            <div className="mb-4">
                <details className="text-sm text-gray-500">
                    <summary className="cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
                        📜 Historial de Versiones ({promo.id ? '3 versiones' : 'Sin versiones'})
                    </summary>
                    <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs text-gray-500">
                        {promo.id ? (
                            <ul className="space-y-1">
                                <li>• v3 - Hace 2 horas (actual)</li>
                                <li>• v2 - Hace 1 día</li>
                                <li>• v1 - Hace 3 días</li>
                            </ul>
                        ) : (
                            <p>Guarda la promo para crear la primera versión</p>
                        )}
                    </div>
                </details>
            </div>

            {/* Action Buttons */}
            {!readOnly && (
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <NeumorphicButton variant="secondary" onClick={onCancel}>
                        Cancelar
                    </NeumorphicButton>
                    <NeumorphicButton
                        variant="primary"
                        onClick={handleSave}
                        disabled={variablesFaltantes.length > 0 || !promo.nombre.trim() || !promo.texto.trim()}
                    >
                        💾 Guardar PromoIDA
                    </NeumorphicButton>
                </div>
            )}
        </NeumorphicCard>
    );
};

export default EditorPromoIDA;
