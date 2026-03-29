/**
 * 🎤 SILEXAR PULSE - Editor de Menciones/Frases Inline 2050
 * 
 * @description Editor de texto especializado para contenido de locutor
 * con variables dinámicas, contador de tiempo y plantillas predefinidas.
 * 
 * @version 2050.1.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Mic,
  Clock,
  FileText,
  Variable,
  BookOpen,
  Save,
  Copy,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  History,
  User,
  Phone,
  Link2,
  MapPin,
  Tag,
  Calendar,
  Zap
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export interface VariableMencion {
  id: string;
  nombre: string;
  icono: React.ElementType;
  descripcion: string;
  placeholder: string;
  ejemplo: string;
}

export interface PlantillaMencion {
  id: string;
  nombre: string;
  categoria: 'promocion' | 'evento' | 'institucional' | 'urgente';
  texto: string;
  duracionEstimada: number;
}

export interface EditorMencionesProps {
  tipo: 'mencion' | 'frase';
  valorInicial?: string;
  variablesValores?: Record<string, string>;
  duracionMaxima?: number;
  onChange: (texto: string, stats: EstadisticasTexto) => void;
  onGuardarPlantilla?: (plantilla: Omit<PlantillaMencion, 'id'>) => void;
}

export interface EstadisticasTexto {
  palabras: number;
  caracteres: number;
  caracteresConEspacios: number;
  tiempoEstimadoSegundos: number;
  variablesUsadas: string[];
  valido: boolean;
  mensajeValidacion?: string;
}

// ═══════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════

// Velocidad promedio de locutor profesional: 150-170 palabras/minuto
const PALABRAS_POR_MINUTO = 160;
const SEGUNDOS_POR_PALABRA = 60 / PALABRAS_POR_MINUTO;

const VARIABLES_DISPONIBLES: VariableMencion[] = [
  {
    id: 'ANUNCIANTE',
    nombre: 'Anunciante',
    icono: User,
    descripcion: 'Nombre del cliente/anunciante',
    placeholder: '{{ANUNCIANTE}}',
    ejemplo: 'Banco Chile'
  },
  {
    id: 'PRODUCTO',
    nombre: 'Producto',
    icono: Tag,
    descripcion: 'Nombre del producto o servicio',
    placeholder: '{{PRODUCTO}}',
    ejemplo: 'Cuenta Vista Free'
  },
  {
    id: 'TELEFONO',
    nombre: 'Teléfono',
    icono: Phone,
    descripcion: 'Número de teléfono de contacto',
    placeholder: '{{TELEFONO}}',
    ejemplo: '600 600 1234'
  },
  {
    id: 'URL',
    nombre: 'Sitio Web',
    icono: Link2,
    descripcion: 'Dirección web',
    placeholder: '{{URL}}',
    ejemplo: 'www.bancochile.cl'
  },
  {
    id: 'DIRECCION',
    nombre: 'Dirección',
    icono: MapPin,
    descripcion: 'Dirección física',
    placeholder: '{{DIRECCION}}',
    ejemplo: 'Av. Providencia 1234'
  },
  {
    id: 'PRECIO',
    nombre: 'Precio',
    icono: Tag,
    descripcion: 'Precio o valor promocional',
    placeholder: '{{PRECIO}}',
    ejemplo: '$9.990'
  },
  {
    id: 'FECHA',
    nombre: 'Fecha',
    icono: Calendar,
    descripcion: 'Fecha de evento o promoción',
    placeholder: '{{FECHA}}',
    ejemplo: '31 de diciembre'
  },
  {
    id: 'DESCUENTO',
    nombre: 'Descuento',
    icono: Zap,
    descripcion: 'Porcentaje o monto de descuento',
    placeholder: '{{DESCUENTO}}',
    ejemplo: '50% OFF'
  }
];

const PLANTILLAS_PREDEFINIDAS: PlantillaMencion[] = [
  {
    id: 'promo_standard',
    nombre: 'Promoción Estándar',
    categoria: 'promocion',
    texto: 'Amigos, les cuento que {{ANUNCIANTE}} tiene una promoción increíble. Visita {{URL}} o llama al {{TELEFONO}} y aprovecha {{DESCUENTO}} en {{PRODUCTO}}. ¡No te lo pierdas!',
    duracionEstimada: 15
  },
  {
    id: 'evento_invitacion',
    nombre: 'Invitación a Evento',
    categoria: 'evento',
    texto: 'Este {{FECHA}}, {{ANUNCIANTE}} te invita a un evento único en {{DIRECCION}}. No faltes, la entrada es gratuita. Más información en {{URL}}.',
    duracionEstimada: 12
  },
  {
    id: 'institucional_marca',
    nombre: 'Institucional de Marca',
    categoria: 'institucional',
    texto: '{{ANUNCIANTE}}, comprometidos con Chile desde hace más de 100 años. Conoce nuestro {{PRODUCTO}} en {{URL}}.',
    duracionEstimada: 10
  },
  {
    id: 'urgente_liquidacion',
    nombre: 'Liquidación Urgente',
    categoria: 'urgente',
    texto: '¡Atención! Solo por hoy, {{ANUNCIANTE}} con {{DESCUENTO}} en todo {{PRODUCTO}}. Corre a {{DIRECCION}} o compra en {{URL}}. ¡Últimas unidades!',
    duracionEstimada: 14
  },
  {
    id: 'apertura_local',
    nombre: 'Apertura de Local',
    categoria: 'evento',
    texto: '{{ANUNCIANTE}} inaugura nuevo local en {{DIRECCION}}. Este {{FECHA}} ven a conocernos y aprovecha promociones exclusivas de apertura. ¡Te esperamos!',
    duracionEstimada: 13
  }
];

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export const EditorMencionesInline: React.FC<EditorMencionesProps> = ({
  tipo,
  valorInicial = '',
  variablesValores = {},
  duracionMaxima = 30,
  onChange,
  onGuardarPlantilla
}) => {
  // Estado
  const [texto, setTexto] = useState(valorInicial);
  const [valoresVariables, setValoresVariables] = useState<Record<string, string>>(variablesValores);
  const [historialTexto, setHistorialTexto] = useState<string[]>([valorInicial]);
  const [indiceHistorial, setIndiceHistorial] = useState(0);
  const [mostrarPlantillas, setMostrarPlantillas] = useState(false);
  const [nombreNuevaPlantilla, setNombreNuevaPlantilla] = useState('');
  const [categoriaNuevaPlantilla, setCategoriaNuevaPlantilla] = useState<PlantillaMencion['categoria']>('promocion');
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ═════════════════════════════════════════════════════════════
  // CÁLCULOS
  // ═════════════════════════════════════════════════════════════

  const estadisticas = useMemo((): EstadisticasTexto => {
    const textoLimpio = texto.trim();
    const palabras = textoLimpio ? textoLimpio.split(/\s+/).filter(w => w.length > 0).length : 0;
    const caracteres = textoLimpio.replace(/\s/g, '').length;
    const caracteresConEspacios = textoLimpio.length;
    const tiempoEstimadoSegundos = Math.round(palabras * SEGUNDOS_POR_PALABRA);
    
    // Detectar variables usadas
    const variablesUsadas: string[] = [];
    const regex = /\{\{(\w+)\}\}/g;
    let match;
    while ((match = regex.exec(texto)) !== null) {
      if (!variablesUsadas.includes(match[1])) {
        variablesUsadas.push(match[1]);
      }
    }
    
    // Validación
    let valido = true;
    let mensajeValidacion: string | undefined;
    
    if (tiempoEstimadoSegundos > duracionMaxima) {
      valido = false;
      mensajeValidacion = `Excede duración máxima (${duracionMaxima}s)`;
    } else if (palabras < 5) {
      valido = false;
      mensajeValidacion = 'Texto muy corto (mínimo 5 palabras)';
    }
    
    return {
      palabras,
      caracteres,
      caracteresConEspacios,
      tiempoEstimadoSegundos,
      variablesUsadas,
      valido,
      mensajeValidacion
    };
  }, [texto, duracionMaxima]);

  // Preview con variables reemplazadas
  const textoPreview = useMemo(() => {
    let preview = texto;
    Object.entries(valoresVariables).forEach(([key, value]) => {
      preview = preview.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value || `[${key}]`);
    });
    return preview;
  }, [texto, valoresVariables]);

  // Notificar cambios
  useEffect(() => {
    onChange(texto, estadisticas);
  }, [texto, estadisticas, onChange]);

  // ═════════════════════════════════════════════════════════════
  // HANDLERS
  // ═════════════════════════════════════════════════════════════

  const handleTextoChange = useCallback((nuevoTexto: string) => {
    setTexto(nuevoTexto);
    
    // Agregar al historial (cada 10 caracteres de diferencia)
    const ultimoHistorial = historialTexto[indiceHistorial] || '';
    if (Math.abs(nuevoTexto.length - ultimoHistorial.length) >= 10) {
      const nuevoHistorial = [...historialTexto.slice(0, indiceHistorial + 1), nuevoTexto];
      if (nuevoHistorial.length > 20) nuevoHistorial.shift(); // Máximo 20 estados
      setHistorialTexto(nuevoHistorial);
      setIndiceHistorial(nuevoHistorial.length - 1);
    }
  }, [historialTexto, indiceHistorial]);

  const insertarVariable = useCallback((variable: VariableMencion) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    const nuevoTexto = texto.slice(0, start) + variable.placeholder + texto.slice(end);
    handleTextoChange(nuevoTexto);
    
    // Posicionar cursor después de la variable
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + variable.placeholder.length,
        start + variable.placeholder.length
      );
    }, 0);
  }, [texto, handleTextoChange]);

  const aplicarPlantilla = useCallback((plantilla: PlantillaMencion) => {
    handleTextoChange(plantilla.texto);
    setMostrarPlantillas(false);
  }, [handleTextoChange]);

  const deshacer = useCallback(() => {
    if (indiceHistorial > 0) {
      setIndiceHistorial(indiceHistorial - 1);
      setTexto(historialTexto[indiceHistorial - 1]);
    }
  }, [indiceHistorial, historialTexto]);

  const limpiarTexto = useCallback(() => {
    handleTextoChange('');
  }, [handleTextoChange]);

  const copiarTexto = useCallback(() => {
    navigator.clipboard.writeText(textoPreview);
  }, [textoPreview]);

  const guardarComoPlantilla = useCallback(() => {
    if (!nombreNuevaPlantilla || !onGuardarPlantilla) return;
    
    onGuardarPlantilla({
      nombre: nombreNuevaPlantilla,
      categoria: categoriaNuevaPlantilla,
      texto,
      duracionEstimada: estadisticas.tiempoEstimadoSegundos
    });
    
    setNombreNuevaPlantilla('');
  }, [nombreNuevaPlantilla, categoriaNuevaPlantilla, texto, estadisticas, onGuardarPlantilla]);

  // ═════════════════════════════════════════════════════════════
  // RENDER
  // ═════════════════════════════════════════════════════════════

  const getCategoriaColor = (cat: string) => {
    switch (cat) {
      case 'promocion': return 'bg-green-100 text-green-700';
      case 'evento': return 'bg-blue-100 text-blue-700';
      case 'institucional': return 'bg-purple-100 text-purple-700';
      case 'urgente': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Card className="p-4 border-blue-200 bg-gradient-to-br from-blue-50/50 to-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <Mic className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h4 className="font-bold text-gray-800">
              {tipo === 'mencion' ? '🎤 Editor de Mención' : '📢 Editor de Frase'}
            </h4>
            <p className="text-xs text-gray-500">
              Texto para locutor en vivo
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Indicador de tiempo */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge 
                  className={`gap-1 ${
                    estadisticas.valido 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  ~{estadisticas.tiempoEstimadoSegundos}s / {duracionMaxima}s
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Tiempo estimado de lectura</p>
                <p className="text-xs text-gray-400">
                  Basado en {PALABRAS_POR_MINUTO} palabras/minuto
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <Tabs defaultValue="editor" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="editor" className="gap-1 text-xs">
            <FileText className="w-3 h-3" />
            Editor
          </TabsTrigger>
          <TabsTrigger value="variables" className="gap-1 text-xs">
            <Variable className="w-3 h-3" />
            Variables
          </TabsTrigger>
          <TabsTrigger value="preview" className="gap-1 text-xs">
            <Sparkles className="w-3 h-3" />
            Preview
          </TabsTrigger>
        </TabsList>

        {/* TAB: Editor */}
        <TabsContent value="editor" className="space-y-4">
          {/* Textarea principal */}
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={texto}
              onChange={(e) => handleTextoChange(e.target.value)}
              placeholder="Escribe aquí el texto de la mención. Usa {{VARIABLE}} para insertar valores dinámicos..."
              className="min-h-[120px] resize-none font-medium text-gray-800 bg-white border-gray-200 focus:border-blue-300 focus:ring-blue-200"
            />
            
            {/* Barra de formato */}
            <div className="absolute bottom-2 right-2 flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Deshacer"
                className="h-7 w-7"
                onClick={deshacer}
                disabled={indiceHistorial <= 0}
              >
                <History className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Actualizar"
                className="h-7 w-7"
                onClick={limpiarTexto}
              >
                <RotateCcw className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Copiar"
                className="h-7 w-7"
                onClick={copiarTexto}
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Variables rápidas */}
          <div className="flex flex-wrap gap-1">
            <span className="text-xs text-gray-500 mr-2">Variables:</span>
            {VARIABLES_DISPONIBLES.slice(0, 5).map(v => (
              <Button
                key={v.id}
                variant="outline"
                size="sm"
                className="h-6 text-xs gap-1 px-2"
                onClick={() => insertarVariable(v)}
              >
                <v.icono className="w-3 h-3" />
                {v.nombre}
              </Button>
            ))}
          </div>

          {/* Estadísticas */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex gap-4 text-xs text-gray-600">
              <span><b>{estadisticas.palabras}</b> palabras</span>
              <span><b>{estadisticas.caracteres}</b> caracteres</span>
              <span><b>{estadisticas.variablesUsadas.length}</b> variables</span>
            </div>
            
            {!estadisticas.valido && (
              <Badge className="bg-red-100 text-red-700 gap-1">
                <AlertTriangle className="w-3 h-3" />
                {estadisticas.mensajeValidacion}
              </Badge>
            )}
            {estadisticas.valido && texto.length > 10 && (
              <Badge className="bg-emerald-100 text-emerald-700 gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Texto válido
              </Badge>
            )}
          </div>

          {/* Plantillas */}
          <div className="flex items-center justify-between">
            <Dialog open={mostrarPlantillas} onOpenChange={setMostrarPlantillas}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <BookOpen className="w-3 h-3" />
                  📚 Usar Plantilla
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    Plantillas de Menciones
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {PLANTILLAS_PREDEFINIDAS.map(plantilla => (
                    <div
                      key={plantilla.id}
                      className="p-3 border rounded-lg hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer transition-all"
                      onClick={() => aplicarPlantilla(plantilla)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-800">{plantilla.nombre}</span>
                        <div className="flex gap-2">
                          <Badge className={getCategoriaColor(plantilla.categoria)}>
                            {plantilla.categoria}
                          </Badge>
                          <Badge variant="outline" className="gap-1">
                            <Clock className="w-3 h-3" />
                            ~{plantilla.duracionEstimada}s
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{plantilla.texto}</p>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>

            {onGuardarPlantilla && texto.length > 20 && (
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Nombre plantilla..."
                  value={nombreNuevaPlantilla}
                  onChange={(e) => setNombreNuevaPlantilla(e.target.value)}
                  className="h-8 w-40 text-xs"
                />
                <Select
                  value={categoriaNuevaPlantilla}
                  onValueChange={(v) => setCategoriaNuevaPlantilla(v as PlantillaMencion['categoria'])}
                >
                  <SelectTrigger className="h-8 w-28 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="promocion">Promoción</SelectItem>
                    <SelectItem value="evento">Evento</SelectItem>
                    <SelectItem value="institucional">Institucional</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  className="h-8 gap-1"
                  onClick={guardarComoPlantilla}
                  disabled={!nombreNuevaPlantilla}
                >
                  <Save className="w-3 h-3" />
                  Guardar
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        {/* TAB: Variables */}
        <TabsContent value="variables" className="space-y-4">
          <p className="text-sm text-gray-600 mb-4">
            Define los valores de las variables que aparecerán en la mención final.
            El locutor leerá estos valores en vivo.
          </p>
          
          <div className="grid grid-cols-2 gap-3">
            {VARIABLES_DISPONIBLES.map(variable => (
              <div key={variable.id} className="space-y-1">
                <Label className="flex items-center gap-1 text-xs">
                  <variable.icono className="w-3 h-3 text-gray-500" />
                  {variable.nombre}
                </Label>
                <Input
                  placeholder={variable.ejemplo}
                  value={valoresVariables[variable.id] || ''}
                  onChange={(e) => setValoresVariables(prev => ({
                    ...prev,
                    [variable.id]: e.target.value
                  }))}
                  className="h-8 text-sm"
                />
              </div>
            ))}
          </div>
          
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
            <p className="text-xs text-amber-700">
              💡 <b>Tip:</b> Las variables se reemplazarán automáticamente cuando 
              el locutor lea la mención. Asegúrate de que los valores sean claros y concisos.
            </p>
          </div>
        </TabsContent>

        {/* TAB: Preview */}
        <TabsContent value="preview" className="space-y-4">
          <div className="p-4 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl text-white">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs text-red-400 font-medium">🎙️ EN VIVO</span>
            </div>
            
            <p className="text-lg leading-relaxed font-medium">
              "{textoPreview || 'Tu texto aparecerá aquí...'}"
            </p>
            
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-700">
              <span className="text-xs text-gray-400">
                Duración estimada: ~{estadisticas.tiempoEstimadoSegundos} segundos
              </span>
              <Badge className="bg-emerald-600/20 text-emerald-400">
                {estadisticas.palabras} palabras
              </Badge>
            </div>
          </div>
          
          {/* Preview teleprompter style */}
          <div className="p-4 bg-gray-100/80 backdrop-blur-md rounded-2xl border border-gray-200 shadow-inner font-mono text-4xl text-green-600 leading-relaxed overflow-x-auto">
            {textoPreview || 'Tu texto aparecerá aquí...'}
          </div>
          
          <p className="text-xs text-gray-500 text-center">
            Vista tipo teleprompter para el locutor
          </p>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default EditorMencionesInline;
