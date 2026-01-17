import http from 'http';
import { ObjectQL } from '@objectql/core';
import { MemoryDriver } from '@objectql/driver-memory';
import { createDevHandler, createRESTHandler } from '@objectql/server';

// Initialize ObjectQL
const driver = new MemoryDriver();
const app = new ObjectQL({
    datasources: { default: driver }
});

// Register a sample object
app.registerObject({
    name: 'projects',
    label: 'Project',
    fields: {
        name: {
            type: 'text',
            required: true
        },
        status: {
            type: 'select',
            options: ['planned', 'in_progress', 'completed'],
            defaultValue: 'planned'
        },
        description: {
            type: 'textarea'
        }
    }
});

// Initialize app
await app.init();

// Create handlers
const devHandler = createDevHandler({
    enabled: true,
    baseDir: process.cwd()
});

const restHandler = createRESTHandler(app);

// Create HTTP server
const server = http.createServer(async (req, res) => {
    const url = req.url || '';
    
    if (url.startsWith('/api/dev/')) {
        await devHandler(req, res);
    } else if (url.startsWith('/api/data/')) {
        await restHandler(req, res);
    } else {
        res.statusCode = 404;
        res.end('Not Found');
    }
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`🚀 ObjectQL Dev Server running on http://localhost:${PORT}`);
    console.log(`📁 Dev API: http://localhost:${PORT}/api/dev/files`);
    console.log(`🔌 REST API: http://localhost:${PORT}/api/data/projects`);
});
