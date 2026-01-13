# Component Examples

This directory contains example component metadata files demonstrating how to create and customize UI components in ObjectQL.

## What are Components?

Components are the reusable building blocks of ObjectQL's UI. They can be:

1. **Built-in Components** - Provided by ObjectQL (ObjectTable, ObjectForm, etc.)
2. **Custom Components** - Created by you for your specific needs
3. **Component Overrides** - Your custom versions that replace built-in components

## Files in This Directory

### `custom_table.component.yml`
A complete example of a custom data table component. Shows:
- Full prop definitions with types and validation
- Event definitions
- Public methods
- Styling configuration
- Accessibility features
- AI context for understanding
- Usage examples

### `ObjectForm.component.yml`
An example of **overriding** a built-in component. Shows:
- How to replace the built-in ObjectForm with your own implementation
- Maintaining compatibility with the original component's interface
- Adding custom props and features
- Extending functionality while preserving core behavior

## Creating Your Own Components

### Step 1: Create Component Metadata

Create a file `<name>.component.yml`:

```yaml
name: my_component
label: My Custom Component
category: data_display
implementation: ./MyComponent.tsx
framework: react

props:
  - name: data
    type: array
    required: true

events:
  - name: onClick
    payload: "{ item: any }"
```

### Step 2: Implement the Component

Create the actual component file (e.g., `MyComponent.tsx`):

```tsx
export function MyComponent({ data, onClick }) {
  return (
    <div>
      {data.map(item => (
        <div key={item.id} onClick={() => onClick({ item })}>
          {item.name}
        </div>
      ))}
    </div>
  );
}
```

### Step 3: Use in Pages

Reference your component in page metadata:

```yaml
# some_page.page.yml
components:
  - id: my_widget
    component: my_component
    props:
      data: "{{projects}}"
    on:
      onClick: handleClick
```

## Overriding Built-in Components

To replace a built-in component like `ObjectTable`:

1. Create `ObjectTable.component.yml` (same name as built-in)
2. Set `extends: ObjectTable` to indicate it's an override
3. Implement all required props and events from the original
4. Point `implementation` to your custom component file

ObjectQL will automatically use your version instead of the built-in one throughout your application.

## Component Categories

- `data_display` - Tables, lists, cards, detail views
- `data_entry` - Forms, inputs, editors
- `layout` - Grids, sections, containers
- `navigation` - Menus, breadcrumbs, tabs
- `feedback` - Alerts, notifications, dialogs
- `visualization` - Charts, metrics, dashboards
- `action` - Buttons, dropdowns, toolbars
- `custom` - Your custom categories

## Best Practices

1. **Type Safety**: Define all props with proper types
2. **Documentation**: Provide clear descriptions and examples
3. **Accessibility**: Include ARIA attributes and keyboard navigation
4. **AI Context**: Help AI understand when and how to use your component
5. **Examples**: Show multiple use cases with code samples
6. **Versioning**: Use semantic versioning for component versions

## Component Discovery

Components are automatically discovered when ObjectQL scans your source directory:

```typescript
import { ObjectQL } from '@objectql/core';

const app = new ObjectQL({
  source: './src',
  components: ['./src/components/**/*.component.yml']
});

await app.init();

// List all registered components
const components = app.registry.list('component');
```

## Testing Components

Write tests for your components:

```typescript
import { renderComponent } from '@objectql/test-utils';

test('custom table renders data', async () => {
  const { container } = await renderComponent('custom_table', {
    object: 'projects',
    columns: [{ field: 'name' }]
  });
  
  expect(container).toHaveTextContent('Project Name');
});
```

## Further Reading

- [Component Specification](../../../../docs/spec/component.md) - Complete component metadata spec
- [Page Specification](../../../../docs/spec/page.md) - Using components in pages
- [TypeScript Types](../../../foundation/types/src/component.ts) - Component type definitions

## Contributing

When adding component examples:
1. Follow the naming convention: `<name>.component.yml`
2. Include comprehensive metadata (props, events, methods)
3. Provide AI context for LLM understanding
4. Add multiple usage examples
5. Document accessibility features
6. Test your component thoroughly
