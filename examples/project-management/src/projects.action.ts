import { ObjectQLContext } from '@objectql/core';

export const listenTo = 'projects';

export const complete = async (ctx: ObjectQLContext, params: { id: string, comment?: string }) => {
    const { id, comment } = params;
    console.log(`[Action] Completing project ${id} by ${ctx.userId}. Comment: ${comment}`);
    
    // Use the context to get a repo for this object
    const repo = ctx.object('projects');
    
    // Update the project status
    await repo.update(id, { 
        status: 'completed',
        description: comment ? `Completed with comment: ${comment}` : undefined
    });
    
    return { success: true, message: "Project completed" };
};
