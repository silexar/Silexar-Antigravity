'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, ImageIcon, Plus, X, Send, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Cuenta {
  id: string;
  plataforma: string;
  accountName?: string;
}

interface Props {
  cuentas: Cuenta[];
  onCrear: (data: {
    connectionId: string;
    contenido: string;
    hashtags: string[];
    mediaUrls: string[];
    estado: 'borrador' | 'programada';
    scheduledAt?: Date;
  }) => void;
}

export const ComposerPublicacion: React.FC<Props> = ({ cuentas, onCrear }) => {
  const [connectionId, setConnectionId] = useState('');
  const [contenido, setContenido] = useState('');
  const [hashtagInput, setHashtagInput] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [mediaInput, setMediaInput] = useState('');
  const [programar, setProgramar] = useState(false);
  const [scheduledAt, setScheduledAt] = useState<Date>();
  const [enviando, setEnviando] = useState(false);

  const addHashtag = () => {
    const tag = hashtagInput.trim().replace(/^#/, '');
    if (!tag || hashtags.includes(tag)) return;
    setHashtags([...hashtags, tag]);
    setHashtagInput('');
  };

  const addMedia = () => {
    const url = mediaInput.trim();
    if (!url || mediaUrls.includes(url)) return;
    setMediaUrls([...mediaUrls, url]);
    setMediaInput('');
  };

  const handleSubmit = async () => {
    if (!connectionId || !contenido.trim()) return;
    setEnviando(true);
    await onCrear({
      connectionId,
      contenido,
      hashtags,
      mediaUrls,
      estado: programar && scheduledAt ? 'programada' : 'borrador',
      scheduledAt: programar && scheduledAt ? scheduledAt : undefined,
    });
    setEnviando(false);
    // Reset
    setConnectionId('');
    setContenido('');
    setHashtags([]);
    setMediaUrls([]);
    setProgramar(false);
    setScheduledAt(undefined);
  };

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Send className="w-5 h-5 text-indigo-500" />
          Crear Publicación
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <Label>Cuenta RRSS</Label>
          <Select value={connectionId} onValueChange={setConnectionId}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Selecciona una cuenta conectada" />
            </SelectTrigger>
            <SelectContent>
              {cuentas.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.accountName || c.id} ({c.plataforma})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Contenido</Label>
          <Textarea
            value={contenido}
            onChange={(e) => setContenido(e.target.value)}
            placeholder="Escribe el contenido de tu publicación..."
            className="mt-1 min-h-[120px]"
          />
        </div>

        <div>
          <Label className="mb-1 block">Hashtags</Label>
          <div className="flex gap-2">
            <Input
              value={hashtagInput}
              onChange={(e) => setHashtagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addHashtag())}
              placeholder="Agregar hashtag"
            />
            <Button type="button" variant="outline" onClick={addHashtag}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {hashtags.map((h) => (
              <Badge key={h} variant="secondary" className="gap-1">
                #{h}
                <button onClick={() => setHashtags(hashtags.filter((t) => t !== h))}>
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <Label className="mb-1 block">Media URLs</Label>
          <div className="flex gap-2">
            <Input
              value={mediaInput}
              onChange={(e) => setMediaInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addMedia())}
              placeholder="https://..."
            />
            <Button type="button" variant="outline" onClick={addMedia}>
              <ImageIcon className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {mediaUrls.map((url, idx) => (
              <Badge key={idx} variant="outline" className="gap-1 max-w-[200px] truncate">
                {url}
                <button onClick={() => setMediaUrls(mediaUrls.filter((_, i) => i !== idx))}>
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={programar}
              onChange={(e) => setProgramar(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm">Programar publicación</span>
          </label>
          {programar && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <CalendarIcon className="w-4 h-4" />
                  {scheduledAt ? format(scheduledAt, 'PPP HH:mm', { locale: es }) : 'Seleccionar fecha'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={scheduledAt}
                  onSelect={(date) => {
                    if (date) {
                      const now = new Date();
                      date.setHours(now.getHours() + 1);
                      date.setMinutes(0);
                      setScheduledAt(date);
                    }
                  }}
                  initialFocus
                />
                <div className="p-3 border-t">
                  <Label className="text-xs">Hora</Label>
                  <Input
                    type="time"
                    className="mt-1"
                    onChange={(e) => {
                      if (scheduledAt && e.target.value) {
                        const [h, m] = e.target.value.split(':').map(Number);
                        const d = new Date(scheduledAt);
                        d.setHours(h, m);
                        setScheduledAt(d);
                      }
                    }}
                  />
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>

        <div className="pt-2">
          <Button
            className="w-full"
            disabled={!connectionId || !contenido.trim() || enviando || (programar && !scheduledAt)}
            onClick={handleSubmit}
          >
            {programar ? (
              <>
                <Clock className="w-4 h-4 mr-2" />
                Programar Publicación
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Guardar Borrador
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
