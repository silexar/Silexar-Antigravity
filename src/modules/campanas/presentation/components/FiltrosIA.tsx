'use client';
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sparkles, Search } from 'lucide-react';
export const FiltrosIA: React.FC<{ onFilter?: (filtro: string) => void; className?: string }> = ({ onFilter, className = '' }) => {
    const [filtro, setFiltro] = useState('');
    return (
        <div className={`flex gap-2 ${className}`}>
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><Input className="pl-10" value={filtro} onChange={e => setFiltro(e.target.value)} placeholder="Filtro IA..." /></div>
            <Button onClick={() => onFilter?.(filtro)}><Sparkles className="w-4 h-4 mr-1" />Aplicar IA</Button>
        </div>
    );
};
export default FiltrosIA;
