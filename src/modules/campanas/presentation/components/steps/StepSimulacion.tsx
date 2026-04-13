import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle2, PlayCircle, BarChart3, ShieldCheck } from 'lucide-react';
import { StepProps } from '../types';

export const StepSimulacion: React.FC<StepProps> = () => {
    const [status, setStatus] = useState<'IDLE' | 'RUNNING' | 'COMPLETE'>('IDLE');
    const [progress, setProgress] = useState(0);
    const [, setMetrics] = useState({ reach: 0, safety: 0 });

    const runSimulation = () => {
        setStatus('RUNNING');
        setProgress(0);
        
        // Simular proceso de análisis
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setStatus('COMPLETE');
                    setMetrics({ reach: 89, safety: 100 });
                    return 100;
                }
                return prev + 5; // Rapido para UX
            });
        }, 100);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between p-4 bg-indigo-50 border border-indigo-100 rounded-lg">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-100 rounded-full">
                        <ShieldCheck className="w-8 h-8 text-indigo-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-indigo-900">Safety Simulation Mode</h2>
                        <p className="text-sm text-indigo-700">
                            Verifica conflictos de pauta y cumplimiento de políticas antes de salir al aire.
                        </p>
                    </div>
                </div>
                {status === 'IDLE' && (
                    <Button onClick={runSimulation} size="lg" className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                        <PlayCircle className="w-5 h-5" /> Ejecutar Simulación
                    </Button>
                )}
            </div>

            {status !== 'IDLE' && (
                <Card className="border-t-4 border-t-indigo-500 shadow-md">
                    <CardHeader>
                        <CardTitle className="flex justify-between">
                            <span>Analizando Impacto...</span>
                            <span className="font-mono text-sm text-muted-foreground">{progress}%</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Progress value={progress} className="h-4" />
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Log de Consola Simulado */}
                            <div className="md:col-span-2 bg-[#F0EDE8] rounded-lg p-4 font-mono text-xs text-green-400 h-[200px] overflow-y-auto">
                                <p>&gt; Initializing Quantum Core...</p>
                                <p className={progress > 10 ? 'opacity-100' : 'opacity-0'}>[OK] Contract Validity Check</p>
                                <p className={progress > 30 ? 'opacity-100' : 'opacity-0'}>[OK] FM Grid Collision Detection: 0 Conflicts</p>
                                <p className={progress > 50 ? 'opacity-100' : 'opacity-0'}>[OK] Digital Asset Resolution: 1080p Verified</p>
                                <p className={progress > 70 ? 'opacity-100' : 'opacity-0'}>[WARN] Battery Targeting &lt; 15% (Acceptable)</p>
                                <p className={progress > 90 ? 'opacity-100' : 'opacity-0'}>[OK] Neuromorphic Sync: Calibrated</p>
                                {status === 'COMPLETE' && (
                                    <p className="text-white font-bold mt-2">&gt;&gt; SIMULATION COMPLETE. SYSTEM READY.</p>
                                )}
                            </div>

                            {/* Resultados */}
                            <div className="space-y-4">
                                <div className={`p-4 rounded-lg bg-slate-50 border transition-opacity duration-500 ${status === 'COMPLETE' ? 'opacity-100' : 'opacity-50'}`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <BarChart3 className="w-5 h-5 text-blue-600" />
                                        <span className="font-semibold text-sm">Alcance Estimado</span>
                                    </div>
                                    <div className="text-3xl font-bold">{status === 'COMPLETE' ? '89%' : '--'}</div>
                                </div>
                                
                                <div className={`p-4 rounded-lg bg-green-50 border border-green-100 transition-opacity duration-500 ${status === 'COMPLETE' ? 'opacity-100' : 'opacity-50'}`}>
                                    <div className="flex items-center gap-2 mb-2 text-green-700">
                                        <CheckCircle2 className="w-5 h-5" />
                                        <span className="font-semibold text-sm">Safety Score</span>
                                    </div>
                                    <div className="text-3xl font-bold text-green-700">{status === 'COMPLETE' ? '100/100' : '--'}</div>
                                </div>
                            </div>
                        </div>

                        {status === 'COMPLETE' && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center animate-pulse">
                                <AlertCircle className="w-4 h-4" />
                                <span>Simulación completada. Puedes proceder a confirmar.</span>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

