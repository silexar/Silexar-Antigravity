'use client';
import React from 'react';
import { Label } from '@/components/ui/label';
interface Paso1Props { origen: string; onChange: (field: 'origen', value: string) => void; }
export const Paso1OrigenCampana: React.FC<Paso1Props> = ({ origen, onChange }) => (
    <div className="space-y-4">
        <div><Label>Origen de la Campaña</Label><select className="w-full border rounded p-2" value={origen} onChange={e => onChange('origen', e.target.value)}><option value="">Seleccionar...</option><option value="NUEVO">Nuevo</option><option value="RENOVACION">Renovación</option></select></div>
    </div>
);
export default Paso1OrigenCampana;
