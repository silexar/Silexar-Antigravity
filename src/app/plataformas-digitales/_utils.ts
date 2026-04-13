export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('es-CL').format(num);
}

export function formatPercentage(num: number): string {
  return `${num.toFixed(1)}%`;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'ACTIVE':
    case 'healthy': return 'bg-green-500';
    case 'PAUSED':
    case 'warning': return 'bg-yellow-500';
    case 'COMPLETED': return 'bg-blue-500';
    case 'DRAFT': return 'bg-gray-500';
    case 'error': return 'bg-red-500';
    case 'disconnected': return 'bg-gray-400';
    default: return 'bg-gray-500';
  }
}

export function getPlatformIcon(platform: string): string {
  const icons: Record<string, string> = {
    GOOGLE_ADS: '🔍',
    META_BUSINESS: '📘',
    TIKTOK_ADS: '🎵',
    LINKEDIN_ADS: '💼',
    DV360: '📺',
    AMAZON_DSP: '📦',
    TWITTER_ADS: '🐦',
  };
  return icons[platform] ?? '🌐';
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'HIGH': return 'bg-red-100 text-red-800 border-red-200';
    case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}
