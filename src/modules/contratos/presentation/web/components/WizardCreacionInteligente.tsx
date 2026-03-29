'use client';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wand2, ChevronRight } from 'lucide-react';
export const WizardCreacionInteligente: React.FC<{ onComplete?: (data: unknown) => void; className?: string }> = ({ onComplete, className = '' }) => {
    const [paso, setPaso] = useState(0);
    const pasos = ['Información', 'Detalles', 'Confirmación'];
    return (
        <Card className={className}>
            <CardHeader><CardTitle className="flex items-center gap-2"><Wand2 className="w-5 h-5" />Creación Inteligente</CardTitle></CardHeader>
            <CardContent>
                <p className="text-sm text-gray-500 mb-4">Paso {paso + 1} de {pasos.length}: {pasos[paso]}</p>
                <Button onClick={() => paso < 2 ? setPaso(paso + 1) : onComplete?.({})}>
                    {paso < 2 ? <>Siguiente<ChevronRight className="w-4 h-4 ml-1" /></> : 'Finalizar'}
                </Button>
            </CardContent>
        </Card>
    );
};
export default WizardCreacionInteligente;