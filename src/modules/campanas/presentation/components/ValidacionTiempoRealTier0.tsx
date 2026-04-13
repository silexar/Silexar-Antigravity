'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertCircle } from 'lucide-react';
interface ValidationResult { field: string; valid: boolean; message?: string; }
export const ValidacionTiempoRealTier0: React.FC<{ validations?: ValidationResult[] }> = ({ validations = [] }) => (
    <Card><CardHeader><CardTitle>Validación en Tiempo Real</CardTitle></CardHeader>
    <CardContent className="space-y-2">{validations.map((v, i) => (
        <div key={`${v}-${i}`} className="flex items-center gap-2">{v.valid ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-red-500" />}<span>{v.field}</span>{v.message && <span className="text-sm text-gray-500">- {v.message}</span>}</div>
    ))}</CardContent></Card>
);
export default ValidacionTiempoRealTier0;
