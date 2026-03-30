'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain } from 'lucide-react';
export const IntelligentAssistantComponent: React.FC<{ className?: string }> = ({ className = '' }) => (
    <Card className={className}>
        <CardHeader><CardTitle className="flex items-center gap-2"><Brain className="w-5 h-5" />Asistente Inteligente</CardTitle></CardHeader>
        <CardContent><p className="text-gray-500">Asistente de IA avanzado</p></CardContent>
    </Card>
);
export default IntelligentAssistantComponent;