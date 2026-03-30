'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, MessageSquare } from 'lucide-react';
export const WilTrainingInterface: React.FC<{ className?: string }> = ({ className = '' }) => (
    <Card className={className}>
        <CardHeader><CardTitle className="flex items-center gap-2"><Brain className="w-5 h-5" />WIL Training</CardTitle></CardHeader>
        <CardContent><div className="flex items-center gap-2"><MessageSquare className="w-5 h-5" /><span>Interfaz de entrenamiento WIL</span></div></CardContent>
    </Card>
);
export default WilTrainingInterface;