'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Maximize2, ArrowLeft } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { ModuleNavMenu } from '@/components/module-nav-menu';
import { AnuncianteForm, AnuncianteFormData } from '../_components/AnuncianteForm';

const LS_KEY = 'silexar_anunciantes';
const DRAFT_KEY = 'silexar_anunciante_draft';
const SYNC_CHANNEL = 'silexar_anunciante_sync';

const IVA_POR_PAIS: Record<string, number> = {
  Chile: 19, Argentina: 21, Perú: 18, Colombia: 19, México: 16,
  España: 21, Brasil: 17, Uruguay: 22, 'Estados Unidos': 0,
};
const getIvaPorPais = (pais: string): number => IVA_POR_PAIS[pais] ?? 0;

export default function NuevoAnunciantePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isPopup = searchParams.get('popup') === '1';
  const [isLoading, setIsLoading] = useState(false);

  // Limpiar draft al montar la página (no popup) para empezar siempre limpio
  useEffect(() => {
    if (!isPopup && typeof window !== 'undefined') {
      localStorage.removeItem(DRAFT_KEY);
      try {
        const bc = new BroadcastChannel(SYNC_CHANNEL);
        bc.postMessage({ type: 'CLEAR_DRAFT' });
        bc.close();
      } catch { /* ignore */ }
    }
  }, [isPopup]);

  const openWindow = () => {
    const w = window.screen.availWidth;
    const h = window.screen.availHeight;
    window.open(
      '/anunciantes/nuevo?popup=1',
      '_blank',
      `width=${w},height=${h},left=0,top=0,resizable=yes,scrollbars=yes,menubar=no,toolbar=no,location=no,status=no`
    );
  };

  const handleCreate = async (data: AnuncianteFormData) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      const existing = JSON.parse(localStorage.getItem(LS_KEY) ?? '[]');
      const newRecord = {
        ...data,
        id: `local-${Date.now()}`,
        codigo: `ANC-${String(existing.length + 1).padStart(4, '0')}`,
        activo: true,
        estado: 'activo',
        fechaCreacion: new Date().toISOString(),
        ivaPorcentaje: data.ivaPorcentaje ?? getIvaPorPais(data.pais),
      };
      localStorage.setItem(LS_KEY, JSON.stringify([...existing, newRecord]));

      // Limpiar draft y notificar otras ventanas
      localStorage.removeItem(DRAFT_KEY);
      try {
        const bc = new BroadcastChannel(SYNC_CHANNEL);
        bc.postMessage({ type: 'CLEAR_DRAFT' });
        bc.close();
      } catch { /* BroadcastChannel no soportado */ }

      toast({
        title: '✅ Anunciante creado exitosamente',
        description: `${String(data.nombreRazonSocial)} ha sido registrado en el sistema.`,
      });

      if (isPopup && window.opener) {
        // Notificar a la ventana padre que se creó un anunciante
        try {
          const bc = new BroadcastChannel(SYNC_CHANNEL);
          bc.postMessage({ type: 'ANUNCIANTE_CREATED' });
          bc.close();
        } catch {}
        window.close();
      } else {
        router.push('/anunciantes');
      }
    } catch {
      toast({
        title: 'Error',
        description: 'No se pudo guardar el anunciante',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#dfeaff' }} className="relative">
      {/* Scrollbar neumórfico global para el popup */}
      <style>{`
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: #dfeaff; border-radius: 10px; }
        ::-webkit-scrollbar-thumb { background: #bec8de; border-radius: 10px; box-shadow: inset 1px 1px 2px rgba(0,0,0,0.08); }
        ::-webkit-scrollbar-thumb:hover { background: #6888ff; }
        ::-webkit-scrollbar-corner { background: #dfeaff; }
      `}</style>
      {/* Botón flotante Ventana OS — solo visible cuando NO estamos en popup */}
      {!isPopup && (
        <button
          onClick={openWindow}
          className="fixed top-6 right-6 z-40 flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all hover:scale-105"
          style={{
            background: '#dfeaff',
            color: '#69738c',
            boxShadow: '6px 6px 12px #bec8de,-6px -6px 12px #ffffff',
          }}
          title="Abrir en ventana nueva"
        >
          <Maximize2 className="w-4 h-4" />
          Ventana
        </button>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 px-6 pt-6">
        <button
          onClick={() => router.push('/anunciantes')}
          className="p-2.5 rounded-xl transition-all"
          style={{ background: '#dfeaff', boxShadow: '4px 4px 8px #bec8de,-4px -4px 8px #ffffff', color: '#9aa3b8' }}
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <ModuleNavMenu />
      </div>

      <AnuncianteForm
        mode="create"
        onSubmit={handleCreate}
        isLoading={isLoading}
        isPopup={isPopup}
      />
    </div>
  );
}
