import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Battery, Wifi, Zap, ThermometerSun, BrainCircuit, Navigation } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { StepProps } from '../types';

export const StepTargetingDigital: React.FC<StepProps> = ({ data, updateData }) => {
    // Helpers para actualizar nested state
    const updateTargeting = (key: string, val: unknown) => {
        const currentCheck = data.adTargetingProfile || {};
        updateData({ adTargetingProfile: { ...currentCheck, [key]: val } });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <BrainCircuit className="text-violet-600" />
                        Deep Device Intelligence
                    </h2>
                    <p className="text-muted-foreground text-sm">
                        Configura las condiciones físicas y contextuales del dispositivo objetivo.
                    </p>
                </div>
            </div>

            <Tabs defaultValue="device" className="w-full">
                <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
                    <TabsTrigger value="device">Dispositivo</TabsTrigger>
                    <TabsTrigger value="context">Contexto</TabsTrigger>
                    <TabsTrigger value="mood">Emocional</TabsTrigger>
                    <TabsTrigger value="geo">Geo-Fencing</TabsTrigger>
                </TabsList>

                {/* -- DEVICE INTELLIGENCE -- */}
                <TabsContent value="device" className="space-y-4 mt-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-medium flex gap-2">
                                <Battery className="w-4 h-4" /> Estado de Energía
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <Label>Batería Mínima ({data.adTargetingProfile?.bateriaMinima || 15}%)</Label>
                                    <Slider 
                                        defaultValue={[data.adTargetingProfile?.bateriaMinima || 15]} 
                                        max={100} 
                                        step={5} 
                                        onValueChange={(vals) => updateTargeting('bateriaMinima', vals[0])}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        No mostrar anuncios de alto consumo si la batería es crítica.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-medium flex gap-2">
                                <Wifi className="w-4 h-4" /> Conectividad
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label>Solo Wi-Fi (Contenido Pesado)</Label>
                                <Switch 
                                    checked={data.adTargetingProfile?.wifiOnly || false}
                                    onCheckedChange={(c) => updateTargeting('wifiOnly', c)}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label>Excluir Redes Saturadas / Públicas</Label>
                                <Switch 
                                    checked={data.adTargetingProfile?.excludePublicWifi || true}
                                    onCheckedChange={(c) => updateTargeting('excludePublicWifi', c)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* -- CONTEXTO -- */}
                <TabsContent value="context" className="space-y-4 mt-4">
                     <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-medium flex gap-2">
                                <Navigation className="w-4 h-4" /> Estado de Movimiento
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Select 
                                value={data.adTargetingProfile?.estadoMovimiento || 'ANY'}
                                onValueChange={(v) => updateTargeting('estadoMovimiento', v)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Cualquier estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ANY">Cualquiera</SelectItem>
                                    <SelectItem value="STATIONARY">Estacionario (Sofá/Escritorio)</SelectItem>
                                    <SelectItem value="WALKING">Caminando</SelectItem>
                                    <SelectItem value="COMMUTING">Transporte Público</SelectItem>
                                    <SelectItem value="DRIVING">Conduciendo (Solo Audio)</SelectItem>
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-medium flex gap-2">
                                <ThermometerSun className="w-4 h-4" /> Clima Trigger
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-2">
                                {['Soleado', 'Lluvia', 'Nieve', 'Nublado'].map((weather) => (
                                    <div key={weather} className="flex items-center space-x-2 border p-2 rounded hover:bg-slate-50">
                                        <Switch id={`w-${weather}`} />
                                        <Label htmlFor={`w-${weather}`}>{weather}</Label>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* -- MOOD / COGNITIVE -- */}
                <TabsContent value="mood" className="space-y-4 mt-4">
                    <Card className="border-violet-200 bg-violet-50/20">
                         <CardHeader className="pb-2">
                            <CardTitle className="text-base font-medium flex gap-2 text-violet-700">
                                <Zap className="w-4 h-4" /> Vibe Targeting
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Estado de Ánimo Objetivo</Label>
                                <Select 
                                    value={data.adTargetingProfile?.mood || 'NEUTRAL'}
                                    onValueChange={(v) => updateTargeting('mood', v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar Vibe" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="HIGH_ENERGY">⚡ High Energy / Party</SelectItem>
                                        <SelectItem value="FOCUS">🧠 Focus / Productivo</SelectItem>
                                        <SelectItem value="CHILL">☕ Chill / Relax</SelectItem>
                                        <SelectItem value="MELANCHOLIC">🌧️ Melancholic / Deep</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Carga Cognitiva Máxima Aceptada</Label>
                                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                    <span>Baja (Relax)</span>
                                    <span>Alta (Multitasking)</span>
                                </div>
                                <Slider 
                                    defaultValue={[data.adTargetingProfile?.maxCognitiveLoad || 80]} 
                                    max={100} 
                                    step={10}
                                    className="accent-violet-600"
                                    onValueChange={(vals) => updateTargeting('maxCognitiveLoad', vals[0])}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* -- GEO -- */}
                <TabsContent value="geo" className="mt-4">
                    <div className="h-[300px] w-full bg-slate-100 rounded-md border flex items-center justify-center text-muted-foreground">
                        [Componente de Mapa Interactivo Placeholder]
                        {/* Aquí integraríamos Google Maps / Mapbox */}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};
