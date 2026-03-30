/**
 * ROLE CUSTOMIZATION - TIER 0 Supremacy
 * 
 * @description Sistema de personalización avanzada por rol con
 * configuración dinámica de UI, workflows y experiencia de usuario.
 * 
 * @version 2040.1.0
 * @tier TIER_0_SUPREMACY
 * @classification PERSONALIZATION_SYSTEM
 * @philosophy "Invisible Complexity, Obvious Value"
 */

'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Briefcase,
  Radio,
  Crown,
  Shield,
  Palette,
  Layout,
  Zap,
  Eye,
  Smartphone,
  Monitor,
  Tablet,
  Settings,
  User,
  Bell,
  Clock,
  Target,
  BarChart3,
  Brain,
  Sparkles,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Languages,
  Accessibility,
  Save,
  RotateCcw
} from 'lucide-react';

// Tipos de personalización
type UserRole = 'ejecutivo' | 'programador' | 'administrador' | 'super-admin';
type ThemeMode = 'light' | 'dark' | 'auto';
type Density = 'compact' | 'comfortable' | 'spacious';
type LayoutMode = 'sidebar' | 'topbar' | 'hybrid';
type DevicePreference = 'mobile' | 'desktop' | 'tablet' | 'adaptive';

interface PersonalizationSettings {
  // Configuración visual
  theme: ThemeMode;
  primaryColor: string;
  accentColor: string;
  density: Density;
  fontSize: number;
  borderRadius: number;
  animations: boolean;
  
  // Configuración de layout
  layoutMode: LayoutMode;
  sidebarCollapsed: boolean;
  devicePreference: DevicePreference;
  showTooltips: boolean;
  
  // Configuración de notificaciones
  notifications: {
    desktop: boolean;
    email: boolean;
    push: boolean;
    sound: boolean;
    vibration: boolean;
  };
  
  // Configuración de workflow
  autoSave: boolean;
  quickActions: string[];
  dashboardWidgets: string[];
  defaultViews: Record<string, string>;
  
  // Configuración de accesibilidad
  highContrast: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  
  // Configuración específica por rol
  roleSpecific: Record<string, any>;
}

interface RoleConfig {
  id: UserRole;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  primaryColor: string;
  accentColor: string;
  defaultSettings: Partial<PersonalizationSettings>;
  availableFeatures: string[];
  recommendedLayout: LayoutMode;
  optimizedFor: DevicePreference[];
}

// Configuraciones por rol
const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  ejecutivo: {
    id: 'ejecutivo',
    name: 'Ejecutivo de Ventas',
    icon: Briefcase,
    description: 'Optimizado para trabajo en campo y gestión de clientes',
    primaryColor: '#6366f1',
    accentColor: '#06b6d4',
    defaultSettings: {
      layoutMode: 'hybrid',
      devicePreference: 'mobile',
      density: 'comfortable',
      animations: true,
      quickActions: ['new-lead', 'schedule-meeting', 'send-proposal', 'update-pipeline'],
      dashboardWidgets: ['pipeline', 'targets', 'activities', 'leads'],
      notifications: {
        desktop: true,
        email: true,
        push: true,
        sound: true,
        vibration: true,
      },
    },
    availableFeatures: ['mobile-sync', 'offline-mode', 'voice-notes', 'gps-tracking'],
    recommendedLayout: 'hybrid',
    optimizedFor: ['mobile', 'tablet'],
  },
  programador: {
    id: 'programador',
    name: 'Programador de Tráfico',
    icon: Radio,
    description: 'Optimizado para operación técnica y monitoreo 24/7',
    primaryColor: '#0ea5e9',
    accentColor: '#8b5cf6',
    defaultSettings: {
      layoutMode: 'sidebar',
      devicePreference: 'desktop',
      density: 'compact',
      animations: false,
      quickActions: ['export-schedule', 'monitor-stations', 'manage-spots', 'generate-reports'],
      dashboardWidgets: ['system-status', 'active-campaigns', 'alerts', 'performance'],
      notifications: {
        desktop: true,
        email: false,
        push: false,
        sound: true,
        vibration: false,
      },
    },
    availableFeatures: ['multi-monitor', 'keyboard-shortcuts', 'bulk-operations', 'system-alerts'],
    recommendedLayout: 'sidebar',
    optimizedFor: ['desktop'],
  },
  administrador: {
    id: 'administrador',
    name: 'Administrador Cliente',
    icon: Crown,
    description: 'Optimizado para liderazgo estratégico y toma de decisiones',
    primaryColor: '#7c3aed',
    accentColor: '#059669',
    defaultSettings: {
      layoutMode: 'topbar',
      devicePreference: 'desktop',
      density: 'spacious',
      animations: true,
      quickActions: ['view-analytics', 'team-performance', 'strategic-planning', 'client-reports'],
      dashboardWidgets: ['kpis', 'team-performance', 'revenue', 'strategic-goals'],
      notifications: {
        desktop: true,
        email: true,
        push: false,
        sound: false,
        vibration: false,
      },
    },
    availableFeatures: ['executive-dashboard', 'advanced-analytics', 'team-management', 'strategic-tools'],
    recommendedLayout: 'topbar',
    optimizedFor: ['desktop', 'tablet'],
  },
  'super-admin': {
    id: 'super-admin',
    name: 'Super Administrador',
    icon: Shield,
    description: 'Acceso completo al sistema y configuración avanzada',
    primaryColor: '#dc2626',
    accentColor: '#f59e0b',
    defaultSettings: {
      layoutMode: 'sidebar',
      devicePreference: 'desktop',
      density: 'compact',
      animations: false,
      quickActions: ['system-health', 'user-management', 'security-audit', 'system-config'],
      dashboardWidgets: ['system-overview', 'user-activity', 'security-alerts', 'performance-metrics'],
      notifications: {
        desktop: true,
        email: true,
        push: true,
        sound: true,
        vibration: false,
      },
    },
    availableFeatures: ['system-admin', 'security-tools', 'audit-logs', 'advanced-config'],
    recommendedLayout: 'sidebar',
    optimizedFor: ['desktop'],
  },
};

