export interface RecentItem {
  id: string;
  campana: string;
  fecha: string;
  hora: string;
  encontrados: number;
  total: number;
  estado: 'completado' | 'fallido';
}

export function addToRecentVerifications(item: Omit<RecentItem, 'id'>) {
  const stored = localStorage.getItem('silexar_recent_verifications');
  const items: RecentItem[] = stored ? JSON.parse(stored) : [];
  const newItem = { ...item, id: Date.now().toString() };
  const updated = [newItem, ...items].slice(0, 10); // Keep max 10
  localStorage.setItem('silexar_recent_verifications', JSON.stringify(updated));
}
