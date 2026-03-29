'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';
export default function ObservacionesPage() {
    return (
        <div className="container mx-auto py-8">
            <h1 className="text-2xl font-bold flex items-center gap-2 mb-6"><MessageSquare className="w-6 h-6" />Observaciones</h1>
            <Card><CardHeader><CardTitle>Observaciones de Campañas</CardTitle></CardHeader><CardContent><p className="text-gray-500">Gestión de observaciones y comentarios</p></CardContent></Card>
        </div>
    );
}
