/**
 * SILEXAR PULSE - TIER0+ CREACIÓN EXPRESS MÓVIL
 * Componente de Creación Rápida de Contratos para Móvil
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Send, X } from 'lucide-react';

interface CreacionExpressMovilProps {
    readonly onSubmit?: (data: Record<string, unknown>) => void;
    readonly onCancel?: () => void;
    readonly className?: string;
}

const CreacionExpressMovil: React.FC<CreacionExpressMovilProps> = ({ 
    onSubmit, 
    onCancel, 
    className = '' 
}) => {
    const [anunciante, setAnunciante] = useState('');
    const [valor, setValor] = useState('');
    const [enviando, setEnviando] = useState(false);

    const handleSubmit = async () => {
        if (!anunciante || !valor) return;
        setEnviando(true);
        try {
            onSubmit?.({ anunciante, valor: Number(valor) });
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div className={`p-4 ${className}`}>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Plus className="w-5 h-5" />
                            Creación Express
                        </CardTitle>
                        {onCancel && (
                            <Button variant="ghost" size="sm" onClick={onCancel}>
                                <X className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="anunciante">Anunciante</Label>
                        <Input
                            id="anunciante"
                            value={anunciante}
                            onChange={(e) => setAnunciante(e.target.value)}
                            placeholder="Nombre del anunciante"
                        />
                    </div>
                    <div>
                        <Label htmlFor="valor">Valor</Label>
                        <Input
                            id="valor"
                            type="number"
                            value={valor}
                            onChange={(e) => setValor(e.target.value)}
                            placeholder="Valor del contrato"
                        />
                    </div>
                    <Button 
                        onClick={handleSubmit} 
                        disabled={enviando || !anunciante || !valor}
                        className="w-full"
                    >
                        <Send className="w-4 h-4 mr-2" />
                        {enviando ? 'Creando...' : 'Crear Contrato'}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default CreacionExpressMovil;