'use client';
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Paso2Props { nombre: string; descripcion: string; onChange: (field: 'nombre' | 'descripcion', value: string) => void; }

export const Paso2InformacionGeneral: React.FC<Paso2Props> = ({ nombre, descripcion, onChange }) => (
    <div className="space-y-4">
        <div><Label>Nombre de la Campaña</Label><Input value={nombre} onChange={e => onChange('nombre', e.target.value)} /></div>
        <div><Label>Descripción</Label><Input value={descripcion} onChange={e => onChange('descripcion', e.target.value)} /></div>
    </div>
);
export default Paso2InformacionGeneral;
