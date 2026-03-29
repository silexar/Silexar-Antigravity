'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, TrendingUp, BarChart3 } from 'lucide-react';
export default function InteligenciaNegociosPage() {
    return (
        <div className="container mx-auto py-8">
            <h1 className="text-2xl font-bold flex items-center gap-2 mb-6"><Brain className="w-6 h-6" />Inteligencia de Negocios</h1>
            <div className="grid md:grid-cols-2 gap-6">
                <Card><CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5" />Insights</CardTitle></CardHeader><CardContent><p className="text-gray-500">Análisis de negocio en tiempo real</p></CardContent></Card>
                <Card><CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="w-5 h-5" />Reportes</CardTitle></CardHeader><CardContent><p className="text-gray-500">Reportes ejecutivos automatizados</p></CardContent></Card>
            </div>
        </div>
    );
}