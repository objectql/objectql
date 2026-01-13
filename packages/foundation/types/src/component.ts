/**
 * Component Metadata Definition
 * 
 * Defines the structure for reusable UI components in ObjectQL applications.
 * Components are the building blocks of ObjectQL's frontend - they can be:
 * - Built-in components (provided by ObjectQL)
 * - Custom components (created by users)
 * - Extended components (customized versions of built-in components)
 * 
 * This specification allows customers to:
 * 1. Use ObjectQL's built-in components (ObjectTable, ObjectForm, etc.)
 * 2. Override built-in components with custom implementations
 * 3. Create entirely new component types
 * 4. Share components across applications
 */

/**
 * Component categories for organization and discovery
 */
export type ComponentCategory =
    | 'data_display'      // Components for displaying data (tables, lists, cards)
    | 'data_entry'        // Components for data input (forms, fields)
    | 'layout'            // Layout components (containers, grids, sections)
    | 'navigation'        // Navigation components (menus, breadcrumbs, tabs)
    | 'feedback'          // User feedback (alerts, notifications, dialogs)
    | 'visualization'     // Charts and data visualization
    | 'media'             // Media display (images, videos, files)
    | 'action'            // Action triggers (buttons, dropdowns)
    | 'utility'           // Utility components (loaders, icons)
    | 'custom';           // Custom category

/**
 * Component rendering modes
 */
export type ComponentRenderMode =
    | 'client'            // Client-side rendering
    | 'server'            // Server-side rendering
    | 'static'            // Static generation
    | 'hybrid';           // Combination of modes

/**
 * Component input property definition
 */
export interface ComponentProp {
    /** Property name */
    name: string;
    /** Property type */
    type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'function' | 'any';
    /** Property description */
    description?: string;
    /** Is this property required? */
    required?: boolean;
    /** Default value */
    default?: any;
    /** Validation rules */
    validation?: {
        /** Minimum value (for numbers) */
        min?: number;
        /** Maximum value (for numbers) */
        max?: number;
        /** Pattern to match (for strings) */
        pattern?: string;
        /** Allowed values (enum) */
        enum?: any[];
        /** Custom validation function */
        validator?: string;
    };
    /** Examples of valid values */
    examples?: any[];
    /** Deprecation notice */
    deprecated?: boolean | string;
    /** AI context for understanding this prop */
    ai_context?: {
        intent?: string;
        usage_guide?: string;
        common_values?: any[];
    };
}

/**
 * Component event definition
 */
export interface ComponentEvent {
    /** Event name */
    name: string;
    /** Event description */
    description?: string;
    /** Event payload type */
    payload?: string;
    /** When this event is triggered */
    trigger?: string;
    /** Examples */
    examples?: Array<{
        scenario: string;
        payload: any;
    }>;
}

/**
 * Component slot definition for composition
 */
export interface ComponentSlot {
    /** Slot name */
    name: string;
    /** Slot description */
    description?: string;
    /** Is this slot required? */
    required?: boolean;
    /** Allowed component types in this slot */
    allowed_types?: string[];
    /** Default content if not provided */
    default?: any;
}

/**
 * Component state definition
 */
export interface ComponentState {
    /** State property name */
    name: string;
    /** State type */
    type: string;
    /** Initial value */
    initial?: any;
    /** Is this state internal (not exposed)? */
    internal?: boolean;
    /** State description */
    description?: string;
}

/**
 * Component method definition
 */
export interface ComponentMethod {
    /** Method name */
    name: string;
    /** Method description */
    description?: string;
    /** Parameters */
    parameters?: Array<{
        name: string;
        type: string;
        description?: string;
        required?: boolean;
    }>;
    /** Return type */
    returns?: string;
    /** Method examples */
    examples?: Array<{
        usage: string;
        result?: any;
    }>;
}

/**
 * Component styling configuration
 */
export interface ComponentStyling {
    /** CSS framework used */
    framework?: 'tailwind' | 'bootstrap' | 'material-ui' | 'ant-design' | 'custom';
    /** Theme variables this component uses */
    theme_vars?: string[];
    /** Custom CSS classes */
    css_classes?: string[];
    /** CSS-in-JS support */
    css_in_js?: boolean;
    /** Customizable style points */
    customizable?: Array<{
        name: string;
        description: string;
        type: 'color' | 'size' | 'spacing' | 'typography' | 'other';
        default?: string;
    }>;
}

