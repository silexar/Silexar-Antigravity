/**
 * 📱 SERVICIO DE RESPONSIVE DESIGN TIER0
 * Mobile-first responsive design con detección de dispositivo y adaptación automática
 * Optimizado para operaciones Fortune 10 en cualquier dispositivo
 */

export type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'tv';
export type Orientation = 'portrait' | 'landscape';

interface BreakpointConfig {
    mobile: number;
    tablet: number;
    desktop: number;
    tv: number;
}

interface ResponsiveConfig {
    currentDevice: DeviceType;
    orientation: Orientation;
    screenWidth: number;
    screenHeight: number;
    isTouchDevice: boolean;
    pixelRatio: number;
}

export class ResponsiveDesignService {
    private readonly BREAKPOINTS: BreakpointConfig = {
        mobile: 640,    // < 640px
        tablet: 1024,   // 640px - 1024px
        desktop: 1920,  // 1024px - 1920px
        tv: 3840        // > 1920px (4K)
    };

    private config: ResponsiveConfig;
    private listeners: Set<(config: ResponsiveConfig) => void> = new Set();

    constructor() {
        this.config = this.detectDevice();
        this.setupListeners();
    }

    /**
     * 📱 Detecta el tipo de dispositivo actual
     */
    private detectDevice(): ResponsiveConfig {
        if (typeof window === 'undefined') {
            return {
                currentDevice: 'desktop',
                orientation: 'landscape',
                screenWidth: 1920,
                screenHeight: 1080,
                isTouchDevice: false,
                pixelRatio: 1
            };
        }

        const width = window.innerWidth;
        const height = window.innerHeight;
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const pixelRatio = window.devicePixelRatio || 1;

        let currentDevice: DeviceType;
        if (width < this.BREAKPOINTS.mobile) {
            currentDevice = 'mobile';
        } else if (width < this.BREAKPOINTS.tablet) {
            currentDevice = 'tablet';
        } else if (width < this.BREAKPOINTS.desktop) {
            currentDevice = 'desktop';
        } else {
            currentDevice = 'tv';
        }

        const orientation: Orientation = width > height ? 'landscape' : 'portrait';

        return {
            currentDevice,
            orientation,
            screenWidth: width,
            screenHeight: height,
            isTouchDevice,
            pixelRatio
        };
    }

