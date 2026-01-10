import { HookContext, ObjectQLContext } from '@objectql/core';

// Optional if filename matches object name, but good practice.
export const listenTo = 'projects';

export async function beforeFind(context: HookContext) {
    if (!context.ctx.isSystem && context.ctx.userId) {
        console.log(`[File Hook] Projects: Restricting access for ${context.ctx.userId}`);
        context.utils.restrict(['owner', '=', context.ctx.userId]);
    }
}

export async function beforeCreate(context: HookContext) {
    if (context.doc) {
        if (!context.doc.owner && context.ctx.userId) {
            console.log(`[File Hook] Projects: Auto-assigning owner ${context.ctx.userId}`);
            context.doc.owner = context.ctx.userId;
        }
    }
}

// Actions are now in projects.action.ts

