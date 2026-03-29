'use client';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
interface Observacion { id: string; texto: string; autor: string; }
export const ObservacionesColaboracionTier0: React.FC<{ observaciones?: Observacion[]; onAdd?: (texto: string) => void; className?: string }> = ({ observaciones = [], onAdd, className = '' }) => {
    const [texto, setTexto] = useState('');
    const handleAdd = () => { if (texto.trim()) { onAdd?.(texto); setTexto(''); } };
    return (
        <Card className={className}>
            <CardHeader><CardTitle className="flex items-center gap-2"><MessageSquare className="w-5 h-5" />Observaciones</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                {observaciones.map(o => <div key={o.id} className="p-2 bg-gray-50 rounded text-sm"><p>{o.texto}</p><p className="text-xs text-gray-400 mt-1">{o.autor}</p></div>)}
                <div className="flex gap-2"><Input value={texto} onChange={e => setTexto(e.target.value)} placeholder="Agregar observación..." /><Button onClick={handleAdd}><Send className="w-4 h-4" /></Button></div>
            </CardContent>
        </Card>
    );
};
export default ObservacionesColaboracionTier0;
