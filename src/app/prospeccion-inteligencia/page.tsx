'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Brain } from 'lucide-react';
export default function ProspeccionInteligenciaPage() {
    return (
        <div className="container mx-auto py-8">
            <h1 className="text-2xl font-bold flex items-center gap-2 mb-6"><Search className="w-6 h-6" />Prospección Inteligente</h1>
            <Card><CardHeader><CardTitle className="flex items-center gap-2"><Brain className="w-5 h-5" />IA de Prospección</CardTitle></CardHeader><CardContent><p className="text-gray-500">Identificación inteligente de oportunidades</p></CardContent></Card>
        </div>
    );
}