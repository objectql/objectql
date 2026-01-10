# Database Drivers

ObjectQL relies on **Drivers** to communicate with the underlying database. A driver is responsible for translating the ObjectQL specific query format (AST) into the native query language of the database (SQL, MongoDB Query, etc.).

You can configure multiple drivers for different parts of your application, or use a single driver for everything.

## Available Drivers

We currently support the following official drivers:

*   **[SQL Driver (Knex)](./sql)**: Supports PostgreSQL, MySQL, SQLite, MSSQL, etc.
*   **[MongoDB Driver](./mongo)**: Supports MongoDB.

## Configuring a Driver

Drivers are instantiated and passed to the `ObjectQL` constructor under the `driver` property (or `datasources` map for multi-db setup).

```typescript
import { ObjectQL } from '@objectql/core';
import { KnexDriver } from '@objectql/driver-knex';

const myDriver = new KnexDriver({ /* options */ });

const app = new ObjectQL({
  driver: myDriver
});
```

See the specific pages for configuration options for each driver.
