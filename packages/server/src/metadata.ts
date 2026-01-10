import { IObjectQL } from '@objectql/types';
import { IncomingMessage, ServerResponse } from 'http';

/**
 * Creates a handler for metadata endpoints.
 * These endpoints expose information about registered objects.
 */
export function createMetadataHandler(app: IObjectQL) {
    return async (req: IncomingMessage, res: ServerResponse) => {
        // Parse the URL
        const url = req.url || '';
        
        // CORS headers for development
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        
        if (req.method === 'OPTIONS') {
            res.statusCode = 200;
            res.end();
            return;
        }

        try {
            // GET /api/metadata/objects - List all objects
            if (url === '/api/metadata/objects') {
                const configs = app.getConfigs();
                const objects = Object.values(configs).map(obj => ({
                    name: obj.name,
                    label: obj.label || obj.name,
                    icon: obj.icon,
                    fields: obj.fields ? Object.keys(obj.fields) : []
                }));
                
                res.setHeader('Content-Type', 'application/json');
                res.statusCode = 200;
                res.end(JSON.stringify({ objects }));
                return;
            }

            // GET /api/metadata/objects/:name - Get object details
            const match = url.match(/^\/api\/metadata\/objects\/([^\/]+)$/);
            if (match) {
                const objectName = match[1];
                const metadata = app.getObject(objectName);
                if (!metadata) {
                    res.statusCode = 404;
                    res.end(JSON.stringify({ error: 'Object not found' }));
                    return;
                }
                
                // Convert fields object to array
                const fields = metadata.fields 
                    ? Object.entries(metadata.fields).map(([key, field]) => ({
                        name: field.name || key,
                        type: field.type,
                        label: field.label,
                        required: field.required,
                        defaultValue: field.defaultValue
                    }))
                    : [];
                
                res.setHeader('Content-Type', 'application/json');
                res.statusCode = 200;
                res.end(JSON.stringify({
                    ...metadata,
                    fields
                }));
                return;
            }

            // Not found
            res.statusCode = 404;
            res.end('Not Found');
        } catch (e: any) {
            console.error('[Metadata Handler] Error:', e);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Internal Server Error' }));
        }
    };
}
