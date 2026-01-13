# Component Integration Guide

## ObjectQL Component Package Integration

This is the recommended standard component integration method for ObjectQL. It supports application marketplace distribution, version management, and dynamic loading through a metadata-driven component package system.

## ✅ Recommended Method: Metadata-Driven Component Packages

### Why Choose This Approach?

- **Marketplace Integration** - Components can be published to the ObjectQL marketplace for one-click installation
- **Version Management** - Supports semantic versioning and automatic updates
- **Metadata-Driven** - Use components via YAML configuration without writing code
- **Dynamic Loading** - Load components on demand for optimized performance
- **Type Safety** - Complete TypeScript support
- **Isolation** - Component packages are independent, avoiding conflicts

### For Developers: How to Publish Component Packages

#### 1. Create Component Package

Follow the [Component Package Specification](../../../docs/spec/component-package.md) to create your component package.

Complete example: [awesome-components](../../../examples/component-packages/awesome-components/)

#### 2. Build UMD Package

```bash
npm run build
# Generates dist/index.umd.js (browser-ready)
# Generates dist/index.esm.js (for module bundlers)
# Generates dist/index.d.ts (TypeScript definitions)
```

#### 3. Publish

```bash
# Publish to npm
npm publish --access public

# Publish to ObjectQL Marketplace
objectql publish --package ./objectql.package.json
```

### For Users: How to Install and Use

#### Installation Method 1: ObjectQL Studio (Recommended)

1. Open ObjectQL Studio
2. Navigate to **Marketplace** → **Components**
3. Search for the component package
4. Click **Install**

Components are automatically installed and registered, immediately available for use.

#### Installation Method 2: Command Line

```bash
# Install from marketplace
objectql install @mycompany/awesome-components
```

#### Installation Method 3: Configuration File

```json
// objectql.config.json
{
  "packages": [
    {
      "name": "@mycompany/awesome-components",
      "version": "^1.0.0",
      "enabled": true
    }
  ]
}
```

Run `objectql install` to automatically install all declared packages.

### Using Installed Components

#### Use in Page Metadata (Recommended)

```yaml
# dashboard.page.yml
name: dashboard

components:
  - id: projects_table
    component: my_table  # Reference component from installed package
    props:
      object: projects
      columns:
        - field: name
          label: Project Name
        - field: status
          label: Status
      sortable: true
      filterable: true
```

ObjectQL automatically:
1. Parses metadata
2. Loads component UMD module
3. Renders component
4. Handles data binding

### Component Package Lifecycle

```
Develop Package → Build UMD → Publish to npm → Register to Marketplace 
    ↓
User Install → Auto Register → Metadata Reference → Dynamic Load → Render Component
```

### Version Management

```bash
# Check for updates
objectql check-updates

# Update all packages
objectql update

# Update specific package
objectql update @mycompany/awesome-components
```

### Frequently Asked Questions

**Q: Must component packages be in UMD format?**  
A: Yes. UMD format supports direct browser loading and is compatible with module bundlers. ObjectQL uses UMD for dynamic loading.

**Q: Can multiple versions be installed simultaneously?**  
A: Not recommended. Each package should have only one installed version.

**Q: How to uninstall a component package?**  
A: `objectql uninstall @mycompany/awesome-components` or uninstall via Studio UI.

## Complete Example

View complete component package examples:
- [Example Package Source](../../../examples/component-packages/awesome-components/)
- [Component Package Specification](../../../docs/spec/component-package.md)
