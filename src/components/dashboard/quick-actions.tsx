'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FileText, BarChart3, Settings } from 'lucide-react';

interface QuickAction { label: string; icon: React.ReactNode; onClick?: () => void; }

const actions: QuickAction[] = [
    { label: 'Nueva Campaña', icon: <Plus className="w-4 h-4" /> },
    { label: 'Ver Reportes', icon: <BarChart3 className="w-4 h-4" /> },
    { label: 'Contratos', icon: <FileText className="w-4 h-4" /> },
    { label: 'Configuración', icon: <Settings className="w-4 h-4" /> },
];

export const QuickActions: React.FC<{ className?: string }> = ({ className = '' }) => (
    <Card className={className}>
        <CardHeader><CardTitle>Acciones Rápidas</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-2">
            {actions.map(a => <Button key={a.label} variant="outline" className="flex items-center gap-2" onClick={a.onClick}>{a.icon}{a.label}</Button>)}
        </CardContent>
    </Card>
);
export default QuickActions;