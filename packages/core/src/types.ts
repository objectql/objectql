import { ObjectRepository } from "./repository";
import { ObjectConfig } from "./metadata";
import { Driver } from "./driver";
import { UnifiedQuery, FilterCriterion } from "./query";
import { MetadataRegistry } from "./registry";

export { ObjectConfig } from "./metadata";
export { MetadataRegistry } from "./registry";

export interface ObjectQLConfig {
    registry?: MetadataRegistry;
    datasources: Record<string, Driver>;
    objects?: Record<string, ObjectConfig>;
    packages?: string[];
}

export interface IObjectQL {
    getObject(name: string): ObjectConfig | undefined;
    getConfigs(): Record<string, ObjectConfig>;
    datasource(name: string): Driver;
    init(): Promise<void>;
    addPackage(name: string): void;
    removePackage(name: string): void;
    metadata: MetadataRegistry; 
}

export interface ObjectQLContext {
    // === Identity & Isolation ===
    userId?: string;                        // Current User ID
    spaceId?: string;                       // Multi-tenancy Isolation (Organization ID)
    roles: string[];                        // RBAC Roles

    // === Execution Flags ===
    /**
     * Sudo Mode / System Bypass.
     */
    isSystem?: boolean;

    // === Data Entry Point ===
    /**
     * Returns a repository proxy bound to this context.
     * All operations performed via this proxy inherit userId, spaceId, and transaction.
     */
    object(entityName: string): ObjectRepository;

    /**
     * Execute a function within a transaction.
     * The callback receives a new context 'trxCtx' which inherits userId, spaceId from this context.
     */
    transaction(callback: (trxCtx: ObjectQLContext) => Promise<any>): Promise<any>;

    /**
     * Returns a new context with system privileges (isSystem: true).
     * It shares the same transaction scope as the current context.
     */
    sudo(): ObjectQLContext;

    /**
     * Internal: Driver-specific transaction handle.
     */
    transactionHandle?: any;
}

export interface ObjectQLContextOptions {
    userId?: string;
    spaceId?: string;
    roles?: string[];
    isSystem?: boolean;
}
