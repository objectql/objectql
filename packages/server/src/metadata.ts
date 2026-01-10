import { IObjectQL } from '@objectql/types';
import { IncomingMessage, ServerResponse } from 'http';

function readBody(req: IncomingMessage): Promise<any> {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            if (!body) return resolve({});
            try {
                resolve(JSON.parse(body));
            } catch (e) {
                reject(e);
            }
        });
        req.on('error', reject);
    });
}

/**
 * Creates a handler for metadata endpoints.
 * These endpoints expose information about registered objects.
 */
export function createMetadataHandler(app: IObjectQL) {
    return async (req: IncomingMessage, res: ServerResponse) => {
        // Parse the URL
        const url = req.url || '';
        const method = req.method;
        
        // CORS headers for development
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        
        if (req.method === 'OPTIONS') {
            res.statusCode = 200;
            res.end();
            return;
        }

        try {
            // GET /api/metadata or /api/metadata/objects - List all objects
            if (method === 'GET' && (url === '/api/metadata' || url === '/api/metadata/objects')) {
                const configs = app.getConfigs();
                const objects = Object.values(configs).map(obj => ({
                    name: obj.name,
                    label: obj.label || obj.name,
                    icon: obj.icon,
                    description: obj.description,
                    fields: obj.fields || {}
                }));
                
                res.setHeader('Content-Type', 'application/json');
                res.statusCode = 200;
                res.end(JSON.stringify({ objects }));
                return;
            }

            // GET /api/metadata/objects/:name - Get object details
            const match = url.match(/^\/api\/metadata\/objects\/([^\/]+)$/);
            if (method === 'GET' && match) {
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

            // POST/PUT /api/metadata/:type/:id - Update metadata
            const updateMatch = url.match(/^\/api\/metadata\/([^\/]+)\/([^\/]+)$/);
            if ((method === 'POST' || method === 'PUT') && updateMatch) {
                const [, type, id] = updateMatch;
                const body = await readBody(req);
                
                try {
                    await app.updateMetadata(type, id, body);
                    res.setHeader('Content-Type', 'application/json');
                    res.statusCode = 200;
                    res.end(JSON.stringify({ success: true }));
                } catch (e: any) {
                    const isUserError = e.message.startsWith('Cannot update') || e.message.includes('not found');
                    res.statusCode = isUserError ? 400 : 500;
                    res.end(JSON.stringify({ error: e.message }));
                }
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
