import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/observability';
import { z } from 'zod';
import { apiUnauthorized, getUserContext, apiForbidden} from '@/lib/api/response';
import { checkPermission } from '@/lib/security/rbac';
import { auditLogger } from '@/lib/security/audit-logger';
import { withTenantContext } from '@/lib/db/tenant-context';

// Validation schemas
const reportParamsSchema = z.object({
  campaignId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  granularity: z.enum(['hour', 'day', 'week', 'month']).default('day'),
  format: z.enum(['json', 'csv']).default('json')
});

// Mock data generators
const generateAttentionData = (campaignId: string, startDate: Date, endDate: Date) => {
  const data = [];
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    data.push({
      date: date.toISOString().split('T')[0],
      totalAttentionTime: Math.floor(Math.random() * 300 + 120), // seconds
      averageAttentionTime: Math.floor(Math.random() * 60 + 30), // seconds per user
      activeUsers: Math.floor(Math.random() * 5000 + 1000),
      engagementRate: Math.random() * 40 + 30, // percentage
      attentionQuality: Math.random() * 30 + 70, // quality score
      dropoffPoints: [
        { node: 'intro_video', rate: Math.random() * 20 + 10 },
        { node: 'loan_calc', rate: Math.random() * 15 + 5 },
        { node: 'decision_point', rate: Math.random() * 10 + 5 }
      ]
    });
  }
  
  return {
    summary: {
      totalAttentionTime: data.reduce((sum, d) => sum + d.totalAttentionTime, 0),
      averageAttentionTime: data.reduce((sum, d) => sum + d.averageAttentionTime, 0) / data.length,
      totalActiveUsers: data.reduce((sum, d) => sum + d.activeUsers, 0),
      averageEngagementRate: data.reduce((sum, d) => sum + d.engagementRate, 0) / data.length,
      averageAttentionQuality: data.reduce((sum, d) => sum + d.attentionQuality, 0) / data.length
    },
    dailyData: data
  };
};

const generateUtilityData = (campaignId: string, startDate: Date, endDate: Date) => {
  const data = [];
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    const interactions = Math.floor(Math.random() * 1000 + 500);
    const completions = Math.floor(interactions * (0.6 + Math.random() * 0.3));
    const utilityValue = Math.random() * 50 + 25; // utility score
    
    data.push({
      date: date.toISOString().split('T')[0],
      totalInteractions: interactions,
      successfulInteractions: completions,
      interactionRate: (completions / interactions * 100),
      averageUtilityScore: utilityValue,
      topUtilityActions: [
        { action: 'loan_calculated', count: Math.floor(Math.random() * 300 + 200), value: Math.random() * 10 + 5 },
        { action: 'rate_comparison', count: Math.floor(Math.random() * 200 + 100), value: Math.random() * 8 + 4 },
        { action: 'document_upload', count: Math.floor(Math.random() * 150 + 50), value: Math.random() * 12 + 6 }
      ],
      utilityRevenue: Math.floor(Math.random() * 5000 + 2000), // revenue from utility actions
      costPerUtility: Math.floor(Math.random() * 10 + 5) // CPVI rate
    });
  }
  
  return {
    summary: {
      totalInteractions: data.reduce((sum, d) => sum + d.totalInteractions, 0),
      totalSuccessfulInteractions: data.reduce((sum, d) => sum + d.successfulInteractions, 0),
      averageInteractionRate: data.reduce((sum, d) => sum + d.interactionRate, 0) / data.length,
      averageUtilityScore: data.reduce((sum, d) => sum + d.averageUtilityScore, 0) / data.length,
      totalUtilityRevenue: data.reduce((sum, d) => sum + d.utilityRevenue, 0),
      averageCostPerUtility: data.reduce((sum, d) => sum + d.costPerUtility, 0) / data.length
    },
    dailyData: data
  };
};

