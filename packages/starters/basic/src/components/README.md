# Component Examples

This directory contains example component metadata files and React + Tailwind CSS implementations demonstrating how to create and customize UI components in ObjectQL.

## 📋 Files in This Directory

### Component Metadata (YAML)
- `custom_table.component.yml` - Metadata definition for CustomTable
- `ObjectForm.component.yml` - Example of overriding built-in component
- `custom_ui_library.library.yml` - Component library definition

### React + Tailwind Implementations
- `CustomTable.tsx` - **Full-featured data table component with Tailwind CSS**
- `TableExamplePage.tsx` - **Complete usage example and documentation**

## ⚛️ React + Tailwind CSS Implementation

### CustomTable Component

A production-ready data table component built with:
- **React 18+** with TypeScript
- **Tailwind CSS** for styling
- **React Hooks** for state management (useState, useEffect, useMemo)

#### Features

✅ **Search & Filter** - Full-text search across all columns
✅ **Sorting** - Click headers to sort ascending/descending  
✅ **Row Selection** - Select individual or all rows for bulk operations
✅ **Export** - Export to CSV/Excel formats
✅ **Pagination** - Smart pagination for large datasets
✅ **Custom Renderers** - Badge, date, currency, and text renderers
✅ **Responsive Design** - Works on all screen sizes
✅ **Performance Optimized** - Memoization for large datasets
✅ **Accessibility** - Keyboard navigation and ARIA attributes

## What are Components?

Components are the reusable building blocks of ObjectQL's UI. They can be:

1. **Built-in Components** - Provided by ObjectQL (ObjectTable, ObjectForm, etc.)
2. **Custom Components** - Created by you for your specific needs (like CustomTable)
3. **Component Overrides** - Your custom versions that replace built-in components

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install react react-dom
npm install -D tailwindcss @types/react @types/react-dom
```

### 2. Configure Tailwind CSS

Create `tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Create `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 3. Use the CustomTable Component

```tsx
import React from 'react';
import { CustomTable, ColumnDefinition } from './components/CustomTable';

function App() {
  const columns: ColumnDefinition[] = [
    { field: 'name', label: 'Project Name', width: 300 },
    { field: 'status', label: 'Status', renderer: 'badge' },
    { field: 'priority', label: 'Priority', renderer: 'badge' },
    { field: 'owner', label: 'Owner', width: 150 },
    { field: 'budget', label: 'Budget', renderer: 'currency' },
  ];

  return (
    <div className="p-8">
      <CustomTable
        object="projects"
        columns={columns}
        sortable={true}
        filterable={true}
        selectable={true}
        exportable={true}
        onRowClick={(row) => console.log('Clicked:', row)}
      />
    </div>
  );
}

export default App;
```

## 📚 Component API

### Props

| Prop | Type | Default | Description |
|:---|:---|:---|:---|
| `object` | `string` | required | Name of the ObjectQL object to display |
| `columns` | `ColumnDefinition[]` | `[]` | Column definitions |
| `filters` | `FilterDefinition[]` | `[]` | Default filters to apply |
| `sortable` | `boolean` | `true` | Enable column sorting |
| `filterable` | `boolean` | `true` | Enable filtering UI |
| `pageSize` | `number` | `25` | Records per page |
| `selectable` | `boolean` | `false` | Enable row selection |
| `exportable` | `boolean` | `true` | Show export buttons |
| `highlightRow` | `(row: any) => boolean` | - | Function to highlight rows |
| `onRowClick` | `(row: any, index: number) => void` | - | Row click handler |
| `onSort` | `(column: string, direction: 'asc' \| 'desc') => void` | - | Sort handler |
| `onSelect` | `(rows: any[], ids: string[]) => void` | - | Selection handler |
| `onExport` | `(format: 'csv' \| 'excel', data: any[]) => void` | - | Export handler |

### Column Definition

```typescript
interface ColumnDefinition {
  field: string;              // Field name from data
  label?: string;             // Column header label
  width?: number;             // Column width in pixels
  sortable?: boolean;         // Enable sorting for this column
  renderer?: 'text' | 'badge' | 'date' | 'currency';
  format?: string;            // Format string (for dates/numbers)
}
```

## 🎨 Tailwind CSS Classes Used

The component uses Tailwind CSS utility classes for styling:

### Layout & Structure
- `min-w-full` - Full width table
- `divide-y divide-gray-200` - Row dividers
- `px-6 py-4` - Padding
- `space-x-4` - Horizontal spacing

### Colors & Backgrounds
- `bg-white` - White background
- `bg-gray-50` - Light gray for header
- `bg-blue-50` - Selected row highlight
- `bg-yellow-50` - Custom row highlight
- `border-gray-200` - Border colors

### Typography
- `text-sm, text-xs` - Font sizes
- `font-medium, font-semibold` - Font weights
- `text-gray-900, text-gray-500` - Text colors
- `uppercase tracking-wider` - Header text styling

### Interactive States
- `hover:bg-gray-50` - Hover effect
- `focus:ring-2 focus:ring-blue-500` - Focus states
- `disabled:opacity-50 disabled:cursor-not-allowed` - Disabled states
- `cursor-pointer` - Clickable elements

### Responsive Design
- `overflow-x-auto` - Horizontal scroll on small screens
- `md:grid-cols-2` - Responsive grid

### Animations
- `animate-spin` - Loading spinner
- `transition-colors duration-150` - Smooth color transitions

## 💡 Usage Examples

### Basic Table

```tsx
<CustomTable
  object="projects"
  columns={[
    { field: 'name', label: 'Name' },
    { field: 'status', label: 'Status', renderer: 'badge' }
  ]}
/>
```

### With Search and Filtering

```tsx
<CustomTable
  object="tasks"
  columns={columns}
  filterable={true}
  filters={[
    { field: 'status', operator: '!=', value: 'completed' }
  ]}
/>
```

### With Row Selection

```tsx
<CustomTable
  object="customers"
  columns={columns}
  selectable={true}
  onSelect={(rows, ids) => {
    console.log('Selected:', ids);
  }}
/>
```

### With Custom Row Highlighting

```tsx
<CustomTable
  object="orders"
  columns={columns}
  highlightRow={(row) => row.amount > 10000}
  onRowClick={(row) => navigate(`/orders/${row.id}`)}
/>
```

### With Export

```tsx
<CustomTable
  object="reports"
  columns={columns}
  exportable={true}
  onExport={(format, data) => {
    console.log(`Exporting ${data.length} rows as ${format}`);
  }}
/>
```

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