// Colores disponibles
const AVAILABLE_COLORS = [
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Green', value: '#10b981' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Cyan', value: '#06b6d4' },
];

// Context para personalización
const PersonalizationContext = createContext<{
  settings: PersonalizationSettings;
  updateSettings: (updates: Partial<PersonalizationSettings>) => void;
  resetToDefaults: () => void;
  currentRole: UserRole;
} | null>(null);

export function usePersonalization() {
  const context = useContext(PersonalizationContext);
  if (!context) {
    throw new Error('usePersonalization must be used within PersonalizationProvider');
  }
  return context;
}

// Provider de personalización
export function PersonalizationProvider({ 
  children, 
  initialRole = 'ejecutivo' 
}: { 
  children: React.ReactNode;
  initialRole?: UserRole;
}) {
  const [currentRole, setCurrentRole] = useState<UserRole>(initialRole);
  const [settings, setSettings] = useState<PersonalizationSettings>(() => {
    const roleConfig = ROLE_CONFIGS[initialRole];
    return {
      theme: 'light',
      primaryColor: roleConfig.primaryColor,
      accentColor: roleConfig.accentColor,
      density: 'comfortable',
      fontSize: 14,
      borderRadius: 8,
      animations: true,
      layoutMode: 'sidebar',
      sidebarCollapsed: false,
      devicePreference: 'adaptive',
      showTooltips: true,
      notifications: {
        desktop: true,
        email: true,
        push: false,
        sound: true,
        vibration: false,
      },
      autoSave: true,
      quickActions: [],
      dashboardWidgets: [],
      defaultViews: {},
      highContrast: false,
      reducedMotion: false,
      screenReader: false,
      keyboardNavigation: false,
      roleSpecific: {},
      ...roleConfig.defaultSettings,
    };
  });

  const updateSettings = (updates: Partial<PersonalizationSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const resetToDefaults = () => {
    const roleConfig = ROLE_CONFIGS[currentRole];
    setSettings({
      theme: 'light',
      primaryColor: roleConfig.primaryColor,
      accentColor: roleConfig.accentColor,
      density: 'comfortable',
      fontSize: 14,
      borderRadius: 8,
      animations: true,
      layoutMode: 'sidebar',
      sidebarCollapsed: false,
      devicePreference: 'adaptive',
      showTooltips: true,
      notifications: {
        desktop: true,
        email: true,
        push: false,
        sound: true,
        vibration: false,
      },
      autoSave: true,
      quickActions: [],
      dashboardWidgets: [],
      defaultViews: {},
      highContrast: false,
      reducedMotion: false,
      screenReader: false,
      keyboardNavigation: false,
      roleSpecific: {},
      ...roleConfig.defaultSettings,
    });
  };

  return (
    <PersonalizationContext.Provider value={{
      settings,
      updateSettings,
      resetToDefaults,
      currentRole,
    }}>
      {children}
    </PersonalizationContext.Provider>
  );
}

// Componente principal de personalización
export default function RoleCustomization({ 
  currentRole,
  onRoleChange 
}: {
  currentRole: UserRole;
  onRoleChange?: (role: UserRole) => void;
}) {
  const { settings, updateSettings, resetToDefaults } = usePersonalization();
  const [activeTab, setActiveTab] = useState('appearance');
  const [hasChanges, setHasChanges] = useState(false);

  const roleConfig = ROLE_CONFIGS[currentRole];
  const RoleIcon = roleConfig.icon;

  // Detectar cambios
  useEffect(() => {
    setHasChanges(true);
  }, [settings]);

  const handleSave = () => {
    // Aquí se guardarían las configuraciones
    
    setHasChanges(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={cn(
            "p-3 rounded-lg",
            `bg-[${roleConfig.primaryColor}]`
          )}>
            <RoleIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Personalización por Rol
            </h1>
            <p className="text-gray-600">
              {roleConfig.name} - {roleConfig.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {hasChanges && (
            <Badge variant="outline" className="text-orange-600 border-orange-200">
              Cambios pendientes
            </Badge>
          )}
          <Button variant="outline" onClick={resetToDefaults}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Restaurar
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges}>
            <Save className="h-4 w-4 mr-2" />
            Guardar
          </Button>
        </div>
      </div>

      {/* Tabs de configuración */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="appearance">Apariencia</TabsTrigger>
          <TabsTrigger value="layout">Layout</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
          <TabsTrigger value="workflow">Workflow</TabsTrigger>
          <TabsTrigger value="accessibility">Accesibilidad</TabsTrigger>
        </TabsList>

        {/* Apariencia */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Tema y Colores
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Modo de tema */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Modo de tema</label>
                <div className="flex gap-3">
                  {(['light', 'dark', 'auto'] as ThemeMode[]).map((mode) => (
                    <Button
                      key={mode}
                      variant={settings.theme === mode ? "default" : "outline"}
                      onClick={() => updateSettings({ theme: mode })}
                      className="flex items-center gap-2"
                    >
                      {mode === 'light' && <Sun className="h-4 w-4" />}
                      {mode === 'dark' && <Moon className="h-4 w-4" />}
                      {mode === 'auto' && <Sparkles className="h-4 w-4" />}
                      {mode === 'light' ? 'Claro' : mode === 'dark' ? 'Oscuro' : 'Auto'}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Color primario */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Color primario</label>
                <div className="flex flex-wrap gap-3">
                  {AVAILABLE_COLORS.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => updateSettings({ primaryColor: color.value })}
                      className={cn(
                        "w-10 h-10 rounded-lg border-2 transition-all",
                        settings.primaryColor === color.value
                          ? "border-gray-900 scale-110"
                          : "border-gray-200 hover:scale-105"
                      )}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Densidad */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Densidad de la interfaz</label>
                <Select
                  value={settings.density}
                  onValueChange={(value: Density) => updateSettings({ density: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compact">Compacta</SelectItem>
                    <SelectItem value="comfortable">Cómoda</SelectItem>
                    <SelectItem value="spacious">Espaciosa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tamaño de fuente */}
              <div className="space-y-3">
                <label className="text-sm font-medium">
                  Tamaño de fuente: {settings.fontSize}px
                </label>
                <Slider
                  value={[settings.fontSize]}
                  onValueChange={([value]) => updateSettings({ fontSize: value })}
                  min={12}
                  max={18}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Border radius */}
              <div className="space-y-3">
                <label className="text-sm font-medium">
                  Redondez de bordes: {settings.borderRadius}px
                </label>
                <Slider
                  value={[settings.borderRadius]}
                  onValueChange={([value]) => updateSettings({ borderRadius: value })}
                  min={0}
                  max={16}
                  step={2}
                  className="w-full"
                />
              </div>

              {/* Animaciones */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Animaciones</label>
                  <p className="text-xs text-gray-500">
                    Habilitar transiciones y micro-interacciones
                  </p>
                </div>
                <Switch
                  checked={settings.animations}
                  onCheckedChange={(checked) => updateSettings({ animations: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Layout */}
        <TabsContent value="layout" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="h-5 w-5" />
                Configuración de Layout
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Modo de layout */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Modo de navegación</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['sidebar', 'topbar', 'hybrid'] as LayoutMode[]).map((mode) => (
                    <Button
                      key={mode}
                      variant={settings.layoutMode === mode ? "default" : "outline"}
                      onClick={() => updateSettings({ layoutMode: mode })}
                      className="h-20 flex flex-col items-center justify-center gap-2"
                    >
                      <Layout className="h-5 w-5" />
                      <span className="text-xs">
                        {mode === 'sidebar' ? 'Barra Lateral' : 
                         mode === 'topbar' ? 'Barra Superior' : 'Híbrido'}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Preferencia de dispositivo */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Optimizado para</label>
                <div className="grid grid-cols-4 gap-3">
                  {(['mobile', 'desktop', 'tablet', 'adaptive'] as DevicePreference[]).map((device) => (
                    <Button
                      key={device}
                      variant={settings.devicePreference === device ? "default" : "outline"}
                      onClick={() => updateSettings({ devicePreference: device })}
                      className="flex flex-col items-center gap-2 h-16"
                    >
                      {device === 'mobile' && <Smartphone className="h-4 w-4" />}
                      {device === 'desktop' && <Monitor className="h-4 w-4" />}
                      {device === 'tablet' && <Tablet className="h-4 w-4" />}
                      {device === 'adaptive' && <Zap className="h-4 w-4" />}
                      <span className="text-xs">
                        {device === 'mobile' ? 'Móvil' :
                         device === 'desktop' ? 'Desktop' :
                         device === 'tablet' ? 'Tablet' : 'Adaptivo'}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Sidebar colapsada */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Sidebar colapsada por defecto</label>
                  <p className="text-xs text-gray-500">
                    Iniciar con la barra lateral minimizada
                  </p>
                </div>
                <Switch
                  checked={settings.sidebarCollapsed}
                  onCheckedChange={(checked) => updateSettings({ sidebarCollapsed: checked })}
                />
              </div>

              {/* Tooltips */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Mostrar tooltips</label>
                  <p className="text-xs text-gray-500">
                    Ayudas contextuales al pasar el mouse
                  </p>
                </div>
                <Switch
                  checked={settings.showTooltips}
                  onCheckedChange={(checked) => updateSettings({ showTooltips: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notificaciones */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Configuración de Notificaciones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(settings.notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium capitalize">
                      {key === 'desktop' ? 'Notificaciones de escritorio' :
                       key === 'email' ? 'Notificaciones por email' :
                       key === 'push' ? 'Notificaciones push' :
                       key === 'sound' ? 'Sonidos de notificación' :
                       'Vibración'}
                    </label>
                    <p className="text-xs text-gray-500">
                      {key === 'desktop' ? 'Mostrar notificaciones en el sistema' :
                       key === 'email' ? 'Recibir alertas por correo electrónico' :
                       key === 'push' ? 'Notificaciones en dispositivos móviles' :
                       key === 'sound' ? 'Reproducir sonidos de alerta' :
                       'Vibrar en dispositivos móviles'}
                    </p>
                  </div>
                  <Switch
                    checked={value}
                    onCheckedChange={(checked) => 
                      updateSettings({
                        notifications: {
                          ...settings.notifications,
                          [key]: checked
                        }
                      })
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Workflow */}
        <TabsContent value="workflow" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Configuración de Workflow
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Auto-save */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Guardado automático</label>
                  <p className="text-xs text-gray-500">
                    Guardar cambios automáticamente
                  </p>
                </div>
                <Switch
                  checked={settings.autoSave}
                  onCheckedChange={(checked) => updateSettings({ autoSave: checked })}
                />
              </div>

              {/* Quick Actions */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Acciones rápidas disponibles</label>
                <div className="grid grid-cols-2 gap-2">
                  {roleConfig.availableFeatures.map((feature) => (
                    <div key={feature} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={feature}
                        checked={settings.quickActions.includes(feature)}
                        onChange={(e) => {
                          const newQuickActions = e.target.checked
                            ? [...settings.quickActions, feature]
                            : settings.quickActions.filter(a => a !== feature);
                          updateSettings({ quickActions: newQuickActions });
                        }}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor={feature} className="text-sm capitalize">
                        {feature.replace('-', ' ')}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Accesibilidad */}
        <TabsContent value="accessibility" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Accessibility className="h-5 w-5" />
                Configuración de Accesibilidad
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Alto contraste */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Alto contraste</label>
                  <p className="text-xs text-gray-500">
                    Aumentar el contraste para mejor visibilidad
                  </p>
                </div>
                <Switch
                  checked={settings.highContrast}
                  onCheckedChange={(checked) => updateSettings({ highContrast: checked })}
                />
              </div>

              {/* Movimiento reducido */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Movimiento reducido</label>
                  <p className="text-xs text-gray-500">
                    Minimizar animaciones y transiciones
                  </p>
                </div>
                <Switch
                  checked={settings.reducedMotion}
                  onCheckedChange={(checked) => updateSettings({ reducedMotion: checked })}
                />
              </div>

              {/* Lector de pantalla */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Soporte para lector de pantalla</label>
                  <p className="text-xs text-gray-500">
                    Optimizar para tecnologías asistivas
                  </p>
                </div>
                <Switch
                  checked={settings.screenReader}
                  onCheckedChange={(checked) => updateSettings({ screenReader: checked })}
                />
              </div>

              {/* Navegación por teclado */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Navegación por teclado</label>
                  <p className="text-xs text-gray-500">
                    Habilitar atajos de teclado avanzados
                  </p>
                </div>
                <Switch
                  checked={settings.keyboardNavigation}
                  onCheckedChange={(checked) => updateSettings({ keyboardNavigation: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}