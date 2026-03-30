import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ArrowRight, Smartphone, Radio, Monitor, X } from 'lucide-react';
import { StepProps } from '../types';

interface JourneyStep {
    id: string;
    type: 'FM_SPOT' | 'PUSH_NOTIF' | 'VIDEO_AD' | 'EMAIL';
    delayMinutes: number;
}

export const StepJourneyCrossDevice: React.FC<StepProps> = () => {
    // Local state for the builder (could be moved to main state if persistence needed)
    const [steps, setSteps] = useState<JourneyStep[]>([
        { id: '1', type: 'FM_SPOT', delayMinutes: 0 }
    ]);

    const addStep = (type: JourneyStep['type']) => {
        setSteps([...steps, { id: Date.now().toString(), type, delayMinutes: 5 }]);
    };

    const removeStep = (id: string) => {
        setSteps(steps.filter(s => s.id !== id));
    };

    const getIcon = (type: JourneyStep['type']) => {
        switch(type) {
            case 'FM_SPOT': return <Radio className="w-5 h-5 text-blue-600" />;
            case 'PUSH_NOTIF': return <Smartphone className="w-5 h-5 text-violet-600" />;
            case 'VIDEO_AD': return <Monitor className="w-5 h-5 text-indigo-600" />;
            default: return <Radio className="w-5 h-5" />;
        }
    };

    const getLabel = (type: JourneyStep['type']) => {
        switch(type) {
            case 'FM_SPOT': return 'Spot Radial FM';
            case 'PUSH_NOTIF': return 'Notificación Push';
            case 'VIDEO_AD': return 'Video Retargeting';
            case 'EMAIL': return 'Email Follow-up';
            default: return type;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <ArrowRight className="text-indigo-600" />
                        Sequence Builder
                    </h2>
                    <p className="text-muted-foreground text-sm">
                        Diseña el viaje del usuario a través de múltiples puntos de contacto.
                    </p>
                </div>
            </div>

            <div className="bg-slate-50 border rounded-xl p-8 min-h-[300px] overflow-x-auto">
                <div className="flex items-center gap-4">
                    {steps.map((step, index) => (
                        <div key={step.id} className="flex items-center gap-4 animate-in fade-in slide-in-from-left-4">
                            {/* Step Card */}
                            <Card className="w-64 relative group hover:shadow-md transition-all border-l-4 border-l-primary">
                                {index > 0 && (
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600 hover:bg-red-50"
                                        onClick={() => removeStep(step.id)}
                                    >
                                        <X className="w-3 h-3" />
                                    </Button>
                                )}
                                <CardHeader className="p-4 pb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 rounded-full bg-slate-100">
                                            {getIcon(step.type)}
                                        </div>
                                        <span className="font-semibold text-sm">Paso {index + 1}</span>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 pt-2">
                                    <p className="font-medium">{getLabel(step.type)}</p>
                                    {index > 0 && (
                                        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                                            <span className="font-mono bg-slate-100 px-1 rounded">+{step.delayMinutes}m</span> después del anterior
                                        </p>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Arrow Connector */}
                            {index < steps.length - 1 && (
                                <div className="text-slate-300">
                                    <ArrowRight className="w-8 h-8" />
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Add Button */}
                    <div className="flex flex-col gap-2 ml-4">
                        <Button variant="outline" size="sm" onClick={() => addStep('PUSH_NOTIF')} className="justify-start gap-2">
                            <Plus className="w-3 h-3" /> Add Digital Push
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => addStep('VIDEO_AD')} className="justify-start gap-2">
                            <Plus className="w-3 h-3" /> Add Video Ad
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex gap-4 p-4 bg-yellow-50 text-yellow-800 rounded border border-yellow-200 text-sm">
                <Monitor className="w-4 h-4 mt-0.5" />
                <p>
                    <strong>Nota:</strong> Esta secuencia se ejecutará automáticamente usando el motor de orquestación. 
                    Asegúrate de tener los activos cargados para cada paso.
                </p>
            </div>
        </div>
    );
};
