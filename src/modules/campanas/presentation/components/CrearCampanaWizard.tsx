// @ts-nocheck

'use client';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
// Steps
import { StepSeleccionTipo } from './steps/StepSeleccionTipo';
import { StepTargetingDigital } from './steps/StepTargetingDigital';
import { StepConfiguracionNeuromorfica } from './steps/StepConfiguracionNeuromorfica';
import { StepJourneyCrossDevice } from './steps/StepJourneyCrossDevice';
import { CampanaService } from '../services/CampanaService';
import { toast } from 'sonner';
import { StepPautaRealFM } from './steps/StepPautaRealFM';
import { StepDatosGenerales } from './steps/StepDatosGenerales';
import { StepSimulacion } from './steps/StepSimulacion';
import { StepGestionDocumental } from './steps/StepGestionDocumental';
import { StepRevision } from './steps/StepRevision';
import { CampanaLiveDeck } from './CampanaLiveDeck'; 
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { ArrowLeft, ArrowRight, Save } from 'lucide-react';
import { CampanaWizardData } from './types';

export const CrearCampanaWizard: React.FC<{ onComplete?: (d: CampanaWizardData) => void; className?: string }> = ({ onComplete, className = '' }) => {
    const [step, setStep] = useState(0);
    const [data, setData] = useState<CampanaWizardData>({ nombre: '', descripcion: '', tipo: null });
    const [isValidating, setIsValidating] = useState(false);

    // Definición de Pasos Dinámicos
    const getSteps = () => {
        const steps = [
            { id: 'type', title: 'Tipo de Campaña', component: StepSeleccionTipo },
            { id: 'basics', title: 'Datos Generales', component: StepDatosGenerales },
        ];

        if (data.tipo === 'FM' || data.tipo === 'HYBRID') {
            steps.push({ id: 'fm_pauta', title: 'Matriz de Pauta FM', component: StepPautaRealFM });
        }

        if (data.tipo === 'DIGITAL' || data.tipo === 'HYBRID') {
            steps.push({ id: 'digital_targeting', title: 'Deep Device Target', component: StepTargetingDigital });
            steps.push({ id: 'neuro', title: 'Neuromorphic Sync', component: StepConfiguracionNeuromorfica });
            steps.push({ id: 'journey', title: 'Cross-Device Journey', component: StepJourneyCrossDevice });
        }
        
        // Gap Closure: Administrative Step
        steps.push({ id: 'docs', title: 'Gestión Documental & Auditoría', component: StepGestionDocumental });

        steps.push({ id: 'simulation', title: 'Modo Simulación', component: StepSimulacion });
        
        steps.push({ id: 'review', title: 'Revisión y Confirmación', component: StepRevision as any });

        return steps;
    };

    const steps = getSteps();
    const currentStepDef = steps[step];
    const progress = ((step + 1) / steps.length) * 100;

    const handleNext = async () => {
        if (step < steps.length - 1) {
            setStep(step + 1);
        } else {
            // Final Step - Validation
            setIsValidating(true);
            try {
                const result = await CampanaService.validarConexiones({ 
                    ...data, 
                    contratoId: 'mock-contract-id' 
                });

                if (result.valido) {
                    toast.success('Campaña creada (Supremacy Mode)');
                    onComplete?.(data);
                } else {
                    toast.error(`Error: ${result.error}`);
                }
            } catch {
                toast.error('Error interno');
            } finally {
                setIsValidating(false);
            }
        }
    };
    
    // Key Handling - OPERATIONAL SUPREMACY
    useKeyboardShortcuts([
        {
            combo: 'ctrl+s',
            handler: () => {
                if (!isValidating) handleNext();
            },
            preventDefault: true
        },
        {
            combo: 'ctrl+arrowleft',
            handler: () => {
                if (step > 0) setStep(step - 1);
            }
        },
         {
            combo: 'ctrl+arrowright',
            handler: () => {
                 if (step < steps.length - 1) setStep(step + 1);
            }
        }
    ]);

    const handleBack = () => {
        if (step > 0) setStep(step - 1);
    };

    // Render del componente actual
    const CurrentComponent = currentStepDef.component;

    return (
        <div className={`max-w-6xl mx-auto ${className}`}>
             
             {/* LIVE FLIGHT DECK - PREMIUM FEATURE */}
             <div className="mb-8 animate-in slide-in-from-top-4 duration-700">
                <CampanaLiveDeck data={data} />
             </div>

             {/* Header / Progress with Visual Haptics */}
            <div className="mb-6 space-y-2">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
                           Crear Campaña
                        </h1>
                        <p className="text-muted-foreground flex items-center gap-2">
                            Paso {step + 1}: {currentStepDef.title}
                            <span className="text-[10px] bg-slate-100 px-1 rounded text-slate-400 font-mono hidden md:inline-block">CTRL+Arrow to nav</span>
                        </p>
                    </div>
                    <div className="text-right">
                         <span className="text-sm font-semibold text-primary">{Math.round(progress)}%</span>
                    </div>
                </div>
                <Progress value={progress} className="h-2 transition-all duration-500 ease-out" />
            </div>

            {/* Main Content with Enterprise Shadow */}
            <Card className="min-h-[600px] flex flex-col shadow-2xl border-t-4 border-t-primary transition-all duration-300">
                <CardHeader>
                    <CardTitle className="text-xl">{currentStepDef.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 p-6 relative">
                     {/* Dynamic Component Render */}
                    <CurrentComponent 
                        data={data}
                        updateData={(newData: Partial<CampanaWizardData>) => setData({ ...data, ...newData })}
                    />
                </CardContent>
                <CardFooter className="flex justify-between border-t bg-slate-50/50 p-6 backdrop-blur-sm">
                    <Button 
                        variant="outline" 
                        onClick={handleBack} 
                        disabled={step === 0}
                        className="gap-2 hover:bg-slate-100"
                        title="Atajo: Ctrl + Flecha Izquierda"
                    >
                        <ArrowLeft className="w-4 h-4" /> Anterior
                    </Button>
                    
                    <Button 
                        onClick={handleNext}
                        className="gap-2 min-w-[140px] shadow-lg shadow-blue-500/20"
                        disabled={step === 0 && !data.tipo || isValidating}
                         title={step === steps.length - 1 ? "Atajo: Ctrl + S" : "Atajo: Ctrl + Flecha Derecha"}
                    >
                        {isValidating ? 'Validando...' : (step === steps.length - 1 ? (
                            <>Confirmar <Save className="w-4 h-4" /></>
                        ) : (
                            <>Siguiente <ArrowRight className="w-4 h-4" /></>
                        ))}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};

export default CrearCampanaWizard;