/**
 * SILEXAR PULSE - TIER0+ MRAID BUILDER ENGINE
 * Motor de Generación de Micro-Aplicaciones MRAID v3
 * 
 * Genera código HTML5 compatible con MRAID v3 para publicidad móvil
 * con eventos de facturación CPVI (Cost Per Valuable Interaction)
 * 
 * @version 2.0.0
 * @author Silexar Pulse Team
 */

// ============================================================================
// TIPOS Y CONFIGURACIÓN
// ============================================================================

export type TemplateType = 
  | 'loan_calculator'
  | 'currency_converter'
  | 'travel_checklist'
  | 'memory_game'
  | 'savings_calculator'
  | 'bmi_calculator'
  | 'tip_calculator'
  | 'unit_converter';

export type BillingEventType = 
  | 'calculation_completed'
  | 'quote_requested'
  | 'contact_submitted'
  | 'conversion_completed'
  | 'checklist_completed'
  | 'game_completed'
  | 'high_score'
  | 'custom_event';

export interface MRAIDConfig {
  readonly templateType: TemplateType;
  readonly brand: BrandConfig;
  readonly functionality: FunctionalityConfig;
  readonly billing: BillingConfig;
  readonly appearance: AppearanceConfig;
}

export interface BrandConfig {
  readonly name: string;
  readonly logoUrl?: string;
  readonly logoBase64?: string;
  readonly sponsorText: string;
  readonly clickThroughUrl?: string;
  readonly trackingPixels?: string[];
}

export interface FunctionalityConfig {
  readonly [key: string]: unknown;
  // Campos específicos por plantilla se definen dinámicamente
}

export interface BillingConfig {
  readonly eventType: BillingEventType;
  readonly eventIdentifier: string;
  readonly customEventName?: string;
  readonly trackInteractions: boolean;
}

export interface AppearanceConfig {
  readonly primaryColor: string;
  readonly secondaryColor: string;
  readonly backgroundColor: string;
  readonly textColor: string;
  readonly fontFamily: string;
  readonly borderRadius: number;
}

/**
 * Resultado de la generación
 */
export interface MRAIDGenerationResult {
  readonly html: string;
  readonly css: string;
  readonly js: string;
  readonly combined: string;
  readonly manifest: MRAIDManifest;
  readonly zipBlob?: Blob;
}

export interface MRAIDManifest {
  readonly version: string;
  readonly name: string;
  readonly description: string;
  readonly template: TemplateType;
  readonly billingEvent: string;
  readonly mraidVersion: '3.0';
  readonly dimensions: { width: number; height: number };
  readonly createdAt: string;
  readonly checksum: string;
}

// ============================================================================
// CLASE PRINCIPAL DEL BUILDER
// ============================================================================

export class MRAIDBuilder {
  private config: MRAIDConfig;

  constructor(config: MRAIDConfig) {
    this.config = config;
  }

  /**
   * Genera el paquete MRAID completo
   */
  async generate(): Promise<MRAIDGenerationResult> {
    const html = this.generateHTML();
    const css = this.generateCSS();
    const js = this.generateJS();
    const combined = this.combineAssets(html, css, js);
    const manifest = this.generateManifest();

    return {
      html,
      css,
      js,
      combined,
      manifest,
    };
  }

  /**
   * Genera el archivo ZIP para descarga
   */
  async generateZip(): Promise<Blob> {
    const result = await this.generate();
    
    // Crear contenido del ZIP (simulado - en producción usar JSZip)
    const zipContent = this.createZipContent(result);
    
    return new Blob([zipContent], { type: 'application/zip' });
  }

  // ==========================================================================
  // GENERACIÓN DE HTML
  // ==========================================================================

