'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Volume2 } from 'lucide-react';
export const VoiceSynthesizer: React.FC<{ className?: string }> = ({ className = '' }) => (
    <Card className={className}>
        <CardHeader><CardTitle className="flex items-center gap-2"><Volume2 className="w-5 h-5" />Voice Synthesizer</CardTitle></CardHeader>
        <CardContent><p className="text-sm text-gray-500">Síntesis de voz Cortex</p></CardContent>
    </Card>
);
export default VoiceSynthesizer;