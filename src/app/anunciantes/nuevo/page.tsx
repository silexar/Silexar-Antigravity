'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';
import { AnuncianteForm, AnuncianteFormData } from '../_components/AnuncianteForm';

const LS_KEY = 'silexar_anunciantes';

export default function NuevoAnunciantePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async (data: AnuncianteFormData) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      // Persistir en localStorage para pruebas locales
      const existing = JSON.parse(localStorage.getItem(LS_KEY) ?? '[]');
      const newRecord = {
        ...data,
        id: `local-${Date.now()}`,
        codigo: `ANC-${String(existing.length + 1).padStart(4, '0')}`,
        activo: true,
        estado: 'activo',
        fechaCreacion: new Date().toISOString(),
      };
      localStorage.setItem(LS_KEY, JSON.stringify([...existing, newRecord]));

      toast({ title: '✅ Anunciante creado exitosamente', description: `${String(data.nombreRazonSocial)} ha sido registrado en el sistema.` });
      router.push('/anunciantes');
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
    <div style={{ minHeight: '100vh', background: '#dfeaff' }}>
      <AnuncianteForm mode="create" onSubmit={handleCreate} isLoading={isLoading} />
    </div>
  );
}