  private generateHTML(): string {
    const template = this.getHTMLTemplate();
    
    return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="mraid-support" content="true">
    <title>${this.config.brand.name} - ${this.getTemplateName()}</title>
    <script src="mraid.js"></script>
    <style>
        /* Styles injected below */
    </style>
</head>
<body>
    <div id="ad-container" class="mraid-container">
        <header class="brand-header">
            ${this.config.brand.logoBase64 ? `<img src="${this.config.brand.logoBase64}" alt="${this.config.brand.name}" class="brand-logo">` : ''}
            <span class="sponsor-text">${this.config.brand.sponsorText}</span>
        </header>
        
        <main class="utility-content">
            ${template}
        </main>
        
        <footer class="brand-footer">
            ${this.config.brand.clickThroughUrl ? `<a href="#" onclick="handleClickThrough()" class="cta-button">Más Información</a>` : ''}
            <div class="powered-by">Powered by Silexar Pulse</div>
        </footer>
    </div>
    
    ${this.config.brand.trackingPixels?.map(url => `<img src="${url}" width="1" height="1" style="display:none">`).join('\n') || ''}
    
    <script>
        // JavaScript injected below
    </script>
</body>
</html>`;
  }

  private getHTMLTemplate(): string {
    switch (this.config.templateType) {
      case 'loan_calculator':
        return this.getLoanCalculatorHTML();
      case 'currency_converter':
        return this.getCurrencyConverterHTML();
      case 'travel_checklist':
        return this.getTravelChecklistHTML();
      case 'memory_game':
        return this.getMemoryGameHTML();
      case 'tip_calculator':
        return this.getTipCalculatorHTML();
      case 'bmi_calculator':
        return this.getBMICalculatorHTML();
      default:
        return this.getGenericUtilityHTML();
    }
  }

  private getLoanCalculatorHTML(): string {
    const config = this.config.functionality;
    return `
<div class="calculator-container">
    <h2>Calcula tu Préstamo</h2>
    
    <div class="input-group">
        <label for="loan-amount">Monto del Préstamo</label>
        <input type="range" id="loan-amount" 
               min="${config.minAmount || 100000}" 
               max="${config.maxAmount || 1000000}" 
               value="${config.defaultAmount || 500000}"
               oninput="updateLoanDisplay()">
        <output id="amount-display">$0</output>
    </div>
    
    <div class="input-group">
        <label for="loan-term">Plazo (años)</label>
        <input type="range" id="loan-term" 
               min="1" 
               max="${config.maxTerm || 30}" 
               value="${config.defaultTerm || 15}"
               oninput="updateLoanDisplay()">
        <output id="term-display">15 años</output>
    </div>
    
    <div class="input-group">
        <label for="interest-rate">Tasa de Interés (%)</label>
        <input type="number" id="interest-rate" 
               value="${config.defaultRate || 4.5}" 
               step="0.1" 
               min="0" 
               max="30"
               onchange="updateLoanDisplay()">
    </div>
    
    <button onclick="calculateLoan()" class="calculate-button">
        Calcular Cuota Mensual
    </button>
    
    <div id="result-container" class="result-hidden">
        <div class="result-item">
            <span class="result-label">Cuota Mensual</span>
            <span id="monthly-payment" class="result-value">$0</span>
        </div>
        <div class="result-item">
            <span class="result-label">Total a Pagar</span>
            <span id="total-payment" class="result-value">$0</span>
        </div>
        <div class="result-item">
            <span class="result-label">Total Intereses</span>
            <span id="total-interest" class="result-value">$0</span>
        </div>
    </div>
</div>`;
  }

  private getCurrencyConverterHTML(): string {
    const config = this.config.functionality;
    return `
<div class="converter-container">
    <h2>Conversor de Divisas</h2>
    
    <div class="currency-input-group">
        <label>De</label>
        <select id="from-currency">
            <option value="CLP" ${config.baseCurrency === 'CLP' ? 'selected' : ''}>CLP - Peso Chileno</option>
            <option value="USD" ${config.baseCurrency === 'USD' ? 'selected' : ''}>USD - Dólar</option>
            <option value="EUR" ${config.baseCurrency === 'EUR' ? 'selected' : ''}>EUR - Euro</option>
        </select>
        <input type="number" id="from-amount" value="1000" oninput="convertCurrency()">
    </div>
    
    <button onclick="swapCurrencies()" class="swap-button">⇅</button>
    
    <div class="currency-input-group">
        <label>A</label>
        <select id="to-currency" onchange="convertCurrency()">
            <option value="USD">USD - Dólar</option>
            <option value="EUR">EUR - Euro</option>
            <option value="CLP">CLP - Peso Chileno</option>
        </select>
        <input type="text" id="to-amount" readonly>
    </div>
    
    <div id="rate-display" class="rate-info">
        Cargando tasa de cambio...
    </div>
    
    <button onclick="saveConversion()" class="action-button">
        Guardar Conversión
    </button>
</div>`;
  }

  private getTravelChecklistHTML(): string {
    return `
<div class="checklist-container">
    <h2>Checklist de Viaje</h2>
    
    <div class="category-tabs">
        <button onclick="showCategory('documents')" class="tab active">Documentos</button>
        <button onclick="showCategory('luggage')" class="tab">Equipaje</button>
        <button onclick="showCategory('health')" class="tab">Salud</button>
    </div>
    
    <div id="documents-list" class="checklist-items active">
        <label class="checkbox-item"><input type="checkbox" onchange="updateProgress()"> Pasaporte</label>
        <label class="checkbox-item"><input type="checkbox" onchange="updateProgress()"> ID/Carnet</label>
        <label class="checkbox-item"><input type="checkbox" onchange="updateProgress()"> Reservas de Hotel</label>
        <label class="checkbox-item"><input type="checkbox" onchange="updateProgress()"> Tickets de Vuelo</label>
        <label class="checkbox-item"><input type="checkbox" onchange="updateProgress()"> Seguro de Viaje</label>
    </div>
    
    <div id="luggage-list" class="checklist-items">
        <label class="checkbox-item"><input type="checkbox" onchange="updateProgress()"> Ropa</label>
        <label class="checkbox-item"><input type="checkbox" onchange="updateProgress()"> Artículos de Aseo</label>
        <label class="checkbox-item"><input type="checkbox" onchange="updateProgress()"> Cargador</label>
        <label class="checkbox-item"><input type="checkbox" onchange="updateProgress()"> Adaptador</label>
    </div>
    
    <div id="health-list" class="checklist-items">
        <label class="checkbox-item"><input type="checkbox" onchange="updateProgress()"> Medicamentos</label>
        <label class="checkbox-item"><input type="checkbox" onchange="updateProgress()"> Vacunas al día</label>
        <label class="checkbox-item"><input type="checkbox" onchange="updateProgress()"> Botiquín</label>
    </div>
    
    <div class="progress-section">
        <div class="progress-bar">
            <div id="progress-fill" class="progress-fill" style="width: 0%"></div>
        </div>
        <span id="progress-text">0% completado</span>
    </div>
</div>`;
  }

  private getMemoryGameHTML(): string {
    return `
<div class="game-container">
    <h2>Juego de Memoria</h2>
    
    <div class="game-header">
        <div class="timer">⏱️ <span id="time-display">00:00</span></div>
        <div class="moves">Movimientos: <span id="moves-display">0</span></div>
    </div>
    
    <div id="game-board" class="memory-board">
        <!-- Cards generated by JS -->
    </div>
    
    <div id="game-result" class="game-result hidden">
        <h3>¡Felicitaciones!</h3>
        <p>Completado en <span id="final-time">00:00</span></p>
        <p>Con <span id="final-moves">0</span> movimientos</p>
        <button onclick="restartGame()" class="action-button">Jugar de Nuevo</button>
    </div>
    
    <button onclick="startGame()" id="start-button" class="action-button">
        Iniciar Juego
    </button>
</div>`;
  }

  private getTipCalculatorHTML(): string {
    return `
<div class="tip-container">
    <h2>Calculadora de Propina</h2>
    
    <div class="input-group">
        <label for="bill-amount">Total de la Cuenta</label>
        <input type="number" id="bill-amount" placeholder="$0.00" oninput="calculateTip()">
    </div>
    
    <div class="tip-buttons">
        <button onclick="setTip(10)" class="tip-btn">10%</button>
        <button onclick="setTip(15)" class="tip-btn active">15%</button>
        <button onclick="setTip(20)" class="tip-btn">20%</button>
        <button onclick="setTip(25)" class="tip-btn">25%</button>
    </div>
    
    <div class="input-group">
        <label for="num-people">Dividir entre</label>
        <input type="number" id="num-people" value="1" min="1" oninput="calculateTip()">
    </div>
    
    <div class="results">
        <div class="result-row">
            <span>Propina:</span>
            <span id="tip-amount">$0.00</span>
        </div>
        <div class="result-row">
            <span>Total:</span>
            <span id="total-amount">$0.00</span>
        </div>
        <div class="result-row">
            <span>Por persona:</span>
            <span id="per-person">$0.00</span>
        </div>
    </div>
</div>`;
  }

  private getBMICalculatorHTML(): string {
    return `
<div class="bmi-container">
    <h2>Calculadora de IMC</h2>
    
    <div class="input-group">
        <label for="weight">Peso (kg)</label>
        <input type="number" id="weight" placeholder="70" oninput="calculateBMI()">
    </div>
    
    <div class="input-group">
        <label for="height">Altura (cm)</label>
        <input type="number" id="height" placeholder="170" oninput="calculateBMI()">
    </div>
    
    <div id="bmi-result" class="bmi-result hidden">
        <div class="bmi-value">
            <span>Tu IMC:</span>
            <span id="bmi-number" class="bmi-number">--</span>
        </div>
        <div id="bmi-category" class="bmi-category">--</div>
        <div class="bmi-scale">
            <div id="bmi-indicator" class="bmi-indicator"></div>
        </div>
    </div>
</div>`;
  }

  private getGenericUtilityHTML(): string {
    return `
<div class="generic-container">
    <h2>Utilidad Interactiva</h2>
    <p>Contenido de la micro-aplicación</p>
    <button onclick="handleAction()" class="action-button">Acción Principal</button>
</div>`;
  }

  // ==========================================================================
  // GENERACIÓN DE CSS
  // ==========================================================================

  private generateCSS(): string {
    const { primaryColor, secondaryColor, backgroundColor, textColor, fontFamily, borderRadius } = this.config.appearance;
    
    return `
/* MRAID Base Styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: ${fontFamily}, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: ${backgroundColor};
    color: ${textColor};
    min-height: 100vh;
    overflow-x: hidden;
}

.mraid-container {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    padding: 16px;
}

/* Header */
.brand-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: white;
    border-radius: ${borderRadius}px;
    margin-bottom: 16px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.brand-logo {
    height: 32px;
    width: auto;
}

.sponsor-text {
    font-size: 12px;
    color: #666;
    font-weight: 500;
}

/* Main Content */
.utility-content {
    flex: 1;
    background: white;
    border-radius: ${borderRadius}px;
    padding: 20px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}

h2 {
    font-size: 20px;
    color: ${primaryColor};
    margin-bottom: 16px;
    text-align: center;
}

/* Input Groups */
.input-group {
    margin-bottom: 16px;
}

.input-group label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 6px;
    color: #333;
}

.input-group input[type="number"],
.input-group input[type="text"],
.input-group select {
    width: 100%;
    padding: 12px;
    border: 2px solid #e5e7eb;
    border-radius: ${borderRadius}px;
    font-size: 16px;
    transition: border-color 0.2s;
}

.input-group input:focus,
.input-group select:focus {
    outline: none;
    border-color: ${primaryColor};
}

.input-group input[type="range"] {
    width: 100%;
    height: 8px;
    -webkit-appearance: none;
    background: linear-gradient(to right, ${primaryColor} 0%, ${primaryColor} 50%, #e5e7eb 50%, #e5e7eb 100%);
    border-radius: 4px;
}

.input-group input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 24px;
    height: 24px;
    background: ${primaryColor};
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(0,0,0,0.2);
}

.input-group output {
    display: block;
    text-align: center;
    font-size: 24px;
    font-weight: bold;
    color: ${primaryColor};
    margin-top: 8px;
}

/* Buttons */
.action-button,
.calculate-button,
.cta-button {
    display: block;
    width: 100%;
    padding: 14px 24px;
    background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor});
    color: white;
    border: none;
    border-radius: ${borderRadius}px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    text-align: center;
    text-decoration: none;
}

