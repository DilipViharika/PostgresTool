import { Pool } from 'pg';

export async function exportAlertRules(pool: Pool): Promise<string> {
    return '# Alert Rules\n';
}

export async function exportConnectionConfigs(pool: Pool): Promise<string> {
    return '# Connections\n';
}

export async function exportRetentionPolicies(pool: Pool): Promise<string> {
    return '# Retention\n';
}

export async function exportUserRoles(pool: Pool): Promise<string> {
    return '# Users\n';
}

export async function generateTerraformBundle(pool: Pool): Promise<string> {
    return '';
}

export async function exportAsJSON(pool: Pool): Promise<any> {
    return {};
}
