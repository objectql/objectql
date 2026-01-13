# Plugin System

Plugins are the primary way to extend ObjectQL. They allow you to bundle behavior, schema modifications, and logic (hooks/actions) into reusable units.

## 1. Anatomy of a Plugin

A plugin is simply an object that implements the `ObjectQLPlugin` interface.

```typescript
import { IObjectQL } from '@objectql/types';

export interface ObjectQLPlugin {
    /**
     * The unique name of the plugin
     */
    name: string;
    
    /**
     * Called during initialization, before drivers connect.
     * @param app The ObjectQL instance
     */
    setup(app: IObjectQL): void | Promise<void>;
}
```

## 2. Execution Lifecycle

Understanding valid execution timing is critical.

1.  **Phase 1: Construction (`new ObjectQL`)**
    *   Load Metadata from `packages`.
    *   Load Metadata from `source` directories (`*.object.yml`).
    *   Load Metadata from `config.objects`.
    *   **Result:** `app.metadata` holds all static definitions.

2.  **Phase 2: Initialization (`await app.init()`)**
    *   **Step A: Remotes:** Fetch metadata from remote services.
    *   **Step B: Plugins (`plugin.setup`)**:  <-- **YOU ARE HERE**
        *   This is the last chance to modify metadata before it touches the DB.
        *   You can access all objects loaded in Phase 1 & Step A.
    *   **Step C: Drivers:** Drivers connect and synchronize schema (create tables, etc.).

## 3. Creating Plugins

You can define plugins in two styles: **Object** or **Class**.

### Option A: Object Style (Simpler)
Useful for stateless, simple logic or one-off modifications.

```typescript
const MySimplePlugin = {
    name: 'my-simple-plugin',
    setup(app) {
        app.on('before:create', 'user', async (ctx) => {
            console.log('Creating user...');
        });
    }
};
```

### Option B: Class Style (Recommended)
Useful when your plugin needs to maintain internal state, configuration, or complex initialization logic.

```typescript
class MyComplexPlugin implements ObjectQLPlugin {
    name = 'my-complex-plugin';
    private config;

    constructor(config = {}) {
        this.config = config;
    }

    async setup(app: IObjectQL) {
        // Access config here
        if (this.config.enableLogging) {
            app.on('before:*', '*', async (ctx) => {
                console.log(`[${ctx.event}] ${ctx.objectName}`);
            });
        }
    }
}
```

## 3. Loading Plugins

Plugins are passed to the `ObjectQL` constructor via the `plugins` array. The loader is very flexible.

### Method 1: Inline Instance
Pass the plugin object or class instance directly.

```typescript
const db = new ObjectQL({
    plugins: [
        MySimplePlugin,          // Object
        new MyComplexPlugin({})  // Class Instance
    ]
});
```

### Method 2: NPM Package (String)
You can specify the package name as a string. ObjectQL uses `require()` (Node.js) to resolve it.

```typescript
const db = new ObjectQL({
    plugins: [
        '@objectql/plugin-audit', // Searches node_modules
        './local-plugins/my-plugin' // Relative path
    ]
});
```

#### Package Resolution Rules
When loading from a string, ObjectQL tries to find the plugin in the exported module in this order:

1.  **Class Constructor**: If the module exports a Class (default or module.exports), it tries to instantiation it (`new Plugin()`).
2.  **Plugin Object**: If the module exports an object with a `setup` function, it uses it directly.
3.  **Default Export**: If the module has a `default` export, it checks that recursively.

**Example Package (`node_modules/my-plugin/index.js`):**
```javascript
// This works
module.exports = class MyPlugin { ... }

// This also works
module.exports = { name: '..', setup: () => {} }

// This also works (ESM/TS)
export default class MyPlugin { ... }
```

## 4. What can Plugins do?

The `setup(app)` method gives you full access to the `ObjectQL` instance.

### A. Manipulate Metadata (Schema)
Plugins have full control over the schema. You can modify existing objects or register new ones.

**Example 1: Injecting a global field**
```typescript
setup(app) {
    const allObjects = app.metadata.list('object');
    for (const obj of allObjects) {
        // Add 'createdAt' to every object if missing
        if (!obj.fields.createdAt) {
            obj.fields.createdAt = { type: 'datetime' };
        }
    }
}
```

**Example 2: Registering a new Object**
Plugins can bundle their own data models (e.g. an audit log table).

```typescript
setup(app) {
    app.registerObject({
        name: 'audit_log',
        fields: {
            action: { type: 'string' },
            userId: { type: 'string' },
            timestamp: { type: 'datetime' }
        }
    });
}
```

**Example 3: Scanning a Directory**
Plugins can also scan a directory to load metadata files, just like the main application. This is useful for bundling a set of objects.

```typescript
import * as path from 'path';

setup(app) {
    // Scan the 'objects' folder inside the plugin directory
    const objectsDir = path.join(__dirname, 'objects');
    app.loadFromDirectory(objectsDir);
}
```

### B. Register Global Hooks
Listen to lifecycle events on specific objects or `*` (wildcard).