.action-button:hover,
.calculate-button:hover,
.cta-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.action-button:active,
.calculate-button:active,
.cta-button:active {
    transform: translateY(0);
}

/* Results */
.result-hidden {
    display: none;
}

.result-visible {
    display: block;
    margin-top: 20px;
    padding: 16px;
    background: linear-gradient(135deg, ${primaryColor}10, ${secondaryColor}10);
    border-radius: ${borderRadius}px;
    border: 1px solid ${primaryColor}30;
}

.result-item {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid #eee;
}

.result-item:last-child {
    border-bottom: none;
}

.result-label {
    font-size: 14px;
    color: #666;
}

.result-value {
    font-size: 18px;
    font-weight: bold;
    color: ${primaryColor};
}

/* Checklist Styles */
.category-tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
}

.tab {
    flex: 1;
    padding: 10px;
    border: 2px solid #e5e7eb;
    background: white;
    border-radius: ${borderRadius}px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s;
}

.tab.active {
    background: ${primaryColor};
    color: white;
    border-color: ${primaryColor};
}

.checklist-items {
    display: none;
}

.checklist-items.active {
    display: block;
}

.checkbox-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: #f9fafb;
    border-radius: ${borderRadius}px;
    margin-bottom: 8px;
    cursor: pointer;
    transition: background 0.2s;
}

