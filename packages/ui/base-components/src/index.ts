/**
 * @objectql/base-components
 * 
 * TypeScript definitions for ObjectQL platform base components.
 * These interfaces define the standard props, events, and methods for all base components.
 */

import React from 'react';

// ============================================================================
// Common Types
// ============================================================================

export interface BaseComponentProps {
  /** Component ID for tracking and debugging */
  id?: string;
  /** Custom CSS classes */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  /** Test ID for automated testing */
  testId?: string;
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

export interface FilterConfig {
  field: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan' | 'between' | 'in';
  value: any;
}

export interface PaginationConfig {
  page: number;
  pageSize: number;
  total?: number;
}

export interface ColumnConfig {
  field: string;
  label?: string;
  type?: 'text' | 'number' | 'date' | 'boolean' | 'select' | 'lookup' | 'currency' | 'percent';
  width?: number | string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, record: any) => React.ReactNode;
}

// ============================================================================
// Data Display Components
// ============================================================================

/**
 * ObjectTable - Production-grade data table component
 */
export interface ObjectTableProps extends BaseComponentProps {
  /** ObjectQL object name to display */
  object: string;
  
  /** Column definitions (auto-generated from object if not specified) */
  columns?: ColumnConfig[];
  
  /** Filter conditions */
  filters?: FilterConfig[];
  
  /** Sort configuration */
  sort?: SortConfig[];
  
  /** Enable/disable sorting */
  sortable?: boolean;
  
  /** Enable/disable filtering */
  filterable?: boolean;
  
  /** Pagination configuration */
  pagination?: PaginationConfig | false;
  
  /** Enable row selection */
  selectable?: boolean;
  
  /** Selection mode */
  selectionMode?: 'single' | 'multiple';
  
  /** Enable search bar */
  searchable?: boolean;
  
  /** Enable export functionality */
  exportable?: boolean;
  
  /** Export formats */
  exportFormats?: ('csv' | 'excel' | 'pdf')[];
  
  /** Enable virtual scrolling for large datasets */
  virtual?: boolean;
  
  /** Row height for virtual scrolling */
  rowHeight?: number;
  
  /** Sticky header */
  stickyHeader?: boolean;
  
  /** Loading state */
  loading?: boolean;
  
  /** Event: Row click */
  onRowClick?: (record: any, index: number) => void;
  
  /** Event: Selection change */
  onSelectionChange?: (selectedRecords: any[], selectedIds: string[]) => void;
  
  /** Event: Sort change */
  onSortChange?: (sort: SortConfig[]) => void;
  
  /** Event: Filter change */
  onFilterChange?: (filters: FilterConfig[]) => void;
  
  /** Event: Pagination change */
  onPageChange?: (page: number, pageSize: number) => void;
  
  /** Event: Export */
  onExport?: (format: string, data: any[]) => void;
}

/**
 * ObjectList - Card-based list view component
 */
export interface ObjectListProps extends BaseComponentProps {
  /** ObjectQL object name to display */
  object: string;
  
  /** Fields to display in cards */
  fields?: string[];
  
  /** Filter conditions */
  filters?: FilterConfig[];
  
  /** Sort configuration */
  sort?: SortConfig[];
  
  /** Pagination configuration */
  pagination?: PaginationConfig | false;
  
  /** Card layout mode */
  layout?: 'grid' | 'list';
  
  /** Number of columns in grid mode */
  gridColumns?: number | 'auto';
  
  /** Card template (custom render function) */
  cardTemplate?: (record: any) => React.ReactNode;
  
  /** Enable search bar */
  searchable?: boolean;
  
  /** Loading state */
  loading?: boolean;
  
  /** Event: Card click */
  onCardClick?: (record: any, index: number) => void;
  
  /** Event: Filter change */
  onFilterChange?: (filters: FilterConfig[]) => void;
  
  /** Event: Pagination change */
  onPageChange?: (page: number, pageSize: number) => void;
}

/**
 * ObjectDetail - Detailed record view component
 */
export interface ObjectDetailProps extends BaseComponentProps {
  /** ObjectQL object name */
  object: string;
  
  /** Record ID to display */
  recordId: string;
  
  /** Fields to display (auto-generated from object if not specified) */
  fields?: string[];
  
  /** Field grouping/sections */
  sections?: {
    label: string;
    fields: string[];
    collapsible?: boolean;
    collapsed?: boolean;
  }[];
  
  /** Show related lists */
  relatedLists?: string[];
  
  /** Layout mode */
  layout?: 'stacked' | 'horizontal' | 'grid';
  
  /** Number of columns in grid layout */
  columns?: number;
  
  /** Enable inline editing */
  editable?: boolean;
  
  /** Loading state */
  loading?: boolean;
  
  /** Event: Field edit */
  onFieldEdit?: (field: string, value: any) => void;
  
  /** Event: Related record click */
  onRelatedClick?: (relatedObject: string, recordId: string) => void;
}

// ============================================================================
// Data Entry Components
// ============================================================================

export interface FieldConfig {
  name: string;
  label?: string;
  type?: string;
  required?: boolean;
  readonly?: boolean;
  defaultValue?: any;
  placeholder?: string;
  help?: string;
  validation?: any;
}

/**
 * ObjectForm - Comprehensive form component
 */
export interface ObjectFormProps extends BaseComponentProps {
  /** ObjectQL object name */
  object: string;
  
  /** Record ID for edit mode (omit for create mode) */
  recordId?: string;
  
  /** Fields to include in form */
  fields?: string[] | FieldConfig[];
  
