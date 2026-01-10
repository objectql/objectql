import { 
    ObjectRegistry, 
    Driver, 
    ObjectConfig, 
    ObjectQLContext, 
    ObjectQLContextOptions, 
    IObjectQL, 
    ObjectQLConfig,
    ObjectQLPlugin,
    HookName,
    HookHandler,
    HookContext,
    ActionHandler,
    ActionContext
} from '@objectql/types';
import { ObjectLoader } from './loader';
import { ObjectRepository } from './repository';
import { loadPlugin } from './plugin';
import { createDriverFromConnection } from './driver';
import { loadRemoteFromUrl } from './remote';
import { executeActionHelper, registerActionHelper, ActionEntry } from './action';
import { registerHookHelper, triggerHookHelper, HookEntry } from './hook';
import { registerObjectHelper, getConfigsHelper } from './object';

export class ObjectQL implements IObjectQL {
    public metadata: ObjectRegistry;
    private loader: ObjectLoader;
    private datasources: Record<string, Driver> = {};
    private remotes: string[] = [];
    private hooks: Record<string, HookEntry[]> = {};
    private actions: Record<string, ActionEntry> = {};
    private pluginsList: ObjectQLPlugin[] = [];

    constructor(config: ObjectQLConfig) {
        this.metadata = config.registry || new ObjectRegistry();
        this.loader = new ObjectLoader(this.metadata);
        this.datasources = config.datasources || {};
        this.remotes = config.remotes || [];
        
        if (config.connection) {
            this.datasources['default'] = createDriverFromConnection(config.connection);
        }

        // 1. Load Presets/Packages first (Base Layer)
        if (config.packages) {
            for (const name of config.packages) {
                this.addPackage(name);
            }
        }
        if (config.presets) {
            for (const name of config.presets) {
                this.addPackage(name);
            }
        }
        
        if (config.plugins) {
            for (const plugin of config.plugins) {
                if (typeof plugin === 'string') {
                    this.use(loadPlugin(plugin));
                } else {
                    this.use(plugin);
                }
            }
        }

        // 2. Load Local Sources (Application Layer - can override presets)
        if (config.source) {
            const sources = Array.isArray(config.source) ? config.source : [config.source];
            for (const src of sources) {
                this.loader.load(src);
            }
        }

        // 3. Load In-Memory Objects (Dynamic Layer - highest priority)
        if (config.objects) {
            for (const [key, obj] of Object.entries(config.objects)) {
                this.registerObject(obj);
            }
        }
    }

    addPackage(name: string) {
        this.loader.loadPackage(name);
    }

    use(plugin: ObjectQLPlugin) {
        this.pluginsList.push(plugin);
    }

    removePackage(name: string) {
        this.metadata.unregisterPackage(name);
        
        // Remove hooks
        for (const event of Object.keys(this.hooks)) {
            this.hooks[event] = this.hooks[event].filter(h => h.packageName !== name);
        }
        
        // Remove actions
        for (const key of Object.keys(this.actions)) {
            if (this.actions[key].packageName === name) {
                delete this.actions[key];
            }
        }
    }

    on(event: HookName, objectName: string, handler: HookHandler, packageName?: string) {
        registerHookHelper(this.hooks, event, objectName, handler, packageName);
    }

    async triggerHook(event: HookName, objectName: string, ctx: HookContext) {
        await triggerHookHelper(this.metadata, this.hooks, event, objectName, ctx);
    }

    registerAction(objectName: string, actionName: string, handler: ActionHandler, packageName?: string) {
        registerActionHelper(this.actions, objectName, actionName, handler, packageName);
    }

    async executeAction(objectName: string, actionName: string, ctx: ActionContext) {
        return await executeActionHelper(this.metadata, this.actions, objectName, actionName, ctx);
    }

    loadFromDirectory(dir: string, packageName?: string) {
        this.loader.load(dir, packageName);
    }

    createContext(options: ObjectQLContextOptions): ObjectQLContext {
        const ctx: ObjectQLContext = {
            userId: options.userId,
            spaceId: options.spaceId,
            roles: options.roles || [],
            isSystem: options.isSystem,
            object: (name: string) => {
                return new ObjectRepository(name, ctx, this);
            },
            transaction: async (callback) => {
                 const driver = this.datasources['default'];
                 if (!driver || !driver.beginTransaction) {
                      return callback(ctx);
                 }

                 let trx: any;
                 try {
                     trx = await driver.beginTransaction();
                 } catch (e) {
                     throw e;
                 }

                 const trxCtx: ObjectQLContext = {
                     ...ctx,
                     transactionHandle: trx,
                     transaction: async (cb) => cb(trxCtx)
                 };

                 try {
                     const result = await callback(trxCtx);
                     if (driver.commitTransaction) await driver.commitTransaction(trx);
                     return result;
                 } catch (error) {
                     if (driver.rollbackTransaction) await driver.rollbackTransaction(trx);
                     throw error;
                 }
            },
            sudo: () => {
                 return this.createContext({ ...options, isSystem: true });
            }
        };
        return ctx;
    }

    registerObject(object: ObjectConfig) {
        registerObjectHelper(this.metadata, object);
    }

    unregisterObject(name: string) {
        this.metadata.unregister('object', name);
    }

    getObject(name: string): ObjectConfig | undefined {
        return this.metadata.get<ObjectConfig>('object', name);
    }

    getConfigs(): Record<string, ObjectConfig> {
        return getConfigsHelper(this.metadata);
    }

    datasource(name: string): Driver {
        const driver = this.datasources[name];
        if (!driver) {
            throw new Error(`Datasource '${name}' not found`);
        }
        return driver;
    }

    async init() {
        // -1. Load Remotes
        if (this.remotes.length > 0) {
            console.log(`Loading ${this.remotes.length} remotes...`);
            const results = await Promise.all(this.remotes.map(url => loadRemoteFromUrl(url)));
            for (const res of results) {
                if (res) {
                    this.datasources[res.driverName] = res.driver;
                    for (const obj of res.objects) {
                        this.registerObject(obj);
                    }
                }
            }
        }

        // 0. Init Plugins
        for (const plugin of this.pluginsList) {
            console.log(`Initializing plugin '${plugin.name}'...`);
            
            let app: IObjectQL = this;
            const pkgName = (plugin as any)._packageName;

            if (pkgName) {
                app = new Proxy(this, {
                    get(target, prop) {
                        if (prop === 'on') {
                            return (event: HookName, obj: string, handler: HookHandler) => 
                                target.on(event, obj, handler, pkgName);
                        }
                        if (prop === 'registerAction') {
                            return (obj: string, act: string, handler: ActionHandler) => 
                                target.registerAction(obj, act, handler, pkgName);
                        }
                        const value = (target as any)[prop];
                        return typeof value === 'function' ? value.bind(target) : value;
                    }
                });
            }

            await plugin.setup(app);
        }

        const objects = this.metadata.list<ObjectConfig>('object');
        
        // 1. Init Drivers (e.g. Sync Schema)
        // Let's pass all objects to all configured drivers.
        for (const [name, driver] of Object.entries(this.datasources)) {
            if (driver.init) {
                console.log(`Initializing driver '${name}'...`);
                await driver.init(objects);
            }
        }
    }
}
