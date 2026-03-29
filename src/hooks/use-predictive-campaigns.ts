import { useState, useCallback } from 'react';
export interface PredictiveCampaign { id: string; name: string; predictedROI: number; confidence: number; }
export const usePredictiveCampaigns = () => {
    const [campaigns, setCampaigns] = useState<PredictiveCampaign[]>([]);
    const [loading, setLoading] = useState(false);
    const refresh = useCallback(async () => { setLoading(true); setCampaigns([]); setLoading(false); }, []);
    return { campaigns, loading, refresh };
};
export default usePredictiveCampaigns;