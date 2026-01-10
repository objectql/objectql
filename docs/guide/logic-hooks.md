# ObjectQL Lifecycle Hooks & Business Logic

**Version:** 1.0.0

## 1. Overview

The system provides a rich interception model (AOP) to inject business logic into the CRUD lifecycle. Hooks are event-driven functions that execute within the same **Transaction Scope** as the primary operation.

## 2. Hook Signature

Hooks receive a structured object containing the **Session Context** and the **Operation Payload**.

```typescript
import { UnifiedQuery, ObjectQLContext, HookContext } from '@objectql/types';

export interface HookContext extends ObjectQLContext {
    // === 1. Target Info ===
    objectName: string;
    
    // === 2. Operational Data (Mutable) ===
    query?: UnifiedQuery; // For find/count
    doc?: any;            // For create/update
    id?: string | number; // For update/delete/findOne
    
    // === 3. Result (for after* hooks) ===
    result?: any;
    
    // === 4. Shared Meta ===
    meta?: any;           // To pass data between hooks or from main context
}

export type HookHandler = (ctx: HookContext) => Promise<void> | void;
```

## 3. Registering Hooks

Hooks are declared in `*.hook.ts` files adjacent to the object definition.

### 3.1 Data Validation & Auto-fill (`beforeCreate`)

Use `ctx.userId` and `ctx.spaceId` directly.

```typescript
// objects/orders/orders.hook.ts
import { defineHook } from '@objectql/core';

export default defineHook({
  listenTo: 'orders',

  async beforeCreate({ ctx, doc }) {
    // 1. Context Validation
    if (!ctx.userId) {
      throw new Error("User must be logged in");
    }
    
    // 2. Auto-fill (Mutation)
    doc.created_by = ctx.userId;
    doc.owner = ctx.userId;
    
    // 3. Tenant Isolation
    if (ctx.spaceId) {
      doc.space_id = ctx.spaceId;
    }
  }
});

```

### 3.2 Side Effects & Cascading (`afterUpdate`)

Use `ctx.object(...)` to perform operations. This ensures execution within the **same transaction**.

```typescript
export default defineHook({
  async afterUpdate({ ctx, doc, getPreviousDoc }) {
    // 1. Fetch previous state
    const prev = await getPreviousDoc();
    
    // 2. Detect Status Change
    if (prev.status !== 'shipped' && doc.status === 'shipped') {
        
        // 3. Cascade Update (Atomic)
        // Adjust inventory using atomic operators ($inc)
        await ctx.object('inventory').update(doc.product_id, {
            $inc: { stock: -doc.quantity }
        });
        
        // 4. Audit Log
        await ctx.object('audit_logs').create({
            target_entity: 'orders',
            target_id: doc._id,
            action: 'shipped'
        });
    }
  }
});

```

### 3.3 Query Interception (`beforeFind`)

This hook allows modifying the `UnifiedQuery` AST before it reaches the driver.

**Important:** Do not manually `push` to `query.filters` array, as it may break the `['a', 'and', 'b']` structure. Use `utils.restrict`.

```typescript
export default defineHook({
  async beforeFind({ ctx, query, utils }) {
    // Bypass for system operations
    if (ctx.isSystem) return;

    // 1. Force Multi-tenancy (RLS)
    // Injects: ... AND ['space_id', '=', ctx.spaceId]
    if (ctx.spaceId) {
      utils.restrict(['space_id', '=', ctx.spaceId]);
    }

    // 2. Soft Delete Logic (Default View)
    // Check if 'is_deleted' is already present in the AST string
    const filtersStr = JSON.stringify(query.filters || []);
    if (!filtersStr.includes('is_deleted')) {
      // Injects: ... AND ['is_deleted', '=', false]
      utils.restrict(['is_deleted', '=', false]);
    }
    
    // 3. Field Level Security (FLS)
    // Remove sensitive fields from projection
    if (query.fields && !ctx.roles.includes('admin')) {
        query.fields = query.fields.filter(f => f !== 'cost_price');
    }
  }
});
```

### 3.4 Elevating Privileges (Sudo Mode)

If you need to perform actions that the current user does not have permission for (e.g., a user updating a system-only status), use `ctx.sudo()` .

**Key Benefit:** The `sudo()` context shares the **same transaction** as the hook, ensuring that if the hook fails, the sudo operations are also rolled back.

```typescript
export default defineHook({
  async afterCreate({ ctx, doc }) {
    // Current user context (Restricted)
    // await ctx.object('system_counters').update(...) // -> Would fail Permission Check

    // Sudo context (Unrestricted, Shared Transaction)
    const sudoCtx = ctx.sudo();
    
    // This updates 'system_counters' as System, but within the user's transaction.
    await sudoCtx.object('system_counters').update('global_counter_id', {
      $inc: { count: 1 }
    });
  }
});
```


## 4. Execution Pipeline

The execution flow guarantees atomicity.

1. **Context Initialization:** `ctx` created (User/Space info).
2. **Transaction Start:** (If supported).
3. **`before*` Hook:**
* Mutate `doc` -> Affects persistence.
* Mutate `query` -> Affects AST passed to driver.
* Throw Error -> **Rollback**.


4. **Driver Operation:** * Driver compiles AST to SQL/Mongo Query.
* Executes physical Read/Write.


5. **`after*` Hook:**
* Side-effects via `ctx.object()`.
* Throw Error -> **Rollback**.


6. **Transaction Commit.**

## 5. Implementation Detail: `utils.restrict`

The `utils.restrict` helper ensures the AST remains valid by wrapping the existing filters.

```typescript
// Conceptual logic of utils.restrict
function restrict(newCriterion) {
  if (!query.filters || query.filters.length === 0) {
    // Case A: No existing filters
    query.filters = [newCriterion];
  } else {
    // Case B: Wrap existing filters to preserve precedence
    // Transform: [Old] -> [[Old], 'and', [New]]
    query.filters = [
      query.filters, // Previous AST
      'and',
      newCriterion   // New Condition
    ];
  }
}
```

## 6. Directory Convention

Hooks are automatically loaded if they match the object name in the `/hooks` directory or alongside object definitions.

```text
/project-root
├── /objects
│   └── contracts.object.yml
│
├── /hooks
│   └── contracts.hook.js
│