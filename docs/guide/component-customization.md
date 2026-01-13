# Component Customization Guide

This guide explains how to customize and extend ObjectQL's UI components to match your specific needs.

## Overview

ObjectQL provides a powerful component system that allows you to:

1. **Use built-in components** as-is for rapid development
2. **Customize built-in components** by overriding specific behaviors
3. **Create entirely new components** for unique requirements
4. **Share component libraries** across projects and teams

## Why Customize Components?

Common reasons for customizing components:

- **Brand Consistency**: Match your company's design system
- **Enhanced Features**: Add functionality not available in built-in components
- **Performance Optimization**: Optimize for your specific use case
- **Integration Requirements**: Integrate with third-party libraries
- **Unique UX Patterns**: Implement custom user experience flows

## Three Ways to Customize

### 1. Configuration-Based Customization (Easiest)

Use built-in components with custom configuration:

```yaml
# project_list.page.yml
components:
  - id: projects_table
    component: ObjectTable
    props:
      object: projects
      # Customize via props
      theme: dark
      density: compact
      exportFormats: [csv, excel, pdf]
    style:
      # Custom styling
      class_name: "custom-table-style"
```

**Pros:**
- No code required
- Fastest approach
- Maintains compatibility with ObjectQL updates

**Cons:**
- Limited to built-in customization options
- Can't change core behavior

### 2. Component Override (Recommended)

Replace built-in components with your implementation:

```yaml
# ObjectTable.component.yml
name: ObjectTable  # Same name as built-in
extends: ObjectTable
implementation: ./components/MyEnhancedTable.tsx

# Support all original props plus your additions
props:
  - name: object
    type: string
    required: true
  
  # Your custom prop
  - name: advancedSearch
    type: boolean
    default: true
```

**Pros:**
- Full control over implementation
- Maintains component interface
- Automatically used throughout app
- Can fall back to built-in behavior

**Cons:**
- Requires React/Vue/Svelte implementation
- Must maintain compatibility
- More complex to maintain

### 3. New Component Creation (Most Flexible)

Create completely new component types:

```yaml
# kanban_board.component.yml
name: kanban_board
label: Kanban Board
category: visualization
implementation: ./components/KanbanBoard.tsx

props:
  - name: object
    type: string
    required: true
  - name: groupBy
    type: string
    required: true
```

**Pros:**
- Complete freedom in design
- No constraints from existing components
- Can solve unique problems

**Cons:**
- Most effort required
- Need to handle all edge cases
- Full responsibility for maintenance

## Step-by-Step: Overriding ObjectTable

Let's walk through creating a custom table that replaces the built-in `ObjectTable`.

### Step 1: Analyze the Built-in Component

First, understand what the built-in component does:

```typescript
// Check built-in ObjectTable props
import { BUILTIN_COMPONENTS } from '@objectql/types';

// ObjectTable expects these props:
// - object: string (required)
// - columns: array (optional)
// - filters: array (optional)
// - sortable: boolean
// - paginated: boolean
```

### Step 2: Create Component Metadata

```yaml
# src/components/ObjectTable.component.yml

name: ObjectTable  # Must match built-in name exactly
label: Enhanced Data Table
description: Custom table with advanced filtering and export
category: data_display
version: 1.0.0

# Point to your implementation
implementation: ./EnhancedTable.tsx
framework: react

# Indicate this overrides the built-in
extends: ObjectTable

# Support all original props
props:
  - name: object
    type: string
    required: true
    description: Object to display
  
  - name: columns
    type: array
    required: false
    description: Column configuration
  
  - name: filters
    type: array
    required: false
  
  - name: sortable
    type: boolean
    default: true
  
  - name: paginated
    type: boolean
    default: true
  
  # Add your custom props
  - name: exportFormats
    type: array
    default: [csv, excel]
    description: Available export formats
  
  - name: advancedFilters
    type: boolean
    default: true
    description: Enable advanced filter UI

# Define events
events:
  - name: onRowClick
    payload: "{ row: Record, index: number }"
  
  - name: onExport
    payload: "{ format: string, data: Record[] }"

# Public methods
methods:
  - name: refresh
    description: Reload data
    returns: Promise<void>
  
  - name: exportData
    parameters:
      - name: format
        type: string
    returns: void
```

### Step 3: Implement the Component

```tsx
// src/components/EnhancedTable.tsx
import React, { useState, useEffect } from 'react';
import { useObjectQL } from '@objectql/react';

export interface EnhancedTableProps {
  object: string;
  columns?: any[];
  filters?: any[];
  sortable?: boolean;
  paginated?: boolean;
  exportFormats?: string[];
  advancedFilters?: boolean;
  onRowClick?: (row: any, index: number) => void;
  onExport?: (format: string, data: any[]) => void;
}

export function EnhancedTable({
  object,
  columns,
  filters = [],
  sortable = true,
  paginated = true,
  exportFormats = ['csv', 'excel'],
  advancedFilters = true,
  onRowClick,
  onExport
}: EnhancedTableProps) {
  const { query } = useObjectQL();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadData();
  }, [object, filters]);
  
  async function loadData() {
    setLoading(true);
    try {
      const result = await query(object).find({
        filters,
        limit: paginated ? 25 : undefined
      });
      setData(result);
    } finally {
      setLoading(false);
    }
  }
  
  function handleExport(format: string) {
    if (onExport) {
      onExport(format, data);
    }
    // Your export logic here
    console.log(`Exporting ${data.length} rows as ${format}`);
  }
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="enhanced-table">
      {/* Export toolbar */}
      <div className="toolbar">
        {exportFormats.map(format => (
          <button key={format} onClick={() => handleExport(format)}>
            Export {format.toUpperCase()}
          </button>
        ))}
      </div>
      
      {/* Advanced filters UI */}
      {advancedFilters && (
        <div className="advanced-filters">
          {/* Your advanced filter UI */}
        </div>
      )}
      
      {/* Table */}
      <table>
        <thead>
          <tr>
            {columns?.map(col => (
              <th key={col.field}>{col.label || col.field}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr 
              key={row.id} 
              onClick={() => onRowClick?.(row, index)}
            >
              {columns?.map(col => (
                <td key={col.field}>{row[col.field]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### Step 4: Test Your Component

```typescript
// src/components/EnhancedTable.test.tsx
import { render, screen } from '@testing-library/react';
import { EnhancedTable } from './EnhancedTable';