.checkbox-item:hover {
    background: #f3f4f6;
}

.checkbox-item input[type="checkbox"] {
    width: 20px;
    height: 20px;
    accent-color: ${primaryColor};
}

/* Progress Bar */
.progress-section {
    margin-top: 20px;
}

.progress-bar {
    height: 8px;
    background: #e5e7eb;
    border-radius: 4px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, ${primaryColor}, ${secondaryColor});
    transition: width 0.3s ease;
}

#progress-text {
    display: block;
    text-align: center;
    font-size: 14px;
    color: ${primaryColor};
    font-weight: 500;
    margin-top: 8px;
}

/* Memory Game */
.memory-board {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    margin: 16px 0;
}

.memory-card {
    aspect-ratio: 1;
    background: ${primaryColor};
    border-radius: ${borderRadius}px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    transition: transform 0.3s;
}

.memory-card.flipped {
    background: white;
    border: 2px solid ${primaryColor};
}

.memory-card.matched {
    background: #10b981;
    pointer-events: none;
}

.game-header {
    display: flex;
    justify-content: space-between;
    padding: 12px;
    background: #f3f4f6;
    border-radius: ${borderRadius}px;
    margin-bottom: 16px;
}

.game-result {
    text-align: center;
    padding: 20px;
}

.game-result.hidden {
    display: none;
}

