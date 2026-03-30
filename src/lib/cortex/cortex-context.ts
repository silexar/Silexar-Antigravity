/**
 * SILEXAR PULSE - TIER0+ CORTEX CONTEXT
 * Contexto de Sistema Cortex
 */

'use client';

import React, { createContext, useContext, useState, type ReactNode } from 'react';

interface CortexState {
    readonly initialized: boolean;
    readonly activeModules: string[];
    readonly performance: number;
}

interface CortexContextType {
    state: CortexState;
    initialize: () => Promise<void>;
    shutdown: () => Promise<void>;
}

const CortexContext = createContext<CortexContextType | null>(null);

interface CortexProviderProps {
    children: ReactNode;
}

export const CortexProvider: React.FC<CortexProviderProps> = ({ children }) => {
    const [state, setState] = useState<CortexState>({
        initialized: false,
        activeModules: [],
        performance: 100,
    });

    const initialize = async () => {
        setState(prev => ({ ...prev, initialized: true }));
    };

    const shutdown = async () => {
        setState(prev => ({ ...prev, initialized: false }));
    };

    return React.createElement(
        CortexContext.Provider,
        { value: { state, initialize, shutdown } },
        children
    );
};

export const useCortex = (): CortexContextType => {
    const context = useContext(CortexContext);
    if (!context) {
        throw new Error('useCortex must be used within CortexProvider');
    }
    return context;
};

export default CortexProvider;