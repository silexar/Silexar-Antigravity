/**
 * Translation Editor UI Component
 * Silexar Pulse - i18n System
 */

'use client';

import React, { useState, useEffect } from 'react';
import { getTranslationRepository, type TranslationFilter, type CreateTranslationInput } from '@/lib/i18n/translation-repository';
import { type Language, type Translation } from '@/lib/db/i18n-schema';

interface LanguageOption {
    code: string;
    name: string;
    nativeName: string;
    flagEmoji: string;
}

interface TranslationKey {
    key: string;
    namespace: string;
    translations: Record<string, string>;
    id?: string;
}

export function TranslationEditor() {
    const [languages, setLanguages] = useState<LanguageOption[]>([]);
    const [selectedLanguage, setSelectedLanguage] = useState<string>('es');
    const [translations, setTranslations] = useState<TranslationKey[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedNamespace, setSelectedNamespace] = useState<string>('common');
    const [isLoading, setIsLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);

    useEffect(() => {
        loadLanguages();
    }, []);

    useEffect(() => {
        loadTranslations();
    }, [selectedLanguage, selectedNamespace]);

    const loadLanguages = async () => {
        const repo = getTranslationRepository();
        const langs = await repo.getLanguages();
        setLanguages(langs.map((l: Language) => ({
            code: l.code,
            name: l.name,
            nativeName: (l as { nativeName?: string }).nativeName || l.name,
            flagEmoji: (l as { flagEmoji?: string }).flagEmoji || '🌐',
        })));
    };

    const loadTranslations = async () => {
        setIsLoading(true);
        try {
            const repo = getTranslationRepository();
            const filter: TranslationFilter = {
                languageCode: selectedLanguage,
                module: selectedNamespace,
            };
            const trans = await repo.getTranslations(filter);
            const keys: TranslationKey[] = trans.map((t: Translation) => ({
                key: t.key,
                namespace: t.module,
                translations: { [selectedLanguage]: t.value },
                id: t.id,
            }));
            setTranslations(keys);
        } catch (error) {
            console.error('Failed to load translations:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveTranslation = async (id: string, key: string, value: string) => {
        try {
            const repo = getTranslationRepository();
            await repo.updateTranslation(id, { value });
            loadTranslations();
        } catch (error) {
            console.error('Failed to save translation:', error);
        }
    };

    const handleExport = async () => {
        const repo = getTranslationRepository();
        const filter: TranslationFilter = { languageCode: selectedLanguage };
        const data = await repo.getTranslations(filter);
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `translations-${selectedLanguage}.json`;
        a.click();
    };

    const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const content = await file.text();
            const data = JSON.parse(content) as Translation[];
            const repo = getTranslationRepository();
            let added = 0;
            let updated = 0;
            for (const item of data) {
                const input: CreateTranslationInput = {
                    languageCode: item.languageCode,
                    module: item.module,
                    key: item.key,
                    value: item.value,
                };
                await repo.createTranslation(input);
                added++;
            }
            alert(`Importadas ${added} traducciones`);
            loadTranslations();
        } catch (error) {
            console.error('Failed to import translations:', error);
            alert('Error al importar traducciones');
        }
    };

    const handleAddTranslation = async (key: string, value: string) => {
        try {
            const repo = getTranslationRepository();
            const input: CreateTranslationInput = {
                languageCode: selectedLanguage,
                module: selectedNamespace,
                key,
                value,
            };
            await repo.createTranslation(input);
            loadTranslations();
        } catch (error) {
            console.error('Failed to add translation:', error);
        }
    };

    const filteredTranslations = translations.filter(t =>
        t.key.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Editor de Traducciones</h2>
                    <p className="text-gray-500">Gestione traducciones del sistema</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleExport}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Exportar
                    </button>
                    <label className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg flex items-center gap-2 cursor-pointer">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Importar
                        <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                    </label>
                </div>
            </div>

            {/* Language Selector */}
            <div className="flex items-center gap-4">
                <div className="flex gap-2">
                    {languages.map(lang => (
                        <button
                            key={lang.code}
                            onClick={() => setSelectedLanguage(lang.code)}
                            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${selectedLanguage === lang.code
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 hover:bg-gray-200'
                                }`}
                        >
                            <span>{lang.flagEmoji}</span>
                            <span>{lang.code.toUpperCase()}</span>
                        </button>
                    ))}
                </div>

                <div className="flex-1">
                    <select
                        value={selectedNamespace}
                        onChange={(e) => setSelectedNamespace(e.target.value)}
                        className="p-2 border border-gray-300 rounded-lg"
                    >
                        <option value="common">Common</option>
                        <option value="auth">Auth</option>
                        <option value="dashboard">Dashboard</option>
                        <option value="forms">Forms</option>
                        <option value="messages">Messages</option>
                        <option value="errors">Errors</option>
                    </select>
                </div>

                <div className="relative">
                    <input
                        type="text"
                        placeholder="Buscar clave..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="p-2 pl-10 border border-gray-300 rounded-lg w-64"
                    />
                    <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            {/* Translations Table */}
            {isLoading ? (
                <div className="flex items-center justify-center p-8">Cargando...</div>
            ) : (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clave</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    {languages.find(l => l.code === selectedLanguage)?.name || selectedLanguage}
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredTranslations.map(trans => (
                                <tr key={trans.key} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="font-mono text-sm">{trans.key}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <TranslationCell
                                            value={translations.find(t => t.key === trans.key)?.translations[selectedLanguage] || ''}
                                            onSave={(value) => trans.id && handleSaveTranslation(trans.id, trans.key, value)}
                                        />
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-red-600 hover:text-red-800 text-sm">
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add New Translation */}
            <TranslationForm
                namespace={selectedNamespace}
                onAdd={handleAddTranslation}
            />
        </div>
    );
}

function TranslationCell({ value, onSave }: { value: string; onSave: (value: string) => void }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(value);

    const handleSave = () => {
        onSave(editValue);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditValue(value);
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="flex gap-2">
                <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="flex-1 p-2 border border-blue-300 rounded"
                    autoFocus
                />
                <button
                    onClick={handleSave}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                >
                    Guardar
                </button>
                <button
                    onClick={handleCancel}
                    className="px-3 py-1 bg-gray-300 rounded text-sm"
                >
                    Cancelar
                </button>
            </div>
        );
    }

    return (
        <div
            className="cursor-pointer hover:bg-blue-50 p-2 rounded"
            onClick={() => setIsEditing(true)}
        >
            {value || <span className="text-gray-400 italic">Sin traducción</span>}
        </div>
    );
}

function TranslationForm({ namespace, onAdd }: { namespace: string; onAdd: (key: string, value: string) => void }) {
    const [key, setKey] = useState('');
    const [value, setValue] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (key && value) {
            onAdd(key, value);
            setKey('');
            setValue('');
        }
    };

    return (
        <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">Agregar Nueva Traducción</h3>
            <form onSubmit={handleSubmit} className="flex gap-4">
                <input
                    type="text"
                    placeholder="Namespace"
                    value={namespace}
                    disabled
                    className="p-2 border border-gray-300 rounded w-32 bg-gray-100"
                />
                <input
                    type="text"
                    placeholder="Clave (ej: common.buttons.save)"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded"
                />
                <input
                    type="text"
                    placeholder="Valor de traducción"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded"
                />
                <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">
                    Agregar
                </button>
            </form>
        </div>
    );
}
