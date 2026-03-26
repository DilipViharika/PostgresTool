export const TIERS: Record<string, any> = {
    community: {
        name: 'Community',
        features: ['overview', 'performance'],
        maxConnections: 2,
        maxUsers: 5,
        retentionDays: 7,
    },
    pro: {
        name: 'Professional',
        features: ['overview', 'performance', 'query_optimizer'],
        maxConnections: 10,
        maxUsers: 25,
        retentionDays: 30,
    },
    enterprise: {
        name: 'Enterprise',
        features: ['overview', 'performance', 'query_optimizer', 'multi_tenancy'],
        maxConnections: -1,
        maxUsers: -1,
        retentionDays: 365,
    }
};

export function getFeaturesForTier(tier: string): string[] {
    return TIERS[tier]?.features || [];
}

export function getTierConfig(tier: string): any {
    return TIERS[tier] || null;
}

export function isFeatureAvailable(tier: string, feature: string): boolean {
    const features = getFeaturesForTier(tier);
    return features.includes(feature);
}

export function getTierName(tier: string): string {
    return TIERS[tier]?.name || 'Unknown';
}
