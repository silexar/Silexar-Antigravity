'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';
import { AnuncianteForm } from '../../_components/AnuncianteForm';
import { Loader2 } from 'lucide-react';

interface AnuncianteData {
  id: string;
  codigo: string;
  rut: string | null;
  nombreRazonSocial: string;
  giroActividad: string | null;
  direccion: string | null;
  ciudad: string | null;
  comunaProvincia: string | null;
  pais: string;
  emailContacto: string | null;
  telefonoContacto: string | null;
  paginaWeb: string | null;
  nombreContactoPrincipal: string | null;
  cargoContactoPrincipal: string | null;
  tieneFacturacionElectronica: boolean;
  direccionFacturacion: string | null;
  emailFacturacion: string | null;
  notas: string | null;
  estado: 'activo' | 'inactivo' | 'suspendido' | 'pendiente';
}

export default function EditarAnunciantePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<AnuncianteData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/anunciantes/${id}`)
      .then(r => r.json())
      .then(json => {
        if (json.success && json.data) {
          setData(json.data);
        } else {
          toast({ title: 'No se encontró el anunciante', variant: 'destructive' });
          router.push('/anunciantes');
        }
      })
      .catch(() => {
        toast({ title: 'Error de red', variant: 'destructive' });
        router.push('/anunciantes');
      })
      .finally(() => setIsFetching(false));
  }, [id, router]);

  const handleUpdate = async (formData: {
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
    estado?: 'activo' | 'inactivo' | 'suspendido' | 'pendiente';
  }) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/anunciantes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        toast({
          title: 'Error al actualizar',
          description: json.error || 'Ocurrió un error inesperado',
          variant: 'destructive',
        });
        return;
      }
      toast({ title: 'Anunciante actualizado exitosamente' });
      router.push(`/anunciantes/${id}`);
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

  if (isFetching || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <AnuncianteForm
          mode="edit"
          initialData={{
            nombreRazonSocial: data.nombreRazonSocial,
            rut: data.rut || '',
            giroActividad: data.giroActividad || '',
            direccion: data.direccion || '',
            ciudad: data.ciudad || '',
            comunaProvincia: data.comunaProvincia || '',
            pais: data.pais,
            emailContacto: data.emailContacto || '',
            telefonoContacto: data.telefonoContacto || '',
            paginaWeb: data.paginaWeb || '',
            nombreContactoPrincipal: data.nombreContactoPrincipal || '',
            cargoContactoPrincipal: data.cargoContactoPrincipal || '',
            tieneFacturacionElectronica: data.tieneFacturacionElectronica,
            direccionFacturacion: data.direccionFacturacion || '',
            emailFacturacion: data.emailFacturacion || '',
            notas: data.notas || '',
            estado: data.estado,
          }}
          onSubmit={handleUpdate}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
