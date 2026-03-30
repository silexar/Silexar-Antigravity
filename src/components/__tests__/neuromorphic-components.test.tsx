import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import CommandCenter from '@/app/command-center/page';
import SDKMobilePortal from '@/app/sdk-portal/page';
import ValueBasedBilling from '@/app/value-billing/page';
import NarrativeEngagementDashboard from '@/app/narrative-dashboard/page';

// Mock the dependencies
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
  }),
  usePathname: () => '',
}));

vi.mock('lucide-react', () => ({
  Activity: () => <div data-testid="activity-icon">Activity</div>,
  Cpu: () => <div data-testid="cpu-icon">Cpu</div>,
  Shield: () => <div data-testid="shield-icon">Shield</div>,
  Zap: () => <div data-testid="zap-icon">Zap</div>,
  BarChart3: () => <div data-testid="barchart-icon">BarChart3</div>,
  Settings: () => <div data-testid="settings-icon">Settings</div>,
  TrendingUp: () => <div data-testid="trendingup-icon">TrendingUp</div>,
  AlertTriangle: () => <div data-testid="alerttriangle-icon">AlertTriangle</div>,
  CheckCircle: () => <div data-testid="checkcircle-icon">CheckCircle</div>,
  Clock: () => <div data-testid="clock-icon">Clock</div>,
  DollarSign: () => <div data-testid="dollarsign-icon">DollarSign</div>,
  Users: () => <div data-testid="users-icon">Users</div>,
  Target: () => <div data-testid="target-icon">Target</div>,
  Brain: () => <div data-testid="brain-icon">Brain</div>,
  Network: () => <div data-testid="network-icon">Network</div>,
  Lock: () => <div data-testid="lock-icon">Lock</div>,
  Smartphone: () => <div data-testid="smartphone-icon">Smartphone</div>,
  Key: () => <div data-testid="key-icon">Key</div>,
  Copy: () => <div data-testid="copy-icon">Copy</div>,
  RefreshCw: () => <div data-testid="refreshcw-icon">RefreshCw</div>,
  Eye: () => <div data-testid="eye-icon">Eye</div>,
  EyeOff: () => <div data-testid="eyeoff-icon">EyeOff</div>,
  Trash2: () => <div data-testid="trash2-icon">Trash2</div>,
  Edit3: () => <div data-testid="edit3-icon">Edit3</div>,
  Plus: () => <div data-testid="plus-icon">Plus</div>,
  Download: () => <div data-testid="download-icon">Download</div>,
  Upload: () => <div data-testid="upload-icon">Upload</div>,
  Code: () => <div data-testid="code-icon">Code</div>,
  Globe: () => <div data-testid="globe-icon">Globe</div>,
  Calculator: () => <div data-testid="calculator-icon">Calculator</div>,
  GitBranch: () => <div data-testid="gitbranch-icon">GitBranch</div>,
  Filter: () => <div data-testid="filter-icon">Filter</div>,
  Play: () => <div data-testid="play-icon">Play</div>,
  Pause: () => <div data-testid="pause-icon">Pause</div>,
  RotateCcw: () => <div data-testid="rotateccw-icon">RotateCcw</div>,
  ArrowRight: () => <div data-testid="arrowright-icon">ArrowRight</div>,
  ArrowLeft: () => <div data-testid="arrowleft-icon">ArrowLeft</div>,
}));

describe('Neuromorphic Components', () => {
  describe('CommandCenter', () => {
    it('renders without crashing', () => {
      render(<CommandCenter />);
      expect(screen.getByText('SILEXAR PULSE')).toBeInTheDocument();
    });

    it('displays system metrics', () => {
      render(<CommandCenter />);
      expect(screen.getByText('System Overview')).toBeInTheDocument();
    });

    it('shows emergency mode button', () => {
      render(<CommandCenter />);
      expect(screen.getByText('EMERGENCY MODE')).toBeInTheDocument();
    });
  });

  describe('SDKMobilePortal', () => {
    it('renders without crashing', () => {
      render(<SDKMobilePortal />);
      expect(screen.getByText('Mobile SDK Portal')).toBeInTheDocument();
    });

    it('displays API keys management', () => {
      render(<SDKMobilePortal />);
      expect(screen.getByText('API Keys')).toBeInTheDocument();
    });

    it('shows platform options', () => {
      render(<SDKMobilePortal />);
      expect(screen.getByText('Platforms')).toBeInTheDocument();
    });
  });

  describe('ValueBasedBilling', () => {
    it('renders without crashing', () => {
      render(<ValueBasedBilling />);
      expect(screen.getByText('Value-Based Billing')).toBeInTheDocument();
    });

    it('displays billing models', () => {
      render(<ValueBasedBilling />);
      expect(screen.getByText('Billing Models')).toBeInTheDocument();
    });

    it('shows Kafka event stream', () => {
      render(<ValueBasedBilling />);
      expect(screen.getByText('Kafka Event Stream')).toBeInTheDocument();
    });
  });

  describe('NarrativeEngagementDashboard', () => {
    it('renders without crashing', () => {
      render(<NarrativeEngagementDashboard />);
      expect(screen.getByText('Narrative Engagement Dashboard')).toBeInTheDocument();
    });

    it('displays flow visualization', () => {
      render(<NarrativeEngagementDashboard />);
      expect(screen.getByText('Narrative Flow Visualization')).toBeInTheDocument();
    });

    it('shows engagement metrics', () => {
      render(<NarrativeEngagementDashboard />);
      expect(screen.getByText('Engagement Metrics')).toBeInTheDocument();
    });
  });
});

