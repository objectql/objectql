import { RemoteDriver } from '@objectql/driver-remote';
import { ObjectConfig } from '@objectql/types';

export interface RemoteLoadResult {
    driverName: string;
    driver: RemoteDriver;
    objects: ObjectConfig[];
}

export async function loadRemoteFromUrl(url: string): Promise<RemoteLoadResult | null> {
    try {
        const baseUrl = url.replace(/\/$/, '');
        const metadataUrl = `${baseUrl}/api/metadata/objects`;
        
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - Fetch is available in Node 18+
        const res = await fetch(metadataUrl);
        if (!res.ok) {
            console.warn(`[ObjectQL] Remote ${url} returned ${res.status}`);
            return null;
        }

        const data = await res.json() as any;
        if (!data || !data.objects) return null;

        const driverName = `remote:${baseUrl}`;
        const driver = new RemoteDriver(baseUrl);
        const objects: ObjectConfig[] = [];

        await Promise.all(data.objects.map(async (summary: any) => {
            try {
                // @ts-ignore
                const detailRes = await fetch(`${metadataUrl}/${summary.name}`);
                if (detailRes.ok) {
                    const config = await detailRes.json() as ObjectConfig;
                    config.datasource = driverName;
                    objects.push(config);
                }
            } catch (e) {
                console.warn(`[ObjectQL] Failed to load object ${summary.name} from ${url}`);
            }
        }));

        return { driverName, driver, objects };

    } catch (e: any) {
         console.warn(`[ObjectQL] Remote connection error ${url}: ${e.message}`);
         return null;
    }
}
