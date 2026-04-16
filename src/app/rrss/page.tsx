'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConectorCuentasRrss } from '@/components/rrss/ConectorCuentasRrss';
import { ComposerPublicacion } from '@/components/rrss/ComposerPublicacion';
import { ListaPublicacionesRrss } from '@/components/rrss/ListaPublicacionesRrss';
import { Share2, Users, Calendar, BarChart3, RefreshCw } from 'lucide-react';

interface Cuenta {
  id: string;
  plataforma: string;
  accountName?: string;
  accountId: string;
}

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

export default function RrssDashboardPage() {
  const [cuentas, setCuentas] = useState<Cuenta[]>([]);
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('cuentas');

  const fetchCuentas = useCallback(async () => {
    try {
      const res = await fetch('/api/rrss/cuentas');
      if (res.ok) {
        const data = await res.json();
        setCuentas(data.data || []);
      }
    } catch {
      // silent
    }
  }, []);

  const fetchPublicaciones = useCallback(async () => {
    try {
      const res = await fetch('/api/rrss/publicaciones');
      if (res.ok) {
        const data = await res.json();
        const pubs = (data.data || []).map((p: any) => ({
          ...p,
          plataforma: cuentas.find((c) => c.id === p.connectionId)?.plataforma || 'desconocida',
          accountName: cuentas.find((c) => c.id === p.connectionId)?.accountName,
        }));
        setPublicaciones(pubs);
      }
    } catch {
      // silent
    }
  }, [cuentas]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    await fetchCuentas();
    setLoading(false);
  }, [fetchCuentas]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    if (!loading) {
      fetchPublicaciones();
    }
  }, [loading, fetchPublicaciones]);

  const handleConectar = (plataforma: string) => {
    // Abrir OAuth flow de la plataforma
    const width = 600;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const redirectUri = `${window.location.origin}/api/rrss/callback/${plataforma}`;
    let url = '';

    if (plataforma === 'instagram' || plataforma === 'facebook') {
      const appId = process.env.NEXT_PUBLIC_META_APP_ID || '';
      const state = btoa(JSON.stringify({ tenantId: 'current', plataforma }));
      url = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=instagram_basic,instagram_content_publish,pages_read_engagement`;
    } else if (plataforma === 'tiktok') {
      const clientKey = process.env.NEXT_PUBLIC_TIKTOK_CLIENT_KEY || '';
      const state = btoa(JSON.stringify({ tenantId: 'current', plataforma }));
      url = `https://www.tiktok.com/auth/authorize?client_key=${clientKey}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=user.info.basic,video.publish`;
    } else {
      alert(`Conexión OAuth para ${plataforma} será implementada próximamente.`);
      return;
    }

    window.open(url, 'oauth', `width=${width},height=${height},left=${left},top=${top}`);
  };

  const handleDesconectar = async (id: string) => {
    try {
      const res = await fetch('/api/rrss/cuentas', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setCuentas((prev) => prev.filter((c) => c.id !== id));
      }
    } catch {
      alert('Error al desconectar cuenta');
    }
  };

  const handleCrearPublicacion = async (data: Parameters<React.ComponentProps<typeof ComposerPublicacion>['onCrear']>[0]) => {
    try {
      const res = await fetch('/api/rrss/publicaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        await fetchPublicaciones();
        setActiveTab('publicaciones');
      } else {
        alert('Error al crear publicación');
      }
    } catch {
      alert('Error al crear publicación');
    }
  };

  const handlePublicarAhora = async (id: string) => {
    try {
      const res = await fetch(`/api/rrss/publicaciones/${id}/publicar`, { method: 'POST' });
      if (res.ok) {
        await fetchPublicaciones();
      } else {
        alert('Error al publicar');
      }
    } catch {
      alert('Error al publicar');
    }
  };

  const handleEliminarPublicacion = async (id: string) => {
    if (!confirm('¿Eliminar esta publicación?')) return;
    try {
      const res = await fetch(`/api/rrss/publicaciones/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setPublicaciones((prev) => prev.filter((p) => p.id !== id));
      }
    } catch {
      alert('Error al eliminar publicación');
    }
  };

  const publicadas = publicaciones.filter((p) => p.estado === 'publicada').length;
  const programadas = publicaciones.filter((p) => p.estado === 'programada').length;
  const borradores = publicaciones.filter((p) => p.estado === 'borrador').length;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Share2 className="w-8 h-8 text-indigo-600" />
              RRSS Media
            </h1>
            <p className="text-slate-500 mt-1">
              Gestiona conexiones, crea contenido y programa publicaciones en todas tus redes sociales
            </p>
          </div>
          <Button variant="outline" onClick={loadAll} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Cuentas Conectadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{cuentas.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Publicadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-emerald-600">{publicadas}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Programadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-amber-600">{programadas}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Borradores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-600">{borradores}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="cuentas">Cuentas Conectadas</TabsTrigger>
            <TabsTrigger value="crear">Crear Publicación</TabsTrigger>
            <TabsTrigger value="publicaciones">
              Publicaciones
              {publicaciones.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {publicaciones.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cuentas" className="space-y-4">
            <ConectorCuentasRrss
              cuentas={cuentas}
              onConectar={handleConectar}
              onDesconectar={handleDesconectar}
            />
          </TabsContent>

          <TabsContent value="crear" className="max-w-2xl">
            <ComposerPublicacion cuentas={cuentas} onCrear={handleCrearPublicacion} />
          </TabsContent>

          <TabsContent value="publicaciones" className="space-y-4">
            <ListaPublicacionesRrss
              publicaciones={publicaciones}
              onPublicarAhora={handlePublicarAhora}
              onEliminar={handleEliminarPublicacion}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
