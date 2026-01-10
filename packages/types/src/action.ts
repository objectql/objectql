import { FieldConfig } from "./field";
import { ObjectQLContext } from "./types";

export interface ActionConfig {
    label?: string;
    icon?: string;
    description?: string;
    confirmText?: string;
    
    // Parameters definition for the action (input schema)
    params?: Record<string, FieldConfig>;
}

export interface ActionContext extends ObjectQLContext {
    objectName: string;
    actionName: string;
    id?: string | number; // Optional record ID if action is applied to a record
    params: any;          // Arguments passed to the action
}

export type ActionHandler = (ctx: ActionContext) => Promise<any>;
