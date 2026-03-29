'use client';

import React, { useState, useEffect } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Filter, RefreshCw, Download } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Contract {
  id: string;
  name: string;
  billing_model: string;
  status: string;
}

interface MetricsFiltersProps {
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
  contractId: string;
  onContractChange: (contractId: string) => void;
  onRefresh?: () => void;
  onExport?: () => void;
}

export function MetricsFilters({ 
  timeRange, 
  onTimeRangeChange, 
  contractId, 
  onContractChange, 
  onRefresh,
  onExport 
}: MetricsFiltersProps) {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>();
  const [isCustomDate, setIsCustomDate] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const abortController = new AbortController();
    
    fetchContracts(abortController.signal);
    
    return () => {
      abortController.abort();
    };
  }, []);

  const fetchContracts = async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      const response = await fetch('/api/v2/billing/contracts', { signal });
      if (!response.ok) throw new Error('Failed to fetch contracts');
      const data = await response.json();
      setContracts(data.contracts || []);
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        
      } else {
        console.error('Error fetching contracts:', error);
        setContracts([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const timeRangeOptions = [
    { value: '1d', label: 'Últimas 24 horas' },
    { value: '7d', label: 'Últimos 7 días' },
    { value: '30d', label: 'Últimos 30 días' },
    { value: '90d', label: 'Últimos 90 días' },
    { value: 'custom', label: 'Personalizado' }
  ];

  const handleTimeRangeChange = (value: string) => {
    onTimeRangeChange(value);
    setIsCustomDate(value === 'custom');
    
    if (value !== 'custom') {
      setDateRange(undefined);
    }
  };

  const handleDateSelect = (range: { from: Date; to: Date } | undefined) => {
    setDateRange(range);
    if (range) {
      // You could add custom date range API calls here
      
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    if (onRefresh) {
      await onRefresh();
    }
    setLoading(false);
  };

  const handleExport = () => {
    if (onExport) {
      onExport();
    } else {
      // Default export functionality
      const data = {
        timeRange,
        contractId,
        dateRange,
        timestamp: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dashboard-metrics-${format(new Date(), 'yyyy-MM-dd')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (timeRange !== '7d') count++;
    if (contractId !== 'all') count++;
    if (isCustomDate && dateRange) count++;
    return count;
  };

  const activeFilters = getActiveFiltersCount();

  return (
    <div className="flex items-center gap-2">
      {/* Time Range Selector */}
      <Select value={timeRange} onValueChange={handleTimeRangeChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Seleccionar período" />
        </SelectTrigger>
        <SelectContent>
          {timeRangeOptions.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Custom Date Picker */}
      {isCustomDate && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "PPP", { locale: es })} -{" "}
                    {format(dateRange.to, "PPP", { locale: es })}
                  </>
                ) : (
                  format(dateRange.from, "PPP", { locale: es })
                )
              ) : (
                <span>Seleccionar rango de fechas</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              locale={es as any}
              selected={dateRange}
              onSelect={handleDateSelect as any}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      )}

      {/* Contract Selector */}
      <Select value={contractId} onValueChange={onContractChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Todos los contratos" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los contratos</SelectItem>
          {contracts.map(contract => (
            <SelectItem key={contract.id} value={contract.id}>
              <div className="flex items-center gap-2">
                <span>{contract.name}</span>
                <Badge variant="outline" className="text-xs">
                  {contract.billing_model}
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Action Buttons */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          onClick={handleRefresh}
          disabled={loading}
          title="Actualizar datos"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={handleExport}
          title="Exportar datos"
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>

      {/* Active Filters Indicator */}
      {activeFilters > 0 && (
        <Badge variant="secondary" className="ml-2">
          <Filter className="h-3 w-3 mr-1" />
          {activeFilters} filtro{activeFilters !== 1 ? 's' : ''} activo{activeFilters !== 1 ? 's' : ''}
        </Badge>
      )}
    </div>
  );
}