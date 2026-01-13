# @objectql/base-components

TypeScript definitions and React component interfaces for ObjectQL platform base components.

## Overview

This package provides standard TypeScript interfaces for all ObjectQL platform base components. These interfaces serve as a reference for developers implementing custom components that follow the ObjectQL component specification.

## Installation

```bash
npm install @objectql/base-components
```

## Usage

### Import Component Interfaces

```typescript
import {
  ObjectTableProps,
  ObjectFormProps,
  ObjectListProps,
  ObjectDetailProps,
  ChartProps,
  MetricProps,
  GridLayoutProps,
  TabContainerProps,
  QuickCreateFormProps
} from '@objectql/base-components';
```

### Implement Custom Components

```typescript
import React from 'react';
import { ObjectTableProps } from '@objectql/base-components';

export const MyCustomTable: React.FC<ObjectTableProps> = ({
  object,
  columns,
  filters,
  sortable,
  pagination,
  onRowClick,
  onSelectionChange,
  ...props
}) => {
  // Your custom implementation
  return (
    <div className="my-custom-table">
      {/* Implementation */}
    </div>
  );
};
```

## Component Categories

### Data Display Components
- **ObjectTable** - Production-grade data table with sorting, filtering, and pagination
- **ObjectList** - Card-based list view for object records
- **ObjectDetail** - Detailed record view with related lists

### Data Entry Components
- **ObjectForm** - Comprehensive form with sections, tabs, and validation
- **QuickCreateForm** - Simplified form for quick record creation

### Layout Components
- **GridLayout** - Responsive grid layout system
- **TabContainer** - Tab-based content organization

### Visualization Components
- **Chart** - Charts and graphs (line, bar, pie, area, etc.)
- **Metric** - KPI and metric displays with trends

## TypeScript Support

All components are fully typed with TypeScript, providing:
- IntelliSense and autocomplete
- Type checking
- Documentation through JSDoc comments
- Type-safe prop validation

## Component Props

Each component interface includes:
- **Required props**: Essential configuration
- **Optional props**: Extended functionality
- **Event handlers**: User interaction callbacks
- **Methods**: Programmatic control (via refs)
- **Styling**: Theme and customization options

## Examples

See the [complete specification](../../../docs/spec/base-components.md) for detailed examples and usage patterns.

## References

- [Base Components Specification](../../../docs/spec/base-components.md)
- [Component Metadata Standard](../../../docs/spec/component.md)
- [Component Package Specification](../../../docs/spec/component-package.md)

## License

MIT