    /**
     * 🎧 Configura listeners para cambios de viewport
     */
    private setupListeners(): void {
        if (typeof window === 'undefined') return;

        const handleResize = () => {
            const newConfig = this.detectDevice();
            const hasChanged =
                newConfig.currentDevice !== this.config.currentDevice ||
                newConfig.orientation !== this.config.orientation;

            this.config = newConfig;

            if (hasChanged) {
                this.notifyListeners();
            }
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', handleResize);
    }

    /**
     * 📢 Notifica a los listeners sobre cambios
     */
    private notifyListeners(): void {
        this.listeners.forEach(listener => listener(this.config));
    }

    /**
     * 🔔 Suscribe a cambios de configuración responsive
     */
    subscribe(callback: (config: ResponsiveConfig) => void): () => void {
        this.listeners.add(callback);

        // Retornar función de unsuscribe
        return () => {
            this.listeners.delete(callback);
        };
    }

    /**
     * 📊 Obtiene la configuración actual
     */
    getConfig(): ResponsiveConfig {
        return { ...this.config };
    }

    /**
     * 📱 Verifica si es dispositivo móvil
     */
    isMobile(): boolean {
        return this.config.currentDevice === 'mobile';
    }

    /**
     * 📱 Verifica si es tablet
     */
    isTablet(): boolean {
        return this.config.currentDevice === 'tablet';
    }

    /**
     * 💻 Verifica si es desktop
     */
    isDesktop(): boolean {
        return this.config.currentDevice === 'desktop';
    }

    /**
     * 📺 Verifica si es TV/pantalla grande
     */
    isTV(): boolean {
        return this.config.currentDevice === 'tv';
    }

    /**
     * 🔄 Verifica si está en modo portrait
     */
    isPortrait(): boolean {
        return this.config.orientation === 'portrait';
    }

    /**
     * 🔄 Verifica si está en modo landscape
     */
    isLandscape(): boolean {
        return this.config.orientation === 'landscape';
    }

    /**
     * 👆 Verifica si es dispositivo táctil
     */
    isTouchDevice(): boolean {
        return this.config.isTouchDevice;
    }

    /**
     * 🎨 Obtiene clases CSS responsive
     */
    getResponsiveClasses(): string[] {
        const classes: string[] = [];

        classes.push(`device-${this.config.currentDevice}`);
        classes.push(`orientation-${this.config.orientation}`);

        if (this.config.isTouchDevice) {
            classes.push('touch-device');
        }

        if (this.config.pixelRatio > 1) {
            classes.push('retina');
        }

        return classes;
    }

    /**
     * 📏 Calcula tamaño de fuente responsive
     */
    getResponsiveFontSize(baseSize: number): number {
        const scaleFactor = {
            mobile: 0.875,   // 87.5% del tamaño base
            tablet: 0.9375,  // 93.75% del tamaño base
            desktop: 1,      // 100% del tamaño base
            tv: 1.25         // 125% del tamaño base
        };

        return baseSize * scaleFactor[this.config.currentDevice];
    }

    /**
     * 📐 Calcula espaciado responsive
     */
    getResponsiveSpacing(baseSpacing: number): number {
        const scaleFactor = {
            mobile: 0.75,    // 75% del espaciado base
            tablet: 0.875,   // 87.5% del espaciado base
            desktop: 1,      // 100% del espaciado base
            tv: 1.5          // 150% del espaciado base
        };

        return baseSpacing * scaleFactor[this.config.currentDevice];
    }

    /**
     * 🖼️ Obtiene URL de imagen responsive
     */
    getResponsiveImageUrl(baseUrl: string): string {
        const suffix = {
            mobile: '@1x',
            tablet: '@1.5x',
            desktop: '@2x',
            tv: '@3x'
        };

        const extension = baseUrl.split('.').pop();
        const urlWithoutExtension = baseUrl.substring(0, baseUrl.lastIndexOf('.'));

        return `${urlWithoutExtension}${suffix[this.config.currentDevice]}.${extension}`;
    }

    /**
     * 📊 Obtiene número de columnas para grid responsive
     */
    getResponsiveColumns(maxColumns: number = 12): number {
        const columns = {
            mobile: Math.min(1, maxColumns),
            tablet: Math.min(2, maxColumns),
            desktop: Math.min(3, maxColumns),
            tv: Math.min(4, maxColumns)
        };

        return columns[this.config.currentDevice];
    }

    /**
     * 📱 Genera meta tags para responsive
     */
    getResponsiveMetaTags(): string[] {
        return [
            '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">',
            '<meta name="mobile-web-app-capable" content="yes">',
            '<meta name="apple-mobile-web-app-capable" content="yes">',
            '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">',
            `<meta name="theme-color" content="#1e293b">`
        ];
    }

    /**
     * 🎯 Optimiza rendimiento según dispositivo
     */
    getPerformanceConfig(): {
        enableAnimations: boolean;
        enableTransitions: boolean;
        enableShadows: boolean;
        imageQuality: 'low' | 'medium' | 'high' | 'ultra';
    } {
        // Dispositivos móviles: optimizar rendimiento
        if (this.isMobile()) {
            return {
                enableAnimations: true,
                enableTransitions: true,
                enableShadows: false,
                imageQuality: 'medium'
            };
        }

        // Tablets: balance entre rendimiento y calidad
        if (this.isTablet()) {
            return {
                enableAnimations: true,
                enableTransitions: true,
                enableShadows: true,
                imageQuality: 'high'
            };
        }

        // Desktop y TV: máxima calidad
        return {
            enableAnimations: true,
            enableTransitions: true,
            enableShadows: true,
            imageQuality: this.isTV() ? 'ultra' : 'high'
        };
    }

    /**
     * 📱 Detecta si debe mostrar versión móvil de componente
     */
    shouldUseMobileLayout(): boolean {
        return this.isMobile() || (this.isTablet() && this.isPortrait());
    }

    /**
     * 🎨 Genera estilos CSS responsive dinámicos
     */
    generateResponsiveStyles(): string {
        const config = this.getPerformanceConfig();

        return `
      :root {
        --screen-width: ${this.config.screenWidth}px;
        --screen-height: ${this.config.screenHeight}px;
        --device-type: ${this.config.currentDevice};
        --is-touch: ${this.config.isTouchDevice ? 1 : 0};
        --pixel-ratio: ${this.config.pixelRatio};
      }

      body {
        ${!config.enableAnimations ? 'animation: none !important;' : ''}
        ${!config.enableTransitions ? 'transition: none !important;' : ''}
      }

      * {
        ${!config.enableShadows ? 'box-shadow: none !important;' : ''}
      }
    `;
    }
}

export const responsiveDesignService = new ResponsiveDesignService();