/**
 * Component accessibility configuration
 */
export interface ComponentAccessibility {
    /** ARIA role */
    role?: string;
    /** Keyboard navigation support */
    keyboard_navigation?: boolean;
    /** Screen reader friendly */
    screen_reader?: boolean;
    /** Focus management */
    focus_management?: boolean;
    /** Color contrast compliance */
    color_contrast?: 'AA' | 'AAA';
    /** ARIA attributes used */
    aria_attributes?: string[];
}

/**
 * Component performance hints
 */
export interface ComponentPerformance {
    /** Is this component lazy-loadable? */
    lazy_loadable?: boolean;
    /** Bundle size estimate (in KB) */
    bundle_size?: number;
    /** Rendering complexity */
    complexity?: 'low' | 'medium' | 'high';
    /** Should this component be memoized? */
    memoizable?: boolean;
    /** Virtual scrolling support for large datasets */
    virtual_scroll?: boolean;
}

/**
 * Component metadata configuration
 * 
 * This is the core interface that defines a reusable UI component.
 */
export interface ComponentConfig {
    /** 
     * Unique component identifier
     * For custom components, use namespaced names like: "myapp.CustomTable"
     * For overrides, use the built-in name like: "ObjectTable"
     */
    name: string;
    
    /** Display label */
    label: string;
    
    /** Component description */
    description?: string;
    
    /** Component category */
    category: ComponentCategory;
    
    /** Version (semver) */
    version?: string;
    
    /** Component author/organization */
    author?: string;
    
    /** Icon for visual identification */
    icon?: string;
    
    /** Tags for searchability */
    tags?: string[];
    
    /**
     * Implementation reference
     * - For React: Path to React component file or import statement
     * - For Vue: Path to Vue component file
     * - For Web Components: Tag name
     */
    implementation: string;
    
    /** Framework this component is built for */
    framework?: 'react' | 'vue' | 'svelte' | 'web-component' | 'angular';
    
    /** Rendering mode */
    render_mode?: ComponentRenderMode;
    
    /** Component properties/props */
    props?: ComponentProp[];
    
    /** Events emitted by this component */
    events?: ComponentEvent[];
    
    /** Slots for component composition */
    slots?: ComponentSlot[];
    
    /** Internal state */
    state?: ComponentState[];
    
    /** Public methods */
    methods?: ComponentMethod[];
    
    /** Styling configuration */
    styling?: ComponentStyling;
    
    /** Accessibility features */
    accessibility?: ComponentAccessibility;
    
    /** Performance characteristics */
    performance?: ComponentPerformance;
    
    /** Dependencies (other components or libraries) */
    dependencies?: Array<{
        name: string;
        version?: string;
        type: 'component' | 'library';
        optional?: boolean;
    }>;
    
    /** 
     * If this component extends/overrides a built-in component
     * For example: "ObjectTable" means this replaces the built-in ObjectTable
     */
    extends?: string;
    
    /**
     * If this component is a variant of another component
     * For example: A "CompactTable" might be a variant of "ObjectTable"
     */
    variant_of?: string;
    
    /** Screenshots/previews */
    previews?: Array<{
        url: string;
        description?: string;
        viewport?: 'mobile' | 'tablet' | 'desktop';
    }>;
    
    /** Usage examples */
    examples?: Array<{
        title: string;
        description?: string;
        code: string;
        preview?: string;
    }>;
    
    /** Documentation URL */
    docs_url?: string;
    
    /** Source code repository */
    repository?: string;
    
    /** License */
    license?: string;
    
    /** 
     * AI context for understanding and using this component
     * Helps LLMs understand when and how to use this component
     */
    ai_context?: {
        /** What problem does this component solve? */
        purpose?: string;
        /** When should this component be used? */
        use_cases?: string[];
        /** When should this component NOT be used? */
        anti_patterns?: string[];
        /** Best practices */
        best_practices?: string[];
        /** Common mistakes to avoid */
        common_mistakes?: string[];
        /** Integration hints */
        integration_hints?: string[];
    };
    
