import { ObjectQL } from '@objectql/core';
import { KnexDriver } from '@objectql/driver-knex';
import { createNodeHandler } from '@objectql/server';
import { createServer } from 'http';
import * as path from 'path';
import chalk from 'chalk';

export async function serve(options: { port: number; dir: string }) {
    console.log(chalk.blue('Starting ObjectQL Dev Server...'));
    
    const rootDir = path.resolve(process.cwd(), options.dir);
    console.log(chalk.gray(`Loading schema from: ${rootDir}`));

    // 1. Init ObjectQL with in-memory SQLite for Dev
    const app = new ObjectQL({
        datasources: {
            default: new KnexDriver({
                client: 'sqlite3',
                connection: {
                    filename: ':memory:' // Or local file './dev.db'
                },
                useNullAsDefault: true
            })
        }
    });

    // 2. Load Schema
    try {
        app.loadFromDirectory(rootDir);
        await app.init();
        console.log(chalk.green('✅ Schema loaded successfully.'));
    } catch (e: any) {
        console.error(chalk.red('❌ Failed to load schema:'), e.message);
        process.exit(1);
    }

    // 3. Create Handler
    const handler = createNodeHandler(app);

    // 4. Start Server
    const server = createServer(handler);
    
    server.listen(options.port, () => {
        console.log(chalk.green(`\n🚀 Server ready at http://localhost:${options.port}`));
        console.log(chalk.gray('\nTry a curl command:'));
        console.log(`curl -X POST http://localhost:${options.port} -H "Content-Type: application/json" -d '{"op": "find", "object": "YourObject", "args": {}}'`);
    });
}
