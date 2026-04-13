'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bot, CheckCircle } from 'lucide-react';
import type { CrossPlatformInsight } from '../_types';
import { getPlatformIcon, getPriorityColor } from '../_utils';

interface InsightsTabProps {
  insights: CrossPlatformInsight[];
}

export function InsightsTab({ insights }: InsightsTabProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {insights.map((insight) => (
          <Card key={insight.title}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bot className="h-5 w-5 text-blue-600" />
                  <span>{insight.title}</span>
                </div>
                <Badge className={getPriorityColor(insight.recommendation.priority)}>
                  {insight.recommendation.priority}
                </Badge>
              </CardTitle>
              <CardDescription>{insight.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {insight.platforms.map((platform) => (
                  <Badge key={platform} variant="outline" className="flex items-center gap-1">
                    <span>{getPlatformIcon(platform)}</span>
                    {platform}
                  </Badge>
                ))}
              </div>

              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-medium text-slate-900 mb-2">Recomendación:</h4>
                <p className="text-slate-700">{insight.recommendation.action}</p>
                <p className="text-sm text-slate-500 mt-1">
                  Impacto estimado: +{insight.recommendation.estimatedImpact}%
                </p>
              </div>

              <div className="flex gap-2">
                <Button size="sm" className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Aplicar
                </Button>
                <Button variant="outline" size="sm">
                  Ver detalles
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
