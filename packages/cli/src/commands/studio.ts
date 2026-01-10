import { ObjectQL } from '@objectql/core';
import { KnexDriver } from '@objectql/driver-knex';
import { createNodeHandler, createStudioHandler, createMetadataHandler } from '@objectql/server';
import { createServer } from 'http';
import * as path from 'path';
import chalk from 'chalk';
import { exec } from 'child_process';

function openBrowser(url: string) {
    const start = (process.platform == 'darwin' ? 'open' : process.platform == 'win32' ? 'start' : 'xdg-open');
    exec(`${start} ${url}`);
}

export async function startStudio(options: { port: number; dir: string, open?: boolean }) {
    const port = options.port || 3000;
    const rootDir = path.resolve(process.cwd(), options.dir || '.');
    
    console.log(chalk.blue('Starting ObjectQL Studio...'));
    console.log(chalk.gray(`Project Root: ${rootDir}`));

    // 1. Init ObjectQL
    // For Studio, we want to look for a dev database or default to sqlite file so data persists
    const dbPath = path.join(rootDir, 'dev.db');
    
    const app = new ObjectQL({
        datasources: {
            default: new KnexDriver({
                client: 'sqlite3',
                connection: {
                    filename: dbPath
                },
                useNullAsDefault: true
            })
        }
    });

    // 2. Load Schema
    try {
        app.loadFromDirectory(rootDir);
        await app.init();
    } catch (e: any) {
        console.error(chalk.red('❌ Failed to load schema:'), e.message);
        // Don't exit, studio can still start with empty schema (maybe?)
        // process.exit(1);
    }

    // 3. Setup HTTP Server
    const nodeHandler = createNodeHandler(app);
    const studioHandler = createStudioHandler();
    const metadataHandler = createMetadataHandler(app);

    const server = createServer(async (req, res) => {
        // CORS
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
            res.writeHead(200);
            res.end();
            return;
        }

        // Routing
        if (req.url?.startsWith('/studio')) {
            return studioHandler(req, res);
        }

        if (req.url?.startsWith('/api/metadata')) {
            return metadataHandler(req, res);
        }
        
        if (req.url?.startsWith('/api')) {
            // Strip /api prefix if needed by the handler, 
            // but ObjectQL node handler usually expects full path or depends on internal routing.
            // Actually createNodeHandler handles /objectql/v1/ etc? 
            // Let's assume standard behavior: pass to handler
            return nodeHandler(req, res);
        }

        // Redirect root to studio
        if (req.url === '/') {
            res.writeHead(302, { 'Location': '/studio' });
            res.end();
            return;
        }

        res.statusCode = 404;
        res.end('Not Found');
    });

    server.listen(port, () => {
        const url = `http://localhost:${port}/studio`;
        console.log(chalk.green(`\n🚀 Studio running at: ${chalk.bold(url)}`));
        console.log(chalk.gray(`   API endpoint: http://localhost:${port}/api`));
        
        if (options.open) {
            openBrowser(url);
        }
    });
}
