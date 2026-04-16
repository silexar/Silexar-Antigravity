'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, Globe, Briefcase, AtSign, Play, Music2, Send, Trash2 } from 'lucide-react';

const ICONOS: Record<string, React.ElementType> = {
  instagram: Camera,
  facebook: Globe,
  tiktok: Music2,
  linkedin: Briefcase,
  twitter: AtSign,
  youtube: Play,
};

const COLORES: Record<string, string> = {
  instagram: 'text-pink-600',
  facebook: 'text-blue-600',
  tiktok: 'text-rose-600',
  linkedin: 'text-sky-700',
  twitter: 'text-slate-800',
  youtube: 'text-red-600',
};

const ESTADO_COLORS: Record<string, string> = {
  borrador: 'bg-slate-100 text-slate-700',
  programada: 'bg-amber-100 text-amber-700',
  publicada: 'bg-emerald-100 text-emerald-700',
  fallida: 'bg-red-100 text-red-700',
  cancelada: 'bg-gray-100 text-gray-500',
};

interface Publicacion {
  id: string;
  plataforma: string;
  accountName?: string;
  contenido: string;
  estado: string;
  scheduledAt?: string;
  publishedAt?: string;
  externalPostUrl?: string;
}

interface Props {
  publicaciones: Publicacion[];
  onPublicarAhora: (id: string) => void;
  onEliminar: (id: string) => void;
}

export const ListaPublicacionesRrss: React.FC<Props> = ({ publicaciones, onPublicarAhora, onEliminar }) => {
  if (publicaciones.length === 0) {
    return (
      <Card className="border-slate-200">
        <CardContent className="py-12 text-center">
          <p className="text-slate-500">No hay publicaciones creadas aún.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {publicaciones.map((pub) => {
        const Icon = ICONOS[pub.plataforma] || Send;
        const color = COLORES[pub.plataforma] || 'text-slate-600';

        return (
          <Card key={pub.id} className="border-slate-200">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-slate-50">
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800">{pub.accountName || pub.plataforma}</span>
                      <Badge className={ESTADO_COLORS[pub.estado] || 'bg-slate-100'}>{pub.estado}</Badge>
                    </div>
                    <p className="text-sm text-slate-600 mt-1 line-clamp-2">{pub.contenido}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                      {pub.scheduledAt && <span>Programada: {new Date(pub.scheduledAt).toLocaleString('es-CL')}</span>}
                      {pub.publishedAt && <span>Publicada: {new Date(pub.publishedAt).toLocaleString('es-CL')}</span>}
                    </div>
                    {pub.externalPostUrl && (
                      <a
                        href={pub.externalPostUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-indigo-600 hover:underline mt-1 inline-block"
                      >
                        Ver publicación →
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {pub.estado === 'borrador' || pub.estado === 'programada' ? (
                    <Button size="sm" variant="outline" onClick={() => onPublicarAhora(pub.id)}>
                      <Send className="w-4 h-4 mr-1" />
                      Publicar
                    </Button>
                  ) : null}
                  {pub.estado !== 'publicada' && (
                    <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700" onClick={() => onEliminar(pub.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
