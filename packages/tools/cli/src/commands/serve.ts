import { ObjectQL } from '@objectql/core';
import { SqlDriver } from '@objectql/driver-sql';
import { ObjectLoader, loadModules } from '@objectql/platform-node';
import { createNodeHandler } from '@objectql/server';
import { createServer } from 'http';
import * as path from 'path';
import * as fs from 'fs';
import chalk from 'chalk';

const CONSOLE_HTML = `
<!DOCTYPE html>
<html>
  <head>
    <title>ObjectQL API Reference (Scalar)</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { margin: 0; }
    </style>
  </head>
  <body>
    <script
      id="api-reference"
      data-url="/openapi.json"
      data-proxy-url="https://proxy.scalar.com"
      data-configuration='{"theme": "deepSpace"}'
    ></script>
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
  </body>
</html>
`;

export async function serve(options: { 
    port: number; 
    dir: string;
    config?: string;
    modules?: string;
}) {
    console.log(chalk.blue('Starting ObjectQL Dev Server...'));
    
    const rootDir = path.resolve(process.cwd(), options.dir);
    console.log(chalk.gray(`Loading schema from: ${rootDir}`));

    // Try to load configuration
    let config: any = null;
    const configPath = options.config || path.join(process.cwd(), 'objectql.config.ts');
    
    if (fs.existsSync(configPath)) {
        try {
            console.log(chalk.gray(`Loading config from: ${configPath}`));
            if (configPath.endsWith('.ts')) {
                require('ts-node/register');
            }
            const loaded = require(configPath);
            config = loaded.default || loaded;
        } catch (e: any) {
            console.warn(chalk.yellow(`⚠️ Failed to load config: ${e.message}`));
        }
    } else if (options.config) {
        console.error(chalk.red(`❌ Config file not found: ${options.config}`));
        process.exit(1);
    }

    // Process modules override
    if (options.modules) {
        const moduleList = options.modules.split(',').map(p => p.trim());
        if (!config) config = {};
        config.modules = moduleList;
        console.log(chalk.yellow(`⚠️ Overriding modules: ${moduleList.join(', ')}`));
    }

    const loadedConfig = config?.datasource?.default || config?.datasources?.default;
    let datasourceValue = loadedConfig;
    
    // Normalize config if it uses simplified format (type: 'sqlite')
    if (loadedConfig && !loadedConfig.client && loadedConfig.type === 'sqlite') {
        datasourceValue = {
            client: 'sqlite3',
            connection: {
                filename: loadedConfig.filename || ':memory:'
            },
            useNullAsDefault: true
        };
    }

    const datasource = datasourceValue || {
        client: 'sqlite3',
        connection: {
            filename: ':memory:'
        },
        useNullAsDefault: true
    };

    // 1. Init ObjectQL
    const app = new ObjectQL({
        datasources: {
            default: new SqlDriver(datasource)
        },
        ...config
    });

    // 2. Load Schema
    try {
        const loader = new ObjectLoader(app.metadata);
        
        // Load modules first (if any)
        // Backwards compatibility for presets
        const modulesToLoad = config?.modules || config?.presets;
        if (modulesToLoad) {
            await loadModules(loader, modulesToLoad);
        }

        // Load project source
        loader.load(rootDir);
        
        await app.init();
        console.log(chalk.green('✅ Schema loaded successfully.'));
    } catch (e: any) {
        console.error(chalk.red('❌ Failed to load schema:'), e.message);
        process.exit(1);
    }

    // 3. Create Handler
    const internalHandler = createNodeHandler(app);

    // 4. Start Server
    const server = createServer(async (req, res) => {
        // Serve Swagger UI
        if (req.method === 'GET' && (req.url === '/swagger' || req.url === '/swagger/')) {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(CONSOLE_HTML);
            return;
        }

        // Redirect / to /swagger for better DX
        if (req.method === 'GET' && req.url === '/') {
            res.writeHead(302, { 'Location': '/swagger' });
            res.end();
            return;
        }

        // Delegate to API Handler
        await internalHandler(req, res);
    });
    
    // Auto-port detection logic
    const startPort = options.port;
    const tryListen = (port: number, attempt = 0) => {
        if (attempt > 10) {
            console.error(chalk.red(`❌ Unable to find a free port after 10 attempts.`));
            process.exit(1);
        }

        const onError = (e: any) => {
            if (e.code === 'EADDRINUSE') {
                console.log(chalk.yellow(`⚠️  Port ${port} is in use, trying ${port + 1}...`));
                // Wait a tick before retrying to let the socket cleanup if needed, though usually not needed for EADDRINUSE on listen
                setTimeout(() => {
                    server.close(); // Ensure previous attempt is closed
                    tryListen(port + 1, attempt + 1);
                }, 100);
            } else {
                console.error(chalk.red('❌ Server error:'), e);
            }
        };

        server.once('error', onError);

        server.listen(port, () => {
            server.removeListener('error', onError);
            console.log(chalk.green(`\n🚀 Server ready at http://localhost:${port}`));
            console.log(chalk.green(`📚 Swagger UI:   http://localhost:${port}/swagger`));
            console.log(chalk.blue(`📖 OpenAPI Spec:  http://localhost:${port}/openapi.json`));
            console.log(chalk.gray('\nTry a curl command:'));
            console.log(`curl -X POST http://localhost:${port} -H "Content-Type: application/json" -d '{"op": "find", "object": "YourObject", "args": {}}'`);
        });
    };

    tryListen(startPort);
}