  /** Field grouping/sections */
  sections?: {
    label: string;
    fields: string[] | FieldConfig[];
    collapsible?: boolean;
    collapsed?: boolean;
  }[];
  
  /** Tab-based layout */
  tabs?: {
    label: string;
    fields: string[] | FieldConfig[];
  }[];
  
  /** Form layout mode */
  layout?: 'vertical' | 'horizontal' | 'inline' | 'grid';
  
  /** Number of columns in grid layout */
  columns?: number;
  
  /** Initial form values */
  initialValues?: Record<string, any>;
  
  /** Enable auto-save */
  autoSave?: boolean;
  
  /** Auto-save debounce delay (ms) */
  autoSaveDelay?: number;
  
  /** Show required indicator */
  showRequired?: boolean;
  
  /** Submit button text */
  submitText?: string;
  
  /** Cancel button text */
  cancelText?: string;
  
  /** Loading state */
  loading?: boolean;
  
  /** Event: Form submit */
  onSubmit?: (values: Record<string, any>) => void | Promise<void>;
  
  /** Event: Form cancel */
  onCancel?: () => void;
  
  /** Event: Field change */
  onFieldChange?: (field: string, value: any) => void;
  
  /** Event: Form validation */
  onValidate?: (values: Record<string, any>) => Record<string, string> | void;
}

/**
 * QuickCreateForm - Simplified quick-create form
 */
export interface QuickCreateFormProps extends BaseComponentProps {
  /** ObjectQL object name */
  object: string;
  
  /** Fields to include (minimal set) */
  fields?: string[] | FieldConfig[];
  
  /** Initial form values */
  initialValues?: Record<string, any>;
  
  /** Form layout mode */
  layout?: 'vertical' | 'horizontal' | 'inline';
  
  /** Submit button text */
  submitText?: string;
  
  /** Loading state */
  loading?: boolean;
  
  /** Event: Form submit */
  onSubmit?: (values: Record<string, any>) => void | Promise<void>;
  
  /** Event: Form cancel */
  onCancel?: () => void;
}

// ============================================================================
// Layout Components
// ============================================================================

/**
 * GridLayout - Responsive grid layout component
 */
export interface GridLayoutProps extends BaseComponentProps {
  /** Number of columns */
  columns?: number | { xs?: number; sm?: number; md?: number; lg?: number; xl?: number };
  
  /** Gap between grid items */
  gap?: number | string;
  
  /** Enable drag-and-drop reordering */
  draggable?: boolean;
  
  /** Grid items */
  items?: {
    id: string;
    component: React.ReactNode;
    span?: number;
    order?: number;
  }[];
  
  /** Children (alternative to items) */
  children?: React.ReactNode;
  
  /** Event: Layout change (after drag-and-drop) */
  onLayoutChange?: (items: any[]) => void;
}

/**
 * TabContainer - Tab-based content organization
 */
export interface TabContainerProps extends BaseComponentProps {
  /** Active tab key */
  activeTab?: string;
  
  /** Tabs configuration */
  tabs: {
    key: string;
    label: string;
    icon?: React.ReactNode;
    content: React.ReactNode;
    disabled?: boolean;
  }[];
  
  /** Tab position */
  tabPosition?: 'top' | 'bottom' | 'left' | 'right';
  
  /** Enable lazy loading of tab content */
  lazy?: boolean;
  
  /** Event: Tab change */
  onTabChange?: (tabKey: string) => void;
}

// ============================================================================
// Visualization Components
// ============================================================================

export interface ChartDataPoint {
  label: string;
  value: number;
  [key: string]: any;
}

/**
 * Chart - Charts and graphs component
 */
export interface ChartProps extends BaseComponentProps {
  /** Chart type */
  type: 'line' | 'bar' | 'pie' | 'donut' | 'area' | 'scatter' | 'radar';
  
  /** Chart data */
  data: ChartDataPoint[] | ChartDataPoint[][];
  
  /** Data series configuration (for multi-series charts) */
  series?: {
    name: string;
    data: ChartDataPoint[];
    color?: string;
  }[];
  
  /** X-axis field name */
  xField?: string;
  
  /** Y-axis field name */
  yField?: string;
  
  /** Chart title */
  title?: string;
  
  /** Show legend */
  showLegend?: boolean;
  
  /** Legend position */
  legendPosition?: 'top' | 'bottom' | 'left' | 'right';
  
  /** Show grid lines */
  showGrid?: boolean;
  
  /** Enable tooltips */
  showTooltip?: boolean;
  
  /** Chart height */
  height?: number | string;
  
  /** Chart width */
  width?: number | string;
  
  /** Loading state */
  loading?: boolean;
  
  /** Event: Data point click */
  onDataPointClick?: (dataPoint: ChartDataPoint, index: number) => void;
}

/**
 * Metric - KPI and metric display component
 */
export interface MetricProps extends BaseComponentProps {
  /** Metric title */
  title: string;
  
  /** Metric value */
  value: number | string;
  
  /** Value format */
  format?: 'number' | 'currency' | 'percent' | 'custom';
  
  /** Custom format function */
  formatter?: (value: number | string) => string;
  
  /** Trend indicator */
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
    label?: string;
  };
  
  /** Comparison value (previous period) */
  comparison?: {
    value: number | string;
    label?: string;
  };
  
  /** Icon */
  icon?: React.ReactNode;
  
  /** Color scheme */
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  
  /** Loading state */
  loading?: boolean;
  
  /** Event: Metric click */
  onClick?: () => void;
}

// ============================================================================
// Exports
// ============================================================================

export * from './index';
