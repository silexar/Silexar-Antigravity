'use client';
import React from 'react';
export interface Columna { id: string; nombre: string; visible: boolean; }
export const ColumnasEspecificas: React.FC<{ columnas?: Columna[]; onToggle?: (id: string) => void }> = ({ columnas = [], onToggle }) => (
    <div className="flex flex-wrap gap-2">{columnas.map(c => <label key={c.id} className="flex items-center gap-1 text-sm"><input type="checkbox" checked={c.visible} onChange={() => onToggle?.(c.id)} />{c.nombre}</label>)}</div>
);
export default ColumnasEspecificas;