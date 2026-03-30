'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic } from 'lucide-react';

export const AudioAnalyzer: React.FC<{ className?: string }> = ({ className = '' }) => (
    <Card className={className}>
        <CardHeader><CardTitle className="flex items-center gap-2"><Mic className="w-5 h-5" />Análisis de Audio</CardTitle></CardHeader>
        <CardContent><p className="text-sm text-gray-500">Analizador de audio Cortex activo</p></CardContent>
    </Card>
);
export default AudioAnalyzer;