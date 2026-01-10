# Hooks (Triggers)

Hooks allow you to execute server-side logic before or after database operations. They are defined in a separate `*.hook.ts` file or registered dynamically.

## 1. Supported Hooks

| Hook | Description | Context Properties |
| :--- | :--- | :--- |
| `beforeFind` | Before a query is executed. | `query` |
| `afterFind` | After a query is executed (results available). | `query`, `result` |
| `beforeCreate` | Before a record is inserted. | `doc` |
| `afterCreate` | After a record is inserted. | `doc`, `result`, `id` |
| `beforeUpdate` | Before a record is updated. | `id`, `doc`, `query` |
| `afterUpdate` | After a record is updated. | `id`, `doc`, `result` |
| `beforeDelete` | Before a record is deleted. | `id`, `query` |
| `afterDelete` | After a record is deleted. | `id`, `result` |

> **Note on Aggregation:**
> If `query.aggregate` or `query.groupBy` is present (Aggregation Query), the `result` in `afterFind` will be an array of raw aggregation objects (e.g. `[{ total: 100, category: 'A' }]`) instead of standard object instances.

## 2. Hook Implementation

```typescript
import { ObjectQL } from '@objectql/core';

// Inside your server-side loader
const objectql = new ObjectQL();

objectql.registerHook('projects', 'beforeCreate', async (ctx) => {
    if (ctx.doc.budget < 0) {
        throw new Error("Budget cannot be negative");
    }
});
```
