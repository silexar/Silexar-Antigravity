'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, CheckCircle } from 'lucide-react';
export const ConfirmacionHorariaTier0: React.FC<{ className?: string }> = ({ className = '' }) => (
    <Card className={className}>
        <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="w-5 h-5" />Confirmación Horaria</CardTitle></CardHeader>
        <CardContent className="flex items-center gap-2 text-green-600"><CheckCircle className="w-5 h-5" /><span>Horarios confirmados</span></CardContent>
    </Card>
);
export default ConfirmacionHorariaTier0;
