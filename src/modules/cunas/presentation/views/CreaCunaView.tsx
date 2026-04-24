/**
 * VIEW: CREAR CUÑA - TIER 0
 *
 * Vista para la creación de nuevas cuñas con diseño neumórfico y enfoque mobile-first.
 * Implementa el wizard de creación rápida con pasos optimizados para operación diaria.
 */

import React, { useState } from 'react';
import { 
  NeumorphicCard, 
  NeumorphicButton, 
  NeumorphicInput, 
  NeumorphicSelect, 
  NeumorphicStyles 
} from '../ui/NeumorphicComponents';
import { 
  Music, 
  Mic, 
  MessageSquare, 
  Square, 
  Star, 
  Calendar, 
  User, 
  Package,
  Play,
  Save,
  ArrowLeft,
  ArrowRight,
  Check,
  Sparkles
} from 'lucide-react';

interface CrearCunaFormData {
  tipo: 'audio' | 'mencion' | 'presentacion' | 'cierre' | 'promo';
  nombre: string;
  anuncianteId: string;
  producto: string;
  duracion: number;
  fechaInicio: string;
  fechaTermino: string;
  estado: 'activo' | 'inactivo';
  urgencia: 'critico' | 'urgente' | 'programado' | 'standby';
  descripcion: string;
  archivoAudio?: File;
}

