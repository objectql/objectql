import { FieldConfig } from './field';
import { ActionConfig } from './action';

export interface IndexConfig {
    /** List of fields involved in the index */
    fields: string[];
    /** Whether the index enforces uniqueness */
    unique?: boolean;
}

export interface ObjectConfig {
    name: string;
    datasource?: string; // The name of the datasource to use
    label?: string;
    icon?: string;
    description?: string;
    
    fields: Record<string, FieldConfig>;
    indexes?: Record<string, IndexConfig>;
    actions?: Record<string, ActionConfig>;
}
