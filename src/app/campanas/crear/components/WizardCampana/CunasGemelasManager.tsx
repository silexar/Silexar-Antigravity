/**
 * 👯 SILEXAR PULSE - Sistema de Cuñas Gemelas (Twin Spots) 2050
 * 
 * @description Sistema enterprise para vincular cuñas que deben
 * emitirse juntas en el mismo bloque (apertura+cierre, mención+spot)
 * 
 * @version 2050.1.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Users,
  Link2,
  Unlink,
  Music,
  ArrowRight,
  ArrowLeft,
  Play,
  Pause,
  Search,
  Clock
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export interface CunaParaGemela {
  id: string;
  codigo: string;
  nombre: string;
  duracion: number;
  anunciante: string;
  estado: string;
}

export interface VinculoGemela {
  id: string;
  cunaPrincipalId: string;
  cunaGemelaId: string;
  posicion: 'antes' | 'despues';
  separacionMaxima: number; // máximo de spots entre ellas
  mismoBloque: boolean;
  activo: boolean;
}

interface CunasGemelasManagerProps {
  cunas: CunaParaGemela[];
  vinculos: VinculoGemela[];
  onVincular: (vinculo: VinculoGemela) => void;
  onDesvincular: (vinculoId: string) => void;
  cunaSeleccionadaId?: string;
}

// ═══════════════════════════════════════════════════════════════
// DATOS MOCK
// ═══════════════════════════════════════════════════════════════

const CUNAS_MOCK: CunaParaGemela[] = [
  { id: 'cuna_001', codigo: 'BCH-001', nombre: 'BANCO CHILE - Apertura', duracion: 10, anunciante: 'BANCO CHILE', estado: 'aprobada' },
  { id: 'cuna_002', codigo: 'BCH-002', nombre: 'BANCO CHILE - Principal 30s', duracion: 30, anunciante: 'BANCO CHILE', estado: 'aprobada' },
  { id: 'cuna_003', codigo: 'BCH-003', nombre: 'BANCO CHILE - Cierre', duracion: 10, anunciante: 'BANCO CHILE', estado: 'aprobada' },
  { id: 'cuna_004', codigo: 'ENT-001', nombre: 'ENTEL - Promocional', duracion: 30, anunciante: 'ENTEL', estado: 'aprobada' },
  { id: 'cuna_005', codigo: 'FAL-001', nombre: 'FALABELLA - Black Friday', duracion: 45, anunciante: 'FALABELLA', estado: 'aprobada' }
];

const VINCULOS_MOCK: VinculoGemela[] = [
  {
    id: 'vin_001',
    cunaPrincipalId: 'cuna_002',
    cunaGemelaId: 'cuna_001',
    posicion: 'antes',
    separacionMaxima: 0,
    mismoBloque: true,
    activo: true
  },
  {
    id: 'vin_002',
    cunaPrincipalId: 'cuna_002',
    cunaGemelaId: 'cuna_003',
    posicion: 'despues',
    separacionMaxima: 0,
    mismoBloque: true,
    activo: true
  }
];

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export const CunasGemelasManager: React.FC<CunasGemelasManagerProps> = ({
  cunas = CUNAS_MOCK,
  vinculos = VINCULOS_MOCK,
  onVincular,
  onDesvincular,
  cunaSeleccionadaId
}) => {
  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const [cunaPrincipal, setCunaPrincipal] = useState<string>(cunaSeleccionadaId || '');
  const [cunaGemela, setCunaGemela] = useState<string>('');
  const [posicion, setPosicion] = useState<'antes' | 'despues'>('despues');
  const [separacion, setSeparacion] = useState(0);
  const [mismoBloque, setMismoBloque] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [reproduciendo, setReproduciendo] = useState<string | null>(null);

  // Obtener cuña por ID
  const getCuna = (id: string) => cunas.find(c => c.id === id);

  // Cuñas filtradas para búsqueda
  const cunasFiltradas = useMemo(() => {
    return cunas.filter(c => 
      c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.codigo.toLowerCase().includes(busqueda.toLowerCase())
    );
  }, [cunas, busqueda]);

  // Cuñas disponibles para vincular (no puede ser la misma)
  const cunasDisponibles = useMemo(() => {
    const principal = getCuna(cunaPrincipal);
    return cunasFiltradas.filter(c => 
      c.id !== cunaPrincipal &&
      (!principal || c.anunciante === principal.anunciante) // Solo del mismo anunciante
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cunasFiltradas, cunaPrincipal]);

  // Crear vínculo
  const handleVincular = () => {
    if (!cunaPrincipal || !cunaGemela) return;

    const nuevoVinculo: VinculoGemela = {
      id: `vin_${Date.now()}`,
      cunaPrincipalId: cunaPrincipal,
      cunaGemelaId: cunaGemela,
      posicion,
      separacionMaxima: separacion,
      mismoBloque,
      activo: true
    };

    onVincular?.(nuevoVinculo);
    setDialogoAbierto(false);
    resetearFormulario();
  };

  const resetearFormulario = () => {
    setCunaGemela('');
    setPosicion('despues');
    setSeparacion(0);
    setMismoBloque(true);
  };

  // Reproducir cuña
  const handlePlay = (cunaId: string) => {
    if (reproduciendo === cunaId) {
      setReproduciendo(null);
    } else {
      setReproduciendo(cunaId);
      setTimeout(() => setReproduciendo(null), 3000);
    }
  };

  return (
    <Card className="p-4 border-purple-200 bg-gradient-to-br from-purple-50/30 to-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-600" />
          <h3 className="font-bold text-gray-900">👯 Cuñas Gemelas</h3>
        </div>
        <Dialog open={dialogoAbierto} onOpenChange={setDialogoAbierto}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1 bg-purple-600">
              <Link2 className="w-4 h-4" />
              Vincular Cuñas
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                Vincular Cuñas Gemelas
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Cuña Principal */}
              <div className="space-y-2">
                <Label>Cuña Principal</Label>
                <Select value={cunaPrincipal} onValueChange={setCunaPrincipal}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cuña principal..." />
                  </SelectTrigger>
                  <SelectContent>
                    {cunas.map(cuna => (
                      <SelectItem key={cuna.id} value={cuna.id}>
                        <div className="flex items-center gap-2">
                          <Music className="w-4 h-4" />
                          {cuna.codigo} - {cuna.nombre} ({cuna.duracion}s)
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Posición */}
              <div className="space-y-2">
                <Label>Posición de la gemela</Label>
                <RadioGroup value={posicion} onValueChange={(v) => setPosicion(v as 'antes' | 'despues')}>
                  <div className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="antes" id="antes" />
                      <Label htmlFor="antes" className="flex items-center gap-1">
                        <ArrowLeft className="w-4 h-4" />
                        Ir ANTES de la principal
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="despues" id="despues" />
                      <Label htmlFor="despues" className="flex items-center gap-1">
                        Ir DESPUÉS de la principal
                        <ArrowRight className="w-4 h-4" />
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {/* Cuña Gemela */}
              <div className="space-y-2">
                <Label>Cuña Gemela</Label>
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Buscar cuña..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="max-h-40 overflow-y-auto border rounded-lg divide-y">
                  {cunasDisponibles.map(cuna => (
                    <div
                      key={cuna.id}
                      className={`p-2 cursor-pointer flex items-center justify-between transition-colors ${
                        cunaGemela === cuna.id ? 'bg-purple-100' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setCunaGemela(cuna.id)}
                    >
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handlePlay(cuna.id); }}
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            reproduciendo === cuna.id ? 'bg-purple-600 text-white' : 'bg-gray-100'
                          }`}
                        >
                          {reproduciendo === cuna.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                        <div>
                          <p className="text-sm font-medium">{cuna.codigo}</p>
                          <p className="text-xs text-gray-500">{cuna.nombre}</p>
                        </div>
                      </div>
                      <Badge variant="outline">{cuna.duracion}s</Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Opciones */}
              <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Separación máxima (spots)
                  </Label>
                  <Input
                    type="number"
                    value={separacion}
                    onChange={(e) => setSeparacion(parseInt(e.target.value) || 0)}
                    className="w-20 h-8"
                    min={0}
                    max={10}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Deben ir en el MISMO bloque</Label>
                  <Switch checked={mismoBloque} onCheckedChange={setMismoBloque} />
                </div>
              </div>

              {/* Preview */}
              {cunaPrincipal && cunaGemela && (
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-sm text-purple-700 font-medium mb-2">Vista previa:</p>
                  <div className="flex items-center justify-center gap-2">
                    {posicion === 'antes' && (
                      <>
                        <Badge className="bg-purple-100 text-purple-700">
                          {getCuna(cunaGemela)?.codigo}
                        </Badge>
                        <ArrowRight className="w-4 h-4 text-purple-400" />
                      </>
                    )}
                    <Badge className="bg-purple-600 text-white">
                      {getCuna(cunaPrincipal)?.codigo} (Principal)
                    </Badge>
                    {posicion === 'despues' && (
                      <>
                        <ArrowRight className="w-4 h-4 text-purple-400" />
                        <Badge className="bg-purple-100 text-purple-700">
                          {getCuna(cunaGemela)?.codigo}
                        </Badge>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-purple-600 text-center mt-2">
                    Duración total: {(getCuna(cunaPrincipal)?.duracion || 0) + (getCuna(cunaGemela)?.duracion || 0)}s
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogoAbierto(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleVincular} 
                disabled={!cunaPrincipal || !cunaGemela}
                className="gap-1 bg-purple-600"
              >
                <Link2 className="w-4 h-4" />
                Vincular
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de vínculos existentes */}
      <div className="space-y-2">
        {vinculos.filter(v => v.activo).map(vinculo => {
          const principal = getCuna(vinculo.cunaPrincipalId);
          const gemela = getCuna(vinculo.cunaGemelaId);
          if (!principal || !gemela) return null;

          return (
            <Card key={vinculo.id} className="p-3 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {vinculo.posicion === 'antes' ? (
                    <>
                      <Badge variant="outline" className="gap-1">
                        <Music className="w-3 h-3" />
                        {gemela.codigo}
                      </Badge>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                      <Badge className="bg-purple-600 text-white gap-1">
                        <Music className="w-3 h-3" />
                        {principal.codigo}
                      </Badge>
                    </>
                  ) : (
                    <>
                      <Badge className="bg-purple-600 text-white gap-1">
                        <Music className="w-3 h-3" />
                        {principal.codigo}
                      </Badge>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                      <Badge variant="outline" className="gap-1">
                        <Music className="w-3 h-3" />
                        {gemela.codigo}
                      </Badge>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {vinculo.mismoBloque && (
                    <Badge className="bg-blue-100 text-blue-700 text-xs">Mismo bloque</Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDesvincular?.(vinculo.id)}
                    className="h-7 text-red-500 hover:text-red-700"
                  >
                    <Unlink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}

        {vinculos.filter(v => v.activo).length === 0 && (
          <div className="text-center py-6 text-gray-500">
            <Users className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No hay cuñas gemelas configuradas</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default CunasGemelasManager;
