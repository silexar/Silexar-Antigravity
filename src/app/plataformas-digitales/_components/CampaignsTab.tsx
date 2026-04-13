'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Search, Calendar, Globe, Edit, BarChart3, Pause, Play, MoreHorizontal } from 'lucide-react';
import type { CampaignData } from '../_types';
import { getStatusColor, getPlatformIcon, formatCurrency, formatPercentage } from '../_utils';

interface CampaignsTabProps {
  filteredCampaigns: CampaignData[];
  searchTerm: string;
  statusFilter: string;
  platformFilter: string;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onPlatformFilterChange: (value: string) => void;
}

export function CampaignsTab({
  filteredCampaigns, searchTerm, statusFilter, platformFilter,
  onSearchChange, onStatusFilterChange, onPlatformFilterChange,
}: CampaignsTabProps) {
  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Buscar campañas..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-10"
                  aria-label="Buscar campañas"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={onStatusFilterChange}>
              <SelectTrigger className="w-48" aria-label="Filtrar por estado">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="ACTIVE">Activas</SelectItem>
                <SelectItem value="PAUSED">Pausadas</SelectItem>
                <SelectItem value="COMPLETED">Completadas</SelectItem>
                <SelectItem value="DRAFT">Borradores</SelectItem>
              </SelectContent>
            </Select>

            <Select value={platformFilter} onValueChange={onPlatformFilterChange}>
              <SelectTrigger className="w-48" aria-label="Filtrar por plataforma">
                <SelectValue placeholder="Filtrar por plataforma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las plataformas</SelectItem>
                <SelectItem value="GOOGLE_ADS">Google Ads</SelectItem>
                <SelectItem value="META_BUSINESS">Meta Business</SelectItem>
                <SelectItem value="TIKTOK_ADS">TikTok Ads</SelectItem>
                <SelectItem value="LINKEDIN_ADS">LinkedIn Ads</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de campañas */}
      <div className="space-y-4">
        {filteredCampaigns.map((campaign) => (
          <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-slate-900">{campaign.name}</h3>
                    <Badge className={`${getStatusColor(campaign.status)} text-white`}>
                      {campaign.status}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {campaign.schedule.startDate} - {campaign.schedule.endDate ?? 'Indefinido'}
                    </div>
                    <div className="flex items-center gap-1">
                      <Globe className="h-4 w-4" />
                      {campaign.platforms.length} plataformas
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    {campaign.platforms.map((platform) => (
                      <span key={platform} className="text-lg" title={platform}>
                        {getPlatformIcon(platform)}
                      </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500">Presupuesto</p>
                      <p className="font-medium">{formatCurrency(campaign.budget.total)}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Gastado</p>
                      <p className="font-medium">{formatCurrency(campaign.budget.spent)}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">CTR</p>
                      <p className="font-medium">{formatPercentage(campaign.performance.ctr)}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">ROAS</p>
                      <p className="font-medium">{campaign.performance.roas.toFixed(1)}x</p>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-slate-500">Progreso del presupuesto</span>
                      <span className="font-medium">
                        {((campaign.budget.spent / campaign.budget.total) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={(campaign.budget.spent / campaign.budget.total) * 100} className="h-2" />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" aria-label="Editar campaña">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" aria-label="Ver métricas">
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" aria-label={campaign.status === 'ACTIVE' ? 'Pausar' : 'Activar'}>
                    {campaign.status === 'ACTIVE' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button variant="outline" size="sm" aria-label="Más acciones">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
