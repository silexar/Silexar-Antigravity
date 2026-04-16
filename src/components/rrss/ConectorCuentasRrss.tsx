'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, Globe, Briefcase, AtSign, Play, Music2, Plus, Check, Trash2 } from 'lucide-react';

const PLATAFORMAS = [
  { id: 'instagram', nombre: 'Instagram', icono: Camera, color: 'text-pink-600', bg: 'bg-pink-50' },
  { id: 'facebook', nombre: 'Facebook', icono: Globe, color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'tiktok', nombre: 'TikTok', icono: Music2, color: 'text-rose-600', bg: 'bg-rose-50' },
  { id: 'linkedin', nombre: 'LinkedIn', icono: Briefcase, color: 'text-sky-700', bg: 'bg-sky-50' },
  { id: 'twitter', nombre: 'X / Twitter', icono: AtSign, color: 'text-slate-800', bg: 'bg-slate-50' },
  { id: 'youtube', nombre: 'YouTube', icono: Play, color: 'text-red-600', bg: 'bg-red-50' },
] as const;

interface Cuenta {
  id: string;
  plataforma: string;
  accountName?: string;
  accountId: string;
}

interface Props {
  cuentas: Cuenta[];
  onConectar: (plataforma: string) => void;
  onDesconectar: (id: string) => void;
}

export const ConectorCuentasRrss: React.FC<Props> = ({ cuentas, onConectar, onDesconectar }) => {
  const [eliminando, setEliminando] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {PLATAFORMAS.map((p) => {
        const conectada = cuentas.find((c) => c.plataforma === p.id);
        const Icon = p.icono;

        return (
          <Card key={p.id} className={`border-slate-200 ${conectada ? 'shadow-sm' : 'opacity-90'}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${p.bg}`}>
                  <Icon className={`w-6 h-6 ${p.color}`} />
                </div>
                {conectada ? (
                  <Badge className="bg-emerald-100 text-emerald-700 gap-1">
                    <Check className="w-3 h-3" />
                    Conectada
                  </Badge>
                ) : (
                  <Badge variant="secondary">No conectada</Badge>
                )}
              </div>
              <CardTitle className="text-base mt-2">{p.nombre}</CardTitle>
            </CardHeader>
            <CardContent>
              {conectada ? (
                <div className="space-y-3">
                  <p className="text-sm text-slate-600 font-medium">{conectada.accountName || conectada.accountId}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-1 text-red-600 hover:text-red-700"
                    disabled={eliminando === conectada.id}
                    onClick={() => {
                      setEliminando(conectada.id);
                      onDesconectar(conectada.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                    Desconectar
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  className="w-full gap-1"
                  onClick={() => onConectar(p.id)}
                >
                  <Plus className="w-4 h-4" />
                  Conectar {p.nombre}
                </Button>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