export const CrearCunaView: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<CrearCunaFormData>({
    tipo: 'audio',
    nombre: '',
    anuncianteId: '',
    producto: '',
    duracion: 30,
    fechaInicio: new Date().toISOString().split('T')[0],
    fechaTermino: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    estado: 'activo',
    urgencia: 'programado',
    descripcion: ''
  });

  const tiposOptions = [
    { value: 'audio', label: '🎵 Audio Pregrabado' },
    { value: 'mencion', label: '🎙️ Texto para Mención' },
    { value: 'presentacion', label: '📢 Presentación de Auspicio' },
    { value: 'cierre', label: '🔚 Cierre de Auspicio' },
    { value: 'promo', label: '🎯 Promo/IDA Variable' }
  ];

  const anuncianteOptions = [
    { value: '1', label: 'SuperMax SpA' },
    { value: '2', label: 'Banco ABC' },
    { value: '3', label: 'Televisión Nacional' },
    { value: '4', label: 'Retail SA' },
    { value: '5', label: 'Farmacia Popular' }
  ];

  const urgenciaOptions = [
    { value: 'critico', label: '🚨 Crítico' },
    { value: 'urgente', label: '⚡ Urgente' },
    { value: 'programado', label: '📅 Programado' },
    { value: 'standby', label: '📋 Standby' }
  ];

  const handleChange = (field: keyof CrearCunaFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        archivoAudio: e.target.files![0]
      }));
    }
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    console.log('Datos de cuña:', formData);
    // Aquí iría la lógica para crear la cuña
    alert('Cuña creada exitosamente!');
  };

  const renderStepIndicator = () => {
    return (
      <div className="flex justify-center mb-8">
        {[1, 2, 3].map((num) => (
          <div key={num} className="flex items-center">
            <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step >= num ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white' : 'bg-gray-200 text-gray-600'
              }`}
            >
              {step > num ? <Check className="w-5 h-5" /> : num}
            </div>
            {num < 3 && (
              <div className={`w-16 h-1 ${step > num ? 'bg-gradient-to-r from-purple-500 to-blue-500' : 'bg-gray-200'}`}></div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4 md:p-6">
      <NeumorphicStyles />
      
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <NeumorphicCard className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
                <Package className="w-8 h-8 text-purple-600" />
                Crear Nueva Cuña
              </h1>
              <p className="text-gray-600 mt-1">Asistente para la creación de material publicitario</p>
            </div>
            
            <div className="flex gap-2">
              <NeumorphicButton 
                variant="secondary" 
                size="md"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </NeumorphicButton>
            </div>
          </div>
        </NeumorphicCard>

        {/* Indicador de pasos */}
        {renderStepIndicator()}

        {/* Contenido del paso */}
        <NeumorphicCard className="p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            {step === 1 && <span className="p-2 rounded-lg bg-blue-100"><MessageSquare className="w-5 h-5 text-blue-600" /></span>}
            {step === 2 && <span className="p-2 rounded-lg bg-green-100"><Calendar className="w-5 h-5 text-green-600" /></span>}
            {step === 3 && <span className="p-2 rounded-lg bg-purple-100"><Save className="w-5 h-5 text-purple-600" /></span>}
            {step === 1 && 'Información Básica'}
            {step === 2 && 'Contenido y Archivo'}
            {step === 3 && 'Revisión y Confirmación'}
          </h2>

          {/* Paso 1: Información Básica */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ¿Qué material vas a cargar?
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tiposOptions.map((tipo) => (
                    <button
                      key={tipo.value}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.tipo === tipo.value
                          ? 'border-purple-400 bg-purple-50 scale-[1.02]'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                      onClick={() => handleChange('tipo', tipo.value)}
                    >
                      <div className="flex items-center">
                        <div className="mr-3 text-purple-600">
                          {tipo.value === 'audio' && <Music className="w-6 h-6" />}
                          {tipo.value === 'mencion' && <Mic className="w-6 h-6" />}
                          {tipo.value === 'presentacion' && <MessageSquare className="w-6 h-6" />}
                          {tipo.value === 'cierre' && <Square className="w-6 h-6" />}
                          {tipo.value === 'promo' && <Star className="w-6 h-6" />}
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-gray-800">{tipo.label.split(' ')[1]}</p>
                          <p className="text-xs text-gray-600">
                            {tipo.value === 'audio' && 'Archivo MP3/WAV del cliente'}
                            {tipo.value === 'mencion' && 'Guión para locutor en vivo'}
                            {tipo.value === 'presentacion' && 'Entrada a programa patrocinado'}
                            {tipo.value === 'cierre' && 'Salida de programa patrocinado'}
                            {tipo.value === 'promo' && 'Contenido con datos que cambian'}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <NeumorphicInput
                label="Nombre de la Cuña"
                value={formData.nombre}
                onChange={(value) => handleChange('nombre', value)}
                placeholder="Ej: Promoción Verano SuperMax 30s"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <NeumorphicSelect
                    label="Anunciante"
                    value={formData.anuncianteId}
                    onChange={(value) => handleChange('anuncianteId', value)}
                    options={anuncianteOptions}
                  />
                  <button 
                    className="mt-2 text-sm text-blue-600 hover:underline flex items-center"
                    onClick={() => console.log('Crear nuevo anunciante')}
                  >
                    <User className="w-4 h-4 mr-1" /> ¿Cliente nuevo? Crear anunciante
                  </button>
                </div>

                <NeumorphicInput
                  label="Producto"
                  value={formData.producto}
                  onChange={(value) => handleChange('producto', value)}
                  placeholder="Ej: Tarjeta Dorada"
                />
              </div>
            </div>
          )}

          {/* Paso 2: Contenido y Archivo */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contenido del Material
                </label>
                
                {(formData.tipo === 'mencion' || formData.tipo === 'presentacion' || formData.tipo === 'cierre') ? (
                  <div className="space-y-4">
                    <textarea
                      value={formData.descripcion}
                      onChange={(e) => handleChange('descripcion', e.target.value)}
                      placeholder="Escribe aquí el contenido del material..."
                      className="w-full h-40 p-4 rounded-xl bg-input-surface shadow-neumorphic-inset focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                      style={{
                        background: 'linear-gradient(145deg, #e6e6e6, #ffffff)',
                        boxShadow: 'inset 8px 8px 16px #d1d1d1, inset -8px -8px 16px #ffffff',
                      }}
                    />
                    
                    <div className="flex flex-wrap gap-2">
                      <button className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">[ÉNFASIS]</button>
                      <button className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">[PAUSA:1s]</button>
                      <button className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">[DELETREO]</button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Archivo de Audio
                    </label>
                    <div 
                      className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                      style={{
                        background: 'linear-gradient(145deg, #e6e6e6, #ffffff)',
                        boxShadow: 'inset 8px 8px 16px #d1d1d1, inset -8px -8px 16px #ffffff',
                      }}
                      onClick={() => document.getElementById('file-upload')?.click()}
                    >
                      <input 
                        id="file-upload" 
                        type="file" 
                        className="hidden" 
                        accept="audio/*"
                        onChange={handleFileUpload}
                      />
                      <Music className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="font-medium text-gray-700">Arrastra tu archivo aquí o haz clic para seleccionar</p>
                      <p className="text-sm text-gray-500 mt-1">MP3, WAV, M4A, FLAC, AAC (máx. 100MB)</p>
                      <p className="text-xs text-gray-400 mt-2">Recomendado: 320kbps, 44.1kHz</p>
                    </div>
                    
                    {formData.archivoAudio && (
                      <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200 flex items-center justify-between">
                        <div className="flex items-center">
                          <Play className="w-5 h-5 text-green-600 mr-2" />
                          <span className="text-sm font-medium">{formData.archivoAudio.name}</span>
                        </div>
                        <span className="text-xs text-gray-500">{(formData.archivoAudio.size / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <NeumorphicInput
                  label="Duración Estimada (segundos)"
                  value={formData.duracion.toString()}
                  onChange={(value) => handleChange('duracion', parseInt(value) || 0)}
                  type="number"
                />

                <NeumorphicSelect
                  label="Nivel de Urgencia"
                  value={formData.urgencia}
                  onChange={(value) => handleChange('urgencia', value as any)}
                  options={urgenciaOptions}
                />
              </div>
            </div>
          )}

          {/* Paso 3: Revisión y Confirmación */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="border border-gray-200 rounded-xl p-4">
                <h3 className="font-medium text-gray-800 mb-3">Resumen del Material</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">Tipo:</span>
                    <span className="font-medium capitalize">{formData.tipo}</span>
                  </div>
                  
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">Nombre:</span>
                    <span className="font-medium">{formData.nombre}</span>
                  </div>
                  
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">Anunciante:</span>
                    <span className="font-medium">
                      {anuncianteOptions.find(a => a.value === formData.anuncianteId)?.label || 'No seleccionado'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">Producto:</span>
                    <span className="font-medium">{formData.producto || '-'}</span>
                  </div>
                  
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">Duración:</span>
                    <span className="font-medium">{formData.duracion} segundos</span>
                  </div>
                  
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">Vigencia:</span>
                    <span className="font-medium">
                      {formData.fechaInicio} a {formData.fechaTermino}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Urgencia:</span>
                    <span className="font-medium capitalize">{formData.urgencia}</span>
                  </div>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-xl p-4">
                <h3 className="font-medium text-gray-800 mb-3">Vigencia y Programación</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <NeumorphicInput
                    label="Fecha Inicio"
                    value={formData.fechaInicio}
                    onChange={(value) => handleChange('fechaInicio', value)}
                    type="date"
                  />
                  
                  <NeumorphicInput
                    label="Fecha Término"
                    value={formData.fechaTermino}
                    onChange={(value) => handleChange('fechaTermino', value)}
                    type="date"
                  />
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start">
                    <Sparkles className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-800">Análisis inteligente</p>
                      <p className="text-sm text-blue-600">
                        Duración típica para este tipo: 30 días • Recomendación: Vigencia adecuada ✅
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navegación */}
          <div className="flex justify-between mt-8">
            <div>
              {step > 1 && (
                <NeumorphicButton 
                  variant="secondary" 
                  size="md"
                  onClick={handlePrevious}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Anterior
                </NeumorphicButton>
              )}
            </div>
            
            <div>
              {step < 3 ? (
                <NeumorphicButton 
                  variant="primary" 
                  size="md"
                  onClick={handleNext}
                >
                  Siguiente
                  <ArrowRight className="w-4 h-4 ml-2" />
                </NeumorphicButton>
              ) : (
                <NeumorphicButton 
                  variant="primary" 
                  size="md"
                  onClick={handleSubmit}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Crear Cuña
                </NeumorphicButton>
              )}
            </div>
          </div>
        </NeumorphicCard>
      </div>
    </div>
  );
};