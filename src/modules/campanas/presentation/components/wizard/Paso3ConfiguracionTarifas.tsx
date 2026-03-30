'use client';
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
interface Paso3Props { tarifaBase: number; onChange: (field: 'tarifaBase', value: number) => void; }
export const Paso3ConfiguracionTarifas: React.FC<Paso3Props> = ({ tarifaBase, onChange }) => (
    <div className="space-y-4">
        <div><Label>Tarifa Base ($)</Label><Input type="number" value={tarifaBase || ''} onChange={e => onChange('tarifaBase', Number(e.target.value))} /></div>
    </div>
);
export default Paso3ConfiguracionTarifas;