const generateNarrativeData = (campaignId: string, startDate: Date, endDate: Date) => {
  const data = [];
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Define narrative nodes
  const nodes = [
    'welcome_message', 'intro_video', 'loan_calculator', 'rate_decision', 
    'high_rate_path', 'low_rate_path', 'final_form', 'completion'
  ];
  
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    const totalUsers = Math.floor(Math.random() * 2000 + 1000);
    const completedUsers = Math.floor(totalUsers * (0.15 + Math.random() * 0.15)); // 15-30% completion
    
    data.push({
      date: date.toISOString().split('T')[0],
      totalUsers,
      completedUsers,
      completionRate: (completedUsers / totalUsers * 100),
      averageNarrativeTime: Math.floor(Math.random() * 180 + 120), // seconds
      narrativeEngagementScore: Math.random() * 30 + 70, // NES score
      dropoffAnalysis: nodes.map(node => ({
        node,
        dropoffRate: Math.random() * 40 + 5,
        avgTimeSpent: Math.floor(Math.random() * 60 + 10)
      })),
      pathAnalysis: [
        { path: 'direct_completion', users: Math.floor(completedUsers * 0.3), conversionRate: 85 + Math.random() * 10 },
        { path: 'high_rate_path', users: Math.floor(completedUsers * 0.4), conversionRate: 60 + Math.random() * 20 },
        { path: 'low_rate_path', users: Math.floor(completedUsers * 0.3), conversionRate: 80 + Math.random() * 15 }
      ],
      contentPerformance: [
        { type: 'video', interactions: Math.floor(Math.random() * 800 + 400), engagement: Math.random() * 30 + 60 },
        { type: 'calculator', interactions: Math.floor(Math.random() * 600 + 300), engagement: Math.random() * 20 + 75 },
        { type: 'form', interactions: Math.floor(Math.random() * 400 + 200), engagement: Math.random() * 15 + 70 }
      ]
    });
  }
  
  return {
    summary: {
      totalUsers: data.reduce((sum, d) => sum + d.totalUsers, 0),
      totalCompletedUsers: data.reduce((sum, d) => sum + d.completedUsers, 0),
      averageCompletionRate: data.reduce((sum, d) => sum + d.completionRate, 0) / data.length,
      averageNarrativeTime: data.reduce((sum, d) => sum + d.averageNarrativeTime, 0) / data.length,
      averageEngagementScore: data.reduce((sum, d) => sum + d.narrativeEngagementScore, 0) / data.length,
      totalRevenue: data.reduce((sum, d) => sum + (d.completedUsers * 5), 0) // $5 per completion
    },
    dailyData: data,
    funnelData: {
      stages: [
        { name: 'Entry', users: data.reduce((sum, d) => sum + d.totalUsers, 0), dropoff: 0 },
        { name: 'Engagement', users: data.reduce((sum, d) => sum + d.totalUsers * 0.8, 0), dropoff: 20 },
        { name: 'Interaction', users: data.reduce((sum, d) => sum + d.totalUsers * 0.6, 0), dropoff: 25 },
        { name: 'Decision', users: data.reduce((sum, d) => sum + d.totalUsers * 0.4, 0), dropoff: 33 },
        { name: 'Completion', users: data.reduce((sum, d) => sum + d.completedUsers, 0), dropoff: 15 }
      ]
    }
  };
};

// GET /api/v2/reports/attention
export async function GET(request: NextRequest) {
  const ctx = getUserContext(request);
  if (!ctx.userId) return apiUnauthorized();

  const perm = checkPermission(ctx, 'campanas', 'read');
  if (!perm) return apiForbidden();

  try {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('campaignId') || 'default-campaign';
    const startDate = searchParams.get('startDate') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = searchParams.get('endDate') || new Date().toISOString();
    const granularity = searchParams.get('granularity') || 'day';
    const format = searchParams.get('format') || 'json';

    // Validate parameters
    const validation = reportParamsSchema.safeParse({
      campaignId,
      startDate,
      endDate,
      granularity,
      format
    });

    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid parameters',
          details: validation.error.issues 
        },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Generate report based on endpoint
    const endpoint = request.nextUrl.pathname.split('/').pop();
    let reportData;

    switch (endpoint) {
      case 'attention':
        reportData = generateAttentionData(campaignId, start, end);
        break;
      case 'utility':
        reportData = generateUtilityData(campaignId, start, end);
        break;
      case 'narrative':
        reportData = generateNarrativeData(campaignId, start, end);
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid endpoint' },
          { status: 404 }
        );
    }

    // Handle CSV format
    if (format === 'csv') {
      const csvHeaders = Object.keys(reportData.dailyData[0]).join(',');
      const csvRows = reportData.dailyData.map(row => 
        Object.values(row).map(val => 
          typeof val === 'object' ? JSON.stringify(val) : val
        ).join(',')
      );
      const csvContent = [csvHeaders, ...csvRows].join('\n');
      
      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${endpoint}-report-${campaignId}-${start.toISOString().split('T')[0]}-${end.toISOString().split('T')[0]}.csv"`
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: reportData,
      meta: {
        campaignId,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        granularity,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate report',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}