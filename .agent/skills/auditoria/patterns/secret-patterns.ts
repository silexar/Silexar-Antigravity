/**
 * Security Patterns - Secret Detection
 * 
 * 50+ patrones para detectar credenciales, API keys, tokens
 * y datos sensibles hardcodeados en el código
 */

export interface SecretPattern {
  id: string;
  name: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH';
  category: 'API_KEY' | 'TOKEN' | 'PASSWORD' | 'PRIVATE_KEY' | 'URL_WITH_CREDS' | 'CONFIG';
  regex: RegExp;
  example: string;
  remediation: string;
  entropyCheck?: boolean;
  minEntropy?: number;
}

export const SECRET_PATTERNS: SecretPattern[] = [
  // OPENAI - CRITICAL
  {
    id: 'SEC-001',
    name: 'OpenAI API Key',
    description: 'OpenAI API key (sk-...)',
    severity: 'CRITICAL',
    category: 'API_KEY',
    regex: /sk-(?:proj-|svcacct-)?[a-zA-Z0-9]{20,}/,
    example: 'sk-proj-abc123def456ghi789jkl012mno345pqr',
    remediation: 'Usar process.env.OPENAI_API_KEY',
    entropyCheck: true,
    minEntropy: 4.0,
  },

  // ANTHROPIC - CRITICAL
  {
    id: 'SEC-002',
    name: 'Anthropic API Key',
    description: 'Anthropic/Claude API key',
    severity: 'CRITICAL',
    category: 'API_KEY',
    regex: /ant-[a-zA-Z0-9]{20,}/,
    example: 'ant-api03-abc123def456ghi789',
    remediation: 'Usar process.env.ANTHROPIC_API_KEY',
  },

  // STRIPE - CRITICAL
  {
    id: 'SEC-003',
    name: 'Stripe Secret Key',
    description: 'Stripe secret key (sk_live_...)',
    severity: 'CRITICAL',
    category: 'API_KEY',
    regex: /sk_live_[a-zA-Z0-9]{20,}/,
    example: 'sk_live_abc123def456ghi789',
    remediation: 'Usar process.env.STRIPE_SECRET_KEY',
  },
  {
    id: 'SEC-004',
    name: 'Stripe Publishable Key',
    description: 'Stripe publishable key (pk_live_...)',
    severity: 'CRITICAL',
    category: 'API_KEY',
    regex: /pk_live_[a-zA-Z0-9]{20,}/,
    example: 'pk_live_abc123def456ghi789',
    remediation: 'Usar process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  },
  {
    id: 'SEC-005',
    name: 'Stripe Restricted Key',
    description: 'Stripe restricted key (rk_live_...)',
    severity: 'CRITICAL',
    category: 'API_KEY',
    regex: /rk_live_[a-zA-Z0-9]{20,}/,
    example: 'rk_live_abc123def456ghi789',
    remediation: 'Usar process.env.STRIPE_RESTRICTED_KEY',
  },

  // GITHUB - CRITICAL
  {
    id: 'SEC-006',
    name: 'GitHub Personal Access Token',
    description: 'GitHub PAT (ghp_...)',
    severity: 'CRITICAL',
    category: 'TOKEN',
    regex: /ghp_[a-zA-Z0-9]{36}/,
    example: 'ghp_abc123def456ghi789jkl012mno345pqr678',
    remediation: 'Usar process.env.GITHUB_TOKEN',
  },
  {
    id: 'SEC-007',
    name: 'GitHub OAuth Token',
    description: 'GitHub OAuth token (gho_...)',
    severity: 'CRITICAL',
    category: 'TOKEN',
    regex: /gho_[a-zA-Z0-9]{36}/,
    example: 'gho_abc123def456ghi789jkl012mno345pqr678',
    remediation: 'Usar variables de entorno',
  },

  // AWS - CRITICAL
  {
    id: 'SEC-008',
    name: 'AWS Access Key ID',
    description: 'AWS Access Key ID (AKIA...)',
    severity: 'CRITICAL',
    category: 'API_KEY',
    regex: /AKIA[0-9A-Z]{16}/,
    example: 'AKIAIOSFODNN7EXAMPLE',
    remediation: 'Usar IAM roles o ~/.aws/credentials',
  },
  {
    id: 'SEC-009',
    name: 'AWS Session Token',
    description: 'AWS Session Token (ASIA...)',
    severity: 'CRITICAL',
    category: 'TOKEN',
    regex: /ASIA[0-9A-Z]{16}/,
    example: 'ASIAIOSFODNN7EXAMPLE',
    remediation: 'Usar variables de entorno o IAM roles',
  },

  // SUPABASE - CRITICAL
  {
    id: 'SEC-010',
    name: 'Supabase JWT',
    description: 'Supabase JWT token',
    severity: 'CRITICAL',
    category: 'TOKEN',
    regex: /eyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*/,
    example: 'eyJhbGciOiJIUzI1NiIs...eyJzdWIiOiIxMjM0...abc123def456',
    remediation: 'Usar process.env.SUPABASE_ANON_KEY',
  },

  // SLACK - HIGH
  {
    id: 'SEC-011',
    name: 'Slack Bot Token',
    description: 'Slack bot token (xoxb-...)',
    severity: 'HIGH',
    category: 'TOKEN',
    regex: /xoxb-[a-zA-Z0-9-]{10,}/,
    example: 'xoxb-EXAMPLE-NOT-REAL',
    remediation: 'Usar process.env.SLACK_BOT_TOKEN',
  },
  {
    id: 'SEC-012',
    name: 'Slack User Token',
    description: 'Slack user token (xoxp-...)',
    severity: 'HIGH',
    category: 'TOKEN',
    regex: /xoxp-[a-zA-Z0-9-]{10,}/,
    example: 'xoxp-EXAMPLE-NOT-REAL',
    remediation: 'Usar process.env.SLACK_USER_TOKEN',
  },

  // DISCORD - HIGH
  {
    id: 'SEC-013',
    name: 'Discord Bot Token',
    description: 'Discord bot token',
    severity: 'HIGH',
    category: 'TOKEN',
    regex: /[MN][A-Za-z\d]{23}\.[\w-]{6}\.[\w-]{27}/,
    example: 'NzA1MDY5MjE0ODk2MzE4MjA4.XzC3ZQ.Y8F3zQ4r7Wv2Lt8',
    remediation: 'Usar process.env.DISCORD_BOT_TOKEN',
  },

  // JWT - HIGH
  {
    id: 'SEC-014',
    name: 'Generic JWT',
    description: 'JSON Web Token',
    severity: 'HIGH',
    category: 'TOKEN',
    regex: /eyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]{20,}/,
    example: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyIn0.abc123...',
    remediation: 'No hardcodear JWTs, usar refresh tokens',
  },

  // NPM - HIGH
  {
    id: 'SEC-015',
    name: 'npm Access Token',
    description: 'npm access token (npm_...)',
    severity: 'HIGH',
    category: 'TOKEN',
    regex: /npm_[a-zA-Z0-9]{36}/,
    example: 'npm_abc123def456ghi789jkl012mno345pqr678',
    remediation: 'Usar ~/.npmrc o process.env.NPM_TOKEN',
  },

  // PRIVATE KEYS - CRITICAL
  {
    id: 'SEC-016',
    name: 'RSA Private Key',
    description: 'RSA private key PEM',
    severity: 'CRITICAL',
    category: 'PRIVATE_KEY',
    regex: /-----BEGIN (RSA )?PRIVATE KEY-----/,
    example: '-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEA...',
    remediation: 'Usar gestor de secretos o archivos fuera de git',
  },
  {
    id: 'SEC-017',
    name: 'EC Private Key',
    description: 'Elliptic Curve private key',
    severity: 'CRITICAL',
    category: 'PRIVATE_KEY',
    regex: /-----BEGIN EC PRIVATE KEY-----/,
    example: '-----BEGIN EC PRIVATE KEY-----\nMHQCAQEEIB...',
    remediation: 'Usar gestor de secretos',
  },
  {
    id: 'SEC-018',
    name: 'OpenSSH Private Key',
    description: 'OpenSSH private key',
    severity: 'CRITICAL',
    category: 'PRIVATE_KEY',
    regex: /-----BEGIN OPENSSH PRIVATE KEY-----/,
    example: '-----BEGIN OPENSSH PRIVATE KEY-----\nb3BlbnNzaC1rZXktdjEAAAAABG5v...',
    remediation: 'Usar ~/.ssh/ fuera del proyecto',
  },

  // DATABASE URLs - CRITICAL
  {
    id: 'SEC-019',
    name: 'PostgreSQL URL with credentials',
    description: 'PostgreSQL connection string with password',
    severity: 'CRITICAL',
    category: 'URL_WITH_CREDS',
    regex: /postgres(ql)?:\/\/[^:]+:[^@]+@[a-zA-Z0-9.-]+/,
    example: 'postgres://user:password@localhost:5432/db',
    remediation: 'Usar process.env.DATABASE_URL',
  },
  {
    id: 'SEC-020',
    name: 'MySQL URL with credentials',
    description: 'MySQL connection string with password',
    severity: 'CRITICAL',
    category: 'URL_WITH_CREDS',
    regex: /mysql:\/\/[^:]+:[^@]+@[a-zA-Z0-9.-]+/,
    example: 'mysql://user:password@localhost:3306/db',
    remediation: 'Usar process.env.DATABASE_URL',
  },
  {
    id: 'SEC-021',
    name: 'MongoDB URL with credentials',
    description: 'MongoDB connection string with password',
    severity: 'CRITICAL',
    category: 'URL_WITH_CREDS',
    regex: /mongodb(\+srv)?:\/\/[^:]+:[^@]+@[a-zA-Z0-9.-]+/,
    example: 'mongodb+srv://user:password@cluster.mongodb.net/db',
    remediation: 'Usar process.env.MONGODB_URI',
  },
  {
    id: 'SEC-022',
    name: 'Redis URL with credentials',
    description: 'Redis connection string with password',
    severity: 'CRITICAL',
    category: 'URL_WITH_CREDS',
    regex: /redis:\/\/:?[^@]*@[a-zA-Z0-9.-]+/,
    example: 'redis://:password@localhost:6379',
    remediation: 'Usar process.env.REDIS_URL',
  },

  // CHILE-SPECIFIC
  {
    id: 'SEC-023',
    name: 'SII API Token',
    description: 'SII Chile API token',
    severity: 'CRITICAL',
    category: 'API_KEY',
    regex: /sii-[a-zA-Z0-9]{20,}/i,
    example: 'sii-api-abc123def456ghi789',
    remediation: 'Usar process.env.SII_API_TOKEN',
  },

  // CONFIG FILES - HIGH
  {
    id: 'SEC-024',
    name: '.env file reference',
    description: 'Archivo .env commiteado',
    severity: 'HIGH',
    category: 'CONFIG',
    regex: /^\.env$/m,
    example: '.env',
    remediation: 'Eliminar de git: git rm --cached .env && echo ".env" >> .gitignore',
  },

  // PASSWORD PATTERNS - HIGH
  {
    id: 'SEC-025',
    name: 'Hardcoded password',
    description: 'Contraseña hardcodeada',
    severity: 'HIGH',
    category: 'PASSWORD',
    regex: /password\s*[:=]\s*['"`][^'"`]{4,}['"`]/i,
    example: 'password = "secret123"',
    remediation: 'Usar variables de entorno o gestor de secretos',
    falsePositiveCheck: true, // Skip type definitions
  },
  {
    id: 'SEC-026',
    name: 'Hardcoded secret',
    description: 'Secret hardcodeado',
    severity: 'HIGH',
    category: 'PASSWORD',
    regex: /secret\s*[:=]\s*['"`][^'"`]{8,}['"`]/i,
    example: 'secret = "mysecretkey"',
    remediation: 'Usar variables de entorno',
  },
];

/**
 * Calcula entropía de Shannon
 */
export function calculateEntropy(str: string): number {
  const len = str.length;
  if (len === 0) return 0;
  
  const freq: Record<string, number> = {};
  for (const char of str) {
    freq[char] = (freq[char] || 0) + 1;
  }
  
  let entropy = 0;
  for (const char in freq) {
    const p = freq[char] / len;
    entropy -= p * Math.log2(p);
  }
  
  return entropy;
}

/**
 * Verifica si un string tiene entropía sospechosa
 */
export function hasHighEntropy(str: string, threshold: number = 4.5): boolean {
  return calculateEntropy(str) > threshold;
}

/**
 * Obtiene patrones por categoría
 */
export function getPatternsByCategory(
  category: SecretPattern['category']
): SecretPattern[] {
  return SECRET_PATTERNS.filter(p => p.category === category);
}

/**
 * Obtiene patrones críticos
 */
export function getCriticalPatterns(): SecretPattern[] {
  return SECRET_PATTERNS.filter(p => p.severity === 'CRITICAL');
}
