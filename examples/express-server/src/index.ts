import express from 'express';
import { ObjectQL } from '@objectql/core';
import { KnexDriver } from '@objectql/driver-knex';
import { createNodeHandler } from '@objectql/server';
import * as path from 'path';

async function main() {
    // 1. Init ObjectQL
    const app = new ObjectQL({
        datasources: {
            default: new KnexDriver({
                client: 'sqlite3',
                connection: {
                    filename: ':memory:'
                },
                useNullAsDefault: true
            })
        }
    });

    // 2. Register Schema
    app.loadFromDirectory(path.join(__dirname));
    await app.init();

    // 3. Create Handler
    const objectQLHandler = createNodeHandler(app);

    // 4. Setup Express
    const server = express();
    const port = 3004;

    // Optional: Parse JSON body globally (or strict to other routes)
    // server.use(express.json()); 

    // Mount ObjectQL handler
    // Supports both /api/objectql (POST) or similar
    server.all('/api/objectql', objectQLHandler);

    server.listen(port, () => {
        console.log(`Express app listening on port ${port}`);
        console.log(`Test CURL:`);
        console.log(`curl -X POST http://localhost:${port}/api/objectql -H "Content-Type: application/json" -d '{"op": "create", "object": "User", "args": { "data": { "name": "ExpressUser", "email": "express@example.com" }}}'`);
    });
}

main().catch(console.error);
