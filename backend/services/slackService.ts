export function verifySlackSignature(req: any): boolean {
    return false;
}

export async function sendAlert(channel: string, alert: any): Promise<boolean> {
    return true;
}
