'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';
import { AnuncianteForm } from '../_components/AnuncianteForm';

export default function NuevoAnunciantePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async (data: {
    nombreRazonSocial: string;
    rut: string;
    giroActividad: string;
    direccion: string;
    ciudad: string;
    comunaProvincia: string;
    pais: string;
    emailContacto: string;
    telefonoContacto: string;
    paginaWeb: string;
    nombreContactoPrincipal: string;
    cargoContactoPrincipal: string;
    tieneFacturacionElectronica: boolean;
    direccionFacturacion: string;
    emailFacturacion: string;
    notas: string;
  }) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/anunciantes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        toast({
          title: 'Error al crear anunciante',
          description: json.error || 'Ocurrió un error inesperado',
          variant: 'destructive',
        });
        return;
      }
      toast({ title: 'Anunciante creado exitosamente' });
      router.push('/anunciantes');
    } catch {
      toast({
        title: 'Error de red',
        description: 'No se pudo conectar con el servidor',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <AnuncianteForm mode="create" onSubmit={handleCreate} isLoading={isLoading} />
      </div>
    </div>
  );
}
