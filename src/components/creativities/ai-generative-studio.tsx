'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Wand2 } from 'lucide-react';
export const AIGenerativeStudio: React.FC<{ className?: string }> = ({ className = '' }) => (
    <Card className={className}>
        <CardHeader><CardTitle className="flex items-center gap-2"><Wand2 className="w-5 h-5" />AI Generative Studio</CardTitle></CardHeader>
        <CardContent><div className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-purple-500" /><span>Generación de creatividades IA</span></div></CardContent>
    </Card>
);
export default AIGenerativeStudio;