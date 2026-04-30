/**
 * Language Selector Component
 * Silexar Pulse - i18n System
 */

'use client';

import React from 'react';

interface Language {
    code: string;
    name: string;
    nativeName: string;
    flagEmoji: string;
}

interface LanguageSelectorProps {
    languages: Language[];
    selectedLanguage: string;
    onChange: (code: string) => void;
    tenantDefault?: string;
}

export function LanguageSelector({
    languages,
    selectedLanguage,
    onChange,
    tenantDefault
}: LanguageSelectorProps) {
    return (
        <div className="flex items-center gap-2">
            <select
                value={selectedLanguage}
                onChange={(e) => onChange(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg bg-white"
            >
                {languages.map(lang => (
                    <option key={lang.code} value={lang.code}>
                        {lang.flagEmoji} {lang.nativeName}
                    </option>
                ))}
            </select>
            {tenantDefault && tenantDefault !== selectedLanguage && (
                <button
                    onClick={() => onChange(tenantDefault)}
                    className="text-xs text-blue-600 hover:text-blue-800"
                    title="Cambiar al idioma predeterminado del tenant"
                >
                    Restaurar predeterminado
                </button>
            )}
        </div>
    );
}

export function LanguageBadge({ language }: { language: Language }) {
    return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-sm">
            <span>{language.flagEmoji}</span>
            <span>{language.code.toUpperCase()}</span>
        </span>
    );
}

export function LanguageSwitcher({
    languages,
    currentLanguage,
    onSwitch
}: {
    languages: Language[];
    currentLanguage: string;
    onSwitch: (code: string) => void;
}) {
    return (
        <div className="flex items-center gap-1">
            {languages.map(lang => (
                <button
                    key={lang.code}
                    onClick={() => onSwitch(lang.code)}
                    className={`p-2 rounded-lg transition ${currentLanguage === lang.code
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                    title={`${lang.name} (${lang.nativeName})`}
                >
                    <span className="text-lg">{lang.flagEmoji}</span>
                </button>
            ))}
        </div>
    );
}