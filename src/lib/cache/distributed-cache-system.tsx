'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, RefreshCw } from 'lucide-react';

interface CacheEntry {
    key: string;
    region: string;
    size: number;
    ttl: number;
}

export const DistributedCacheSystem: React.FC<{ className?: string }> = ({ className = '' }) => {
    const [entries, setEntries] = useState<CacheEntry[]>([]);
    const [loading, setLoading] = useState(false);

    const refresh = useCallback(async () => {
        setLoading(true);
        setEntries([
            { key: 'user:1234', region: 'us-east-1', size: 1024, ttl: 3600 },
            { key: 'session:abc', region: 'eu-west-1', size: 512, ttl: 1800 }
        ]);
        setLoading(false);
    }, []);

    return (
        <Card className={className}>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Distributed Cache
                </CardTitle>
                <Button size="sm" onClick={refresh} disabled={loading}>
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
            </CardHeader>
            <CardContent>
                {entries.length === 0 ? (
                    <p className="text-gray-500">Click refresh to load cache entries</p>
                ) : (
                    entries.map(entry => (
                        <div key={entry.key} className="flex justify-between p-2 border-b">
                            <span className="font-mono text-sm">{entry.key}</span>
                            <span className="text-sm text-gray-500">{entry.region} | {entry.size}B | TTL: {entry.ttl}s</span>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
};

export default DistributedCacheSystem;