test('renders table with data', async () => {
  render(
    <EnhancedTable
      object="projects"
      columns={[
        { field: 'name', label: 'Name' },
        { field: 'status', label: 'Status' }
      ]}
    />
  );
  
  // Wait for data to load
  await screen.findByText('Loading...');
  
  // Check table rendered
  expect(screen.getByRole('table')).toBeInTheDocument();
});
```

### Step 5: Use Your Component

Once registered, your component automatically replaces the built-in one:

```yaml
# Any page using ObjectTable now uses YOUR version
# dashboard.page.yml

components:
  - id: projects
    component: ObjectTable  # Uses EnhancedTable automatically
    props:
      object: projects
      # Your custom props work
      exportFormats: [csv, excel, pdf]
      advancedFilters: true
```

## Example: Custom Form Component

Here's a complete example of a custom form component:

### Component Metadata

```yaml
# CustomerForm.component.yml
name: customer_form
label: Customer Form
category: data_entry
implementation: ./CustomerForm.tsx

props:
  - name: customerId
    type: string
    required: false
  
  - name: initialData
    type: object
    required: false
  
  - name: onSubmit
    type: function
    required: true

events:
  - name: onSubmit
    payload: "{ customer: CustomerRecord }"
  
  - name: onCancel
    payload: "{}"
```

### Implementation

```tsx
// CustomerForm.tsx
import React, { useState } from 'react';

export function CustomerForm({ customerId, initialData, onSubmit }) {
  const [formData, setFormData] = useState(initialData || {});
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ customer: formData });
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Company Name</label>
        <input
          value={formData.company || ''}
          onChange={e => setFormData({
            ...formData,
            company: e.target.value
          })}
          required
        />
      </div>
      
      <div>
        <label>Email</label>
        <input
          type="email"
          value={formData.email || ''}
          onChange={e => setFormData({
            ...formData,
            email: e.target.value
          })}
          required
        />
      </div>
      
      <button type="submit">Save Customer</button>
    </form>
  );
}
```

### Usage in Pages

```yaml
# customers.page.yml
components:
  - id: customer_form
    component: customer_form
    props:
      customerId: "{{params.id}}"
    on:
      onSubmit: handleSaveCustomer
```

## Best Practices

### 1. Maintain Backward Compatibility

When overriding components, support all original props:

```yaml
# Good: Supports all ObjectTable props + new ones
props:
  - name: object
    type: string
    required: true
  - name: columns
    type: array
  - name: myNewFeature  # Addition
    type: boolean
```

### 2. Use TypeScript

Define proper types for your components:

```tsx
import type { ComponentProps } from '@objectql/types';

export interface MyTableProps extends ComponentProps {
  object: string;
  columns?: ColumnDef[];
  // ... your props
}
```

### 3. Document Everything

Provide comprehensive documentation:

```yaml
ai_context:
  purpose: "What does this component do?"
  use_cases:
    - "When should it be used?"
    - "What problems does it solve?"
  best_practices:
    - "How to use it effectively?"
  common_mistakes:
    - "What to avoid?"
```

### 4. Handle Edge Cases

- Empty states
- Loading states
- Error states
- Responsive design
- Accessibility

### 5. Optimize Performance

```tsx
import { memo, useMemo, useCallback } from 'react';

export const MyTable = memo(function MyTable(props) {
  // Use memoization for expensive computations
  const processedData = useMemo(() => {
    return processLargeDataset(props.data);
  }, [props.data]);
  
  // Memoize callbacks
  const handleClick = useCallback((row) => {
    props.onRowClick?.(row);
  }, [props.onRowClick]);
  
  return <div>...</div>;
});
```

## Troubleshooting

### Component Not Found

If your component isn't being loaded:

1. Check file naming: `<name>.component.yml`
2. Verify it's in the components search path
3. Check ObjectQL config includes your directory
4. Look for syntax errors in YAML

### Component Not Overriding

If your override isn't working:

1. Use exact same name as built-in: `ObjectTable` not `object_table`
2. Include `extends: ObjectTable` in metadata
3. Restart ObjectQL to reload components
4. Check registration order (your component must load after built-in)

### Type Errors

If TypeScript complains:

1. Import types: `import type { ComponentConfig } from '@objectql/types'`
2. Extend proper interfaces
3. Generate types from metadata: `objectql generate-types`

## Resources

- [Component Specification](../docs/spec/component.md)
- [Component Types Reference](../packages/foundation/types/src/component.ts)
- [Built-in Components](../docs/api/components/)
- [Examples](../packages/starters/basic/src/components/)

## Next Steps

1. Try overriding a simple component like `ObjectTable`
2. Create a custom component for your specific needs
3. Package your components into a reusable library
4. Share your components with the community

Happy customizing! 🎨
