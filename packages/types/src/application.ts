export type MenuType = 'sidebar' | 'topnav' | 'mobile_bottom';

export interface BadgeConfig {
    function?: 'count' | 'sum';
    field?: string; // Field to aggregate if function is sum
    filter?: any[]; // Specific filter for this badge, e.g. [['status', '=', 'new']]
    color?: 'red' | 'blue' | 'green' | 'yellow' | 'gray';
    value?: string | number; // Static value
}

export interface QuickActionConfig {
    name: string;
    label: string;
    action: string; // e.g., 'create_record'
    object?: string;
    shortcut?: string; // e.g. "cmd+shift+l"
    component?: string;
}

export interface SearchConfig {
    enabled: boolean;
    hotkey?: string;
    scope?: string[]; // ['leads', 'opportunities']
}

export interface AIContext {
    intent?: string;
    target_persona?: string;
    key_tasks?: string[];
    description?: string;
}

export interface MenuItem {
    type?: 'page' | 'object' | 'section' | 'folder' | 'divider' | 'link';
    
    // Identity
    name?: string;
    label?: string;
    icon?: string;
    
    // Navigation
    path?: string;
    object?: string; // For type: object
    view?: string;   // For type: object
    url?: string;    // For type: link
    target?: '_self' | '_blank';
    component?: string; // For type: page

    // Behavior
    expanded?: boolean; // For section/folder
    collapsible?: boolean;
    
    // Dynamic
    badge?: BadgeConfig;
    active_match?: string; // Glob pattern for active state
    permissions?: string[]; 
    visible_when?: Record<string, any>;
    
    // AI
    ai_context?: string;

    // Children
    items?: MenuItem[];
}

export interface NavigationConfig {
    type: MenuType;
    collapsible?: boolean;
    items: MenuItem[];
}

export interface ApplicationConfig {
    // Identity
    name: string; // Unique API identifier (e.g. sales_crm)
    label: string; // Display name
    description?: string;
    icon?: string;
    version?: string;

    // Branding
    theme?: {
        mode?: 'light' | 'dark' | 'system';
        primary_color?: string;
        density?: 'compact' | 'default' | 'spacious';
        [key: string]: any;
    };

    // Access Control
    permissions?: {
        roles?: string[];
        users?: string[];
    };

    // AI
    ai_context?: AIContext;

    // Workspace Capabilities
    features?: {
        global_search?: SearchConfig;
        quick_actions?: QuickActionConfig[];
        [key: string]: any;
    };

    // Navigation Structure
    navigation: NavigationConfig;
}
