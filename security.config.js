/**
 * 🔒 SILEXAR PULSE - SECURITY CONFIGURATION
 * 
 * Configuración central del sistema de Hardening Continuo.
 * Todas las herramientas de seguridad leen de este archivo.
 * 
 * @version 1.0.0
 * @tier TIER_0_PENTAGON++
 */

module.exports = {
  // ═══════════════════════════════════════════════════════════════
  // CONFIGURACIÓN GENERAL
  // ═══════════════════════════════════════════════════════════════
  name: 'Silexar Pulse',
  tier: 'TIER_0_PENTAGON++',
  version: '1.0.0',
  
  // ═══════════════════════════════════════════════════════════════
  // UMBRALES DE SEGURIDAD
  // ═══════════════════════════════════════════════════════════════
  thresholds: {
    // Score mínimo para pasar CI/CD
    minSecurityScore: 8.0,
    
    // Vulnerabilidades máximas permitidas
    maxCriticalVulnerabilities: 0,
    maxHighVulnerabilities: 5,
    maxMediumVulnerabilities: 20,
    
    // Cobertura mínima de tests
    minTestCoverage: 80,
    
    // Calidad de código
    maxCodeSmells: 300,
    maxComplexity: 15
  },
  
  // ═══════════════════════════════════════════════════════════════
  // CONFIGURACIÓN DE SCANS
  // ═══════════════════════════════════════════════════════════════
  scans: {
    // Frecuencia de escaneos automáticos
    schedule: {
      fullScan: '0 2 * * *',      // Diario a las 2 AM
      dependencyScan: '0 */6 * * *', // Cada 6 horas
      secretScan: '0 * * * *',     // Cada hora
    },
    
    // Directorios a escanear
    include: [
      'src/**/*.{ts,tsx,js,jsx}',
      'tests/**/*.{ts,tsx}',
      'scripts/**/*.{ts,js}'
    ],
    
    // Directorios a ignorar
    exclude: [
      'node_modules/**',
      '.next/**',
      'dist/**',
      'coverage/**',
      '**/*.test.ts',
      '**/*.spec.ts',
      '**/__mocks__/**'
    ]
  },
  
  // ═══════════════════════════════════════════════════════════════
  // DETECCIÓN DE SECRETS
  // ═══════════════════════════════════════════════════════════════
  secrets: {
    // Patterns de detección
    patterns: [
      {
        name: 'AWS Access Key',
        pattern: 'AKIA[0-9A-Z]{16}',
        severity: 'critical'
      },
      {
        name: 'Generic Secret',
        pattern: '(password|secret|token|key)\s*=\s*[\'"][^\'"]+[\'"]',
        severity: 'high'
      },
      {
        name: 'Private Key',
        pattern: '-----BEGIN (RSA |DSA |EC |OPENSSH )?PRIVATE KEY-----',
        severity: 'critical'
      },
      {
        name: 'JWT Token',
        pattern: 'eyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*',
        severity: 'medium'
      },
      {
        name: 'GitHub Token',
        pattern: 'ghp_[a-zA-Z0-9]{36}',
        severity: 'critical'
      },
      {
        name: 'Slack Token',
        pattern: 'xox[baprs]-[a-zA-Z0-9-]+',
        severity: 'high'
      },
      {
        name: 'Stripe Key',
        pattern: 'sk_live_[a-zA-Z0-9]{24,}',
        severity: 'critical'
      }
    ],
    
    // Archivos permitidos (no se escanean)
    allowedFiles: [
      '.env.example',
      '.env.local.example',
      '**/*.test.ts',
      '**/*.spec.ts'
    ]
  },
  
  // ═══════════════════════════════════════════════════════════════
  // AUTO-REMEDIACIÓN
  // ═══════════════════════════════════════════════════════════════
  autoRemediation: {
    // Habilitar auto-fix
    enabled: true,
    
    // Fixes automáticos permitidos
    fixes: {
      consoleStatements: true,
      anyTypes: true,
      emptyCatch: true,
      unusedImports: true,
      formatting: true
    },
    
    // Límites de auto-fix
    limits: {
      maxFilesPerRun: 50,
      maxChangesPerFile: 20,
      createPullRequest: true
    },
    
    // No aplicar auto-fix a estos archivos
    exclude: [
      'src/lib/security/**',
      'src/config/**',
      '**/*.d.ts'
    ]
  },
  
  // ═══════════════════════════════════════════════════════════════
  // NOTIFICACIONES
  // ═══════════════════════════════════════════════════════════════
  notifications: {
    // Slack
    slack: {
      enabled: true,
      webhookUrl: process.env.SLACK_SECURITY_WEBHOOK,
      channel: '#security-alerts',
      notifyOn: ['critical', 'high']
    },
    
    // Email
    email: {
      enabled: false,
      smtp: {
        host: process.env.SMTP_HOST,
        port: 587,
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      recipients: ['security@silexar.com']
    },
    
    // GitHub Issues
    githubIssues: {
      enabled: true,
      labels: ['security', 'automated'],
      assignees: ['security-team']
    }
  },
  
  // ═══════════════════════════════════════════════════════════════
  // INTEGRACIONES
  // ═══════════════════════════════════════════════════════════════
  integrations: {
    // Snyk
    snyk: {
      enabled: true,
      token: process.env.SNYK_TOKEN,
      severityThreshold: 'high'
    },
    
    // SonarQube
    sonarQube: {
      enabled: false,
      url: process.env.SONAR_URL,
      token: process.env.SONAR_TOKEN,
      projectKey: 'silexar-pulse'
    },
    
    // OWASP ZAP
    owaspZap: {
      enabled: true,
      apiUrl: process.env.ZAP_API_URL,
      apiKey: process.env.ZAP_API_KEY
    }
  },
  
  // ═══════════════════════════════════════════════════════════════
  // APRENDIZAJE AUTOMÁTICO
  // ═══════════════════════════════════════════════════════════════
  learning: {
    // Habilitar base de datos de aprendizaje
    enabled: true,
    
    // Archivo de base de datos
    databasePath: '.security-learning-db.json',
    
    // Métricas a trackear
    trackMetrics: [
      'errorsFixed',
      'errorsPrevented',
      'falsePositives',
      'averageFixTime'
    ],
    
    // Umbral para alertar sobre errores recurrentes
    recurringErrorThreshold: 3
  },
  
  // ═══════════════════════════════════════════════════════════════
  // REPORTES
  // ═══════════════════════════════════════════════════════════════
  reporting: {
    // Formato de reportes
    format: 'json', // 'json', 'html', 'sarif'
    
    // Directorio de reportes
    outputDir: 'security-reports',
    
    // Retención de reportes (días)
    retentionDays: 90,
    
    // Dashboard
    dashboard: {
      enabled: true,
      port: 3001,
      refreshInterval: 60000 // 1 minuto
    }
  },
  
  // ═══════════════════════════════════════════════════════════════
  // COMPLIANCE
  // ═══════════════════════════════════════════════════════════════
  compliance: {
    // Estándares a cumplir
    standards: [
      'OWASP_TOP_10',
      'OWASP_ASVS_L3',
      'CWE_TOP_25',
      'NIST_CSF'
    ],
    
    // Requisitos específicos
    requirements: {
      requireMFA: true,
      minPasswordLength: 12,
      sessionTimeout: 900, // 15 minutos
      requireEncryption: true,
      auditLogRetention: 2555 // 7 años en días
    }
  }
};