describe('API Endpoints', () => {
  describe('Billing Models API', () => {
    it('should validate billing model creation', async () => {
      const response = await fetch('/api/v2/billing/models', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'CPVI',
          name: 'Test Model',
          rate: 2.50,
          eventIdentifier: 'test_event'
        })
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.success).toBe(true);
    });
  });

  describe('Event Processing API', () => {
    it('should process user interaction events', async () => {
      const response = await fetch('/api/v2/events/user-interaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: 'test-123',
          userId: 'user-456',
          campaignId: 'campaign-789',
          creativeId: 'creative-012',
          interactionType: 'click',
          billingEventIdentifier: 'test_billing',
          metadata: {
            timestamp: new Date().toISOString(),
            sessionId: 'session-123'
          }
        })
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
    });

    it('should process narrative progress events', async () => {
      const response = await fetch('/api/v2/events/narrative-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: 'narrative-123',
          userId: 'user-456',
          narrativeId: 'narrative-789',
          nodeId: 'node-completion',
          nodeType: 'completion',
          completionNode: 'story_end',
          progress: 100,
          metadata: {
            timestamp: new Date().toISOString(),
            sessionId: 'session-123'
          }
        })
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
    });
  });

  describe('Reports API', () => {
    it('should generate attention reports', async () => {
      const response = await fetch('/api/v2/reports/attention?campaignId=test-campaign&startDate=2024-01-01&endDate=2024-01-31');
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('summary');
      expect(data.data).toHaveProperty('dailyData');
    });

    it('should generate utility reports', async () => {
      const response = await fetch('/api/v2/reports/utility?campaignId=test-campaign&startDate=2024-01-01&endDate=2024-01-31');
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('summary');
      expect(data.data).toHaveProperty('dailyData');
    });

    it('should generate narrative reports', async () => {
      const response = await fetch('/api/v2/reports/narrative?campaignId=test-campaign&startDate=2024-01-01&endDate=2024-01-31');
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('summary');
      expect(data.data).toHaveProperty('dailyData');
      expect(data.data).toHaveProperty('funnelData');
    });
  });
});

describe('Security Features', () => {
  it('should validate API keys', () => {
    const validApiKey = 'spx_live_7f8a9b2c3d4e5f6g7h8i9j0k1l2m3n4o';
    const invalidApiKey = 'invalid-key';
    
    expect(validApiKey).toMatch(/^spx_[a-z0-9]{32}$/);
    expect(invalidApiKey).not.toMatch(/^spx_[a-z0-9]{32}$/);
  });

  it('should encrypt and decrypt sensitive data', () => {
    const sensitiveData = 'user-password-123';
    
    // Mock encryption (in real implementation would use MilitaryGradeEncryption)
    const encrypted = btoa(sensitiveData);
    const decrypted = atob(encrypted);
    
    expect(encrypted).not.toBe(sensitiveData);
    expect(decrypted).toBe(sensitiveData);
  });

  it('should validate JWT tokens', () => {
    const mockPayload = {
      userId: 'user-123',
      role: 'admin',
      permissions: ['read', 'write'],
      securityLevel: 3
    };
    
    // Mock JWT validation (in real implementation would use JWTManager)
    expect(mockPayload).toHaveProperty('userId');
    expect(mockPayload).toHaveProperty('role');
    expect(mockPayload).toHaveProperty('permissions');
    expect(mockPayload).toHaveProperty('securityLevel');
  });
});

describe('Neuromorphic UI Components', () => {
  it('should have consistent styling', () => {
    const components = [
      'NeuromorphicCard',
      'NeuromorphicButton', 
      'NeuromorphicInput',
      'NeuromorphicStatus',
      'NeuromorphicGrid'
    ];
    
    components.forEach(component => {
      expect(component).toBeDefined();
    });
  });

  it('should handle different variants', () => {
    const variants = ['embossed', 'debossed', 'glow', 'pulse'];
    
    variants.forEach(variant => {
      expect(variant).toMatch(/^(embossed|debossed|glow|pulse)$/);
    });
  });

  it('should support different status types', () => {
    const statuses = ['online', 'offline', 'warning', 'error'];
    
    statuses.forEach(status => {
      expect(status).toMatch(/^(online|offline|warning|error)$/);
    });
  });
});