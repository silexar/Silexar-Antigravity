'use client';
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search, Sparkles } from 'lucide-react';
export const BusquedaInteligente: React.FC<{ onSearch?: (query: string) => void; className?: string }> = ({ onSearch, className = '' }) => {
    const [query, setQuery] = useState('');
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => { setQuery(e.target.value); onSearch?.(e.target.value); };
    return (
        <div className={`relative ${className}`}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input className="pl-10 pr-10" placeholder="Búsqueda inteligente..." value={query} onChange={handleChange} />
            <Sparkles className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
        </div>
    );
};
export default BusquedaInteligente;
