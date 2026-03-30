import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Brain, Sparkles, Volume2 } from 'lucide-react';
import { StepProps } from '../types';
import { Slider } from '@/components/ui/slider';

export const StepConfiguracionNeuromorfica: React.FC<StepProps> = ({ data, updateData }) => {
    
    const updateNeuro = (key: string, val: unknown) => {
        const currentCheck = data.neuromorphicProfile || {};
        updateData({ neuromorphicProfile: { ...currentCheck, [key]: val } });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 p-4 bg-teal-50 border border-teal-100 rounded-lg">
                <Brain className="w-8 h-8 text-teal-600" />
                <div>
                    <h3 className="font-bold text-teal-900">Sincronización Neuromórfica</h3>
                    <p className="text-sm text-teal-700">
                        La IA ajustará dinámicamente el contenido para maximizar la retención según el estado cognitivo del usuario en tiempo real.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Volume2 className="w-4 h-4" /> Pacing Adaptativo
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label>Acelerar en momentos de High-Focus</Label>
                            <Switch 
                                checked={data.neuromorphicProfile?.adaptivePacing || true}
                                onCheckedChange={(c) => updateNeuro('adaptivePacing', c)}
                            />
                        </div>
                        <div className="space-y-2">
                             <Label>Max Pitch Shift (%)</Label>
                             <Slider defaultValue={[5]} max={15} step={1} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Sparkles className="w-4 h-4" /> Optimización de Tono
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label>Suavizar voz en modo "Nocturno"</Label>
                            <Switch 
                                checked={data.neuromorphicProfile?.softVoiceNight || true}
                                onCheckedChange={(c) => updateNeuro('softVoiceNight', c)}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label>Enfatizar CTA (Call to Action)</Label>
                            <Switch 
                                checked={data.neuromorphicProfile?.emphasizeCTA || true}
                                onCheckedChange={(c) => updateNeuro('emphasizeCTA', c)}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
            
            <div className="text-xs text-center text-muted-foreground pt-4">
                * Estos ajustes utilizan el motor Quantum Neural Engine en background.
            </div>
        </div>
    );
};
