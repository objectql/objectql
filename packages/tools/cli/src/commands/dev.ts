import { serve } from './serve';
import { generateTypes } from './generate';
import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Start development server with hot reload
 * This is an enhanced version of the serve command for development workflow
 */
export async function dev(options: { 
    port: number; 
    dir: string;
    config?: string;
    modules?: string;
    watch?: boolean;
}) {
    console.log(chalk.cyan('🚀 Starting ObjectQL Development Server...'));

    const sourceDir = path.resolve(process.cwd(), options.dir || '.');
    // Default output for types in dev mode
    const typeOutputDir = path.resolve(process.cwd(), 'src/generated'); 

    // 1. Initial Type Generation
    try {
        await generateTypes(sourceDir, typeOutputDir);
    } catch (e) {
        console.error(chalk.red('Initial type generation failed:'), e);
        // Continue anyway, maybe it's just a starting project
    }
    
    // 2. Setup Watcher (Before serve, in case serve blocks)
    if (options.watch !== false) {
        startWatcher(sourceDir, typeOutputDir);
    }

    console.log(chalk.blue(`\n🌐 Server context: ${sourceDir}`));
    
    // 3. Start Server
    await serve({ 
        port: options.port, 
        dir: options.dir,
        config: options.config,
        modules: options.modules
    });
}

let debounceTimer: NodeJS.Timeout | null = null;

function startWatcher(sourceDir: string, outputDir: string) {
    console.log(chalk.yellow('👀 Watching for metadata changes...'));
    
    try {
        // Recursive watch if supported (macOS/Windows support strict recursive)
        // Linux might need fallback or libraries like chokidar, but we use fs.watch for zero-dep strictness
        const watcher = fs.watch(sourceDir, { recursive: true }, (eventType, filename) => {
            if (!filename) return;
            
            // Only care about YAML
            if (filename.endsWith('.yml') || filename.endsWith('.yaml')) {
                // Debounce
                if (debounceTimer) clearTimeout(debounceTimer);
                
                debounceTimer = setTimeout(async () => {
                    console.log(chalk.gray(`\n📝 Change detected: ${filename}`));
                    try {
                        console.log(chalk.blue('⚡️ Regenerating types...'));
                        await generateTypes(sourceDir, outputDir);
                    } catch (e) {
                        console.error(chalk.red('Type generation failed:'), e);
                    }
                }, 500); // 500ms debounce
            }
        });
        
        watcher.on('error', (e) => console.error(chalk.red('Watcher error:'), e));
        
    } catch (e) {
        console.warn(chalk.yellow('Native recursive watch not supported or failed. Watching root only.'));
        // Fallback logic could go here
    }
}
