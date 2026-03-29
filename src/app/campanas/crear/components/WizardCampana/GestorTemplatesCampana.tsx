/**
 * 📋 SILEXAR PULSE - Templates de Campaña 2050
 * 
 * @description Sistema para guardar, cargar y gestionar templates
 * de configuraciones de campañas reutilizables.
 * 
 * @version 2050.1.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import React, { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FileText,
  Save,
  Folder,
  Star,
  Clock,
  Radio,
  Smartphone,
  Zap,
  Copy,
  Search,
  Plus,
  CheckCircle2
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export interface TemplateCampana {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: 'promocional' | 'branding' | 'institucional' | 'evento' | 'custom';
  medioCampana: 'fm' | 'digital' | 'hibrido';
  favorito: boolean;
  
  // Configuración guardada
  config: {
    duracionDias: number;
    spotsPorDia: number;
    duracionSpot: number;
    horariosPreferidos: string[];
    emisorasDefault: string[];
    patron: string;
    
    // Digital
    incluirDigital: boolean;
    formatosDigitales: string[];
    targetingDefault: Record<string, unknown>;
  };
  
  // Metadatos
  usosCount: number;
  ultimoUso?: Date;
  creadoPor: string;
  fechaCreacion: Date;
  fechaModificacion: Date;
}

interface GestorTemplatesProps {
  onSeleccionar: (template: TemplateCampana) => void;
  onGuardar: (template: Partial<TemplateCampana>) => void;
  configActual?: Partial<TemplateCampana['config']>;
}

// ═══════════════════════════════════════════════════════════════
// DATOS MOCK
// ═══════════════════════════════════════════════════════════════

const MOCK_TEMPLATES: TemplateCampana[] = [
  {
    id: 'tpl_001',
    nombre: 'Promocional 30 días FM+Digital',
    descripcion: 'Campaña promocional estándar con cobertura FM y digital básica',
    categoria: 'promocional',
    medioCampana: 'hibrido',
    favorito: true,
    config: {
      duracionDias: 30,
      spotsPorDia: 4,
      duracionSpot: 30,
      horariosPreferidos: ['06:00-09:00', '18:00-21:00'],
      emisorasDefault: ['Radio Pudahuel', 'ADN Radio'],
      patron: 'mas_semana',
      incluirDigital: true,
      formatosDigitales: ['banner', 'audio_ad'],
      targetingDefault: { edades: ['25-34', '35-44'] }
    },
    usosCount: 45,
    ultimoUso: new Date('2024-12-20'),
    creadoPor: 'Carlos Martínez',
    fechaCreacion: new Date('2024-06-15'),
    fechaModificacion: new Date('2024-11-10')
  },
  {
    id: 'tpl_002',
    nombre: 'Campaña Branding Anual',
    descripcion: 'Presencia de marca durante todo el año con bajo volumen',
    categoria: 'branding',
    medioCampana: 'fm',
    favorito: true,
    config: {
      duracionDias: 365,
      spotsPorDia: 2,
      duracionSpot: 30,
      horariosPreferidos: ['09:00-12:00', '15:00-18:00'],
      emisorasDefault: ['Radio Futuro'],
      patron: 'uniforme',
      incluirDigital: false,
      formatosDigitales: [],
      targetingDefault: {}
    },
    usosCount: 12,
    ultimoUso: new Date('2024-12-15'),
    creadoPor: 'Ana García',
    fechaCreacion: new Date('2024-03-01'),
    fechaModificacion: new Date('2024-09-22')
  },
  {
    id: 'tpl_003',
    nombre: 'Evento Flash 3 días',
    descripcion: 'Alta frecuencia para eventos de corta duración',
    categoria: 'evento',
    medioCampana: 'hibrido',
    favorito: false,
    config: {
      duracionDias: 3,
      spotsPorDia: 12,
      duracionSpot: 20,
      horariosPreferidos: ['06:00-09:00', '12:00-15:00', '18:00-21:00'],
      emisorasDefault: ['Radio Pudahuel', 'ADN Radio', 'Radio Futuro', 'Oasis FM'],
      patron: 'picos_viernes',
      incluirDigital: true,
      formatosDigitales: ['banner', 'video_ad', 'audio_ad'],
      targetingDefault: { edades: ['18-24', '25-34'] }
    },
    usosCount: 28,
    ultimoUso: new Date('2024-12-22'),
    creadoPor: 'Pedro López',
    fechaCreacion: new Date('2024-08-10'),
    fechaModificacion: new Date('2024-12-01')
  },
  {
    id: 'tpl_004',
    nombre: 'Digital Only - Awareness',
    descripcion: 'Campaña 100% digital para awareness de marca',
    categoria: 'branding',
    medioCampana: 'digital',
    favorito: false,
    config: {
      duracionDias: 14,
      spotsPorDia: 0,
      duracionSpot: 0,
      horariosPreferidos: [],
      emisorasDefault: [],
      patron: 'uniforme',
      incluirDigital: true,
      formatosDigitales: ['banner', 'video_ad', 'rich_media'],
      targetingDefault: { 
        edades: ['25-34', '35-44', '45-54'],
        intereses: ['tecnologia', 'negocios']
      }
    },
    usosCount: 15,
    ultimoUso: new Date('2024-12-18'),
    creadoPor: 'María Soto',
    fechaCreacion: new Date('2024-10-05'),
    fechaModificacion: new Date('2024-11-28')
  }
];

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export const GestorTemplatesCampana: React.FC<GestorTemplatesProps> = ({
  onSeleccionar,
  onGuardar,
  configActual
}) => {
  const [templates, setTemplates] = useState<TemplateCampana[]>(MOCK_TEMPLATES);
  const [busqueda, setBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todos');
  const [filtroMedio, setFiltroMedio] = useState<string>('todos');
  const [mostrarSoloFavoritos, setMostrarSoloFavoritos] = useState(false);
  
  const [dialogoGuardar, setDialogoGuardar] = useState(false);
  const [nuevoTemplate, setNuevoTemplate] = useState({
    nombre: '',
    descripcion: '',
    categoria: 'custom' as TemplateCampana['categoria']
  });

  // Filtrar templates
  const templatesFiltrados = templates.filter(tpl => {
    if (busqueda && !tpl.nombre.toLowerCase().includes(busqueda.toLowerCase())) {
      return false;
    }
    if (filtroCategoria !== 'todos' && tpl.categoria !== filtroCategoria) {
      return false;
    }
    if (filtroMedio !== 'todos' && tpl.medioCampana !== filtroMedio) {
      return false;
    }
    if (mostrarSoloFavoritos && !tpl.favorito) {
      return false;
    }
    return true;
  });

  // Ordenar: favoritos primero, luego por uso
  const templatesOrdenados = [...templatesFiltrados].sort((a, b) => {
    if (a.favorito !== b.favorito) return a.favorito ? -1 : 1;
    return b.usosCount - a.usosCount;
  });

  // Toggle favorito
  const toggleFavorito = useCallback((id: string) => {
    setTemplates(prev => prev.map(t => 
      t.id === id ? { ...t, favorito: !t.favorito } : t
    ));
  }, []);

  // Guardar nuevo template
  const handleGuardarTemplate = () => {
    if (!nuevoTemplate.nombre) return;

    const newTemplate: Partial<TemplateCampana> = {
      ...nuevoTemplate,
      config: configActual as TemplateCampana['config']
    };
    
    onGuardar(newTemplate);
    setDialogoGuardar(false);
    setNuevoTemplate({ nombre: '', descripcion: '', categoria: 'custom' });
  };

  // Obtener icono de medio
  const getIconoMedio = (medio: string) => {
    switch (medio) {
      case 'fm': return <Radio className="w-4 h-4" />;
      case 'digital': return <Smartphone className="w-4 h-4" />;
      case 'hibrido': return <Zap className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  // Obtener color de categoría
  const getColorCategoria = (cat: string) => {
    switch (cat) {
      case 'promocional': return 'bg-green-100 text-green-700';
      case 'branding': return 'bg-blue-100 text-blue-700';
      case 'institucional': return 'bg-purple-100 text-purple-700';
      case 'evento': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Card className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Folder className="w-5 h-5 text-amber-600" />
          <h3 className="font-bold text-gray-900">📋 Templates de Campaña</h3>
        </div>
        <Button
          size="sm"
          onClick={() => setDialogoGuardar(true)}
          className="gap-1"
        >
          <Save className="w-4 h-4" />
          Guardar Actual
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar template..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        
        <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
          <SelectTrigger className="w-36 h-9">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas</SelectItem>
            <SelectItem value="promocional">Promocional</SelectItem>
            <SelectItem value="branding">Branding</SelectItem>
            <SelectItem value="institucional">Institucional</SelectItem>
            <SelectItem value="evento">Evento</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filtroMedio} onValueChange={setFiltroMedio}>
          <SelectTrigger className="w-32 h-9">
            <SelectValue placeholder="Medio" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="fm">FM</SelectItem>
            <SelectItem value="digital">Digital</SelectItem>
            <SelectItem value="hibrido">Híbrido</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant={mostrarSoloFavoritos ? "default" : "outline"}
          size="sm"
          onClick={() => setMostrarSoloFavoritos(!mostrarSoloFavoritos)}
          className="h-9 gap-1"
        >
          <Star className={`w-4 h-4 ${mostrarSoloFavoritos ? 'fill-current' : ''}`} />
          Favoritos
        </Button>
      </div>

      {/* Lista de Templates */}
      <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto">
        {templatesOrdenados.map(template => (
          <div
            key={template.id}
            className="p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer bg-white hover:border-blue-300"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {getIconoMedio(template.medioCampana)}
                <Badge className={`text-xs ${getColorCategoria(template.categoria)}`}>
                  {template.categoria}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Marcar favorito"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorito(template.id);
                }}
              >
                <Star className={`w-4 h-4 ${template.favorito ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
              </Button>
            </div>

            <h4 className="font-semibold text-gray-900 mb-1">{template.nombre}</h4>
            <p className="text-xs text-gray-500 mb-3 line-clamp-2">{template.descripcion}</p>

            <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {template.config.duracionDias} días
              </span>
              <span>{template.usosCount} usos</span>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1 h-8 gap-1"
                onClick={() => onSeleccionar(template)}
              >
                <CheckCircle2 className="w-3 h-3" />
                Usar
              </Button>
              <Button
                variant="outline"
                size="sm"
                aria-label="Copiar"
                className="h-8"
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}

        {/* Crear nuevo */}
        <div
          className="p-4 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors min-h-[180px]"
          onClick={() => setDialogoGuardar(true)}
        >
          <Plus className="w-8 h-8 text-gray-400" />
          <span className="text-sm text-gray-500">Crear Template</span>
        </div>
      </div>

      {/* Diálogo Guardar Template */}
      <Dialog open={dialogoGuardar} onOpenChange={setDialogoGuardar}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Save className="w-5 h-5" />
              Guardar como Template
            </DialogTitle>
            <DialogDescription>
              Guarda la configuración actual para reutilizar en futuras campañas.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nombre del template</Label>
              <Input
                placeholder="Ej: Promocional Verano 2025"
                value={nuevoTemplate.nombre}
                onChange={(e) => setNuevoTemplate(prev => ({ ...prev, nombre: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea
                placeholder="Describe cuándo usar este template..."
                value={nuevoTemplate.descripcion}
                onChange={(e) => setNuevoTemplate(prev => ({ ...prev, descripcion: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select 
                value={nuevoTemplate.categoria} 
                onValueChange={(v) => setNuevoTemplate(prev => ({ ...prev, categoria: v as TemplateCampana['categoria'] }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="promocional">Promocional</SelectItem>
                  <SelectItem value="branding">Branding</SelectItem>
                  <SelectItem value="institucional">Institucional</SelectItem>
                  <SelectItem value="evento">Evento</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogoGuardar(false)}>
              Cancelar
            </Button>
            <Button onClick={handleGuardarTemplate} disabled={!nuevoTemplate.nombre}>
              <Save className="w-4 h-4 mr-2" />
              Guardar Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default GestorTemplatesCampana;
