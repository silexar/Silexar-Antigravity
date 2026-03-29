import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, ShieldAlert, History as HistoryIcon } from 'lucide-react';
import { StepProps } from '../types';


export const StepGestionDocumental: React.FC<StepProps> = ({ data }) => {
    
    // Mock Data simulating legacy system history
    const history = data.auditLog || [
        { user: 'Jhonson Soto', action: 'Campaña Creada', timestamp: new Date(Date.now() - 86400000).toLocaleString() },
        { user: 'System AI', action: 'Validación de Conflictos OK', timestamp: new Date(Date.now() - 3600000).toLocaleString() },
    ];

    const docs = data.documents || [
        { name: 'Orden_Compra_Ford_2026.pdf', type: 'application/pdf', date: '29/01/2026' }
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Panel Documental */}
                <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="pb-3 border-b bg-slate-50">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-base flex items-center gap-2">
                                <FileText className="w-4 h-4 text-blue-600" />
                                Documentación Legal / Soportes
                            </CardTitle>
                            <Button size="sm" variant="outline" className="h-8 gap-2">
                                <Upload className="w-3 h-3" /> Subir
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="space-y-3">
                            {docs.map((doc, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-white border rounded-lg hover:shadow-md transition-shadow group cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-red-50 rounded">
                                            <FileText className="w-5 h-5 text-red-500" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm text-slate-800 group-hover:text-blue-600 transition-colors">{doc.name}</p>
                                            <p className="text-xs text-slate-400">{doc.date} • {doc.type}</p>
                                        </div>
                                    </div>
                                    <Badge variant="secondary" className="text-[10px]">Validado</Badge>
                                </div>
                            ))}
                            <div className="text-center p-8 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 text-sm hover:border-slate-300 transition-colors cursor-pointer">
                                Arrastra archivos aquí (OC, Contratos, Guiones)
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Log de Auditoría (Safety) */}
                <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="pb-3 border-b bg-slate-50">
                        <CardTitle className="text-base flex items-center gap-2">
                            <HistoryIcon className="w-4 h-4 text-amber-600" />
                            Auditoría de Cambios
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="space-y-4 relative before:absolute before:left-[19px] before:top-2 before:h-full before:w-[2px] before:bg-slate-100">
                            {history.map((log, idx) => (
                                <div key={idx} className="relative flex items-start gap-4">
                                    <div className="z-10 w-10 h-10 rounded-full bg-white border-2 border-slate-100 flex items-center justify-center shrink-0">
                                        <ShieldAlert className="w-4 h-4 text-slate-400" />
                                    </div>
                                    <div className="pt-1">
                                        <p className="text-sm font-semibold text-slate-700">{log.action}</p>
                                        <p className="text-xs text-slate-500">
                                            <span className="font-medium text-slate-900">{log.user}</span> • {log.timestamp}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