```typescript
setup(app) {
    app.on('before:delete', '*', async (ctx) => {
        if (ctx.objectName === 'system_log') {
            throw new Error("Logs cannot be deleted");
        }
    });
}
```

### C. Register Custom Actions
Add new capabilities to objects.

```typescript
setup(app) {
    // Usage: objectql.executeAction('user', 'sendEmail', { ... })
    app.registerAction('user', 'sendEmail', async (ctx) => {
        await emailService.send(ctx.args.to, ctx.args.body);
    });
}
```

### D. Custom Metadata Loaders
Plugins can register new loaders to scan for custom file types (e.g. `*.workflow.yml`). This allows ObjectQL to act as a unified metadata engine.

```typescript
import * as yaml from 'js-yaml';

setup(app) {
    app.addLoader({
        name: 'workflow-loader',
        glob: ['**/*.workflow.yml'],
        handler: (ctx) => {
            const doc = yaml.load(ctx.content);
            const workflowName = doc.name;
            
            // Register into MetadataRegistry with a custom type
            ctx.registry.register('workflow', {
                type: 'workflow',
                id: workflowName,
                path: ctx.file,
                content: doc
            });
        }
    });
}
```

### E. Manage Packages (Presets)
Plugins can dynamically load or unload other packages. This is useful for plugins that act as "features" which bring in a set of dependencies.

```typescript
setup(app) {
    // Dynamically load another package
    app.addPackage('@objectos/standard-objects');

    // Or remove a package if it conflicts with this plugin
    app.removePackage('@objectos/legacy-objects');
}
```

## 5. Package Namespaces

When building plugins or packages for the application marketplace, it's crucial to prevent table name conflicts between different packages. ObjectQL provides a namespace mechanism to automatically prefix object names.

### How Namespaces Work

When a package is loaded with a namespace, all object names are automatically prefixed with `{namespace}__`. For example, if a package with namespace `audit` defines an object `note`, it will be registered as `audit__note`.

### Configuring Namespaces

There are three ways to configure namespaces:

#### Method 1: In package.json (Recommended for Packages)

```json
{
  "name": "@example/audit-log",
  "version": "1.0.0",
  "objectql": {
    "namespace": "audit"
  }
}
```

#### Method 2: In ObjectQL Config (For Application Configuration)

```typescript
const db = new ObjectQL({
    presets: ['@example/audit-log'],
    packageNamespaces: {
        '@example/audit-log': 'audit'
    }
});
```

Or using the platform-node loader:

```typescript
import { ObjectLoader } from '@objectql/platform-node';

const loader = new ObjectLoader(db.metadata, {
    '@example/audit-log': 'audit'
});
loader.loadPackage('@example/audit-log');
```

#### Method 3: Explicit Parameter

```typescript
loader.loadPackage('@example/audit-log', 'audit');
// or
loader.load(packageDir, packageName, 'audit');
```

### Automatic Namespace Derivation

If no explicit namespace is configured, ObjectQL will attempt to derive one from the package name:

- `@example/audit-log` → `audit_log`
- `my-plugin` → No automatic namespace (only applies to scoped packages)

### Namespace Impact on Objects

When an object is loaded with a namespace:

1. **Object Name**: Automatically prefixed (e.g., `note` → `audit__note`)
2. **Label**: Remains unchanged (human-readable name)
3. **Reference Fields**: Automatically updated to reference namespaced objects
4. **Namespace Property**: Added to the object config for reference

**Example:**

Original object definition (`note.object.yml`):
```yaml
name: note
label: Note
fields:
  title:
    type: text
  author:
    type: lookup
    reference_to: user
```

After loading with namespace `audit`:
```typescript
{
  name: 'audit__note',
  label: 'Note',  // Unchanged
  namespace: 'audit',
  fields: {
    title: { type: 'text' },
    author: { 
      type: 'lookup', 
      reference_to: 'audit__user'  // Automatically prefixed
    }
  }
}
```

### Namespace Utility Functions

ObjectQL Core provides utility functions for working with namespaces:

```typescript
import { applyNamespace, removeNamespace, extractNamespace, hasNamespace } from '@objectql/core';

// Apply namespace
applyNamespace('note', 'audit'); // → 'audit__note'

// Remove namespace
removeNamespace('audit__note', 'audit'); // → 'note'

// Extract namespace
extractNamespace('audit__note'); // → 'audit'

// Check if namespaced
hasNamespace('audit__note'); // → true
hasNamespace('note'); // → false
```

### Best Practices

1. **Always use namespaces for marketplace packages** to prevent conflicts
2. **Use descriptive namespaces** that match your package's purpose (e.g., `crm`, `audit`, `billing`)
3. **Keep namespaces short** to avoid overly long table names
4. **Document your namespace** in your package README
5. **Internal references only**: Only objects within the same package should reference each other. Cross-package references should be explicit.

## 6. Scope Isolation


When a plugin is loaded via **Package Name** (Method 2), ObjectQL automatically marks the hooks and actions registered by that plugin with its package name.

This allows `app.removePackage('@objectql/plugin-auth')` to cleanly remove all hooks and actions associated with that plugin, without affecting others.
