import { ObjectConfig } from "./object";
import { Driver } from "./driver";
import { ObjectRegistry } from "./registry";
import { HookName, HookHandler, HookContext } from "./hook";
import { ActionHandler, ActionContext } from "./action";

export interface IObjectQL {
    getObject(name: string): ObjectConfig | undefined;
    getConfigs(): Record<string, ObjectConfig>;
    datasource(name: string): Driver;
    init(): Promise<void>;
    addPackage(name: string): void;
    removePackage(name: string): void;
    metadata: ObjectRegistry; 

    on(event: HookName, objectName: string, handler: HookHandler): void;
    triggerHook(event: HookName, objectName: string, ctx: HookContext): Promise<void>;

    registerAction(objectName: string, actionName: string, handler: ActionHandler): void;
    executeAction(objectName: string, actionName: string, ctx: ActionContext): Promise<any>;
}
