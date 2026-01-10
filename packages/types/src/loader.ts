import * as fs from 'fs';
import * as glob from 'fast-glob';
import * as path from 'path';
import { MetadataRegistry } from './registry';
import { ObjectConfig } from './object';
import * as yaml from 'js-yaml';

export interface LoaderHandlerContext {
    file: string;
    content: string;
    registry: MetadataRegistry;
    packageName?: string;
}

export type LoaderHandler = (ctx: LoaderHandlerContext) => void;

export interface LoaderPlugin {
    name: string;
    glob: string[];
    handler: LoaderHandler;
    options?: any;
}

export class MetadataLoader {
    private plugins: LoaderPlugin[] = [];

    constructor(protected registry: MetadataRegistry) {
        this.registerBuiltinPlugins();
    }

    private registerBuiltinPlugins() {
        // Objects
        this.use({
            name: 'object',
            glob: ['**/*.object.yml', '**/*.object.yaml'],
            handler: (ctx) => {
                try {
                    const doc = yaml.load(ctx.content) as any;
                    if (!doc) return;

                    if (doc.name && doc.fields) {
                        registerObject(ctx.registry, doc, ctx.file, ctx.packageName || ctx.registry.getEntry('package-map', ctx.file)?.package);
                    } else {
                        for (const [key, value] of Object.entries(doc)) {
                            if (typeof value === 'object' && (value as any).fields) {
                                const obj = value as any;
                                if (!obj.name) obj.name = key;
                                registerObject(ctx.registry, obj, ctx.file, ctx.packageName);
                            }
                        }
                    }
                } catch (e) {
                    console.error(`Error loading object from ${ctx.file}:`, e);
                }
            }
        });
    }

    use(plugin: LoaderPlugin) {
        this.plugins.push(plugin);
    }

    load(dir: string, packageName?: string) {
        for (const plugin of this.plugins) {
            this.runPlugin(plugin, dir, packageName);
        }
    }

    loadPackage(packageName: string) {
        try {
            const entryPath = require.resolve(packageName, { paths: [process.cwd()] });
            // clean cache
            delete require.cache[entryPath];
            const packageDir = path.dirname(entryPath);
            this.load(packageDir, packageName);
        } catch (e) {
            // fallback to directory
            this.load(packageName, packageName);
        }
    }

    private runPlugin(plugin: LoaderPlugin, dir: string, packageName?: string) {
        const files = glob.sync(plugin.glob, {
            cwd: dir,
            absolute: true
        });

        for (const file of files) {
            try {
                const ctx: LoaderHandlerContext = {
                    file,
                    content: '',
                    registry: this.registry,
                    packageName
                };
                
                // Pre-read for convenience
                if (!file.match(/\.(js|ts|node)$/)) {
                    ctx.content = fs.readFileSync(file, 'utf8');
                }

                plugin.handler(ctx);

            } catch (e) {
                console.error(`Error in loader plugin '${plugin.name}' processing ${file}:`, e);
            }
        }
    }
}

function registerObject(registry: MetadataRegistry, obj: any, file: string, packageName?: string) {
    // Normalize fields
    if (obj.fields) {
        for (const [key, field] of Object.entries(obj.fields)) {
            if (typeof field === 'object' && field !== null) {
                if (!(field as any).name) {
                    (field as any).name = key;
                }
            }
        }
    }
    registry.register('object', {
        type: 'object',
        id: obj.name,
        path: file,
        package: packageName,
        content: obj
    });
}

export function loadObjectConfigs(dir: string): Record<string, ObjectConfig> {
    const registry = new MetadataRegistry();
    const loader = new MetadataLoader(registry);
    loader.load(dir);
    const result: Record<string, ObjectConfig> = {};
    for (const obj of registry.list<ObjectConfig>('object')) {
        result[obj.name] = obj;
    }
    return result;
}