'use client';

/**
 * SILEXAR PULSE - TIER0+ AI GENERATIVE STUDIO
 * Estudio de Generación de Creatividades con IA
 * 
 * Implementación según visión original del Módulo 8.2
 * 
 * @version 2.0.0
 * @author Silexar Pulse Team
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Wand2,
  Image as ImageIcon,
  Type,
  Mic,
  Sparkles,
  Download,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Loader2,
  Check,
  AlertCircle,
  Zap,
  Target,
  Palette,
  Upload,
} from 'lucide-react';

// ============================================================================
// TIPOS
// ============================================================================

type ImageStyle = 'photorealistic' | 'illustration' | 'minimalist' | 'corporate' | 'vibrant' | 'dark' | 'elegant' | 'playful';
type AspectRatio = '1:1' | '16:9' | '9:16' | '4:5' | '728x90' | '300x250' | '160x600' | '320x50';
type TargetPlatform = 'instagram_story' | 'instagram_feed' | 'facebook_feed' | 'tiktok' | 'display_banner' | 'email';
type TextTone = 'professional' | 'friendly' | 'energetic' | 'urgent' | 'informative' | 'emotional' | 'humorous' | 'inspirational';
type TextFormat = 'headline' | 'tagline' | 'body_copy' | 'call_to_action' | 'social_post' | 'ad_script' | 'radio_mention';

interface GeneratedImage {
  id: string;
  url: string;
  aspectRatio: string;
  style: string;
  approved: boolean | null;
}

interface GeneratedText {
  id: string;
  text: string;
  variation: string;
  approved: boolean | null;
  analysis?: {
    readabilityScore: number;
    emotionalImpact: number;
    estimatedCTR: number;
  };
}

interface AIGenerativeStudioProps {
  className?: string;
  onSaveCreativity?: (creativity: SavedCreativity) => void;
  brandAssets?: {
    name: string;
    logoUrl?: string;
    primaryColor?: string;
  };
}

interface SavedCreativity {
  type: 'image' | 'text' | 'audio';
  content: string;
  metadata: Record<string, unknown>;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const IMAGE_STYLES: { value: ImageStyle; label: string }[] = [
  { value: 'photorealistic', label: 'Fotorealista' },
  { value: 'illustration', label: 'Ilustración' },
  { value: 'minimalist', label: 'Minimalista' },
  { value: 'corporate', label: 'Corporativo' },
  { value: 'vibrant', label: 'Vibrante' },
  { value: 'dark', label: 'Oscuro/Dramático' },
  { value: 'elegant', label: 'Elegante' },
  { value: 'playful', label: 'Divertido' },
];

const ASPECT_RATIOS: { value: AspectRatio; label: string }[] = [
  { value: '1:1', label: 'Cuadrado (1:1)' },
  { value: '16:9', label: 'Horizontal (16:9)' },
  { value: '9:16', label: 'Vertical Stories (9:16)' },
  { value: '4:5', label: 'Instagram Feed (4:5)' },
  { value: '728x90', label: 'Leaderboard (728x90)' },
  { value: '300x250', label: 'MPU (300x250)' },
  { value: '160x600', label: 'Skyscraper (160x600)' },
  { value: '320x50', label: 'Mobile Banner (320x50)' },
];

const PLATFORMS: { value: TargetPlatform; label: string }[] = [
  { value: 'instagram_story', label: 'Instagram Story' },
  { value: 'instagram_feed', label: 'Instagram Feed' },
  { value: 'facebook_feed', label: 'Facebook Feed' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'display_banner', label: 'Display Banner' },
  { value: 'email', label: 'Email Marketing' },
];

const TEXT_TONES: { value: TextTone; label: string }[] = [
  { value: 'professional', label: 'Profesional' },
  { value: 'friendly', label: 'Amigable' },
  { value: 'energetic', label: 'Energético' },
  { value: 'urgent', label: 'Urgente' },
  { value: 'informative', label: 'Informativo' },
  { value: 'emotional', label: 'Emocional' },
  { value: 'humorous', label: 'Humorístico' },
  { value: 'inspirational', label: 'Inspirador' },
];

const TEXT_FORMATS: { value: TextFormat; label: string }[] = [
  { value: 'headline', label: 'Titular' },
  { value: 'tagline', label: 'Eslogan' },
  { value: 'body_copy', label: 'Cuerpo de texto' },
  { value: 'call_to_action', label: 'Call to Action' },
  { value: 'social_post', label: 'Post Social Media' },
  { value: 'ad_script', label: 'Guion de Anuncio' },
  { value: 'radio_mention', label: 'Mención Radial' },
];

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export const AIGenerativeStudioComplete: React.FC<AIGenerativeStudioProps> = ({
  className = '',
  onSaveCreativity,
  brandAssets,
}) => {
  const [activeTab, setActiveTab] = useState<'image' | 'text' | 'audio'>('text');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  // Estado para generación de imágenes
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageStyle, setImageStyle] = useState<ImageStyle>('corporate');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('300x250');
  const [platform, setPlatform] = useState<TargetPlatform>('display_banner');
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);

  // Estado para generación de texto
  const [textBrief, setTextBrief] = useState('');
  const [textTone, setTextTone] = useState<TextTone>('professional');
  const [textFormat, setTextFormat] = useState<TextFormat>('headline');
  const [keywords, setKeywords] = useState('');
  const [callToAction, setCTA] = useState('');
  const [generatedTexts, setGeneratedTexts] = useState<GeneratedText[]>([]);

  // Simulación de generación
  const simulateGeneration = useCallback(async (type: 'image' | 'text') => {
    setIsGenerating(true);
    setGenerationProgress(0);

    // Simular progreso
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => Math.min(prev + 10, 90));
    }, 200);

    await new Promise(resolve => setTimeout(resolve, 2500));
    clearInterval(progressInterval);
    setGenerationProgress(100);

    if (type === 'image') {
      // Generar imágenes simuladas
      const newImages: GeneratedImage[] = Array.from({ length: 4 }, (_, i) => ({
        id: `img_${Date.now()}_${i}`,
        url: `https://via.placeholder.com/${aspectRatio === '300x250' ? '300x250' : '400x400'}/6366f1/ffffff?text=Variant+${i + 1}`,
        aspectRatio,
        style: imageStyle,
        approved: null,
      }));
      setGeneratedImages(newImages);
    } else {
      // Generar textos simulados
      const variations = ['original', 'shorter', 'more_urgent', 'more_friendly'];
      const newTexts: GeneratedText[] = variations.map((variation, i) => ({
        id: `txt_${Date.now()}_${i}`,
        text: getSimulatedText(textFormat, textBrief, variation),
        variation,
        approved: null,
        analysis: {
          readabilityScore: 75 + Math.random() * 20,
          emotionalImpact: 60 + Math.random() * 30,
          estimatedCTR: 2 + Math.random() * 3,
        },
      }));
      setGeneratedTexts(newTexts);
    }

    setIsGenerating(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aspectRatio, imageStyle, textFormat, textBrief, callToAction]);

  const getSimulatedText = (format: TextFormat, brief: string, variation: string): string => {
    const baseTexts: Record<TextFormat, string> = {
      headline: `Descubre ${brief.slice(0, 30) || 'la diferencia'}...`,
      tagline: `${brief.slice(0, 20) || 'Innovación'}. Calidad. Confianza.`,
      body_copy: `En un mundo donde ${brief.slice(0, 50) || 'todo cambia'}... nosotros te ofrecemos la solución.`,
      call_to_action: callToAction || '¡Obtén tu descuento ahora!',
      social_post: `🔥 ${brief.slice(0, 80) || 'Novedad increíble'}... #trending`,
      ad_script: `[VOZ EN OFF] ${brief.slice(0, 100) || 'Presentamos algo nuevo'}...`,
      radio_mention: `[MENCIÓN] ¡Atención oyentes! ${brief.slice(0, 80) || 'Gran oportunidad'}...`,
    };

    let text = baseTexts[format];
    
    if (variation === 'shorter') {
      text = text.slice(0, Math.floor(text.length * 0.6)) + '...';
    } else if (variation === 'more_urgent') {
      text = '⚡ URGENTE: ' + text + ' ¡Solo por hoy!';
    } else if (variation === 'more_friendly') {
      text = '😊 ' + text.toLowerCase();
    }

    return text;
  };

  const handleApprove = (type: 'image' | 'text', id: string, approved: boolean) => {
    if (type === 'image') {
      setGeneratedImages(prev =>
        prev.map(img => img.id === id ? { ...img, approved } : img)
      );
    } else {
      setGeneratedTexts(prev =>
        prev.map(txt => txt.id === id ? { ...txt, approved } : txt)
      );
    }
  };

  const handleSave = (type: 'image' | 'text', item: GeneratedImage | GeneratedText) => {
    if (onSaveCreativity) {
      onSaveCreativity({
        type,
        content: type === 'image' ? (item as GeneratedImage).url : (item as GeneratedText).text,
        metadata: item as unknown as Record<string, unknown>,
      });
    }
  };

  return (
    <Card className={`${className} bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 border-purple-500/20`}>
      <CardHeader className="border-b border-purple-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
              <Wand2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl text-white flex items-center gap-2">
                Estudio de IA Generativa
                <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Powered by Vertex AI
                </Badge>
              </CardTitle>
              <CardDescription className="text-slate-400">
                Genera creatividades publicitarias con inteligencia artificial
              </CardDescription>
            </div>
          </div>
          {brandAssets && (
            <Badge variant="outline" className="border-purple-500/30 text-purple-300">
              <Palette className="w-3 h-3 mr-1" />
              {brandAssets.name}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'image' | 'text' | 'audio')}>
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-slate-800/50">
            <TabsTrigger value="image" className="flex items-center gap-2 data-[state=active]:bg-purple-600">
              <ImageIcon className="w-4 h-4" />
              <span>Imágenes</span>
            </TabsTrigger>
            <TabsTrigger value="text" className="flex items-center gap-2 data-[state=active]:bg-purple-600">
              <Type className="w-4 h-4" />
              <span>Texto/Copy</span>
            </TabsTrigger>
            <TabsTrigger value="audio" className="flex items-center gap-2 data-[state=active]:bg-purple-600">
              <Mic className="w-4 h-4" />
              <span>Audio</span>
            </TabsTrigger>
          </TabsList>

          {/* ============= TAB: IMÁGENES ============= */}
          <TabsContent value="image" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Panel de Configuración */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Describe la imagen que necesitas</Label>
                  <Textarea
                    placeholder="Ej: Banner promocional para préstamos hipotecarios mostrando una familia feliz frente a una casa nueva, con tonos azules y estilo profesional..."
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    className="min-h-[120px] bg-slate-800/50 border-slate-700 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Estilo Visual</Label>
                    <Select value={imageStyle} onValueChange={(v) => setImageStyle(v as ImageStyle)}>
                      <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {IMAGE_STYLES.map(style => (
                          <SelectItem key={style.value} value={style.value}>
                            {style.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300">Formato/Tamaño</Label>
                    <Select value={aspectRatio} onValueChange={(v) => setAspectRatio(v as AspectRatio)}>
                      <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ASPECT_RATIOS.map(ratio => (
                          <SelectItem key={ratio.value} value={ratio.value}>
                            {ratio.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Plataforma de Destino</Label>
                  <Select value={platform} onValueChange={(v) => setPlatform(v as TargetPlatform)}>
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PLATFORMS.map(p => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Activos de Marca (opcional)</Label>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 border-dashed border-slate-600 text-slate-400">
                      <Upload className="w-4 h-4 mr-2" />
                      Subir Logo
                    </Button>
                    <Input 
                      placeholder="Color primario (#hex)" 
                      className="flex-1 bg-slate-800/50 border-slate-700 text-white"
                    />
                  </div>
                </div>

                <Button 
                  onClick={() => simulateGeneration('image')}
                  disabled={isGenerating || !imagePrompt.trim()}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generar 4 Variantes
                    </>
                  )}
                </Button>

                {isGenerating && (
                  <div className="space-y-2">
                    <Progress value={generationProgress} className="h-2" />
                    <p className="text-xs text-slate-400 text-center">
                      {generationProgress < 100 ? 'Procesando con Vertex AI Imagen...' : '¡Completado!'}
                    </p>
                  </div>
                )}
              </div>

              {/* Panel de Resultados */}
              <div className="space-y-4">
                <Label className="text-slate-300">Variantes Generadas</Label>
                {generatedImages.length === 0 ? (
                  <div className="h-64 flex items-center justify-center border border-dashed border-slate-700 rounded-lg bg-slate-800/30">
                    <p className="text-slate-500">Las imágenes generadas aparecerán aquí</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {generatedImages.map((img) => (
                      <div key={img.id} className="relative group rounded-lg overflow-hidden border border-slate-700">
                        <img 
                          src={img.url} 
                          alt={`Variant ${img.id}`} 
                          className="w-full h-32 object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button 
                            size="sm" 
                            variant={img.approved === true ? 'default' : 'outline'}
                            className={img.approved === true ? 'bg-green-600' : ''}
                            onClick={() => handleApprove('image', img.id, true)}
                          >
                            <ThumbsUp className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant={img.approved === false ? 'default' : 'outline'}
                            className={img.approved === false ? 'bg-red-600' : ''}
                            onClick={() => handleApprove('image', img.id, false)}
                          >
                            <ThumbsDown className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleSave('image', img)}>
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                        {img.approved !== null && (
                          <div className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center ${img.approved ? 'bg-green-500' : 'bg-red-500'}`}>
                            {img.approved ? <Check className="w-4 h-4 text-white" /> : <AlertCircle className="w-4 h-4 text-white" />}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* ============= TAB: TEXTO ============= */}
          <TabsContent value="text" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Panel de Configuración */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Brief / Descripción</Label>
                  <Textarea
                    placeholder="Describe lo que necesitas comunicar. Sé específico sobre el producto, beneficios y objetivo..."
                    value={textBrief}
                    onChange={(e) => setTextBrief(e.target.value)}
                    className="min-h-[100px] bg-slate-800/50 border-slate-700 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Tono</Label>
                    <Select value={textTone} onValueChange={(v) => setTextTone(v as TextTone)}>
                      <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TEXT_TONES.map(tone => (
                          <SelectItem key={tone.value} value={tone.value}>
                            {tone.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300">Formato</Label>
                    <Select value={textFormat} onValueChange={(v) => setTextFormat(v as TextFormat)}>
                      <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TEXT_FORMATS.map(format => (
                          <SelectItem key={format.value} value={format.value}>
                            {format.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Palabras Clave (separadas por coma)</Label>
                  <Input
                    placeholder="oferta, descuento, exclusivo, nuevo..."
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    className="bg-slate-800/50 border-slate-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Call to Action deseado</Label>
                  <Input
                    placeholder="Ej: ¡Compra ahora! / Solicita tu cotización..."
                    value={callToAction}
                    onChange={(e) => setCTA(e.target.value)}
                    className="bg-slate-800/50 border-slate-700 text-white"
                  />
                </div>

                <Button 
                  onClick={() => simulateGeneration('text')}
                  disabled={isGenerating || !textBrief.trim()}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generar Variantes de Copy
                    </>
                  )}
                </Button>

                {isGenerating && (
                  <div className="space-y-2">
                    <Progress value={generationProgress} className="h-2" />
                    <p className="text-xs text-slate-400 text-center">
                      {generationProgress < 100 ? 'Procesando con Gemini Pro...' : '¡Completado!'}
                    </p>
                  </div>
                )}
              </div>

              {/* Panel de Resultados */}
              <div className="space-y-4">
                <Label className="text-slate-300">Variantes Generadas</Label>
                {generatedTexts.length === 0 ? (
                  <div className="h-64 flex items-center justify-center border border-dashed border-slate-700 rounded-lg bg-slate-800/30">
                    <p className="text-slate-500">Los textos generados aparecerán aquí</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    {generatedTexts.map((txt) => (
                      <div key={txt.id} className="p-4 rounded-lg border border-slate-700 bg-slate-800/30 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <Badge variant="outline" className="mb-2 text-xs border-purple-500/30 text-purple-300">
                              {txt.variation}
                            </Badge>
                            <p className="text-white text-sm">{txt.text}</p>
                          </div>
                          <div className="flex gap-1">
                            <Button 
                              size="sm" 
                              variant={txt.approved === true ? 'default' : 'ghost'}
                              className={txt.approved === true ? 'bg-green-600 h-8 w-8 p-0' : 'h-8 w-8 p-0'}
                              onClick={() => handleApprove('text', txt.id, true)}
                            >
                              <ThumbsUp className="w-3 h-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant={txt.approved === false ? 'default' : 'ghost'}
                              className={txt.approved === false ? 'bg-red-600 h-8 w-8 p-0' : 'h-8 w-8 p-0'}
                              onClick={() => handleApprove('text', txt.id, false)}
                            >
                              <ThumbsDown className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        
                        {txt.analysis && (
                          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-700/50">
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-1 text-xs text-slate-400">
                                <Zap className="w-3 h-3" />
                                <span>Legibilidad</span>
                              </div>
                              <p className="text-sm font-semibold text-green-400">{txt.analysis.readabilityScore.toFixed(0)}%</p>
                            </div>
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-1 text-xs text-slate-400">
                                <Target className="w-3 h-3" />
                                <span>Impacto</span>
                              </div>
                              <p className="text-sm font-semibold text-purple-400">{txt.analysis.emotionalImpact.toFixed(0)}%</p>
                            </div>
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-1 text-xs text-slate-400">
                                <RefreshCw className="w-3 h-3" />
                                <span>CTR Est.</span>
                              </div>
                              <p className="text-sm font-semibold text-blue-400">{txt.analysis.estimatedCTR.toFixed(1)}%</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* ============= TAB: AUDIO ============= */}
          <TabsContent value="audio" className="space-y-6">
            <div className="flex items-center justify-center h-64 border border-dashed border-slate-700 rounded-lg bg-slate-800/30">
              <div className="text-center space-y-3">
                <Mic className="w-12 h-12 text-slate-500 mx-auto" />
                <p className="text-slate-400">Generación de Audio Sintético</p>
                <p className="text-xs text-slate-500">Integración con Google Text-to-Speech próximamente</p>
                <Badge variant="outline" className="border-yellow-500/30 text-yellow-400">
                  En Desarrollo
                </Badge>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="border-t border-purple-500/20 pt-4">
        <div className="flex items-center justify-between w-full text-xs text-slate-500">
          <span>Powered by Vertex AI (Imagen) + Gemini Pro</span>
          <span>Las imágenes y textos son generados por IA y deben ser revisados antes de su uso</span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default AIGenerativeStudioComplete;
