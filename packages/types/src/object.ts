import { FieldConfig } from './field';

export interface ObjectConfig {
    name: string;
    datasource?: string; // The name of the datasource to use
    label?: string;
    icon?: string;
    description?: string;
    
    fields: Record<string, FieldConfig>;
    
    /**
     * Whether this object can be modified or deleted.
     * System objects (e.g., user, session, account) should be marked as non-customizable.
     * Defaults to true for user-defined objects.
     */
    customizable?: boolean;
}
