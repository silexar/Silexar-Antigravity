'use client';
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
interface Campana { id: string; nombre: string; estado: string; }
export const CampanasListado: React.FC<{ campanas?: Campana[]; onSelect?: (id: string) => void }> = ({ campanas = [], onSelect }) => (
    <div className="space-y-2">{campanas.map(c => (
        <Card key={c.id}><CardContent className="p-4 flex justify-between items-center"><span>{c.nombre} - {c.estado}</span><Button size="sm" onClick={() => onSelect?.(c.id)}>Ver</Button></CardContent></Card>
    ))}</div>
);
export default CampanasListado;
