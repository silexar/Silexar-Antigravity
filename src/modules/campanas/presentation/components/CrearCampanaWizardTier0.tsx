'use client';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
interface WizardProps { onComplete?: (data: Record<string, string>) => void; }
export const CrearCampanaWizardTier0: React.FC<WizardProps> = ({ onComplete }) => {
    const [step, setStep] = useState(0);
    const [data, setData] = useState<Record<string, string>>({});
    const steps = ['Información', 'Configuración', 'Confirmación'];
    const handleNext = () => { if (step < steps.length - 1) setStep(step + 1); else onComplete?.(data); };
    return (
        <Card><CardHeader><CardTitle>Crear Campaña - {steps[step]}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
            <div><Label>Campo {step + 1}</Label><Input value={data[`field${step}`] || ''} onChange={e => setData({ ...data, [`field${step}`]: e.target.value })} /></div>
            <div className="flex gap-2">{step > 0 && <Button variant="outline" onClick={() => setStep(step - 1)}>Anterior</Button>}<Button onClick={handleNext}>{step === steps.length - 1 ? 'Guardar' : 'Siguiente'}</Button></div>
        </CardContent></Card>
    );
};
export default CrearCampanaWizardTier0;
