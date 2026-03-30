'use client';
import React from 'react';
import { CheckCircle, Clock, XCircle, Pause } from 'lucide-react';
interface EstadoVisual { estado: 'ACTIVA' | 'PAUSADA' | 'FINALIZADA' | 'PENDIENTE'; }
export const EstadosVisuales: React.FC<EstadoVisual & { className?: string }> = ({ estado, className = '' }) => {
    const config = { ACTIVA: { icon: <CheckCircle className="w-4 h-4" />, color: 'text-green-600' }, PAUSADA: { icon: <Pause className="w-4 h-4" />, color: 'text-yellow-600' }, FINALIZADA: { icon: <XCircle className="w-4 h-4" />, color: 'text-gray-400' }, PENDIENTE: { icon: <Clock className="w-4 h-4" />, color: 'text-blue-600' } };
    const c = config[estado];
    return <span className={`flex items-center gap-1 ${c.color} ${className}`}>{c.icon}{estado}</span>;
};
export default EstadosVisuales;