/* Footer */
.brand-footer {
    margin-top: 16px;
    text-align: center;
}

.powered-by {
    font-size: 10px;
    color: #999;
    margin-top: 12px;
}

/* Tip Calculator */
.tip-buttons {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
}

.tip-btn {
    flex: 1;
    padding: 12px;
    border: 2px solid #e5e7eb;
    background: white;
    border-radius: ${borderRadius}px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.tip-btn.active {
    background: ${primaryColor};
    color: white;
    border-color: ${primaryColor};
}

.results {
    background: #f9fafb;
    padding: 16px;
    border-radius: ${borderRadius}px;
}

.result-row {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    font-size: 16px;
}

.result-row:last-child {
    border-top: 2px solid ${primaryColor};
    margin-top: 8px;
    padding-top: 12px;
    font-weight: bold;
}

/* BMI Calculator */
.bmi-result {
    text-align: center;
    padding: 20px;
    background: #f9fafb;
    border-radius: ${borderRadius}px;
    margin-top: 20px;
}

.bmi-number {
    font-size: 48px;
    font-weight: bold;
    color: ${primaryColor};
}

.bmi-category {
    font-size: 18px;
    margin-top: 8px;
    font-weight: 500;
}

.bmi-scale {
    height: 8px;
    background: linear-gradient(90deg, #10b981, #eab308, #f97316, #ef4444);
    border-radius: 4px;
    margin-top: 16px;
    position: relative;
}

.bmi-indicator {
    position: absolute;
    width: 16px;
    height: 16px;
    background: white;
    border: 3px solid #333;
    border-radius: 50%;
    top: -4px;
    transform: translateX(-50%);
    transition: left 0.3s ease;
}

/* Animations */
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

.result-visible {
    animation: fadeIn 0.3s ease;
}

/* Currency Converter */
.swap-button {
    display: block;
    margin: 16px auto;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    border: 2px solid ${primaryColor};
    background: white;
    font-size: 20px;
    cursor: pointer;
    transition: all 0.2s;
}

.swap-button:hover {
    background: ${primaryColor};
    color: white;
}

.rate-info {
    text-align: center;
    font-size: 14px;
    color: #666;
    margin: 16px 0;
}`;
  }

  // ==========================================================================
  // GENERACIÓN DE JAVASCRIPT
  // ==========================================================================

  private generateJS(): string {
    const billingEventCode = this.generateBillingEventCode();
    const templateCode = this.getTemplateJS();
    
    return `
// MRAID v3 Integration
(function() {
    'use strict';
    
    // Configuration
    const CONFIG = ${JSON.stringify({
      brandName: this.config.brand.name,
      billingEvent: this.config.billing.eventType,
      eventIdentifier: this.config.billing.eventIdentifier,
      clickThroughUrl: this.config.brand.clickThroughUrl,
    }, null, 2)};
    
    // MRAID State
    let mraidReady = false;
    let interactionLogged = false;
    
    // Initialize MRAID
    function initMraid() {
        if (typeof mraid !== 'undefined') {
            if (mraid.getState() === 'loading') {
                mraid.addEventListener('ready', onMraidReady);
            } else {
                onMraidReady();
            }
        } else {
            // Fallback for non-MRAID environments
            logger.info('[MRAID] Running in fallback mode');
            mraidReady = true;
        }
    }
    
    function onMraidReady() {
        mraidReady = true;
        logger.info('[MRAID] Ready');
        
        // Track initial impression
        trackEvent('impression');
    }
    
    // Event Tracking
    function trackEvent(eventName, eventData) {
        const payload = {
            event: eventName,
            timestamp: new Date().toISOString(),
            brand: CONFIG.brandName,
            identifier: CONFIG.eventIdentifier,
            data: eventData || {}
        };
        
        logger.info('[MRAID Event]', payload);
        
        // Send to tracking endpoint
        if (window.parent && window.parent.postMessage) {
            window.parent.postMessage({ type: 'SILEXAR_MRAID_EVENT', payload }, '*');
        }
        
        // Send via MRAID if available
        if (mraidReady && typeof mraid !== 'undefined' && mraid.storePicture) {
            // Use MRAID's custom event mechanism
        }
    }
    
    ${billingEventCode}
    
    // Click Through
    function handleClickThrough() {
        if (CONFIG.clickThroughUrl) {
            trackEvent('click_through');
            if (mraidReady && typeof mraid !== 'undefined') {
                mraid.open(CONFIG.clickThroughUrl);
            } else {
                window.open(CONFIG.clickThroughUrl, '_blank');
            }
        }
    }
    
    // Template-specific code
    ${templateCode}
    
    // Initialize on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMraid);
    } else {
        initMraid();
    }
    
    // Expose functions globally
    window.handleClickThrough = handleClickThrough;
    window.trackEvent = trackEvent;
    window.logBillingEvent = logBillingEvent;
})();`;
  }

  private generateBillingEventCode(): string {
    return `
    // Billing Event (CPVI)
    function logBillingEvent(customData) {
        if (interactionLogged) {
            logger.info('[MRAID] Billing event already logged');
            return;
        }
        
        interactionLogged = true;
        trackEvent('${this.config.billing.eventType}', {
            billing: true,
            eventIdentifier: CONFIG.eventIdentifier,
            ...customData
        });
        
        logger.info('[MRAID BILLING] Valuable interaction logged:', CONFIG.billingEvent);
    }`;
  }

  private getTemplateJS(): string {
    switch (this.config.templateType) {
      case 'loan_calculator':
        return this.getLoanCalculatorJS();
      case 'currency_converter':
        return this.getCurrencyConverterJS();
      case 'travel_checklist':
        return this.getTravelChecklistJS();
      case 'memory_game':
        return this.getMemoryGameJS();
      default:
        return '';
    }
  }

  private getLoanCalculatorJS(): string {
    return `
    // Loan Calculator Functions
    function updateLoanDisplay() {
        const amount = document.getElementById('loan-amount').value;
        const term = document.getElementById('loan-term').value;
        
        document.getElementById('amount-display').textContent = 
            new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(amount);
        document.getElementById('term-display').textContent = term + ' años';
        
        // Update range background
        const amountInput = document.getElementById('loan-amount');
        const percent = (amount - amountInput.min) / (amountInput.max - amountInput.min) * 100;
        amountInput.style.background = 'linear-gradient(to right, ${this.config.appearance.primaryColor} ' + percent + '%, #e5e7eb ' + percent + '%)';
    }
    
    function calculateLoan() {
        const principal = parseFloat(document.getElementById('loan-amount').value);
        const term = parseFloat(document.getElementById('loan-term').value) * 12; // months
        const rate = parseFloat(document.getElementById('interest-rate').value) / 100 / 12;
        
        // Monthly payment formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
        const payment = principal * (rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1);
        const totalPayment = payment * term;
        const totalInterest = totalPayment - principal;
        
        const formatter = new Intl.NumberFormat('es-CL', { 
            style: 'currency', 
            currency: 'CLP',
            maximumFractionDigits: 0 
        });
        
        document.getElementById('monthly-payment').textContent = formatter.format(payment);
        document.getElementById('total-payment').textContent = formatter.format(totalPayment);
        document.getElementById('total-interest').textContent = formatter.format(totalInterest);
        
        const resultContainer = document.getElementById('result-container');
        resultContainer.classList.remove('result-hidden');
        resultContainer.classList.add('result-visible');
        
        // Log billing event
        logBillingEvent({ calculatedAmount: principal, term: term/12, rate: rate*12*100 });
        
        trackEvent('calculation_completed', { amount: principal, term: term/12 });
    }
    
    window.updateLoanDisplay = updateLoanDisplay;
    window.calculateLoan = calculateLoan;
    
    // Initialize display
    setTimeout(updateLoanDisplay, 100);`;
  }

  private getCurrencyConverterJS(): string {
    return `
    // Currency Converter Functions
    const exchangeRates = {
        CLP: { USD: 0.00108, EUR: 0.001, CLP: 1 },
        USD: { CLP: 925.5, EUR: 0.92, USD: 1 },
        EUR: { CLP: 1005.2, USD: 1.086, EUR: 1 }
    };
    
    function convertCurrency() {
        const fromCurrency = document.getElementById('from-currency').value;
        const toCurrency = document.getElementById('to-currency').value;
        const fromAmount = parseFloat(document.getElementById('from-amount').value) || 0;
        
        const rate = exchangeRates[fromCurrency][toCurrency];
        const result = fromAmount * rate;
        
        const formatter = fromCurrency === 'CLP' || toCurrency === 'CLP'
            ? new Intl.NumberFormat('es-CL', { maximumFractionDigits: 0 })
            : new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });
        
        document.getElementById('to-amount').value = formatter.format(result);
        document.getElementById('rate-display').textContent = 
            '1 ' + fromCurrency + ' = ' + rate.toFixed(4) + ' ' + toCurrency;
    }
    
    function swapCurrencies() {
        const fromSelect = document.getElementById('from-currency');
        const toSelect = document.getElementById('to-currency');
        const temp = fromSelect.value;
        fromSelect.value = toSelect.value;
        toSelect.value = temp;
        convertCurrency();
    }
    
    function saveConversion() {
        const fromCurrency = document.getElementById('from-currency').value;
        const toCurrency = document.getElementById('to-currency').value;
        const amount = document.getElementById('from-amount').value;
        
        logBillingEvent({ from: fromCurrency, to: toCurrency, amount: amount });
        trackEvent('conversion_saved');
        
        alert('Conversión guardada!');
    }
    
    window.convertCurrency = convertCurrency;
    window.swapCurrencies = swapCurrencies;
    window.saveConversion = saveConversion;
    
    setTimeout(convertCurrency, 100);`;
  }

  private getTravelChecklistJS(): string {
    return `
    // Travel Checklist Functions
    function showCategory(category) {
        document.querySelectorAll('.checklist-items').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.tab').forEach(el => el.classList.remove('active'));
        
        document.getElementById(category + '-list').classList.add('active');
        event.target.classList.add('active');
    }
    
    function updateProgress() {
        const checkboxes = document.querySelectorAll('.checkbox-item input[type="checkbox"]');
        const checked = document.querySelectorAll('.checkbox-item input[type="checkbox"]:checked');
        
        const percentage = Math.round((checked.length / checkboxes.length) * 100);
        
        document.getElementById('progress-fill').style.width = percentage + '%';
        document.getElementById('progress-text').textContent = percentage + '% completado';
        
        if (percentage === 100) {
            logBillingEvent({ itemsCompleted: checked.length });
            trackEvent('checklist_completed');
        }
    }
    
    window.showCategory = showCategory;
    window.updateProgress = updateProgress;`;
  }

  private getMemoryGameJS(): string {
    return `
    // Memory Game Functions
    let cards = [];
    let flippedCards = [];
    let matchedPairs = 0;
    let moves = 0;
    let timer = null;
    let seconds = 0;
    
    const emojis = ['🚗', '✈️', '🏠', '📱', '💳', '🎁', '⭐', '🔥'];
    
    function startGame() {
        const board = document.getElementById('game-board');
        board.innerHTML = '';
        
        // Create pairs
        cards = [...emojis, ...emojis].sort(() => Math.random() - 0.5);
        
        cards.forEach((emoji, index) => {
            const card = document.createElement('div');
            card.className = 'memory-card';
            card.dataset.index = index;
            card.dataset.emoji = emoji;
            card.textContent = '?';
            card.onclick = () => flipCard(card);
            board.appendChild(card);
        });
        
        flippedCards = [];
        matchedPairs = 0;
        moves = 0;
        seconds = 0;
        document.getElementById('moves-display').textContent = '0';
        document.getElementById('start-button').style.display = 'none';
        document.getElementById('game-result').classList.add('hidden');
        
        timer = setInterval(() => {
            seconds++;
            const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
            const secs = (seconds % 60).toString().padStart(2, '0');
            document.getElementById('time-display').textContent = mins + ':' + secs;
        }, 1000);
        
        trackEvent('game_started');
    }
    
    function flipCard(card) {
        if (flippedCards.length >= 2 || card.classList.contains('flipped')) return;
        
        card.classList.add('flipped');
        card.textContent = card.dataset.emoji;
        flippedCards.push(card);
        
        if (flippedCards.length === 2) {
            moves++;
            document.getElementById('moves-display').textContent = moves;
            
            if (flippedCards[0].dataset.emoji === flippedCards[1].dataset.emoji) {
                flippedCards.forEach(c => c.classList.add('matched'));
                matchedPairs++;
                flippedCards = [];
                
                if (matchedPairs === emojis.length) {
                    endGame();
                }
            } else {
                setTimeout(() => {
                    flippedCards.forEach(c => {
                        c.classList.remove('flipped');
                        c.textContent = '?';
                    });
                    flippedCards = [];
                }, 1000);
            }
        }
    }
    
    function endGame() {
        clearInterval(timer);
        
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        
        document.getElementById('final-time').textContent = mins + ':' + secs;
        document.getElementById('final-moves').textContent = moves;
        document.getElementById('game-result').classList.remove('hidden');
        document.getElementById('start-button').style.display = 'block';
        
        logBillingEvent({ time: seconds, moves: moves });
        trackEvent('game_completed', { time: seconds, moves: moves });
    }
    
    function restartGame() {
        startGame();
    }
    
    window.startGame = startGame;
    window.flipCard = flipCard;
    window.restartGame = restartGame;`;
  }

  // ==========================================================================
  // UTILIDADES
  // ==========================================================================

  private combineAssets(html: string, css: string, js: string): string {
    // Inject CSS into HTML
    let combined = html.replace('/* Styles injected below */', css);
    // Inject JS into HTML
    combined = combined.replace('// JavaScript injected below', js);
    
    return combined;
  }

  private generateManifest(): MRAIDManifest {
    const content = this.config.brand.name + this.config.templateType + Date.now();
    const checksum = this.simpleHash(content);
    
    return {
      version: '1.0.0',
      name: `${this.config.brand.name} - ${this.getTemplateName()}`,
      description: `MRAID v3 micro-app: ${this.getTemplateName()}`,
      template: this.config.templateType,
      billingEvent: this.config.billing.eventType,
      mraidVersion: '3.0',
      dimensions: { width: 320, height: 480 },
      createdAt: new Date().toISOString(),
      checksum,
    };
  }

  private getTemplateName(): string {
    const names: Record<TemplateType, string> = {
      loan_calculator: 'Calculadora de Préstamos',
      currency_converter: 'Conversor de Divisas',
      travel_checklist: 'Checklist de Viaje',
      memory_game: 'Juego de Memoria',
      savings_calculator: 'Calculadora de Ahorros',
      bmi_calculator: 'Calculadora de IMC',
      tip_calculator: 'Calculadora de Propinas',
      unit_converter: 'Conversor de Unidades',
    };
    return names[this.config.templateType] || 'Micro-Aplicación';
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  private createZipContent(result: MRAIDGenerationResult): string {
    // En producción, usar JSZip para crear un ZIP real
    // Por ahora, retornamos el HTML combinado como string
    return JSON.stringify({
      'index.html': result.combined,
      'mraid.js': '// MRAID v3 polyfill placeholder',
      'manifest.json': JSON.stringify(result.manifest, null, 2),
    });
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

export function createMRAIDBuilder(config: MRAIDConfig): MRAIDBuilder {
  return new MRAIDBuilder(config);
}

export default MRAIDBuilder;