    /** Feature flags */
    features?: {
        /** Supports real-time data updates */
        realtime?: boolean;
        /** Supports offline mode */
        offline?: boolean;
        /** Supports internationalization */
        i18n?: boolean;
        /** Supports theming */
        themeable?: boolean;
        /** Responsive design */
        responsive?: boolean;
        /** Printable */
        printable?: boolean;
        /** Exportable (PDF, Excel, etc.) */
        exportable?: boolean;
    };
    
    /** Platform compatibility */
    platforms?: {
        web?: boolean;
        mobile?: boolean;
        desktop?: boolean;
        ssr?: boolean;
    };
    
    /** Configuration schema for this component */
    config_schema?: Record<string, any>;
    
    /** Deprecation notice */
    deprecated?: {
        since?: string;
        replacement?: string;
        message?: string;
    };
}

/**
 * Component registry entry
 * 
 * Used internally by ObjectQL to track registered components
 */
export interface ComponentRegistryEntry {
    /** Component configuration */
    config: ComponentConfig;
    /** Registration timestamp */
    registered_at: Date;
    /** Source of registration (built-in, user, plugin) */
    source: 'built-in' | 'user' | 'plugin' | 'override';
    /** If this is an override, reference to original */
    overrides?: string;
    /** Loaded and ready to use */
    loaded: boolean;
}

/**
 * Component library definition
 * 
 * A collection of related components that can be installed together
 */
export interface ComponentLibrary {
    /** Library name */
    name: string;
    /** Display label */
    label: string;
    /** Description */
    description?: string;
    /** Version */
    version: string;
    /** Author */
    author?: string;
    /** Components in this library */
    components: string[];
    /** Library dependencies */
    dependencies?: Record<string, string>;
    /** Installation instructions */
    installation?: string;
    /** Documentation URL */
    docs_url?: string;
    /** Repository */
    repository?: string;
    /** License */
    license?: string;
}

/**
 * Component instance configuration
 * 
 * Used when placing a component on a page or in another component
 */
export interface ComponentInstance {
    /** Unique instance ID */
    id: string;
    /** Component type name */
    component: string;
    /** Component props/configuration */
    props?: Record<string, any>;
    /** Event handlers */
    on?: Record<string, string | Function>;
    /** Child components (for slots) */
    children?: ComponentInstance[];
    /** Conditional rendering */
    visible_when?: Record<string, any>;
    /** Permissions */
    permissions?: string[];
}

/**
 * Built-in component names
 * 
 * These are the core components provided by ObjectQL
 * Users can override these by registering components with the same name
 */
export const BUILTIN_COMPONENTS = {
    // Data Display
    OBJECT_TABLE: 'ObjectTable',
    OBJECT_LIST: 'ObjectList',
    OBJECT_CARD_LIST: 'ObjectCardList',
    OBJECT_DETAIL: 'ObjectDetail',
    RELATED_LIST: 'RelatedList',
    
    // Data Entry
    OBJECT_FORM: 'ObjectForm',
    QUICK_CREATE_FORM: 'QuickCreateForm',
    FIELD_INPUT: 'FieldInput',
    LOOKUP_FIELD: 'LookupField',
    
    // Layout
    GRID_LAYOUT: 'GridLayout',
    SECTION: 'Section',
    TAB_CONTAINER: 'TabContainer',
    MODAL: 'Modal',
    DRAWER: 'Drawer',
    
    // Navigation
    NAVBAR: 'NavBar',
    SIDEBAR: 'Sidebar',
    BREADCRUMB: 'Breadcrumb',
    MENU: 'Menu',
    
    // Visualization
    CHART: 'Chart',
    METRIC: 'Metric',
    KANBAN_BOARD: 'KanbanBoard',
    CALENDAR: 'Calendar',
    TIMELINE: 'Timeline',
    
    // Actions
    ACTION_BUTTON: 'ActionButton',
    BUTTON_GROUP: 'ButtonGroup',
    DROPDOWN: 'Dropdown',
    
    // Feedback
    ALERT: 'Alert',
    NOTIFICATION: 'Notification',
    SPINNER: 'Spinner',
    PROGRESS: 'Progress',
} as const;

export type BuiltInComponentName = typeof BUILTIN_COMPONENTS[keyof typeof BUILTIN_COMPONENTS];
